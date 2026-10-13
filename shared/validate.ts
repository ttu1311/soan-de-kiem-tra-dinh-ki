/**
 * Kiểm tra BẰNG MÃ (không dùng AI): dữ liệu đầu vào, ma trận, và đề hoàn chỉnh.
 * Mọi thông báo bằng tiếng Việt, gắn với từng câu khi có thể.
 */
import {
  LEVELS,
  LEVEL_LABEL,
  LIMITS,
  OPTION_KEYS,
  QTYPES,
  QTYPE_SHORT_LABEL,
  TF_LABELS,
  type ExamInput,
  type Issue,
  type Matrix,
  type QType,
  type Question,
  type Slot,
  type Structure,
} from './schema.js';
import {
  approxEqual,
  buildSlots,
  clean,
  computeTotals,
  fmtPoints,
  similarity,
  sumPoints,
  toCents,
} from './blueprint.js';

const err = (code: string, message: string, extra: Partial<Issue> = {}): Issue => ({
  code,
  severity: 'error',
  message,
  ...extra,
});
const warn = (code: string, message: string, extra: Partial<Issue> = {}): Issue => ({
  code,
  severity: 'warning',
  message,
  ...extra,
});

export const hasErrors = (issues: Issue[]): boolean => issues.some((i) => i.severity === 'error');

// ---------------------------------------------------------------------------
// 1. Dữ liệu đầu vào (bước 1)
// ---------------------------------------------------------------------------
export function validateStructure(structure: Structure): Issue[] {
  const issues: Issue[] = [];
  if (!(structure.totalScore > 0)) {
    issues.push(err('STRUCT_TOTAL', 'Thang điểm phải lớn hơn 0.', { field: 'structure.totalScore' }));
  }
  for (const t of QTYPES) {
    const p = structure.points[t];
    if (!Number.isFinite(p) || p < 0) {
      issues.push(
        err('STRUCT_POINTS', `Điểm của dạng "${QTYPE_SHORT_LABEL[t]}" không hợp lệ.`, {
          field: `structure.points.${t}`,
        }),
      );
    }
    const c = structure.counts[t];
    if (!Number.isInteger(c) || c < 0 || c > 60) {
      issues.push(
        err('STRUCT_COUNT', `Số câu của dạng "${QTYPE_SHORT_LABEL[t]}" phải là số nguyên từ 0 đến 60.`, {
          field: `structure.counts.${t}`,
        }),
      );
    } else if (structure.points[t] > 0 && c === 0) {
      issues.push(
        err('STRUCT_COUNT_ZERO', `Dạng "${QTYPE_SHORT_LABEL[t]}" có điểm nhưng số câu bằng 0.`, {
          field: `structure.counts.${t}`,
        }),
      );
    } else if (structure.points[t] === 0 && c > 0) {
      issues.push(
        err('STRUCT_POINTS_ZERO', `Dạng "${QTYPE_SHORT_LABEL[t]}" có số câu nhưng điểm bằng 0.`, {
          field: `structure.points.${t}`,
        }),
      );
    }
  }
  const sum = sumPoints(QTYPES.map((t) => structure.points[t] || 0));
  if (structure.totalScore > 0 && !approxEqual(sum, structure.totalScore)) {
    issues.push(
      err(
        'STRUCT_SUM',
        `Tổng điểm các dạng câu là ${fmtPoints(sum)}, khác thang điểm ${fmtPoints(structure.totalScore)}.`,
        { field: 'structure.points' },
      ),
    );
  }
  const targetSum = LEVELS.reduce((a, l) => a + (structure.levelTarget[l] || 0), 0);
  if (Math.abs(targetSum - 100) > 0.01) {
    issues.push(
      err('STRUCT_LEVEL_TARGET', `Tỉ lệ Biết/Hiểu/Vận dụng cộng lại là ${targetSum}%, cần bằng 100%.`, {
        field: 'structure.levelTarget',
      }),
    );
  }
  return issues;
}

