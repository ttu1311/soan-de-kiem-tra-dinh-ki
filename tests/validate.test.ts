import { describe, expect, it } from 'vitest';
import { hasErrors, issuesForQuestion, validateExam, validateInput, validateMatrix } from '../shared/validate.js';
import { moveShortToTf } from '../shared/blueprint.js';
import { input, matrix, validQuestions } from './helpers.js';

const codes = (issues: { code: string }[]) => issues.map((i) => i.code);

describe('kiểm tra dữ liệu đầu vào (bước 1)', () => {
  it('ví dụ Toán 10 hợp lệ (có thể chỉ có cảnh báo)', () => {
    const issues = validateInput(input());
    expect(hasErrors(issues)).toBe(false);
  });

  it('thiếu nội dung nguồn → lỗi, yêu cầu bổ sung (không tự đoán chương trình)', () => {
    const i = input();
    i.sourceText = '';
    const issues = validateInput(i);
    const e = issues.find((x) => x.code === 'SOURCE_SHORT')!;
    expect(e.severity).toBe('error');
    expect(e.message).toMatch(/không tự đoán/);
  });

  it('nguồn quá ngắn / thiếu chủ đề / thiếu yêu cầu cần đạt / thiếu môn / tên đề', () => {
    const i = input();
    i.sourceText = 'Hàm số bậc hai.';
    i.topics[0]!.requirements = '';
    i.info.subject = ' ';
    i.info.title = '';
    expect(codes(validateInput(i))).toEqual(expect.arrayContaining(['SOURCE_SHORT', 'TOPIC_REQ', 'INFO_SUBJECT', 'INFO_TITLE']));
    const none = input();
    none.topics = [{ id: 't', name: '', requirements: '' }];
    expect(codes(validateInput(none))).toContain('TOPIC_NONE');
  });

  it('tổng điểm các dạng phải bằng thang điểm', () => {
    const i = input();
    i.structure.points.essay = 4;
    expect(codes(validateInput(i))).toContain('STRUCT_SUM');
    const j = input();
    j.structure.totalScore = 20;
    expect(codes(validateInput(j))).toContain('STRUCT_SUM');
  });

  it('thang điểm 20 hợp lệ khi các dạng cộng lại 20', () => {
    const i = input();
    i.structure.totalScore = 20;
    i.structure.points = { mcq: 6, tf: 4, short: 4, essay: 6 };
    expect(hasErrors(validateInput(i))).toBe(false);
  });

  it('dạng có điểm mà 0 câu, hoặc có câu mà 0 điểm → lỗi', () => {
    const i = input();
    i.structure.counts.short = 0;
    expect(codes(validateInput(i))).toContain('STRUCT_COUNT_ZERO');
    const j = input();
    j.structure.points = { mcq: 3, tf: 4, short: 0, essay: 3 };
    expect(codes(validateInput(j))).toContain('STRUCT_POINTS_ZERO');
    j.structure = moveShortToTf(input().structure);
    expect(hasErrors(validateInput({ ...j, structure: j.structure }))).toBe(false);
  });

  it('tỉ lệ mức độ phải cộng 100%', () => {
    const i = input();
    i.structure.levelTarget = { biet: 50, hieu: 30, van_dung: 30 };
    expect(codes(validateInput(i))).toContain('STRUCT_LEVEL_TARGET');
  });
});

describe('kiểm tra ma trận (bước 2)', () => {
  it('ma trận mẫu hợp lệ, không có lỗi', () => {
    expect(hasErrors(validateMatrix(input().structure, matrix()))).toBe(false);
  });

  it('dạng có điểm nhưng ma trận không có câu → lỗi', () => {
    const m = matrix();
    for (const r of m.rows) r.counts.short = { biet: 0, hieu: 0, van_dung: 0 };
    expect(codes(validateMatrix(input().structure, m))).toContain('TYPE_NO_QUESTIONS');
  });

  it('có câu ở mức chưa có yêu cầu cần đạt → lỗi', () => {
    const m = matrix();
    m.rows[0]!.outcomes.biet = '';
    expect(codes(validateMatrix(input().structure, m))).toContain('OUTCOME_MISSING');
  });

  it('số câu khác cấu trúc dự kiến chỉ là cảnh báo; điểm tự luận sai tổng là lỗi', () => {
    const m = matrix();
    m.rows[0]!.counts.mcq.biet += 1;
    const w = validateMatrix(input().structure, m).find((i) => i.code === 'COUNT_DIFF')!;
    expect(w.severity).toBe('warning');
    const m2 = matrix();
    m2.pointOverrides = { 'essay-1': 1, 'essay-2': 1, 'essay-3': 2 };
    expect(codes(validateMatrix(input().structure, m2))).toContain('ESSAY_POINTS_SUM');
  });

  it('cảnh báo khi tỉ lệ mức độ lệch xa mục tiêu', () => {
    const i = input();
    i.structure.levelTarget = { biet: 10, hieu: 10, van_dung: 80 };
    expect(codes(validateMatrix(i.structure, matrix()))).toContain('LEVEL_RATIO');
  });
});

