/**
 * Mô hình tài liệu trung gian. Cùng một mô hình được dựng thành:
 *  - tệp .docx thật (src/lib/docx.ts)
 *  - bản xem trước / in A4 trong trình duyệt (src/components/DocView.tsx)
 * nên nội dung xem trước, in và tải về luôn giống nhau.
 */
export type Align = 'left' | 'center' | 'right' | 'justify';

export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  /** Cỡ chữ tính bằng nửa điểm (half-point), 26 = 13pt */
  size?: number;
  color?: string;
}

export interface Para {
  kind: 'p';
  runs: Run[];
  align?: Align;
  /** Thụt lề trái (twip) */
  indent?: number;
  /** Thụt dòng treo (twip) */
  hanging?: number;
  before?: number;
  after?: number;
  keepNext?: boolean;
}

export interface Cell {
  paras: Para[];
  colSpan?: number;
  rowSpan?: number;
  shade?: string;
  vAlign?: 'top' | 'center';
}

export interface Table {
  kind: 'table';
  /** Độ rộng từng cột (twip); tổng bằng độ rộng vùng chữ */
  widths: number[];
  rows: Cell[][];
  headerRows?: number;
  borders?: 'all' | 'none';
  /** Cỡ chữ mặc định trong bảng (nửa điểm) */
  size?: number;
  /** Lề trong ô (twip) */
  cellPadding?: number;
}

export interface PageBreak {
  kind: 'pagebreak';
}

export type Block = Para | Table | PageBreak;

export type DocId = 'matrix' | 'spec' | 'exam' | 'key';

export interface DocModel {
  id: DocId;
  title: string;
  /** Tên tệp .docx (không dấu) */
  filename: string;
  orientation: 'portrait' | 'landscape';
  blocks: Block[];
  /** Chân trang (nhỏ, giữa trang) */
  footer: string;
  /** Cỡ chữ cơ bản (nửa điểm) */
  baseSize: number;
}

// Hình học trang A4 (twip: 1 cm ≈ 567 twip)
export const A4 = { w: 11906, h: 16838 } as const;
export const MARGINS = { portrait: { top: 1134, bottom: 1134, left: 1418, right: 1134 }, landscape: { top: 1021, bottom: 1021, left: 1021, right: 1021 } } as const;

export function textWidth(orientation: 'portrait' | 'landscape'): number {
  const m = MARGINS[orientation];
  const pageW = orientation === 'portrait' ? A4.w : A4.h;
  return pageW - m.left - m.right;
}

// ---------------------------------------------------------------------------
// Hàm dựng nhanh
// ---------------------------------------------------------------------------
export const run = (text: string, o: Omit<Run, 'text'> = {}): Run => ({ text, ...o });

export function p(content: string | Run[], o: Omit<Para, 'kind' | 'runs'> = {}): Para {
  return { kind: 'p', runs: typeof content === 'string' ? [{ text: content }] : content, ...o };
}

/** Tách văn bản nhiều dòng thành nhiều đoạn; dòng đầu có thể có phần tiền tố (ví dụ "Câu 1."). */
export function textParas(text: string, o: Omit<Para, 'kind' | 'runs'> = {}, lead: Run[] = [], runOpts: Omit<Run, 'text'> = {}): Para[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/\s+$/g, ''));
  while (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines.map((line, i) => p([...(i === 0 ? lead : []), { text: line, ...runOpts }], o));
}

export function cell(content: string | Para[], o: Omit<Cell, 'paras'> = {}): Cell {
  return { paras: typeof content === 'string' ? [p(content, { align: 'center' })] : content, ...o };
}

/** Nén dãy số thành khoảng: [1,2,3,5] → "1–3, 5" */
export function compressRanges(nums: number[]): string {
  const sorted = [...new Set(nums)].sort((a, b) => a - b);
  const parts: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j]! + 1) j++;
    parts.push(j - i >= 2 ? `${sorted[i]}–${sorted[j]}` : sorted.slice(i, j + 1).join(', '));
    i = j + 1;
  }
  return parts.join(', ');
}

/** Tên tệp không dấu, an toàn */
export function slugify(s: string): string {
  const out = s
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return out.slice(0, 60) || 'de-kiem-tra';
}
