/**
 * MÁY CHỦ GEMINI GIẢ — chỉ dùng để kiểm thử (E2E, thử giao diện), KHÔNG thuộc sản phẩm.
 * Mô phỏng POST /v1beta/models/<model>:generateContent. Trả nội dung Toán 10 "Hàm số bậc hai"
 * (đáp án đã tự kiểm tra) cho ma trận mẫu 12/2/4/3. Có "chế độ" để mô phỏng lỗi:
 *   POST /__mode  {"mode":"ok|quota|overloaded|badjson|bad_key|tf3|no_answer|bad_rubric|offline_review"}
 *   GET  /__calls → số lời gọi đã nhận theo loại.
 * Chạy:  npx tsx scripts/mock-gemini.ts [cổng]
 */
import http from 'node:http';
import { fileURLToPath } from 'node:url';

type Mode = 'ok' | 'quota' | 'overloaded' | 'badjson' | 'bad_key' | 'tf3' | 'no_answer' | 'bad_rubric' | 'review_warn' | 'slow';

const L = (biet = 0, hieu = 0, van_dung = 0) => ({ biet, hieu, van_dung });
const Z = L();

const MATRIX = {
  rows: [
    {
      topic: 'Khái niệm hàm số bậc hai',
      unit: 'Định nghĩa, tập xác định, hệ số a, b, c',
      outcomes: {
        biet: 'Nhận biết được hàm số bậc hai y = ax² + bx + c (a ≠ 0), tập xác định và các hệ số a, b, c.',
        hieu: 'Tính được giá trị của hàm số bậc hai tại một điểm.',
        van_dung: '',
      },
      counts: { mcq: L(3, 1, 0), tf: L(1, 0, 0), short: L(1, 0, 0), essay: { ...Z } },
    },
    {
      topic: 'Đồ thị và sự biến thiên của hàm số bậc hai',
      unit: 'Đỉnh, trục đối xứng, bảng biến thiên, xác định hệ số',
      outcomes: {
        biet: 'Nhận biết được đỉnh, trục đối xứng, bề lõm của parabol.',
        hieu: 'Lập được bảng biến thiên; xét được tính đồng biến, nghịch biến; tìm giao điểm với trục tọa độ.',
        van_dung: 'Xác định được hệ số của hàm số khi parabol đi qua các điểm cho trước.',
      },
      counts: { mcq: L(3, 2, 0), tf: L(0, 1, 0), short: L(0, 1, 1), essay: L(1, 1, 0) },
    },
    {
      topic: 'Ứng dụng của hàm số bậc hai',
      unit: 'Giá trị lớn nhất, nhỏ nhất; bài toán thực tiễn',
      outcomes: {
        biet: '',
        hieu: 'Tìm được giá trị lớn nhất, nhỏ nhất của hàm số bậc hai.',
        van_dung: 'Vận dụng hàm số bậc hai giải bài toán thực tiễn (độ cao, quỹ đạo, diện tích lớn nhất).',
      },
      counts: { mcq: L(0, 1, 2), tf: { ...Z }, short: L(0, 0, 1), essay: L(0, 0, 1) },
    },
  ],
  notes: ['(Máy chủ giả) Ma trận phân bổ theo ba chủ đề giáo viên nhập.'],
  missingContent: [] as { topic: string; reason: string }[],
};

const mcq = (stem: string, o: [string, string, string, string], correct: 'A' | 'B' | 'C' | 'D', solution: string, ref = '') => ({
  stem,
  options: { A: o[0], B: o[1], C: o[2], D: o[3] },
  correct,
  solution,
  sourceRef: ref,
});

