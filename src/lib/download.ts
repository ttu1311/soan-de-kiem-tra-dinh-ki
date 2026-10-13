import type { DocModel } from '../../shared/docmodel.js';

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function downloadDocx(doc: DocModel): Promise<void> {
  // Nạp thư viện docx khi cần để trang tải nhanh hơn
  const { docxBlob } = await import('./docx.js');
  saveBlob(await docxBlob(doc), doc.filename);
}

export async function downloadAllZip(docs: DocModel[], zipName: string): Promise<void> {
  const [{ default: JSZip }, { docxBlob }] = await Promise.all([import('jszip'), import('./docx.js')]);
  const zip = new JSZip();
  for (const d of docs) zip.file(d.filename, await docxBlob(d));
  saveBlob(await zip.generateAsync({ type: 'blob' }), zipName);
}
