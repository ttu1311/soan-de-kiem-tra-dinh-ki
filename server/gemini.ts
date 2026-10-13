/**
 * Gọi Gemini từ máy chủ. Khóa GEMINI_API_KEY chỉ được đọc từ biến môi trường ở đây;
 * không bao giờ trả về trình duyệt, không ghi vào log hay tệp xuất.
 */
import { ApiError, GoogleGenAI } from '@google/genai';
import type { z } from 'zod';

export type AiErrorCode =
  | 'not_configured'
  | 'bad_key'
  | 'quota'
  | 'overloaded'
  | 'network'
  | 'timeout'
  | 'blocked'
  | 'invalid_output'
  | 'model_unavailable'
  | 'unknown';

const MESSAGES: Record<AiErrorCode, { status: number; text: string }> = {
  not_configured: {
    status: 503,
    text: 'Máy chủ chưa được cấu hình khóa Gemini (GEMINI_API_KEY). Vui lòng báo người quản trị ứng dụng.',
  },
  bad_key: {
    status: 502,
    text: 'Khóa Gemini của máy chủ không hợp lệ hoặc không có quyền. Vui lòng báo người quản trị ứng dụng.',
  },
  quota: {
    status: 429,
    text: 'Đã hết hạn mức gọi AI (Gemini) tạm thời. Hãy đợi vài phút rồi thử lại; dữ liệu của bạn vẫn được giữ nguyên.',
  },
  overloaded: {
    status: 503,
    text: 'Dịch vụ AI (Gemini) đang quá tải. Hãy thử lại sau ít phút; dữ liệu của bạn vẫn được giữ nguyên.',
  },
  network: {
    status: 502,
    text: 'Không kết nối được tới dịch vụ AI (Gemini). Kiểm tra mạng rồi thử lại; dữ liệu của bạn vẫn được giữ nguyên.',
  },
  timeout: {
    status: 504,
    text: 'AI trả lời quá lâu nên đã bị ngắt. Hãy thử lại (có thể rút gọn nội dung nguồn hoặc giảm số câu).',
  },
  blocked: {
    status: 422,
    text: 'AI từ chối hoặc không trả về nội dung (có thể do bộ lọc an toàn). Hãy chỉnh lại nội dung nguồn rồi thử lại.',
  },
  invalid_output: {
    status: 502,
    text: 'AI trả về dữ liệu không đúng định dạng yêu cầu, dù đã thử lại. Hãy bấm tạo lại; nếu lặp lại, hãy rút gọn nội dung nguồn.',
  },
  model_unavailable: {
    status: 502,
    text: 'Model AI được cấu hình không khả dụng với khóa hiện tại. Vui lòng báo người quản trị ứng dụng (biến GEMINI_MODEL).',
  },
  unknown: {
    status: 502,
    text: 'Có lỗi không xác định khi gọi AI. Hãy thử lại sau ít phút.',
  },
};

export class AiError extends Error {
  readonly code: AiErrorCode;
  readonly status: number;
  /** Chi tiết kỹ thuật cho log máy chủ — KHÔNG gửi cho trình duyệt. */
  readonly detail?: string;
  constructor(code: AiErrorCode, detail?: string) {
    super(MESSAGES[code].text);
    this.code = code;
    this.status = MESSAGES[code].status;
    this.detail = detail;
  }
}

export interface GeminiRequest {
  system: string;
  prompt: string;
  jsonSchema: object;
  temperature?: number;
  timeoutMs?: number;
  /** Mức "suy nghĩ" mong muốn cho model Gemini 3 (bỏ trống = mặc định của model). */
  thinking?: 'low' | 'medium';
  /** Thời điểm (ms epoch) mà cả yêu cầu phải xong — để báo lỗi gọn trước khi nền tảng ngắt hàm. */
  deadlineAt?: number;
}

/** Cho phép thay thế bằng bản giả khi kiểm thử. */
export type GenerateFn = (req: GeminiRequest) => Promise<string>;

// Thứ tự thử: model ổn định theo tài liệu → alias "latest" → model cũ. Model không tồn tại/quá tải/hết hạn mức
// sẽ tự chuyển sang model kế tiếp (xem createGeminiGenerate).
export const DEFAULT_MODELS = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];

export function modelCandidates(env: NodeJS.ProcessEnv = process.env): string[] {
  const custom = (env.GEMINI_MODEL ?? '').trim();
  return [...new Set([custom, ...DEFAULT_MODELS].filter(Boolean))];
}