export function validateInput(input: ExamInput): Issue[] {
  const issues: Issue[] = [];
  const { info } = input;

  if (!clean(info.subject)) issues.push(err('INFO_SUBJECT', 'Chưa nhập môn học.', { field: 'info.subject' }));
  if (!['10', '11', '12'].includes(info.grade)) {
    issues.push(err('INFO_GRADE', 'Lớp phải là 10, 11 hoặc 12 (THPT).', { field: 'info.grade' }));
  }
  if (!clean(info.title)) {
    issues.push(err('INFO_TITLE', 'Chưa nhập tên bài kiểm tra.', { field: 'info.title' }));
  }
  if (
    !Number.isFinite(info.durationMinutes) ||
    info.durationMinutes < LIMITS.minDuration ||
    info.durationMinutes > LIMITS.maxDuration
  ) {
    issues.push(
      err(
        'INFO_DURATION',
        `Thời lượng phải từ ${LIMITS.minDuration} đến ${LIMITS.maxDuration} phút.`,
        { field: 'info.durationMinutes' },
      ),
    );
  }

  issues.push(...validateStructure(input.structure));

  const topics = input.topics.filter((t) => clean(t.name) || clean(t.requirements));
  if (topics.length === 0) {
    issues.push(err('TOPIC_NONE', 'Chưa nhập chủ đề nào đã dạy. Hãy thêm ít nhất một chủ đề.', { field: 'topics' }));
  }
  if (input.topics.length > LIMITS.maxTopics) {
    issues.push(err('TOPIC_TOO_MANY', `Tối đa ${LIMITS.maxTopics} chủ đề cho một bài kiểm tra.`, { field: 'topics' }));
  }
  const seen = new Set<string>();
  for (const t of topics) {
    const name = clean(t.name);
    if (!name) {
      issues.push(err('TOPIC_NAME', 'Có chủ đề chưa có tên.', { field: `topic.${t.id}.name` }));
      continue;
    }
    if (name.length > LIMITS.maxTopicChars) {
      issues.push(err('TOPIC_NAME_LONG', `Tên chủ đề "${name.slice(0, 30)}…" quá dài.`, { field: `topic.${t.id}.name` }));
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      issues.push(warn('TOPIC_DUP', `Chủ đề "${name}" bị nhập trùng.`, { field: `topic.${t.id}.name` }));
    }
    seen.add(key);
    const req = clean(t.requirements);
    if (req.length < LIMITS.minRequirementChars) {
      issues.push(
        err(
          'TOPIC_REQ',
          `Chủ đề "${name}" chưa có yêu cầu cần đạt (cần ít nhất ${LIMITS.minRequirementChars} ký tự). Ứng dụng không tự đoán chương trình.`,
          { field: `topic.${t.id}.requirements` },
        ),
      );
    } else if (req.length > LIMITS.maxRequirementChars) {
      issues.push(err('TOPIC_REQ_LONG', `Yêu cầu cần đạt của "${name}" quá dài.`, { field: `topic.${t.id}.requirements` }));
    }
  }

  const src = clean(input.sourceText);
  if (src.length < LIMITS.minSourceChars) {
    issues.push(
      err(
        'SOURCE_SHORT',
        `Nội dung nguồn mới có ${src.length} ký tự, cần ít nhất ${LIMITS.minSourceChars}. Hãy dán thêm nội dung bài học/tài liệu đã dạy — ứng dụng không tự đoán nội dung sách giáo khoa.`,
        { field: 'sourceText' },
      ),
    );
  } else if (src.length > LIMITS.maxSourceChars) {
    issues.push(
      err('SOURCE_LONG', `Nội dung nguồn dài quá ${LIMITS.maxSourceChars.toLocaleString('vi-VN')} ký tự. Hãy rút gọn.`, {
        field: 'sourceText',
      }),
    );
  } else if (src.length < LIMITS.softSourceChars) {
    issues.push(
      warn(
        'SOURCE_THIN',
        'Nội dung nguồn khá ngắn so với một đề kiểm tra; câu hỏi có thể lặp ý. Nên bổ sung thêm nếu có.',
        { field: 'sourceText' },
      ),
    );
  }
  return issues;
}

