/**
 * Các điểm cuối API, viết độc lập với framework (Express khi chạy máy chủ Node,
 * hàm serverless khi chạy trên Vercel). Chỉ nhận/trả đối tượng thường.
 */
import { z } from 'zod';
import {
  QTYPES,
  QTYPE_SHORT_LABEL,
  aiMatrixOutputSchema,
  aiQuestionsOutputSchema,
  aiReviewOutputSchema,
  examInputSchema,
  matrixSchema,
  questionSchema,
  type ExamInput,
  type Issue,
  type Matrix,
  type Slot,
} from '../shared/schema.js';
import { buildSlots, computeTotals } from '../shared/blueprint.js';
import { matrixFromAi, questionsFromAi } from '../shared/questions.js';
import { hasErrors, validateInput, validateMatrix, validateQuestion } from '../shared/validate.js';
import { AiError, callAiJson, classifyError, type GenerateFn } from './gemini.js';
import { matrixJsonSchema, questionsJsonSchema, reviewJsonSchema } from './jsonSchemas.js';
import { matrixPrompt, questionsPrompt, reviewPrompt, singleQuestionPrompt } from './prompts.js';
import type { RateLimiter } from './rateLimit.js';

export interface ApiRequest {
  method: string;
  path: string;
  body: unknown;
  ip: string;
}

export interface ApiResponse {
  status: number;
  body: unknown;
}

export interface HandlerDeps {
  /** Hàm gọi AI (thật hoặc giả khi kiểm thử). */
  generate: GenerateFn;
  /** Có cấu hình khóa AI hay không (không lộ giá trị khóa). */
  aiConfigured: () => boolean;
  rateLimiter?: RateLimiter;
  log?: (msg: string) => void;
  retryDelayMs?: number;
  /** Tổng thời gian tối đa cho một yêu cầu AI (ms). Mặc định 270 giây (hàm serverless bị ngắt ở 300 giây). */
  requestBudgetMs?: number;
}

const fail = (status: number, code: string, message: string, extra: object = {}): ApiResponse => ({
  status,
  body: { error: { code, message, ...extra } },
});

const issueSummary = (issues: Issue[]) =>
  issues.filter((i) => i.severity === 'error').map((i) => i.message);

