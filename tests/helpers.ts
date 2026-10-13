/**
 * Dữ liệu và "AI giả" dùng cho kiểm thử. AI giả KHÔNG nằm trong mã sản phẩm.
 */
import { sampleToan10Input } from '../src/data/sampleToan10.js';
import { buildSlots } from '../shared/blueprint.js';
import { matrixFromAi, questionsFromAi } from '../shared/questions.js';
import type { AiMatrixOutput, ExamInput, Matrix, Question, Slot } from '../shared/schema.js';
import type { GenerateFn, GeminiRequest } from '../server/gemini.js';

export const input = (): ExamInput => sampleToan10Input();

const z = { biet: 0, hieu: 0, van_dung: 0 };
const L = (biet = 0, hieu = 0, van_dung = 0) => ({ biet, hieu, van_dung });

/** Ma trận hợp lệ cho cấu trúc mặc định (12 + 2 + 4 + 3 câu). */
export function aiMatrixOutput(): AiMatrixOutput {
  return {
    rows: [
      {
        topic: 'Khái niệm hàm số bậc hai',
        unit: 'Định nghĩa, tập xác định, hệ số',
        outcomes: {
          biet: 'Nhận biết hàm số bậc hai và các hệ số a, b, c.',
          hieu: 'Tính giá trị của hàm số tại một điểm.',
          van_dung: '',
        },
        counts: { mcq: L(3, 1, 0), tf: L(1, 0, 0), short: L(1, 0, 0), essay: { ...z } },
      },
      {
        topic: 'Đồ thị và sự biến thiên của hàm số bậc hai',
        unit: 'Đỉnh, trục đối xứng, bảng biến thiên',
        outcomes: {
          biet: 'Nhận biết đỉnh, trục đối xứng, bề lõm của parabol.',
          hieu: 'Lập bảng biến thiên; xét đồng biến, nghịch biến.',
          van_dung: 'Xác định hệ số khi parabol đi qua các điểm cho trước.',
        },
        counts: { mcq: L(3, 2, 0), tf: L(0, 1, 0), short: L(0, 1, 1), essay: L(1, 1, 0) },
      },
      {
        topic: 'Ứng dụng của hàm số bậc hai',
        unit: 'Giá trị lớn nhất, nhỏ nhất; bài toán thực tiễn',
        outcomes: {
          biet: '',
          hieu: 'Tìm giá trị lớn nhất, nhỏ nhất của hàm số.',
          van_dung: 'Giải bài toán thực tiễn bằng hàm số bậc hai.',
        },
        counts: { mcq: L(0, 1, 2), tf: { ...z }, short: L(0, 0, 1), essay: L(0, 0, 1) },
      },
    ],
    notes: ['Ma trận mẫu cho kiểm thử'],
    missingContent: [],
  };
}

export const matrix = (): Matrix => matrixFromAi(aiMatrixOutput());
export const slots = (inp = input(), m = matrix()): Slot[] => buildSlots(inp.structure, m);

/** Câu hỏi hợp lệ cho từng ô (nội dung giả, nhưng đầy đủ cấu trúc). */
export function validAiQuestion(slot: Slot) {
  const base = { slotId: slot.id, stem: `Nội dung câu ${slot.code} về ${slot.topic}, kiểm tra ${slot.unit} (mã ${slot.id}).`, solution: `Lời giải câu ${slot.code}.` };
  switch (slot.type) {
    case 'mcq':
      return {
        ...base,
        options: { A: `Phương án A của ${slot.id}`, B: `Phương án B của ${slot.id}`, C: `Phương án C của ${slot.id}`, D: `Phương án D của ${slot.id}` },
        correct: 'B' as const,
      };
    case 'tf':
      return {
        ...base,
        statements: [
          { label: 'a', text: `Khẳng định a của ${slot.id}`, isTrue: true },
          { label: 'b', text: `Khẳng định b của ${slot.id}`, isTrue: false },
          { label: 'c', text: `Khẳng định c của ${slot.id}`, isTrue: true },
          { label: 'd', text: `Khẳng định d của ${slot.id}`, isTrue: false },
        ],
      };
    case 'short':
      return { ...base, answer: '2,5' };
    case 'essay': {
      const half = Math.round((slot.points / 2) * 100) / 100;
      return {
        ...base,
        rubric: [
          { content: `Bước 1 của ${slot.code}`, points: half },
          { content: `Bước 2 của ${slot.code}`, points: Math.round((slot.points - half) * 100) / 100 },
        ],
      };
    }
  }
}

/** Dựng bộ câu hỏi hợp lệ (như thể AI trả về chuẩn). */
export function validQuestions(inp = input(), m = matrix()): Question[] {
  const sl = buildSlots(inp.structure, m);
  return questionsFromAi(sl, sl.map(validAiQuestion)).questions;
}

/** Tách các ô câu hỏi từ prompt (hợp đồng giữa prompt và AI giả). */
export function slotsFromPrompt(prompt: string): { id: string; code: string; type: string; points: string }[] {
  const re = /slotId: (\S+) \| mã câu: (\S+) \| dạng: (\w+) \([^)]*\) \| mức độ: [^|]+ \| điểm: ([\d,]+)/g;
  return [...prompt.matchAll(re)].map((m) => ({ id: m[1]!, code: m[2]!, type: m[3]!, points: m[4]! }));
}

export type Behavior = (req: GeminiRequest, callIndex: number) => string | Promise<string>;

/** AI giả: trả kết quả hợp lệ theo loại lời gọi. Có thể ghi đè hành vi. */
export function fakeGenerate(override?: Behavior) {
  const calls: GeminiRequest[] = [];
  const generate: GenerateFn = async (req) => {
    calls.push(req);
    if (override) return override(req, calls.length - 1);
    return defaultResponse(req);
  };
  return { generate, calls };
}

export function defaultResponse(req: GeminiRequest): string {
  const schema = req.jsonSchema as { properties: Record<string, unknown> };
  if ('rows' in schema.properties) return JSON.stringify(aiMatrixOutput());
  if ('questions' in schema.properties) {
    const inp = input();
    const m = matrix();
    const all = buildSlots(inp.structure, m);
    const wanted = slotsFromPrompt(req.prompt).map((s) => s.id);
    const chosen = all.filter((s) => wanted.includes(s.id));
    return JSON.stringify({ questions: chosen.map(validAiQuestion) });
  }
  if ('warnings' in schema.properties) return JSON.stringify({ warnings: [] });
  throw new Error('schema không nhận diện được');
}