// ---------------------------------------------------------------------------
// 2. Ma trận (bước 2)
// ---------------------------------------------------------------------------
export function validateMatrix(structure: Structure, matrix: Matrix): Issue[] {
  const issues: Issue[] = [];
  if (matrix.rows.length === 0) {
    return [err('MATRIX_EMPTY', 'Ma trận chưa có hàng (chủ đề) nào.')];
  }
  if (matrix.rows.length > LIMITS.maxRows) {
    issues.push(err('MATRIX_TOO_MANY', `Ma trận tối đa ${LIMITS.maxRows} hàng.`));
  }

  for (const row of matrix.rows) {
    const label = clean(row.topic) || 'Hàng chưa đặt tên';
    if (!clean(row.topic)) issues.push(err('ROW_TOPIC', 'Có hàng chưa có tên chủ đề.', { rowId: row.id }));
    if (!clean(row.unit)) {
      issues.push(err('ROW_UNIT', `Hàng "${label}" chưa có nội dung/đơn vị kiến thức.`, { rowId: row.id }));
    }
    let rowTotal = 0;
    for (const t of QTYPES) {
      for (const l of LEVELS) {
        const n = row.counts[t][l];
        if (!Number.isInteger(n) || n < 0) {
          issues.push(
            err('CELL_INVALID', `Hàng "${label}": số câu ${QTYPE_SHORT_LABEL[t]} – ${LEVEL_LABEL[l]} phải là số nguyên không âm.`, {
              rowId: row.id,
            }),
          );
          continue;
        }
        rowTotal += n;
      }
    }
    if (rowTotal === 0) {
      issues.push(warn('ROW_EMPTY', `Hàng "${label}" chưa có câu hỏi nào — nên xoá hoặc thêm câu.`, { rowId: row.id }));
    }
    for (const l of LEVELS) {
      const hasQuestions = QTYPES.some((t) => row.counts[t][l] > 0);
      if (hasQuestions && !clean(row.outcomes[l])) {
        issues.push(
          err('OUTCOME_MISSING', `Hàng "${label}": có câu mức "${LEVEL_LABEL[l]}" nhưng chưa có yêu cầu cần đạt mức này.`, {
            rowId: row.id,
            field: `outcome.${l}`,
          }),
        );
      }
    }
  }

  const slots = buildSlots(structure, matrix);
  const totals = computeTotals(slots, matrix.rows, structure.totalScore);

  for (const t of QTYPES) {
    const pts = structure.points[t];
    if (pts > 0 && totals.typeCount[t] === 0) {
      issues.push(
        err('TYPE_NO_QUESTIONS', `Dạng "${QTYPE_SHORT_LABEL[t]}" có ${fmtPoints(pts)} điểm nhưng ma trận chưa có câu nào.`),
      );
    }
    if (pts === 0 && totals.typeCount[t] > 0) {
      issues.push(
        err('TYPE_NO_POINTS', `Dạng "${QTYPE_SHORT_LABEL[t]}" có ${totals.typeCount[t]} câu nhưng được 0 điểm.`),
      );
    }
    if (totals.typeCount[t] > 0 && pts > 0) {
      const each = slots.filter((s) => s.type === t).map((s) => s.points);
      if (t !== 'essay') {
        const first = each[0]!;
        if (toCents(first) % 5 !== 0) {
          issues.push(
            warn(
              'POINTS_UNEVEN',
              `Dạng "${QTYPE_SHORT_LABEL[t]}": ${fmtPoints(pts)} điểm chia cho ${totals.typeCount[t]} câu không tròn (${fmtPoints(first)} điểm/câu). Nên điều chỉnh số câu hoặc số điểm.`,
            ),
          );
        }
      }
    }
    const wanted = structure.counts[t];
    if (wanted !== totals.typeCount[t] && (wanted > 0 || totals.typeCount[t] > 0)) {
      issues.push(
        warn(
          'COUNT_DIFF',
          `Dạng "${QTYPE_SHORT_LABEL[t]}": ma trận có ${totals.typeCount[t]} câu, cấu trúc đề ở bước 1 dự kiến ${wanted} câu.`,
        ),
      );
    }
  }

  // điểm từng câu tự luận do giáo viên đặt
  const essaySlots = slots.filter((s) => s.type === 'essay');
  const overrides = matrix.pointOverrides ?? {};
  if (essaySlots.length > 0 && Object.keys(overrides).length > 0) {
    const sum = sumPoints(essaySlots.map((s) => s.points));
    if (!approxEqual(sum, structure.points.essay)) {
      issues.push(
        err('ESSAY_POINTS_SUM', `Điểm các câu tự luận cộng lại là ${fmtPoints(sum)}, khác tổng điểm tự luận ${fmtPoints(structure.points.essay)}.`),
      );
    }
    for (const s of essaySlots) {
      if (!(s.points > 0)) issues.push(err('ESSAY_POINTS_ZERO', `Câu ${s.code} phải có điểm lớn hơn 0.`, { questionId: s.id }));
    }
  }

  if (!approxEqual(totals.totalPoints, structure.totalScore)) {
    issues.push(
      err('MATRIX_TOTAL', `Tổng điểm theo ma trận là ${fmtPoints(totals.totalPoints)}, khác thang điểm ${fmtPoints(structure.totalScore)}.`),
    );
  }

  for (const l of LEVELS) {
    const target = structure.levelTarget[l];
    const actual = totals.levelPercent[l];
    if (Math.abs(actual - target) > 10) {
      issues.push(
        warn(
          'LEVEL_RATIO',
          `Tỉ lệ điểm mức "${LEVEL_LABEL[l]}" là ${Math.round(actual)}%, lệch mục tiêu ${target}% quá 10 điểm phần trăm.`,
        ),
      );
    }
  }
  return issues;
}