export function classifyError(e: unknown): { code: AiErrorCode; detail: string } {
  if (e instanceof AiError) return { code: e.code, detail: e.detail ?? e.message };
  const err = e as { name?: string; message?: string; status?: number; code?: string; cause?: { code?: string } };
  const message = String(err?.message ?? e);
  const lower = message.toLowerCase();
  const status = typeof err?.status === 'number' ? err.status : undefined;

  if (err?.name === 'AbortError' || lower.includes('aborted') || lower.includes('timed out') || lower.includes('timeout')) {
    return { code: 'timeout', detail: message };
  }
  if (e instanceof ApiError || status !== undefined) {
    if (status === 429 || lower.includes('resource_exhausted') || lower.includes('quota')) return { code: 'quota', detail: message };
    if (status === 401 || status === 403 || lower.includes('api key not valid') || lower.includes('api_key_invalid') || lower.includes('api key expired')) {
      return { code: 'bad_key', detail: message };
    }
    if (status === 404 || (lower.includes('model') && lower.includes('not found'))) return { code: 'model_unavailable', detail: message };
    if (status === 500 || status === 502 || status === 503 || status === 504 || lower.includes('unavailable') || lower.includes('overloaded')) {
      return { code: 'overloaded', detail: message };
    }
    if (status === 400 && (lower.includes('api key') || lower.includes('api_key'))) return { code: 'bad_key', detail: message };
    return { code: 'unknown', detail: message };
  }
  const netCode = err?.cause?.code ?? err?.code ?? '';
  if (
    lower.includes('fetch failed') ||
    lower.includes('network') ||
    ['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'UND_ERR_SOCKET'].includes(netCode)
  ) {
    return { code: 'network', detail: message };
  }
  return { code: 'unknown', detail: message };
}

/** Bản gọi thật bằng SDK @google/genai. */
export function createGeminiGenerate(env: NodeJS.ProcessEnv = process.env): GenerateFn {
  return async (req) => {
    const apiKey = (env.GEMINI_API_KEY ?? '').trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') throw new AiError('not_configured');

    const baseUrl = (env.GEMINI_BASE_URL ?? '').trim() || undefined; // chỉ dùng khi kiểm thử
    const models = modelCandidates(env);
    let lastError: unknown;

    const FALLBACK: AiErrorCode[] = ['model_unavailable', 'overloaded', 'quota'];
    const failures: { code: AiErrorCode; error: unknown }[] = [];

    for (const model of models) {
      const left = req.deadlineAt ? req.deadlineAt - Date.now() : Number.POSITIVE_INFINITY;
      if (left < 8_000) throw new AiError('timeout', 'hết thời gian cho phép của yêu cầu');
      const timeoutMs = Math.min(req.timeoutMs ?? 170_000, left - 3_000);
      const started = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { baseUrl, timeout: timeoutMs, retryOptions: { attempts: 1 } },
        });
        const baseConfig = {
          systemInstruction: req.system,
          responseMimeType: 'application/json',
          responseJsonSchema: req.jsonSchema,
          temperature: req.temperature ?? 0.5,
          maxOutputTokens: 32768,
          abortSignal: controller.signal,
        };
        const useThinking = Boolean(req.thinking) && /^gemini-3/.test(model);
        const call = (withThinking: boolean) =>
          ai.models.generateContent({
            model,
            contents: req.prompt,
            config: withThinking
              ? { ...baseConfig, thinkingConfig: { thinkingLevel: (req.thinking === 'low' ? 'LOW' : 'MEDIUM') as never } }
              : baseConfig,
          });
        let res;
        try {
          res = await call(useThinking);
        } catch (e) {
          // Model không chấp nhận tham số thinking → thử lại đúng model đó nhưng không đặt thinking.
          const c = classifyError(e);
          if (useThinking && c.code === 'unknown' && /thinking/i.test(c.detail)) res = await call(false);
          else throw e;
        }
        const text = res.text;
        if (!text || !text.trim()) {
          const reason = res.candidates?.[0]?.finishReason ?? res.promptFeedback?.blockReason ?? 'EMPTY';
          throw new AiError('blocked', String(reason));
        }
        console.log(`[api] gemini ok model=${model} ms=${Date.now() - started}`);
        return text;
      } catch (e) {
        const { code, detail } = classifyError(e);
        // Model không tồn tại / đang quá tải / hết hạn mức riêng của model → thử model dự phòng kế tiếp.
        if (FALLBACK.includes(code)) {
          console.log(`[api] gemini model=${model} code=${code} ms=${Date.now() - started} detail=${detail.slice(0, 160)}`);
          failures.push({ code, error: e });
          continue;
        }
        throw e;
      } finally {
        clearTimeout(timer);
      }
    }
    // Tất cả model đều lỗi: ưu tiên báo lỗi tạm thời (quá tải) để lớp ngoài còn thử lại, rồi đến hết hạn mức.
    const pick = failures.find((f) => f.code === 'overloaded') ?? failures.find((f) => f.code === 'quota') ?? failures[0];
    throw pick?.error ?? new AiError('model_unavailable');
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface CallOptions<T> {
  generate: GenerateFn;
  system: string;
  prompt: string;
  jsonSchema: object;
  schema: z.ZodType<T>;
  temperature?: number;
  thinking?: 'low' | 'medium';
  deadlineAt?: number;
  /** Số lần thử lại khi dịch vụ quá tải / lỗi mạng (không thử lại khi hết hạn mức). */
  retries?: number;
  retryDelayMs?: number;
  /** Kiểm tra thêm sau khi qua schema; trả về mô tả lỗi để yêu cầu AI sửa, hoặc null nếu ổn. */
  extraCheck?: (value: T) => string | null;
}

