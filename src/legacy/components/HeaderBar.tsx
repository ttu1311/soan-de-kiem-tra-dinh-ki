import React from 'react';
import { ActiveModule } from '../types/edtech';
import { 
  BookOpen, 
  Presentation, 
  FileText, 
  Download, 
  Printer, 
  Layers, 
  GraduationCap, 
  BookMarked 
} from 'lucide-react';

interface HeaderBarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  onOpenExportModal: () => void;
  onDownloadSingleHtml: () => void;
  // Scope 1 Topbar metadata controls
  subject: string;
  grade: string;
  textbookSeries: 'Cánh Diều' | 'Kết Nối Tri Thức' | 'Chân Trời Sáng Tạo';
  lessonTitle: string;
  onUpdateMetadata: (field: string, value: any) => void;
}

const SUBJECT_OPTIONS = [
  'Toán học',
  'Ngữ văn',
  'Khoa học tự nhiên',
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Lịch sử',
  'Địa lí',
  'Tin học',
  'Tiếng Anh'
];

const GRADE_OPTIONS = [
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12'
];

const TEXTBOOK_OPTIONS: ('Cánh Diều' | 'Kết Nối Tri Thức' | 'Chân Trời Sáng Tạo')[] = [
  'Cánh Diều',
  'Kết Nối Tri Thức',
  'Chân Trời Sáng Tạo'
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeModule,
  onSelectModule,
  onOpenExportModal,
  onDownloadSingleHtml,
  subject,
  grade,
  textbookSeries,
  lessonTitle,
  onUpdateMetadata,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shrink-0 select-none z-20 no-print shadow-2xs">
      {/* HÀNG TRÊN: Thương hiệu & Bộ chọn nhanh Topbar (Scope 1 Shell Specs) */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4 lg:gap-8">
        
        {/* Zone 1: Wordmark Thương hiệu */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            HE
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-slate-900 tracking-tight leading-none">
              HarnessEd
            </div>
            <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
              Nền tảng Sư phạm Số BGD&ĐT
            </div>
          </div>
        </div>

        {/* Zone 2: Bộ chọn nhanh (Môn, Khối, Bộ sách, Tên bài học) */}
        <div className="flex items-center gap-2 lg:gap-3 flex-1 max-w-3xl overflow-x-auto py-1 text-xs">
          {/* Bộ chọn Môn học */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Môn</span>
            <select
              value={subject.includes('(') ? subject.split('(')[0].trim() : subject}
              onChange={(e) => onUpdateMetadata('subject', e.target.value)}
              className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Bộ chọn Khối lớp */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Khối</span>
            <select
              value={grade}
              onChange={(e) => onUpdateMetadata('grade', e.target.value)}
              className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              {GRADE_OPTIONS.map((gr) => (
                <option key={gr} value={gr}>{gr}</option>
              ))}
            </select>
          </div>

          {/* Bộ chọn Bộ Sách Giáo Khoa (Cánh Diều, Kết Nối Tri Thức, Chân Trời Sáng Tạo) */}
          <div className="flex items-center gap-1 bg-blue-50/70 border border-blue-200 rounded-lg px-2 py-1 shrink-0">
            <BookMarked className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={textbookSeries}
              onChange={(e) => onUpdateMetadata('textbookSeries', e.target.value)}
              className="bg-transparent font-bold text-blue-900 text-xs focus:outline-none cursor-pointer"
            >
              {TEXTBOOK_OPTIONS.map((tb) => (
                <option key={tb} value={tb}>{tb}</option>
              ))}
            </select>
          </div>

          {/* Tên bài học */}
          <div className="flex-1 min-w-[160px] hidden md:block">
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => onUpdateMetadata('lessonTitle', e.target.value)}
              placeholder="Nhập tên bài học..."
              title="Nhấp để sửa nhanh tên bài học"
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white px-2.5 py-1 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none transition truncate"
            />
          </div>
        </div>

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            title="In A4 hoặc Lưu PDF"
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In A4</span>
          </button>

          <button
            onClick={onDownloadSingleHtml}
            title="Tải gói Single-file HTML tự vận hành (Alpine.js + Tailwind)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Xuất Bản Offline HTML</span>
            <span className="sm:hidden">Offline</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-2xs transition whitespace-nowrap shrink-0"
          >
            <span>Xuất File</span>
          </button>
        </div>

      </div>
    </header>
  );
};
