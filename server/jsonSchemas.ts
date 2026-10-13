/**
 * JSON Schema (tập con mà Gemini hỗ trợ) gửi kèm mỗi lời gọi AI qua `responseJsonSchema`.
 * Sau khi nhận kết quả, máy chủ vẫn kiểm tra lại bằng zod (shared/schema.ts).
 */
const str = { type: 'string' } as const;
const num = { type: 'number' } as const;
const int = { type: 'integer' } as const;

const byLevel = (item: object) => ({
  type: 'object',
  properties: { biet: item, hieu: item, van_dung: item },
  required: ['biet', 'hieu', 'van_dung'],
});

const byType = (item: object) => ({
  type: 'object',
  properties: { mcq: item, tf: item, short: item, essay: item },
  required: ['mcq', 'tf', 'short', 'essay'],
});

export const matrixJsonSchema = {
  type: 'object',
  properties: {
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topic: { ...str, description: 'Chủ đề/Chương — giữ nguyên tên chủ đề giáo viên đã nhập' },
          unit: { ...str, description: 'Nội dung/đơn vị kiến thức' },
          outcomes: byLevel({ ...str, description: 'Yêu cầu cần đạt ở mức này; chuỗi rỗng nếu không có câu ở mức này' }),
          counts: byType(byLevel(int)),
        },
        required: ['topic', 'unit', 'outcomes', 'counts'],
      },
    },
    notes: { type: 'array', items: str },
    missingContent: {
      type: 'array',
      items: {
        type: 'object',
        properties: { topic: str, reason: str },
        required: ['topic', 'reason'],
      },
    },
  },
  required: ['rows', 'notes', 'missingContent'],
};

const questionItem = {
  type: 'object',
  properties: {
    slotId: { ...str, description: 'Mã ô câu hỏi, ví dụ mcq-1' },
    stem: { ...str, description: 'Nội dung câu hỏi (với câu Đúng–Sai: đề dẫn/dữ kiện chung)' },
    options: {
      type: 'object',
      description: 'Chỉ cho dạng mcq',
      properties: { A: str, B: str, C: str, D: str },
      required: ['A', 'B', 'C', 'D'],
    },
    correct: { type: 'string', enum: ['A', 'B', 'C', 'D'], description: 'Chỉ cho dạng mcq' },
    statements: {
      type: 'array',
      description: 'Chỉ cho dạng tf: đúng 4 ý a, b, c, d',
      items: {
        type: 'object',
        properties: { label: { type: 'string', enum: ['a', 'b', 'c', 'd'] }, text: str, isTrue: { type: 'boolean' } },
        required: ['label', 'text', 'isTrue'],
      },
    },
    answer: { ...str, description: 'Chỉ cho dạng short: đáp số/cụm từ ngắn' },
    rubric: {
      type: 'array',
      description: 'Chỉ cho dạng essay: các ý chấm, tổng điểm bằng điểm của câu',
      items: {
        type: 'object',
        properties: { content: str, points: num },
        required: ['content', 'points'],
      },
    },
    solution: { ...str, description: 'Lời giải / hướng dẫn giải chi tiết' },
    sourceRef: { ...str, description: 'Trích ngắn từ nội dung nguồn mà câu hỏi dựa vào' },
  },
  required: ['slotId', 'stem', 'solution'],
};

export const questionsJsonSchema = {
  type: 'object',
  properties: { questions: { type: 'array', items: questionItem } },
  required: ['questions'],
};

export const reviewJsonSchema = {
  type: 'object',
  properties: {
    warnings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          questionId: { ...str, description: 'Mã ô câu hỏi, ví dụ tf-1' },
          kind: { type: 'string', enum: ['ambiguous', 'duplicate', 'off_source', 'answer_doubt', 'other'] },
          message: str,
        },
        required: ['questionId', 'kind', 'message'],
      },
    },
  },
  required: ['warnings'],
};
