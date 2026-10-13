/**
 * Dựng tệp .docx THẬT (Office Open XML) từ mô hình tài liệu bằng thư viện `docx`.
 * Chạy được cả trong trình duyệt và Node (để kiểm thử).
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  LineRuleType,
  Packer,
  PageNumber,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  ShadingType,
  type FileChild,
} from 'docx';
import { A4, MARGINS, type Align, type Block, type Cell, type DocModel, type Para, type Run, type Table as TableModel } from '../../shared/docmodel.js';

const FONT = 'Times New Roman';

const ALIGN: Record<Align, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
};

function textRun(r: Run, baseSize: number): TextRun {
  return new TextRun({
    text: r.text,
    bold: r.bold,
    italics: r.italic,
    underline: r.underline ? {} : undefined,
    size: r.size ?? baseSize,
    color: r.color,
    font: { ascii: FONT, hAnsi: FONT, cs: FONT, eastAsia: FONT },
  });
}

function toParagraph(p: Para, baseSize: number): Paragraph {
  return new Paragraph({
    alignment: p.align ? ALIGN[p.align] : AlignmentType.LEFT,
    keepNext: p.keepNext,
    spacing: { before: p.before ?? 0, after: p.after ?? 40, line: 264, lineRule: LineRuleType.AUTO },
    indent: p.indent || p.hanging ? { left: p.indent ?? 0, hanging: p.hanging ?? 0 } : undefined,
    children: p.runs.length ? p.runs.map((r) => textRun(r, baseSize)) : [new TextRun({ text: '', size: baseSize })],
  });
}

const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } as const;
const LINE = { style: BorderStyle.SINGLE, size: 4, color: '000000' } as const;

function toTable(t: TableModel, baseSize: number): Table {
  const size = t.size ?? baseSize;
  const pad = t.cellPadding ?? 60;
  const total = t.widths.reduce((a, b) => a + b, 0);
  const border = t.borders === 'none' ? NONE : LINE;
  const borders = { top: border, bottom: border, left: border, right: border };

  const rows = t.rows.map((row, ri) => {
    let col = 0;
    const cells = row.map((c: Cell) => {
      const span = c.colSpan ?? 1;
      const width = t.widths.slice(col, col + span).reduce((a, b) => a + b, 0);
      col += span;
      return new TableCell({
        width: { size: width, type: WidthType.DXA },
        columnSpan: span > 1 ? span : undefined,
        rowSpan: c.rowSpan && c.rowSpan > 1 ? c.rowSpan : undefined,
        verticalAlign: c.vAlign === 'center' ? VerticalAlign.CENTER : VerticalAlign.TOP,
        shading: c.shade ? { type: ShadingType.CLEAR, fill: c.shade, color: 'auto' } : undefined,
        margins: { top: pad, bottom: pad, left: pad + 20, right: pad + 20 },
        borders,
        children: c.paras.length ? c.paras.map((p) => toParagraph(p, size)) : [new Paragraph({ children: [] })],
      });
    });
    return new TableRow({
      children: cells,
      tableHeader: t.headerRows ? ri < t.headerRows : false,
      cantSplit: true,
    });
  });

  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: t.widths,
    layout: TableLayoutType.FIXED,
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows,
  });
}

function toChildren(blocks: Block[], baseSize: number): FileChild[] {
  const out: FileChild[] = [];
  for (const b of blocks) {
    if (b.kind === 'p') out.push(toParagraph(b, baseSize));
    else if (b.kind === 'table') {
      out.push(toTable(b, baseSize));
      // Word cần một đoạn giữa hai bảng liền nhau; thêm đoạn rất nhỏ sau bảng
      out.push(new Paragraph({ spacing: { before: 0, after: 0, line: 20, lineRule: LineRuleType.EXACT }, children: [] }));
    } else out.push(new Paragraph({ pageBreakBefore: true, children: [] }));
  }
  return out;
}

export function buildDocx(doc: DocModel): Document {
  const landscape = doc.orientation === 'landscape';
  const m = MARGINS[doc.orientation];
  const footerChildren: Paragraph[] = [];
  if (doc.footer) {
    footerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
        children: [new TextRun({ text: doc.footer, size: 15, color: '666666', font: FONT })],
      }),
    );
  }
  footerChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Trang ', size: 18, font: FONT }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, font: FONT }),
        new TextRun({ text: ' / ', size: 18, font: FONT }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: FONT }),
      ],
    }),
  );

  return new Document({
    creator: 'Soạn đề kiểm tra định kì',
    title: doc.title,
    description: 'Tài liệu lập bằng công cụ hỗ trợ giáo viên soạn đề; giáo viên chịu trách nhiệm rà soát và duyệt.',
    styles: {
      default: {
        document: {
          run: { font: { ascii: FONT, hAnsi: FONT, cs: FONT, eastAsia: FONT }, size: doc.baseSize, language: { value: 'vi-VN' } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: A4.w,
              height: A4.h,
              orientation: landscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
            },
            margin: { top: m.top, bottom: m.bottom, left: m.left, right: m.right, footer: 400 },
          },
        },
        footers: { default: new Footer({ children: footerChildren }) },
        children: toChildren(doc.blocks, doc.baseSize),
      },
    ],
  });
}

export async function docxBlob(doc: DocModel): Promise<Blob> {
  return Packer.toBlob(buildDocx(doc));
}

export async function docxBuffer(doc: DocModel): Promise<Uint8Array> {
  return Packer.toBuffer(buildDocx(doc));
}
