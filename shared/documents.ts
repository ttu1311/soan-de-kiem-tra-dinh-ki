/**
 * Dựng bốn tài liệu từ đề đã duyệt: ma trận, bản đặc tả, đề học sinh (KHÔNG có đáp án),
 * đáp án và hướng dẫn chấm. Ma trận/bản đặc tả theo bố cục mẫu trong phụ lục Công văn 7991.
 */
import {
  LEVELS,
  LEVEL_LABEL,
  OPTION_KEYS,
  QTYPES,
  QTYPE_SHORT_LABEL,
  type ExamInput,
  type Level,
  type Matrix,
  type QType,
  type Question,
} from './schema.js';
import {
  activeParts,
  buildSlots,
  clean,
  computeTotals,
  fmtPercent,
  fmtPoints,
  sumPoints,
  tfScoringTable,
  tfScoringText,
  type MatrixTotals,
} from './blueprint.js';
import {
  cell,
  compressRanges,
  p,
  run,
  slugify,
  textParas,
  textWidth,
  type Block,
  type Cell,
  type DocId,
  type DocModel,
  type Para,
  type Run,
  type Table,
} from './docmodel.js';

export interface DocContext {
  input: ExamInput;
  matrix: Matrix;
  questions: Question[];
}

export const DOC_TITLES: Record<DocId, string> = {
  matrix: 'Ma trận đề kiểm tra định kì',
  spec: 'Bản đặc tả đề kiểm tra định kì',
  exam: 'Đề kiểm tra (bản cho học sinh)',
  key: 'Đáp án và hướng dẫn chấm',
};

const FONT_NOTE =
  'Tài liệu lập bằng công cụ hỗ trợ soạn đề, tham khảo phụ lục Công văn 7991/BGDĐT-GDTrH; giáo viên chịu trách nhiệm rà soát và duyệt.';

const SHADE = 'E7E6E6';
const SHADE_LIGHT = 'F2F2F2';

const dots = (n = 20) => '.'.repeat(n);

function examLabel(input: ExamInput): string {
  return `${clean(input.info.title)} — ${clean(input.info.subject)} ${input.info.grade}`;
}

function sortedQuestions(ctx: DocContext): Question[] {
  const order = new Map(QTYPES.map((t, i) => [t, i]));
  return [...ctx.questions].sort(
    (a, b) => (order.get(a.type)! - order.get(b.type)!) || a.number - b.number,
  );
}

// ---------------------------------------------------------------------------
// Ma trận & bản đặc tả
// ---------------------------------------------------------------------------
const LEVEL_SHORT: Record<Level, string> = { biet: 'Biết', hieu: 'Hiểu', van_dung: 'Vận dụng' };

function cellNumbers(ctx: DocContext) {
  const slots = buildSlots(ctx.input.structure, ctx.matrix);
  const map = new Map<string, number[]>();
  for (const s of slots) {
    const key = `${s.rowId}|${s.type}|${s.level}`;
    map.set(key, [...(map.get(key) ?? []), s.number]);
  }
  return { slots, map };
}

const hdr = (text: string, o: Omit<Cell, 'paras'> = {}): Cell =>
  cell([p([run(text, { bold: true })], { align: 'center' })], { shade: SHADE, vAlign: 'center', ...o });

/** Các hàng tiêu đề nhiều tầng giống mẫu phụ lục (TNKQ / Tự luận × Biết / Hiểu / Vận dụng). */
function levelHeaderRows(opts: { leading: Cell[]; trailingTop?: Cell[]; trailingLevels?: Cell[] }): Cell[][] {
  const lv = () => LEVELS.map((l) => hdr(LEVEL_SHORT[l]));
  const r1: Cell[] = [...opts.leading, hdr('Mức độ đánh giá', { colSpan: 12 }), ...(opts.trailingTop ?? [])];
  const r2: Cell[] = [hdr('TNKQ', { colSpan: 9 }), hdr('Tự luận', { colSpan: 3, rowSpan: 2 })];
  const r3: Cell[] = [
    hdr('Nhiều lựa chọn', { colSpan: 3 }),
    hdr('“Đúng – Sai”', { colSpan: 3 }),
    hdr('Trả lời ngắn', { colSpan: 3 }),
  ];
  const r4: Cell[] = [...lv(), ...lv(), ...lv(), ...lv(), ...(opts.trailingLevels ?? [])];
  return [r1, r2, r3, r4];
}