function parseBody<T>(schema: z.ZodType<T>, body: unknown): { ok: true; value: T } | { ok: false; res: ApiResponse } {
  const parsed = schema.safeParse(body);
  if (parsed.success) return { ok: true, value: parsed.data };
  return {
    ok: false,
    res: fail(400, 'bad_request', 'Dữ liệu gửi lên không đúng định dạng. Hãy tải lại trang rồi thử lại.', {
      detail: parsed.error.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`),
    }),
  };
}

function checkInput(input: ExamInput): ApiResponse | null {
  const issues = validateInput(input);
  if (hasErrors(issues)) {
    return fail(400, 'invalid_input', 'Dữ liệu đầu vào chưa đủ để tạo đề.', { issues: issueSummary(issues) });
  }
  return null;
}

function checkMatrix(input: ExamInput, matrix: Matrix): ApiResponse | null {
  const issues = validateMatrix(input.structure, matrix);
  if (hasErrors(issues)) {
    return fail(400, 'invalid_matrix', 'Ma trận chưa hợp lệ để tạo câu hỏi.', { issues: issueSummary(issues) });
  }
  return null;
}

/** Mô tả lỗi cấu trúc câu hỏi để yêu cầu AI sửa một lần (lỗi chi tiết vẫn do lớp kiểm tra bằng mã báo cho giáo viên). */
function structuralFeedback(slots: Slot[], aiQuestions: z.infer<typeof aiQuestionsOutputSchema>['questions']): string | null {
  const { questions, notes } = questionsFromAi(slots, aiQuestions);
  const slotById = new Map(slots.map((s) => [s.id, s]));
  const problems: string[] = [...notes];
  for (const q of questions) {
    for (const i of validateQuestion(q, slotById.get(q.id))) {
      if (i.severity === 'error' && !/chưa có nội dung câu hỏi/.test(i.message)) problems.push(`[${q.id}] ${i.message}`);
    }
  }
  return problems.length ? problems.slice(0, 12).join('\n') : null;
}

export async function handleApi(req: ApiRequest, deps: HandlerDeps): Promise<ApiResponse> {
  const path = req.path.replace(/\/+$/, '') || '/';
  const log = deps.log ?? (() => {});

  if (path === '/api/health') {
    if (req.method !== 'GET') return fail(405, 'method_not_allowed', 'Phương thức không được hỗ trợ.');
    return { status: 200, body: { ok: true, aiConfigured: deps.aiConfigured() } };
  }

  const aiRoutes = ['/api/ai/matrix', '/api/ai/questions', '/api/ai/question', '/api/ai/review'];
  if (!aiRoutes.includes(path)) return fail(404, 'not_found', 'Không tìm thấy điểm cuối API.');
  if (req.method !== 'POST') return fail(405, 'method_not_allowed', 'Phương thức không được hỗ trợ.');

  if (deps.rateLimiter && !deps.rateLimiter.allow(req.ip)) {
    return fail(429, 'rate_limited', 'Bạn gọi AI quá nhiều lần trong thời gian ngắn. Hãy đợi vài phút rồi thử lại.');
  }
  if (!deps.aiConfigured()) {
    const e = new AiError('not_configured');
    return fail(e.status, e.code, e.message);
  }

  const retryDelayMs = deps.retryDelayMs;
  const deadlineAt = Date.now() + (deps.requestBudgetMs ?? 270_000);
  try {
    switch (path) {
      // ---------------------------------------------------------------
      case '/api/ai/matrix': {
        const p = parseBody(z.object({ input: examInputSchema }), req.body);
        if (!p.ok) return p.res;
        const { input } = p.value;
        const bad = checkInput(input);
        if (bad) return bad;

        const { system, prompt } = matrixPrompt(input);
        const out = await callAiJson({
          generate: deps.generate,
          system,
          prompt,
          jsonSchema: matrixJsonSchema,
          schema: aiMatrixOutputSchema,
          temperature: 0.4,
          thinking: 'medium',
          deadlineAt,
          retryDelayMs,
          extraCheck: (value) => {
            const m = matrixFromAi(value);
            const totals = computeTotals(buildSlots(input.structure, m), m.rows, input.structure.totalScore);
            const wrong = QTYPES.filter((t) => totals.typeCount[t] !== input.structure.counts[t]).map(
              (t) => `dạng ${t} (${QTYPE_SHORT_LABEL[t]}) có ${totals.typeCount[t]} câu, cần đúng ${input.structure.counts[t]} câu`,
            );
            const noOutcome = m.rows.filter((r) =>
              (['biet', 'hieu', 'van_dung'] as const).some(
                (l) => QTYPES.some((t) => r.counts[t][l] > 0) && !r.outcomes[l],
              ),
            );
            const parts: string[] = [];
            if (wrong.length) parts.push(`Tổng số câu sai ràng buộc: ${wrong.join('; ')}.`);
            if (noOutcome.length) parts.push(`Hàng "${noOutcome[0]!.topic}" có câu ở mức chưa có yêu cầu cần đạt.`);
            return parts.length ? parts.join(' ') : null;
          },
        });
        const matrix = matrixFromAi(out);
        log(`matrix ok rows=${matrix.rows.length}`);
        return {
          status: 200,
          body: { matrix, notes: out.notes, missingContent: out.missingContent },
        };
      }

      // ---------------------------------------------------------------
      case '/api/ai/questions': {
        const p = parseBody(z.object({ input: examInputSchema, matrix: matrixSchema }), req.body);
        if (!p.ok) return p.res;
        const { input, matrix } = p.value;
        const bad = checkInput(input) ?? checkMatrix(input, matrix);
        if (bad) return bad;

        const slots = buildSlots(input.structure, matrix);
        const { system, prompt } = questionsPrompt(input, slots);
        const out = await callAiJson({
          generate: deps.generate,
          system,
          prompt,
          jsonSchema: questionsJsonSchema,
          schema: aiQuestionsOutputSchema,
          temperature: 0.6,
          deadlineAt,
          retryDelayMs,
          extraCheck: (value) => structuralFeedback(slots, value.questions),
        });
        const result = questionsFromAi(slots, out.questions);
        log(`questions ok n=${result.questions.length}`);
        return { status: 200, body: { questions: result.questions, notes: result.notes } };
      }

      // ---------------------------------------------------------------
      case '/api/ai/question': {
        const p = parseBody(
          z.object({
            input: examInputSchema,
            matrix: matrixSchema,
            slotId: z.string(),
            otherStems: z.array(z.string()).max(80),
            hint: z.string().max(4000),
            currentStem: z.string().max(8000),
          }),
          req.body,
        );
        if (!p.ok) return p.res;
        const { input, matrix, slotId, otherStems, hint, currentStem } = p.value;
        const bad = checkInput(input) ?? checkMatrix(input, matrix);
        if (bad) return bad;
        const slots = buildSlots(input.structure, matrix);
        const slot = slots.find((s) => s.id === slotId);
        if (!slot) return fail(400, 'bad_slot', 'Không tìm thấy ô câu hỏi trong ma trận đã xác nhận.');

        const { system, prompt } = singleQuestionPrompt(input, slot, otherStems, hint, currentStem);
        const out = await callAiJson({
          generate: deps.generate,
          system,
          prompt,
          jsonSchema: questionsJsonSchema,
          schema: aiQuestionsOutputSchema,
          temperature: 0.8,
          deadlineAt,
          retryDelayMs,
          extraCheck: (value) => structuralFeedback([slot], value.questions.filter((q) => q.slotId === slot.id)),
        });
        const result = questionsFromAi([slot], out.questions);
        return { status: 200, body: { question: result.questions[0], notes: result.notes } };
      }

      // ---------------------------------------------------------------
      case '/api/ai/review': {
        const p = parseBody(
          z.object({ input: examInputSchema, matrix: matrixSchema, questions: z.array(questionSchema).max(80) }),
          req.body,
        );
        if (!p.ok) return p.res;
        const { input, questions } = p.value;
        const bad = checkInput(input);
        if (bad) return bad;
        const { system, prompt } = reviewPrompt(input, questions);
        const out = await callAiJson({
          generate: deps.generate,
          system,
          prompt,
          jsonSchema: reviewJsonSchema,
          schema: aiReviewOutputSchema,
          temperature: 0.2,
          thinking: 'medium',
          deadlineAt,
          retryDelayMs,
        });
        const known = new Set(questions.map((q) => q.id));
        const warnings = out.warnings.filter((w) => known.has(w.questionId)).slice(0, 30);
        return { status: 200, body: { warnings } };
      }
    }
  } catch (e) {
    const { code, detail } = classifyError(e);
    const ai = e instanceof AiError ? e : new AiError(code, detail);
    log(`ai error code=${ai.code} status=${ai.status} detail=${(ai.detail ?? '').slice(0, 200)}`);
    return fail(ai.status, ai.code, ai.message, { retryable: ['quota', 'overloaded', 'network', 'timeout', 'invalid_output', 'unknown'].includes(ai.code) });
  }
  return fail(404, 'not_found', 'Không tìm thấy điểm cuối API.');
}
