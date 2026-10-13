import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Undo2, XCircle } from 'lucide-react';
import { activeParts, fmtPoints } from '../../shared/blueprint.js';
import { buildAllDocuments, DOC_TITLES } from '../../shared/documents.js';
import type { DocId } from '../../shared/docmodel.js';
import { QTYPE_LABEL } from '../../shared/schema.js';
import type { Exam } from '../useExam.js';
import { FitPage } from './DocView.js';
import { Banner, Button, Card, useToast } from './ui.js';

const TABS: DocId[] = ['exam', 'key', 'matrix', 'spec'];

export function StepReview({ exam }: { exam: Exam }) {
  const { state, slots, examIssues, checklist, approved, approvalStale } = exam;
  const toast = useToast();
  const [tab, setTab] = useState<DocId>('exam');
  const [ack, setAck] = useState(false);

  const ready = Boolean(state.confirmedMatrix && state.questions);
  const docs = useMemo(
    () => (ready ? buildAllDocuments({ input: state.input, matrix: state.confirmedMatrix!, questions: state.questions! }) : []),
    [ready, state.input, state.confirmedMatrix, state.questions],
  );
  const parts = useMemo(() => activeParts(slots), [slots]);

  if (!ready) {
    return (
      <Banner tone="info" title="Chưa có đề để duyệt" actions={<Button variant="primary" onClick={() => exam.setStep(state.confirmedMatrix ? 3 : 2)}>Quay lại</Button>}>
        Hãy xác nhận ma trận và tạo câu hỏi trước.
      </Banner>
    );
  }

  const errors = examIssues.filter((i) => i.severity === 'error');
  const warnings = examIssues.filter((i) => i.severity === 'warning');
  const doc = docs.find((d) => d.id === tab)!;

  const approve = () => {
    exam.approve();
    toast('Đã duyệt đề. Bạn có thể tải về hoặc in ở bước tiếp theo.');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Xem trước và duyệt đề</h2>
        <p className="text-sm text-slate-600">
          Xem đủ bốn tài liệu như sẽ tải về. Chỉ sau khi bạn bấm <b>Duyệt đề</b> mới được xuất bản bản cuối cùng. Nếu sau đó bạn sửa bất cứ điều gì, việc duyệt sẽ tự hủy.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-2 text-sm font-bold text-slate-900">Tóm tắt đề</h3>
            <table className="w-full text-sm">
              <tbody>
                {parts.map((p) => (
                  <tr key={p.type} className="border-b border-slate-100 last:border-0">
                    <td className="py-1.5 pr-2 text-slate-700">
                      Phần {p.roman}. {QTYPE_LABEL[p.type]}
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-slate-900">
                      {p.count} câu · {fmtPoints(p.points)}đ
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="pt-2">Tổng</td>
                  <td className="pt-2 text-right tabular-nums">
                    {slots.length} câu · {fmtPoints(slots.reduce((a, s) => a + s.points, 0))}đ
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>

          <Card className="p-4">
            <h3 className="mb-2 text-sm font-bold text-slate-900">Kiểm tra bằng mã</h3>
            <ul className="space-y-1.5" aria-label="Danh sách kiểm tra">
              {checklist.map((c) => (
                <li key={c.id} className={`flex items-start gap-2 text-sm ${c.ok ? 'text-slate-700' : 'font-medium text-rose-800'}`} data-check={c.id} data-ok={c.ok}>
                  {c.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />}
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
            {warnings.length > 0 && <p className="mt-2 text-xs text-amber-800">Còn {warnings.length} cảnh báo (không chặn duyệt) ở bước câu hỏi.</p>}
          </Card>

          <Card className="space-y-3 p-4">
            <h3 className="text-sm font-bold text-slate-900">Duyệt đề</h3>
            {errors.length > 0 ? (
              <>
                <Banner tone="error" title={`Chưa thể duyệt: còn ${errors.length} lỗi`}>
                  <ul className="list-disc space-y-0.5 pl-5">
                    {errors.slice(0, 5).map((i, k) => (
                      <li key={k}>{i.message}</li>
                    ))}
                    {errors.length > 5 && <li>… và {errors.length - 5} lỗi khác</li>}
                  </ul>
                </Banner>
                <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => exam.setStep(3)}>
                  Về bước câu hỏi để sửa
                </Button>
              </>
            ) : approved ? (
              <>
                <Banner tone="success" title="Đề đã được duyệt">
                  Duyệt lúc {new Date(state.approval!.at).toLocaleString('vi-VN')}. Bạn có thể tải về hoặc in.
                </Banner>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />} onClick={() => exam.setStep(5)}>
                    Tải về / in
                  </Button>
                  <Button icon={<Undo2 className="h-4 w-4" />} onClick={exam.revokeApproval}>
                    Bỏ duyệt để sửa
                  </Button>
                </div>
              </>
            ) : (
              <>
                {approvalStale && (
                  <Banner tone="warn">Nội dung đã thay đổi sau lần duyệt trước nên việc duyệt đã bị hủy. Hãy xem lại và duyệt lại.</Banner>
                )}
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input type="checkbox" className="mt-1" checked={ack} onChange={(e) => setAck(e.target.checked)} />
                  Tôi đã rà soát nội dung, đáp án và hướng dẫn chấm, và chịu trách nhiệm về đề kiểm tra này. (AI có thể sai — đặc biệt ở đáp án và tính toán.)
                </label>
                <Button variant="success" size="lg" className="w-full" disabled={!ack} icon={<ShieldCheck className="h-4 w-4" />} onClick={approve}>
                  Duyệt đề
                </Button>
              </>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-3">
          <div role="tablist" aria-label="Chọn tài liệu xem trước" className="flex flex-wrap gap-2">
            {TABS.map((id) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${tab === id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                {DOC_TITLES[id]}
              </button>
            ))}
          </div>
          <FitPage doc={doc} />
          <p className="text-xs text-slate-500">Xem trước theo bố cục A4. Tệp Word (.docx) và bản in dùng cùng nội dung này.</p>
        </div>
      </div>
    </div>
  );
}