function countCell(count: number, nums: number[]): Cell {
  if (count === 0) return cell([p('', { align: 'center' })], { vAlign: 'center' });
  return cell(
    [
      p([run(String(count), { bold: true })], { align: 'center' }),
      p([run(`(${compressRanges(nums)})`, { size: 14, color: '444444' })], { align: 'center' }),
    ],
    { vAlign: 'center' },
  );
}

function bottomRows(totals: MatrixTotals, labelSpan: number, withLevelTotals: boolean, lastColLabels: boolean): Cell[][] {
  const lab = (t: string) => cell([p([run(t, { bold: true })], { align: 'center' })], { colSpan: labelSpan, shade: SHADE_LIGHT, vAlign: 'center' });
  const num = (t: string, span = 1, bold = true) =>
    cell([p([run(t, { bold })], { align: 'center' })], { colSpan: span, shade: SHADE_LIGHT, vAlign: 'center' });

  const rowCount: Cell[] = [lab('Tổng số câu')];
  for (const t of QTYPES) for (const l of LEVELS) rowCount.push(num(totals.cellCount[t][l] ? String(totals.cellCount[t][l]) : '', 1));
  if (withLevelTotals) for (const l of LEVELS) rowCount.push(num(String(totals.levelCount[l])));
  if (lastColLabels) rowCount.push(num(String(totals.totalCount)));

  const rowPts: Cell[] = [lab('Tổng số điểm')];
  for (const t of QTYPES) rowPts.push(num(fmtPoints(totals.typePoints[t]), 3));
  if (withLevelTotals) for (const l of LEVELS) rowPts.push(num(fmtPoints(totals.levelPoints[l])));
  if (lastColLabels) rowPts.push(num(fmtPoints(totals.totalPoints)));

  const rowPct: Cell[] = [lab('Tỉ lệ %')];
  for (const t of QTYPES) rowPct.push(num(fmtPercent(totals.typePercent[t]), 3));
  if (withLevelTotals) for (const l of LEVELS) rowPct.push(num(fmtPercent(totals.levelPercent[l])));
  if (lastColLabels) rowPct.push(num(fmtPercent(totals.levelPercent.biet + totals.levelPercent.hieu + totals.levelPercent.van_dung)));
  return [rowCount, rowPts, rowPct];
}

function docTitleBlocks(ctx: DocContext, heading: string): Block[] {
  const { info } = ctx.input;
  const meta = [
    `Môn: ${clean(info.subject)}`,
    `Lớp ${info.grade}`,
    clean(info.semester),
    clean(info.academicYear) ? `Năm học ${clean(info.academicYear)}` : '',
    `Thời gian làm bài: ${info.durationMinutes} phút`,
  ].filter(Boolean);
  return [
    p([run(heading, { bold: true, size: 28 })], { align: 'center', after: 40 }),
    p([run(clean(info.title), { bold: true, size: 24 })], { align: 'center', after: 40 }),
    p([run(meta.join(' · '), { size: 20 })], { align: 'center', after: 160 }),
  ];
}

