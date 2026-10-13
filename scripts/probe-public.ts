/**
 * Thử nhanh API của một URL triển khai bằng ví dụ Toán 10 (dùng AI thật nếu máy chủ có khóa).
 * Chạy: BASE=https://... npx tsx scripts/probe-public.ts
 */
import { writeFileSync } from 'node:fs';
import { sampleToan10Input } from '../src/data/sampleToan10.js';
import { buildSlots, computeTotals } from '../shared/blueprint.js';
import { matrixSchema, questionSchema } from '../shared/schema.js';
import { hasErrors, validateExam, validateMatrix } from '../shared/validate.js';

const BASE = process.env.BASE ?? 'https://soan-de-kiem-tra-dinh-ki.vercel.app';
const input = sampleToan10Input();

async function post(path: string, body: unknown) {
  const t0 = Date.now();
  const res = await fetch(BASE + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 300) }; }
  return { status: res.status, ms: Date.now() - t0, json };
}

console.log('health:', await (await fetch(BASE + '/api/health')).text());

const m = await post('/api/ai/matrix', { input });
console.log(`\n[1] /api/ai/matrix → HTTP ${m.status} sau ${(m.ms / 1000).toFixed(1)}s`);
if (m.status !== 200) { console.log(JSON.stringify(m.json, null, 2)); process.exit(1); }
const matrix = matrixSchema.parse(m.json.matrix);
console.log('   notes:', m.json.notes);
console.log('   missingContent:', JSON.stringify(m.json.missingContent));
for (const r of matrix.rows) console.log(`   • ${r.topic} | ${r.unit}`);
const mi = validateMatrix(input.structure, matrix);
console.log('   kiểm tra ma trận (mã):', mi.length ? mi.map((i) => `${i.severity}: ${i.message}`) : 'không có vấn đề');
const slots = buildSlots(input.structure, matrix);
const tot = computeTotals(slots, matrix.rows, input.structure.totalScore);
console.log('   số câu theo dạng:', JSON.stringify(tot.typeCount), '| điểm theo mức:', JSON.stringify(tot.levelPoints));
if (hasErrors(mi)) { console.log('Ma trận có lỗi — dừng (giáo viên sẽ phải sửa tay).'); process.exit(2); }

const q = await post('/api/ai/questions', { input, matrix });
console.log(`\n[2] /api/ai/questions → HTTP ${q.status} sau ${(q.ms / 1000).toFixed(1)}s`);
if (q.status !== 200) { console.log(JSON.stringify(q.json, null, 2)); process.exit(1); }
const questions = (q.json.questions as unknown[]).map((x) => questionSchema.parse(x));
console.log('   số câu:', questions.length, '| ghi chú kỹ thuật:', q.json.notes);
const issues = validateExam(input, matrix, questions);
console.log('   kiểm tra đề (mã):', issues.length ? '' : 'không có vấn đề');
for (const i of issues) console.log(`     ${i.severity} ${i.questionId ?? '-'}: ${i.message}`);
for (const x of questions.slice(0, 2).concat(questions.filter((y) => y.type === 'tf' || y.type === 'essay').slice(0, 2))) {
  console.log(`\n   ${x.code} (${x.level}, ${x.points}đ): ${x.stem.slice(0, 160)}`);
}
writeFileSync('out/probe-questions.json', JSON.stringify({ matrix, questions }, null, 2));
