/**
 * Trạng thái và hành động của toàn bộ luồng soạn đề. Mọi bước giao diện đọc/ghi qua hook này.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildSlots,
  emptyState,
  examFingerprint,
  inputFingerprint,
  newId,
} from '../shared/blueprint.js';
import { buildChecklist } from '../shared/checklist.js';
import { emptyQuestion } from '../shared/questions.js';
import type { AppState, ExamInput, Issue, Matrix, Question } from '../shared/schema.js';
import { hasErrors, validateExam, validateInput, validateMatrix } from '../shared/validate.js';
import { ApiFail, generateMatrix, generateQuestions, regenerateQuestion, reviewWithAi } from './lib/api.js';
import { clearDraft, loadDraft, saveDraft } from './lib/storage.js';

export type Busy = null | 'matrix' | 'questions' | 'review';

export interface ActionError {
  where: 'matrix' | 'questions' | 'review' | 'question';
  questionId?: string;
  message: string;
  issues?: string[];
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

export function useExam() {
  const initial = useMemo(() => loadDraft(), []);
  const [state, setStateRaw] = useState<AppState>(initial.state);
  const [step, setStepRaw] = useState<number>(initial.step);
  const [busy, setBusy] = useState<Busy>(null);
  const [regenerating, setRegenerating] = useState<Set<string>>(new Set());
  const [error, setError] = useState<ActionError | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; at: Date | null }>({ ok: true, at: null });
  const [loadNotice] = useState(initial.notice);
  // Chỉ báo "đã khôi phục" khi bản nháp cũ thực sự có nội dung
  const [restored] = useState(
    initial.restored && (initial.state.input.info.title.trim() !== '' || initial.state.input.sourceText.trim() !== ''),
  );
  // Tăng mỗi khi xoá/mở khoá/đổi ma trận để bỏ qua kết quả AI đến muộn
  const epoch = useRef(0);

  const update = useCallback((fn: (s: AppState) => AppState) => {
    setStateRaw((prev) => ({ ...fn(prev), updatedAt: new Date().toISOString() }));
  }, []);
  const setStep = useCallback((n: number) => {
    setStepRaw(n);
    window.scrollTo({ top: 0 });
  }, []);

  // Tự lưu (có trễ nhẹ) và lưu ngay khi rời trang
  const latest = useRef({ state, step });
  latest.current = { state, step };
  useEffect(() => {
    const t = setTimeout(() => {
      const ok = saveDraft(state, step);
      setSaveStatus({ ok, at: new Date() });
    }, 350);
    return () => clearTimeout(t);
  }, [state, step]);
  useEffect(() => {
    const flush = () => saveDraft(latest.current.state, latest.current.step);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flush);
    };
  }, []);

  // ---------------------------------------------------------------- dữ liệu suy ra
  const { input, matrix, confirmedMatrix, questions } = state;
  const inputIssues = useMemo(() => validateInput(input), [input]);
  const matrixIssues = useMemo(() => (matrix ? validateMatrix(input.structure, matrix) : []), [input.structure, matrix]);
  const slots = useMemo(() => {
    const m = confirmedMatrix ?? matrix;
    return m ? buildSlots(input.structure, m) : [];
  }, [input.structure, confirmedMatrix, matrix]);
  const examIssues: Issue[] = useMemo(
    () => (confirmedMatrix && questions ? validateExam(input, confirmedMatrix, questions) : []),
    [input, confirmedMatrix, questions],
  );
  const checklist = useMemo(() => buildChecklist(input, examIssues), [input, examIssues]);
  const fingerprint = useMemo(() => examFingerprint(input, confirmedMatrix, questions), [input, confirmedMatrix, questions]);
  const examOk = Boolean(confirmedMatrix && questions) && !hasErrors(examIssues);
  const approved = Boolean(state.approval) && state.approval!.fingerprint === fingerprint && examOk;
  const approvalStale = Boolean(state.approval) && !approved;
  const inputChangedSinceMatrix = Boolean(matrix) && state.matrixInputFp !== null && state.matrixInputFp !== inputFingerprint(input);

  // ---------------------------------------------------------------- hành động
  const setInput = useCallback((fn: (i: ExamInput) => ExamInput) => update((s) => ({ ...s, input: fn(s.input) })), [update]);

  const failToError = (where: ActionError['where'], e: unknown, questionId?: string): ActionError => {
    if (e instanceof ApiFail) return { where, questionId, message: e.message, issues: e.issues };
    return { where, questionId, message: 'Có lỗi không mong muốn. Hãy thử lại.' };
  };

  const runGenerateMatrix = useCallback(async (): Promise<boolean> => {
    setError(null);
    const myEpoch = ++epoch.current;
    setBusy('matrix');
    try {
      const snapshot = state.input;
      const res = await generateMatrix(snapshot);
      if (myEpoch !== epoch.current) return false;
      update((s) => ({
        ...s,
        matrix: res.matrix,
        matrixNotes: res.notes,
        matrixMissing: res.missingContent,
        matrixInputFp: inputFingerprint(snapshot),
        confirmedMatrix: null,
        questions: null,
        aiWarnings: [],
        approval: null,
      }));
      return true;
    } catch (e) {
      setError(failToError('matrix', e));
      return false;
    } finally {
      setBusy((b) => (b === 'matrix' ? null : b));
    }
  }, [state.input, update]);

  const confirmMatrix = useCallback(() => {
    update((s) => {
      if (!s.matrix) return s;
      if (hasErrors(validateMatrix(s.input.structure, s.matrix))) return s;
      return { ...s, confirmedMatrix: clone(s.matrix), questions: null, aiWarnings: [], approval: null };
    });
  }, [update]);

  const unlockMatrix = useCallback(() => {
    epoch.current++;
    update((s) => ({ ...s, confirmedMatrix: null, questions: null, aiWarnings: [], approval: null }));
  }, [update]);

  const setMatrix = useCallback((fn: (m: Matrix) => Matrix) => {
    update((s) => (s.matrix && !s.confirmedMatrix ? { ...s, matrix: fn(s.matrix) } : s));
  }, [update]);

  const runGenerateQuestions = useCallback(async (): Promise<boolean> => {
    if (!state.confirmedMatrix) return false;
    setError(null);
    const myEpoch = ++epoch.current;
    setBusy('questions');
    try {
      const res = await generateQuestions(state.input, state.confirmedMatrix);
      if (myEpoch !== epoch.current) return false;
      update((s) => ({ ...s, questions: res.questions, aiWarnings: [], approval: null }));
      return true;
    } catch (e) {
      setError(failToError('questions', e));
      return false;
    } finally {
      setBusy((b) => (b === 'questions' ? null : b));
    }
  }, [state.confirmedMatrix, state.input, update]);

  const updateQuestion = useCallback(
    (id: string, fn: (q: Question) => Question) => {
      update((s) => ({
        ...s,
        questions: s.questions ? s.questions.map((q) => (q.id === id ? { ...fn(q), origin: 'edited' as const } : q)) : s.questions,
        aiWarnings: s.aiWarnings.filter((w) => w.questionId !== id),
      }));
    },
    [update],
  );

  const runRegenerateQuestion = useCallback(
    async (id: string, hint: string): Promise<boolean> => {
      const { confirmedMatrix: cm, questions: qs, input: inp } = state;
      if (!cm || !qs) return false;
      const current = qs.find((q) => q.id === id);
      setError(null);
      const myEpoch = epoch.current;
      setRegenerating((s) => new Set(s).add(id));
      try {
        const others = qs.filter((q) => q.id !== id).map((q) => q.stem);
        const res = await regenerateQuestion(inp, cm, id, others, hint, current?.stem ?? '');
        if (myEpoch !== epoch.current) return false;
        update((s) => ({
          ...s,
          questions: s.questions ? s.questions.map((q) => (q.id === id ? res.question : q)) : s.questions,
          aiWarnings: s.aiWarnings.filter((w) => w.questionId !== id),
        }));
        return true;
      } catch (e) {
        setError(failToError('question', e, id));
        return false;
      } finally {
        setRegenerating((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
      }
    },
    [state, update],
  );

  const runReview = useCallback(async (): Promise<number | null> => {
    const { confirmedMatrix: cm, questions: qs, input: inp } = state;
    if (!cm || !qs) return null;
    setError(null);
    setBusy('review');
    try {
      const res = await reviewWithAi(inp, cm, qs);
      update((s) => ({ ...s, aiWarnings: res.warnings }));
      return res.warnings.length;
    } catch (e) {
      setError(failToError('review', e));
      return null;
    } finally {
      setBusy((b) => (b === 'review' ? null : b));
    }
  }, [state, update]);

  const approve = useCallback(() => {
    update((s) => {
      if (!s.confirmedMatrix || !s.questions) return s;
      if (hasErrors(validateExam(s.input, s.confirmedMatrix, s.questions))) return s;
      return { ...s, approval: { at: new Date().toISOString(), fingerprint: examFingerprint(s.input, s.confirmedMatrix, s.questions) } };
    });
  }, [update]);

  const revokeApproval = useCallback(() => update((s) => ({ ...s, approval: null })), [update]);

  const resetAll = useCallback(() => {
    epoch.current++;
    clearDraft();
    setStateRaw(emptyState());
    setStepRaw(1);
    setError(null);
    setBusy(null);
  }, []);

  const importState = useCallback((s: AppState) => {
    epoch.current++;
    setStateRaw({ ...s, updatedAt: new Date().toISOString() });
    setStepRaw(1);
    setError(null);
  }, []);

  /** Thêm câu trống (dùng khi cần tự soạn tay một câu AI không tạo được). */
  const blankQuestion = useCallback(
    (id: string) => {
      const slot = slots.find((s) => s.id === id);
      if (!slot) return;
      update((s) => ({ ...s, questions: s.questions ? s.questions.map((q) => (q.id === id ? { ...emptyQuestion(slot), origin: 'edited' as const } : q)) : s.questions }));
    },
    [slots, update],
  );

  return {
    state,
    step,
    setStep,
    busy,
    regenerating,
    error,
    setError,
    saveStatus,
    loadNotice,
    restored,
    // dữ liệu suy ra
    inputIssues,
    matrixIssues,
    slots,
    examIssues,
    checklist,
    examOk,
    approved,
    approvalStale,
    inputChangedSinceMatrix,
    // hành động
    update,
    setInput,
    setMatrix,
    runGenerateMatrix,
    confirmMatrix,
    unlockMatrix,
    runGenerateQuestions,
    updateQuestion,
    runRegenerateQuestion,
    runReview,
    approve,
    revokeApproval,
    resetAll,
    importState,
    blankQuestion,
    newId,
  };
}

export type Exam = ReturnType<typeof useExam>;
