/**
 * Kiểm thử đường gọi THẬT của SDK @google/genai tới một máy chủ Gemini giả (HTTP cục bộ):
 * kiểm tra header khóa, schema gửi đi, model dự phòng, ánh xạ mã lỗi và tích hợp qua Express.
 */
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_MODELS, createGeminiGenerate, modelCandidates } from '../server/gemini.js';
import { createApp } from '../server/app.js';
import { createRealDeps } from '../server/deps.js';
import { aiMatrixOutput, input, matrix, validAiQuestion } from './helpers.js';
import { buildSlots } from '../shared/blueprint.js';

interface Seen {
  url: string;
  headers: http.IncomingHttpHeaders;
  body: any;
}

let upstream: http.Server;
let upstreamUrl = '';
let seen: Seen[] = [];
let respond: (req: Seen, n: number) => { status: number; body: unknown } = () => ({ status: 200, body: {} });

const ok = (text: string) => ({
  status: 200,
  body: { candidates: [{ content: { role: 'model', parts: [{ text }] }, finishReason: 'STOP' }] },
});
const apiError = (status: number, code: string, message: string) => ({
  status,
  body: { error: { code: status, message, status: code } },
});

beforeEach(async () => {
  seen = [];
  upstream = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      let body: any = {};
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      } catch {}
      const rec: Seen = { url: req.url ?? '', headers: req.headers, body };
      seen.push(rec);
      const r = respond(rec, seen.length - 1);
      res.statusCode = r.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(r.body));
    });
  });
  await new Promise<void>((r) => upstream.listen(0, '127.0.0.1', r));
  upstreamUrl = `http://127.0.0.1:${(upstream.address() as AddressInfo).port}`;
});
afterEach(async () => {
  await new Promise((r) => upstream.close(r));
});

const env = (extra: Record<string, string> = {}): NodeJS.ProcessEnv => ({
  GEMINI_API_KEY: 'TEST-KEY-abc123',
  GEMINI_BASE_URL: upstreamUrl,
  ...extra,
});

