import React, { useState } from 'react';
import { Exam7991, QuestionPartI, QuestionPartII, QuestionPartIII, QuestionPartIV } from '../types/edtech';
import { 
  FileCheck2, 
  HelpCircle, 
  Check, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  Calculator,
  Download,
  FileText
} from 'lucide-react';

interface ExamWorkspaceProps {
  exam: Exam7991;
  onUpdateExam: (updater: (prev: Exam7991) => Exam7991) => void;
  onExportWord: () => void;
  onExportMatrixSpecs: () => void;
}

export const ExamWorkspace: React.FC<ExamWorkspaceProps> = ({ 
  exam, 
  onUpdateExam,
  onExportWord,
  onExportMatrixSpecs
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'paper' | 'matrix' | 'specs' | 'guide'>('paper');
  const [showAnswerKeys, setShowAnswerKeys] = useState(true);

  // Thử nghiệm chấm điểm Phần II (Student Simulator)
  const [studentP2Answers, setStudentP2Answers] = useState<{ [qId: string]: { [subId: string]: boolean | null } }>({});

  const handleToggleStudentAnswer = (qId: string, subId: string, val: boolean) => {
    setStudentP2Answers(prev => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {}),
        [subId]: prev[qId]?.[subId] === val ? null : val
      }
    }));
  };

  // Công thức chấm điểm chuẩn Công văn 7991 cho Phần II:
  // - Đúng 1 ý: 0.1 điểm
  // - Đúng 2 ý: 0.25 điểm
  // - Đúng 3 ý: 0.50 điểm
  // - Đúng 4 ý: 1.0 điểm
  const calculatePartIIScore = (q: QuestionPartII) => {
    const userAnswers = studentP2Answers[q.id] || {};
    let correctCount = 0;
    q.statements.forEach(st => {
      if (userAnswers[st.subId] === st.isCorrect) {
        correctCount++;
      }
    });

    if (correctCount === 1) return 0.1;
    if (correctCount === 2) return 0.25;
    if (correctCount === 3) return 0.5;
    if (correctCount === 4) return 1.0;
    return 0.0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Sub Tabs Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2 shadow-2xs no-print">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('paper')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'paper'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đề Thi (4 Phần Độc Lập)
          </button>
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Bảng Ma Trận (CV 7991)
          </button>
          <button
            onClick={() => setActiveSubTab('specs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'specs'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Bản Đặc Tả Đề Kiểm Tra
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'guide'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hướng Dẫn Chấm & Barem
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onExportWord}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-2xs transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải file Word chuẩn Bộ GD&ĐT</span>
            <span className="sm:hidden">Word Đề Thi</span>
          </button>

          <button
            onClick={onExportMatrixSpecs}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Tải Ma Trận Đặc Tả</span>
            <span className="sm:hidden">Đặc Tả</span>
          </button>

          <button
            onClick={() => setShowAnswerKeys(!showAnswerKeys)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
              showAnswerKeys
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {showAnswerKeys ? 'Ẩn đáp án' : 'Hiện đáp án'}
          </button>
        </div>
      </div>

      {/* VIEW 1: ĐỀ THI 4 PHẦN ĐỘC LẬP (CHUẨN CÔNG VĂN 7991) */}
      {activeSubTab === 'paper' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-8 sm:p-10 space-y-8">
          
          {/* Header Đề thi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-200 text-xs">
            <div>
              <p className="font-bold uppercase text-slate-800">{exam.schoolName}</p>
              <p className="text-slate-600">Năm học: <span className="font-medium text-slate-800">{exam.academicYear}</span></p>
              <p className="text-slate-600">Môn: <span className="font-bold text-slate-900">{exam.subject}</span> ({exam.grade})</p>
            </div>
            <div className="sm:text-right">
              <p className="font-bold uppercase text-blue-700">{exam.title}</p>
              <p className="text-slate-600">Thời gian làm bài: <span className="font-bold text-slate-900">{exam.durationMinutes} phút</span></p>
              <p className="text-slate-500 italic text-[11px]">(Đề gồm 4 phần - Thang điểm 10.0)</p>
            </div>
          </div>

          {/* Ma trận tổng quan thông tin */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-700">
            <div>Cấu trúc: <b>Phần I (3,0đ)</b> · <b>Phần II (2,0đ)</b> · <b>Phần III (2,0đ)</b> · <b>Phần IV (3,0đ)</b></div>
            <div className="font-semibold text-emerald-700">
              Tổng barem: 10.0 điểm (40% NB - 30% TH - 30% VD)
            </div>
          </div>

          {/* PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN */}
          <section className="space-y-4">
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs">
              <h2 className="text-sm font-bold text-blue-900 uppercase">
                PHẦN I. CÂU TRẮC NGHIỆM NHIỀU LỰA CHỌN (3,0 điểm)
              </h2>
              <p className="text-slate-600 mt-0.5">
                Thí sinh trả lời từ câu 1 đến câu {exam.partI.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án đúng (0,25 điểm/câu).
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {exam.partI.map((q) => (
                <div key={q.id} className="text-xs text-slate-800 space-y-2 border-b border-slate-100 pb-3">
                  <p className="font-medium text-slate-900">
                    <span className="font-bold text-blue-700">Câu {q.questionNumber}:</span> {q.content}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 text-slate-700">
                    <div className={showAnswerKeys && q.correctAnswer === 'A' ? 'font-bold text-blue-700' : ''}>
                      <span className="font-semibold text-slate-800 mr-1.5">A.</span>{q.options.A}
                    </div>
                    <div className={showAnswerKeys && q.correctAnswer === 'B' ? 'font-bold text-blue-700' : ''}>
                      <span className="font-semibold text-slate-800 mr-1.5">B.</span>{q.options.B}
                    </div>
                    <div className={showAnswerKeys && q.correctAnswer === 'C' ? 'font-bold text-blue-700' : ''}>
                      <span className="font-semibold text-slate-800 mr-1.5">C.</span>{q.options.C}
                    </div>
                    <div className={showAnswerKeys && q.correctAnswer === 'D' ? 'font-bold text-blue-700' : ''}>
                      <span className="font-semibold text-slate-800 mr-1.5">D.</span>{q.options.D}
                    </div>
                  </div>
                  {showAnswerKeys && (
                    <div className="pl-4 text-[11px] text-emerald-700 bg-emerald-50/60 p-2 rounded border border-emerald-100 mt-1">
                      <span>Đáp án đúng: <b>{q.correctAnswer}</b></span>
                      {q.explanation && <span className="ml-2 text-slate-600 font-normal">· {q.explanation}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI 4 LỆNH A-B-C-D (TRỌNG TÂM CÔNG VĂN 7991) */}
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-amber-900 uppercase">
                  PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG / SAI (2,0 điểm)
                </h2>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Quy định CV 7991/BGDĐT-GDTrH
                </span>
              </div>
              <p className="text-slate-700 mt-1">
                Thí sinh trả lời từ câu 1 đến câu {exam.partII.length}. Trong mỗi ý <b>a), b), c), d)</b> ở mỗi câu, thí sinh chọn Đúng hoặc Sai.
              </p>
              <div className="mt-2 text-[11px] bg-white/80 p-2 rounded border border-amber-200/60 text-slate-700 font-mono">
                Thang điểm lũy tiến CV 7991: Đúng 1 ý: <b>0,1đ</b> | Đúng 2 ý: <b>0,25đ</b> | Đúng 3 ý: <b>0,50đ</b> | Đúng 4 ý: <b>1,0đ</b>
              </div>
            </div>

            <div className="space-y-6 pt-2">
              {exam.partII.map((q) => {
                const simScore = calculatePartIIScore(q);

                return (
                  <div key={q.id} className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/40 space-y-3">
                    <div className="text-xs">
                      <p className="font-bold text-slate-900 text-sm">
                        <span className="text-blue-700">Câu {q.questionNumber}:</span> {q.contextText}
                      </p>
                    </div>

                    {/* Bảng Đúng/Sai 4 ý a-b-c-d */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                            <th className="p-2.5 w-12 text-center">Lệnh</th>
                            <th className="p-2.5 text-left border-l border-slate-200">Nội dung khẳng định</th>
                            <th className="p-2.5 w-20 text-center border-l border-slate-200 bg-emerald-50/50 text-emerald-800">
                              Đúng
                            </th>
                            <th className="p-2.5 w-20 text-center border-l border-slate-200 bg-rose-50/50 text-rose-800">
                              Sai
                            </th>
                            {showAnswerKeys && (
                              <th className="p-2.5 w-24 text-center border-l border-slate-200 bg-slate-50 text-slate-600">
                                Đáp án chuẩn
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {q.statements.map((st) => {
                            const studentAns = studentP2Answers[q.id]?.[st.subId];

                            return (
                              <tr key={st.subId} className="hover:bg-slate-50/80">
                                <td className="p-2.5 text-center font-bold text-blue-700">
                                  {st.subId})
                                </td>
                                <td className="p-2.5 border-l border-slate-200 text-slate-800 leading-relaxed">
                                  {st.text}
                                </td>
                                
                                {/* Cột chọn Đúng */}
                                <td className="p-2.5 text-center border-l border-slate-200">
                                  <button
                                    onClick={() => handleToggleStudentAnswer(q.id, st.subId, true)}
                                    className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition ${
                                      studentAns === true
                                        ? 'bg-emerald-600 text-white font-bold'
                                        : 'border border-slate-300 hover:border-emerald-500'
                                    }`}
                                  >
                                    {studentAns === true ? <Check className="w-4 h-4" /> : ''}
                                  </button>
                                </td>

                                {/* Cột chọn Sai */}
                                <td className="p-2.5 text-center border-l border-slate-200">
                                  <button
                                    onClick={() => handleToggleStudentAnswer(q.id, st.subId, false)}
                                    className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition ${
                                      studentAns === false
                                        ? 'bg-rose-600 text-white font-bold'
                                        : 'border border-slate-300 hover:border-rose-500'
                                    }`}
                                  >
                                    {studentAns === false ? <X className="w-4 h-4" /> : ''}
                                  </button>
                                </td>

                                {/* Cột đáp án chuẩn của GV */}
                                {showAnswerKeys && (
                                  <td className="p-2.5 text-center border-l border-slate-200 font-bold">
                                    {st.isCorrect ? (
                                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                        ĐÚNG
                                      </span>
                                    ) : (
                                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                                        SAI
                                      </span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Bộ giả lập chấm điểm theo CV 7991 */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-blue-600" />
                        <span>Mô phỏng chấm điểm CV 7991:</span>
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {simScore} / 1.0 điểm
                        </span>
                      </div>
                      {q.explanation && showAnswerKeys && (
                        <div className="text-[11px] text-slate-500 italic">
                          Hướng dẫn: {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN */}
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 text-xs">
              <h2 className="text-sm font-bold text-indigo-900 uppercase">
                PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (2,0 điểm)
              </h2>
              <p className="text-slate-600 mt-0.5">
                Thí sinh trả lời từ câu 1 đến câu {exam.partIII.length}. Mỗi câu hỏi làm đúng được 0,5 điểm. Thí sinh ghi đáp số ngắn gọn vào ô quy định.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {exam.partIII.map((q) => (
                <div key={q.id} className="text-xs text-slate-800 space-y-1.5 border-b border-slate-100 pb-3">
                  <p className="font-medium text-slate-900">
                    <span className="font-bold text-blue-700">Câu {q.questionNumber}:</span> {q.content}
                  </p>
                  <div className="flex items-center gap-2 pl-4">
                    <span className="text-slate-500">Ô điền đáp số:</span>
                    <input
                      type="text"
                      placeholder="Nhập số hoặc kết quả..."
                      className="w-48 px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:border-blue-500 focus:outline-none"
                    />
                    {showAnswerKeys && (
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Đáp án chuẩn: {q.correctShortAnswer} {q.unit || ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PHẦN IV: TỰ LUẬN */}
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs">
              <h2 className="text-sm font-bold text-emerald-900 uppercase">
                PHẦN IV. TỰ LUẬN (3,0 điểm)
              </h2>
              <p className="text-slate-600 mt-0.5">
                Thí sinh trình bày chi tiết các bước lập luận, biến đổi toán học và giải pháp thực tế.
              </p>
            </div>

            <div className="space-y-6 pt-1">
              {exam.partIV.map((q) => (
                <div key={q.id} className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white space-y-3 text-xs">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      <span className="text-blue-700">Câu {q.questionNumber} ({q.totalPoints} điểm):</span>
                    </h3>
                    <p className="text-slate-800 whitespace-pre-line mt-1 leading-relaxed">
                      {q.content}
                    </p>
                  </div>

                  {/* Sub questions breakdown */}
                  {q.subQuestions && q.subQuestions.length > 0 && (
                    <div className="space-y-1.5 pl-3 border-l-2 border-slate-200">
                      {q.subQuestions.map((sq, sqIdx) => (
                        <div key={sqIdx} className="flex justify-between items-center text-slate-700">
                          <span><b>{sq.label}:</b> {sq.text}</span>
                          <span className="font-mono font-semibold text-blue-600 shrink-0 ml-2">
                            {sq.points} điểm
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hướng dẫn chấm chi tiết */}
                  {showAnswerKeys && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>Hướng dẫn chấm và biểu điểm:</span>
                        <span className="text-[11px] text-emerald-700 font-mono font-semibold">
                          Tối đa {q.totalPoints}đ
                        </span>
                      </div>
                      <pre className="font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                        {q.modelAnswer}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* VIEW 2: BẢNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ (THEO CÔNG VĂN 7991) */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ (CÔNG VĂN 7991/BGDĐT-GDTrH)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Phụ lục 1: Phân bổ số lượng câu hỏi và điểm số theo 3 mức độ nhận thức
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full border-collapse text-xs text-center">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                  <th rowSpan={2} className="p-2 border-r border-slate-200 w-12">TT</th>
                  <th rowSpan={2} className="p-2 border-r border-slate-200 text-left w-48">Chủ đề / Đơn vị kiến thức</th>
                  <th colSpan={3} className="p-2 border-r border-slate-200 bg-blue-50/80">Phần I: Nhiều lựa chọn</th>
                  <th colSpan={3} className="p-2 border-r border-slate-200 bg-amber-50/80">Phần II: Đúng - Sai</th>
                  <th colSpan={3} className="p-2 border-r border-slate-200 bg-indigo-50/80">Phần III: Trả lời ngắn</th>
                  <th colSpan={3} className="p-2 border-r border-slate-200 bg-emerald-50/80">Phần IV: Tự luận</th>
                  <th colSpan={3} className="p-2 bg-slate-200/80">Tổng số điểm</th>
                </tr>
                <tr className="bg-slate-50 font-semibold text-[11px] text-slate-700 border-b border-slate-200">
                  <th className="p-1.5 border-r border-slate-200">Biết</th>
                  <th className="p-1.5 border-r border-slate-200">Hiểu</th>
                  <th className="p-1.5 border-r border-slate-200">VD</th>
                  <th className="p-1.5 border-r border-slate-200">Biết</th>
                  <th className="p-1.5 border-r border-slate-200">Hiểu</th>
                  <th className="p-1.5 border-r border-slate-200">VD</th>
                  <th className="p-1.5 border-r border-slate-200">Biết</th>
                  <th className="p-1.5 border-r border-slate-200">Hiểu</th>
                  <th className="p-1.5 border-r border-slate-200">VD</th>
                  <th className="p-1.5 border-r border-slate-200">Biết</th>
                  <th className="p-1.5 border-r border-slate-200">Hiểu</th>
                  <th className="p-1.5 border-r border-slate-200">VD</th>
                  <th className="p-1.5 border-r border-slate-200 font-bold">Biết (40%)</th>
                  <th className="p-1.5 border-r border-slate-200 font-bold">Hiểu (30%)</th>
                  <th className="p-1.5 font-bold">VD (30%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {exam.matrixRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="p-2 font-bold border-r border-slate-200">{idx + 1}</td>
                    <td className="p-2 text-left border-r border-slate-200">
                      <div className="font-semibold text-slate-900">{row.topic}</div>
                      <div className="text-[11px] text-slate-500">{row.contentUnit}</div>
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partI_nb}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partI_th}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partI_vd}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partII_nb}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partII_th}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partII_vd}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partIII_nb}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partIII_th}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partIII_vd}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partIV_nb}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partIV_th}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{row.partIV_vd}</td>
                    <td className="p-2 border-r border-slate-200 font-bold text-blue-700">4,0 điểm</td>
                    <td className="p-2 border-r border-slate-200 font-bold text-blue-700">3,0 điểm</td>
                    <td className="p-2 font-bold text-blue-700">3,0 điểm</td>
                  </tr>
                ))}
                
                {/* Dòng tổng số điểm */}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td colSpan={2} className="p-2.5 text-center border-r border-slate-200">Tổng điểm từng dạng</td>
                  <td colSpan={3} className="p-2.5 border-r border-slate-200 text-blue-800">3,0 điểm (30%)</td>
                  <td colSpan={3} className="p-2.5 border-r border-slate-200 text-amber-800">2,0 điểm (20%)</td>
                  <td colSpan={3} className="p-2.5 border-r border-slate-200 text-indigo-800">2,0 điểm (20%)</td>
                  <td colSpan={3} className="p-2.5 border-r border-slate-200 text-emerald-800">3,0 điểm (30%)</td>
                  <td colSpan={3} className="p-2.5 text-emerald-700 text-sm">10,0 ĐIỂM (100%)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2 text-slate-700">
            <h3 className="font-bold text-slate-900">Ghi chú kỹ thuật theo Công văn 7991:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mỗi câu hỏi Phần II bao gồm 4 ý nhỏ, mỗi ý học sinh chọn đúng hoặc sai. Điểm được tính theo công thức lũy tiến chống đoán mò.</li>
              <li>Tỉ lệ nhận thức luôn tuân thủ nguyên tắc: <b>40% Nhận biết (4.0đ)</b>, <b>30% Thông hiểu (3.0đ)</b>, <b>30% Vận dụng (3.0đ)</b>.</li>
              <li>Tổng barem đề thi chuẩn mực đạt đúng <b>10.0 điểm</b>.</li>
            </ul>
          </div>
        </div>
      )}

      {/* VIEW 3: BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ (THEO CÔNG VĂN 7991) */}
      {activeSubTab === 'specs' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              2. BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ (CÔNG VĂN 7991/BGDĐT-GDTrH)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Phụ lục 2: Mô tả chi tiết yêu cầu cần đạt (YCCĐ) và định vị số câu hỏi
            </p>
          </div>

          <div className="space-y-4">
            {exam.matrixRows.map((row, idx) => (
              <div key={row.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {idx + 1}. {row.topic} - {row.contentUnit}
                  </h3>
                  <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                    Chuẩn YCCĐ GDPT 2018
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Yêu cầu cần đạt chi tiết:</h4>
                  <pre className="font-sans text-xs text-slate-700 bg-white p-3 rounded border border-slate-200 whitespace-pre-line leading-relaxed">
                    {row.learningOutcomes}
                  </pre>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block">Phần I (Nhiều lựa chọn):</span>
                    <span className="font-semibold text-slate-800">{row.partI_nb + row.partI_th + row.partI_vd} câu (3.0đ)</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block">Phần II (Đúng - Sai 4 ý):</span>
                    <span className="font-semibold text-slate-800">{row.partII_nb + row.partII_th + row.partII_vd} câu (2.0đ)</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block">Phần III (Trả lời ngắn):</span>
                    <span className="font-semibold text-slate-800">{row.partIII_nb + row.partIII_th + row.partIII_vd} câu (2.0đ)</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-500 block">Phần IV (Tự luận):</span>
                    <span className="font-semibold text-slate-800">{row.partIV_nb + row.partIV_th + row.partIV_vd} câu (3.0đ)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: HƯỚNG DẪN CHẤM & ĐÁP ÁN BAREM */}
      {activeSubTab === 'guide' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8 space-y-6 text-xs">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              HƯỚNG DẪN CHẤM VÀ THANG ĐIỂM CHI TIẾT
            </h2>
            <p className="text-slate-500 mt-1">
              Đáp án chính thức và phân chia thang điểm cho Hội đồng chấm thi
            </p>
          </div>

          {/* Đáp án Phần I */}
          <div className="space-y-2">
            <h3 className="font-bold text-blue-900 uppercase">Phần I: Trắc nghiệm nhiều lựa chọn (3,0 điểm)</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {exam.partI.map(q => (
                <div key={q.id} className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
                  <span className="text-slate-500 block text-[10px]">Câu {q.questionNumber}</span>
                  <span className="font-bold text-blue-700 text-sm">{q.correctAnswer}</span>
                  <span className="text-slate-400 block text-[9px]">0.25đ</span>
                </div>
              ))}
            </div>
          </div>

          {/* Đáp án Phần II */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="font-bold text-amber-900 uppercase">Phần II: Trắc nghiệm Đúng / Sai 4 ý (2,0 điểm)</h3>
            {exam.partII.map(q => (
              <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                <span className="font-semibold text-slate-800">Câu {q.questionNumber} (1.0 điểm):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                  {q.statements.map(st => (
                    <div key={st.subId} className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">Ý {st.subId}</span>
                      <span className={`font-bold ${st.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Đáp án Phần III */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <h3 className="font-bold text-indigo-900 uppercase">Phần III: Trắc nghiệm trả lời ngắn (2,0 điểm)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {exam.partIII.map(q => (
                <div key={q.id} className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
                  <span className="text-slate-500 block text-[10px]">Câu {q.questionNumber} (0.5đ)</span>
                  <span className="font-bold text-indigo-700 font-mono text-sm">{q.correctShortAnswer}</span>
                  {q.unit && <span className="text-slate-500 text-[10px] block">{q.unit}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Đáp án Phần IV */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="font-bold text-emerald-900 uppercase">Phần IV: Tự luận (3,0 điểm)</h3>
            {exam.partIV.map(q => (
              <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="font-bold text-slate-800">Câu {q.questionNumber} ({q.totalPoints} điểm)</div>
                <pre className="font-mono text-[11px] text-slate-700 whitespace-pre-wrap bg-white p-2.5 rounded border border-slate-200">
                  {q.modelAnswer}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
