/**
 * Tạo 4 tệp .docx mẫu từ dữ liệu kiểm thử vào thư mục out/ để mở xem bằng Word/Pages/Quick Look.
 * Chạy: npx tsx scripts/make-sample-docs.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { buildAllDocuments } from '../shared/documents.js';
import { docxBuffer } from '../src/lib/docx.js';
import { input, matrix, validQuestions } from '../tests/helpers.js';

mkdirSync('out', { recursive: true });
const docs = buildAllDocuments({ input: input(), matrix: matrix(), questions: validQuestions() });
for (const d of docs) {
  writeFileSync(`out/${d.filename}`, await docxBuffer(d));
  console.log('wrote', d.filename);
}
