/**
 * Chuyển kết quả AI (đã qua schema) thành bản ghi câu hỏi / ma trận của ứng dụng.
 * Dạng câu, mức độ, chủ đề, yêu cầu cần đạt và điểm LUÔN lấy từ ô câu hỏi trong ma trận đã xác nhận,
 * không lấy từ AI — để AI không thể âm thầm làm lệch ma trận.
 */
import {
  type AiMatrixOutput,
  type AiQuestion,
  type Matrix,
  type MatrixRow,
  type Question,
  type Slot,
  TF_LABELS,
} from './schema.js';
import { tidyAiText as clean } from './text.js';

export function emptyQuestion(slot: Slot): Question {
  const base: Question = {
    id: slot.id,
    code: slot.code,
    type: slot.type,
    number: slot.number,
    rowId: slot.rowId,
    topic: slot.topic,
    unit: slot.unit,
    level: slot.level,
    outcome: slot.outcome,
    points: slot.points,
    stem: '',
    solution: '',
    origin: 'ai',
  };
  switch (slot.type) {
    case 'mcq':
      return { ...base, options: { A: '', B: '', C: '', D: '' } };
    case 'tf':
      return { ...base, statements: TF_LABELS.map((label) => ({ label, text: '' })) };
    case 'short':
      return { ...base, answer: '' };
    case 'essay':
      return { ...base, rubric: [] };
  }
}

const normLabel = (s: string): string => clean(s).toLowerCase().replace(/[^a-z]/g, '').slice(0, 1);

export function questionFromAi(slot: Slot, ai: AiQuestion): Question {
  const q = emptyQuestion(slot);
  q.stem = clean(ai.stem);
  q.solution = clean(ai.solution);
  q.sourceRef = clean(ai.sourceRef) || undefined;
  switch (slot.type) {
    case 'mcq':
      q.options = {
        A: clean(ai.options?.A),
        B: clean(ai.options?.B),
        C: clean(ai.options?.C),
        D: clean(ai.options?.D),
      };
      q.correct = ai.correct ?? undefined;
      break;
    case 'tf':
      // Giữ nguyên số ý AI trả về (kể cả khi thiếu/thừa) để bước kiểm tra bằng mã báo lỗi.
      q.statements = (ai.statements ?? []).map((s) => ({
        label: normLabel(s.label) || '?',
        text: clean(s.text),
        isTrue: s.isTrue,
      }));
      break;
    case 'short':
      q.answer = clean(ai.answer);
      break;
    case 'essay':
      q.rubric = (ai.rubric ?? []).map((r) => ({
        content: clean(r.content),
        points: Math.round((Number(r.points) || 0) * 100) / 100,
      }));
      break;
  }
  return q;
}

export interface BuildQuestionsResult {
  questions: Question[];
  /** Thông báo kỹ thuật (câu AI bỏ sót, mã ô lạ…) để hiển thị cho giáo viên. */
  notes: string[];
}

/** Ghép câu AI trả về với các ô câu hỏi; ô nào AI bỏ sót sẽ là câu trống (bị báo lỗi ở bước kiểm tra). */
export function questionsFromAi(slots: Slot[], aiQuestions: AiQuestion[]): BuildQuestionsResult {
  const notes: string[] = [];
  const bySlot = new Map<string, AiQuestion>();
  const known = new Set(slots.map((s) => s.id));
  for (const aq of aiQuestions) {
    const id = clean(aq.slotId);
    if (!known.has(id)) {
      notes.push(`AI trả về mã ô "${id}" không có trong ma trận — đã bỏ qua.`);
      continue;
    }
    if (bySlot.has(id)) {
      notes.push(`AI trả về hai câu cho ô ${id} — giữ câu đầu tiên.`);
      continue;
    }
    bySlot.set(id, aq);
  }
  const questions = slots.map((slot) => {
    const aq = bySlot.get(slot.id);
    if (!aq) {
      notes.push(`AI chưa tạo câu cho ô ${slot.code}.`);
      return emptyQuestion(slot);
    }
    return questionFromAi(slot, aq);
  });
  return { questions, notes };
}

/** Chuyển bản nháp ma trận của AI thành Matrix (gán id hàng, làm tròn số câu về số nguyên không âm). */
export function matrixFromAi(out: AiMatrixOutput): Matrix {
  const int = (n: number) => {
    const v = Math.round(Number(n));
    return Number.isFinite(v) && v > 0 ? Math.min(v, 60) : 0;
  };
  const lc = (c: { biet: number; hieu: number; van_dung: number }) => ({
    biet: int(c.biet),
    hieu: int(c.hieu),
    van_dung: int(c.van_dung),
  });
  const rows: MatrixRow[] = out.rows.map((r, i) => ({
    id: `r${i + 1}`,
    topic: clean(r.topic),
    unit: clean(r.unit),
    outcomes: {
      biet: clean(r.outcomes.biet),
      hieu: clean(r.outcomes.hieu),
      van_dung: clean(r.outcomes.van_dung),
    },
    counts: {
      mcq: lc(r.counts.mcq),
      tf: lc(r.counts.tf),
      short: lc(r.counts.short),
      essay: lc(r.counts.essay),
    },
  }));
  return { rows, pointOverrides: {} };
}

export function newMatrixRow(id: string): MatrixRow {
  const zero = { biet: 0, hieu: 0, van_dung: 0 };
  return {
    id,
    topic: '',
    unit: '',
    outcomes: { biet: '', hieu: '', van_dung: '' },
    counts: { mcq: { ...zero }, tf: { ...zero }, short: { ...zero }, essay: { ...zero } },
  };
}