export function buildMatrixDoc(ctx: DocContext): DocModel {
  const { slots, map } = cellNumbers(ctx);
  const totals = computeTotals(slots, ctx.matrix.rows, ctx.input.structure.totalScore);
  const W = textWidth('landscape');
  // TT, Chủ đề, Nội dung, 12 ô, 3 tổng, tỉ lệ
  const wTT = 520;
  const wTopic = 1900;
  const wUnit = 2300;
  const wPct = 760;
  const wLevel = Math.floor((W - wTT - wTopic - wUnit - wPct) / 15);
  const widths = [wTT, wTopic, wUnit, ...Array(15).fill(wLevel), W - wTT - wTopic - wUnit - wLevel * 15];

  const head = levelHeaderRows({
    leading: [hdr('TT', { rowSpan: 4 }), hdr('Chủ đề / Chương', { rowSpan: 4 }), hdr('Nội dung / đơn vị kiến thức', { rowSpan: 4 })],
    trailingTop: [hdr('Tổng', { colSpan: 3, rowSpan: 3 }), hdr('Tỉ lệ % điểm', { rowSpan: 4 })],
    trailingLevels: LEVELS.map((l) => hdr(LEVEL_SHORT[l])),
  });

  const body: Cell[][] = ctx.matrix.rows.map((row, i) => {
    const r = totals.rows[row.id]!;
    const cells: Cell[] = [
      cell(String(i + 1), { vAlign: 'center' }),
      cell([p(clean(row.topic), { align: 'left' })], { vAlign: 'center' }),
      cell([p(clean(row.unit), { align: 'left' })], { vAlign: 'center' }),
    ];
    for (const t of QTYPES) {
      for (const l of LEVELS) {
        cells.push(countCell(row.counts[t][l], map.get(`${row.id}|${t}|${l}`) ?? []));
      }
    }
    for (const l of LEVELS) {
      const n = QTYPES.reduce((a, t) => a + row.counts[t][l], 0);
      cells.push(cell(n ? String(n) : '', { vAlign: 'center' }));
    }
    cells.push(cell(fmtPercent(r.percent), { vAlign: 'center' }));
    return cells;
  });

  const table: Table = {
    kind: 'table',
    widths,
    headerRows: 4,
    size: 18,
    cellPadding: 40,
    rows: [...head, ...body, ...bottomRows(totals, 3, true, true)],
  };

  const notes: Block[] = [
    p('', { after: 60 }),
    p([run('Ghi chú: ', { bold: true, size: 18 }), run('Trong mỗi ô, chữ đậm là số câu; số trong ngoặc là số thứ tự câu trong phần tương ứng. Mỗi câu “Đúng – Sai” gồm 4 ý nhỏ (a, b, c, d), mỗi ý thí sinh chọn đúng hoặc sai.', { size: 18 })]),
    p([run(tfScoringText(ctx.input.structure.tfScoring), { size: 18, italic: true })]),
  ];

  return {
    id: 'matrix',
    title: DOC_TITLES.matrix,
    filename: `ma-tran_${slugify(examLabel(ctx.input))}.docx`,
    orientation: 'landscape',
    baseSize: 20,
    footer: FONT_NOTE,
    blocks: [...docTitleBlocks(ctx, 'MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ'), table, ...notes],
  };
}

