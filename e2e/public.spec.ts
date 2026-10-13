/**
 * Kiểm thử URL CÔNG KHAI với Gemini THẬT, trong trình duyệt sạch (không đăng nhập, không cookie).
 * Chạy:  E2E_BASE_URL=https://soan-de-kiem-tra-dinh-ki.vercel.app npx playwright test e2e/public.spec.ts --project=desktop
 */
import fs from 'node:fs';
import JSZip from 'jszip';
import { expect, test } from '@playwright/test';
import { readPdf } from './pdf.js';

test.skip(!process.env.E2E_BASE_URL, 'Chỉ chạy khi có E2E_BASE_URL (URL công khai)');
test.setTimeout(20 * 60_000);

const LONG = { timeout: 290_000 };
const textOf = (xml: string) => [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join(' ');

test('URL công khai: mở trang, tạo đề bằng Gemini thật, tải tài liệu', async ({ page, request, context }) => {
  fs.mkdirSync('out/public', { recursive: true });
  const log = (m: string) => console.log(`[public] ${m}`);
  const t0 = Date.now();
  const lap = (what: string) => log(`${what} — ${((Date.now() - t0) / 1000).toFixed(0)}s từ lúc bắt đầu`);

  // 0. Phiên không đăng nhập: không có cookie nào
  expect(await context.cookies()).toHaveLength(0);

  // 1. Trang mở được + sức khỏe
  const health = await request.get('/api/health');
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ ok: true, aiConfigured: true });
  const resp = await page.goto('/');
  expect(resp!.status()).toBe(200);
  expect(page.url()).not.toMatch(/vercel\.com\/(login|sso)|_vercel\/sso/);
  await expect(page.getByRole('heading', { name: 'Soạn đề kiểm tra định kì' })).toBeVisible();
  await expect(page.getByText('Công cụ hỗ trợ giáo viên soạn đề, tham khảo phụ lục Công văn 7991; giáo viên chịu trách nhiệm rà soát và duyệt.').first()).toBeVisible();
  await expect(page.getByText(/Máy chủ chưa được cấu hình khóa Gemini/)).toHaveCount(0);
  await page.screenshot({ path: 'out/public/01-home.png', fullPage: true });
  lap('trang chủ mở được');

  // 2. Ví dụ → ma trận bằng AI thật
  await page.getByRole('button', { name: /Thử với ví dụ/ }).click();
  await expect(page.getByLabel('Nội dung nguồn')).toHaveValue(/HÀM SỐ BẬC HAI/);
  await page.getByRole('button', { name: /Kiểm tra & tạo ma trận bằng AI/ }).click();
  await expect(page.getByText('Bản nháp — chưa xác nhận')).toBeVisible(LONG);
  lap('AI đã tạo ma trận');
  await expect(page.getByText(/Ma trận qua kiểm tra bằng mã/)).toBeVisible();
  const rows = await page.locator('input[id^="topic-"]').count();
  expect(rows).toBeGreaterThanOrEqual(3);
  await page.screenshot({ path: 'out/public/02-matrix.png', fullPage: true });
  await page.getByRole('button', { name: 'Xác nhận ma trận' }).click();
  await expect(page.getByText('Đã xác nhận (khóa)')).toBeVisible();

  // 3. Câu hỏi bằng AI thật
  await page.getByRole('button', { name: /Tiếp tục: tạo câu hỏi/ }).click();
  await page.getByRole('button', { name: 'Tạo câu hỏi bằng AI' }).click();
  await expect(page.locator('article[data-question]').first()).toBeVisible(LONG);
  lap('AI đã tạo câu hỏi');
  await expect(page.locator('article[data-question]')).toHaveCount(21);
  const errored = await page.locator('article[data-question][data-state="error"]').count();
  const checks = await page.locator('[data-check]').evaluateAll((els) => els.map((e) => `${e.getAttribute('data-check')}=${e.getAttribute('data-ok')}`));
  log(`kiểm tra bằng mã: ${checks.join(', ')}; số câu lỗi: ${errored}`);
  expect(errored).toBe(0);
  for (const c of checks) expect(c.endsWith('=true')).toBe(true);
  await page.screenshot({ path: 'out/public/03-questions.png', fullPage: true });

  // 3b. AI rà soát thêm (lời gọi AI thật thứ ba, tuỳ chọn)
  await page.getByRole('button', { name: 'Nhờ AI rà soát thêm' }).click();
  await expect(page.getByText(/AI rà soát:/)).toBeVisible(LONG);
  const aiWarn = await page.getByText(/Cảnh báo AI \(tham khảo\)/).count();
  log(`AI rà soát xong, số cảnh báo tham khảo: ${aiWarn}`);

  // 3c. Tạo lại riêng một câu bằng AI thật
  const card = page.locator('article[data-question="mcq-2"]');
  const before = await card.innerText();
  await card.getByRole('button', { name: 'Tạo lại riêng câu này' }).click();
  await expect(page.getByText('Đã tạo lại câu 2')).toBeVisible(LONG);
  expect(await card.getAttribute('data-state')).not.toBe('error');
  lap(`tạo lại riêng một câu xong (nội dung ${before === (await card.innerText()) ? 'giống' : 'khác'} bản trước)`);

  // 4. Duyệt
  await page.getByRole('button', { name: /Xem trước & duyệt đề/ }).click();
  await expect(page.getByRole('heading', { name: 'Xem trước và duyệt đề' })).toBeVisible();
  await page.getByLabel(/Tôi đã rà soát nội dung, đáp án/).check();
  await page.getByRole('button', { name: 'Duyệt đề', exact: true }).click();
  await expect(page.getByText('Đề đã được duyệt')).toBeVisible();
  await page.screenshot({ path: 'out/public/04-review.png', fullPage: true });

  // 5. Tải 4 tài liệu
  await page.getByRole('button', { name: /Tải về \/ in/ }).click();
  const files: Record<string, string> = {};
  for (const id of ['matrix', 'spec', 'exam', 'key']) {
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId(`download-${id}`).click()]);
    const path = `out/public/${dl.suggestedFilename()}`;
    await dl.saveAs(path);
    files[id] = path;
    const buf = fs.readFileSync(path);
    expect(buf.subarray(0, 2).toString()).toBe('PK');
    expect(buf.byteLength).toBeGreaterThan(8_000);
    log(`đã tải ${dl.suggestedFilename()} (${buf.byteLength} byte)`);
  }
  const doc = async (p: string) => textOf(await (await JSZip.loadAsync(fs.readFileSync(p))).file('word/document.xml')!.async('string'));
  const exam = await doc(files.exam!);
  const key = await doc(files.key!);
  const matrix = await doc(files.matrix!);
  const spec = await doc(files.spec!);

  // Đề học sinh: không lộ đáp án / lời giải / ý chấm (so với dữ liệu thật trong bản nháp)
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('soan-de-kiem-tra.v1')!));
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
  const examN = norm(exam);
  let leaks = 0;
  for (const q of state.questions as { solution: string; rubric?: { content: string }[] }[]) {
    if (q.solution && q.solution.length > 25 && examN.includes(norm(q.solution))) leaks++;
    for (const r of q.rubric ?? []) if (r.content.length > 25 && examN.includes(norm(r.content))) leaks++;
  }
  expect(leaks).toBe(0);
  expect(exam).not.toMatch(/Đáp án|Hướng dẫn chấm/i);
  expect(exam).toContain('PHẦN I.');
  expect(exam).toContain('Câu 12.');
  expect(exam).toMatch(/[ạảãàáâậầấẩẫăắằẳẵặẹẻẽềếểễệỉịọỏõồốổỗộờớởỡợụủũừứửữựỳỵỷỹđ]/); // có dấu tiếng Việt
  expect(key).toContain('ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM');
  expect(matrix).toContain('MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ');
  expect(matrix).toContain('10,0');
  expect(spec).toContain('Yêu cầu cần đạt');
  log(`đề học sinh ${exam.length} ký tự, không lộ đáp án; ma trận/đặc tả/đáp án có nội dung`);

  const [zdl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('download-zip').click()]);
  await zdl.saveAs('out/public/bon-tai-lieu.zip');
  const zip = await JSZip.loadAsync(fs.readFileSync('out/public/bon-tai-lieu.zip'));
  expect(Object.keys(zip.files).filter((n) => n.endsWith('.docx'))).toHaveLength(4);

  // 5b. In / lưu PDF A4 từ URL công khai
  await page.evaluate(() => {
    (window as unknown as { __printed: number }).__printed = 0;
    window.print = () => {
      (window as unknown as { __printed: number }).__printed++;
    };
  });
  await page.getByTestId('print-exam').click();
  await page.waitForFunction(() => (window as unknown as { __printed: number }).__printed > 0);
  await page.emulateMedia({ media: 'print' });
  const pdf = await readPdf(await page.pdf({ preferCSSPageSize: true, printBackground: true }));
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  expect(pdf.widthPt).toBeCloseTo(595.3, 0);
  expect(pdf.heightPt).toBeCloseTo(841.9, 0);
  expect(pdf.text).toContain('PHẦN I');
  expect(pdf.text).not.toMatch(/Đáp án|Hướng dẫn chấm/);
  log(`PDF đề học sinh: ${pdf.pages} trang A4`);
  await page.screenshot({ path: 'out/public/05-export.png', fullPage: true });

  // 6. Bản nháp còn nguyên sau khi tải lại trang
  await page.reload();
  await expect(page.getByTestId('step-5')).toBeEnabled();
  lap('hoàn tất toàn bộ luồng');
});
