/**
 * Kiểu dữ liệu và schema dùng chung cho trình duyệt (src/) và máy chủ (server/, api/).
 * Mọi dữ liệu do AI trả về đều phải đi qua các schema ở đây trước khi được dùng.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Hằng số
// ---------------------------------------------------------------------------
export const LEVELS = ['biet', 'hieu', 'van_dung'] as const;
export type Level = (typeof LEVELS)[number];

export const QTYPES = ['mcq', 'tf', 'short', 'essay'] as const;
export type QType = (typeof QTYPES)[number];

export const GRADES = ['10', '11', '12'] as const;
export type Grade = (typeof GRADES)[number];

export const LEVEL_LABEL: Record<Level, string> = {
  biet: 'Biết',
  hieu: 'Hiểu',
  van_dung: 'Vận dụng',
};

export const QTYPE_LABEL: Record<QType, string> = {
  mcq: 'Trắc nghiệm nhiều lựa chọn',
  tf: 'Trắc nghiệm Đúng – Sai',
  short: 'Trắc nghiệm trả lời ngắn',
  essay: 'Tự luận',
};

export const QTYPE_SHORT_LABEL: Record<QType, string> = {
  mcq: 'Nhiều lựa chọn',
  tf: 'Đúng – Sai',
  short: 'Trả lời ngắn',
  essay: 'Tự luận',
};

export const QTYPE_CODE_PREFIX: Record<QType, string> = {
  mcq: 'TN',
  tf: 'DS',
  short: 'TLN',
  essay: 'TL',
};

export const TF_LABELS = ['a', 'b', 'c', 'd'] as const;
export type TfLabel = (typeof TF_LABELS)[number];

export const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;
export type OptionKey = (typeof OPTION_KEYS)[number];

/** Giới hạn đầu vào (cũng được máy chủ áp dụng lại). */
export const LIMITS = {
  minSourceChars: 300,
  softSourceChars: 1200,
  maxSourceChars: 60000,
  maxTopics: 12,
  maxTopicChars: 200,
  maxRequirementChars: 2000,
  maxRows: 24,
  minDuration: 15,
  maxDuration: 240,
  minRequirementChars: 10,
} as const;

// ---------------------------------------------------------------------------
// Bản ghi theo dạng/ mức độ
// ---------------------------------------------------------------------------
export type ByLevel<T> = Record<Level, T>;
export type ByType<T> = Record<QType, T>;

const byLevel = <T extends z.ZodType>(item: T) =>
  z.object({ biet: item, hieu: item, van_dung: item });
const byType = <T extends z.ZodType>(item: T) =>
  z.object({ mcq: item, tf: item, short: item, essay: item });

// ---------------------------------------------------------------------------
// Đầu vào của giáo viên
// ---------------------------------------------------------------------------
export const examInfoSchema = z.object({
  subject: z.string(),
  grade: z.enum(GRADES),
  title: z.string(),
  school: z.string(),
  academicYear: z.string(),
  semester: z.string(),
  durationMinutes: z.number(),
});
export type ExamInfo = z.infer<typeof examInfoSchema>;

export const tfScoringSchema = z.enum(['progressive', 'linear']);
export type TfScoring = z.infer<typeof tfScoringSchema>;

export const structureSchema = z.object({
  totalScore: z.number(),
  /** Tổng điểm của mỗi dạng câu. */
  points: byType(z.number()),
  /** Số câu mong muốn của mỗi dạng (ma trận có thể khác — sẽ có cảnh báo). */
  counts: byType(z.number()),
  /** Tỉ lệ % điểm mong muốn theo mức độ (Biết/Hiểu/Vận dụng). */
  levelTarget: byLevel(z.number()),
  tfScoring: tfScoringSchema,
});
export type Structure = z.infer<typeof structureSchema>;

export const topicInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  requirements: z.string(),
});
export type TopicInput = z.infer<typeof topicInputSchema>;

export const examInputSchema = z.object({
  info: examInfoSchema,
  structure: structureSchema,
  topics: z.array(topicInputSchema),
  sourceText: z.string(),
  notes: z.string(),
});
export type ExamInput = z.infer<typeof examInputSchema>;

// ---------------------------------------------------------------------------
// Ma trận & đặc tả
// ---------------------------------------------------------------------------
const count = z.number().int().min(0).max(60);
export const levelCountsSchema = byLevel(count);
export type LevelCounts = z.infer<typeof levelCountsSchema>;

export const matrixRowSchema = z.object({
  id: z.string(),
  /** Chủ đề / Chương */
  topic: z.string(),
  /** Nội dung / đơn vị kiến thức */
  unit: z.string(),
  /** Yêu cầu cần đạt theo mức độ (bản đặc tả) */
  outcomes: byLevel(z.string()),
  /** Số câu hỏi theo dạng và mức độ */
  counts: byType(levelCountsSchema),
});
export type MatrixRow = z.infer<typeof matrixRowSchema>;

export const matrixSchema = z.object({
  rows: z.array(matrixRowSchema),
  /** Điểm từng câu tự luận do giáo viên đặt (khoá = id ô câu hỏi). Chỉ có hiệu lực khi đủ cho mọi câu tự luận. */
  pointOverrides: z.record(z.string(), z.number()),
});
export type Matrix = z.infer<typeof matrixSchema>;

