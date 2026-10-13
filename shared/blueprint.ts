/**
 * Tính toán thuần (không phụ thuộc giao diện / máy chủ):
 * giá trị mặc định, chia điểm, tạo "ô câu hỏi" từ ma trận, tổng hợp số liệu ma trận,
 * cách chấm Đúng/Sai, đánh số phần và dấu vân tay nội dung.
 */
import {
  LEVELS,
  QTYPES,
  QTYPE_CODE_PREFIX,
  type AppState,
  type ByLevel,
  type ByType,
  type ExamInput,
  type Level,
  type Matrix,
  type MatrixRow,
  type QType,
  type Question,
  type Slot,
  type Structure,
  type TfScoring,
  STATE_VERSION,
} from './schema.js';

// ---------------------------------------------------------------------------
// Số học điểm (làm việc bằng "phần trăm điểm" = 0,01 điểm để tránh sai số số thực)
// ---------------------------------------------------------------------------
export const toCents = (x: number): number => Math.round(x * 100);
export const fromCents = (c: number): number => c / 100;

/** Cộng các số điểm mà không bị sai số dấu phẩy động. */
export const sumPoints = (values: number[]): number =>
  fromCents(values.reduce((acc, v) => acc + toCents(v), 0));

export const approxEqual = (a: number, b: number): boolean => Math.abs(a - b) < 0.0051;

/** Định dạng điểm theo kiểu Việt Nam: 3,0 · 0,25 · 1,5 */
export function fmtPoints(x: number): string {
  const rounded = Math.round(x * 100) / 100;
  const text = Number.isInteger(rounded)
    ? rounded.toFixed(1)
    : String(rounded).replace(/(\.\d*?)0+$/, '$1');
  return text.replace('.', ',');
}

export const fmtPercent = (x: number): string => {
  const r = Math.round(x * 10) / 10;
  return String(r).replace('.', ',');
};

// ---------------------------------------------------------------------------
// Giá trị mặc định
// ---------------------------------------------------------------------------
export const DEFAULT_POINTS: ByType<number> = { mcq: 3, tf: 2, short: 2, essay: 3 };
export const DEFAULT_COUNTS: ByType<number> = { mcq: 12, tf: 2, short: 4, essay: 3 };
export const DEFAULT_LEVEL_TARGET: ByLevel<number> = { biet: 40, hieu: 30, van_dung: 30 };

export function defaultStructure(): Structure {
  return {
    totalScore: 10,
    points: { ...DEFAULT_POINTS },
    counts: { ...DEFAULT_COUNTS },
    levelTarget: { ...DEFAULT_LEVEL_TARGET },
    tfScoring: 'progressive',
  };
}

