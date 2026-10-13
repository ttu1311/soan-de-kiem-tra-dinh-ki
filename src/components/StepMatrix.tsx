import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, LockOpen, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { buildMatrixDoc } from '../../shared/documents.js';
import { computeTotals, fmtPercent, fmtPoints } from '../../shared/blueprint.js';
import { newMatrixRow } from '../../shared/questions.js';
import { LEVELS, LEVEL_LABEL, QTYPES, QTYPE_LABEL, QTYPE_SHORT_LABEL, type Level, type MatrixRow, type QType } from '../../shared/schema.js';
import { hasErrors } from '../../shared/validate.js';
import type { Exam } from '../useExam.js';
import { FitPage } from './DocView.js';
import { NumInput } from './NumInput.js';
import { Badge, Banner, Button, Card, inputClass, useConfirm, useToast } from './ui.js';

const TYPE_TONE: Record<QType, 'blue' | 'amber' | 'indigo' | 'emerald'> = {
  mcq: 'blue',
  tf: 'amber',
  short: 'indigo',
  essay: 'emerald',
};

export function StepMatrix({ exam }: { exam: Exam }) {
  const { state, matrixIssues, slots, busy, error } = exam;
  const confirm = useConfirm();
  const toast = useToast();
  const [ack, setAck] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const matrix = state.matrix;
  const locked = Boolean(state.confirmedMatrix);
  const input = state.input;

  const totals = useMemo(
    () => (matrix ? computeTotals(slots, matrix.rows, input.structure.totalScore) : null),
    [slots, matrix, input.structure.totalScore],
  );

  const previewDoc = useMemo(
    () => (matrix ? buildMatrixDoc({ input, matrix, questions: [] }) : null),
    [matrix, input],
  );

  if (!matrix || !totals) {
    return (
      <Banner tone="info" title="Chưa có ma trận" actions={<Button variant="primary" onClick={() => exam.setStep(1)}>Về bước 1</Button>}>
        Hãy nhập thông tin ở bước 1 rồi bấm "Kiểm tra & tạo ma trận bằng AI".
      </Banner>
    );
  }

  const errors = matrixIssues.filter((i) => i.severity === 'error');
  const warnings = matrixIssues.filter((i) => i.severity === 'warning');
  const missing = state.matrixMissing;
  const needAck = missing.length > 0;
  const canConfirm = errors.length === 0 && (!needAck || ack);
  const essaySlots = slots.filter((s) => s.type === 'essay');
  const topicNames = input.topics.map((t) => t.name.trim()).filter(Boolean);

  const patchRow = (id: string, fn: (r: MatrixRow) => MatrixRow, resetOverrides = false) =>
    exam.setMatrix((m) => ({
      ...m,
      rows: m.rows.map((r) => (r.id === id ? fn(r) : r)),
      pointOverrides: resetOverrides ? {} : m.pointOverrides,
    }));

  const regenerate = async () => {
    const ok = await confirm({
      title: 'Tạo lại ma trận bằng AI?',
      message: 'Mọi chỉnh sửa trên ma trận hiện tại và các câu hỏi đã tạo sẽ bị xóa.',
      confirmLabel: 'Tạo lại',
      danger: true,
    });
    if (!ok) return;
    const done = await exam.runGenerateMatrix();
    if (done) {
      setAck(false);
      toast('AI đã lập lại bản nháp ma trận.');
    }
  };

  const doConfirm = () => {
    exam.confirmMatrix();
    toast('Đã xác nhận ma trận. Ma trận được khóa để các câu hỏi bám đúng theo nó.');
  };

  const unlock = async () => {
    const hasQ = Boolean(state.questions);
    const ok = await confirm({
      title: 'Mở khóa ma trận để sửa?',
      message: hasQ
        ? 'Các câu hỏi đã tạo (kể cả phần bạn đã sửa tay) và trạng thái duyệt đề sẽ bị xóa, vì đề phải khớp với ma trận. Bạn có chắc không?'
        : 'Bạn sẽ có thể sửa lại ma trận và cần xác nhận lại.',
      confirmLabel: 'Mở khóa',
      danger: hasQ,
    });
    if (ok) {
      exam.unlockMatrix();
      setAck(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Ma trận và bản đặc tả (bản nháp do AI lập)</h2>
          <p className="text-sm text-slate-600">
            Mỗi hàng là một nội dung kiến thức; mỗi ô là <b>số câu</b> theo dạng và mức độ. Hãy sửa cho đúng ý bạn rồi bấm <b>Xác nhận ma trận</b>.
          </p>
        </div>
        {locked ? (
          <Badge tone="emerald">
            <Lock className="mr-1 h-3 w-3" /> Đã xác nhận (khóa)
          </Badge>
        ) : (
          <Badge tone="amber">Bản nháp — chưa xác nhận</Badge>
        )}
      </div>

      {exam.inputChangedSinceMatrix && !locked && (
        <Banner tone="warn" actions={<Button size="sm" onClick={() => exam.setStep(1)}>Xem lại bước 1</Button>}>
          Bạn đã sửa thông tin ở bước 1 sau khi AI lập ma trận. Có thể cần tạo lại ma trận cho khớp.
        </Banner>
      )}
      {missing.length > 0 && (
        <Banner tone="warn" title="AI cho biết nội dung nguồn chưa đủ cho một số chủ đề">
          <ul className="list-disc space-y-0.5 pl-5">
            {missing.map((m, i) => (
              <li key={i}>
                <b>{m.topic}</b>: {m.reason}
              </li>
            ))}
          </ul>
          <p className="mt-1">Hãy quay lại bước 1 bổ sung nội dung nguồn, hoặc xóa/giảm câu của chủ đề đó. Ứng dụng không tự bịa nội dung để lấp chỗ trống.</p>
        </Banner>
      )}
      {state.matrixNotes.length > 0 && (
        <Banner tone="info" title="Ghi chú của AI">
          <ul className="list-disc space-y-0.5 pl-5">
            {state.matrixNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </Banner>
      )}

      {/* Tổng hợp nhanh */}
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QTYPES.map((t) => (
            <div key={t} className="rounded-xl border border-slate-200 p-3">
              <Badge tone={TYPE_TONE[t]}>{QTYPE_LABEL[t]}</Badge>
              <div className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900">
                {totals.typeCount[t]} <span className="text-sm font-medium text-slate-500">câu</span>
              </div>
              <div className="text-sm text-slate-600">
                {fmtPoints(totals.typePoints[t])} / {fmtPoints(input.structure.points[t])} điểm
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-sm">
          <span className="font-semibold text-slate-800">Tổng: {totals.totalCount} câu · {fmtPoints(totals.totalPoints)} điểm</span>
          {LEVELS.map((l) => (
            <span key={l} className="text-slate-600">
              {LEVEL_LABEL[l]}: <b className="tabular-nums">{fmtPercent(totals.levelPercent[l])}%</b>{' '}
              <span className="text-slate-400">(mục tiêu {input.structure.levelTarget[l]}%)</span>
            </span>
          ))}
        </div>
      </Card>

      {/* Các hàng */}
      <div className="space-y-4">
        {matrix.rows.map((row, idx) => {
          const rowTotal = QTYPES.reduce((a, t) => a + LEVELS.reduce((b, l) => b + row.counts[t][l], 0), 0);
          return (
            <Card key={row.id} className="p-4">
              <div className="mb-3 flex flex-wrap items-start gap-3">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">{idx + 1}</span>
                <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor={`topic-${row.id}`}>
                      Chủ đề / Chương
                    </label>
                    <input
                      id={`topic-${row.id}`}
                      list={`topics-${row.id}`}
                      disabled={locked}
                      className={inputClass(!row.topic.trim())}
                      value={row.topic}
                      onChange={(e) => patchRow(row.id, (r) => ({ ...r, topic: e.target.value }))}
                    />
                    <datalist id={`topics-${row.id}`}>
                      {topicNames.map((n) => (
                        <option key={n} value={n} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor={`unit-${row.id}`}>
                      Nội dung / đơn vị kiến thức
                    </label>
                    <input
                      id={`unit-${row.id}`}
                      disabled={locked}
                      className={inputClass(!row.unit.trim())}
                      value={row.unit}
                      onChange={(e) => patchRow(row.id, (r) => ({ ...r, unit: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="slate">{rowTotal} câu</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={locked || matrix.rows.length <= 1}
                    aria-label={`Xóa hàng ${idx + 1}`}
                    title="Xóa hàng"
                    onClick={() => exam.setMatrix((m) => ({ ...m, rows: m.rows.filter((r) => r.id !== row.id), pointOverrides: {} }))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Yêu cầu cần đạt (bản đặc tả)</div>
                  {LEVELS.map((l) => (
                    <div key={l} className="flex items-start gap-2">
                      <span className="mt-2 w-16 shrink-0 text-xs font-semibold text-slate-600">{LEVEL_LABEL[l]}</span>
                      <textarea
                        aria-label={`Yêu cầu cần đạt mức ${LEVEL_LABEL[l]}, hàng ${idx + 1}`}
                        rows={2}
                        disabled={locked}
                        className={inputClass(QTYPES.some((t) => row.counts[t][l] > 0) && !row.outcomes[l].trim())}
                        placeholder={QTYPES.some((t) => row.counts[t][l] > 0) ? 'Bắt buộc vì có câu ở mức này' : 'Không có câu ở mức này'}
                        value={row.outcomes[l]}
                        onChange={(e) => patchRow(row.id, (r) => ({ ...r, outcomes: { ...r.outcomes, [l]: e.target.value } }))}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Số câu</div>
                  <table className="text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500">
                        <th className="pr-2 text-left font-semibold" />
                        {LEVELS.map((l) => (
                          <th key={l} className="px-1 text-center font-semibold">
                            {LEVEL_LABEL[l]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {QTYPES.map((t) => (
                        <tr key={t}>
                          <td className="whitespace-nowrap py-0.5 pr-2">
                            <Badge tone={TYPE_TONE[t]}>{QTYPE_SHORT_LABEL[t]}</Badge>
                          </td>
                          {LEVELS.map((l: Level) => (
                            <td key={l} className="px-1 py-0.5 text-center">
                              <NumInput
                                ariaLabel={`Số câu ${QTYPE_SHORT_LABEL[t]} mức ${LEVEL_LABEL[l]}, hàng ${idx + 1}`}
                                className="w-14"
                                min={0}
                                max={30}
                                disabled={locked}
                                value={row.counts[t][l]}
                                onChange={(n) =>
                                  patchRow(
                                    row.id,
                                    (r) => ({ ...r, counts: { ...r.counts, [t]: { ...r.counts[t], [l]: Math.round(n) } } }),
                                    true,
                                  )
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          );
        })}
        {!locked && (
          <Button
            icon={<Plus className="h-4 w-4" />}
            disabled={matrix.rows.length >= 24}
            onClick={() => exam.setMatrix((m) => ({ ...m, rows: [...m.rows, newMatrixRow(`r${Date.now().toString(36)}`)] }))}
          >
            Thêm hàng (nội dung kiến thức)
          </Button>
        )}
      </div>

      {/* Điểm từng câu tự luận */}
      {essaySlots.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-bold text-slate-900">Điểm từng câu tự luận</h3>
          <p className="mb-3 text-sm text-slate-600">
            Mặc định chia đều. Bạn có thể đặt điểm khác nhau cho từng câu; tổng phải bằng {fmtPoints(input.structure.points.essay)} điểm.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {essaySlots.map((s) => (
              <label key={s.id} className="flex items-center gap-1.5 text-sm text-slate-700">
                <span className="font-semibold">{s.code}</span>
                <NumInput
                  ariaLabel={`Điểm câu ${s.code}`}
                  className="w-16"
                  min={0}
                  max={100}
                  step={0.25}
                  disabled={locked}
                  value={s.points}
                  onChange={(n) =>
                    exam.setMatrix((m) => {
                      const next: Record<string, number> = {};
                      for (const x of essaySlots) next[x.id] = x.id === s.id ? n : x.points;
                      return { ...m, pointOverrides: next };
                    })
                  }
                />
              </label>
            ))}
            {!locked && Object.keys(matrix.pointOverrides).length > 0 && (
              <Button size="sm" onClick={() => exam.setMatrix((m) => ({ ...m, pointOverrides: {} }))}>
                Chia đều lại
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Kiểm tra bằng mã */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="space-y-3">
          {errors.length > 0 && (
            <Banner tone="error" title={`Ma trận chưa hợp lệ (${errors.length} lỗi) — cần sửa trước khi xác nhận`}>
              <ul className="list-disc space-y-0.5 pl-5">
                {errors.map((i, k) => (
                  <li key={k}>{i.message}</li>
                ))}
              </ul>
            </Banner>
          )}
          {warnings.length > 0 && (
            <Banner tone="warn" title="Cảnh báo (không chặn)">
              <ul className="list-disc space-y-0.5 pl-5">
                {warnings.map((i, k) => (
                  <li key={k}>{i.message}</li>
                ))}
              </ul>
            </Banner>
          )}
        </div>
      )}
      {errors.length === 0 && (
        <Banner tone="success">Ma trận qua kiểm tra bằng mã: tổng điểm {fmtPoints(totals.totalPoints)}, {totals.totalCount} câu, mọi ô có yêu cầu cần đạt.</Banner>
      )}

      {/* Xem trước ma trận theo mẫu */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900">Xem trước bảng ma trận (bố cục theo mẫu phụ lục)</h3>
          <Button size="sm" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? 'Ẩn xem trước' : 'Hiện xem trước'}
          </Button>
        </div>
        {showPreview && previewDoc && (
          <div className="mt-3">
            <FitPage doc={previewDoc} />
          </div>
        )}
      </Card>

      {error && error.where === 'matrix' && (
        <Banner tone="error" title="Không tạo lại được ma trận">
          {error.message}
        </Banner>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex flex-wrap gap-2">
          <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => exam.setStep(1)}>
            Bước 1
          </Button>
          {!locked && (
            <Button icon={<RefreshCw className="h-4 w-4" />} onClick={regenerate} loading={busy === 'matrix'} disabled={busy !== null}>
              Tạo lại ma trận bằng AI
            </Button>
          )}
          {locked && (
            <Button icon={<LockOpen className="h-4 w-4" />} onClick={unlock}>
              Mở khóa để sửa ma trận
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!locked && needAck && (
            <label className="flex max-w-xs items-start gap-2 text-xs text-slate-700">
              <input type="checkbox" className="mt-0.5" checked={ack} onChange={(e) => setAck(e.target.checked)} />
              Tôi đã đọc cảnh báo thiếu nội dung nguồn và chịu trách nhiệm về ma trận này.
            </label>
          )}
          {!locked ? (
            <Button variant="success" size="lg" disabled={!canConfirm} icon={<CheckCircle2 className="h-4 w-4" />} onClick={doConfirm}>
              Xác nhận ma trận
            </Button>
          ) : (
            <Button variant="primary" size="lg" icon={<ArrowRight className="h-4 w-4" />} onClick={() => exam.setStep(3)}>
              Tiếp tục: tạo câu hỏi
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