function tryParse<T>(text: string, schema: z.ZodType<T>): { ok: true; value: T } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ''));
  } catch {
    return { ok: false, error: 'Kết quả không phải JSON hợp lệ.' };
  }
  const parsed = schema.safeParse(json);
  if (parsed.success) return { ok: true, value: parsed.data };
  const first = parsed.error.issues
    .slice(0, 5)
    .map((i) => `${i.path.join('.') || '(gốc)'}: ${i.message}`)
    .join('; ');
  return { ok: false, error: `Sai schema — ${first}` };
}

/**
 * Gọi AI, kiểm tra kết quả bằng schema. Lỗi mạng/quá tải: thử lại có giới hạn.
 * Kết quả sai định dạng: yêu cầu AI sửa đúng MỘT lần, nếu vẫn sai thì báo `invalid_output`.
 */
export async function callAiJson<T>(opts: CallOptions<T>): Promise<T> {
  const retries = opts.retries ?? 3;
  const delay = opts.retryDelayMs ?? 2000;

  const attempt = async (prompt: string): Promise<string> => {
    let lastErr: unknown;
    for (let i = 0; i <= retries; i++) {
      try {
        return await opts.generate({
          system: opts.system,
          prompt,
          jsonSchema: opts.jsonSchema,
          temperature: opts.temperature,
          thinking: opts.thinking,
          deadlineAt: opts.deadlineAt,
        });
      } catch (e) {
        lastErr = e;
        const { code, detail } = classifyError(e);
        const outOfTime = opts.deadlineAt !== undefined && Date.now() + delay * (i + 1) > opts.deadlineAt - 15_000;
        if ((code === 'overloaded' || code === 'network') && i < retries && !outOfTime) {
          await sleep(delay * (i + 1));
          continue;
        }
        throw e instanceof AiError ? e : new AiError(code, detail);
      }
    }
    throw lastErr;
  };

  const first = tryParse(await attempt(opts.prompt), opts.schema);
  if (first.ok) {
    const extra = opts.extraCheck?.(first.value);
    if (!extra) return first.value;
    const repair = `${opts.prompt}\n\nLẦN TRƯỚC KẾT QUẢ CHƯA ĐẠT: ${extra}\nHãy trả lại JSON đầy đủ, đã sửa đúng lỗi trên.`;
    const second = tryParse(await attempt(repair), opts.schema);
    if (second.ok && !opts.extraCheck?.(second.value)) return second.value;
    // Kết quả hợp lệ về schema nhưng vẫn chưa đạt kiểm tra thêm: trả về để lớp kiểm tra bằng mã báo lỗi cho giáo viên.
    if (second.ok) return second.value;
    return first.value;
  }

  const repair = `${opts.prompt}\n\nLẦN TRƯỚC KẾT QUẢ KHÔNG HỢP LỆ: ${first.error}\nHãy trả lại DUY NHẤT một JSON đúng schema.`;
  const second = tryParse(await attempt(repair), opts.schema);
  if (second.ok) return second.value;
  throw new AiError('invalid_output', second.error);
}