const reqArgs = { system: 'HỆ THỐNG', prompt: 'LỜI NHẮC', jsonSchema: { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'] } };

describe('createGeminiGenerate — gọi thật qua SDK', () => {
  it('gửi khóa trong header, schema JSON, system instruction; trả về văn bản JSON', async () => {
    respond = () => ok('{"ok":true}');
    const gen = createGeminiGenerate(env({ GEMINI_MODEL: 'gemini-test-model' }));
    const text = await gen(reqArgs);
    expect(text).toBe('{"ok":true}');
    expect(seen).toHaveLength(1);
    expect(seen[0]!.url).toContain('/models/gemini-test-model:generateContent');
    expect(seen[0]!.headers['x-goog-api-key']).toBe('TEST-KEY-abc123');
    const cfg = seen[0]!.body.generationConfig;
    expect(cfg.responseMimeType).toBe('application/json');
    expect(cfg.responseJsonSchema).toEqual(reqArgs.jsonSchema);
    expect(JSON.stringify(seen[0]!.body.systemInstruction)).toContain('HỆ THỐNG');
    expect(JSON.stringify(seen[0]!.body.contents)).toContain('LỜI NHẮC');
    // khóa không nằm trong thân yêu cầu
    expect(JSON.stringify(seen[0]!.body)).not.toContain('TEST-KEY-abc123');
  });

  it('model được cấu hình không tồn tại (404) → tự thử model dự phòng', async () => {
    respond = (r) =>
      r.url.includes('gemini-sai-ten') ? apiError(404, 'NOT_FOUND', 'models/gemini-sai-ten is not found') : ok('{"ok":true}');
    const gen = createGeminiGenerate(env({ GEMINI_MODEL: 'gemini-sai-ten' }));
    expect(await gen(reqArgs)).toBe('{"ok":true}');
    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[0]!.url).toContain('gemini-sai-ten');
    expect(modelCandidates(env({ GEMINI_MODEL: 'gemini-sai-ten' }))[0]).toBe('gemini-sai-ten');
  });

  it('model đầu quá tải (503) → tự chuyển model dự phòng và thành công', async () => {
    respond = (r) => (r.url.includes(DEFAULT_MODELS[0]!) ? apiError(503, 'UNAVAILABLE', 'This model is currently experiencing high demand') : ok('{"ok":true}'));
    const gen = createGeminiGenerate(env());
    expect(await gen(reqArgs)).toBe('{"ok":true}');
    expect(seen).toHaveLength(2);
    expect(seen[0]!.url).toContain(DEFAULT_MODELS[0]!);
    expect(seen[1]!.url).toContain(DEFAULT_MODELS[1]!);
  });

  it('model đầu hết hạn mức riêng (429) → thử model kế tiếp', async () => {
    respond = (r) => (r.url.includes(DEFAULT_MODELS[0]!) ? apiError(429, 'RESOURCE_EXHAUSTED', 'quota') : ok('{"ok":true}'));
    const gen = createGeminiGenerate(env());
    expect(await gen(reqArgs)).toBe('{"ok":true}');
  });

  it('mức "suy nghĩ" chỉ gửi cho model Gemini 3; model khác không bị gửi thinkingConfig', async () => {
    respond = () => ok('{"ok":true}');
    await createGeminiGenerate(env())({ ...reqArgs, thinking: 'medium' });
    expect(seen[0]!.url).toContain('gemini-3.8-flash');
    expect(seen[0]!.body.generationConfig.thinkingConfig).toEqual({ thinkingLevel: 'MEDIUM' });
    seen.length = 0;
    await createGeminiGenerate(env({ GEMINI_MODEL: 'gemini-2.5-flash' }))({ ...reqArgs, thinking: 'medium' });
    expect(seen[0]!.url).toContain('gemini-2.5-flash');
    expect(seen[0]!.body.generationConfig.thinkingConfig).toBeUndefined();
  });

  it('model từ chối tham số thinking (400) → thử lại đúng model đó không có thinking', async () => {
    respond = (r) => (r.body.generationConfig?.thinkingConfig ? apiError(400, 'INVALID_ARGUMENT', 'Unsupported thinking level for this model') : ok('{"ok":true}'));
    const text = await createGeminiGenerate(env())({ ...reqArgs, thinking: 'low' });
    expect(text).toBe('{"ok":true}');
    expect(seen).toHaveLength(2);
    expect(seen[0]!.url).toBe(seen[1]!.url);
  });

  it('hết thời gian của yêu cầu → timeout ngay, không gọi Gemini', async () => {
    respond = () => ok('{"ok":true}');
    await expect(createGeminiGenerate(env())({ ...reqArgs, deadlineAt: Date.now() + 3000 })).rejects.toMatchObject({ code: 'timeout' });
    expect(seen).toHaveLength(0);
  });

  it('mọi model đều 404 → model_unavailable', async () => {
    respond = () => apiError(404, 'NOT_FOUND', 'model not found');
    const gen = createGeminiGenerate(env());
    await expect(gen(reqArgs)).rejects.toMatchObject({ status: 404 });
  });

  it('thiếu khóa → not_configured, không gọi mạng', async () => {
    const gen = createGeminiGenerate({ GEMINI_API_KEY: '', GEMINI_BASE_URL: upstreamUrl });
    await expect(gen(reqArgs)).rejects.toMatchObject({ code: 'not_configured' });
    expect(seen).toHaveLength(0);
  });

  it('khóa mẫu từ .env.example bị coi là chưa cấu hình', async () => {
    const gen = createGeminiGenerate({ GEMINI_API_KEY: 'MY_GEMINI_API_KEY', GEMINI_BASE_URL: upstreamUrl });
    await expect(gen(reqArgs)).rejects.toMatchObject({ code: 'not_configured' });
  });

  it('phản hồi rỗng (bị chặn) → blocked', async () => {
    respond = () => ({ status: 200, body: { candidates: [{ finishReason: 'SAFETY' }] } });
    const gen = createGeminiGenerate(env());
    await expect(gen(reqArgs)).rejects.toMatchObject({ code: 'blocked' });
  });
});

describe('Express + SDK + máy chủ Gemini giả (đầu cuối phía máy chủ)', () => {
  const start = async (e: NodeJS.ProcessEnv) => {
    const app = createApp({ deps: { ...createRealDeps(e), retryDelayMs: 1 } });
    const server = http.createServer(app);
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    return { base, close: () => new Promise((r) => server.close(r)) };
  };
  const postJson = (url: string, body: unknown, raw = false) =>
    fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: raw ? (body as string) : JSON.stringify(body) });

  it('tạo ma trận qua /api/ai/matrix', async () => {
    respond = () => ok(JSON.stringify(aiMatrixOutput()));
    const s = await start(env());
    const res = await postJson(`${s.base}/api/ai/matrix`, { input: input() });
    const json = (await res.json()) as { matrix: { rows: unknown[] } };
    expect(res.status).toBe(200);
    expect(json.matrix.rows).toHaveLength(3);
    await s.close();
  });

  it('tạo câu hỏi, và khóa không bao giờ xuất hiện trong phản hồi gửi về trình duyệt', async () => {
    const all = buildSlots(input().structure, matrix());
    respond = () => ok(JSON.stringify({ questions: all.map(validAiQuestion) }));
    const s = await start(env());
    const res = await postJson(`${s.base}/api/ai/questions`, { input: input(), matrix: matrix() });
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(JSON.parse(text).questions).toHaveLength(21);
    expect(text).not.toContain('TEST-KEY-abc123');
    expect([...res.headers.values()].join(' ')).not.toContain('TEST-KEY-abc123');
    await s.close();
  });

  it('hết hạn mức ở Gemini (429) → 429 + thông báo tiếng Việt', async () => {
    respond = () => apiError(429, 'RESOURCE_EXHAUSTED', 'Quota exceeded for TEST-KEY-abc123');
    const s = await start(env());
    const res = await postJson(`${s.base}/api/ai/matrix`, { input: input() });
    const text = await res.text();
    expect(res.status).toBe(429);
    expect(JSON.parse(text).error.code).toBe('quota');
    expect(text).toMatch(/hết hạn mức/);
    expect(text).not.toContain('TEST-KEY-abc123');
    expect(seen).toHaveLength(modelCandidates(env()).length); // thử mỗi model một lần, không thử lại vòng ngoài khi hết hạn mức
    await s.close();
  });

  it('Gemini quá tải (503) mãi → 503; mỗi model được thử, lặp 4 vòng', async () => {
    respond = () => apiError(503, 'UNAVAILABLE', 'The model is overloaded');
    const s = await start(env({ GEMINI_MODEL: 'm' }));
    const res = await postJson(`${s.base}/api/ai/matrix`, { input: input() });
    expect(res.status).toBe(503);
    expect(((await res.json()) as any).error.code).toBe('overloaded');
    expect(seen).toHaveLength(modelCandidates(env({ GEMINI_MODEL: 'm' })).length * 4);
    await s.close();
  });

  it('Gemini từ chối khóa (400 API key not valid) → bad_key', async () => {
    respond = () => apiError(400, 'INVALID_ARGUMENT', 'API key not valid. Please pass a valid API key.');
    const s = await start(env());
    const res = await postJson(`${s.base}/api/ai/matrix`, { input: input() });
    expect(((await res.json()) as any).error.code).toBe('bad_key');
    await s.close();
  });

  it('không kết nối được tới Gemini → lỗi mạng', async () => {
    const s = await start(env({ GEMINI_BASE_URL: 'http://127.0.0.1:1' }));
    const res = await postJson(`${s.base}/api/ai/matrix`, { input: input() });
    expect(((await res.json()) as any).error.code).toBe('network');
    await s.close();
  });

  it('thiếu GEMINI_API_KEY → 503, không gọi Gemini', async () => {
    const s = await start({ GEMINI_BASE_URL: upstreamUrl });
    const res = await postJson(`${s.base}/api/ai/matrix`, { input: input() });
    expect(res.status).toBe(503);
    expect(((await res.json()) as any).error.code).toBe('not_configured');
    expect(seen).toHaveLength(0);
    const health = await (await fetch(`${s.base}/api/health`)).json();
    expect(health).toEqual({ ok: true, aiConfigured: false });
    await s.close();
  });

  it('JSON hỏng gửi lên → 400 tiếng Việt; thân quá lớn → 413', async () => {
    const s = await start(env());
    const bad = await postJson(`${s.base}/api/ai/matrix`, '{oops', true);
    expect(bad.status).toBe(400);
    expect(((await bad.json()) as any).error.message).toMatch(/không đọc được/);
    const big = await postJson(`${s.base}/api/ai/matrix`, JSON.stringify({ x: 'a'.repeat(3 * 1024 * 1024) }), true);
    expect(big.status).toBe(413);
    await s.close();
  });
});
