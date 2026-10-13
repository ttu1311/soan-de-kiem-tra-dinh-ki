import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { handleApi, type HandlerDeps } from './handlers.js';

export interface AppOptions {
  deps: HandlerDeps;
  /** Thư mục bản dựng giao diện (dist). Bỏ trống nếu chỉ cần API (kiểm thử). */
  distDir?: string;
}

export function createApp({ deps, distDir }: AppOptions) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  app.use('/api', express.json({ limit: '2mb' }));

  app.all('/api/*', async (req: Request, res: Response) => {
    const r = await handleApi(
      { method: req.method, path: req.path.startsWith('/api') ? req.path : `/api${req.path}`, body: req.body, ip: req.ip ?? 'unknown' },
      deps,
    );
    res.setHeader('Cache-Control', 'no-store');
    res.status(r.status).json(r.body);
  });

  // Lỗi đọc JSON, quá lớn…
  app.use('/api', (err: { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    const tooLarge = err?.type === 'entity.too.large';
    res.status(tooLarge ? 413 : 400).json({
      error: {
        code: tooLarge ? 'too_large' : 'bad_request',
        message: tooLarge
          ? 'Nội dung gửi lên quá lớn. Hãy rút gọn nội dung nguồn.'
          : 'Dữ liệu gửi lên không đọc được. Hãy tải lại trang rồi thử lại.',
      },
    });
  });

  if (distDir && existsSync(distDir)) {
    app.use(express.static(distDir, { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }
  return app;
}