let idCounter = 0;
export const newId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}${(idCounter++).toString(36)}`;

export function emptyInput(): ExamInput {
  return {
    info: {
      subject: '',
      grade: '10',
      title: '',
      school: '',
      academicYear: '',
      semester: '',
      durationMinutes: 60,
    },
    structure: defaultStructure(),
    topics: [{ id: newId('t'), name: '', requirements: '' }],
    sourceText: '',
    notes: '',
  };
}

export function emptyState(): AppState {
  return {
    version: STATE_VERSION,
    input: emptyInput(),
    matrix: null,
    matrixNotes: [],
    matrixMissing: [],
    matrixInputFp: null,
    confirmedMatrix: null,
    questions: null,
    aiWarnings: [],
    approval: null,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Theo chú thích 3 của phụ lục: môn không dùng dạng "trả lời ngắn" thì chuyển toàn bộ điểm
 * của dạng này sang "Đúng – Sai".
 */
export function moveShortToTf(structure: Structure): Structure {
  const tfPoints = sumPoints([structure.points.tf, structure.points.short]);
  return {
    ...structure,
    points: { ...structure.points, tf: tfPoints, short: 0 },
    counts: {
      ...structure.counts,
      tf: Math.max(1, Math.round(tfPoints)),
      short: 0,
    },
  };
}

/** Gợi ý số câu từ số điểm với mức điểm/câu quen dùng (0,25 · 1,0 · 0,5). */
export function suggestCount(type: QType, points: number): number {
  if (points <= 0) return 0;
  const perQuestion: Record<QType, number> = { mcq: 0.25, tf: 1, short: 0.5, essay: 1 };
  return Math.max(1, Math.round(points / perQuestion[type]));
}

// ---------------------------------------------------------------------------
// Ô câu hỏi
// ---------------------------------------------------------------------------
function distributeCents(totalCents: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(totalCents / n);
  const remainder = totalCents - base * n;
  // phần dư rải vào các câu cuối, mỗi câu 0,01 điểm
  return Array.from({ length: n }, (_, i) => base + (i >= n - remainder ? 1 : 0));
}

export const slotId = (type: QType, number: number): string => `${type}-${number}`;
export const slotCode = (type: QType, number: number): string =>
  `${QTYPE_CODE_PREFIX[type]}${String(number).padStart(2, '0')}`;

/**
 * Sinh danh sách ô câu hỏi từ ma trận. Thứ tự trong mỗi phần: mức độ tăng dần (Biết → Hiểu → Vận dụng),
 * cùng mức thì theo thứ tự hàng của ma trận.
 */
export function buildSlots(structure: Structure, matrix: Matrix): Slot[] {
  const slots: Slot[] = [];
  for (const type of QTYPES) {
    const entries: { row: MatrixRow; level: Level }[] = [];
    for (const level of LEVELS) {
      for (const row of matrix.rows) {
        const n = Math.max(0, Math.floor(row.counts[type]?.[level] ?? 0));
        for (let i = 0; i < n; i++) entries.push({ row, level });
      }
    }
    if (entries.length === 0) continue;

    let cents = distributeCents(toCents(structure.points[type] ?? 0), entries.length);
    if (type === 'essay') {
      const ids = entries.map((_, i) => slotId(type, i + 1));
      const overrides = matrix.pointOverrides ?? {};
      if (ids.every((id) => typeof overrides[id] === 'number' && Number.isFinite(overrides[id]))) {
        cents = ids.map((id) => toCents(overrides[id]!));
      }
    }

    entries.forEach(({ row, level }, i) => {
      const number = i + 1;
      slots.push({
        id: slotId(type, number),
        code: slotCode(type, number),
        type,
        number,
        rowId: row.id,
        topic: row.topic,
        unit: row.unit,
        level,
        outcome: row.outcomes[level] ?? '',
        points: fromCents(cents[i]!),
      });
    });
  }
  return slots;
}

export const slotsOfType = (slots: Slot[], type: QType): Slot[] =>
  slots.filter((s) => s.type === type);

// ---------------------------------------------------------------------------
// Tổng hợp số liệu ma trận
// ---------------------------------------------------------------------------
const zeroByLevel = (): ByLevel<number> => ({ biet: 0, hieu: 0, van_dung: 0 });
const zeroByType = (): ByType<number> => ({ mcq: 0, tf: 0, short: 0, essay: 0 });

export interface RowTotals {
  /** Điểm theo mức độ của hàng (cộng mọi dạng) */
  levelPoints: ByLevel<number>;
  points: number;
  /** Tỉ lệ % điểm của hàng so với tổng điểm */
  percent: number;
  /** Mã câu trong từng ô để ghi vào ma trận */
  codes: ByType<ByLevel<string[]>>;
}

export interface MatrixTotals {
  cellCount: ByType<ByLevel<number>>;
  typeCount: ByType<number>;
  typePoints: ByType<number>;
  levelCount: ByLevel<number>;
  levelPoints: ByLevel<number>;
  levelPercent: ByLevel<number>;
  typePercent: ByType<number>;
  totalCount: number;
  totalPoints: number;
  rows: Record<string, RowTotals>;
}

export function computeTotals(slots: Slot[], rows: MatrixRow[], totalScore: number): MatrixTotals {
  const cellCount: ByType<ByLevel<number>> = {
    mcq: zeroByLevel(),
    tf: zeroByLevel(),
    short: zeroByLevel(),
    essay: zeroByLevel(),
  };
  const typeCount = zeroByType();
  const typeCents = zeroByType();
  const levelCount = zeroByLevel();
  const levelCents = zeroByLevel();
  const rowMap: Record<string, RowTotals> = {};
  const rowCents: Record<string, number> = {};
  const rowLevelCents: Record<string, ByLevel<number>> = {};

  for (const row of rows) {
    rowMap[row.id] = {
      levelPoints: zeroByLevel(),
      points: 0,
      percent: 0,
      codes: {
        mcq: { biet: [], hieu: [], van_dung: [] },
        tf: { biet: [], hieu: [], van_dung: [] },
        short: { biet: [], hieu: [], van_dung: [] },
        essay: { biet: [], hieu: [], van_dung: [] },
      },
    };
    rowCents[row.id] = 0;
    rowLevelCents[row.id] = zeroByLevel();
  }

  for (const s of slots) {
    const c = toCents(s.points);
    cellCount[s.type][s.level] += 1;
    typeCount[s.type] += 1;
    typeCents[s.type] += c;
    levelCount[s.level] += 1;
    levelCents[s.level] += c;
    const r = rowMap[s.rowId];
    if (r) {
      r.codes[s.type][s.level].push(s.code);
      rowCents[s.rowId]! += c;
      rowLevelCents[s.rowId]![s.level] += c;
    }
  }

  const totalCents = LEVELS.reduce((a, l) => a + levelCents[l], 0);
  const totalPoints = fromCents(totalCents);
  const denom = totalScore > 0 ? totalScore : totalPoints || 1;
  const pct = (x: number) => (x / denom) * 100;

  for (const row of rows) {
    const r = rowMap[row.id]!;
    r.points = fromCents(rowCents[row.id]!);
    r.percent = pct(r.points);
    for (const l of LEVELS) r.levelPoints[l] = fromCents(rowLevelCents[row.id]![l]);
  }

  const typePoints = zeroByType();
  const typePercent = zeroByType();
  for (const t of QTYPES) {
    typePoints[t] = fromCents(typeCents[t]);
    typePercent[t] = pct(typePoints[t]);
  }
  const levelPoints = zeroByLevel();
  const levelPercent = zeroByLevel();
  for (const l of LEVELS) {
    levelPoints[l] = fromCents(levelCents[l]);
    levelPercent[l] = pct(levelPoints[l]);
  }

  return {
    cellCount,
    typeCount,
    typePoints,
    levelCount,
    levelPoints,
    levelPercent,
    typePercent,
    totalCount: slots.length,
    totalPoints,
    rows: rowMap,
  };
}

// ---------------------------------------------------------------------------
// Chấm điểm câu Đúng – Sai
// ---------------------------------------------------------------------------
/** Tỉ lệ điểm theo số ý đúng (0–4). */
export const TF_PROGRESSIVE_RATIO = [0, 0.1, 0.25, 0.5, 1] as const;

export function tfRatio(correctCount: number, mode: TfScoring): number {
  const n = Math.max(0, Math.min(4, Math.floor(correctCount)));
  return mode === 'progressive' ? TF_PROGRESSIVE_RATIO[n]! : n / 4;
}

export function tfScoringText(mode: TfScoring): string {
  return mode === 'progressive'
    ? 'Điểm mỗi câu Đúng – Sai tính theo số ý trả lời đúng: đúng 1 ý được 10%, 2 ý được 25%, 3 ý được 50%, đủ 4 ý được 100% số điểm của câu.'
    : 'Điểm mỗi câu Đúng – Sai tính theo số ý trả lời đúng: mỗi ý đúng được 25% số điểm của câu.';
}

/** Bảng quy đổi điểm cho một câu Đúng – Sai có `points` điểm. */
export function tfScoringTable(points: number, mode: TfScoring): { correct: number; score: number }[] {
  return [1, 2, 3, 4].map((n) => ({ correct: n, score: Math.round(tfRatio(n, mode) * points * 1000) / 1000 }));
}

// ---------------------------------------------------------------------------
// Đánh số phần
// ---------------------------------------------------------------------------
const ROMAN = ['I', 'II', 'III', 'IV'];

export interface PartInfo {
  type: QType;
  roman: string;
  count: number;
  points: number;
}

/** Các phần thực sự có trong đề (dạng không có câu thì bỏ qua và đánh số lại). */
export function activeParts(slots: { type: QType; points: number }[]): PartInfo[] {
  const parts: PartInfo[] = [];
  for (const type of QTYPES) {
    const these = slots.filter((s) => s.type === type);
    if (these.length === 0) continue;
    parts.push({
      type,
      roman: ROMAN[parts.length]!,
      count: these.length,
      points: sumPoints(these.map((s) => s.points)),
    });
  }
  return parts;
}

// ---------------------------------------------------------------------------
// Dấu vân tay nội dung (dùng cho bước "Duyệt đề")
// ---------------------------------------------------------------------------
export function fnv1a(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function examFingerprint(
  input: ExamInput,
  matrix: Matrix | null,
  questions: Question[] | null,
): string {
  return fnv1a(
    JSON.stringify({
      i: [input.info, input.structure],
      m: matrix,
      q: questions,
    }),
  );
}

// ---------------------------------------------------------------------------
// Tiện ích văn bản
// ---------------------------------------------------------------------------
export const clean = (s: string | null | undefined): string => (s ?? '').replace(/\r\n/g, '\n').trim();

export function normalizeForCompare(s: string): string {
  return clean(s)
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Độ giống nhau Jaccard theo tập từ (0–1). */
export function similarity(a: string, b: string): number {
  const ta = new Set(normalizeForCompare(a).split(' ').filter(Boolean));
  const tb = new Set(normalizeForCompare(b).split(' ').filter(Boolean));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const w of ta) if (tb.has(w)) inter++;
  return inter / (ta.size + tb.size - inter);
}

/** Dấu vân tay các thông tin đầu vào mà AI dùng để lập ma trận (không gồm tên trường, năm học…). */
export function inputFingerprint(input: ExamInput): string {
  return fnv1a(
    JSON.stringify({
      s: input.info.subject.trim(),
      g: input.info.grade,
      t: input.info.title.trim(),
      st: input.structure,
      tp: input.topics.map((t) => [t.name.trim(), t.requirements.trim()]),
      src: input.sourceText.trim(),
      n: input.notes.trim(),
    }),
  );
}
