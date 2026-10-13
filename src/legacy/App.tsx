/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveModule, HarnessEdState, SlideItem } from './types/edtech';
import { 
  defaultMathGrade10State, 
  sampleNaturalScience8State, 
  sampleHistory11State 
} from './data/defaultSamples';
import { HeaderBar } from './components/HeaderBar';
import { SidebarControlPanel } from './components/SidebarControlPanel';
import { KhbdWorkspace } from './components/KhbdWorkspace';
import { SlideWorkspace } from './components/SlideWorkspace';
import { ExamWorkspace } from './components/ExamWorkspace';
import { MatrixWorkspace } from './components/MatrixWorkspace';
import { JsonStateWorkspace } from './components/JsonStateWorkspace';
import { ExportCenterModal } from './components/ExportCenterModal';
import { 
  exportToWord, 
  exportMatrixSpecsToWord,
  exportToPresentationHtml, 
  downloadStandaloneHtml, 
  downloadJsonFile 
} from './utils/exporters';
import { CheckCircle2, Download } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<HarnessEdState>(defaultMathGrade10State);
  const [activeModule, setActiveModule] = useState<ActiveModule>('khbd');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleUpdateKhbdMeta = (field: string, value: any) => {
    setState(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      khbd: {
        ...prev.khbd,
        [field]: value
      },
      slides: {
        ...prev.slides,
        ...(field === 'lessonTitle' ? { title: value } : {}),
        ...(field === 'subject' ? { subject: value } : {}),
        ...(field === 'grade' ? { grade: value } : {})
      },
      exam: {
        ...prev.exam,
        ...(field === 'subject' ? { subject: value.toUpperCase() } : {}),
        ...(field === 'grade' ? { grade: value } : {}),
        ...(field === 'schoolName' ? { schoolName: value } : {})
      }
    }));
  };

  const handleLoadSample = (subject: 'math' | 'science' | 'history') => {
    if (subject === 'math') {
      setState(defaultMathGrade10State);
      showToast('Đã nạp giáo án mẫu: Toán học 10 (Hàm số bậc hai)');
    } else if (subject === 'science') {
      setState(sampleNaturalScience8State);
      showToast('Đã nạp giáo án mẫu: KHTN 8 (Khúc xạ ánh sáng)');
    } else {
      setState(sampleHistory11State);
      showToast('Đã nạp giáo án mẫu: Lịch sử 11 (Cách mạng công nghiệp)');
    }
  };

  const handleExportWord = (type: 'khbd' | 'exam' | 'all') => {
    exportToWord(state, type);
    showToast(`Đã tạo và tải file Word (.doc) chuẩn mẫu Bộ GD&ĐT!`);
  };

  const handleExportMatrixSpecs = () => {
    exportMatrixSpecsToWord(state);
    showToast(`Đã xuất file Word Ma Trận & Bản Đặc Tả (CV 7991)!`);
  };

  const handleExportPresentation = () => {
    exportToPresentationHtml(state);
    showToast(`Đã xuất gói Slide Trình Chiếu (.html presentation)!`);
  };

  const handleDownloadSingleHtml = () => {
    downloadStandaloneHtml(state);
    showToast(`Đã tải về Single-File HTML tự vận hành (Alpine.js + Tailwind)!`);
  };

  const handleDownloadJson = () => {
    downloadJsonFile(state);
    showToast(`Đã tải file dữ liệu JSON state!`);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    showToast('Đã sao chép toàn bộ khối JSON State vào Clipboard!');
  };

  // SCOPE 3: Chuyển Đổi Nhanh KHBD Thành Slide Deck 16:9
  const handleConvertKhbdToSlides = () => {
    const khbd = state.khbd;
    const generatedSlides: SlideItem[] = [
      // Slide 1: Trang tiêu đề bìa bài học
      {
        id: `slide-title-${Date.now()}`,
        type: 'title',
        title: khbd.lessonTitle.toUpperCase(),
        subtitle: `Chương trình GDPT 2018 · Bộ sách ${khbd.textbookSeries || 'Cánh Diều'}`,
        bullets: [
          `Môn học: ${khbd.subject} - Khối: ${khbd.grade}`,
          `Thời lượng kế hoạch: ${khbd.durationPeriods} tiết`,
          `Giáo viên: ${khbd.teacherName} - Tổ chuyên môn: ${khbd.departmentName}`,
          `Đơn vị công tác: ${khbd.schoolName}`
        ],
        teacherNotes: 'Giới thiệu tổng quan bài học, tạo tâm thế tích cực và định hướng bài học cho học sinh.',
        visualTag: 'Bài Học Mới'
      },
      // Slide 2: Mục tiêu bài học chuẩn CV 5512
      {
        id: `slide-obj-${Date.now()}`,
        type: 'objectives',
        title: 'MỤC TIÊU & YÊU CẦU CẦN ĐẠT',
        subtitle: 'Chuẩn năng lực và phẩm chất theo Công văn 5512/BGDĐT-GDTrH',
        bullets: [
          `Kiến thức: ${khbd.knowledgeObjectives.slice(0, 2).join('; ') || 'Nắm vững kiến thức cốt lõi của bài học.'}`,
          `Năng lực chung: ${khbd.generalCompetencies.slice(0, 2).join('; ') || 'Tự chủ, tự học, giao tiếp và hợp tác nhóm.'}`,
          `Năng lực đặc thù: ${khbd.specificCompetencies.slice(0, 2).join('; ') || 'Tư duy logic, mô hình hóa và giải quyết vấn đề.'}`,
          `Phẩm chất: ${khbd.qualities.slice(0, 2).join('; ') || 'Chăm chỉ, trung thực, tinh thần trách nhiệm.'}`
        ],
        teacherNotes: 'Nêu rõ chuẩn đầu ra bài học để học sinh chủ động theo dõi mức độ tiếp thu của bản thân.',
        visualTag: 'Mục Tiêu 5512'
      },
      // Slide 3: Thiết bị và học liệu dạy học
      {
        id: `slide-supplies-${Date.now()}`,
        type: 'content',
        title: 'THIẾT BỊ VÀ HỌC LIỆU DẠY HỌC',
        subtitle: 'Sự chuẩn bị cần thiết cho tiết học đạt hiệu quả cao nhất',
        bullets: [
          `Giáo viên chuẩn bị: ${khbd.teacherSupplies || 'Kế hoạch bài dạy, bài giảng điện tử, phiếu học tập nhóm, dụng cụ trực quan.'}`,
          `Học sinh chuẩn bị: ${khbd.studentSupplies || 'Sách giáo khoa, vở ghi, đồ dùng học tập cá nhân, nghiên cứu trước bài mới.'}`,
          'Tổ chức lớp học: Chia lớp thành 4 nhóm học tập cố định để thảo luận và thi đua tích cực.'
        ],
        teacherNotes: 'Kiểm tra nhanh việc chuẩn bị dụng cụ học tập và phiếu bài tập của các nhóm.',
        visualTag: 'Học Liệu'
      },
      // Slide 4-7: Trích xuất 4 hoạt động của KHBD
      ...khbd.activities.map((act, index) => {
        const step1 = act.implementation[0]?.teacherAction || 'Giáo viên giao nhiệm vụ cụ thể cho từng nhóm.';
        const step2 = act.implementation[1]?.studentAction || 'Học sinh cá nhân suy nghĩ, sau đó trao đổi trong nhóm.';
        const step3 = act.implementation[2]?.studentAction || 'Đại diện báo cáo sản phẩm, các nhóm khác phản biện.';
        const step4 = act.implementation[3]?.teacherAction || 'Giáo viên đánh giá, chốt kiến thức trọng tâm.';

        return {
          id: `slide-act-${act.id}-${Date.now()}`,
          type: 'activity' as const,
          title: `HOẠT ĐỘNG ${act.number}: ${act.name.toUpperCase()}`,
          subtitle: `Mục tiêu hoạt động: ${act.target}`,
          bullets: [
            `Nội dung: ${act.content}`,
            `Nhiệm vụ GV: ${step1}`,
            `Nhiệm vụ HS: ${step2}`,
            `Sản phẩm: ${act.product}`
          ],
          teacherNotes: `Thời lượng dự kiến ~${act.durationMinutes} phút. Kết luận chuẩn kiến thức: ${step4}`,
          visualTag: act.number === 1 ? 'Khởi Động' : act.number === 2 ? 'Kiến Thức Mới' : act.number === 3 ? 'Luyện Tập' : 'Vận Dụng'
        };
      }),
      // Slide cuối: Dặn dò & hướng dẫn tự học
      {
        id: `slide-summary-${Date.now()}`,
        type: 'summary',
        title: 'HƯỚNG DẪN TỰ HỌC & DẶN DÒ',
        subtitle: 'Củng cố kiến thức và chuẩn bị cho bài học tiếp theo',
        bullets: [
          'Ghi nhớ kiến thức cốt lõi và hoàn thành bài tập rèn luyện trong SGK.',
          'Hoàn thiện báo cáo / sản phẩm vận dụng thực tiễn của Hoạt động 4.',
          'Xem trước nội dung của bài học kế tiếp theo phân phối chương trình.',
          'Tham gia kiểm tra đánh giá định kỳ trên hệ thống đề thi CV 7991.'
        ],
        teacherNotes: 'Nhắc nhở học sinh nộp bài tập đúng hạn trên hệ thống học tập số.',
        visualTag: 'Dặn Dò'
      }
    ];

    setState(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      slides: {
        title: prev.khbd.lessonTitle,
        subject: prev.khbd.subject,
        grade: prev.khbd.grade,
        slides: generatedSlides
      }
    }));

    setActiveModule('slides');
    showToast('Đã tự động chuyển đổi KHBD 5512 thành 8 Slide Deck 16:9 với thẻ trực quan!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Bar: Strict Top Bar Contract (Wordmark - Clean Links - Primary Action) */}
      <HeaderBar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onDownloadSingleHtml={handleDownloadSingleHtml}
        subject={state.khbd.subject}
        grade={state.khbd.grade}
        textbookSeries={state.khbd.textbookSeries || 'Cánh Diều'}
        lessonTitle={state.khbd.lessonTitle}
        onUpdateMetadata={handleUpdateKhbdMeta}
      />

      {/* 2. Main Split-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Bảng điều khiển bên trái rộng chuẩn 380px */}
        <SidebarControlPanel
          state={state}
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          onUpdateKhbdMeta={handleUpdateKhbdMeta}
          onLoadSample={handleLoadSample}
          onExportWord={handleExportWord}
          onExportPresentation={handleExportPresentation}
          onDownloadSingleHtml={handleDownloadSingleHtml}
          onCopyJson={handleCopyJson}
          onExportMatrixSpecs={handleExportMatrixSpecs}
          onConvertKhbdToSlides={handleConvertKhbdToSlides}
        />

        {/* Vùng làm việc trực quan bên phải co giãn linh hoạt */}
        <main className="flex-1 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/60 print:p-0 print:bg-white print:h-auto print:overflow-visible">
          
          {/* PHÂN HỆ 1: KẾ HOẠCH BÀI DẠY (CV 5512) */}
          {activeModule === 'khbd' && (
            <KhbdWorkspace
              khbd={state.khbd}
              onConvertToSlides={handleConvertKhbdToSlides}
              onUpdateKhbd={(updater) => setState(prev => ({
                ...prev,
                lastUpdated: new Date().toISOString(),
                khbd: updater(prev.khbd)
              }))}
            />
          )}

          {/* PHÂN HỆ 2: SLIDE BÀI GIẢNG */}
          {activeModule === 'slides' && (
            <SlideWorkspace
              slides={state.slides}
              lessonTitle={state.khbd.lessonTitle}
              teacherName={state.khbd.teacherName}
              subject={state.khbd.subject}
              grade={state.khbd.grade}
              onSyncFromKhbd={handleConvertKhbdToSlides}
              onUpdateSlides={(updater) => setState(prev => ({
                ...prev,
                lastUpdated: new Date().toISOString(),
                slides: updater(prev.slides)
              }))}
            />
          )}

          {/* PHÂN HỆ 3: ĐỀ KIỂM TRA ĐỊNH KỲ (CV 7991) */}
          {activeModule === 'exam' && (
            <ExamWorkspace
              exam={state.exam}
              onUpdateExam={(updater) => setState(prev => ({
                ...prev,
                lastUpdated: new Date().toISOString(),
                exam: updater(prev.exam)
              }))}
              onExportWord={() => handleExportWord('exam')}
              onExportMatrixSpecs={handleExportMatrixSpecs}
            />
          )}

          {/* MA TRẬN & BẢN ĐẶC TẢ CHI TIẾT */}
          {activeModule === 'matrix' && (
            <MatrixWorkspace
              matrixRows={state.exam.matrixRows}
              onUpdateRows={(newRows) => setState(prev => ({
                ...prev,
                lastUpdated: new Date().toISOString(),
                exam: {
                  ...prev.exam,
                  matrixRows: newRows
                }
              }))}
            />
          )}

          {/* KHỐI JSON STATE BÀN GIAO */}
          {activeModule === 'export_json' && (
            <JsonStateWorkspace
              state={state}
              onImportState={(newState) => {
                setState(newState);
                showToast('Đã nhập và khôi phục thành công toàn bộ phiên làm việc!');
              }}
              onCopyJson={handleCopyJson}
              onDownloadJson={handleDownloadJson}
            />
          )}

        </main>
      </div>

      {/* Modal Xuất File */}
      <ExportCenterModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        state={state}
        onExportWord={handleExportWord}
        onExportPresentation={handleExportPresentation}
        onDownloadSingleHtml={handleDownloadSingleHtml}
      />

    </div>
  );
}
