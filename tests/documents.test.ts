import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { buildAllDocuments, buildExamDoc, buildKeyDoc, docPlainText } from '../shared/documents.js';
import { docxBuffer } from '../src/lib/docx.js';
import { compressRanges, slugify } from '../shared/docmodel.js';
import { moveShortToTf } from '../shared/blueprint.js';
import { input, matrix, validQuestions } from './helpers.js';

const ctx = () => ({ input: input(), matrix: matrix(), questions: validQuestions() });

async function unzipXml(doc: Parameters<typeof docxBuffer>[0]) {
  const buf = await docxBuffer(doc);
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file('word/document.xml')!.async('string');
  const footer = Object.keys(zip.files).filter((n) => n.startsWith('word/footer'));
  return { zip, xml, buf, footer };
}

function xmllintOk(xml: string): boolean {
  const dir = mkdtempSync(path.join(tmpdir(), 'xml-'));
  const f = path.join(dir, 'd.xml');
  writeFileSync(f, xml);
  try {
    execFileSync('xmllint', ['--noout', f], { stdio: 'pipe' });
    return true;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return true; // không có xmllint: bỏ qua
    return false;
  }
}

describe('bốn tài liệu', () => {
  it('dựng đủ 4 tài liệu, tên tệp .docx không dấu', () => {
    const docs = buildAllDocuments(ctx());
    expect(docs.map((d) => d.id)).toEqual(['matrix', 'spec', 'exam', 'key']);
    for (const d of docs) expect(d.filename).toMatch(/^[a-z0-9_.-]+\.docx$/);
    expect(slugify('Kiểm tra giữa kì — Đại số 10!')).toBe('kiem-tra-giua-ki-dai-so-10');
    expect(compressRanges([1, 2, 3, 5, 7, 8])).toBe('1–3, 5, 7, 8');
  });

  it('đề học sinh KHÔNG chứa đáp án, lời giải, ý chấm hay chữ "đáp án"', () => {
    const c = ctx();
    const text = docPlainText(buildExamDoc(c));
    for (const q of c.questions) {
      if (q.solution) expect(text).not.toContain(q.solution);
      if (q.answer) expect(text).not.toContain(`Đáp số: ${q.answer}`);
      for (const r of q.rubric ?? []) expect(text).not.toContain(r.content);
    }
    expect(text).not.toMatch(/đáp án|hướng dẫn chấm/i);
    // chữ "lời giải" chỉ xuất hiện trong lời dặn của phần tự luận ("trình bày lời giải đầy đủ")
    expect(text.match(/lời giải/gi)?.length).toBe(1);
    // nhưng có đủ câu hỏi, 4 phương án và 4 ý a-d
    expect(text).toContain('PHẦN I.');
    expect(text).toContain('PHẦN IV.');
    expect(text).toMatch(/Câu 12\./);
    expect(text).toContain('A. Phương án A của mcq-1');
    expect(text).toMatch(/a\) Khẳng định a của tf-1/);
    expect(text).toMatch(/d\) Khẳng định d của tf-1/);
    expect(text).toContain('Thời gian làm bài: 60 phút');
  });

  it('tệp .docx của đề học sinh cũng không có đáp án trong XML', async () => {
    const c = ctx();
    const { xml } = await unzipXml(buildExamDoc(c));
    for (const q of c.questions) {
      if (q.solution) expect(xml).not.toContain(q.solution);
      for (const r of q.rubric ?? []) expect(xml).not.toContain(r.content);
    }
    expect(xml).not.toMatch(/Đáp án|Lời giải|Hướng dẫn chấm/);
    expect(xml).not.toMatch(/Đáp án|Hướng dẫn chấm/i);
  });

  it('đáp án và hướng dẫn chấm có đủ đáp án, ý chấm và cách tính điểm Đúng–Sai', () => {
    const c = ctx();
    const text = docPlainText(buildKeyDoc(c));
    expect(text).toContain('ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM');
    expect(text).toContain('Mỗi câu trả lời đúng được 0,25 điểm.');
    expect(text).toMatch(/đúng 1 ý được 10%, 2 ý được 25%, 3 ý được 50%, đủ 4 ý được 100%/);
    for (const q of c.questions.filter((x) => x.type === 'essay')) {
      for (const r of q.rubric!) expect(text).toContain(r.content);
    }
    expect(text).toContain('2,5'); // đáp án trả lời ngắn
    expect(text).toContain('HƯỚNG DẪN GIẢI');
  });

  it('ma trận: tổng số câu, điểm và tỉ lệ đúng', () => {
    const docs = buildAllDocuments(ctx());
    const matrixText = docPlainText(docs[0]!);
    expect(matrixText).toContain('MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ');
    expect(matrixText).toContain('Tổng số câu');
    expect(matrixText).toContain('Tổng số điểm');
    expect(matrixText).toContain('10,0');
    expect(matrixText).toContain('100');
    expect(matrixText).toContain('Nhiều lựa chọn');
    expect(matrixText).toContain('“Đúng – Sai”');
    const specText = docPlainText(docs[1]!);
    expect(specText).toContain('Yêu cầu cần đạt');
    expect(specText).toContain('Biết: Nhận biết hàm số bậc hai');
    expect(specText).toContain('Vận dụng: Giải bài toán thực tiễn');
  });

  it('không có phần trả lời ngắn: các phần được đánh số lại I, II, III', () => {
    const c = ctx();
    c.input.structure = moveShortToTf(c.input.structure);
    c.matrix.rows.forEach((r) => (r.counts.short = { biet: 0, hieu: 0, van_dung: 0 }));
    // tạo lại câu hỏi cho cấu trúc mới
    const qs = validQuestions(c.input, c.matrix);
    const text = docPlainText(buildExamDoc({ ...c, questions: qs }));
    expect(text).toMatch(/PHẦN III\. Tự luận/);
    expect(text).not.toContain('trả lời ngắn');
  });

  it('tệp .docx hợp lệ: XML đúng chuẩn, tiếng Việt có dấu, hướng trang đúng', async () => {
    const docs = buildAllDocuments(ctx());
    for (const d of docs) {
      const { zip, xml, buf, footer } = await unzipXml(d);
      expect(buf.byteLength).toBeGreaterThan(5000);
      expect(Object.keys(zip.files)).toEqual(expect.arrayContaining(['[Content_Types].xml', 'word/document.xml', 'word/styles.xml']));
      expect(xmllintOk(xml)).toBe(true);
      expect(xml.toLowerCase()).toContain('hàm số bậc hai');
      expect(xml).toMatch(/Toán/);
      expect(xml).not.toMatch(/&amp;#|\\u00/); // không bị mã hoá hỏng
      expect(footer.length).toBeGreaterThan(0);
      const landscape = d.id === 'matrix' || d.id === 'spec';
      expect(xml.includes('w:orient="landscape"')).toBe(landscape);
      expect(xml).toContain(landscape ? 'w:w="16838"' : 'w:w="11906"');
    }
    const { xml } = await unzipXml(docs[0]!);
    expect(xml).toContain('w:vMerge'); // tiêu đề nhiều tầng gộp ô thật
    expect(xml).toContain('w:tblHeader');
  });
});
