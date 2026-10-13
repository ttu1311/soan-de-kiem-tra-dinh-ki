import React, { useState } from 'react';
import { LessonPlan5512 } from '../types/edtech';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  Presentation, 
  Sparkles, 
  Layers,
  CheckCircle2
} from 'lucide-react';

interface KhbdWorkspaceProps {
  khbd: LessonPlan5512;
  onUpdateKhbd: (updater: (prev: LessonPlan5512) => LessonPlan5512) => void;
  onConvertToSlides: () => void;
}

export const KhbdWorkspace: React.FC<KhbdWorkspaceProps> = ({ khbd, onUpdateKhbd, onConvertToSlides }) => {
  const [collapsedActivities, setCollapsedActivities] = useState<{ [id: string]: boolean }>({});
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [isGlobalEditMode, setIsGlobalEditMode] = useState<boolean>(true);

  const toggleCollapse = (id: string) => {
    setCollapsedActivities(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateObjective = (type: 'knowledge' | 'general' | 'specific' | 'qualities', index: number, value: string) => {
    onUpdateKhbd(prev => {
      const clone = { ...prev };
      if (type === 'knowledge') {
        const arr = [...clone.knowledgeObjectives];
        arr[index] = value;
        clone.knowledgeObjectives = arr;
      } else if (type === 'general') {
        const arr = [...clone.generalCompetencies];
        arr[index] = value;
        clone.generalCompetencies = arr;
      } else if (type === 'specific') {
        const arr = [...clone.specificCompetencies];
        arr[index] = value;
        clone.specificCompetencies = arr;
      } else {
        const arr = [...clone.qualities];
        arr[index] = value;
        clone.qualities = arr;
      }
      return clone;
    });
  };

  const handleAddObjective = (type: 'knowledge' | 'general' | 'specific' | 'qualities') => {
    onUpdateKhbd(prev => {
      const clone = { ...prev };
      if (type === 'knowledge') {
        clone.knowledgeObjectives = [...clone.knowledgeObjectives, 'Mục tiêu kiến thức mới...'];
      } else if (type === 'general') {
        clone.generalCompetencies = [...clone.generalCompetencies, 'Năng lực chung mới...'];
      } else if (type === 'specific') {
        clone.specificCompetencies = [...clone.specificCompetencies, 'Năng lực đặc thù mới...'];
      } else {
        clone.qualities = [...clone.qualities, 'Phẩm chất mới...'];
      }
      return clone;
    });
  };

  const handleRemoveObjective = (type: 'knowledge' | 'general' | 'specific' | 'qualities', index: number) => {
    onUpdateKhbd(prev => {
      const clone = { ...prev };
      if (type === 'knowledge') {
        clone.knowledgeObjectives = clone.knowledgeObjectives.filter((_, i) => i !== index);
      } else if (type === 'general') {
        clone.generalCompetencies = clone.generalCompetencies.filter((_, i) => i !== index);
      } else if (type === 'specific') {
        clone.specificCompetencies = clone.specificCompetencies.filter((_, i) => i !== index);
      } else {
        clone.qualities = clone.qualities.filter((_, i) => i !== index);
      }
      return clone;
    });
  };

  const handleUpdateActivityField = (actId: string, field: 'target' | 'content' | 'product', value: string) => {
    onUpdateKhbd(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === actId ? { ...a, [field]: value } : a)
    }));
  };

  const handleUpdateStepAction = (actId: string, stepIndex: number, actionType: 'teacherAction' | 'studentAction', value: string) => {
    onUpdateKhbd(prev => ({
      ...prev,
      activities: prev.activities.map(a => {
        if (a.id !== actId) return a;
        const newImpl = [...a.implementation];
        newImpl[stepIndex] = { ...newImpl[stepIndex], [actionType]: value };
        return { ...a, implementation: newImpl };
      })
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* SCOPE 3: Nút Chuyển Đổi Nhanh KHBD Thành Slide */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-500/30 no-print">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base tracking-tight">Chuyển Đổi Nhanh KHBD Thành Slide</h3>
              <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                1-Click Slide Deck
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Tự động trích xuất 4 hoạt động 5512 thành bài giảng trình chiếu 16:9 với thẻ trực quan hóa kiến thức
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => setIsGlobalEditMode(!isGlobalEditMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
              isGlobalEditMode 
                ? 'bg-blue-800/80 text-white border-blue-400/50' 
                : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
            }`}
            title="Bật/Tắt chế độ chỉnh sửa trực tiếp cho toàn bộ văn bản"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isGlobalEditMode ? 'Đang Sửa Trực Tiếp' : 'Bật Sửa Trực Tiếp'}</span>
          </button>

          <button
            onClick={onConvertToSlides}
            className="flex-1 sm:flex-none px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer border border-transparent hover:scale-[1.02] active:scale-[0.98]"
          >
            <Presentation className="w-4 h-4 text-blue-600" />
            <span>Chuyển Đổi Sang Slide (16:9)</span>
          </button>
        </div>
      </div>

      {/* Khung tài liệu A4 chuẩn */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-8 sm:p-10 space-y-8">
        
        {/* Header Quốc hiệu - Tiêu ngữ chuẩn Công văn 5512 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-200 text-xs">
          <div>
            <p className="font-bold uppercase text-slate-800">{khbd.schoolName}</p>
            <p className="font-semibold text-slate-700">{khbd.departmentName}</p>
            <p className="text-slate-500 mt-1">Giáo viên: <span className="font-medium text-slate-800">{khbd.teacherName}</span></p>
          </div>
          <div className="sm:text-center text-slate-800">
            <p className="font-bold uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="font-semibold">Độc lập - Tự do - Hạnh phúc</p>
            <div className="w-24 h-0.5 bg-slate-300 mx-auto my-1 hidden sm:block"></div>
          </div>
        </div>

        {/* Tiêu đề bài dạy */}
        <div className="text-center space-y-1.5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
            Phụ lục IV - Công văn số 5512/BGDĐT-GDTrH
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
            KẾ HOẠCH BÀI DẠY: {khbd.lessonTitle}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span>Môn: <b>{khbd.subject}</b></span>
            <span>·</span>
            <span>Khối: <b>{khbd.grade}</b></span>
            <span>·</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3.5 h-3.5" />
              Thời lượng: <b>{khbd.durationPeriods} tiết</b>
            </span>
          </div>
        </div>

        {/* PHẦN I: MỤC TIÊU DẠY HỌC */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              I. MỤC TIÊU DẠY HỌC
            </h2>
            <span className="text-xs text-slate-400">Chuẩn đầu ra GDPT 2018</span>
          </div>

          {/* 1. Kiến thức */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800">1. Về kiến thức:</h3>
              <button
                onClick={() => handleAddObjective('knowledge')}
                className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> Thêm mục tiêu
              </button>
            </div>
            <div className="space-y-1.5 pl-2">
              {khbd.knowledgeObjectives.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 group">
                  <span className="text-blue-500 mt-1">●</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateObjective('knowledge', idx, e.target.value)}
                    className="flex-1 text-xs text-slate-700 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 border border-transparent hover:border-slate-200"
                  />
                  {khbd.knowledgeObjectives.length > 1 && (
                    <button
                      onClick={() => handleRemoveObjective('knowledge', idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Năng lực */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-slate-800">2. Về năng lực:</h3>
            
            {/* a) Năng lực chung */}
            <div className="space-y-1.5 pl-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 italic">a) Năng lực chung:</span>
                <button
                  onClick={() => handleAddObjective('general')}
                  className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" /> Thêm
                </button>
              </div>
              {khbd.generalCompetencies.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 group">
                  <span className="text-slate-400 mt-1">-</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateObjective('general', idx, e.target.value)}
                    className="flex-1 text-xs text-slate-700 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 border border-transparent hover:border-slate-200"
                  />
                  {khbd.generalCompetencies.length > 1 && (
                    <button
                      onClick={() => handleRemoveObjective('general', idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* b) Năng lực đặc thù */}
            <div className="space-y-1.5 pl-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 italic">b) Năng lực đặc thù của môn học:</span>
                <button
                  onClick={() => handleAddObjective('specific')}
                  className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" /> Thêm
                </button>
              </div>
              {khbd.specificCompetencies.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 group">
                  <span className="text-slate-400 mt-1">-</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateObjective('specific', idx, e.target.value)}
                    className="flex-1 text-xs text-slate-700 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 border border-transparent hover:border-slate-200"
                  />
                  {khbd.specificCompetencies.length > 1 && (
                    <button
                      onClick={() => handleRemoveObjective('specific', idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Phẩm chất */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800">3. Về phẩm chất:</h3>
              <button
                onClick={() => handleAddObjective('qualities')}
                className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> Thêm
              </button>
            </div>
            <div className="space-y-1.5 pl-2">
              {khbd.qualities.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 group">
                  <span className="text-emerald-500 mt-1">●</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateObjective('qualities', idx, e.target.value)}
                    className="flex-1 text-xs text-slate-700 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 border border-transparent hover:border-slate-200"
                  />
                  {khbd.qualities.length > 1 && (
                    <button
                      onClick={() => handleRemoveObjective('qualities', idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PHẦN II: THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU */}
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <label className="font-semibold text-slate-800 block">1. Giáo viên chuẩn bị:</label>
              <textarea
                rows={3}
                value={khbd.teacherSupplies}
                onChange={(e) => onUpdateKhbd(p => ({ ...p, teacherSupplies: e.target.value }))}
                className="w-full text-xs text-slate-700 bg-white p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <label className="font-semibold text-slate-800 block">2. Học sinh chuẩn bị:</label>
              <textarea
                rows={3}
                value={khbd.studentSupplies}
                onChange={(e) => onUpdateKhbd(p => ({ ...p, studentSupplies: e.target.value }))}
                className="w-full text-xs text-slate-700 bg-white p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* PHẦN III: TIẾN TRÌNH DẠY HỌC (ĐỦ 4 HOẠT ĐỘNG CHUẨN CV 5512) */}
        <section className="space-y-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Đầy đủ: Mục tiêu · Nội dung · Sản phẩm · Tổ chức thực hiện (4 bước)
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              ✓ Đạt chuẩn CV 5512
            </span>
          </div>

          <div className="space-y-4">
            {khbd.activities.map((act) => {
              const isCollapsed = collapsedActivities[act.id];
              const isEditing = isGlobalEditMode || editingActivityId === act.id;

              return (
                <div
                  key={act.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-all"
                >
                  {/* Activity Bar Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-slate-50/80 cursor-pointer hover:bg-slate-100/80 border-b border-slate-200/80 select-none"
                    onClick={() => toggleCollapse(act.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {act.number}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{act.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Thời lượng: ~{act.durationMinutes} phút</span>
                          <span>·</span>
                          <span className="text-blue-600">{act.implementation.length} bước tổ chức</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingActivityId(isEditing ? null : act.id)}
                        className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 transition ${
                          isEditing ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Đóng sửa' : 'Chỉnh sửa'}</span>
                      </button>
                      <button
                        onClick={() => toggleCollapse(act.id)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Activity Details Body */}
                  {!isCollapsed && (
                    <div className="p-5 space-y-4 text-xs">
                      {/* a) Mục tiêu */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 block">a) Mục tiêu:</span>
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={act.target}
                            onChange={(e) => handleUpdateActivityField(act.id, 'target', e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-slate-700 leading-relaxed pl-2 bg-slate-50/50 p-2 rounded">
                            {act.target}
                          </p>
                        )}
                      </div>

                      {/* b) Nội dung */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 block">b) Nội dung:</span>
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={act.content}
                            onChange={(e) => handleUpdateActivityField(act.id, 'content', e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-slate-700 leading-relaxed pl-2 bg-slate-50/50 p-2 rounded">
                            {act.content}
                          </p>
                        )}
                      </div>

                      {/* c) Sản phẩm */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 block">c) Sản phẩm:</span>
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={act.product}
                            onChange={(e) => handleUpdateActivityField(act.id, 'product', e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-slate-700 leading-relaxed pl-2 bg-slate-50/50 p-2 rounded">
                            {act.product}
                          </p>
                        )}
                      </div>

                      {/* d) Tổ chức thực hiện: 4 bước chuẩn */}
                      <div className="space-y-2 pt-2">
                        <span className="font-bold text-slate-900 block">d) Tổ chức thực hiện:</span>
                        
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                <th className="p-2.5 text-left font-bold w-1/4">Các bước tiến hành</th>
                                <th className="p-2.5 text-left font-bold w-3/8 border-l border-slate-200">Hoạt động của Giáo viên</th>
                                <th className="p-2.5 text-left font-bold w-3/8 border-l border-slate-200">Hoạt động của Học sinh</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {act.implementation.map((step, sIdx) => (
                                <tr key={sIdx} className="hover:bg-slate-50/60">
                                  <td className="p-2.5 align-top font-semibold text-blue-700">
                                    {step.title}
                                  </td>
                                  <td className="p-2.5 align-top border-l border-slate-200 text-slate-700">
                                    {isEditing ? (
                                      <textarea
                                        rows={3}
                                        value={step.teacherAction}
                                        onChange={(e) => handleUpdateStepAction(act.id, sIdx, 'teacherAction', e.target.value)}
                                        className="w-full p-1.5 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none"
                                      />
                                    ) : (
                                      <span className="leading-relaxed">{step.teacherAction}</span>
                                    )}
                                  </td>
                                  <td className="p-2.5 align-top border-l border-slate-200 text-slate-700">
                                    {isEditing ? (
                                      <textarea
                                        rows={3}
                                        value={step.studentAction}
                                        onChange={(e) => handleUpdateStepAction(act.id, sIdx, 'studentAction', e.target.value)}
                                        className="w-full p-1.5 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none"
                                      />
                                    ) : (
                                      <span className="leading-relaxed">{step.studentAction}</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};
