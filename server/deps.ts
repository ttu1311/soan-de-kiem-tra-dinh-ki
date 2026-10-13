import { createGeminiGenerate } from './gemini.js';
import type { HandlerDeps } from './handlers.js';
import { rateLimiterFromEnv } from './rateLimit.js';

/** Phụ thuộc thật của API (dùng chung cho Express và hàm serverless). */
export function createRealDeps(env: NodeJS.ProcessEnv = process.env): HandlerDeps {
  return {
    generate: createGeminiGenerate(env),
    aiConfigured: () => {
      const k = (env.GEMINI_API_KEY ?? '').trim();
      return Boolean(k) && k !== 'MY_GEMINI_API_KEY';
    },
    rateLimiter: rateLimiterFromEnv(env),
    // Không ghi nội dung đề hay khóa vào log — chỉ ghi mã lỗi kỹ thuật.
    log: (m) => console.log(`[api] ${m}`),
  };
}
