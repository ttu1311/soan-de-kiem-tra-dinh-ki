import { describe, expect, it } from 'vitest';
import {
  activeParts,
  approxEqual,
  buildSlots,
  computeTotals,
  defaultStructure,
  examFingerprint,
  fmtPoints,
  moveShortToTf,
  similarity,
  sumPoints,
  tfRatio,
  tfScoringTable,
} from '../shared/blueprint.js';
import { input, matrix } from './helpers.js';

describe('chia điểm và ô câu hỏi', () => {
  it('định dạng điểm kiểu Việt Nam', () => {
    expect(fmtPoints(3)).toBe('3,0');
    expect(fmtPoints(0.25)).toBe('0,25');
    expect(fmtPoints(1.5)).toBe('1,5');
    expect(fmtPoints(0.1 + 0.2)).toBe('0,3');
  });

  it('sinh đúng 21 ô với cấu trúc mặc định 12/2/4/3 và tổng điểm bằng 10', () => {
    const slots = buildSlots(defaultStructure(), matrix());
    expect(slots).toHaveLength(21);
    expect(sumPoints(slots.map((s) => s.points))).toBe(10);
    expect(slots.filter((s) => s.type === 'mcq').every((s) => s.points === 0.25)).toBe(true);
    expect(slots.filter((s) => s.type === 'tf').every((s) => s.points === 1)).toBe(true);
    expect(slots.filter((s) => s.type === 'short').every((s) => s.points === 0.5)).toBe(true);
    expect(slots.filter((s) => s.type === 'essay').every((s) => s.points === 1)).toBe(true);
  });

  it('mã câu, thứ tự mức độ tăng dần và yêu cầu cần đạt lấy từ ma trận', () => {
    const slots = buildSlots(defaultStructure(), matrix());
    const mcq = slots.filter((s) => s.type === 'mcq');
    expect(mcq[0]!.code).toBe('TN01');
    expect(mcq[11]!.code).toBe('TN12');
    expect(mcq.map((s) => s.level)).toEqual([
      ...Array(6).fill('biet'),
      ...Array(4).fill('hieu'),
      ...Array(2).fill('van_dung'),
    ]);
    expect(mcq[0]!.outcome).toMatch(/Nhận biết hàm số bậc hai/);
    expect(slots.find((s) => s.id === 'tf-1')!.code).toBe('DS01');
  });

  it('chia phần dư theo 0,01 điểm khi không chia hết (3,0 điểm / 7 câu)', () => {
    const m = matrix();
    m.rows[0]!.counts.mcq = { biet: 7, hieu: 0, van_dung: 0 };
    m.rows[1]!.counts.mcq = { biet: 0, hieu: 0, van_dung: 0 };
    m.rows[2]!.counts.mcq = { biet: 0, hieu: 0, van_dung: 0 };
    const slots = buildSlots(defaultStructure(), m).filter((s) => s.type === 'mcq');
    expect(slots).toHaveLength(7);
    expect(sumPoints(slots.map((s) => s.points))).toBe(3);
  });

  it('điểm tự luận do giáo viên đặt chỉ có hiệu lực khi đủ cho mọi câu', () => {
    const m = matrix();
    m.pointOverrides = { 'essay-1': 0.5, 'essay-2': 1, 'essay-3': 1.5 };
    const essays = buildSlots(defaultStructure(), m).filter((s) => s.type === 'essay');
    expect(essays.map((s) => s.points)).toEqual([0.5, 1, 1.5]);
    m.pointOverrides = { 'essay-1': 0.5 };
    const partial = buildSlots(defaultStructure(), m).filter((s) => s.type === 'essay');
    expect(partial.map((s) => s.points)).toEqual([1, 1, 1]);
  });
});

