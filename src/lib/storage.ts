/**
 * Lưu bản nháp trong localStorage của trình duyệt này (không gửi đi đâu, không có thông tin học sinh).
 * Mọi thao tác đều bọc try/catch: ở chế độ riêng tư hoặc khi bị chặn, ứng dụng vẫn chạy bình thường.
 */
import { appStateSchema, type AppState } from '../../shared/schema.js';
import { emptyState } from '../../shared/blueprint.js';

const KEY = 'soan-de-kiem-tra.v1';
const STEP_KEY = 'soan-de-kiem-tra.step.v1';

export interface LoadResult {
  state: AppState;
  step: number;
  /** Thông báo cho giáo viên khi bản nháp cũ không đọc được */
  notice?: string;
  restored: boolean;
}

export function loadDraft(): LoadResult {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { state: emptyState(), step: 1, restored: false };
    const parsed = appStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return {
        state: emptyState(),
        step: 1,
        restored: false,
        notice: 'Không đọc được bản nháp đã lưu trước đó (có thể do phiên bản cũ). Đã bắt đầu một bài kiểm tra mới.',
      };
    }
    const step = Number(localStorage.getItem(STEP_KEY));
    return { state: parsed.data, step: Number.isInteger(step) && step >= 1 && step <= 5 ? step : 1, restored: true };
  } catch {
    return { state: emptyState(), step: 1, restored: false };
  }
}

/** Trả về false nếu không lưu được (ví dụ hết dung lượng hoặc bị chặn). */
export function saveDraft(state: AppState, step: number): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    localStorage.setItem(STEP_KEY, String(step));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(STEP_KEY);
  } catch {
    /* bỏ qua */
  }
}

export function parseDraftFile(text: string): { ok: true; state: AppState } | { ok: false; message: string } {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, message: 'Tệp không phải bản nháp hợp lệ (không đọc được JSON).' };
  }
  const parsed = appStateSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, message: 'Tệp không đúng định dạng bản nháp của ứng dụng này (hoặc thuộc phiên bản khác).' };
  }
  return { ok: true, state: parsed.data };
}
