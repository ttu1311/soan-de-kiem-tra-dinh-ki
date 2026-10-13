import { defineConfig, devices } from '@playwright/test';

/**
 * E2E chạy trên Chrome thật với máy chủ Gemini GIẢ (scripts/mock-gemini.ts) — không dùng khóa thật.
 * Để kiểm thử URL công khai: E2E_BASE_URL=https://... npx playwright test e2e/public.spec.ts
 */
const BASE = process.env.E2E_BASE_URL;
const MOCK_PORT = 4011;
const APP_PORT = 3101;

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results',
  use: {
    baseURL: BASE ?? `http://127.0.0.1:${APP_PORT}`,
    channel: 'chrome',
    locale: 'vi-VN',
    acceptDownloads: true,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1366, height: 900 } } },
    {
      name: 'tablet',
      testMatch: /responsive\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 820, height: 1180 } },
    },
  ],
  webServer: BASE
    ? undefined
    : [
        {
          command: `npx tsx scripts/mock-gemini.ts ${MOCK_PORT}`,
          url: `http://127.0.0.1:${MOCK_PORT}/__calls`,
          reuseExistingServer: false,
          timeout: 30_000,
        },
        {
          command: 'npm run build && npx tsx server/index.ts',
          url: `http://127.0.0.1:${APP_PORT}/api/health`,
          reuseExistingServer: false,
          timeout: 120_000,
          env: {
            NODE_ENV: 'production',
            PORT: String(APP_PORT),
            GEMINI_API_KEY: 'test-key-khong-phai-khoa-that',
            GEMINI_BASE_URL: `http://127.0.0.1:${MOCK_PORT}`,
            AI_RATE_LIMIT: '1000',
          },
        },
      ],
});
