import React, { useEffect, useRef, useState } from 'react';

/**
 * Ô nhập số có thể gõ dấu thập phân (chấp nhận cả "," lẫn "."), chỉ báo giá trị hợp lệ lên trên.
 */
export function NumInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  className = '',
  ariaLabel,
  id,
  invalid,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  id?: string;
  invalid?: boolean;
}) {
  const fmt = (n: number) => (Number.isFinite(n) ? String(n).replace('.', ',') : '');
  const [text, setText] = useState(fmt(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(fmt(value));
  }, [value]);

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      aria-label={ariaLabel}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      value={text}
      data-step={step}
      className={`rounded-lg border bg-white px-2 py-1.5 text-center text-sm tabular-nums shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 ${
        invalid ? 'border-rose-400' : 'border-slate-300'
      } ${className}`}
      onFocus={(e) => {
        focused.current = true;
        e.currentTarget.select();
      }}
      onBlur={() => {
        focused.current = false;
        setText(fmt(value));
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          const dir = e.key === 'ArrowUp' ? 1 : -1;
          let n = Math.round((value + dir * step) * 100) / 100;
          if (min !== undefined) n = Math.max(min, n);
          if (max !== undefined) n = Math.min(max, n);
          onChange(n);
          setText(fmt(n));
        }
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const n = Number(raw.replace(',', '.').trim());
        if (raw.trim() === '' || !Number.isFinite(n)) return;
        let v = n;
        if (min !== undefined) v = Math.max(min, v);
        if (max !== undefined) v = Math.min(max, v);
        onChange(v);
      }}
    />
  );
}
