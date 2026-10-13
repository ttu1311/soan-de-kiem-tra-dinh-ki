import fs from 'node:fs';
import JSZip from 'jszip';
import { expect, test, type Page } from '@playwright/test';
import { approve, confirmMatrix, createMatrix, createQuestions, fresh, fullFlow, loadExample, mockCalls, resetMock, toReview } from './helpers.js';
import { readPdf } from './pdf.js';

async function docxXml(path: string): Promise<{ xml: string; names: string[] }> {
  const zip = await JSZip.loadAsync(fs.readFileSync(path));
  return { xml: await zip.file('word/document.xml')!.async('string'), names: Object.keys(zip.files) };
}
const textOf = (xml: string) => [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join(' ');

test.describe('luồng đầy đủ Toán 10 — Hàm số bậc hai', () => {
  test.beforeEach(async () => {
    await resetMock();
  });

  test('từ ví dụ → ma trận → câu hỏi → duyệt → tải 4 tài liệu .docx', async ({ page }) => {
    await fullFlow(page);

    // Hai lời gọi AI riêng biệt (ma trận, câu hỏi) — chưa có lời gọi nào khác
    const calls = await mockCalls();
    expect(calls.matrix).toBe(1);
    expect(calls.questions).toBe(1);

    await page.getByRole('button', { name: /Tải về \/ in/ }).click();
    await expect(page.getByRole('heading', { name: 'Tải về và in' })).toBeVisible();

    const files: Record<string, string> = {};
    for (const id of ['matrix', 'spec', 'exam', 'key']) {
      const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId(`download-${id}`).click()]);
      const path = `out/e2e/${dl.suggestedFilename()}`;
      await dl.saveAs(path);
      files[id] = path;
      expect(dl.suggestedFilename()).toMatch(/\.docx$/);
    }

    // Tệp .docx THẬT (gói Office Open XML), không phải HTML đổi đuôi
    for (const path of Object.values(files)) {
      const head = fs.readFileSync(path).subarray(0, 2).toString();
      expect(head).toBe('PK');
      const { names } = await docxXml(path);
      expect(names).toContain('word/document.xml');
    }

    const exam = textOf((await docxXml(files.exam!)).xml);
    expect(exam).toContain('PHẦN I.');
    expect(exam).toContain('Câu 12.');
    expect(exam).toContain('Hàm số nào sau đây là hàm số bậc hai?');
    expect(exam).toContain('Tọa độ đỉnh I của parabol');
    // đề học sinh: không lộ đáp án / lời giải / ý chấm
    expect(exam).not.toMatch(/Đáp án|Hướng dẫn chấm/i);
    expect(exam).not.toContain('Đỉnh I(1; −4)');
    expect(exam).not.toContain('x_I = −b/(2a) = 2');
    expect(exam).not.toContain('Hoành độ đỉnh x = −b/(2a) = 1');

    const key = textOf((await docxXml(files.key!)).xml);
    expect(key).toContain('ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM');
    expect(key).toContain('Hoành độ đỉnh x = −b/(2a) = 1');
    expect(key).toMatch(/đúng 1 ý được 10%/);

    const matrix = textOf((await docxXml(files.matrix!)).xml);
    expect(matrix).toContain('MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ');
    expect(matrix).toContain('Khái niệm hàm số bậc hai');
    expect(matrix).toContain('10,0');
    const spec = textOf((await docxXml(files.spec!)).xml);
    expect(spec).toContain('Yêu cầu cần đạt');
    expect(spec).toContain('Nhận biết được hàm số bậc hai');

    // Gói zip
    const [zdl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('download-zip').click()]);
    await zdl.saveAs('out/e2e/bon-tai-lieu.zip');
    const zip = await JSZip.loadAsync(fs.readFileSync('out/e2e/bon-tai-lieu.zip'));
    expect(Object.keys(zip.files).filter((n) => n.endsWith('.docx'))).toHaveLength(4);
  });

  test('in / lưu PDF: bố cục A4 đúng hướng, có tiếng Việt, đề học sinh không có đáp án', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __printed: number }).__printed = 0;
      window.print = () => {
        (window as unknown as { __printed: number }).__printed++;
      };
    });
    await fullFlow(page);
    await page.getByRole('button', { name: /Tải về \/ in/ }).click();

    const pdfFor = async (id: string) => {
      await page.getByTestId(`print-${id}`).click();
      await page.waitForFunction(() => (window as unknown as { __printed: number }).__printed > 0);
      await page.emulateMedia({ media: 'print' });
      const buf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
      fs.writeFileSync(`out/e2e/in-${id}.pdf`, buf);
      await page.emulateMedia({ media: 'screen' });
      await page.evaluate(() => {
        (window as unknown as { __printed: number }).__printed = 0;
        window.dispatchEvent(new Event('afterprint'));
      });
      await expect(page.locator('.print-host .doc-sheet')).toHaveCount(0);
      return readPdf(buf);
    };

    const exam = await pdfFor('exam');
    expect(exam.widthPt).toBeCloseTo(595.3, 0); // A4 dọc
    expect(exam.heightPt).toBeCloseTo(841.9, 0);
    expect(exam.pages).toBeGreaterThanOrEqual(2);
    expect(exam.text).toContain('PHẦN I');
    expect(exam.text).toContain('Hàm số nào sau đây là hàm số bậc hai');
    expect(exam.text).not.toMatch(/Đáp án|đáp án|Hướng dẫn chấm|Lời giải/);
    // chữ có dấu không bị vỡ
    expect(exam.text).toContain('KIỂM TRA ĐỊNH KÌ');
    expect(exam.text).not.toContain('�');

    const matrix = await pdfFor('matrix');
    expect(matrix.widthPt).toBeCloseTo(841.9, 0); // A4 ngang
    expect(matrix.heightPt).toBeCloseTo(595.3, 0);
    expect(matrix.text).toContain('MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ');
    expect(matrix.text).toContain('Nhiều lựa chọn');

    const key = await pdfFor('key');
    expect(key.text).toContain('ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM');
    const spec = await pdfFor('spec');
    expect(spec.text).toContain('Yêu cầu cần đạt');
  });

  test('bản nháp được giữ khi tải lại trang; "Bài mới" xóa sạch', async ({ page }) => {
    await fresh(page);
    await loadExample(page);
    await createMatrix(page);
    await confirmMatrix(page);
    await page.reload();
    await expect(page.getByText('Đã khôi phục bản nháp')).toBeVisible();
    await expect(page.getByText('Đã xác nhận (khóa)')).toBeVisible();
    await expect(page.getByTestId('step-3')).toBeEnabled();
    await page.getByTestId('step-1').click();
    await expect(page.getByLabel('Nội dung nguồn')).toHaveValue(/HÀM SỐ BẬC HAI/);

    await page.getByRole('button', { name: 'Bài mới' }).click();
    await page.getByRole('button', { name: 'Xóa và bắt đầu mới' }).click();
    await expect(page.getByLabel('Nội dung nguồn')).toHaveValue('');
    await expect(page.getByTestId('step-2')).toBeDisabled();
  });

  test('Mở khóa ma trận phải xác nhận và xóa câu hỏi; ma trận đã duyệt không bị đổi âm thầm', async ({ page }) => {
    await fresh(page);
    await loadExample(page);
    await createMatrix(page);
    await confirmMatrix(page);
    // Ma trận đã khóa: không sửa được
    await expect(page.getByLabel('Số câu Nhiều lựa chọn mức Biết, hàng 1', { exact: true })).toBeDisabled();
    await createQuestions(page);
    await page.getByTestId('step-2').click();
    await page.getByRole('button', { name: 'Mở khóa để sửa ma trận' }).click();
    await expect(page.getByRole('alertdialog')).toContainText('Các câu hỏi đã tạo');
    await page.getByRole('button', { name: 'Hủy' }).click();
    await expect(page.getByText('Đã xác nhận (khóa)')).toBeVisible();
    await page.getByRole('button', { name: 'Mở khóa để sửa ma trận' }).click();
    await page.getByRole('button', { name: 'Mở khóa', exact: true }).click();
    await expect(page.getByText('Bản nháp — chưa xác nhận')).toBeVisible();
    await expect(page.getByTestId('step-3')).toBeDisabled();
  });

  test('tạo lại riêng một câu không đổi ma trận và không đổi các câu khác', async ({ page }) => {
    await fresh(page);
    await loadExample(page);
    await createMatrix(page);
    await confirmMatrix(page);
    await createQuestions(page);
    const snapshot = () =>
      page.evaluate(() => {
        const st = JSON.parse(localStorage.getItem('soan-de-kiem-tra.v1') ?? '{}');
        return { matrix: JSON.stringify(st.confirmedMatrix), others: JSON.stringify(st.questions.filter((q: { id: string }) => q.id !== 'mcq-2')) };
      });
    await page.waitForTimeout(600); // chờ tự lưu
    const before = await snapshot();
    expect(before.matrix).toContain('Khái niệm hàm số bậc hai');
    const card = page.locator('article[data-question="mcq-2"]');
    await card.getByRole('button', { name: 'Tạo lại riêng câu này' }).click();
    await expect(page.getByText('Đã tạo lại câu 2')).toBeVisible();
    expect((await mockCalls()).question).toBe(1);
    await page.waitForTimeout(600);
    const after = await snapshot();
    expect(after.matrix).toBe(before.matrix);
    expect(after.others).toBe(before.others);
  });
});

async function stepToQuestions(page: Page) {
  await fresh(page);
  await loadExample(page);
  await createMatrix(page);
  await confirmMatrix(page);
  await createQuestions(page);
}
export { stepToQuestions, toReview, approve };
