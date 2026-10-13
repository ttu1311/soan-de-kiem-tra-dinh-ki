import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface PdfInfo {
  pages: number;
  widthPt: number;
  heightPt: number;
  text: string;
}

export async function readPdf(buf: Buffer | Uint8Array): Promise<PdfInfo> {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;
  let text = '';
  let widthPt = 0;
  let heightPt = 0;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    if (i === 1) {
      const v = page.getViewport({ scale: 1 });
      widthPt = v.width;
      heightPt = v.height;
    }
    const c = await page.getTextContent();
    text += c.items.map((it) => ('str' in it ? it.str : '')).join(' ') + '\n';
  }
  return { pages: doc.numPages, widthPt, heightPt, text };
}