export function buildSpecDoc(ctx: DocContext): DocModel {
  const { slots, map } = cellNumbers(ctx);
  const totals = computeTotals(slots, ctx.matrix.rows, ctx.input.structure.totalScore);
  const W = textWidth('landscape');
  const wTT = 480;
  const wTopic = 1500;
  const wUnit = 1800;
  const wOut = 4300;
  const wLevel = Math.floor((W - wTT - wTopic - wUnit - wOut) / 12);
  const widths = [wTT, wTopic, wUnit, W - wTT - wTopic - wUnit - wLevel * 12, ...Array(12).fill(wLevel)];

  const head = levelHeaderRows({
    leading: [
      hdr('TT', { rowSpan: 4 }),
      hdr('Chủ đề / Chương', { rowSpan: 4 }),
      hdr('Nội dung / đơn vị kiến thức', { rowSpan: 4 }),
      hdr('Yêu cầu cần đạt', { rowSpan: 4 }),
    ],
  });
  // tiêu đề "Mức độ đánh giá" của bản đặc tả là "Số câu hỏi ở các mức độ đánh giá"
  head[0] = head[0]!.map((c) => (c.colSpan === 12 ? hdr('Số câu hỏi ở các mức độ đánh giá', { colSpan: 12 }) : c));

  const body: Cell[][] = ctx.matrix.rows.map((row, i) => {
    const outcomeParas: Para[] = [];
    for (const l of LEVELS) {
      const text = clean(row.outcomes[l]);
      if (!text) continue;
      const lines = text.split('\n').filter((x) => x.trim());
      lines.forEach((line, idx) => {
        outcomeParas.push(
          p(idx === 0 ? [run(`${LEVEL_LABEL[l]}: `, { bold: true }), run(line.replace(/^[-•]\s*/, ''))] : [run(line)], {
            align: 'left',
            indent: idx === 0 ? 0 : 200,
            after: 30,
          }),
        );
      });
    }
    if (outcomeParas.length === 0) outcomeParas.push(p('', { align: 'left' }));
    const cells: Cell[] = [
      cell(String(i + 1), { vAlign: 'center' }),
      cell([p(clean(row.topic), { align: 'left' })], { vAlign: 'center' }),
      cell([p(clean(row.unit), { align: 'left' })], { vAlign: 'center' }),
      cell(outcomeParas, { vAlign: 'top' }),
    ];
    for (const t of QTYPES) for (const l of LEVELS) cells.push(countCell(row.counts[t][l], map.get(`${row.id}|${t}|${l}`) ?? []));
    return cells;
  });

  const table: Table = {
    kind: 'table',
    widths,
    headerRows: 4,
    size: 18,
    cellPadding: 40,
    rows: [...head, ...body, ...bottomRows(totals, 4, false, false)],
  };

  return {
    id: 'spec',
    title: DOC_TITLES.spec,
    filename: `ban-dac-ta_${slugify(examLabel(ctx.input))}.docx`,
    orientation: 'landscape',
    baseSize: 20,
    footer: FONT_NOTE,
    blocks: [
      ...docTitleBlocks(ctx, 'BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ'),
      table,
      p('', { after: 60 }),
      p([run('Ghi chú: ', { bold: true, size: 18 }), run('Trong mỗi ô, chữ đậm là số câu; số trong ngoặc là số thứ tự câu trong phần tương ứng. Mỗi câu hỏi “Đúng – Sai” có 4 ý nhỏ, mỗi ý thí sinh chọn đúng hoặc sai.', { size: 18 })]),
    ],
  };
}

// ---------------------------------------------------------------------------
// Đề cho học sinh — KHÔNG chứa đáp án
// ---------------------------------------------------------------------------
const PART_NAME: Record<QType, string> = {
  mcq: 'Câu trắc nghiệm nhiều lựa chọn.',
  tf: 'Câu trắc nghiệm đúng sai.',
  short: 'Câu trắc nghiệm trả lời ngắn.',
  essay: 'Tự luận.',
};

function partInstruction(type: QType, n: number, eachPoints: number | null): string {
  switch (type) {
    case 'mcq':
      return `Thí sinh trả lời từ câu 1 đến câu ${n}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.${eachPoints ? ` Mỗi câu trả lời đúng được ${fmtPoints(eachPoints)} điểm.` : ''}`;
    case 'tf':
      return `Thí sinh trả lời từ câu 1 đến câu ${n}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.`;
    case 'short':
      return `Thí sinh trả lời từ câu 1 đến câu ${n}.${eachPoints ? ` Mỗi câu trả lời đúng được ${fmtPoints(eachPoints)} điểm.` : ''}`;
    case 'essay':
      return 'Thí sinh trình bày lời giải đầy đủ, rõ ràng.';
  }
}

