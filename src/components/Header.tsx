import React, { useRef } from 'react';
import { FileUp, FilePlus2, Save, Download } from 'lucide-react';
import type { AppState } from '../../shared/schema.js';
import { parseDraftFile } from '../lib/storage.js';
import { saveBlob } from '../lib/download.js';
import type { Exam } from '../useExam.js';
import { Button, useConfirm, useToast } from './ui.js';

export function Header({ exam }: { exam: Exam }) {
  const confirm = useConfirm();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const { saveStatus } = exam;

  const newExam = async () => {
    const ok = await confirm({
      title: 'Bắt đầu bài kiểm tra mới?',
      message: 'Toàn bộ bản nháp hiện tại (thông tin, ma trận, câu hỏi) sẽ bị xóa khỏi trình duyệt này. Nếu cần, hãy bấm "Lưu bản nháp" trước.',
      confirmLabel: 'Xóa và bắt đầu mới',
      danger: true,
    });
    if (ok) {
      exam.resetAll();
      toast('Đã bắt đầu bài kiểm tra mới.', 'info');
    }
  };

  const saveFile = () => {
    const name = `ban-nhap-de-kiem-tra-${new Date().toISOString().slice(0, 10)}.json`;
    saveBlob(new Blob([JSON.stringify(exam.state, null, 2)], { type: 'application/json' }), name);
    toast(`Đã lưu bản nháp ra tệp ${name}`);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const res = parseDraftFile(text);
    if (!res.ok) {
      toast(res.message, 'error');
      return;
    }
    const ok = await confirm({
      title: 'Mở bản nháp từ tệp?',
      message: 'Bản nháp hiện tại trong trình duyệt sẽ được thay bằng nội dung của tệp.',
      confirmLabel: 'Mở bản nháp',
    });
    if (ok) {
      exam.importState(res.state as AppState);
      toast('Đã mở bản nháp từ tệp.');
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm" aria-hidden>
            <FileUp className="h-5 w-5 rotate-0" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight text-slate-900">Soạn đề kiểm tra định kì</h1>
            <p className="text-xs leading-snug text-slate-600 sm:text-[13px]">
              Công cụ hỗ trợ giáo viên soạn đề, tham khảo phụ lục Công văn 7991; giáo viên chịu trách nhiệm rà soát và duyệt.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500" aria-live="polite" data-testid="save-status">
            {saveStatus.ok
              ? saveStatus.at
                ? `Đã lưu tự động trong trình duyệt lúc ${saveStatus.at.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                : 'Bản nháp tự lưu trong trình duyệt này'
              : 'Không lưu được bản nháp (trình duyệt chặn lưu trữ) — hãy dùng "Lưu bản nháp"'}
          </span>
          <Button size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={saveFile}>
            Lưu bản nháp
          </Button>
          <Button size="sm" icon={<Save className="h-3.5 w-3.5" />} onClick={() => fileRef.current?.click()}>
            Mở bản nháp
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            data-testid="draft-file-input"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Button size="sm" variant="danger" icon={<FilePlus2 className="h-3.5 w-3.5" />} onClick={newExam}>
            Bài mới
          </Button>
        </div>
      </div>
    </header>
  );
}
