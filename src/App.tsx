import React, { useEffect, useState } from 'react';
import type { DocModel } from '../shared/docmodel.js';
import { Header } from './components/Header.js';
import { PrintHost } from './components/DocView.js';
import { StepExport } from './components/StepExport.js';
import { StepInput } from './components/StepInput.js';
import { StepMatrix } from './components/StepMatrix.js';
import { StepQuestions } from './components/StepQuestions.js';
import { StepReview } from './components/StepReview.js';
import { Stepper } from './components/Stepper.js';
import { Banner, UiProviders } from './components/ui.js';
import { fetchHealth } from './lib/api.js';
import { useExam } from './useExam.js';

function Shell() {
  const exam = useExam();
  const [printDoc, setPrintDoc] = useState<DocModel | null>(null);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [showRestored, setShowRestored] = useState(exam.restored);

  useEffect(() => {
    let alive = true;
    fetchHealth().then((h) => alive && setAiConfigured(h ? h.aiConfigured : null));
    return () => {
      alive = false;
    };
  }, []);

  // Nếu bước hiện tại chưa mở được (ví dụ sau khi mở khóa ma trận), lùi về bước gần nhất hợp lệ.
  const { state, step, approved } = exam;
  useEffect(() => {
    const max = approved ? 5 : state.questions ? 4 : state.confirmedMatrix ? 3 : state.matrix ? 2 : 1;
    if (step > max) exam.setStep(max);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approved, state.questions, state.confirmedMatrix, state.matrix, step]);

  return (
    <>
      <div className="app-shell flex min-h-screen flex-col">
        <Header exam={exam} />
        <Stepper exam={exam} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6" data-step={exam.step}>
          {aiConfigured === false && (
            <Banner tone="warn" title="Máy chủ chưa được cấu hình khóa Gemini" className="mb-4">
              Các chức năng AI (tạo ma trận, câu hỏi) sẽ báo lỗi cho đến khi người quản trị đặt biến môi trường <code>GEMINI_API_KEY</code>. Bạn vẫn có thể nhập liệu và xem các phần khác.
            </Banner>
          )}
          {exam.loadNotice && (
            <Banner tone="warn" className="mb-4">
              {exam.loadNotice}
            </Banner>
          )}
          {showRestored && state.input.info.title.trim() && (
            <Banner
              tone="info"
              className="mb-4"
              actions={
                <button type="button" className="text-sm font-semibold underline" onClick={() => setShowRestored(false)}>
                  Ẩn thông báo
                </button>
              }
            >
              Đã khôi phục bản nháp của bạn từ lần làm việc trước ("{state.input.info.title.trim()}").
            </Banner>
          )}

          {exam.step === 1 && <StepInput exam={exam} />}
          {exam.step === 2 && <StepMatrix exam={exam} />}
          {exam.step === 3 && <StepQuestions exam={exam} />}
          {exam.step === 4 && <StepReview exam={exam} />}
          {exam.step === 5 && <StepExport exam={exam} onPrint={setPrintDoc} />}
        </main>
        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs leading-relaxed text-slate-500">
          <p>
            Công cụ hỗ trợ giáo viên soạn đề, tham khảo phụ lục Công văn 7991/BGDĐT-GDTrH. Không phải sản phẩm của Bộ GD&ĐT và không có xác nhận pháp lý; giáo viên chịu trách nhiệm rà soát, kiểm tra đáp án và duyệt.
          </p>
          <p>
            Không thu thập thông tin học sinh. Bản nháp lưu trong trình duyệt này. Nội dung bạn nhập được gửi tới Google Gemini để tạo ma trận và câu hỏi.
          </p>
        </footer>
      </div>
      <PrintHost doc={printDoc} onDone={() => setPrintDoc(null)} />
    </>
  );
}

export default function App() {
  return (
    <UiProviders>
      <Shell />
    </UiProviders>
  );
}