// ---------------------------------------------------------------------------
// 3. Đề hoàn chỉnh (bước 3–4)
// ---------------------------------------------------------------------------
const PLACEHOLDER_RE = /(lorem ipsum|\bTODO\b|\bTBD\b|\[\s*(điền|chèn|nội dung|đáp án)[^\]]*\]|x{4,})/i;
const LEAK_RE = /(đáp án|lời giải|hướng dẫn chấm)/i;

function questionLabel(q: { code: string; type: QType; number: number }): string {
  return `Câu ${q.number} (${q.code})`;
}

export function validateQuestion(q: Question, slot: Slot | undefined): Issue[] {
  const issues: Issue[] = [];
  const id = q.id;
  const lab = questionLabel(q);
  const add = (i: Issue) => issues.push({ ...i, questionId: id });

  if (!clean(q.stem)) add(err('Q_STEM_EMPTY', `${lab}: chưa có nội dung câu hỏi.`, { field: 'stem' }));
  if (!clean(q.topic)) add(err('Q_TOPIC', `${lab}: thiếu chủ đề.`));
  if (!clean(q.outcome)) add(err('Q_OUTCOME', `${lab}: thiếu yêu cầu cần đạt.`));
  if (!(q.points > 0)) add(err('Q_POINTS', `${lab}: điểm phải lớn hơn 0.`, { field: 'points' }));
  if (slot && !approxEqual(q.points, slot.points)) {
    add(
      err(
        'Q_POINTS_MATRIX',
        `${lab}: điểm ${fmtPoints(q.points)} khác điểm theo ma trận (${fmtPoints(slot.points)}).`,
        { field: 'points' },
      ),
    );
  }
  if (slot && (q.level !== slot.level || q.type !== slot.type || q.rowId !== slot.rowId)) {
    add(err('Q_SLOT_MISMATCH', `${lab}: dạng/mức độ/chủ đề không khớp ô tương ứng trong ma trận.`));
  }

  const textsToScan: string[] = [q.stem];

  switch (q.type) {
    case 'mcq': {
      const opts = q.options;
      const texts = opts ? OPTION_KEYS.map((k) => clean(opts[k])) : [];
      if (!opts || texts.some((t) => !t)) {
        add(err('Q_MCQ_OPTIONS', `${lab}: cần đủ 4 phương án A, B, C, D và không phương án nào để trống.`, { field: 'options' }));
      } else {
        textsToScan.push(...texts);
        if (new Set(texts.map((t) => t.toLowerCase())).size < 4) {
          add(err('Q_MCQ_DUP_OPTIONS', `${lab}: có hai phương án giống hệt nhau.`, { field: 'options' }));
        }
      }
      if (!q.correct || !OPTION_KEYS.includes(q.correct)) {
        add(err('Q_NO_ANSWER', `${lab}: thiếu đáp án đúng (A/B/C/D).`, { field: 'correct' }));
      }
      break;
    }
    case 'tf': {
      const st = q.statements ?? [];
      if (st.length !== 4) {
        add(
          err('Q_TF_COUNT', `${lab}: câu Đúng/Sai phải có đúng 4 ý a, b, c, d (hiện có ${st.length} ý).`, {
            field: 'statements',
          }),
        );
      } else if (!st.every((s, i) => s.label === TF_LABELS[i])) {
        add(err('Q_TF_LABELS', `${lab}: các ý phải được gắn nhãn lần lượt a, b, c, d.`, { field: 'statements' }));
      }
      st.forEach((s) => {
        textsToScan.push(s.text);
        if (!clean(s.text)) add(err('Q_TF_EMPTY', `${lab}: ý ${s.label}) để trống.`, { field: 'statements' }));
      });
      const missing = st.filter((s) => typeof s.isTrue !== 'boolean');
      if (st.length > 0 && missing.length > 0) {
        add(
          err('Q_NO_ANSWER', `${lab}: thiếu đáp án Đúng/Sai cho ý ${missing.map((m) => m.label + ')').join(', ')}.`, {
            field: 'statements',
          }),
        );
      } else if (st.length === 4 && st.every((s) => s.isTrue === st[0]!.isTrue)) {
        add(warn('Q_TF_ALL_SAME', `${lab}: cả 4 ý cùng ${st[0]!.isTrue ? 'Đúng' : 'Sai'} — nên kiểm tra lại.`));
      }
      break;
    }
    case 'short': {
      const a = clean(q.answer);
      if (!a) add(err('Q_NO_ANSWER', `${lab}: thiếu đáp án trả lời ngắn.`, { field: 'answer' }));
      else if (a.length > 40) {
        add(warn('Q_SHORT_LONG', `${lab}: đáp án dài ${a.length} ký tự — câu trả lời ngắn nên là một số hoặc cụm từ ngắn.`));
      }
      break;
    }
    case 'essay': {
      const rub = q.rubric ?? [];
      if (rub.length === 0 || rub.every((r) => !clean(r.content))) {
        add(err('Q_NO_RUBRIC', `${lab}: thiếu đáp án / hướng dẫn chấm từng ý.`, { field: 'rubric' }));
      } else {
        const bad = rub.filter((r) => !clean(r.content) || !(r.points > 0));
        if (bad.length > 0) {
          add(err('Q_RUBRIC_ITEM', `${lab}: mỗi ý chấm phải có nội dung và điểm lớn hơn 0.`, { field: 'rubric' }));
        }
        const sum = sumPoints(rub.map((r) => (Number.isFinite(r.points) ? r.points : 0)));
        if (!approxEqual(sum, q.points)) {
          add(
            err(
              'Q_RUBRIC_SUM',
              `${lab}: các ý chấm cộng lại ${fmtPoints(sum)} điểm, khác điểm của câu (${fmtPoints(q.points)}).`,
              { field: 'rubric' },
            ),
          );
        }
      }
      break;
    }
  }

  if (q.type !== 'essay' && !clean(q.solution)) {
    add(warn('Q_NO_SOLUTION', `${lab}: chưa có lời giải/hướng dẫn — nên bổ sung để dễ rà soát.`, { field: 'solution' }));
  }
  if (textsToScan.some((t) => PLACEHOLDER_RE.test(t))) {
    add(warn('Q_PLACEHOLDER', `${lab}: có vẻ còn chỗ giữ chỗ (TODO, [điền…], xxxx…) chưa thay bằng nội dung thật.`));
  }
  if (textsToScan.some((t) => LEAK_RE.test(t))) {
    add(warn('Q_LEAK', `${lab}: nội dung câu hỏi có chữ "đáp án/lời giải" — kiểm tra để đề học sinh không bị lộ.`));
  }
  return issues;
}

