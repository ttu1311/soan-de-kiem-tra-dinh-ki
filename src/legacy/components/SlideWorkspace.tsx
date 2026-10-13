import React, { useState, useEffect } from 'react';
import { SlideDeck, SlideItem } from '../types/edtech';
import { 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Sparkles,
  RotateCcw,
  LayoutGrid,
  List,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface SlideWorkspaceProps {
  slides: SlideDeck;
  lessonTitle: string;
  teacherName: string;
  subject: string;
  grade: string;
  onUpdateSlides: (updater: (prev: SlideDeck) => SlideDeck) => void;
  onSyncFromKhbd?: () => void;
}

export const SlideWorkspace: React.FC<SlideWorkspaceProps> = ({
  slides,
  lessonTitle,
  teacherName,
  subject,
  grade,
  onUpdateSlides,
  onSyncFromKhbd
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCardView, setIsCardView] = useState(true); // Thẻ trực quan hóa kiến thức

  // Classroom Activity Timer (đếm ngược hoạt động thảo luận nhóm)
  const [timerSeconds, setTimerSeconds] = useState(120); // 2 phút mặc định
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // Phím tắt điều hướng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, slides.slides.length, isFullscreen, isEditing]);

  const currentSlide = slides.slides[currentIdx] || slides.slides[0];

  const handleNext = () => {
    if (currentIdx < slides.slides.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleAddSlide = () => {
    const newSlide: SlideItem = {
      id: `s-${Date.now()}`,
      type: 'content',
      title: 'TIÊU ĐỀ SLIDE MỚI',
      subtitle: 'Nội dung kiến thức bổ sung',
      bullets: [
        'Ý chính 1: Nêu khái niệm hoặc nguyên lý trọng tâm.',
        'Ý chính 2: Ví dụ minh họa và câu hỏi định hướng.'
      ],
      teacherNotes: 'Ghi chú cho giáo viên: Dành 3 phút cho học sinh thảo luận cặp đôi.',
      visualTag: 'Bài Học'
    };

    onUpdateSlides(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    setCurrentIdx(slides.slides.length);
  };

  const handleDeleteSlide = (idx: number) => {
    if (slides.slides.length <= 1) return;
    onUpdateSlides(prev => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== idx)
    }));
    if (currentIdx >= slides.slides.length - 1) {
      setCurrentIdx(Math.max(0, slides.slides.length - 2));
    }
  };

  const handleUpdateSlideField = (field: keyof SlideItem, value: any) => {
    onUpdateSlides(prev => {
      const updated = [...prev.slides];
      updated[currentIdx] = { ...updated[currentIdx], [field]: value };
      return { ...prev, slides: updated };
    });
  };

  const handleUpdateBullet = (bulletIdx: number, val: string) => {
    onUpdateSlides(prev => {
      const updated = [...prev.slides];
      const newBullets = [...updated[currentIdx].bullets];
      newBullets[bulletIdx] = val;
      updated[currentIdx] = { ...updated[currentIdx], bullets: newBullets };
      return { ...prev, slides: updated };
    });
  };

  const handleAddBullet = () => {
    onUpdateSlides(prev => {
      const updated = [...prev.slides];
      const newBullets = [...updated[currentIdx].bullets, 'Nội dung ý mới...'];
      updated[currentIdx] = { ...updated[currentIdx], bullets: newBullets };
      return { ...prev, slides: updated };
    });
  };

  const handleRemoveBullet = (bulletIdx: number) => {
    onUpdateSlides(prev => {
      const updated = [...prev.slides];
      const newBullets = updated[currentIdx].bullets.filter((_, i) => i !== bulletIdx);
      updated[currentIdx] = { ...updated[currentIdx], bullets: newBullets };
      return { ...prev, slides: updated };
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-6 max-w-5xl mx-auto pb-12 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between max-w-none' : ''}`}>
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-2xs no-print">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">
            Slide {currentIdx + 1} / {slides.slides.length}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-blue-600 font-medium">
            {lessonTitle} ({subject} - {grade})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Chuyển Đổi Nhanh từ KHBD 5512 */}
          {onSyncFromKhbd && (
            <button
              onClick={onSyncFromKhbd}
              className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Đồng bộ toàn bộ nội dung từ KHBD 5512 sang Slide"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Chuyển Đổi Nhanh từ KHBD</span>
            </button>
          )}

          {/* Chế độ Thẻ trực quan hóa kiến thức */}
          <button
            onClick={() => setIsCardView(!isCardView)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
              isCardView ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200'
            }`}
            title="Chuyển chế độ Thẻ trực quan hóa kiến thức"
          >
            {isCardView ? <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" /> : <List className="w-3.5 h-3.5" />}
            <span>{isCardView ? 'Thẻ Trực Quan' : 'Danh Sách'}</span>
          </button>

          {/* Đồng hồ thảo luận lớp học */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono font-bold text-slate-800">{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700 ml-1 cursor-pointer"
            >
              {timerActive ? 'Tạm dừng' : 'Chạy'}
            </button>
            <button
              onClick={() => { setTimerActive(false); setTimerSeconds(120); }}
              className="text-slate-400 hover:text-slate-600 p-0.5 ml-0.5 cursor-pointer"
              title="Đặt lại 2 phút"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition flex items-center gap-1 cursor-pointer ${
              showNotes ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ghi chú GV</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition flex items-center gap-1 cursor-pointer ${
              isEditing ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Xong sửa' : 'Chỉnh sửa'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ (Esc)' : 'Toàn màn hình trình chiếu'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Thu Nhỏ' : 'Toàn Màn Hình'}</span>
          </button>
        </div>
      </div>

      {/* Main 16:9 Presentation Canvas */}
      <div className={`w-full aspect-[16/9] bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden transition-all ${
        isFullscreen ? 'h-full max-h-[85vh] mx-auto aspect-auto' : ''
      }`}>
        {/* Slide Header Zone */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/50">
              {currentSlide.visualTag || 'GDPT 2018'}
            </span>
            <span className="text-xs text-slate-400">
              {subject} - {grade}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {currentIdx + 1} / {slides.slides.length}
          </span>
        </div>

        {/* Slide Main Content Zone */}
        <div className="my-auto py-4 space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tiêu đề Slide:</label>
                <input
                  type="text"
                  value={currentSlide.title}
                  onChange={(e) => handleUpdateSlideField('title', e.target.value)}
                  className="w-full text-xl font-bold bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Phụ đề / Mục tiêu:</label>
                <input
                  type="text"
                  value={currentSlide.subtitle || ''}
                  onChange={(e) => handleUpdateSlideField('subtitle', e.target.value)}
                  className="w-full text-sm bg-slate-900 border border-slate-700 rounded p-2 text-blue-300"
                />
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                {currentSlide.title}
              </h1>
              {currentSlide.subtitle && (
                <p className="text-base sm:text-lg text-blue-300 mt-2 font-medium">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Bullet Points */}
          <div className="pt-2">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Các ý nội dung trọng tâm:</span>
                  <button
                    onClick={handleAddBullet}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Thêm ý
                  </button>
                </div>
                {currentSlide.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={b}
                      onChange={(e) => handleUpdateBullet(bIdx, e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                    />
                    <button
                      onClick={() => handleRemoveBullet(bIdx)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : isCardView ? (
              <div className={`grid gap-3 sm:gap-4 ${currentSlide.bullets.length > 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {currentSlide.bullets.map((b, bIdx) => {
                  const parts = b.split(/:(.+)/);
                  const hasLabel = parts.length > 1;
                  const label = hasLabel ? parts[0].trim() : null;
                  const content = hasLabel ? parts[1].trim() : b;

                  let badgeColor = 'bg-blue-900/60 text-blue-300 border-blue-700/60';
                  let borderColor = 'border-slate-800 hover:border-blue-500/50';

                  if (label?.toLowerCase().includes('nhiệm vụ hs') || label?.toLowerCase().includes('học sinh') || label?.toLowerCase().includes('sản phẩm')) {
                    badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
                    borderColor = 'border-slate-800 hover:border-emerald-500/50';
                  } else if (label?.toLowerCase().includes('mục tiêu') || label?.toLowerCase().includes('nhiệm vụ gv') || label?.toLowerCase().includes('giáo viên')) {
                    badgeColor = 'bg-blue-950/80 text-blue-300 border-blue-800/60';
                    borderColor = 'border-slate-800 hover:border-blue-500/50';
                  } else if (label?.toLowerCase().includes('luyện tập') || label?.toLowerCase().includes('vận dụng')) {
                    badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-800/60';
                    borderColor = 'border-slate-800 hover:border-amber-500/50';
                  } else if (label?.toLowerCase().includes('năng lực') || label?.toLowerCase().includes('phẩm chất')) {
                    badgeColor = 'bg-purple-950/80 text-purple-300 border-purple-800/60';
                    borderColor = 'border-slate-800 hover:border-purple-500/50';
                  }

                  return (
                    <div 
                      key={bIdx}
                      className={`bg-slate-900/90 border ${borderColor} rounded-xl p-3.5 sm:p-4 transition-all duration-150 flex flex-col justify-start gap-1.5 shadow-xs`}
                    >
                      {label && (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                            {label}
                          </span>
                        </div>
                      )}
                      <p className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed">
                        {content}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <ul className="space-y-3 sm:space-y-4">
                {currentSlide.bullets.map((b, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-3 text-base sm:text-lg text-slate-200">
                    <span className="text-blue-400 font-bold mt-1 text-sm">●</span>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Slide Footer / Teacher Notes */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          {showNotes && currentSlide.teacherNotes ? (
            <div className="flex items-center gap-2 max-w-[80%]">
              <span className="font-semibold text-blue-400 shrink-0">Ghi chú sư phạm:</span>
              <span className="truncate text-slate-300">{currentSlide.teacherNotes}</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500">Giáo viên: {teacherName}</div>
          )}
          <span className="text-[11px] text-slate-500">Phím ◀ ▶ để chuyển trang</span>
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div className={`flex items-center justify-between rounded-xl p-3 transition ${
        isFullscreen 
          ? 'bg-slate-900/95 border border-slate-800 text-white backdrop-blur-md shadow-2xl mt-3' 
          : 'bg-white border border-slate-200 shadow-2xs no-print'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentIdx === 0
                ? 'text-slate-500 opacity-40 cursor-not-allowed'
                : isFullscreen 
                  ? 'text-slate-200 bg-slate-800 hover:bg-slate-700' 
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trang Trước</span>
          </button>

          {isFullscreen && (
            <span className="text-xs text-slate-400 font-mono hidden sm:inline px-2">
              Slide {currentIdx + 1} / {slides.slides.length}
            </span>
          )}
        </div>

        {/* Thumbnail Preview Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[500px] px-2 py-1">
          {slides.slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentIdx(idx)}
              className={`w-9 h-7 rounded border text-[11px] font-bold flex items-center justify-center transition shrink-0 cursor-pointer ${
                idx === currentIdx
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : isFullscreen
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {idx + 1}
            </button>
          ))}
          {!isFullscreen && (
            <button
              onClick={handleAddSlide}
              className="w-7 h-7 rounded border border-dashed border-slate-300 text-slate-400 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center shrink-0 cursor-pointer"
              title="Thêm slide mới"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
              title="Thoát toàn màn hình (Esc)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Thoát Fullscreen</span>
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentIdx === slides.slides.length - 1}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentIdx === slides.slides.length - 1
                ? 'text-slate-500 opacity-40 cursor-not-allowed'
                : 'text-white bg-blue-600 hover:bg-blue-700 shadow-xs'
            }`}
          >
            <span>Trang Sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
