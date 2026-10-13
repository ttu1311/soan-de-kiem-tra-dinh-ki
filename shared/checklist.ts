/**
 * Danh sách kiểm tra hiển thị cho giáo viên (✓/✗), tổng hợp từ các lỗi do mã phát hiện.
 */
import { fmtPoints } from './blueprint.js';
import type { ExamInput, Issue } from './schema.js';

export interface CheckItem {
  id: string;
  label: string;
  ok: boolean;
  /** Số lỗi liên quan khi không đạt */
  failures: number;
}

const GROUPS: { id: string; label: (i: ExamInput) => string; codes: string[] }[] = [
  {
    id: 'total',
    label: (i) => `Tổng điểm của đề bằng thang điểm ${fmtPoints(i.structure.totalScore)}`,
    codes: ['TOTAL_POINTS', 'TYPE_POINTS'],
  },
  {
    id: 'count',
    label: () => 'Số câu của đề khớp với ma trận đã xác nhận',
    codes: ['COUNT_MISMATCH', 'Q_MISSING', 'Q_EXTRA', 'Q_DUP_ID', 'Q_SLOT_MISMATCH'],
  },
  {
    id: 'matrix_points',
    label: () => 'Điểm của từng câu và từng mức độ khớp với ma trận',
    codes: ['LEVEL_POINTS', 'Q_POINTS_MATRIX', 'Q_POINTS'],
  },
  {
    id: 'tf',
    label: () => 'Mỗi câu Đúng – Sai có đúng bốn ý a, b, c, d',
    codes: ['Q_TF_COUNT', 'Q_TF_LABELS', 'Q_TF_EMPTY'],
  },
  {
    id: 'answers',
    label: () => 'Mọi câu đều có đáp án (A–D, Đúng/Sai từng ý, đáp số, ý chấm)',
    codes: ['Q_NO_ANSWER', 'Q_NO_RUBRIC', 'Q_MCQ_OPTIONS', 'Q_MCQ_DUP_OPTIONS'],
  },
  {
    id: 'rubric',
    label: () => 'Các ý chấm tự luận cộng đúng bằng điểm của câu',
    codes: ['Q_RUBRIC_SUM', 'Q_RUBRIC_ITEM'],
  },
  {
    id: 'content',
    label: () => 'Mỗi câu có nội dung, chủ đề và yêu cầu cần đạt',
    codes: ['Q_STEM_EMPTY', 'Q_TOPIC', 'Q_OUTCOME'],
  },
];

export function buildChecklist(input: ExamInput, issues: Issue[]): CheckItem[] {
  return GROUPS.map((g) => {
    const failures = issues.filter((i) => i.severity === 'error' && g.codes.includes(i.code)).length;
    return { id: g.id, label: g.label(input), ok: failures === 0, failures };
  });
}
