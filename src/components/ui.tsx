import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Nút
// ---------------------------------------------------------------------------
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-500',
  secondary:
    'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400 disabled:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-400',
  danger: 'bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 disabled:text-slate-400 disabled:border-slate-200',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-500',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading, icon, children, className = '', disabled, type = 'button', ...rest },
  ref,
) {
  const sizes = { sm: 'text-xs px-2.5 py-1.5 gap-1.5', md: 'text-sm px-3.5 py-2 gap-2', lg: 'text-base px-5 py-2.5 gap-2' };
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition disabled:cursor-not-allowed ${BUTTON_STYLES[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

// ---------------------------------------------------------------------------
// Thông báo trong trang
// ---------------------------------------------------------------------------
type Tone = 'info' | 'warn' | 'error' | 'success';
const TONES: Record<Tone, { box: string; icon: React.ReactNode }> = {
  info: { box: 'bg-sky-50 border-sky-200 text-sky-900', icon: <Info className="h-5 w-5 text-sky-600" aria-hidden /> },
  warn: { box: 'bg-amber-50 border-amber-200 text-amber-900', icon: <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden /> },
  error: { box: 'bg-rose-50 border-rose-200 text-rose-900', icon: <XCircle className="h-5 w-5 text-rose-600" aria-hidden /> },
  success: { box: 'bg-emerald-50 border-emerald-200 text-emerald-900', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden /> },
};

export function Banner({
  tone = 'info',
  title,
  children,
  actions,
  className = '',
  role,
}: {
  tone?: Tone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  role?: string;
}) {
  const t = TONES[tone];
  return (
    <div
      role={role ?? (tone === 'error' ? 'alert' : 'status')}
      className={`flex gap-3 rounded-xl border p-3.5 text-sm ${t.box} ${className}`}
    >
      <div className="mt-0.5 shrink-0">{t.icon}</div>
      <div className="min-w-0 flex-1 space-y-1">
        {title && <div className="font-semibold">{title}</div>}
        {children && <div className="leading-relaxed">{children}</div>}
        {actions && <div className="flex flex-wrap gap-2 pt-1.5">{actions}</div>}
      </div>
    </div>
  );
}

export function Badge({
  tone = 'slate',
  children,
  title,
}: {
  tone?: 'slate' | 'blue' | 'amber' | 'indigo' | 'emerald' | 'rose' | 'violet';
  children: React.ReactNode;
  title?: string;
}) {
  const map = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    violet: 'bg-violet-50 text-violet-800 border-violet-200',
  } as const;
  return (
    <span title={title} className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className = '',
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-medium text-rose-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass = (invalid = false) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 ${
    invalid ? 'border-rose-400' : 'border-slate-300'
  }`;

// ---------------------------------------------------------------------------
// Hộp xác nhận (thay cho window.confirm)
// ---------------------------------------------------------------------------
interface ConfirmOptions {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}
type ConfirmFn = (o: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false));
export const useConfirm = () => useContext(ConfirmContext);

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
interface ToastItem {
  id: number;
  tone: 'success' | 'error' | 'info';
  text: string;
}
type ToastFn = (text: string, tone?: ToastItem['tone']) => void;
const ToastContext = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastContext);

export function UiProviders({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<ConfirmFn>((o) => new Promise((resolve) => setDialog({ ...o, resolve })), []);
  const toast = useCallback<ToastFn>((text, tone = 'success') => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 7000 : 3500);
  }, []);

  useEffect(() => {
    if (!dialog) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dialog.resolve(false);
        setDialog(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog]);

  const close = (v: boolean) => {
    dialog?.resolve(v);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      <ToastContext.Provider value={toast}>
        {children}
        {dialog && (
          <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="presentation">
            <div role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
              <h2 id="dlg-title" className="text-base font-bold text-slate-900">
                {dialog.title}
              </h2>
              <div className="mt-2 text-sm leading-relaxed text-slate-700">{dialog.message}</div>
              <div className="mt-5 flex justify-end gap-2">
                <Button ref={cancelRef} variant="secondary" onClick={() => close(false)}>
                  {dialog.cancelLabel ?? 'Hủy'}
                </Button>
                <Button variant={dialog.danger ? 'danger' : 'primary'} onClick={() => close(true)}>
                  {dialog.confirmLabel ?? 'Đồng ý'}
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="no-print pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2" aria-live="polite">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`toast-in pointer-events-auto flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white shadow-xl ${
                t.tone === 'error' ? 'bg-rose-700' : t.tone === 'info' ? 'bg-slate-800' : 'bg-emerald-700'
              }`}
            >
              {t.tone === 'error' ? <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </ConfirmContext.Provider>
  );
}
