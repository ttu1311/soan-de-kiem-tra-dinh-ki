import fs from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { approve, confirmMatrix, createMatrix, createQuestions, fresh, loadExample, mockCalls, resetMock, setMock, toReview } from './helpers.js';

const card = (page: Page, id: string) => page.locator(`article[data-question="${id}"]`);

async function toQuestions(page: Page) {
  await fresh(page);
  await loadExample(page);
  await createMatrix(page);
  await confirmMatrix(page);
  await createQuestions(page);
}

test.beforeEach(async () => {
  await resetMock();
});

test.describe('kiểm tra dữ liệu đầu vào', () => {
  test('thiếu nội dung nguồn: yêu cầu bổ sung, không gọi AI', async ({ page }) => {
    await fresh(page);
    await loadExample(page);
    await page.getByLabel('Nội dung nguồn').fill('');
    await page.getByRole('button', { name: /Kiểm tra & tạo ma trận bằng AI/ }).click();
    const alert = page.getByRole('alert').filter({ hasText: 'Chưa đủ dữ liệu để tạo đề' });
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Nội dung nguồn mới có 0 ký tự');
    await expect(alert).toContainText('không tự đoán nội dung sách giáo khoa');
    await expect(page.getByTestId('step-2')).toBeDisabled();
    expect((await mockCalls()).total).toBe(0);
  });

  test('thiếu yêu cầu cần đạt / môn / tên bài: báo từng mục, không gọi AI', async ({ page }) => {
    await fresh(page);
    await loadExample(page);
    await page.getByLabel('Yêu cầu cần đạt').first().fill('');
    await page.getByLabel(/Môn học/).fill('');
    await page.getByLabel(/Tên bài kiểm tra/).fill('');
    await page.getByRole('button', { name: /Kiểm tra & tạo ma trận bằng AI/ }).click();
    const alert = page.getByRole('alert').filter({ hasText: 'Chưa đủ dữ liệu để tạo đề' });
    await expect(alert).toContainText('chưa có yêu cầu cần đạt');
    await expect(alert).toContainText('Chưa nhập môn học');
    await expect(alert).toContainText('Chưa nhập tên bài kiểm tra');
    expect((await mockCalls()).total).toBe(0);
  });

  test('tổng điểm các dạng khác thang điểm: báo lỗi', async ({ page }) => {
    await fresh(page);
    await loadExample(page);
    await page.getByLabel('Tổng điểm Tự luận').fill('4');
    await expect(page.getByText(/Tổng các dạng = 11,0, phải bằng 10,0/)).toBeVisible();
    await page.getByRole('button', { name: /Kiểm tra & tạo ma trận bằng AI/ }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Chưa đủ dữ liệu' })).toContainText('Tổng điểm các dạng câu là 11,0');
    expect((await mockCalls()).total).toBe(0);
  });

  test('"Môn không dùng trả lời ngắn" chuyển toàn bộ điểm sang Đúng–Sai', async ({ page }) => {
    await fresh(page);
    await page.getByRole('button', { name: /Môn không dùng trả lời ngắn/ }).click();
    await expect(page.getByLabel('Tổng điểm Trắc nghiệm trả lời ngắn')).toHaveValue('0');
    await expect(page.getByLabel('Tổng điểm Trắc nghiệm Đúng – Sai')).toHaveValue('4');
    await expect(page.getByText(/Tổng các dạng = 10,0 điểm/)).toBeVisible();
  });
});

test.describe('lỗi khi gọi AI', () => {
  for (const [mode, expected] of [
    ['quota', /hết hạn mức/],
    ['overloaded', /quá tải/],
    ['badjson', /không đúng định dạng/],
    ['bad_key', /Khóa Gemini.*không hợp lệ/],
  ] as const) {
    test(`tạo ma trận gặp lỗi "${mode}": báo dễ hiểu, giữ nguyên dữ liệu, thử lại được`, async ({ page }) => {
      await fresh(page);
      await loadExample(page);
      await setMock(mode);
      await page.getByRole('button', { name: /Kiểm tra & tạo ma trận bằng AI/ }).click();
      const banner = page.getByRole('alert').filter({ hasText: 'Không tạo được ma trận' });
      await expect(banner).toBeVisible();
      await expect(banner).toContainText(expected);
      await expect(banner).not.toContainText(/stack|undefined|\[object/i);
      await expect(page.getByLabel('Nội dung nguồn')).toHaveValue(/HÀM SỐ BẬC HAI/); // không mất dữ liệu
      await expect(page.getByTestId('step-2')).toBeDisabled();
      await setMock('ok');
      await createMatrix(page); // thử lại thành công
    });
  }

  test('máy chủ ứng dụng không phản hồi (offline): thông báo lỗi mạng', async ({ page }) => {
    await fresh(page);
    await loadExample(page);
    await page.route('**/api/ai/matrix', (r) => r.abort('connectionrefused'));
    await page.getByRole('button', { name: /Kiểm tra & tạo ma trận bằng AI/ }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Không tạo được ma trận' })).toContainText('Không kết nối được tới máy chủ');
    await expect(page.getByLabel('Nội dung nguồn')).toHaveValue(/HÀM SỐ BẬC HAI/);
  });

  test('lỗi gọi AI khi tạo câu hỏi: giữ ma trận đã xác nhận, thử lại được', async ({ page }) => {
    await fresh(page);
    await loadExample(page);
    await createMatrix(page);
    await confirmMatrix(page);
    await page.getByRole('button', { name: /Tiếp tục: tạo câu hỏi/ }).click();
    await setMock('quota');
    await page.getByRole('button', { name: 'Tạo câu hỏi bằng AI' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Không tạo được câu hỏi' })).toContainText('hết hạn mức');
    await setMock('ok');
    await page.getByRole('button', { name: 'Tạo câu hỏi bằng AI' }).click();
    await expect(card(page, 'mcq-1')).toBeVisible();
    await page.getByTestId('step-2').click();
    await expect(page.getByText('Đã xác nhận (khóa)')).toBeVisible();
  });
});

test.describe('lỗi theo từng câu (kiểm tra bằng mã)', () => {
  test('thiếu đáp án: báo đúng câu, chặn duyệt, sửa xong mới duyệt được', async ({ page }) => {
    await setMock('no_answer');
    await toQuestions(page);
    const c = card(page, 'mcq-3');
    await expect(c).toHaveAttribute('data-state', 'error');
    await expect(c.getByLabel('Lỗi của câu 3')).toContainText('thiếu đáp án đúng (A/B/C/D)');
    await expect(card(page, 'mcq-4')).toHaveAttribute('data-state', 'ok');
    await expect(page.locator('[data-check="answers"]')).toHaveAttribute('data-ok', 'false');

    await toReview(page);
    await expect(page.getByText(/Chưa thể duyệt: còn 1 lỗi/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Duyệt đề', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('step-5')).toBeDisabled();

    await page.getByRole('button', { name: 'Về bước câu hỏi để sửa' }).click();
    await c.getByRole('button', { name: 'Sửa câu này' }).click();
    await c.getByLabel('Phương án A là đáp án đúng').check();
    await c.getByRole('button', { name: 'Lưu câu này' }).click();
    await expect(c).toHaveAttribute('data-state', 'ok');
    await expect(page.locator('[data-check="answers"]')).toHaveAttribute('data-ok', 'true');
    await toReview(page);
    await approve(page);
  });

  test('câu Đúng/Sai chỉ có ba ý: báo lỗi; AI được tự sửa 1 lần; sửa tay bằng "Thêm ý"', async ({ page }) => {
    await setMock('tf3');
    await toQuestions(page);
    // AI đã được yêu cầu sửa 1 lần (2 lời gọi) nhưng vẫn sai → lỗi hiển thị theo câu
    expect((await mockCalls()).questions).toBe(2);
    const c = card(page, 'tf-1');
    await expect(c.getByLabel('Lỗi của câu 1')).toContainText('phải có đúng 4 ý a, b, c, d (hiện có 3 ý)');
    await expect(page.locator('[data-check="tf"]')).toHaveAttribute('data-ok', 'false');
    await toReview(page);
    await expect(page.getByRole('button', { name: 'Duyệt đề', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Về bước câu hỏi để sửa' }).click();

    await c.getByRole('button', { name: 'Sửa câu này' }).click();
    await c.getByRole('button', { name: 'Thêm ý' }).click();
    await c.getByLabel('Nội dung ý d').fill('Hệ số a của hàm số bằng −3.');
    await c.getByLabel('Đáp án ý d').selectOption('false');
    await c.getByRole('button', { name: 'Lưu câu này' }).click();
    await expect(c).toHaveAttribute('data-state', 'ok');
    await expect(page.locator('[data-check="tf"]')).toHaveAttribute('data-ok', 'true');
  });

  test('câu Đúng/Sai ba ý: "Tạo lại riêng câu này" sửa được mà không đụng câu khác', async ({ page }) => {
    await setMock('tf3');
    await toQuestions(page);
    const c = card(page, 'tf-1');
    await expect(c).toHaveAttribute('data-state', 'error');
    await setMock('ok');
    await c.getByRole('button', { name: 'Tạo lại riêng câu này' }).click();
    await expect(c).toHaveAttribute('data-state', 'ok');
    expect((await mockCalls()).question).toBe(1);
  });

  test('ý chấm tự luận cộng sai điểm (tổng điểm sai): báo lỗi, sửa tay xong hết lỗi', async ({ page }) => {
    await setMock('bad_rubric');
    await toQuestions(page);
    const c = card(page, 'essay-1');
    await expect(c.getByLabel('Lỗi của câu 1')).toContainText('cộng lại 1,25 điểm, khác điểm của câu (1,0)');
    await expect(page.locator('[data-check="rubric"]')).toHaveAttribute('data-ok', 'false');
    await c.getByRole('button', { name: 'Sửa câu này' }).click();
    await c.getByLabel('Điểm ý chấm 1').fill('0,25');
    await c.getByRole('button', { name: 'Lưu câu này' }).click();
    await expect(c).toHaveAttribute('data-state', 'ok');
  });

  test('tổng điểm của đề bị lệch (mở tệp bản nháp đã bị sửa điểm): báo lỗi toàn đề, không cho duyệt', async ({ page }) => {
    await toQuestions(page);
    await page.waitForTimeout(600);
    const tampered = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem('soan-de-kiem-tra.v1')!);
      st.questions[0].points = 0.5; // 0,25 → 0,5
      st.approval = null;
      return JSON.stringify(st);
    });
    const path = 'out/e2e/ban-nhap-lech-diem.json';
    fs.writeFileSync(path, tampered);
    await page.getByTestId('draft-file-input').setInputFiles(path);
    await page.getByRole('button', { name: 'Mở bản nháp', exact: true }).last().click();
    await page.getByTestId('step-3').click();
    await expect(page.getByLabel('Lỗi toàn đề')).toContainText('Tổng điểm của đề là 10,25, khác thang điểm 10,0');
    await expect(page.locator('[data-check="total"]')).toHaveAttribute('data-ok', 'false');
    await expect(card(page, 'mcq-1').getByLabel('Lỗi của câu 1')).toContainText('khác điểm theo ma trận (0,25)');
    await toReview(page);
    await expect(page.getByRole('button', { name: 'Duyệt đề', exact: true })).toHaveCount(0);
  });

  test('mở tệp không phải bản nháp: báo lỗi dễ hiểu, không mất dữ liệu hiện tại', async ({ page }) => {
    await fresh(page);
    await loadExample(page);
    fs.writeFileSync('out/e2e/khong-phai-ban-nhap.json', '{"abc": 1}');
    await page.getByTestId('draft-file-input').setInputFiles('out/e2e/khong-phai-ban-nhap.json');
    await expect(page.getByText(/không đúng định dạng bản nháp/)).toBeVisible();
    await expect(page.getByLabel('Nội dung nguồn')).toHaveValue(/HÀM SỐ BẬC HAI/);
  });

  test('ma trận không hợp lệ (dạng có điểm mà không có câu): chặn xác nhận', async ({ page }) => {
    await fresh(page);
    await loadExample(page);
    await createMatrix(page);
    for (const [lvl, row] of [['Biết', 1], ['Hiểu', 2], ['Vận dụng', 2], ['Vận dụng', 3]] as const) {
      await page.getByLabel(`Số câu Trả lời ngắn mức ${lvl}, hàng ${row}`, { exact: true }).fill('0');
    }
    await expect(page.getByText(/Dạng "Trả lời ngắn" có 2,0 điểm nhưng ma trận chưa có câu nào/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Xác nhận ma trận' })).toBeDisabled();
  });
});

test.describe('duyệt đề quyết định việc xuất bản', () => {
  test('chưa duyệt thì không tải được; duyệt xong mở khóa; sửa sau duyệt thì hủy duyệt', async ({ page }) => {
    await toQuestions(page);
    await expect(page.getByTestId('step-5')).toBeDisabled();
    await toReview(page);
    await expect(page.getByRole('button', { name: 'Duyệt đề', exact: true })).toBeDisabled(); // chưa tick xác nhận trách nhiệm
    await approve(page);
    await page.getByRole('button', { name: /Tải về \/ in/ }).click();
    await expect(page.getByTestId('download-exam')).toBeEnabled();

    // sửa một câu sau khi duyệt → hủy duyệt
    await page.getByTestId('step-3').click();
    const c = card(page, 'mcq-1');
    await c.getByRole('button', { name: 'Sửa câu này' }).click();
    await c.getByLabel('Nội dung câu hỏi').fill('Hàm số nào sau đây là hàm số bậc hai? (đã chỉnh)');
    await c.getByRole('button', { name: 'Lưu câu này' }).click();
    await expect(page.getByTestId('step-5')).toBeDisabled();
    await toReview(page);
    await expect(page.getByText(/việc duyệt đã bị hủy/)).toBeVisible();
    await approve(page);
    await expect(page.getByTestId('step-5')).toBeEnabled();
  });

  test('AI rà soát thêm: hiển thị cảnh báo tham khảo, không chặn duyệt', async ({ page }) => {
    await setMock('review_warn');
    await toQuestions(page);
    await page.getByRole('button', { name: 'Nhờ AI rà soát thêm' }).click();
    const c = card(page, 'mcq-6');
    await expect(c).toContainText('Cảnh báo AI (tham khảo)');
    await expect(c).toContainText('Có thể mơ hồ'.slice(0, 0) + 'Câu có thể mơ hồ');
    await toReview(page);
    await approve(page); // vẫn duyệt được vì chỉ là cảnh báo tham khảo
  });
});