export function validateExam(input: ExamInput, matrix: Matrix, questions: Question[]): Issue[] {
  const issues: Issue[] = [];
  const { structure } = input;
  const slots = buildSlots(structure, matrix);
  const slotById = new Map(slots.map((s) => [s.id, s]));

  // Ô thiếu / thừa so với ma trận
  const qById = new Map<string, Question>();
  for (const q of questions) {
    if (qById.has(q.id)) {
      issues.push(err('Q_DUP_ID', `Hai câu trùng mã ô ${q.id}.`, { questionId: q.id }));
    }
    qById.set(q.id, q);
    if (!slotById.has(q.id)) {
      issues.push(err('Q_EXTRA', `Câu ${q.code} không có trong ma trận đã xác nhận.`, { questionId: q.id }));
    }
  }
  for (const s of slots) {
    if (!qById.has(s.id)) {
      issues.push(err('Q_MISSING', `Ma trận có câu ${s.code} nhưng đề chưa có câu này.`, { questionId: s.id }));
    }
  }

  // Số câu theo từng (hàng, dạng, mức)
  for (const row of matrix.rows) {
    for (const t of QTYPES) {
      for (const l of LEVELS) {
        const expected = row.counts[t][l];
        const actual = questions.filter((q) => q.rowId === row.id && q.type === t && q.level === l).length;
        if (expected !== actual) {
          issues.push(
            err(
              'COUNT_MISMATCH',
              `Số câu ${QTYPE_SHORT_LABEL[t]} – ${LEVEL_LABEL[l]} của chủ đề "${row.topic}": ma trận ${expected}, đề ${actual}.`,
              { rowId: row.id },
            ),
          );
        }
      }
    }
  }

  // Điểm tổng, theo dạng và theo mức độ
  const totalPoints = sumPoints(questions.map((q) => q.points));
  if (!approxEqual(totalPoints, structure.totalScore)) {
    issues.push(
      err('TOTAL_POINTS', `Tổng điểm của đề là ${fmtPoints(totalPoints)}, khác thang điểm ${fmtPoints(structure.totalScore)}.`),
    );
  }
  for (const t of QTYPES) {
    const mine = questions.filter((q) => q.type === t);
    const sum = sumPoints(mine.map((q) => q.points));
    if (!approxEqual(sum, structure.points[t])) {
      issues.push(
        err('TYPE_POINTS', `Dạng "${QTYPE_SHORT_LABEL[t]}": đề có ${fmtPoints(sum)} điểm, ma trận/cấu trúc là ${fmtPoints(structure.points[t])}.`),
      );
    }
  }
  const matrixTotals = computeTotals(slots, matrix.rows, structure.totalScore);
  for (const l of LEVELS) {
    const sum = sumPoints(questions.filter((q) => q.level === l).map((q) => q.points));
    if (!approxEqual(sum, matrixTotals.levelPoints[l])) {
      issues.push(
        err(
          'LEVEL_POINTS',
          `Mức "${LEVEL_LABEL[l]}": đề có ${fmtPoints(sum)} điểm, ma trận là ${fmtPoints(matrixTotals.levelPoints[l])}.`,
        ),
      );
    }
  }

  // Từng câu
  for (const q of questions) {
    issues.push(...validateQuestion(q, slotById.get(q.id)));
  }

  // Trùng lặp nội dung
  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const a = questions[i]!;
      const b = questions[j]!;
      if (clean(a.stem).length < 20 || clean(b.stem).length < 20) continue;
      const sim = similarity(a.stem, b.stem);
      if (sim >= 0.85) {
        issues.push(
          warn('Q_DUPLICATE', `${questionLabel(b)} gần giống ${questionLabel(a)} (${Math.round(sim * 100)}%) — có thể trùng lặp.`, {
            questionId: b.id,
          }),
        );
      }
    }
  }
  return issues;
}

export const issuesForQuestion = (issues: Issue[], questionId: string): Issue[] =>
  issues.filter((i) => i.questionId === questionId);
export const globalIssues = (issues: Issue[]): Issue[] => issues.filter((i) => !i.questionId);
