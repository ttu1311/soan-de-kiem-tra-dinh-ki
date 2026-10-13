import React, { useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ChevronRight, Pencil, Plus, RefreshCw, Save, Sparkles, Trash2, X, XCircle } from 'lucide-react';
import { fmtPoints, sumPoints } from '../../shared/blueprint.js';
import {
  LEVEL_LABEL,
  OPTION_KEYS,
  QTYPE_SHORT_LABEL,
  TF_LABELS,
  type AiWarning,
  type Issue,
  type OptionKey,
  type Question,
} from '../../shared/schema.js';
import { NumInput } from './NumInput.js';
import { Badge, Button, inputClass } from './ui.js';

const TYPE_TONE = { mcq: 'blue', tf: 'amber', short: 'indigo', essay: 'emerald' } as const;
const LEVEL_TONE = { biet: 'slate', hieu: 'indigo', van_dung: 'violet' } as const;
const AI_KIND: Record<AiWarning['kind'], string> = {
  ambiguous: 'Câu có thể mơ hồ',
  duplicate: 'Có thể trùng lặp',
  off_source: 'Có thể lệch nguồn',
  answer_doubt: 'Nghi ngờ đáp án',
  other: 'Lưu ý khác',
};

// ---------------------------------------------------------------------------
// Chế độ xem (dành cho giáo viên: có đáp án)
// ---------------------------------------------------------------------------
function QuestionBody({ q, showAnswers }: { q: Question; showAnswers: boolean }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-800">
      {q.stem ? (
        <p className="whitespace-pre-line">{q.stem}</p>
      ) : (
        <p className="italic text-rose-700">(Chưa có nội dung câu hỏi)</p>
      )}

      {q.type === 'mcq' && q.options && (
        <ul className="grid gap-1 sm:grid-cols-2">
          {OPTION_KEYS.map((k) => {
            const isCorrect = showAnswers && q.correct === k;
            return (
              <li
                key={k}
                className={`flex gap-2 rounded-lg border px-2.5 py-1.5 ${isCorrect ? 'border-emerald-300 bg-emerald-50 font-semibold text-emerald-900' : 'border-slate-200 bg-white'}`}
              >
                <span className="font-bold">{k}.</span>
                <span className="whitespace-pre-line">{q.options![k] || <i className="text-rose-700">(trống)</i>}</span>
                {isCorrect && <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-600" aria-label="Đáp án đúng" />}
              </li>
            );
          })}
        </ul>
      )}

      {q.type === 'tf' && (
        <ul className="space-y-1">
          {(q.statements ?? []).map((s, i) => (
            <li key={i} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
              <span className="font-bold">{s.label})</span>
              <span className="flex-1">{s.text || <i className="text-rose-700">(trống)</i>}</span>
              {showAnswers &&
                (s.isTrue === undefined ? (
                  <Badge tone="rose">Thiếu đáp án</Badge>
                ) : (
                  <Badge tone={s.isTrue ? 'emerald' : 'rose'}>{s.isTrue ? 'Đúng' : 'Sai'}</Badge>
                ))}
            </li>
          ))}
          {(q.statements ?? []).length === 0 && <li className="italic text-rose-700">(Chưa có ý nào)</li>}
        </ul>
      )}

      {q.type === 'short' && showAnswers && (
        <p>
          Đáp số: {q.answer ? <b className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-900">{q.answer}</b> : <i className="text-rose-700">(thiếu)</i>}
        </p>
      )}

      {q.type === 'essay' && showAnswers && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="mb-1 text-xs font-semibold text-slate-600">Hướng dẫn chấm</div>
          {(q.rubric ?? []).length === 0 ? (
            <i className="text-rose-700">(Chưa có ý chấm)</i>
          ) : (
            <ul className="space-y-1">
              {q.rubric!.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-5 shrink-0 font-semibold text-slate-500">{i + 1}.</span>
                  <span className="flex-1 whitespace-pre-line">{r.content}</span>
                  <b className="tabular-nums text-slate-700">{fmtPoints(r.points)}đ</b>
                </li>
              ))}
              <li className="flex justify-end border-t border-slate-200 pt-1 text-xs font-semibold text-slate-600">
                Tổng {fmtPoints(sumPoints(q.rubric!.map((r) => r.points)))} / {fmtPoints(q.points)} điểm
              </li>
            </ul>
          )}
        </div>
      )}

      {showAnswers && q.solution && (
        <details className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
          <summary className="cursor-pointer text-xs font-semibold text-slate-600">Lời giải / hướng dẫn</summary>
          <p className="mt-1 whitespace-pre-line">{q.solution}</p>
        </details>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chế độ sửa
// ---------------------------------------------------------------------------
function QuestionEditor({ q, onSave, onCancel }: { q: Question; onSave: (q: Question) => void; onCancel: () => void }) {
  const [d, setD] = useState<Question>(() => JSON.parse(JSON.stringify(q)) as Question);
  const set = (patch: Partial<Question>) => setD((x) => ({ ...x, ...patch }));
  const lab = (t: string) => <label className="mb-1 block text-xs font-semibold text-slate-600">{t}</label>;
  const rubricSum = sumPoints((d.rubric ?? []).map((r) => (Number.isFinite(r.points) ? r.points : 0)));

  const save = () => {
    const out: Question = { ...d };
    if (out.type === 'tf') {
      out.statements = (out.statements ?? []).map((s, i) => ({ ...s, label: TF_LABELS[i] ?? s.label }));
    }
    onSave(out);
  };

  return (
    <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
      <div>
        {lab(q.type === 'tf' ? 'Đề dẫn / dữ kiện chung' : 'Nội dung câu hỏi')}
        <textarea aria-label="Nội dung câu hỏi" rows={4} className={inputClass(!d.stem.trim())} value={d.stem} onChange={(e) => set({ stem: e.target.value })} />
      </div>

      {d.type === 'mcq' && (
        <div className="space-y-1.5">
          {lab('Bốn phương án (chọn nút tròn ở phương án đúng)')}
          {OPTION_KEYS.map((k: OptionKey) => (
            <div key={k} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${d.id}`}
                aria-label={`Phương án ${k} là đáp án đúng`}
                checked={d.correct === k}
                onChange={() => set({ correct: k })}
              />
              <span className="w-5 font-bold">{k}.</span>
              <input
                aria-label={`Nội dung phương án ${k}`}
                className={inputClass(!(d.options?.[k] ?? '').trim())}
                value={d.options?.[k] ?? ''}
                onChange={(e) => set({ options: { A: '', B: '', C: '', D: '', ...d.options, [k]: e.target.value } })}
              />
            </div>
          ))}
        </div>
      )}

      {d.type === 'tf' && (
        <div className="space-y-1.5">
          {lab('Các ý (phải có đúng 4 ý a, b, c, d)')}
          {(d.statements ?? []).map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-center font-bold">{TF_LABELS[i] ?? '?'})</span>
              <input
                aria-label={`Nội dung ý ${TF_LABELS[i] ?? i + 1}`}
                className={inputClass(!s.text.trim())}
                value={s.text}
                onChange={(e) => set({ statements: (d.statements ?? []).map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })}
              />
              <select
                aria-label={`Đáp án ý ${TF_LABELS[i] ?? i + 1}`}
                className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                value={s.isTrue === undefined ? '' : s.isTrue ? 'true' : 'false'}
                onChange={(e) =>
                  set({
                    statements: (d.statements ?? []).map((x, j) =>
                      j === i ? { ...x, isTrue: e.target.value === '' ? undefined : e.target.value === 'true' } : x,
                    ),
                  })
                }
              >
                <option value="">Chưa chọn</option>
                <option value="true">Đúng</option>
                <option value="false">Sai</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Xóa ý ${TF_LABELS[i] ?? i + 1}`}
                onClick={() => set({ statements: (d.statements ?? []).filter((_, j) => j !== i) })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            disabled={(d.statements ?? []).length >= 4}
            onClick={() => set({ statements: [...(d.statements ?? []), { label: TF_LABELS[(d.statements ?? []).length] ?? 'e', text: '' }] })}
          >
            Thêm ý
          </Button>
        </div>
      )}

      {d.type === 'short' && (
        <div>
          {lab('Đáp số (số hoặc cụm từ ngắn)')}
          <input aria-label="Đáp số" className={inputClass(!(d.answer ?? '').trim())} value={d.answer ?? ''} onChange={(e) => set({ answer: e.target.value })} />
        </div>
      )}

      {d.type === 'essay' && (
        <div className="space-y-1.5">
          {lab(`Hướng dẫn chấm — các ý cộng lại phải bằng ${fmtPoints(d.points)} điểm`)}
          {(d.rubric ?? []).map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2 w-5 text-center font-semibold text-slate-500">{i + 1}</span>
              <textarea
                aria-label={`Nội dung ý chấm ${i + 1}`}
                rows={2}
                className={inputClass(!r.content.trim())}
                value={r.content}
                onChange={(e) => set({ rubric: (d.rubric ?? []).map((x, j) => (j === i ? { ...x, content: e.target.value } : x)) })}
              />
              <NumInput
                ariaLabel={`Điểm ý chấm ${i + 1}`}
                className="w-16"
                min={0}
                max={100}
                step={0.25}
                value={r.points}
                onChange={(n) => set({ rubric: (d.rubric ?? []).map((x, j) => (j === i ? { ...x, points: n } : x)) })}
              />
              <Button variant="ghost" size="sm" aria-label={`Xóa ý chấm ${i + 1}`} onClick={() => set({ rubric: (d.rubric ?? []).filter((_, j) => j !== i) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => set({ rubric: [...(d.rubric ?? []), { content: '', points: 0.25 }] })}>
              Thêm ý chấm
            </Button>
            <span className={`text-sm font-semibold tabular-nums ${Math.abs(rubricSum - d.points) < 0.005 ? 'text-emerald-700' : 'text-rose-700'}`}>
              Tổng các ý: {fmtPoints(rubricSum)} / {fmtPoints(d.points)} điểm
            </span>
          </div>
        </div>
      )}

      <div>
        {lab(d.type === 'essay' ? 'Lời giải tham khảo (tuỳ chọn)' : 'Lời giải / hướng dẫn')}
        <textarea aria-label="Lời giải" rows={3} className={inputClass()} value={d.solution} onChange={(e) => set({ solution: e.target.value })} />
      </div>

      <p className="text-xs text-slate-500">
        Điểm của câu ({fmtPoints(q.points)}), dạng, mức độ và chủ đề lấy từ ma trận đã xác nhận nên không sửa ở đây.
      </p>
      <div className="flex justify-end gap-2">
        <Button icon={<X className="h-4 w-4" />} onClick={onCancel}>
          Hủy
        </Button>
        <Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={save}>
          Lưu câu này
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thẻ câu hỏi
// ---------------------------------------------------------------------------
export function QuestionCard({
  q,
  issues,
  aiWarnings,
  showAnswers,
  regenerating,
  disabled,
  onSave,
  onRegenerate,
}: {
  q: Question;
  issues: Issue[];
  aiWarnings: AiWarning[];
  showAnswers: boolean;
  regenerating: boolean;
  disabled: boolean;
  onSave: (q: Question) => void;
  onRegenerate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(true);
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const state = errors.length ? 'error' : warnings.length || aiWarnings.length ? 'warn' : 'ok';
  const ring = { error: 'border-rose-300 ring-1 ring-rose-200', warn: 'border-amber-300', ok: 'border-slate-200' }[state];

  return (
    <article id={`q-${q.id}`} className={`rounded-2xl border bg-white p-4 shadow-sm ${ring}`} data-question={q.id} data-state={state}>
      <header className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1 text-left"
          aria-expanded={open}
          aria-label={open ? `Thu gọn câu ${q.number}` : `Mở rộng câu ${q.number}`}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          <span className="text-base font-bold text-slate-900">Câu {q.number}</span>
        </button>
        <Badge tone="slate" title="Mã câu">
          {q.code}
        </Badge>
        <Badge tone={TYPE_TONE[q.type]}>{QTYPE_SHORT_LABEL[q.type]}</Badge>
        <Badge tone={LEVEL_TONE[q.level]}>{LEVEL_LABEL[q.level]}</Badge>
        <Badge tone="slate">{fmtPoints(q.points)} điểm</Badge>
        {q.origin === 'edited' && <Badge tone="blue">Đã sửa tay</Badge>}
        <span className="min-w-0 flex-1 truncate text-xs text-slate-500" title={`${q.topic} — ${q.unit}`}>
          {q.topic}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {errors.length > 0 && (
            <Badge tone="rose">
              <XCircle className="mr-0.5 h-3 w-3" />
              {errors.length} lỗi
            </Badge>
          )}
          {warnings.length + aiWarnings.length > 0 && (
            <Badge tone="amber">
              <AlertTriangle className="mr-0.5 h-3 w-3" />
              {warnings.length + aiWarnings.length} cảnh báo
            </Badge>
          )}
          {state === 'ok' && (
            <Badge tone="emerald">
              <Check className="mr-0.5 h-3 w-3" />
              Đạt kiểm tra
            </Badge>
          )}
        </div>
      </header>

      {open && (
        <div className="mt-3 space-y-3">
          {q.outcome && (
            <p className="text-xs text-slate-500">
              <b>Yêu cầu cần đạt:</b> {q.outcome}
            </p>
          )}

          {editing ? (
            <QuestionEditor
              q={q}
              onCancel={() => setEditing(false)}
              onSave={(nq) => {
                onSave(nq);
                setEditing(false);
              }}
            />
          ) : (
            <QuestionBody q={q} showAnswers={showAnswers} />
          )}

          {errors.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-sm text-rose-900" aria-label={`Lỗi của câu ${q.number}`}>
              {errors.map((i, k) => (
                <li key={k} className="flex gap-1.5">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <span>{i.message}</span>
                </li>
              ))}
            </ul>
          )}
          {warnings.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-900">
              {warnings.map((i, k) => (
                <li key={k} className="flex gap-1.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>{i.message}</span>
                </li>
              ))}
            </ul>
          )}
          {aiWarnings.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-violet-200 bg-violet-50 p-2.5 text-sm text-violet-900">
              {aiWarnings.map((w, k) => (
                <li key={k} className="flex gap-1.5">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  <span>
                    <b>Cảnh báo AI (tham khảo) — {AI_KIND[w.kind]}:</b> {w.message}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {!editing && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditing(true)} disabled={disabled || regenerating}>
                Sửa câu này
              </Button>
              <Button size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} loading={regenerating} onClick={onRegenerate} disabled={disabled}>
                {regenerating ? 'Đang tạo lại…' : 'Tạo lại riêng câu này'}
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
