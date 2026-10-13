import React, { useMemo, useState } from 'react';
import { ArrowLeft, Download, FileArchive, FileText, Printer } from 'lucide-react';
import { buildAllDocuments, DOC_TITLES } from '../../shared/documents.js';
import type { DocId, DocModel } from '../../shared/docmodel.js';
import { slugify } from '../../shared/docmodel.js';
import type { Exam } from '../useExam.js';
import { downloadAllZip, downloadDocx } from '../lib/download.js';
import { Banner, Button, Card, useToast } from './ui.js';

const DESCRIPTIONS: Record<DocId, string> = {
  matrix: 'Ma trận đề kiểm tra định kì theo bố cục mẫu phụ lục (khổ A4 ngang).',
  spec: 'Bản đặc tả: yêu cầu cần đạt và số câu ở các mức độ đánh giá (khổ A4 ngang).',
  exam: 'Đề dành cho học sinh — không có đáp án, không có lời giải (khổ A4 dọc).',
  key: 'Đáp án, biểu điểm Đúng–Sai, hướng dẫn chấm tự luận và lời giải tham khảo (khổ A4 dọc).',
};

export function StepExport({ exam, onPrint }: { exam: Exam; onPrint: (doc: DocModel) => void }) {
  const { state, approved } = exam;
  const toast = useToast();
  const [working, setWorking] = useState<string | null>(null);

  const docs = useMemo(
    () =>
      state.confirmedMatrix && state.questions
        ? buildAllDocuments({ input: state.input, matrix: state.confirmedMatrix, questions: state.questions })
        : [],
    [state.input, state.confirmedMatrix, state.questions],
  );

  if (!approved) {
    return (
      <div className="space-y-4">
        <Banner
          tone="warn"
          title="Chưa thể xuất bản — đề chưa được duyệt"
          actions={
            <Button variant="primary" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => exam.setStep(docs.length ? 4 : state.confirmedMatrix ? 3 : 2)}>
              {docs.length ? 'Đến bước duyệt đề' : 'Quay lại'}
            </Button>
          }
        >
          Tải về và in chỉ mở sau khi bạn xem trước và bấm "Duyệt đề". {exam.approvalStale && 'Nội dung đã thay đổi sau lần duyệt trước nên cần duyệt lại.'}
        </Banner>
      </div>
    );
  }

  const run = async (key: string, fn: () => Promise<void>, ok: string) => {
    setWorking(key);
    try {
      await fn();
      toast(ok);
    } catch {
      toast('Không tạo được tệp. Hãy thử lại.', 'error');
    } finally {
      setWorking(null);
    }
  };

  const zipName = `de-kiem-tra_${slugify(`${state.input.info.title} ${state.input.info.subject} ${state.input.info.grade}`)}.zip`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Tải về và in</h2>
        <p className="text-sm text-slate-600">
          Bốn tài liệu từ đề đã duyệt. Tệp <b>.docx</b> là tệp Word thật mở được bằng Word/Pages/Google Docs. Nút <b>In / Lưu PDF</b> mở hộp thoại in của trình duyệt với khổ A4 — chọn "Lưu dưới dạng PDF" để lưu PDF.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((d) => (
          <Card key={d.id} className="flex flex-col gap-3 p-4" >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-700">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900">{DOC_TITLES[d.id]}</h3>
                <p className="text-sm text-slate-600">{DESCRIPTIONS[d.id]}</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-500">{d.filename}</p>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
              <Button
                variant="primary"
                icon={<Download className="h-4 w-4" />}
                loading={working === `docx-${d.id}`}
                data-testid={`download-${d.id}`}
                onClick={() => run(`docx-${d.id}`, () => downloadDocx(d), `Đã tạo tệp ${d.filename}`)}
              >
                Tải .docx
              </Button>
              <Button icon={<Printer className="h-4 w-4" />} data-testid={`print-${d.id}`} onClick={() => onPrint(d)}>
                In / Lưu PDF (A4)
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h3 className="font-bold text-slate-900">Tải cả bốn tài liệu</h3>
          <p className="text-sm text-slate-600">Gộp 4 tệp .docx vào một tệp .zip.</p>
        </div>
        <Button
          icon={<FileArchive className="h-4 w-4" />}
          loading={working === 'zip'}
          data-testid="download-zip"
          onClick={() => run('zip', () => downloadAllZip(docs, zipName), `Đã tạo tệp ${zipName}`)}
        >
          Tải tất cả (.zip)
        </Button>
      </Card>

      <Banner tone="info" title="Lưu ý trước khi dùng">
        Công cụ chỉ hỗ trợ soạn đề và tham khảo phụ lục Công văn 7991; giáo viên chịu trách nhiệm rà soát và duyệt. Tài liệu không phải văn bản do Bộ GD&ĐT phê duyệt. Nếu trường có mẫu riêng, hãy đối chiếu trước khi sử dụng.
      </Banner>
      <div>
        <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => exam.setStep(4)}>
          Về bước xem trước
        </Button>
      </div>
    </div>
  );
}