describe('tổng hợp ma trận', () => {
  it('đếm số câu / điểm theo dạng, mức độ và hàng; tỉ lệ % theo thang điểm', () => {
    const m = matrix();
    const slots = buildSlots(defaultStructure(), m);
    const t = computeTotals(slots, m.rows, 10);
    expect(t.totalCount).toBe(21);
    expect(t.totalPoints).toBe(10);
    expect(t.typePoints).toEqual({ mcq: 3, tf: 2, short: 2, essay: 3 });
    expect(t.levelPoints).toEqual({ biet: 4, hieu: 3.5, van_dung: 2.5 });
    expect(t.levelPercent.biet).toBe(40);
    expect(t.cellCount.mcq).toEqual({ biet: 6, hieu: 4, van_dung: 2 });
    const r1 = t.rows[m.rows[0]!.id]!;
    expect(r1.codes.mcq.biet).toEqual(['TN01', 'TN02', 'TN03']);
    expect(sumPoints(m.rows.map((r) => t.rows[r.id]!.points))).toBe(10);
    expect(approxEqual(m.rows.reduce((a, r) => a + t.rows[r.id]!.percent, 0), 100)).toBe(true);
  });

  it('môn không dùng trả lời ngắn: chuyển toàn bộ điểm sang Đúng – Sai và đánh số phần lại', () => {
    const s = moveShortToTf(defaultStructure());
    expect(s.points).toEqual({ mcq: 3, tf: 4, short: 0, essay: 3 });
    expect(sumPoints(Object.values(s.points))).toBe(10);
    expect(s.counts.short).toBe(0);
    const m = matrix();
    for (const r of m.rows) r.counts.short = { biet: 0, hieu: 0, van_dung: 0 };
    const parts = activeParts(buildSlots(s, m));
    expect(parts.map((p) => p.type)).toEqual(['mcq', 'tf', 'essay']);
    expect(parts.map((p) => p.roman)).toEqual(['I', 'II', 'III']);
  });
});

describe('chấm điểm Đúng – Sai', () => {
  it('lũy tiến 10% – 25% – 50% – 100%', () => {
    expect([0, 1, 2, 3, 4].map((n) => tfRatio(n, 'progressive'))).toEqual([0, 0.1, 0.25, 0.5, 1]);
    expect(tfScoringTable(1, 'progressive').map((r) => r.score)).toEqual([0.1, 0.25, 0.5, 1]);
    expect(tfRatio(3, 'linear')).toBe(0.75);
  });
});

describe('tiện ích', () => {
  it('dấu vân tay thay đổi khi nội dung thay đổi', () => {
    const a = examFingerprint(input(), matrix(), null);
    const b = examFingerprint(input(), matrix(), null);
    expect(a).toBe(b);
    const m = matrix();
    m.rows[0]!.topic += '!';
    expect(examFingerprint(input(), m, null)).not.toBe(a);
  });
  it('độ giống nhau', () => {
    expect(similarity('Tìm đỉnh của parabol y = x²', 'Tìm đỉnh của parabol y = x²')).toBe(1);
    expect(similarity('Tìm đỉnh của parabol', 'Vẽ bảng biến thiên')).toBeLessThan(0.2);
  });
});

import { tidyAiText } from '../shared/text.js';
describe('làm sạch văn bản AI', () => {
  it('đổi LaTeX và Markdown sang chữ thường dùng', () => {
    expect(tidyAiText('Cho $y = ax^2 + bx + c$ với $a \\neq 0$')).toBe('Cho y = ax² + bx + c với a ≠ 0');
    expect(tidyAiText('**Đỉnh** là $I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)$')).toBe('Đỉnh là I(-b/(2a); -Δ/(4a))');
    expect(tidyAiText('$x \\in \\mathbb{R}$, $x_0 \\geq \\sqrt{2}$')).toBe('x ∈ ℝ, x₀ ≥ √2');
    expect(tidyAiText('Giá trị 2*3 và a_n')).toBe('Giá trị 2*3 và aₙ');
    expect(tidyAiText('ℝ \\ {0} và A \\setminus B')).toBe('ℝ \\ {0} và A \\ B');
    expect(tidyAiText(null)).toBe('');
  });
});