const BANK: Record<string, Record<string, unknown>> = {
  'mcq-1': mcq('Hàm số nào sau đây là hàm số bậc hai?', ['y = 2x + 1', 'y = x² − 3x + 2', 'y = 1/x', 'y = x³ − x'], 'B', 'Hàm số bậc hai có dạng y = ax² + bx + c với a ≠ 0.', 'Hàm số bậc hai theo biến x là hàm số cho bởi công thức y = ax² + bx + c'),
  'mcq-2': mcq('Tập xác định của hàm số y = −3x² + 5x − 1 là:', ['ℝ', 'ℝ \\ {0}', '(0; +∞)', '[−3; +∞)'], 'A', 'Hàm số bậc hai xác định với mọi số thực x.', 'Tập xác định của hàm số bậc hai là ℝ'),
  'mcq-3': mcq('Cho hàm số y = 2x² − 4x + 1. Các hệ số a, b, c lần lượt là:', ['a = 2, b = −4, c = 1', 'a = 2, b = 4, c = 1', 'a = −4, b = 2, c = 1', 'a = 1, b = −4, c = 2'], 'A', 'Đối chiếu với dạng y = ax² + bx + c.'),
  'mcq-4': mcq('Tọa độ đỉnh I của parabol (P): y = x² − 4x + 3 là:', ['I(2; −1)', 'I(−2; 15)', 'I(4; 3)', 'I(2; 1)'], 'A', 'x_I = −b/(2a) = 2; y_I = 2² − 4·2 + 3 = −1.', 'đỉnh I(−b/(2a); −Δ/(4a))'),
  'mcq-5': mcq('Trục đối xứng của parabol y = −x² + 6x − 5 là đường thẳng:', ['x = −3', 'x = 3', 'y = 3', 'x = 6'], 'B', 'x = −b/(2a) = −6/(−2) = 3.'),
  'mcq-6': mcq('Parabol y = ax² + bx + c (a ≠ 0) có bề lõm quay xuống dưới khi và chỉ khi:', ['a > 0', 'a < 0', 'b < 0', 'c < 0'], 'B', 'Bề lõm quay xuống dưới nếu a < 0.', 'bề lõm quay lên trên nếu a > 0 và quay xuống dưới nếu a < 0'),
  'mcq-7': mcq('Giá trị của hàm số y = −2x² + 3x + 1 tại x = −1 là:', ['−4', '0', '2', '−6'], 'A', 'y(−1) = −2·1 + 3·(−1) + 1 = −4.'),
  'mcq-8': mcq('Hàm số y = x² − 4x + 3 đồng biến trên khoảng nào sau đây?', ['(−∞; 2)', '(2; +∞)', '(−∞; −2)', '(−2; +∞)'], 'B', 'a = 1 > 0 nên hàm số đồng biến trên (−b/(2a); +∞) = (2; +∞).', 'hàm số nghịch biến trên khoảng (−∞; −b/(2a)), đồng biến trên khoảng (−b/(2a); +∞)'),
  'mcq-9': mcq('Hàm số y = −x² + 2x + 3 có giá trị lớn nhất bằng:', ['3', '4', '1', '2'], 'B', 'a < 0; đỉnh x = 1, y = −1 + 2 + 3 = 4.'),
  'mcq-10': mcq('Giá trị nhỏ nhất của hàm số y = 2x² − 8x + 5 là:', ['−3', '5', '−11', '3'], 'A', 'a > 0; đỉnh x = 2, y = 8 − 16 + 5 = −3.'),
  'mcq-11': mcq('Một vật được ném lên cao, độ cao (mét) của vật sau t giây là h(t) = −5t² + 20t + 1. Độ cao lớn nhất vật đạt được là:', ['20 m', '21 m', '25 m', '41 m'], 'B', 'Đỉnh tại t = 2 s; h(2) = −20 + 40 + 1 = 21 m.', 'vật đạt độ cao lớn nhất tại t = 2 s và độ cao đó là 21 m'),
  'mcq-12': mcq('Dùng 40 m lưới rào ba cạnh của một mảnh vườn hình chữ nhật có một cạnh là bức tường. Diện tích lớn nhất của mảnh vườn là:', ['100 m²', '150 m²', '200 m²', '400 m²'], 'C', 'S(x) = x(40 − 2x) = −2x² + 40x, lớn nhất tại x = 10: S = 200 m².', 'đạt lớn nhất bằng 200 m² khi x = 10'),
  'tf-1': {
    stem: 'Cho hàm số y = f(x) = 2x² − 3x + 1.',
    statements: [
      { label: 'a', text: 'Hàm số đã cho là hàm số bậc hai.', isTrue: true },
      { label: 'b', text: 'Tập xác định của hàm số là ℝ \\ {0}.', isTrue: false },
      { label: 'c', text: 'f(1) = 0.', isTrue: true },
      { label: 'd', text: 'Hệ số a của hàm số bằng −3.', isTrue: false },
    ],
    solution: 'a) Đúng (a = 2 ≠ 0). b) Sai: TXĐ là ℝ. c) Đúng: 2 − 3 + 1 = 0. d) Sai: a = 2.',
  },
  'tf-2': {
    stem: 'Cho parabol (P): y = x² − 4x + 3.',
    statements: [
      { label: 'a', text: 'Đỉnh của (P) là I(2; −1).', isTrue: true },
      { label: 'b', text: 'Trục đối xứng của (P) là đường thẳng x = −2.', isTrue: false },
      { label: 'c', text: 'Hàm số nghịch biến trên khoảng (−∞; 2).', isTrue: true },
      { label: 'd', text: '(P) cắt trục hoành tại hai điểm có hoành độ 1 và 4.', isTrue: false },
    ],
    solution: 'a) Đúng. b) Sai: trục đối xứng x = 2. c) Đúng vì a > 0. d) Sai: x² − 4x + 3 = 0 có hai nghiệm x = 1 và x = 3.',
  },
  'short-1': { stem: 'Cho hàm số y = 3x² − 2x + 5. Tính giá trị của hàm số tại x = 2.', answer: '13', solution: 'y(2) = 3·4 − 4 + 5 = 13.' },
  'short-2': { stem: 'Tìm hoành độ đỉnh của parabol y = 2x² − 12x + 7.', answer: '3', solution: 'x = −b/(2a) = 12/4 = 3.' },
  'short-3': { stem: 'Biết parabol y = ax² + bx + 1 đi qua hai điểm A(1; 0) và B(2; 3). Tính giá trị của a − b.', answer: '5', solution: 'a + b = −1 và 4a + 2b = 2 ⇒ a = 2, b = −3 ⇒ a − b = 5.' },
  'short-4': { stem: 'Một quả bóng được đá lên, độ cao (mét) sau t giây là h(t) = −4t² + 16t. Sau bao nhiêu giây thì quả bóng đạt độ cao lớn nhất?', answer: '2', solution: 't = −16/(2·(−4)) = 2 (giây).' },
  'essay-1': {
    stem: 'Cho hàm số y = x² − 2x − 3.\na) Xác định tọa độ đỉnh và trục đối xứng của parabol.\nb) Tìm tọa độ giao điểm của parabol với trục Ox.',
    rubric: [
      { content: 'Hoành độ đỉnh x = −b/(2a) = 1; tung độ y = 1 − 2 − 3 = −4. Đỉnh I(1; −4).', points: 0.25 },
      { content: 'Trục đối xứng là đường thẳng x = 1.', points: 0.25 },
      { content: 'Giải x² − 2x − 3 = 0 được x = −1 hoặc x = 3.', points: 0.25 },
      { content: 'Kết luận: giao điểm với Ox là (−1; 0) và (3; 0).', points: 0.25 },
    ],
    solution: 'Đỉnh I(1; −4), trục x = 1; giao Ox: (−1; 0), (3; 0).',
  },
  'essay-2': {
    stem: 'Lập bảng biến thiên của hàm số y = −x² + 4x − 3 và nêu các khoảng đồng biến, nghịch biến của hàm số.',
    rubric: [
      { content: 'Xác định a = −1 < 0, đỉnh I(2; 1).', points: 0.25 },
      { content: 'Lập đúng bảng biến thiên: hàm số tăng đến x = 2 rồi giảm; giá trị lớn nhất bằng 1 tại x = 2.', points: 0.5 },
      { content: 'Kết luận: đồng biến trên (−∞; 2), nghịch biến trên (2; +∞).', points: 0.25 },
    ],
    solution: 'a < 0 nên hàm số đồng biến trên (−∞; 2), nghịch biến trên (2; +∞), giá trị lớn nhất bằng 1 tại x = 2.',
  },
  'essay-3': {
    stem: 'Một người dùng 60 m lưới thép để rào ba cạnh của một mảnh đất hình chữ nhật, cạnh còn lại là bờ sông (không cần rào). Tìm kích thước của mảnh đất để diện tích lớn nhất.',
    rubric: [
      { content: 'Gọi x (m) là độ dài mỗi cạnh vuông góc với bờ sông (0 < x < 30); cạnh song song với bờ dài 60 − 2x. Diện tích S(x) = x(60 − 2x) = −2x² + 60x.', points: 0.25 },
      { content: 'Hàm số bậc hai có a = −2 < 0 nên đạt giá trị lớn nhất tại x = −b/(2a) = 15.', points: 0.25 },
      { content: 'Diện tích lớn nhất S(15) = 450 m².', points: 0.25 },
      { content: 'Kết luận: kích thước 15 m × 30 m.', points: 0.25 },
    ],
    solution: 'x = 15 m, cạnh song song bờ sông 30 m, diện tích lớn nhất 450 m².',
  },
};

