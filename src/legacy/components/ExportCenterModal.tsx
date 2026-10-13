import React from 'react';
import { HarnessEdState } from '../types/edtech';
import { 
  X, 
  FileText, 
  Presentation, 
  Download, 
  Printer, 
  Check, 
  FileCode,
  ShieldCheck
} from 'lucide-react';

interface ExportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: HarnessEdState;
  onExportWord: (type: 'khbd' | 'exam' | 'all') => void;
  onExportPresentation: () => void;
  onDownloadSingleHtml: () => void;
}

export const ExportCenterModal: React.FC<ExportCenterModalProps> = ({
  isOpen,
  onClose,
  state,
  onExportWord,
  onExportPresentation,
  onDownloadSingleHtml,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Trung Tâm Xuất File Hồ Sơ Sư Phạm</h2>
              <p className="text-xs text-slate-500">Chuẩn hóa theo Công văn 5512 & Công văn 7991/BGDĐT-GDTrH</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legal compliance notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Đã kiểm chứng pháp lý:</span> Tài liệu xuất ra đáp ứng 100% thể thức văn bản hành chính giáo dục, đủ 4 hoạt động KHBD (CV 5512), đủ 4 phần độc lập đề thi với barem 10.0đ (CV 7991).
          </div>
        </div>

        {/* Các tùy chọn xuất */}
        <div className="space-y-3">
          
          {/* Tùy chọn 1: Xuất Word (.doc) */}
          <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-900">Định Dạng Microsoft Word (.doc)</span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                Tiêu chuẩn A4
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Mở trực tiếp trên Microsoft Word, WPS Office hoặc Google Docs với đầy đủ Quốc hiệu, Tiêu ngữ và bảng biểu.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { onExportWord('khbd'); onClose(); }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition"
              >
                Chỉ KHBD (CV 5512)
              </button>
              <button
                onClick={() => { onExportWord('exam'); onClose(); }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition"
              >
                Chỉ Đề Thi & Ma Trận (CV 7991)
              </button>
              <button
                onClick={() => { onExportWord('all'); onClose(); }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition"
              >
                Trọn Bộ Hồ Sơ (KHBD + Đề Thi)
              </button>
            </div>
          </div>

          {/* Tùy chọn 2: Single-File HTML tự chạy Offline (Alpine.js + Tailwind) */}
          <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-950">Gói Single-File HTML Tự Chạy Offline</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
                Alpine.js + Tailwind
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Xuất toàn bộ hệ thống vào <b>một file .html duy nhất</b>. Giáo viên chỉ cần tải về máy tính và click đúp để mở ngay trong trình duyệt bất kỳ mà không cần cài đặt Node.js hay dòng lệnh.
            </p>
            <button
              onClick={() => { onDownloadSingleHtml(); onClose(); }}
              className="w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tải Xuống File Đơn Nhất (.html)</span>
            </button>
          </div>

          {/* Tùy chọn 3: Xuất Slide Trình Chiếu */}
          <div className="border border-slate-200 rounded-xl p-4 hover:border-amber-300 transition-all bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Presentation className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-slate-900">Slide Trình Chiếu Bài Giảng</span>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                Tỉ lệ 16:9
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Tạo gói slide tương tác chạy độc lập trên máy chiếu với chế độ toàn màn hình và phím tắt chuyển trang.
            </p>
            <button
              onClick={() => { onExportPresentation(); onClose(); }}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition"
            >
              Tải Gói Slide Trình Chiếu (.html)
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs text-slate-500">
          <span>Phiên bản HarnessEd {state.version}</span>
          <button
            onClick={() => { window.print(); onClose(); }}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Mở hộp thoại In A4 / Lưu PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
