/**
 * Cầu nối giữa hàm serverless của Vercel (req/res kiểu Node) và bộ xử lý API dùng chung.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApi } from '../server/handlers.js';
import { createRealDeps } from '../server/deps.js';

const deps = createRealDeps();

async function readBody(req: IncomingMessage & { body?: unknown }): Promise<unknown> {
  if (req.body !== undefined && req.body !== null && req.body !== '') {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return undefined;
      }
    }
    return req.body;
  }
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function vercelHandler(routePath: string) {
  return async (req: IncomingMessage & { body?: unknown }, res: ServerResponse) => {
    const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0]?.trim();
    const r = await handleApi(
      {
        method: req.method ?? 'GET',
        path: routePath,
        body: req.method === 'POST' ? await readBody(req) : undefined,
        ip: forwarded || req.socket.remoteAddress || 'unknown',
      },
      deps,
    );
    res.statusCode = r.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(r.body));
  };
}
