/**
 * Làm sạch văn bản do AI sinh ra: bỏ dấu Markdown và đổi các ký hiệu LaTeX thường gặp sang Unicode,
 * để tài liệu Word/PDF không hiện "$x^2$" hay "**đậm**". Chỉ áp dụng cho đầu ra của AI, không đụng chữ giáo viên tự gõ.
 */
const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '−': '⁻', n: 'ⁿ', x: 'ˣ',
};
const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '−': '₋', n: 'ₙ', x: 'ₓ',
};

const mapAll = (s: string, table: Record<string, string>): string | null => {
  let out = '';
  for (const ch of s) {
    const m = table[ch];
    if (!m) return null;
    out += m;
  }
  return out;
};

/** Một số hoặc một chữ cái: không cần thêm ngoặc. */
const SIMPLE = /^(\d+([.,]\d+)?|[A-Za-zΑ-Ωα-ω])$/;

const COMMANDS: [RegExp, string][] = [
  [/\\leq?\b|\\le\b/g, '≤'],
  [/\\geq?\b|\\ge\b/g, '≥'],
  [/\\neq?\b/g, '≠'],
  [/\\approx\b/g, '≈'],
  [/\\infty\b/g, '∞'],
  [/\\cdot\b/g, '·'],
  [/\\times\b/g, '×'],
  [/\\pm\b/g, '±'],
  [/\\pi\b/g, 'π'],
  [/\\alpha\b/g, 'α'],
  [/\\beta\b/g, 'β'],
  [/\\gamma\b/g, 'γ'],
  [/\\Delta\b/g, 'Δ'],
  [/\\delta\b/g, 'δ'],
  [/\\theta\b/g, 'θ'],
  [/\\lambda\b/g, 'λ'],
  [/\\in\b/g, '∈'],
  [/\\notin\b/g, '∉'],
  [/\\cup\b/g, '∪'],
  [/\\cap\b/g, '∩'],
  [/\\subset\b/g, '⊂'],
  [/\\emptyset\b/g, '∅'],
  [/\\forall\b/g, '∀'],
  [/\\exists\b/g, '∃'],
  [/\\Rightarrow\b/g, '⇒'],
  [/\\Leftrightarrow\b/g, '⇔'],
  [/\\rightarrow\b|\\to\b/g, '→'],
  [/\\mathbb\{R\}/g, 'ℝ'],
  [/\\mathbb\{N\}/g, 'ℕ'],
  [/\\mathbb\{Z\}/g, 'ℤ'],
  [/\\mathbb\{Q\}/g, 'ℚ'],
  [/\\left|\\right/g, ''],
  [/\\setminus\b/g, '\\'],
  [/\\,|\\;|\\!/g, ' '],
];

export function unicodeMath(input: string): string {
  let s = input;
  // $...$ và \( ... \) → bỏ ký hiệu bao
  s = s.replace(/\$\$([^$]+)\$\$/g, '$1').replace(/\$([^$\n]+)\$/g, '$1');
  s = s.replace(/\\\(|\\\)|\\\[|\\\]/g, '');
  for (const [re, rep] of COMMANDS) s = s.replace(re, rep);
  // \frac{a}{b} → (a)/(b) (rút gọn dấu ngoặc nếu là một ký tự/số)
  for (let i = 0; i < 3; i++) {
    s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a: string, b: string) => {
      const wrap = (t: string) => (SIMPLE.test(t.trim()) ? t.trim() : `(${t.trim()})`);
      return `${wrap(a)}/${wrap(b)}`;
    });
  }
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, (_m, a: string) => (SIMPLE.test(a.trim()) ? `√${a.trim()}` : `√(${a.trim()})`));
  s = s.replace(/\\text\{([^{}]*)\}|\\mathrm\{([^{}]*)\}/g, (_m, a?: string, b?: string) => a ?? b ?? '');
  // mũ / chỉ số
  s = s.replace(/\^\{([^{}]+)\}/g, (m, a: string) => mapAll(a, SUP) ?? `^(${a})`);
  s = s.replace(/\^([0-9nx+\-−])/g, (m, a: string) => mapAll(a, SUP) ?? m);
  s = s.replace(/_\{([^{}]+)\}/g, (m, a: string) => mapAll(a, SUB) ?? `_${a}`);
  s = s.replace(/(?<=[A-Za-z])_([0-9nx])/g, (m, a: string) => mapAll(a, SUB) ?? m);
  // ngoặc nhọn còn sót của LaTeX
  s = s.replace(/\\([A-Za-z]+)/g, '$1');
  return s;
}

export function stripMarkdown(input: string): string {
  return input
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/__([^_\n]+)__/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[*]\s+/gm, '- ')
    .replace(/`([^`\n]+)`/g, '$1');
}

/** Làm sạch một chuỗi do AI sinh ra. */
export function tidyAiText(input: string | null | undefined): string {
  if (!input) return '';
  return unicodeMath(stripMarkdown(input.replace(/\r\n/g, '\n'))).replace(/[ \t]+\n/g, '\n').trim();
}
