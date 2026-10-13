/**
 * Hiển thị mô hình tài liệu thành HTML (xem trước và in A4). Cùng mô hình với tệp .docx.
 */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MARGINS, type Block, type Cell, type DocModel, type Para, type Table } from '../../shared/docmodel.js';

const pt = (twip: number) => `${twip / 20}pt`;
const mm = (twip: number) => `${(twip / 56.69).toFixed(2)}mm`;

function ParaView({ p, baseSize }: { p: Para; baseSize: number }) {
  const style: React.CSSProperties = {
    textAlign: p.align ?? 'left',
    paddingLeft: p.indent ? pt(p.indent) : undefined,
    textIndent: p.hanging ? `-${pt(p.hanging)}` : undefined,
    marginTop: p.before ? pt(p.before) : undefined,
    marginBottom: pt(p.after ?? 40),
    breakAfter: p.keepNext ? 'avoid' : undefined,
    fontSize: `${baseSize / 2}pt`,
  };
  const empty = p.runs.length === 0 || p.runs.every((r) => r.text === '');
  return (
    <p style={style}>
      {empty
        ? ' '
        : p.runs.map((r, i) => (
            <span
              key={i}
              style={{
                fontWeight: r.bold ? 700 : undefined,
                fontStyle: r.italic ? 'italic' : undefined,
                textDecoration: r.underline ? 'underline' : undefined,
                fontSize: r.size ? `${r.size / 2}pt` : undefined,
                color: r.color ? `#${r.color}` : undefined,
              }}
            >
              {r.text}
            </span>
          ))}
    </p>
  );
}

function CellView({ c, size, pad, bordered }: { c: Cell; size: number; pad: number; bordered: boolean }) {
  return (
    <td
      colSpan={c.colSpan}
      rowSpan={c.rowSpan}
      style={{
        background: c.shade ? `#${c.shade}` : undefined,
        verticalAlign: c.vAlign === 'center' ? 'middle' : 'top',
        padding: `${pt(pad)} ${pt(pad + 20)}`,
        border: bordered ? '0.5pt solid #000' : 'none',
      }}
    >
      {c.paras.map((p, i) => (
        <ParaView key={i} p={p} baseSize={size} />
      ))}
    </td>
  );
}

function TableView({ t, baseSize }: { t: Table; baseSize: number }) {
  const total = t.widths.reduce((a, b) => a + b, 0);
  const size = t.size ?? baseSize;
  const pad = t.cellPadding ?? 60;
  const bordered = t.borders !== 'none';
  const head = t.rows.slice(0, t.headerRows ?? 0);
  const body = t.rows.slice(t.headerRows ?? 0);
  const renderRows = (rows: Cell[][], keyPrefix: string) =>
    rows.map((row, ri) => (
      <tr key={`${keyPrefix}${ri}`}>
        {row.map((c, ci) => (
          <CellView key={ci} c={c} size={size} pad={pad} bordered={bordered} />
        ))}
      </tr>
    ));
  return (
    <table className={bordered ? 'bordered' : undefined} style={{ marginBottom: '2pt' }}>
      <colgroup>
        {t.widths.map((w, i) => (
          <col key={i} style={{ width: `${((w / total) * 100).toFixed(3)}%` }} />
        ))}
      </colgroup>
      {head.length > 0 && <thead>{renderRows(head, 'h')}</thead>}
      <tbody>{renderRows(body, 'b')}</tbody>
    </table>
  );
}

export function BlockView({ b, baseSize }: { b: Block; baseSize: number }) {
  if (b.kind === 'p') return <ParaView p={b} baseSize={baseSize} />;
  if (b.kind === 'table') return <TableView t={b} baseSize={baseSize} />;
  return <div style={{ breakAfter: 'page' }} />;
}

export function DocSheet({ doc, forPrint = false }: { doc: DocModel; forPrint?: boolean }) {
  const m = MARGINS[doc.orientation];
  const widthMm = doc.orientation === 'portrait' ? 210 : 297;
  const heightMm = doc.orientation === 'portrait' ? 297 : 210;
  const style: React.CSSProperties = forPrint
    ? {}
    : {
        width: `${widthMm}mm`,
        minHeight: `${heightMm}mm`,
        padding: `${mm(m.top)} ${mm(m.right)} ${mm(m.bottom)} ${mm(m.left)}`,
      };
  return (
    <div className="doc-sheet" style={style} data-doc={doc.id}>
      {doc.blocks.map((b, i) => (
        <BlockView key={i} b={b} baseSize={doc.baseSize} />
      ))}
      {doc.footer && forPrint && (
        <p style={{ textAlign: 'center', fontSize: '7.5pt', color: '#666', marginTop: '10pt' }}>{doc.footer}</p>
      )}
    </div>
  );
}

/** Thu nhỏ trang A4 vừa chiều rộng khung chứa (dùng thuộc tính zoom nên bố cục vẫn đúng). */
export function FitPage({ doc }: { doc: DocModel }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const pagePx = (doc.orientation === 'portrait' ? 210 : 297) * 3.7795;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, (el.clientWidth - 2) / pagePx));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pagePx]);

  return (
    <div ref={wrapRef} className="w-full overflow-hidden rounded-lg bg-slate-200/70 p-0 py-3">
      <div style={{ zoom: scale }}>
        <DocSheet doc={doc} />
      </div>
    </div>
  );
}

/**
 * Vùng in: chỉ hiện khi in (CSS @media print). Khi `doc` có giá trị, đặt kích thước trang A4
 * đúng hướng, mở hộp thoại in của trình duyệt, rồi dọn dẹp.
 */
export function PrintHost({ doc, onDone }: { doc: DocModel | null; onDone: () => void }) {
  useEffect(() => {
    if (!doc) return;
    const m = MARGINS[doc.orientation];
    const style = document.createElement('style');
    style.id = 'print-page-style';
    style.textContent = `@page { size: A4 ${doc.orientation}; margin: ${mm(m.top)} ${mm(m.right)} ${mm(m.bottom)} ${mm(m.left)}; }`;
    document.head.appendChild(style);
    const prevTitle = document.title;
    document.title = doc.filename.replace(/\.docx$/, '');

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      style.remove();
      document.title = prevTitle;
      window.removeEventListener('afterprint', finish);
      onDone();
    };
    window.addEventListener('afterprint', finish);
    const t = setTimeout(() => window.print(), 150);
    return () => {
      clearTimeout(t);
      finish();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  return <div className="print-host">{doc && <DocSheet doc={doc} forPrint />}</div>;
}
