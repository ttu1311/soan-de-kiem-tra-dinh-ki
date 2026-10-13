import React, { useMemo, useState } from 'react';
import { ArrowRight, FlaskConical, Plus, Sparkles, Trash2 } from 'lucide-react';
import {
  DEFAULT_COUNTS,
  DEFAULT_LEVEL_TARGET,
  DEFAULT_POINTS,
  fmtPoints,
  moveShortToTf,
  newId,
  sumPoints,
  suggestCount,
} from '../../shared/blueprint.js';
import {
  LEVELS,
  LEVEL_LABEL,
  LIMITS,
  QTYPES,
  QTYPE_LABEL,
  type ExamInput,
  type Issue,
  type QType,
} from '../../shared/schema.js';
import { hasErrors } from '../../shared/validate.js';
import { sampleToan10Input } from '../data/sampleToan10.js';
import type { Exam } from '../useExam.js';
import { NumInput } from './NumInput.js';
import { Badge, Banner, Button, Card, Field, inputClass, useConfirm, useToast } from './ui.js';

const SUBJECTS = [
  'Toán',
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Ngữ văn',
  'Lịch sử',
  'Địa lí',
  'Tiếng Anh',
  'Tin học',
  'Công nghệ',
  'Giáo dục kinh tế và pháp luật',
  'Giáo dục quốc phòng và an ninh',
];
const SEMESTERS = ['Giữa học kì 1', 'Cuối học kì 1', 'Giữa học kì 2', 'Cuối học kì 2'];

const TYPE_TONE: Record<QType, 'blue' | 'amber' | 'indigo' | 'emerald'> = {
  mcq: 'blue',
  tf: 'amber',
  short: 'indigo',
  essay: 'emerald',
};

const isBlank = (i: ExamInput) =>
  !i.info.subject.trim() && !i.info.title.trim() && !i.sourceText.trim() && i.topics.every((t) => !t.name.trim() && !t.requirements.trim());

function fieldErrors(issues: Issue[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const i of issues) if (i.severity === 'error' && i.field && !m.has(i.field)) m.set(i.field, i.message);
  return m;
}

