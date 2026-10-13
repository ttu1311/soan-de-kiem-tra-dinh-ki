import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, RefreshCw, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import { activeParts, fmtPoints } from '../../shared/blueprint.js';
import { QTYPE_LABEL, QTYPES } from '../../shared/schema.js';
import { globalIssues, issuesForQuestion } from '../../shared/validate.js';
import type { Exam } from '../useExam.js';
import { QuestionCard } from './QuestionCard.js';
import { Badge, Banner, Button, Card, useConfirm, useToast } from './ui.js';

type Filter = 'all' | 'error' | 'warn';

export function StepQuestions({ exam }: { exam: Exam }) {
  const { state, slots, examIssues, checklist, busy, error, regenerating } = exam;
  const confirm = useConfirm();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [showAnswers, setShowAnswers] = useState(true);

  const questions = state.questions;
  const parts = useMemo(() => activeParts(slots), [slots]);
  const gIssues = globalIssues(examIssues);
  const errorCount = examIssues.filter((i) => i.severity === 'error').length;
  const warnCount = examIssues.filter((i) => i.severity === 'warning').length;

  if (!state.confirmedMatrix) {
    return (
      <Banner tone="info" title="Cần xác nhận ma trận trước" actions={<Button variant="primary" onClick={() => exam.setStep(2)}>Về bước ma trận</Button>}>
        Câu hỏi chỉ được tạo dựa trên ma trận đã xác nhận.
      </Banner>
    );
  }

  const generate = async () => {
    if (questions) {
      const ok = await confirm({
        title: 'Tạo lại toàn bộ câu hỏi?',
        message: 'Toàn bộ câu hỏi hiện có (kể cả phần bạn đã sửa tay) sẽ bị thay thế, và trạng thái duyệt đề sẽ bị hủy. Ma trận giữ nguyên.',
        confirmLabel: 'Tạo lại tất cả',
        danger: true,
      });
      if (!ok) return;
    }
    const ok = await exam.runGenerateQuestions();
    if (ok) toast('AI đã tạo câu hỏi. Hãy xem kết quả kiểm tra bằng mã và rà soát từng câu.');
  };

  const review = async () => {
    const n = await exam.runReview();
    if (n !== null) toast(n === 0 ? 'AI rà soát: không thấy vấn đề nổi bật.' : `AI rà soát: có ${n} cảnh báo tham khảo.`, n === 0 ? 'success' : 'info');
  };

  // ---------------------------------------------------------------- chưa có câu hỏi
  if (!questions) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Tạo câu hỏi, đáp án và hướng dẫn chấm</h2>
          <p className="text-sm text-slate-600">
            AI sẽ viết đúng <b>{slots.length} câu</b> theo ma trận đã xác nhận, bám nội dung nguồn bạn đã dán. Sau đó chương trình kiểm tra bằng mã (tổng điểm, số câu, đủ 4 ý Đúng/Sai, thiếu đáp án…) và báo lỗi theo từng câu.
          </p>
        </div>
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {parts.map((p) => (
              <div key={p.type} className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phần {p.roman}</div>
                <div className="font-semibold text-slate-900">{QTYPE_LABEL[p.type]}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {p.count} câu · {fmtPoints(p.points)} điểm
                </div>
              </div>
            ))}
          </div>
        </Card>
        {error && (error.where === 'questions' || error.where === 'question') && (
          <Banner tone="error" title="Không tạo được câu hỏi">
            {error.message}
            {error.issues && (
              <ul className="mt-1 list-disc pl-5">
                {error.issues.map((m, k) => (
                  <li key={k}>{m}</li>
                ))}
              </ul>
            )}
          </Banner>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => exam.setStep(2)}>
            Về ma trận
          </Button>
          <div className="flex items-center gap-3">
            {busy === 'questions' && <span className="text-sm text-slate-600">AI đang viết câu hỏi… thường mất 30–120 giây, đừng đóng trang.</span>}
            <Button variant="primary" size="lg" loading={busy === 'questions'} icon={<Sparkles className="h-4 w-4" />} onClick={generate}>
              Tạo câu hỏi bằng AI
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- có câu hỏi
  const stateOf = (id: string) => {
    const is = issuesForQuestion(examIssues, id);
    if (is.some((i) => i.severity === 'error')) return 'error';
    if (is.length > 0 || state.aiWarnings.some((w) => w.questionId === id)) return 'warn';
    return 'ok';
  };
  const visible = (id: string) => filter === 'all' || (filter === 'error' ? stateOf(id) === 'error' : stateOf(id) !== 'ok');
  const errQuestions = questions.filter((q) => stateOf(q.id) === 'error').length;
  const warnQuestions = questions.filter((q) => stateOf(q.id) === 'warn').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Câu hỏi, đáp án và kết quả kiểm tra</h2>
          <p className="text-sm text-slate-600">Rà soát từng câu; sửa tay hoặc tạo lại riêng câu lỗi. Ma trận đã xác nhận không bị thay đổi.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" icon={showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} onClick={() => setShowAnswers((v) => !v)}>
            {showAnswers ? 'Ẩn đáp án' : 'Hiện đáp án'}
          </Button>
          <Button size="sm" icon={<ShieldCheck className="h-4 w-4" />} loading={busy === 'review'} disabled={busy !== null} onClick={review}>
            Nhờ AI rà soát thêm
          </Button>
          <Button size="sm" icon={<RefreshCw className="h-4 w-4" />} disabled={busy !== null} onClick={generate}>
            Tạo lại tất cả
          </Button>
        </div>
      </div>

      {/* Kết quả kiểm tra bằng mã */}
      <Card className="p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900">Kết quả kiểm tra bằng mã</h3>
          <div className="flex gap-2">
            <Badge tone={errorCount ? 'rose' : 'emerald'}>{errorCount ? `${errorCount} lỗi` : 'Không có lỗi'}</Badge>
            {warnCount > 0 && <Badge tone="amber">{warnCount} cảnh báo</Badge>}
          </div>
        </div>
        <ul className="grid gap-1.5 sm:grid-cols-2" aria-label="Danh sách kiểm tra">
          {checklist.map((c) => (
            <li key={c.id} className={`flex items-start gap-2 text-sm ${c.ok ? 'text-slate-700' : 'font-medium text-rose-800'}`} data-check={c.id} data-ok={c.ok}>
              {c.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />}
              <span>
                {c.label}
                {!c.ok && <span className="ml-1">({c.failures} lỗi)</span>}
              </span>
            </li>
          ))}
        </ul>
        {gIssues.filter((i) => i.severity === 'error').length > 0 && (
          <ul className="mt-3 space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-sm text-rose-900" aria-label="Lỗi toàn đề">
            {gIssues
              .filter((i) => i.severity === 'error')
              .map((i, k) => (
                <li key={k} className="flex gap-1.5">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <span>{i.message}</span>
                </li>
              ))}
          </ul>
        )}
        {state.aiWarnings.length > 0 && (
          <p className="mt-2 text-xs text-violet-800">
            Có {state.aiWarnings.length} cảnh báo do AI đưa ra (màu tím, chỉ để tham khảo — không thay thế kiểm tra bằng mã).
          </p>
        )}
      </Card>

      {error && (error.where === 'question' || error.where === 'review' || error.where === 'questions') && (
        <Banner tone="error" title={error.where === 'review' ? 'Không rà soát được bằng AI' : error.questionId ? 'Không tạo lại được câu hỏi' : 'Có lỗi khi gọi AI'}>
          {error.message}
        </Banner>
      )}

      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Lọc câu hỏi">
        {(
          [
            ['all', `Tất cả (${questions.length})`],
            ['error', `Có lỗi (${errQuestions})`],
            ['warn', `Có cảnh báo (${warnQuestions})`],
          ] as [Filter, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition ${filter === k ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Danh sách theo phần */}
      {parts.map((part) => {
        const list = questions.filter((q) => q.type === part.type).sort((a, b) => a.number - b.number);
        const shown = list.filter((q) => visible(q.id));
        return (
          <section key={part.type} className="space-y-3" aria-label={`Phần ${part.roman}`}>
            <h3 className="flex flex-wrap items-baseline gap-2 text-base font-bold text-slate-900">
              PHẦN {part.roman}. {QTYPE_LABEL[part.type]}
              <span className="text-sm font-medium text-slate-500">
                {part.count} câu · {fmtPoints(part.points)} điểm
              </span>
            </h3>
            {shown.length === 0 && <p className="text-sm italic text-slate-500">Không có câu nào khớp bộ lọc.</p>}
            {shown.map((q) => (
              <QuestionCard
                key={q.id}
                q={q}
                issues={issuesForQuestion(examIssues, q.id)}
                aiWarnings={state.aiWarnings.filter((w) => w.questionId === q.id)}
                showAnswers={showAnswers}
                regenerating={regenerating.has(q.id)}
                disabled={busy !== null}
                onSave={(nq) => {
                  exam.updateQuestion(q.id, () => nq);
                  toast(`Đã lưu câu ${nq.number} (${nq.code}).`);
                }}
                onRegenerate={async () => {
                  const hint = issuesForQuestion(examIssues, q.id)
                    .filter((i) => i.severity === 'error')
                    .map((i) => i.message)
                    .join('\n');
                  const ok = await exam.runRegenerateQuestion(q.id, hint);
                  if (ok) toast(`Đã tạo lại câu ${q.number} (${q.code}).`);
                }}
              />
            ))}
          </section>
        );
      })}

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => exam.setStep(2)}>
          Về ma trận
        </Button>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${errorCount ? 'text-rose-700' : 'text-emerald-700'}`}>
            {errorCount ? `Còn ${errorCount} lỗi cần sửa trước khi duyệt` : 'Không còn lỗi — sẵn sàng xem trước và duyệt'}
          </span>
          <Button variant="primary" size="lg" icon={<ArrowRight className="h-4 w-4" />} onClick={() => exam.setStep(4)}>
            Xem trước & duyệt đề
          </Button>
        </div>
      </div>
    </div>
  );
}
