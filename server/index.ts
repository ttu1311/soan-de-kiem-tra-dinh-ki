/**
 * Điểm vào máy chủ.
 *  - `npm run dev`   : Express + Vite (middleware) trên một cổng.
 *  - `npm start`     : Express phục vụ bản dựng `dist/` và API.
 * Khóa GEMINI_API_KEY được đọc từ biến môi trường (hoặc .env.local khi chạy trên máy).
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { createRealDeps } from './deps.js';

dotenv.config({ path: ['.env.local', '.env'], quiet: true });

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isProd = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 3000;
const deps = createRealDeps();

const app = createApp({ deps, distDir: isProd ? path.join(root, 'dist') : undefined });

if (!isProd) {
  const { createServer } = await import('vite');
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Soạn đề kiểm tra định kì — http://localhost:${port} (${isProd ? 'production' : 'dev'})`);
  console.log(deps.aiConfigured() ? 'GEMINI_API_KEY: đã cấu hình' : 'GEMINI_API_KEY: CHƯA cấu hình — các chức năng AI sẽ báo lỗi');
});
