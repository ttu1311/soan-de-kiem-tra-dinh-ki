import { expect, test, type Page } from '@playwright/test';
import { approve, confirmMatrix, createMatrix, createQuestions, fresh, loadExample, resetMock, toReview } from './helpers.js';

const noHorizontalScroll = async (page: Page, label: string) => {
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw, `${label}: trang bị tràn ngang (${sw} > ${cw})`).toBeLessThanOrEqual(cw + 1);
};

test('máy tính bảng: các bước không tràn ngang, nút chính bấm được', async ({ page }, info) => {
  await resetMock();
  const tag = info.project.name;
  await fresh(page);
  await loadExample(page);
  await noHorizontalScroll(page, 'bước 1');
  await page.screenshot({ path: `out/shots/${tag}-1-input.png`, fullPage: true });
  await createMatrix(page);
  await noHorizontalScroll(page, 'bước 2');
  await page.screenshot({ path: `out/shots/${tag}-2-matrix.png`, fullPage: true });
  await confirmMatrix(page);
  await createQuestions(page);
  await noHorizontalScroll(page, 'bước 3');
  await page.screenshot({ path: `out/shots/${tag}-3-questions.png`, fullPage: true });
  await toReview(page);
  await noHorizontalScroll(page, 'bước 4');
  await page.screenshot({ path: `out/shots/${tag}-4-review.png`, fullPage: true });
  await approve(page);
  await page.getByRole('button', { name: /Tải về \/ in/ }).click();
  await noHorizontalScroll(page, 'bước 5');
  await page.screenshot({ path: `out/shots/${tag}-5-export.png`, fullPage: true });
});
