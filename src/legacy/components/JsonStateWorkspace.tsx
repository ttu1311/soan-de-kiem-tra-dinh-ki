import React, { useState } from 'react';
import { HarnessEdState } from '../types/edtech';
import { Copy, Download, Upload, Check, AlertCircle, FileCode } from 'lucide-react';

interface JsonStateWorkspaceProps {
  state: HarnessEdState;
  onImportState: (newState: HarnessEdState) => void;
  onCopyJson: () => void;
  onDownloadJson: () => void;
}

export const JsonStateWorkspace: React.FC<JsonStateWorkspaceProps> = ({
  state,
  onImportState,
  onCopyJson,
  onDownloadJson,
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [showImportBox, setShowImportBox] = useState(false);

  const jsonString = JSON.stringify(state, null, 2);

  const handleCopy = () => {
    onCopyJson();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyImport = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importText);
      if (!parsed.khbd || !parsed.exam || !parsed.slides) {
        throw new Error('Dữ liệu JSON không đúng cấu trúc HarnessEdState (thiếu khbd, exam hoặc slides).');
      }
      onImportState(parsed);
      setShowImportBox(false);
      setImportText('');
    } catch (err: any) {
      setImportError(err.message || 'Lỗi cú pháp JSON không hợp lệ.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase flex items-center gap-2">
              <FileCode className="w-5 h-5 text-blue-600" />
              Khối JSON State Bàn Giao Phiên Làm Việc
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Toàn vẹn trạng thái sư phạm: Kế hoạch bài dạy (CV 5512), Slide tương tác & Đề thi ma trận 4 phần (CV 7991).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportBox(!showImportBox)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{showImportBox ? 'Đóng Nhập' : 'Nạp JSON Khác'}</span>
            </button>
            <button
              onClick={onDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải .json</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã Sao Chép!' : 'Sao Chép JSON'}</span>
            </button>
          </div>
        </div>

        {/* Khung nhập JSON state */}
        {showImportBox && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <label className="block text-xs font-semibold text-slate-800">
              Dán nội dung JSON State để khôi phục phiên làm việc:
            </label>
            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Dán mã JSON tại đây..."
              className="w-full text-xs font-mono p-3 bg-white border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
            />
            {importError && (
              <div className="text-xs text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportBox(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyImport}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
              >
                Áp Dụng Khôi Phục
              </button>
            </div>
          </div>
        )}

        {/* Thông tin Meta tóm tắt */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500 block text-[10px]">Chuẩn KHBD:</span>
            <span className="font-semibold text-slate-800">{state.meta.khbdLegalRef}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Chuẩn Đề Thi:</span>
            <span className="font-semibold text-slate-800">{state.meta.examLegalRef}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Barem Mục Tiêu:</span>
            <span className="font-semibold text-emerald-700 font-mono">{state.meta.totalPointsTarget} điểm</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Tỉ Lệ Ma Trận:</span>
            <span className="font-semibold text-blue-700">40% - 30% - 30%</span>
          </div>
        </div>

        {/* Terminal / Code Viewer */}
        <div className="relative">
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[600px] leading-relaxed selection:bg-blue-600 selection:text-white border border-slate-800">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};
