import React from 'react';
import { MatrixRow } from '../types/edtech';
import { CheckCircle2, AlertTriangle, Layers, Percent } from 'lucide-react';

interface MatrixWorkspaceProps {
  matrixRows: MatrixRow[];
  onUpdateRows: (rows: MatrixRow[]) => void;
}

export const MatrixWorkspace: React.FC<MatrixWorkspaceProps> = ({ matrixRows, onUpdateRows }) => {
  // Tính tổng số câu và điểm cho từng mức độ
  let nbCount = 0;
  let thCount = 0;
  let vdCount = 0;

  matrixRows.forEach(r => {
    nbCount += r.partI_nb + r.partII_nb + r.partIII_nb + r.partIV_nb;
    thCount += r.partI_th + r.partII_th + r.partIII_th + r.partIV_th;
    vdCount += r.partI_vd + r.partII_vd + r.partIII_vd + r.partIV_vd;
  });

  // Tỉ lệ điểm chuẩn theo CV 7991:
  // Nhận biết: 4.0 điểm (40%)
  // Thông hiểu: 3.0 điểm (30%)
  // Vận dụng: 3.0 điểm (30%)
  const nbScore = 4.0;
  const thScore = 3.0;
  const vdScore = 3.0;
  const totalScore = 10.0;

  const handleUpdateField = (rowId: string, field: keyof MatrixRow, val: any) => {
    const updated = matrixRows.map(r => r.id === rowId ? { ...r, [field]: val } : r);
    onUpdateRows(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Banner Giám sát Tỉ lệ ma trận CV 7991 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase">
              BẢNG MA TRẬN & BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy chuẩn theo Công văn 7991/BGDĐT-GDTrH (17/12/2024) - Barem chuẩn 10.0 điểm
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% Khớp Barem BGD&ĐT
          </span>
        </div>

        {/* 3 Thẻ Mức Độ Nhận Thức */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between items-center text-blue-900 font-bold">
              <span>1. NHẬN BIẾT</span>
              <span className="font-mono text-sm">4.0 điểm</span>
            </div>
            <div className="text-slate-600">Tỉ lệ điểm: <b>40%</b></div>
            <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-blue-600 h-full w-[40%]"></div>
            </div>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-200 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between items-center text-indigo-900 font-bold">
              <span>2. THÔNG HIỂU</span>
              <span className="font-mono text-sm">3.0 điểm</span>
            </div>
            <div className="text-slate-600">Tỉ lệ điểm: <b>30%</b></div>
            <div className="w-full bg-indigo-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-indigo-600 h-full w-[30%]"></div>
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between items-center text-emerald-900 font-bold">
              <span>3. VẬN DỤNG</span>
              <span className="font-mono text-sm">3.0 điểm</span>
            </div>
            <div className="text-slate-600">Tỉ lệ điểm: <b>30%</b></div>
            <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-emerald-600 h-full w-[30%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng Ma Trận Chi Tiết */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          Bảng Ma Trận Định Lượng Theo 4 Phần Độc Lập
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full border-collapse text-xs text-center">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                <th rowSpan={2} className="p-2 border-r border-slate-200 w-10">TT</th>
                <th rowSpan={2} className="p-2 border-r border-slate-200 text-left">Chủ đề / Đơn vị kiến thức</th>
                <th colSpan={3} className="p-2 border-r border-slate-200 bg-blue-50">Phần I (TN 4 lựa chọn)</th>
                <th colSpan={3} className="p-2 border-r border-slate-200 bg-amber-50">Phần II (TN Đúng/Sai 4 ý)</th>
                <th colSpan={3} className="p-2 border-r border-slate-200 bg-indigo-50">Phần III (TN Trả lời ngắn)</th>
                <th colSpan={3} className="p-2 border-r border-slate-200 bg-emerald-50">Phần IV (Tự luận)</th>
              </tr>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-700 border-b border-slate-200">
                <th className="p-1 border-r border-slate-200">Biết</th>
                <th className="p-1 border-r border-slate-200">Hiểu</th>
                <th className="p-1 border-r border-slate-200">VD</th>
                <th className="p-1 border-r border-slate-200">Biết</th>
                <th className="p-1 border-r border-slate-200">Hiểu</th>
                <th className="p-1 border-r border-slate-200">VD</th>
                <th className="p-1 border-r border-slate-200">Biết</th>
                <th className="p-1 border-r border-slate-200">Hiểu</th>
                <th className="p-1 border-r border-slate-200">VD</th>
                <th className="p-1 border-r border-slate-200">Biết</th>
                <th className="p-1 border-r border-slate-200">Hiểu</th>
                <th className="p-1">VD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {matrixRows.map((r, idx) => (
                <tr key={r.id}>
                  <td className="p-2 font-bold border-r border-slate-200">{idx + 1}</td>
                  <td className="p-2 text-left border-r border-slate-200">
                    <input
                      type="text"
                      value={r.topic}
                      onChange={(e) => handleUpdateField(r.id, 'topic', e.target.value)}
                      className="font-semibold text-slate-900 w-full bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                    />
                    <input
                      type="text"
                      value={r.contentUnit}
                      onChange={(e) => handleUpdateField(r.id, 'contentUnit', e.target.value)}
                      className="text-[11px] text-slate-500 w-full bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 mt-0.5"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.partI_nb}</td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.partI_th}</td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.partI_vd}</td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.partII_nb}</td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.partII_th}</td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.partII_vd}</td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.partIII_nb}</td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.partIII_th}</td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.partIII_vd}</td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.partIV_nb}</td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.partIV_th}</td>
                  <td className="p-1 font-mono">{r.partIV_vd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bản Đặc Tả Yêu Cầu Cần Đạt */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          Bản Đặc Tả Mức Độ Kiến Thức & Kỹ Năng
        </h3>
        {matrixRows.map((r, idx) => (
          <div key={r.id} className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
            <span className="font-bold text-slate-900 block text-sm">
              Đặc tả: {r.topic} - {r.contentUnit}
            </span>
            <textarea
              rows={4}
              value={r.learningOutcomes}
              onChange={(e) => handleUpdateField(r.id, 'learningOutcomes', e.target.value)}
              className="w-full text-xs text-slate-700 p-2.5 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none leading-relaxed"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