describe('kiểm tra đề hoàn chỉnh (bằng mã)', () => {
  it('đề hợp lệ: không lỗi', () => {
    const issues = validateExam(input(), matrix(), validQuestions());
    expect(issues.filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('thiếu đáp án trắc nghiệm → lỗi gắn đúng câu', () => {
    const qs = validQuestions();
    const q = qs.find((x) => x.id === 'mcq-3')!;
    q.correct = undefined;
    const issues = validateExam(input(), matrix(), qs);
    expect(codes(issuesForQuestion(issues, 'mcq-3'))).toContain('Q_NO_ANSWER');
    expect(issuesForQuestion(issues, 'mcq-4')).toEqual([]);
  });

  it('thiếu đáp án trả lời ngắn / Đúng–Sai thiếu ý đáp án', () => {
    const qs = validQuestions();
    qs.find((x) => x.id === 'short-2')!.answer = '  ';
    qs.find((x) => x.id === 'tf-1')!.statements![2]!.isTrue = undefined;
    const issues = validateExam(input(), matrix(), qs);
    expect(codes(issuesForQuestion(issues, 'short-2'))).toContain('Q_NO_ANSWER');
    expect(codes(issuesForQuestion(issues, 'tf-1'))).toContain('Q_NO_ANSWER');
  });

  it('câu Đúng/Sai chỉ có ba ý → lỗi "phải có đúng 4 ý"', () => {
    const qs = validQuestions();
    qs.find((x) => x.id === 'tf-2')!.statements!.pop();
    const issues = validateExam(input(), matrix(), qs);
    const e = issuesForQuestion(issues, 'tf-2').find((i) => i.code === 'Q_TF_COUNT')!;
    expect(e.severity).toBe('error');
    expect(e.message).toMatch(/đúng 4 ý a, b, c, d/);
    expect(e.message).toMatch(/hiện có 3 ý/);
  });

  it('nhãn ý không đúng thứ tự a, b, c, d → lỗi', () => {
    const qs = validQuestions();
    qs.find((x) => x.id === 'tf-1')!.statements![1]!.label = 'c';
    expect(codes(validateExam(input(), matrix(), qs))).toContain('Q_TF_LABELS');
  });

  it('tổng điểm sai → lỗi tổng điểm, lỗi theo dạng và lỗi điểm lệch ma trận', () => {
    const qs = validQuestions();
    qs.find((x) => x.id === 'mcq-1')!.points = 0.5;
    const issues = validateExam(input(), matrix(), qs);
    expect(codes(issues)).toEqual(expect.arrayContaining(['TOTAL_POINTS', 'TYPE_POINTS', 'LEVEL_POINTS']));
    expect(codes(issuesForQuestion(issues, 'mcq-1'))).toContain('Q_POINTS_MATRIX');
    expect(issues.find((i) => i.code === 'TOTAL_POINTS')!.message).toMatch(/10,25/);
  });

  it('tự luận: các ý chấm không cộng đủ điểm câu → lỗi', () => {
    const qs = validQuestions();
    qs.find((x) => x.id === 'essay-1')!.rubric![0]!.points = 0.1;
    const issues = validateExam(input(), matrix(), qs);
    expect(codes(issuesForQuestion(issues, 'essay-1'))).toContain('Q_RUBRIC_SUM');
  });

  it('thiếu câu so với ma trận, thừa câu, và số câu lệch', () => {
    const qs = validQuestions();
    const removed = qs.splice(qs.findIndex((x) => x.id === 'mcq-12'), 1)[0]!;
    let issues = validateExam(input(), matrix(), qs);
    expect(codes(issues)).toEqual(expect.arrayContaining(['Q_MISSING', 'COUNT_MISMATCH', 'TOTAL_POINTS']));
    qs.push({ ...removed, id: 'mcq-99', code: 'TN99' });
    issues = validateExam(input(), matrix(), qs);
    expect(codes(issues)).toContain('Q_EXTRA');
  });

  it('phương án trùng, thiếu phương án, nội dung trống', () => {
    const qs = validQuestions();
    qs[0]!.options!.B = qs[0]!.options!.A;
    qs[1]!.options!.C = '';
    qs[2]!.stem = '';
    const issues = validateExam(input(), matrix(), qs);
    expect(codes(issuesForQuestion(issues, qs[0]!.id))).toContain('Q_MCQ_DUP_OPTIONS');
    expect(codes(issuesForQuestion(issues, qs[1]!.id))).toContain('Q_MCQ_OPTIONS');
    expect(codes(issuesForQuestion(issues, qs[2]!.id))).toContain('Q_STEM_EMPTY');
  });

  it('cảnh báo (không chặn) câu trùng lặp, placeholder, lộ đáp án', () => {
    const qs = validQuestions();
    const stem = 'Cho hàm số y = x² − 4x + 3. Hãy xác định tọa độ đỉnh của parabol tương ứng.';
    qs[0]!.stem = stem;
    qs[1]!.stem = stem;
    qs[2]!.stem = 'TODO viết câu hỏi cho phần này sau';
    qs[3]!.stem = 'Đáp án của bài toán này là gì? Hãy nêu rõ đáp án.';
    const issues = validateExam(input(), matrix(), qs);
    expect(issues.find((i) => i.code === 'Q_DUPLICATE')!.severity).toBe('warning');
    expect(codes(issuesForQuestion(issues, qs[2]!.id))).toContain('Q_PLACEHOLDER');
    expect(codes(issuesForQuestion(issues, qs[3]!.id))).toContain('Q_LEAK');
    expect(hasErrors(issues)).toBe(false);
  });
});
