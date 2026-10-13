/**
 * Gọi API của máy chủ (máy chủ mới là nơi giữ khóa Gemini). Mọi phản hồi đều được kiểm tra lại bằng schema.
 */
import { z } from 'zod';
import {
  aiWarningSchema,
  matrixSchema,
  questionSchema,
  type AiWarning,
  type ExamInput,
  type Matrix,
  type Question,
} from '../../shared/schema.js';

export class ApiFail extends Error {
  code: string;
  issues?: string[];
  retryable: boolean;
  constructor(code: string, message: string, issues?: string[], retryable = false) {
    super(message);
    this.code = code;
    this.issues = issues;
    this.retryable = retryable;
  }
}

const CLIENT_TIMEOUT_MS = 280_000;

async function post<T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') {
      throw new ApiFail('timeout', 'Chờ quá lâu mà chưa có phản hồi từ máy chủ. Hãy thử lại.', undefined, true);
    }
    throw new ApiFail('network', 'Không kết nối được tới máy chủ. Hãy kiểm tra mạng rồi thử lại — dữ liệu của bạn vẫn được giữ nguyên.', undefined, true);
  } finally {
    clearTimeout(timer);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiFail(
      'server',
      `Máy chủ trả về phản hồi không đọc được (mã ${res.status}). Hãy thử lại sau ít phút.`,
      undefined,
      true,
    );
  }
  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string; issues?: string[]; retryable?: boolean } })?.error;
    throw new ApiFail(
      err?.code ?? 'server',
      err?.message ?? `Máy chủ báo lỗi (mã ${res.status}).`,
      err?.issues,
      Boolean(err?.retryable),
    );
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiFail('invalid_output', 'Phản hồi từ máy chủ không đúng định dạng mong đợi. Hãy thử lại.', undefined, true);
  }
  return parsed.data;
}

const matrixResponse = z.object({
  matrix: matrixSchema,
  notes: z.array(z.string()),
  missingContent: z.array(z.object({ topic: z.string(), reason: z.string() })),
});

export const generateMatrix = (input: ExamInput) => post('/api/ai/matrix', { input }, matrixResponse);

export const generateQuestions = (input: ExamInput, matrix: Matrix) =>
  post('/api/ai/questions', { input, matrix }, z.object({ questions: z.array(questionSchema), notes: z.array(z.string()) }));

export const regenerateQuestion = (
  input: ExamInput,
  matrix: Matrix,
  slotId: string,
  otherStems: string[],
  hint: string,
  currentStem: string,
) =>
  post(
    '/api/ai/question',
    { input, matrix, slotId, otherStems, hint, currentStem },
    z.object({ question: questionSchema, notes: z.array(z.string()) }),
  );

export const reviewWithAi = (input: ExamInput, matrix: Matrix, questions: Question[]): Promise<{ warnings: AiWarning[] }> =>
  post('/api/ai/review', { input, matrix, questions }, z.object({ warnings: z.array(aiWarningSchema) }));

export async function fetchHealth(): Promise<{ ok: boolean; aiConfigured: boolean } | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return (await res.json()) as { ok: boolean; aiConfigured: boolean };
  } catch {
    return null;
  }
}
