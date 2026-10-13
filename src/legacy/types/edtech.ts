export type ActiveModule = 'khbd' | 'slides' | 'exam' | 'matrix' | 'export_json';

// --- Công văn 5512: Kế hoạch bài dạy (KHBD) ---
export interface ActivityStep {
  title: string; // Chuyển giao nhiệm vụ / Thực hiện nhiệm vụ / Báo cáo thảo luận / Kết luận nhận định
  teacherAction: string;
  studentAction: string;
}

export interface TeachingActivity {
  id: string;
  number: number;
  name: string; // Khởi động / Hình thành kiến thức / Luyện tập / Vận dụng
  target: string; // Mục tiêu
  content: string; // Nội dung
  product: string; // Sản phẩm
  implementation: ActivityStep[]; // Tổ chức thực hiện (4 bước)
  durationMinutes: number;
}

export interface LessonPlan5512 {
  schoolName: string;
  departmentName: string;
  teacherName: string;
  subject: string;
  grade: string;
  textbookSeries: 'Cánh Diều' | 'Kết Nối Tri Thức' | 'Chân Trời Sáng Tạo';
  lessonTitle: string;
  durationPeriods: number; // Số tiết
  // I. Mục tiêu
  knowledgeObjectives: string[];
  generalCompetencies: string[]; // Năng lực chung: tự chủ, giao tiếp, sáng tạo...
  specificCompetencies: string[]; // Năng lực đặc thù của môn học
  qualities: string[]; // Phẩm chất: yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm
  // II. Thiết bị và học liệu
  teacherSupplies: string;
  studentSupplies: string;
  // III. Tiến trình dạy học (4 hoạt động)
  activities: TeachingActivity[];
}

// --- Phân hệ Slide Bài Giảng ---
export interface SlideItem {
  id: string;
  type: 'title' | 'objectives' | 'activity' | 'content' | 'quiz' | 'summary';
  activityIdRef?: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  teacherNotes: string;
  visualTag?: string; // Icon or badge description
}

export interface SlideDeck {
  title: string;
  subject: string;
  grade: string;
  slides: SlideItem[];
}

// --- Công văn 7991: Đề kiểm tra & Ma trận đặc tả ---
export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung';

export interface QuestionPartI {
  id: string;
  questionNumber: number;
  content: string;
  options: { [key in 'A' | 'B' | 'C' | 'D']: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  level: CognitiveLevel;
  topic: string;
  points: number; // Mặc định 0.25đ
  explanation?: string;
}

export interface TrueFalseStatement {
  subId: 'a' | 'b' | 'c' | 'd';
  text: string;
  isCorrect: boolean; // Đúng hay Sai
}

export interface QuestionPartII {
  id: string;
  questionNumber: number;
  contextText: string; // Đề dẫn / văn bản ngữ liệu / dữ kiện tình huống
  statements: TrueFalseStatement[]; // 4 lệnh a, b, c, d
  level: CognitiveLevel;
  topic: string;
  maxPoints: number; // 1.0 điểm cho đủ 4 lệnh
  explanation?: string;
}

export interface QuestionPartIII {
  id: string;
  questionNumber: number;
  content: string;
  correctShortAnswer: string;
  level: CognitiveLevel;
  topic: string;
  points: number; // Mặc định 0.5đ
  unit?: string;
  explanation?: string;
}

export interface QuestionPartIV {
  id: string;
  questionNumber: number;
  content: string;
  subQuestions?: { label: string; text: string; points: number }[];
  modelAnswer: string;
  level: CognitiveLevel;
  topic: string;
  totalPoints: number; // Thường 1.5đ - 3.0đ
}

export interface MatrixRow {
  id: string;
  topic: string;
  contentUnit: string;
  // Số câu ở từng mức độ
  partI_nb: number;
  partI_th: number;
  partI_vd: number;
  partII_nb: number;
  partII_th: number;
  partII_vd: number;
  partIII_nb: number;
  partIII_th: number;
  partIII_vd: number;
  partIV_nb: number;
  partIV_th: number;
  partIV_vd: number;
  learningOutcomes: string; // Yêu cầu cần đạt (Bản đặc tả)
}

export interface Exam7991 {
  title: string;
  schoolName: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  semester: string; // Học kỳ I / Giữa kỳ I / Cuối kỳ I / v.v.
  academicYear: string;
  matrixRows: MatrixRow[];
  partI: QuestionPartI[]; // TN 4 lựa chọn
  partII: QuestionPartII[]; // TN Đúng/Sai 4 lệnh a-b-c-d
  partIII: QuestionPartIII[]; // TN Trả lời ngắn
  partIV: QuestionPartIV[]; // Tự luận
}

// Toàn bộ State bàn giao cho phiên làm việc tiếp theo
export interface HarnessEdState {
  version: string;
  lastUpdated: string;
  meta: {
    curriculumFramework: 'GDPT_2018';
    khbdLegalRef: '5512/BGDĐT-GDTrH';
    examLegalRef: '7991/BGDĐT-GDTrH';
    totalPointsTarget: 10.0;
    cognitiveRatio: '40% Nhận biết - 30% Thông hiểu - 30% Vận dụng';
  };
  khbd: LessonPlan5512;
  slides: SlideDeck;
  exam: Exam7991;
}
