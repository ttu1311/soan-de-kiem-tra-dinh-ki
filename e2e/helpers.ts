import { expect, type Page } from '@playwright/test';

export const MOCK = 'http://127.0.0.1:4011';

export async function setMock(mode: string) {
  await fetch(`${MOCK}/__mode`, { method: 'POST', body: JSON.stringify({ mode }) });
}
export async function resetMock() {
  await fetch(`${MOCK}/__reset`, { method: 'POST' });
}
export async function mockCalls(): Promise<Record<string, number>> {
  return (await fetch(`${MOCK}/__calls`)).json() as Promise<Record<string, number>>;
}

export async function fresh(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Soạn đề kiểm tra định kì' })).toBeVisible();
}

export async function loadExample(page: Page) {
  await page.getByRole('button', { name: /Thử với ví dụ/ }).click();
  await expect(page.getByLabel('Nội dung nguồn')).toHaveValue(/HÀM SỐ BẬC HAI/);
}

export async function createMatrix(page: Page) {
  await page.getByRole('button', { name: /Kiểm tra & tạo ma trận bằng AI/ }).click();
  await expect(page.getByText('Bản nháp — chưa xác nhận')).toBeVisible();
}

export async function confirmMatrix(page: Page) {
  await page.getByRole('button', { name: 'Xác nhận ma trận' }).click();
  await expect(page.getByText('Đã xác nhận (khóa)')).toBeVisible();
}

export async function createQuestions(page: Page) {
  await page.getByRole('button', { name: /Tiếp tục: tạo câu hỏi/ }).click();
  await page.getByRole('button', { name: 'Tạo câu hỏi bằng AI' }).click();
  await expect(page.locator('article[data-question]').first()).toBeVisible();
}

export async function toReview(page: Page) {
  await page.getByRole('button', { name: /Xem trước & duyệt đề/ }).click();
  await expect(page.getByRole('heading', { name: 'Xem trước và duyệt đề' })).toBeVisible();
}

export async function approve(page: Page) {
  await page.getByLabel(/Tôi đã rà soát nội dung, đáp án/).check();
  await page.getByRole('button', { name: 'Duyệt đề', exact: true }).click();
  await expect(page.getByText('Đề đã được duyệt')).toBeVisible();
}

/** Đi hết luồng đến bước duyệt xong (dùng ví dụ Toán 10). */
export async function fullFlow(page: Page) {
  await fresh(page);
  await loadExample(page);
  await createMatrix(page);
  await confirmMatrix(page);
  await createQuestions(page);
  await toReview(page);
  await approve(page);
}