function optionBlocks(q: Question, W: number): Block[] {
  const o = q.options ?? { A: '', B: '', C: '', D: '' };
  const texts = OPTION_KEYS.map((k) => clean(o[k]));
  const maxLen = Math.max(...texts.map((t) => t.length));
  const optPara = (k: (typeof OPTION_KEYS)[number], t: string): Para =>
    p([run(`${k}. `, { bold: true }), run(t)], { align: 'left', hanging: 280, indent: 280 });
  const noBorderTable = (cols: number, widths: number[]): Table => ({
    kind: 'table',
    widths,
    borders: 'none',
    cellPadding: 20,
    rows: Array.from({ length: Math.ceil(4 / cols) }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        const idx = r * cols + c;
        return cell([optPara(OPTION_KEYS[idx]!, texts[idx]!)]);
      }),
    ),
  });
  if (maxLen <= 18) {
    const w = Math.floor(W / 4);
    return [noBorderTable(4, [w, w, w, W - w * 3])];
  }
  if (maxLen <= 48) {
    const w = Math.floor(W / 2);
    return [noBorderTable(2, [w, W - w])];
  }
  return OPTION_KEYS.map((k, i) => optPara(k, texts[i]!));
}

export function buildExamDoc(ctx: DocContext): DocModel {
  const { input } = ctx;
  const { info } = input;
  const W = textWidth('portrait');
  const qs = sortedQuestions(ctx);
  const parts = activeParts(qs.map((q) => ({ type: q.type, points: q.points })));
  const blocks: Block[] = [];

  const school = clean(info.school);
  const rightLines: Para[] = [
    p([run(clean(info.title).toUpperCase(), { bold: true })], { align: 'center' }),
    ...(clean(info.semester) || clean(info.academicYear)
      ? [p([run([clean(info.semester), clean(info.academicYear) ? `Năm học ${clean(info.academicYear)}` : ''].filter(Boolean).join(' — '))], { align: 'center' })]
      : []),
    p([run(`Môn: ${clean(info.subject)} — Lớp ${info.grade}`)], { align: 'center' }),
    p([run(`Thời gian làm bài: ${info.durationMinutes} phút`, { italic: true })], { align: 'center' }),
  ];
  blocks.push({
    kind: 'table',
    widths: [Math.floor(W * 0.42), W - Math.floor(W * 0.42)],
    borders: 'none',
    rows: [
      [
        cell(
          [
            p([run(school ? school.toUpperCase() : `TRƯỜNG THPT ${dots(24)}`, { bold: true })], { align: 'center' }),
            p([run(`Đề gồm ${qs.length} câu, ${parts.length} phần`, { italic: true })], { align: 'center' }),
          ],
          { vAlign: 'top' },
        ),
        cell(rightLines, { vAlign: 'top' }),
      ],
    ],
  });
  blocks.push(p('', { after: 80 }));
  blocks.push(p([run(`Họ và tên thí sinh: ${dots(52)}  Lớp: ${dots(12)}  SBD: ${dots(12)}`)], { align: 'left', after: 160 }));

  for (const part of parts) {
    const inPart = qs.filter((q) => q.type === part.type);
    const uniform = new Set(inPart.map((q) => q.points)).size === 1 ? inPart[0]!.points : null;
    blocks.push(
      p([run(`PHẦN ${part.roman}. ${PART_NAME[part.type]} `, { bold: true }), run(`(${fmtPoints(part.points)} điểm)`, { bold: true })], {
        before: 160,
        after: 40,
        keepNext: true,
      }),
    );
    blocks.push(p([run(partInstruction(part.type, part.count, uniform), { italic: true })], { after: 100, keepNext: true }));

    for (const q of inPart) {
      const lead: Run[] = [
        run(`Câu ${q.number}. `, { bold: true }),
        ...(part.type === 'essay' ? [run(`(${fmtPoints(q.points)} điểm) `, { bold: true })] : []),
      ];
      const stem = textParas(clean(q.stem), { align: 'justify', after: 40 }, lead);
      if (stem.length > 0) stem[0] = { ...stem[0]!, keepNext: part.type !== 'essay' };
      blocks.push(...stem);
      switch (part.type) {
        case 'mcq':
          blocks.push(...optionBlocks(q, W));
          break;
        case 'tf':
          for (const s of q.statements ?? []) {
            blocks.push(p([run(`${s.label}) `, { bold: true }), run(clean(s.text))], { align: 'justify', indent: 400, hanging: 340, after: 20 }));
          }
          break;
        case 'short':
          blocks.push(p([run(`Đáp số: ${dots(40)}`)], { indent: 400, before: 40 }));
          break;
        case 'essay':
          break;
      }
      blocks.push(p('', { after: part.type === 'mcq' ? 0 : 60 }));
    }
  }

  blocks.push(p([run('— HẾT —', { bold: true })], { align: 'center', before: 120 }));
  blocks.push(p([run('Thí sinh không được sử dụng tài liệu. Cán bộ coi kiểm tra không giải thích gì thêm.', { italic: true, size: 22 })], { align: 'center' }));

  return {
    id: 'exam',
    title: DOC_TITLES.exam,
    filename: `de-kiem-tra_${slugify(examLabel(input))}.docx`,
    orientation: 'portrait',
    baseSize: 26,
    footer: '',
    blocks,
  };
}

