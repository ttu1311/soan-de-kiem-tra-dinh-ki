import React from 'react';
import { Check, Lock } from 'lucide-react';
import type { Exam } from '../useExam.js';

const STEPS = [
  { n: 1, title: 'Thông tin & nội dung' },
  { n: 2, title: 'Ma trận & đặc tả' },
  { n: 3, title: 'Câu hỏi & kiểm tra' },
  { n: 4, title: 'Xem trước & duyệt' },
  { n: 5, title: 'Tải về / In' },
];

export function Stepper({ exam }: { exam: Exam }) {
  const { state, step, approved } = exam;
  const reachable: Record<number, boolean> = {
    1: true,
    2: Boolean(state.matrix),
    3: Boolean(state.confirmedMatrix),
    4: Boolean(state.questions),
    5: approved,
  };
  const done: Record<number, boolean> = {
    1: Boolean(state.matrix),
    2: Boolean(state.confirmedMatrix),
    3: Boolean(state.questions),
    4: approved,
    5: false,
  };

  return (
    <nav aria-label="Các bước" className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <ol className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
        {STEPS.map((s) => {
          const current = step === s.n;
          const ok = reachable[s.n]!;
          return (
            <li key={s.n} className="min-w-fit flex-1">
              <button
                type="button"
                disabled={!ok}
                aria-current={current ? 'step' : undefined}
                data-testid={`step-${s.n}`}
                onClick={() => exam.setStep(s.n)}
                title={ok ? s.title : 'Hoàn thành bước trước để mở bước này'}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                  current ? 'bg-blue-600 text-white shadow-sm' : ok ? 'text-slate-800 hover:bg-slate-100' : 'cursor-not-allowed text-slate-400'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    current ? 'bg-white text-blue-700' : done[s.n] ? 'bg-emerald-100 text-emerald-700' : ok ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {done[s.n] && !current ? <Check className="h-3.5 w-3.5" /> : ok ? s.n : <Lock className="h-3 w-3" />}
                </span>
                <span className={`font-semibold ${current ? '' : 'hidden lg:inline'}`}>{s.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