// ---------------------------------------------------------------------------
// Ô câu hỏi (blueprint) và câu hỏi
// ---------------------------------------------------------------------------
export interface Slot {
  /** Ví dụ: mcq-1 */
  id: string;
  /** Mã câu hiển thị, ví dụ TN01 */
  code: string;
  type: QType;
  /** Số thứ tự trong phần (Câu 1, Câu 2…) */
  number: number;
  rowId: string;
  topic: string;
  unit: string;
  level: Level;
  /** Yêu cầu cần đạt tương ứng trong bản đặc tả */
  outcome: string;
  points: number;
}

export const questionSchema = z.object({
  id: z.string(),
  code: z.string(),
  type: z.enum(QTYPES),
  number: z.number(),
  rowId: z.string(),
  topic: z.string(),
  unit: z.string(),
  level: z.enum(LEVELS),
  outcome: z.string(),
  points: z.number(),
  stem: z.string(),
  options: z.object({ A: z.string(), B: z.string(), C: z.string(), D: z.string() }).optional(),
  correct: z.enum(OPTION_KEYS).optional(),
  statements: z
    .array(z.object({ label: z.string(), text: z.string(), isTrue: z.boolean().optional() }))
    .optional(),
  answer: z.string().optional(),
  rubric: z.array(z.object({ content: z.string(), points: z.number() })).optional(),
  solution: z.string(),
  sourceRef: z.string().optional(),
  /** 'ai' = nguyên bản AI; 'edited' = giáo viên đã sửa tay */
  origin: z.enum(['ai', 'edited']),
});
export type Question = z.infer<typeof questionSchema>;

export const aiWarningSchema = z.object({
  questionId: z.string(),
  kind: z.enum(['ambiguous', 'duplicate', 'off_source', 'answer_doubt', 'other']),
  message: z.string(),
});
export type AiWarning = z.infer<typeof aiWarningSchema>;

// ---------------------------------------------------------------------------
// Kết quả AI (được dùng làm responseJsonSchema cho Gemini và để kiểm tra lại)
// ---------------------------------------------------------------------------
const aiLevelCounts = byLevel(z.number());
export const aiMatrixOutputSchema = z.object({
  rows: z.array(
    z.object({
      topic: z.string(),
      unit: z.string(),
      outcomes: byLevel(z.string()),
      counts: byType(aiLevelCounts),
    }),
  ),
  /** Ghi chú của AI cho giáo viên (ví dụ giả định đã dùng). */
  notes: z.array(z.string()),
  /** Chủ đề mà nội dung nguồn chưa đủ để ra đề. */
  missingContent: z.array(z.object({ topic: z.string(), reason: z.string() })),
});
export type AiMatrixOutput = z.infer<typeof aiMatrixOutputSchema>;

const nullishString = z.string().nullish();
export const aiQuestionSchema = z.object({
  slotId: z.string(),
  stem: z.string(),
  options: z
    .object({ A: z.string(), B: z.string(), C: z.string(), D: z.string() })
    .nullish(),
  correct: z.enum(OPTION_KEYS).nullish(),
  statements: z
    .array(z.object({ label: z.string(), text: z.string(), isTrue: z.boolean() }))
    .nullish(),
  answer: nullishString,
  rubric: z.array(z.object({ content: z.string(), points: z.number() })).nullish(),
  solution: z.string(),
  sourceRef: nullishString,
});
export type AiQuestion = z.infer<typeof aiQuestionSchema>;

export const aiQuestionsOutputSchema = z.object({ questions: z.array(aiQuestionSchema) });
export type AiQuestionsOutput = z.infer<typeof aiQuestionsOutputSchema>;

export const aiReviewOutputSchema = z.object({
  warnings: z.array(aiWarningSchema),
});
export type AiReviewOutput = z.infer<typeof aiReviewOutputSchema>;

// ---------------------------------------------------------------------------
// Vấn đề phát hiện bằng mã
// ---------------------------------------------------------------------------
export type Severity = 'error' | 'warning';

export interface Issue {
  code: string;
  severity: Severity;
  message: string;
  /** Câu hỏi liên quan (id ô câu hỏi) */
  questionId?: string;
  rowId?: string;
  field?: string;
}

// ---------------------------------------------------------------------------
// Trạng thái ứng dụng được lưu trong trình duyệt
// ---------------------------------------------------------------------------
export const STATE_VERSION = 1;

export const appStateSchema = z.object({
  version: z.literal(STATE_VERSION),
  input: examInputSchema,
  /** Bản nháp ma trận (có thể sửa khi chưa xác nhận) */
  matrix: matrixSchema.nullable(),
  matrixNotes: z.array(z.string()),
  matrixMissing: z.array(z.object({ topic: z.string(), reason: z.string() })),
  /** Dấu vân tay thông tin đầu vào lúc AI tạo ma trận (để cảnh báo khi giáo viên sửa đầu vào sau đó) */
  matrixInputFp: z.string().nullable(),
  /** Ma trận đã xác nhận (bản chụp khoá). Có giá trị => ma trận đang bị khoá. */
  confirmedMatrix: matrixSchema.nullable(),
  questions: z.array(questionSchema).nullable(),
  aiWarnings: z.array(aiWarningSchema),
  /** Dấu vân tay nội dung tại thời điểm duyệt. Chỉ hợp lệ khi trùng với nội dung hiện tại. */
  approval: z.object({ at: z.string(), fingerprint: z.string() }).nullable(),
  updatedAt: z.string(),
});
export type AppState = z.infer<typeof appStateSchema>;