function slotIdsFromPrompt(prompt: string): string[] {
  return [...prompt.matchAll(/slotId: (\S+) \| mã câu/g)].map((m) => m[1]!);
}

export interface MockHandle {
  url: string;
  close: () => Promise<void>;
  setMode: (m: Mode) => void;
  calls: Record<string, number>;
}

export function startMockGemini(port = 0): Promise<MockHandle> {
  let mode: Mode = 'ok';
  const calls: Record<string, number> = { matrix: 0, questions: 0, question: 0, review: 0, total: 0 };
  let questionsCallCount = 0;

  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const send = (status: number, body: unknown) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(body));
      };
      const raw = Buffer.concat(chunks).toString('utf8');
      const url = req.url ?? '';

      if (url.startsWith('/__mode')) {
        mode = (JSON.parse(raw || '{}').mode ?? 'ok') as Mode;
        questionsCallCount = 0;
        return send(200, { mode });
      }
      if (url.startsWith('/__calls')) return send(200, calls);
      if (url.startsWith('/__reset')) {
        for (const k of Object.keys(calls)) calls[k] = 0;
        mode = 'ok';
        questionsCallCount = 0;
        return send(200, { ok: true });
      }

      if (!/:generateContent/.test(url)) return send(404, { error: { code: 404, message: 'not found', status: 'NOT_FOUND' } });
      calls.total++;
      const body = JSON.parse(raw || '{}');
      const prompt: string = (body.contents?.[0]?.parts?.[0]?.text ?? JSON.stringify(body.contents ?? '')) as string;
      const props = body.generationConfig?.responseJsonSchema?.properties ?? {};
      const kind = 'rows' in props ? 'matrix' : 'warnings' in props ? 'review' : /\(đúng 1 phần tử\)|Viết LẠI MỘT câu|"questions": đúng 1 phần tử/.test(prompt) ? 'question' : 'questions';
      calls[kind]++;

      const ok = (obj: unknown) => send(200, { candidates: [{ content: { role: 'model', parts: [{ text: typeof obj === 'string' ? obj : JSON.stringify(obj) }] }, finishReason: 'STOP' }] });

      if (mode === 'quota') return send(429, { error: { code: 429, message: 'Quota exceeded', status: 'RESOURCE_EXHAUSTED' } });
      if (mode === 'overloaded') return send(503, { error: { code: 503, message: 'The model is overloaded', status: 'UNAVAILABLE' } });
      if (mode === 'bad_key') return send(400, { error: { code: 400, message: 'API key not valid. Please pass a valid API key.', status: 'INVALID_ARGUMENT' } });
      if (mode === 'badjson') return ok('đây không phải JSON {');
      if (mode === 'slow') await new Promise((r) => setTimeout(r, 4000));

      if (kind === 'matrix') return ok(MATRIX);

      if (kind === 'review') {
        return ok({
          warnings:
            mode === 'review_warn'
              ? [{ questionId: 'mcq-6', kind: 'ambiguous', message: 'Phương án C và D chưa liên quan trực tiếp đến bề lõm; nên kiểm tra lại cách diễn đạt.' }]
              : [],
        });
      }

      const ids = slotIdsFromPrompt(prompt);
      if (kind === 'questions') questionsCallCount++;
      const questions = ids.map((id) => {
        let q: Record<string, unknown> = { slotId: id, ...(BANK[id] ?? { stem: `Câu ${id}`, solution: '' }) };
        if (kind === 'question') {
          // viết lại: biến thể nhỏ để thấy khác với bản cũ
          q = { ...q, stem: `${q.stem as string}` };
        }
        // Chế độ lỗi chỉ áp dụng cho lần tạo đề đầu (và lần sửa tự động), không áp cho tạo lại riêng một câu
        if (kind === 'questions') {
          if (mode === 'tf3' && id === 'tf-1') q = { ...q, statements: (q.statements as unknown[]).slice(0, 3) };
          if (mode === 'no_answer' && id === 'mcq-3') {
            const { correct: _c, ...rest } = q;
            q = rest;
          }
          if (mode === 'bad_rubric' && id === 'essay-1') q = { ...q, rubric: (q.rubric as { content: string; points: number }[]).map((r, i) => (i === 0 ? { ...r, points: 0.5 } : r)) };
        }
        return q;
      });
      return ok({ questions });
    });
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      const p = typeof addr === 'object' && addr ? addr.port : port;
      resolve({
        url: `http://127.0.0.1:${p}`,
        close: () => new Promise((r) => server.close(() => r())),
        setMode: (m) => {
          mode = m;
        },
        calls,
      });
    });
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.argv[2]) || 4010;
  startMockGemini(port).then((h) => console.log(`Mock Gemini: ${h.url}`));
}