export function StepInput({ exam }: { exam: Exam }) {
  const { state, setInput, inputIssues, busy, error } = exam;
  const input = state.input;
  const confirm = useConfirm();
  const toast = useToast();
  const [attempted, setAttempted] = useState(false);

  const locked = Boolean(state.confirmedMatrix);
  const errs = useMemo(() => fieldErrors(inputIssues), [inputIssues]);
  const blocking = inputIssues.filter((i) => i.severity === 'error');
  const warnings = inputIssues.filter((i) => i.severity === 'warning');
  const show = (field: string) => (attempted ? errs.get(field) : undefined);

  const { structure } = input;
  const pointsSum = sumPoints(QTYPES.map((t) => structure.points[t] || 0));
  const srcLen = input.sourceText.trim().length;

  const loadExample = async () => {
    if (!isBlank(input)) {
      const ok = await confirm({
        title: 'Thay dữ liệu bằng ví dụ?',
        message: 'Thông tin đang nhập (và ma trận/câu hỏi đã tạo) sẽ được thay bằng ví dụ Toán 10 — Hàm số bậc hai. Ví dụ chỉ điền sẵn ĐẦU VÀO; ma trận và câu hỏi vẫn do AI tạo.',
        confirmLabel: 'Dùng ví dụ',
      });
      if (!ok) return;
    }
    exam.resetAll();
    exam.update((s) => ({ ...s, input: sampleToan10Input() }));
    setAttempted(false);
    toast('Đã điền ví dụ Toán 10 — Hàm số bậc hai. Bấm "Kiểm tra & tạo ma trận" để AI lập ma trận.');
  };

  const submit = async () => {
    setAttempted(true);
    if (hasErrors(inputIssues)) {
      document.getElementById('input-problems')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (state.matrix) {
      const ok = await confirm({
        title: 'Tạo lại ma trận?',
        message: 'Ma trận hiện có, các câu hỏi đã tạo và trạng thái duyệt sẽ bị xóa. Bạn có chắc muốn để AI lập lại ma trận từ đầu?',
        confirmLabel: 'Tạo lại',
        danger: true,
      });
      if (!ok) return;
    }
    const ok = await exam.runGenerateMatrix();
    if (ok) {
      toast('AI đã lập bản nháp ma trận. Hãy kiểm tra, sửa và bấm "Xác nhận ma trận".');
      exam.setStep(2);
    }
  };

  const setStruct = (fn: (s: ExamInput['structure']) => ExamInput['structure']) => setInput((i) => ({ ...i, structure: fn(i.structure) }));

  const totalOk = Math.abs(pointsSum - structure.totalScore) < 0.005;

  return (
    <div className="space-y-5">
      <Banner tone="info" title="Cách hoạt động">
        Bạn nhập thông tin và nội dung đã dạy → AI lập <b>bản nháp ma trận + bản đặc tả</b> để bạn sửa và xác nhận → AI viết câu hỏi,
        đáp án, hướng dẫn chấm → chương trình kiểm tra bằng mã → bạn xem trước và <b>duyệt</b> → tải .docx hoặc in A4. Ứng dụng không tự
        đoán chương trình hay sách giáo khoa: chỉ dùng nội dung bạn cung cấp.
      </Banner>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" icon={<FlaskConical className="h-4 w-4" />} onClick={loadExample} disabled={busy !== null}>
          Thử với ví dụ (Toán 10 – Hàm số bậc hai)
        </Button>
        <span className="text-xs text-slate-500">Ví dụ chỉ điền sẵn phần nhập liệu; ma trận và câu hỏi luôn do AI tạo.</span>
      </div>

      {/* 1. Thông tin chung */}
      <Card className="p-5">
        <h2 className="mb-4 text-base font-bold text-slate-900">1. Thông tin bài kiểm tra</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Field label="Môn học *" htmlFor="subject" error={show('info.subject')} className="lg:col-span-2">
            <input
              id="subject"
              list="subjects"
              className={inputClass(Boolean(show('info.subject')))}
              value={input.info.subject}
              placeholder="Ví dụ: Toán"
              onChange={(e) => setInput((i) => ({ ...i, info: { ...i.info, subject: e.target.value } }))}
            />
            <datalist id="subjects">
              {SUBJECTS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="Lớp (THPT) *" htmlFor="grade" error={show('info.grade')}>
            <select
              id="grade"
              className={inputClass()}
              value={input.info.grade}
              onChange={(e) => setInput((i) => ({ ...i, info: { ...i.info, grade: e.target.value as ExamInput['info']['grade'] } }))}
            >
              <option value="10">Lớp 10</option>
              <option value="11">Lớp 11</option>
              <option value="12">Lớp 12</option>
            </select>
          </Field>
          <Field label="Thời lượng (phút) *" htmlFor="duration" error={show('info.durationMinutes')}>
            <NumInput
              id="duration"
              value={input.info.durationMinutes}
              min={0}
              max={600}
              invalid={Boolean(show('info.durationMinutes'))}
              className="w-full py-2"
              onChange={(n) => setInput((i) => ({ ...i, info: { ...i.info, durationMinutes: n } }))}
            />
          </Field>
          <Field label="Tên bài kiểm tra *" htmlFor="title" error={show('info.title')} className="sm:col-span-2 lg:col-span-6">
            <input
              id="title"
              className={inputClass(Boolean(show('info.title')))}
              value={input.info.title}
              placeholder="Ví dụ: Kiểm tra giữa học kì 1 – Hàm số bậc hai"
              onChange={(e) => setInput((i) => ({ ...i, info: { ...i.info, title: e.target.value } }))}
            />
          </Field>
          <Field label="Trường (tuỳ chọn)" htmlFor="school" className="sm:col-span-2 lg:col-span-3" hint="Để trống: tài liệu sẽ có dòng chấm để điền tay.">
            <input
              id="school"
              className={inputClass()}
              value={input.info.school}
              onChange={(e) => setInput((i) => ({ ...i, info: { ...i.info, school: e.target.value } }))}
            />
          </Field>
          <Field label="Kì kiểm tra (tuỳ chọn)" htmlFor="semester" className="lg:col-span-2">
            <input
              id="semester"
              list="semesters"
              className={inputClass()}
              value={input.info.semester}
              onChange={(e) => setInput((i) => ({ ...i, info: { ...i.info, semester: e.target.value } }))}
            />
            <datalist id="semesters">
              {SEMESTERS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="Năm học (tuỳ chọn)" htmlFor="year" className="lg:col-span-1">
            <input
              id="year"
              className={inputClass()}
              value={input.info.academicYear}
              placeholder="2026 – 2027"
              onChange={(e) => setInput((i) => ({ ...i, info: { ...i.info, academicYear: e.target.value } }))}
            />
          </Field>
        </div>
      </Card>

      {/* 2. Cấu trúc điểm */}
      <Card className="p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900">2. Cấu trúc đề và thang điểm</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={locked}
              onClick={() =>
                setStruct((s) => ({
                  ...s,
                  totalScore: 10,
                  points: { ...DEFAULT_POINTS },
                  counts: { ...DEFAULT_COUNTS },
                  levelTarget: { ...DEFAULT_LEVEL_TARGET },
                }))
              }
            >
              Cấu hình mặc định (3 – 2 – 2 – 3)
            </Button>
            <Button size="sm" disabled={locked || structure.points.short === 0} onClick={() => setStruct((s) => moveShortToTf(s))}>
              Môn không dùng trả lời ngắn → chuyển điểm sang Đúng–Sai
            </Button>
          </div>
        </div>
        <p className="mb-3 text-sm text-slate-600">
          Mặc định tham khảo mẫu trong phụ lục Công văn 7991 (khoảng 3 – 2 – 2 – 3 điểm). Đây không phải quy tắc cứng cho mọi môn — hãy
          điều chỉnh theo môn học và hướng dẫn của trường.
        </p>
        {locked && (
          <Banner tone="warn" className="mb-3">
            Ma trận đã được xác nhận nên cấu trúc điểm đang bị khóa. Mở khóa ma trận ở bước 2 nếu muốn đổi.
          </Banner>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Dạng câu</th>
                <th className="px-2 py-2 text-center">Tổng điểm</th>
                <th className="px-2 py-2 text-center">Số câu dự kiến</th>
                <th className="px-2 py-2 text-center">Điểm / câu</th>
              </tr>
            </thead>
            <tbody>
              {QTYPES.map((t) => {
                const per = structure.counts[t] > 0 ? structure.points[t] / structure.counts[t] : 0;
                return (
                  <tr key={t} className="border-t border-slate-100">
                    <td className="py-2 pr-3">
                      <Badge tone={TYPE_TONE[t]}>{QTYPE_LABEL[t]}</Badge>
                      {t === 'tf' && <span className="ml-2 text-xs text-slate-500">mỗi câu có đúng 4 ý a, b, c, d</span>}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <NumInput
                        ariaLabel={`Tổng điểm ${QTYPE_LABEL[t]}`}
                        className="w-20"
                        value={structure.points[t]}
                        min={0}
                        max={1000}
                        step={0.25}
                        disabled={locked}
                        onChange={(n) =>
                          setStruct((s) => ({
                            ...s,
                            points: { ...s.points, [t]: n },
                            counts: s.counts[t] === 0 && n > 0 ? { ...s.counts, [t]: suggestCount(t, n) } : s.counts,
                          }))
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <NumInput
                        ariaLabel={`Số câu ${QTYPE_LABEL[t]}`}
                        className="w-20"
                        value={structure.counts[t]}
                        min={0}
                        max={60}
                        disabled={locked}
                        onChange={(n) => setStruct((s) => ({ ...s, counts: { ...s.counts, [t]: Math.round(n) } }))}
                      />
                    </td>
                    <td className="px-2 py-2 text-center tabular-nums text-slate-600">{per > 0 ? fmtPoints(per) : '—'}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-slate-200 font-semibold">
                <td className="py-2 pr-3">Thang điểm của bài</td>
                <td className="px-2 py-2 text-center">
                  <NumInput
                    ariaLabel="Thang điểm"
                    className="w-20"
                    value={structure.totalScore}
                    min={1}
                    max={1000}
                    disabled={locked}
                    onChange={(n) => setStruct((s) => ({ ...s, totalScore: n }))}
                  />
                </td>
                <td colSpan={2} className={`px-2 py-2 text-sm ${totalOk ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {totalOk ? `✓ Tổng các dạng = ${fmtPoints(pointsSum)} điểm` : `✗ Tổng các dạng = ${fmtPoints(pointsSum)}, phải bằng ${fmtPoints(structure.totalScore)}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-sm font-semibold text-slate-800">Tỉ lệ điểm mong muốn theo mức độ (%)</div>
            <div className="flex items-center gap-3">
              {LEVELS.map((l) => (
                <label key={l} className="flex items-center gap-1.5 text-sm text-slate-700">
                  {LEVEL_LABEL[l]}
                  <NumInput
                    ariaLabel={`Tỉ lệ ${LEVEL_LABEL[l]}`}
                    className="w-16"
                    value={structure.levelTarget[l]}
                    min={0}
                    max={100}
                    disabled={locked}
                    onChange={(n) => setStruct((s) => ({ ...s, levelTarget: { ...s.levelTarget, [l]: n } }))}
                  />
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">Chỉ là mục tiêu tham khảo (mẫu phụ lục: 40 – 30 – 30); lệch nhiều sẽ có cảnh báo, không chặn.</p>
          </div>
          <Field label="Cách chấm câu Đúng – Sai" htmlFor="tfscoring" hint="Lũy tiến là cách chấm của đề thi tốt nghiệp THPT từ 2025 (tham khảo, không nằm trong phụ lục 7991); trường có thể chọn cách khác.">
            <select
              id="tfscoring"
              className={inputClass()}
              disabled={locked}
              value={structure.tfScoring}
              onChange={(e) => setStruct((s) => ({ ...s, tfScoring: e.target.value as typeof s.tfScoring }))}
            >
              <option value="progressive">Lũy tiến: 1 ý 10% – 2 ý 25% – 3 ý 50% – 4 ý 100% điểm câu</option>
              <option value="linear">Tuyến tính: mỗi ý đúng được 25% điểm câu</option>
            </select>
          </Field>
        </div>
      </Card>

      {/* 3. Chủ đề */}
      <Card className="p-5">
        <h2 className="text-base font-bold text-slate-900">3. Các chủ đề đã dạy và yêu cầu cần đạt *</h2>
        <p className="mb-3 mt-1 text-sm text-slate-600">
          Mỗi chủ đề cần có tên và yêu cầu cần đạt (theo chương trình bạn đang dạy). AI chỉ dùng đúng những gì bạn nhập ở đây.
        </p>
        {show('topics') && <p className="mb-2 text-sm font-medium text-rose-700">{show('topics')}</p>}
        <div className="space-y-3">
          {input.topics.map((t, idx) => (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="mb-2 flex items-start gap-2">
                <span className="mt-2 w-6 shrink-0 text-center text-sm font-bold text-slate-500">{idx + 1}</span>
                <div className="grid flex-1 gap-3 lg:grid-cols-[1fr_2fr]">
                  <Field label="Tên chủ đề / chương" htmlFor={`tn-${t.id}`} error={show(`topic.${t.id}.name`)}>
                    <input
                      id={`tn-${t.id}`}
                      className={inputClass(Boolean(show(`topic.${t.id}.name`)))}
                      value={t.name}
                      maxLength={LIMITS.maxTopicChars}
                      onChange={(e) => setInput((i) => ({ ...i, topics: i.topics.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)) }))}
                    />
                  </Field>
                  <Field label="Yêu cầu cần đạt" htmlFor={`tr-${t.id}`} error={show(`topic.${t.id}.requirements`)}>
                    <textarea
                      id={`tr-${t.id}`}
                      rows={3}
                      className={inputClass(Boolean(show(`topic.${t.id}.requirements`)))}
                      value={t.requirements}
                      maxLength={LIMITS.maxRequirementChars}
                      placeholder="Ví dụ: Nhận biết…; xác định được…; vận dụng được…"
                      onChange={(e) => setInput((i) => ({ ...i, topics: i.topics.map((x) => (x.id === t.id ? { ...x, requirements: e.target.value } : x)) }))}
                    />
                  </Field>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Xóa chủ đề ${idx + 1}`}
                  title="Xóa chủ đề"
                  disabled={input.topics.length <= 1}
                  onClick={() => setInput((i) => ({ ...i, topics: i.topics.filter((x) => x.id !== t.id) }))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            disabled={input.topics.length >= LIMITS.maxTopics}
            onClick={() => setInput((i) => ({ ...i, topics: [...i.topics, { id: newId('t'), name: '', requirements: '' }] }))}
          >
            Thêm chủ đề
          </Button>
        </div>
      </Card>

      {/* 4. Nội dung nguồn */}
      <Card className="p-5">
        <h2 className="text-base font-bold text-slate-900">4. Nội dung nguồn (dán văn bản) *</h2>
        <p className="mb-2 mt-1 text-sm text-slate-600">
          Dán nội dung bài học/tài liệu đã dạy (lý thuyết, ví dụ, bài tập mẫu). Câu hỏi sẽ bám theo nội dung này. Chưa hỗ trợ tải PDF/DOCX —
          hãy sao chép văn bản vào đây.
        </p>
        <textarea
          id="source"
          aria-label="Nội dung nguồn"
          rows={14}
          className={`${inputClass(Boolean(show('sourceText')))} font-[inherit] leading-relaxed`}
          value={input.sourceText}
          maxLength={LIMITS.maxSourceChars + 5000}
          placeholder="Dán nội dung bài học tại đây…"
          onChange={(e) => setInput((i) => ({ ...i, sourceText: e.target.value }))}
        />
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={srcLen < LIMITS.minSourceChars ? 'font-medium text-rose-700' : srcLen < LIMITS.softSourceChars ? 'text-amber-700' : 'text-emerald-700'}>
            {srcLen.toLocaleString('vi-VN')} ký tự (tối thiểu {LIMITS.minSourceChars}, nên từ {LIMITS.softSourceChars.toLocaleString('vi-VN')} trở lên)
          </span>
          {show('sourceText') && <span className="font-medium text-rose-700">{show('sourceText')}</span>}
        </div>
        <Field label="Ghi chú thêm cho AI (tuỳ chọn)" htmlFor="notes" className="mt-4" hint="Ví dụ: ưu tiên bài toán thực tế, tránh dùng máy tính cầm tay…">
          <textarea
            id="notes"
            rows={2}
            maxLength={1500}
            className={inputClass()}
            value={input.notes}
            onChange={(e) => setInput((i) => ({ ...i, notes: e.target.value }))}
          />
        </Field>
      </Card>

      {/* Kết quả kiểm tra đầu vào */}
      <div id="input-problems" className="space-y-3">
        {attempted && blocking.length > 0 && (
          <Banner tone="error" title={`Chưa đủ dữ liệu để tạo đề — cần bổ sung ${blocking.length} mục:`}>
            <ul className="list-disc space-y-0.5 pl-5">
              {blocking.map((i, k) => (
                <li key={k}>{i.message}</li>
              ))}
            </ul>
          </Banner>
        )}
        {warnings.length > 0 && (
          <Banner tone="warn" title="Lưu ý">
            <ul className="list-disc space-y-0.5 pl-5">
              {warnings.map((i, k) => (
                <li key={k}>{i.message}</li>
              ))}
            </ul>
          </Banner>
        )}
        {error && error.where === 'matrix' && (
          <Banner tone="error" title="Không tạo được ma trận">
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
        {exam.inputChangedSinceMatrix && state.matrix && (
          <Banner tone="warn">Bạn đã sửa thông tin sau khi AI lập ma trận. Ma trận hiện có có thể không còn khớp — hãy tạo lại nếu cần.</Banner>
        )}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <div className="text-sm text-slate-600">
          {busy === 'matrix' ? (
            <span>AI đang lập ma trận và bản đặc tả… thường mất 15–60 giây, vui lòng đợi.</span>
          ) : (
            <span>Bước tiếp theo: AI lập <b>bản nháp</b> ma trận để bạn sửa và xác nhận.</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {state.matrix && (
            <Button variant="secondary" onClick={() => exam.setStep(2)} disabled={busy !== null} icon={<ArrowRight className="h-4 w-4" />}>
              Tiếp tục với ma trận hiện có
            </Button>
          )}
          <Button variant="primary" size="lg" loading={busy === 'matrix'} onClick={submit} icon={<Sparkles className="h-4 w-4" />}>
            {state.matrix ? 'Tạo lại ma trận bằng AI' : 'Kiểm tra & tạo ma trận bằng AI'}
          </Button>
        </div>
      </div>
    </div>
  );
}
