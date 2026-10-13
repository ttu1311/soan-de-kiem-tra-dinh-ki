import { test, expect } from '@playwright/test';
import { approve, confirmMatrix, createMatrix, createQuestions, fresh, loadExample, resetMock, toReview } from './helpers.js';

// Chụp ảnh từng bước để rà soát giao diện (không khẳng định gì ngoài việc luồng chạy được).
test('walkthrough: chụp ảnh từng bước', async ({ page }) => {
  await resetMock();
  await fresh(page);
  await loadExample(page);
  await page.screenshot({ path: 'out/shots/01-input.png', fullPage: true });
  await createMatrix(page);
  await page.screenshot({ path: 'out/shots/02-matrix.png', fullPage: true });
  await confirmMatrix(page);
  await createQuestions(page);
  await page.screenshot({ path: 'out/shots/03-questions.png', fullPage: true });
  await toReview(page);
  await page.screenshot({ path: 'out/shots/04-review.png', fullPage: true });
  await approve(page);
  await page.getByRole('button', { name: /Tải về \/ in/ }).click();
  await expect(page.getByRole('heading', { name: 'Tải về và in' })).toBeVisible();
  await page.screenshot({ path: 'out/shots/05-export.png', fullPage: true });
});