// ---------------------------------------------------------------------------
// Đáp án và hướng dẫn chấm
// ---------------------------------------------------------------------------
function keyHeading(text: string): Para {
  return p([run(text, { bold: true })], { before: 200, after: 80, keepNext: true });
}

function gridTable(widths: number[], rows: Cell[][], headerRows = 1): Table {
  return { kind: 'table', widths, rows, headerRows, size: 22, cellPadding: 50 };
}

export function buildKeyDoc(ctx: DocContext): DocModel {
  const { input } = ctx;
  const W = textWidth('portrait');
  const qs = sortedQuestions(ctx);
  const parts = activeParts(qs.map((q) => ({ type: q.type, points: q.points })));
  const blocks: Block[] = [];

  blocks.push(p([run('ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM', { bold: true, size: 30 })], { align: 'center', after: 40 }));
  blocks.push(p([run(clean(input.info.title).toUpperCase(), { bold: true })], { align: 'center', after: 40 }));
  blocks.push(
    p(
      [run(`Môn: ${clean(input.info.subject)} — Lớp ${input.info.grade} — Thời gian làm bài: ${input.info.durationMinutes} phút — Thang điểm ${fmtPoints(input.structure.totalScore)}`, { italic: true, size: 22 })],
      { align: 'center', after: 120 },
    ),
  );

  for (const part of parts) {
    const inPart = qs.filter((q) => q.type === part.type);
    blocks.push(keyHeading(`PHẦN ${part.roman}. ${PART_NAME[part.type].replace(/\.$/, '')} (${fmtPoints(part.points)} điểm)`));

    if (part.type === 'mcq') {
      const uniform = new Set(inPart.map((q) => q.points)).size === 1 ? inPart[0]!.points : null;
      if (uniform) blocks.push(p([run(`Mỗi câu trả lời đúng được ${fmtPoints(uniform)} điểm.`, { italic: true, size: 22 })], { after: 60 }));
      const perRow = 10;
      for (let i = 0; i < inPart.length; i += perRow) {
        const chunk = inPart.slice(i, i + perRow);
        const w0 = 1300;
        const w = Math.floor((W - w0) / perRow);
        const widths = [w0, ...Array(chunk.length).fill(w)];
        blocks.push(
          gridTable(widths, [
            [hdr('Câu'), ...chunk.map((q) => hdr(String(q.number)))],
            [cell([p([run('Đáp án', { bold: true })], { align: 'center' })]), ...chunk.map((q) => cell(q.correct ?? ''))],
          ]),
        );
      }
    }

    if (part.type === 'tf') {
      const w0 = 1000;
      const wLast = 1700;
      const w = Math.floor((W - w0 - wLast) / 4);
      blocks.push(
        gridTable(
          [w0, w, w, w, W - w0 - wLast - w * 3, wLast],
          [
            [hdr('Câu'), hdr('Ý a)'), hdr('Ý b)'), hdr('Ý c)'), hdr('Ý d)'), hdr('Điểm tối đa')],
            ...inPart.map((q) => [
              cell(String(q.number)),
              ...(['a', 'b', 'c', 'd'] as const).map((lab) => {
                const s = (q.statements ?? []).find((x) => x.label === lab);
                return cell(s ? (s.isTrue ? 'Đúng' : 'Sai') : '');
              }),
              cell(fmtPoints(q.points)),
            ]),
          ],
        ),
      );
      blocks.push(p([run(tfScoringText(input.structure.tfScoring), { size: 22 })], { after: 60 }));
      const sample = inPart[0]?.points ?? 1;
      const tbl = tfScoringTable(sample, input.structure.tfScoring);
      const uniform = new Set(inPart.map((q) => q.points)).size === 1;
      blocks.push(
        gridTable(
          [2800, 2400],
          [
            [hdr('Số ý trả lời đúng'), hdr(uniform ? `Điểm (câu ${fmtPoints(sample)} điểm)` : 'Điểm (câu 1 điểm → nhân theo điểm của câu)')],
            ...tbl.map((r) => [cell(`${r.correct} ý`), cell(fmtPoints(r.score))]),
          ],
        ),
      );
    }

    if (part.type === 'short') {
      blocks.push(
        gridTable(
          [1100, W - 1100 - 1600, 1600],
          [
            [hdr('Câu'), hdr('Đáp án'), hdr('Điểm')],
            ...inPart.map((q) => [cell(String(q.number)), cell([p(clean(q.answer), { align: 'center' })]), cell(fmtPoints(q.points))]),
          ],
        ),
      );
    }

    if (part.type === 'essay') {
      for (const q of inPart) {
        blocks.push(p([run(`Câu ${q.number}. (${fmtPoints(q.points)} điểm) `, { bold: true }), run(clean(q.stem).replace(/\n+/g, ' '))], { before: 100, after: 60, keepNext: true, align: 'justify' }));
        const rub = q.rubric ?? [];
        blocks.push(
          gridTable(
            [700, W - 700 - 1200, 1200],
            [
              [hdr('Ý'), hdr('Nội dung / hướng dẫn chấm'), hdr('Điểm')],
              ...rub.map((r, i) => [cell(String(i + 1)), cell(textParas(clean(r.content), { align: 'left' })), cell(fmtPoints(r.points))]),
              [cell(''), cell([p([run('Tổng', { bold: true })], { align: 'right' })]), cell([p([run(fmtPoints(sumPoints(rub.map((r) => r.points))), { bold: true })], { align: 'center' })])],
            ],
          ),
        );
      }
    }
  }

  // Lời giải tham khảo
  const withSolution = qs.filter((q) => clean(q.solution));
  if (withSolution.length > 0) {
    blocks.push(keyHeading('HƯỚNG DẪN GIẢI (tham khảo)'));
    for (const q of withSolution) {
      const part = parts.find((x) => x.type === q.type)!;
      blocks.push(...textParas(clean(q.solution), { align: 'justify', indent: 300, after: 40 }, [run(`Phần ${part.roman} – Câu ${q.number}: `, { bold: true })]));
    }
  }

  blocks.push(p([run('Học sinh có cách giải khác đúng vẫn được điểm tối đa của ý tương ứng.', { italic: true, size: 22 })], { before: 160, align: 'left' }));

  return {
    id: 'key',
    title: DOC_TITLES.key,
    filename: `dap-an_${slugify(examLabel(input))}.docx`,
    orientation: 'portrait',
    baseSize: 24,
    footer: FONT_NOTE,
    blocks,
  };
}

export function buildAllDocuments(ctx: DocContext): DocModel[] {
  return [buildMatrixDoc(ctx), buildSpecDoc(ctx), buildExamDoc(ctx), buildKeyDoc(ctx)];
}

/** Gom toàn bộ chữ trong một tài liệu (dùng cho kiểm thử và kiểm tra "đề học sinh không lộ đáp án"). */
export function docPlainText(doc: DocModel): string {
  const out: string[] = [];
  const addPara = (pp: Para) => out.push(pp.runs.map((r) => r.text).join(''));
  const walk = (b: Block) => {
    if (b.kind === 'p') addPara(b);
    else if (b.kind === 'table') for (const row of b.rows) for (const c of row) c.paras.forEach(addPara);
  };
  doc.blocks.forEach(walk);
  return out.join('\n');
}
