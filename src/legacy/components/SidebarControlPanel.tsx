import React from 'react';
import { HarnessEdState, ActiveModule } from '../types/edtech';
import { 
  CheckCircle2, 
  FileText, 
  Download, 
  Sparkles, 
  Copy, 
  GraduationCap
} from 'lucide-react';

interface SidebarControlPanelProps {
  state: HarnessEdState;
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  onUpdateKhbdMeta: (field: string, value: any) => void;
  onLoadSample: (subject: 'math' | 'science' | 'history') => void;
  onExportWord: (type: 'khbd' | 'exam' | 'all') => void;
  onExportPresentation: () => void;
  onDownloadSingleHtml: () => void;
  onCopyJson: () => void;
  onExportMatrixSpecs: () => void;
  onConvertKhbdToSlides?: () => void;
}

export const SidebarControlPanel: React.FC<SidebarControlPanelProps> = ({
  state,
  activeModule,
  onSelectModule,
  onUpdateKhbdMeta,
  onLoadSample,
  onExportWord,
  onExportPresentation,
  onDownloadSingleHtml,
  onCopyJson,
  onExportMatrixSpecs,
  onConvertKhbdToSlides,
}) => {
  // Kiểm tra tính hợp lệ của CV 5512 (Đủ 4 hoạt động chuẩn)
  const activityNames = state.khbd.activities.map(a => a.name.toLowerCase());
  const hasWarmup = activityNames.some(n => n.includes('khởi động') || n.includes('mở đầu'));
  const hasKnowledge = activityNames.some(n => n.includes('hình thành') || n.includes('kiến thức'));
  const hasPractice = activityNames.some(n => n.includes('luyện tập'));
  const hasApply = activityNames.some(n => n.includes('vận dụng'));
  const khbdComplete = hasWarmup && hasKnowledge && hasPractice && hasApply;

  // Tính toán barem đề thi CV 7991
  const part1Points = state.exam.partI.reduce((sum, q) => sum + q.points, 0); // 3.0đ
  const part2Points = state.exam.partII.reduce((sum, q) => sum + q.maxPoints, 0); // 2.0đ
  const part3Points = state.exam.partIII.reduce((sum, q) => sum + q.points, 0); // 2.0đ
  const part4Points = state.exam.partIV.reduce((sum, q) => sum + q.totalPoints, 0); // 3.0đ
  const totalScore = Number((part1Points + part2Points + part3Points + part4Points).toFixed(2));

  // Kiểm tra cấu trúc Phần II Đúng/Sai 4 ý
  const part2AllHave4Items = state.exam.partII.every(q => q.statements.length === 4);

  return (
    <aside className="w-[380px] shrink-0 bg-white border-r border-slate-200 h-[calc(100vh-3.5rem)] flex flex-col justify-between overflow-hidden select-none z-10 no-print">
      {/* Scrollable upper area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* 3 Chế Độ Điều Hướng Chính (Scope 1 Shell Specs) */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Chế Độ Làm Việc
          </div>
          <div className="space-y-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => onSelectModule('khbd')}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left flex items-center justify-between ${
                activeModule === 'khbd'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Soạn KHBD 5512</span>
              </div>
              {khbdComplete && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">4/4 HĐ ✓</span>}
            </button>

            <button
              onClick={() => onSelectModule('slides')}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left flex items-center justify-between ${
                activeModule === 'slides'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Trình Chiếu Slide Bài Giảng</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{state.slides.slides.length} slide</span>
            </button>

            <button
              onClick={() => onSelectModule('exam')}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left flex items-center justify-between ${
                activeModule === 'exam'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Ngân Hàng Đề Thi 7991</span>
              </div>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">4 Phần</span>
            </button>
          </div>

          {/* Công cụ bổ trợ: Ma trận & JSON State */}
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button
              onClick={() => onSelectModule('matrix')}
              className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md transition text-center ${
                activeModule === 'matrix'
                  ? 'bg-blue-100/70 text-blue-800 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              Ma Trận & Đặc Tả
            </button>
            <button
              onClick={() => onSelectModule('export_json')}
              className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md transition text-center ${
                activeModule === 'export_json'
                  ? 'bg-blue-100/70 text-blue-800 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              JSON State Bàn Giao
            </button>
          </div>
        </div>

        {/* Action Card: Chuyển Nhanh KHBD Sang Slide (Scope 3) */}
        {onConvertKhbdToSlides && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Bóc Tách KHBD Sang Slide Deck
              </span>
              <span className="text-[10px] font-semibold bg-blue-600 text-white px-1.5 py-0.5 rounded">1-Click</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tự động trích xuất 4 hoạt động 5512 thành bài giảng Slide Deck 16:9 với thẻ trực quan hóa.
            </p>
            <button
              onClick={onConvertKhbdToSlides}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Chuyển Đổi Sang Slide (16:9)</span>
            </button>
          </div>
        )}

        {/* BẢNG THIẾT LẬP MA TRẬN ĐỀ (SCOPE 2 SPECS) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Thiết Lập Ma Trận Đề (CV 7991)
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
              Khóa chặt 10.0đ
            </span>
          </div>

          {/* 3 Thanh trượt phân bổ tỉ lệ 40-30-30 */}
          <div className="space-y-2.5 pt-1 border-t border-slate-200">
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="font-medium text-slate-700">1. Nhận biết (40%):</span>
                <span className="font-mono font-bold text-blue-700">4.0 điểm</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="5"
                defaultValue="40"
                className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="font-medium text-slate-700">2. Thông hiểu (30%):</span>
                <span className="font-mono font-bold text-indigo-700">3.0 điểm</span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                step="5"
                defaultValue="30"
                className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="font-medium text-slate-700">3. Vận dụng (30%):</span>
                <span className="font-mono font-bold text-emerald-700">3.0 điểm</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                defaultValue="30"
                className="w-full h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          {/* Bộ đếm số lượng câu hỏi từng phần */}
          <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[11px]">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Số Lượng Câu Hỏi 4 Phần
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-white p-1.5 rounded border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Phần I (TN):</span>
                <span className="font-mono font-bold text-slate-900">{state.exam.partI.length} câu (3.0đ)</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Phần II (Đ/S):</span>
                <span className="font-mono font-bold text-slate-900">{state.exam.partII.length} câu (2.0đ)</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Phần III (Ngắn):</span>
                <span className="font-mono font-bold text-slate-900">{state.exam.partIII.length} câu (2.0đ)</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Phần IV (Tự luận):</span>
                <span className="font-mono font-bold text-slate-900">{state.exam.partIV.length} câu (3.0đ)</span>
              </div>
            </div>
            <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex justify-between items-center font-medium mt-1">
              <span>Tổng số câu: {state.exam.partI.length + state.exam.partII.length + state.exam.partIII.length + state.exam.partIV.length} câu</span>
              <span className="font-bold">Tổng 10.0 điểm</span>
            </div>
          </div>

          {/* Nút tải nhanh chuyên trách Scope 2 */}
          <div className="pt-2 border-t border-slate-200 space-y-1.5">
            <button
              onClick={() => onExportWord('exam')}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tải file Word chuẩn Bộ GD&ĐT</span>
            </button>
            <button
              onClick={onExportMatrixSpecs}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tải Ma Trận Đặc Tả (Word)</span>
            </button>
          </div>
        </div>

        {/* Thông Tin Hồ Sơ & Giáo Viên */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Thiết Lập Hồ Sơ
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Tên bài dạy</label>
              <input
                type="text"
                value={state.khbd.lessonTitle}
                onChange={(e) => onUpdateKhbdMeta('lessonTitle', e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Môn học</label>
                <input
                  type="text"
                  value={state.khbd.subject}
                  onChange={(e) => onUpdateKhbdMeta('subject', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Khối lớp</label>
                <input
                  type="text"
                  value={state.khbd.grade}
                  onChange={(e) => onUpdateKhbdMeta('grade', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Giáo viên</label>
                <input
                  type="text"
                  value={state.khbd.teacherName}
                  onChange={(e) => onUpdateKhbdMeta('teacherName', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Số tiết</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={state.khbd.durationPeriods}
                  onChange={(e) => onUpdateKhbdMeta('durationPeriods', Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Trường học</label>
              <input
                type="text"
                value={state.khbd.schoolName}
                onChange={(e) => onUpdateKhbdMeta('schoolName', e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bộ Mẫu Chương Trình GDPT 2018 Có Sẵn */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Nạp Mẫu Soạn Sẵn
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onLoadSample('math')}
              className="px-2 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center transition"
            >
              Toán 10
            </button>
            <button
              onClick={() => onLoadSample('science')}
              className="px-2 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center transition"
            >
              KHTN 8
            </button>
            <button
              onClick={() => onLoadSample('history')}
              className="px-2 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center transition"
            >
              Lịch sử 11
            </button>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Actions / Export Area */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 shrink-0">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Khu Vực Xuất File</span>
          <span className="text-[10px] text-slate-400">Offline Ready</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onExportWord('khbd')}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Word KHBD</span>
          </button>
          <button
            onClick={() => onExportWord('exam')}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Word Đề Thi</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportPresentation}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Xuất Slide</span>
          </button>
          <button
            onClick={onCopyJson}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span>Copy JSON</span>
          </button>
        </div>

        {/* Nút Xuất Single File HTML - Đặc trưng yêu cầu */}
        <button
          onClick={onDownloadSingleHtml}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tải File Đơn Nhất HTML (Alpine.js)</span>
        </button>
      </div>
    </aside>
  );
};
