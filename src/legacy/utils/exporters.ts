import { HarnessEdState } from '../types/edtech';

// 1. Xuất file Microsoft Word (.doc định dạng chuẩn văn phòng Bộ GD&ĐT)
export function exportToWord(state: HarnessEdState, type: 'khbd' | 'exam' | 'all' = 'all'): void {
  const isKhbd = type === 'khbd' || type === 'all';
  const isExam = type === 'exam' || type === 'all';

  let htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${state.khbd.lessonTitle} - Bộ GD&ĐT</title>
<style>
  @page {
    size: 21.0cm 29.7cm; /* A4 */
    margin: 2.0cm 2.0cm 2.0cm 2.5cm;
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 13pt;
    line-height: 1.35;
    color: #000;
  }
  .header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18pt;
  }
  .header-table td {
    border: none;
    vertical-align: top;
    text-align: center;
    font-size: 11pt;
  }
  h1 { font-size: 16pt; font-weight: bold; text-align: center; margin: 14pt 0 6pt 0; text-transform: uppercase; }
  h2 { font-size: 14pt; font-weight: bold; margin: 12pt 0 4pt 0; }
  h3 { font-size: 13pt; font-weight: bold; margin: 8pt 0 3pt 0; }
  table.border-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10pt 0;
  }
  table.border-table th, table.border-table td {
    border: 1px solid #000;
    padding: 5pt 6pt;
    font-size: 11pt;
    vertical-align: top;
  }
  table.border-table th {
    background-color: #F2F2F2;
    font-weight: bold;
    text-align: center;
  }
  .text-center { text-align: center; }
  .text-bold { font-weight: bold; }
  .text-italic { font-style: italic; }
  .mb-2 { margin-bottom: 8pt; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>
`;

  // --- NỘI DUNG KẾ HOẠCH BÀI DẠY (CÔNG VĂN 5512) ---
  if (isKhbd) {
    htmlContent += `
<table class="header-table">
  <tr>
    <td style="width: 45%;">
      <b>${state.khbd.schoolName}</b><br>
      <b>${state.khbd.departmentName}</b><br>
      Họ và tên GV: ${state.khbd.teacherName}
    </td>
    <td style="width: 55%;">
      <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br>
      <b>Độc lập - Tự do - Hạnh phúc</b><br>
      <i>---------------</i>
    </td>
  </tr>
</table>

<h1>KẾ HOẠCH BÀI DẠY (CV 5512/BGDĐT-GDTrH)</h1>
<p class="text-center text-bold" style="font-size: 14pt;">BÀI: ${state.khbd.lessonTitle}</p>
<p class="text-center text-italic">Môn: ${state.khbd.subject} - ${state.khbd.grade} | Thời lượng: ${state.khbd.durationPeriods} tiết</p>

<h2>I. MỤC TIÊU DẠY HỌC</h2>
<h3>1. Về kiến thức:</h3>
<ul>
  ${state.khbd.knowledgeObjectives.map(o => `<li>${o}</li>`).join('')}
</ul>

<h3>2. Về năng lực:</h3>
<p class="text-bold text-italic">a) Năng lực chung:</p>
<ul>
  ${state.khbd.generalCompetencies.map(o => `<li>${o}</li>`).join('')}
</ul>
<p class="text-bold text-italic">b) Năng lực đặc thù:</p>
<ul>
  ${state.khbd.specificCompetencies.map(o => `<li>${o}</li>`).join('')}
</ul>

<h3>3. Về phẩm chất:</h3>
<ul>
  ${state.khbd.qualities.map(o => `<li>${o}</li>`).join('')}
</ul>

<h2>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h2>
<p><b>1. Giáo viên:</b> ${state.khbd.teacherSupplies}</p>
<p><b>2. Học sinh:</b> ${state.khbd.studentSupplies}</p>

<h2>III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN CV 5512)</h2>
`;

    state.khbd.activities.forEach((act) => {
      htmlContent += `
<div style="margin-top: 14pt; border-top: 1px dashed #999; padding-top: 8pt;">
  <h3>${act.name} (Thời lượng: ~${act.durationMinutes} phút)</h3>
  <p><b>a) Mục tiêu:</b> ${act.target}</p>
  <p><b>b) Nội dung:</b> ${act.content}</p>
  <p><b>c) Sản phẩm:</b> ${act.product}</p>
  <p><b>d) Tổ chức thực hiện:</b></p>
  <table class="border-table">
    <thead>
      <tr>
        <th style="width: 25%;">Các bước tiến hành</th>
        <th style="width: 40%;">Hoạt động của Giáo viên</th>
        <th style="width: 35%;">Hoạt động của Học sinh</th>
      </tr>
    </thead>
    <tbody>
      ${act.implementation.map(step => `
      <tr>
        <td class="text-bold">${step.title}</td>
        <td>${step.teacherAction}</td>
        <td>${step.studentAction}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
</div>
`;
    });
  }

  // --- NỘI DUNG ĐỀ THI & MA TRẬN (CÔNG VĂN 7991) ---
  if (isExam) {
    if (isKhbd) {
      htmlContent += `<div class="page-break"></div>`;
    }

    htmlContent += `
<table class="header-table">
  <tr>
    <td style="width: 50%;">
      <b>${state.exam.schoolName}</b><br>
      <b>Năm học: ${state.exam.academicYear}</b><br>
      <i>Môn: ${state.exam.subject} - ${state.exam.grade}</i>
    </td>
    <td style="width: 50%;">
      <b>${state.exam.title}</b><br>
      <b>Thời gian làm bài: ${state.exam.durationMinutes} phút</b><br>
      <i>(Đề thi gồm 4 phần - Thang điểm 10.0)</i>
    </td>
  </tr>
</table>

<h2>PHẦN A. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ (CHUẨN CV 7991)</h2>
<p class="text-italic">Tỉ lệ điểm: 40% Nhận biết (4.0đ) - 30% Thông hiểu (3.0đ) - 30% Vận dụng (3.0đ)</p>

<table class="border-table">
  <thead>
    <tr>
      <th rowspan="2">TT</th>
      <th rowspan="2">Chủ đề / Đơn vị kiến thức</th>
      <th colspan="3">Phần I: TN nhiều lựa chọn (3.0đ)</th>
      <th colspan="3">Phần II: TN Đúng/Sai (2.0đ)</th>
      <th colspan="3">Phần III: TN trả lời ngắn (2.0đ)</th>
      <th colspan="3">Phần IV: Tự luận (3.0đ)</th>
      <th colspan="3">Tổng điểm</th>
    </tr>
    <tr>
      <th>Biết</th><th>Hiểu</th><th>VD</th>
      <th>Biết</th><th>Hiểu</th><th>VD</th>
      <th>Biết</th><th>Hiểu</th><th>VD</th>
      <th>Biết</th><th>Hiểu</th><th>VD</th>
      <th>Biết</th><th>Hiểu</th><th>VD</th>
    </tr>
  </thead>
  <tbody>
    ${state.exam.matrixRows.map((r, idx) => `
    <tr>
      <td class="text-center">${idx + 1}</td>
      <td><b>${r.topic}</b><br>${r.contentUnit}</td>
      <td class="text-center">${r.partI_nb}</td>
      <td class="text-center">${r.partI_th}</td>
      <td class="text-center">${r.partI_vd}</td>
      <td class="text-center">${r.partII_nb}</td>
      <td class="text-center">${r.partII_th}</td>
      <td class="text-center">${r.partII_vd}</td>
      <td class="text-center">${r.partIII_nb}</td>
      <td class="text-center">${r.partIII_th}</td>
      <td class="text-center">${r.partIII_vd}</td>
      <td class="text-center">${r.partIV_nb}</td>
      <td class="text-center">${r.partIV_th}</td>
      <td class="text-center">${r.partIV_vd}</td>
      <td class="text-center text-bold">4.0đ</td>
      <td class="text-center text-bold">3.0đ</td>
      <td class="text-center text-bold">3.0đ</td>
    </tr>
    `).join('')}
    <tr style="background-color: #E6F0FA; font-weight: bold;">
      <td colspan="2" class="text-center">Tổng điểm quy đổi</td>
      <td colspan="3" class="text-center">3.0 điểm (30%)</td>
      <td colspan="3" class="text-center">2.0 điểm (20%)</td>
      <td colspan="3" class="text-center">2.0 điểm (20%)</td>
      <td colspan="3" class="text-center">3.0 điểm (30%)</td>
      <td colspan="3" class="text-center">10.0 ĐIỂM (100%)</td>
    </tr>
  </tbody>
</table>

<h2>PHẦN B. NỘI DUNG ĐỀ KIỂM TRA (4 PHẦN ĐỘC LẬP)</h2>

<h3>PHẦN I. CÂU TRẮC NGHIỆM NHIỀU LỰA CHỌN (3,0 điểm)</h3>
<p class="text-italic">Thí sinh trả lời từ câu 1 đến câu ${state.exam.partI.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.</p>
${state.exam.partI.map(q => `
<div class="mb-2">
  <p><b>Câu ${q.questionNumber}:</b> ${q.content}</p>
  <p style="margin-left: 15pt;">
    <b>A.</b> ${q.options.A} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <b>B.</b> ${q.options.B}<br>
    <b>C.</b> ${q.options.C} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <b>D.</b> ${q.options.D}
  </p>
</div>
`).join('')}

<h3>PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI (2,0 điểm)</h3>
<p class="text-italic">Thí sinh trả lời từ câu 1 đến câu ${state.exam.partII.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.<br>
(Quy tắc tính điểm CV 7991: Đúng 1 ý: 0,1đ; Đúng 2 ý: 0,25đ; Đúng 3 ý: 0,5đ; Đúng 4 ý: 1,0đ)</p>

${state.exam.partII.map(q => `
<div class="mb-2" style="border: 1px solid #CCC; padding: 6pt; background-color: #FAFBFD;">
  <p><b>Câu ${q.questionNumber}:</b> ${q.contextText}</p>
  <table class="border-table" style="margin: 4pt 0;">
    <thead>
      <tr>
        <th style="width: 10%;">Lệnh</th>
        <th style="width: 70%;">Nội dung khẳng định</th>
        <th style="width: 10%;">Đúng</th>
        <th style="width: 10%;">Sai</th>
      </tr>
    </thead>
    <tbody>
      ${q.statements.map(s => `
      <tr>
        <td class="text-center text-bold">${s.subId})</td>
        <td>${s.text}</td>
        <td class="text-center">${s.isCorrect ? '<b>X</b>' : ''}</td>
        <td class="text-center">${!s.isCorrect ? '<b>X</b>' : ''}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  <p class="text-italic" style="font-size: 10pt; color: #555;">* Hướng dẫn giải chi tiết: ${q.explanation || ''}</p>
</div>
`).join('')}

<h3>PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (2,0 điểm)</h3>
<p class="text-italic">Thí sinh trả lời từ câu 1 đến câu ${state.exam.partIII.length}. Mỗi câu hỏi làm đúng được 0,5 điểm.</p>
${state.exam.partIII.map(q => `
<div class="mb-2">
  <p><b>Câu ${q.questionNumber}:</b> ${q.content}</p>
  <p style="margin-left: 15pt; color: #0284C7;"><b>Đáp số:</b> ................................... [Đáp án chuẩn: <b>${q.correctShortAnswer} ${q.unit || ''}</b>]</p>
</div>
`).join('')}

<h3>PHẦN IV. TỰ LUẬN (3,0 điểm)</h3>
<p class="text-italic">Thí sinh trình bày chi tiết các bước giải toán.</p>
${state.exam.partIV.map(q => `
<div class="mb-2">
  <p><b>Câu ${q.questionNumber} (${q.totalPoints} điểm):</b> ${q.content.replace(/\n/g, '<br>')}</p>
  <div style="background-color: #F8F9FA; border-left: 3px solid #2563EB; padding: 6pt; margin: 6pt 0;">
    <p class="text-bold">HƯỚNG DẪN CHẤM VÀ THANG ĐIỂM CHI TIẾT:</p>
    <pre style="font-family: 'Times New Roman', serif; font-size: 11pt; white-space: pre-wrap;">${q.modelAnswer}</pre>
  </div>
</div>
`).join('')}
`;
  }

  htmlContent += `
</body>
</html>
`;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = type === 'khbd' 
    ? `KHBD_${state.khbd.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}_CV5512.doc`
    : type === 'exam'
    ? `DeKiemTra_${state.exam.subject.replace(/[^a-zA-Z0-9]/g, '_')}_CV7991.doc`
    : `BoHoSoSuPham_${state.khbd.subject}_CV5512_CV7991.doc`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1b. Xuất riêng Ma Trận & Bản Đặc Tả Đề Kiểm Tra Chuẩn CV 7991
export function exportMatrixSpecsToWord(state: HarnessEdState): void {
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Ma Trận & Bản Đặc Tả Đề Kiểm Tra - ${state.exam.subject}</title>
<style>
  @page { size: 29.7cm 21.0cm; margin: 1.5cm; } /* Landscape A4 for wide matrix */
  body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; line-height: 1.25; }
  table.border-table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  table.border-table th, table.border-table td { border: 1px solid #000; padding: 4pt 5pt; font-size: 10pt; vertical-align: top; }
  table.border-table th { background-color: #F2F2F2; text-align: center; font-weight: bold; }
  .text-center { text-align: center; }
  .text-bold { font-weight: bold; }
  h1 { font-size: 14pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 2pt; }
  h2 { font-size: 12pt; font-weight: bold; margin-top: 10pt; }
</style>
</head>
<body>
  <h1>BỘ GIÁO DỤC VÀ ĐÀO TẠO</h1>
  <p class="text-center text-bold" style="font-size: 13pt;">PHỤ LỤC: MA TRẬN & BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ</p>
  <p class="text-center" style="font-style: italic;">(Kèm theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GDĐT)</p>
  <p class="text-center"><b>Trường:</b> ${state.exam.schoolName} | <b>Môn:</b> ${state.exam.subject} - ${state.exam.grade} | <b>Năm học:</b> ${state.exam.academicYear}</p>

  <h2>1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ</h2>
  <table class="border-table">
    <thead>
      <tr>
        <th rowspan="2">TT</th>
        <th rowspan="2">Chủ đề / Đơn vị kiến thức</th>
        <th colspan="3">Phần I: TN nhiều lựa chọn (3.0đ)</th>
        <th colspan="3">Phần II: TN Đúng-Sai (2.0đ)</th>
        <th colspan="3">Phần III: Trả lời ngắn (2.0đ)</th>
        <th colspan="3">Phần IV: Tự luận (3.0đ)</th>
        <th colspan="3">Tổng điểm</th>
      </tr>
      <tr>
        <th>Biết</th><th>Hiểu</th><th>VD</th>
        <th>Biết</th><th>Hiểu</th><th>VD</th>
        <th>Biết</th><th>Hiểu</th><th>VD</th>
        <th>Biết</th><th>Hiểu</th><th>VD</th>
        <th>Biết</th><th>Hiểu</th><th>VD</th>
      </tr>
    </thead>
    <tbody>
      ${state.exam.matrixRows.map((r, idx) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td><b>${r.topic}</b><br>${r.contentUnit}</td>
        <td class="text-center">${r.partI_nb}</td><td class="text-center">${r.partI_th}</td><td class="text-center">${r.partI_vd}</td>
        <td class="text-center">${r.partII_nb}</td><td class="text-center">${r.partII_th}</td><td class="text-center">${r.partII_vd}</td>
        <td class="text-center">${r.partIII_nb}</td><td class="text-center">${r.partIII_th}</td><td class="text-center">${r.partIII_vd}</td>
        <td class="text-center">${r.partIV_nb}</td><td class="text-center">${r.partIV_th}</td><td class="text-center">${r.partIV_vd}</td>
        <td class="text-center text-bold">4.0đ</td><td class="text-center text-bold">3.0đ</td><td class="text-center text-bold">3.0đ</td>
      </tr>
      `).join('')}
      <tr style="background-color: #E6F0FA; font-weight: bold;">
        <td colspan="2" class="text-center">Tổng điểm quy đổi</td>
        <td colspan="3" class="text-center">3.0 điểm (30%)</td>
        <td colspan="3" class="text-center">2.0 điểm (20%)</td>
        <td colspan="3" class="text-center">2.0 điểm (20%)</td>
        <td colspan="3" class="text-center">3.0 điểm (30%)</td>
        <td colspan="3" class="text-center">10.0 ĐIỂM (100%)</td>
      </tr>
    </tbody>
  </table>

  <h2>2. BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ</h2>
  <table class="border-table">
    <thead>
      <tr>
        <th>TT</th>
        <th>Chủ đề / Đơn vị kiến thức</th>
        <th>Yêu cầu cần đạt (YCCĐ)</th>
        <th>Số câu hỏi ở các mức độ đánh giá</th>
      </tr>
    </thead>
    <tbody>
      ${state.exam.matrixRows.map((r, idx) => `
      <tr>
        <td class="text-center text-bold">${idx + 1}</td>
        <td><b>${r.topic}</b><br>${r.contentUnit}</td>
        <td style="white-space: pre-line;">${r.learningOutcomes}</td>
        <td>
          - Phần I (TN nhiều lựa chọn): ${r.partI_nb + r.partI_th + r.partI_vd} câu (3.0đ)<br>
          - Phần II (TN Đúng/Sai 4 ý): ${r.partII_nb + r.partII_th + r.partII_vd} câu (2.0đ)<br>
          - Phần III (Trả lời ngắn): ${r.partIII_nb + r.partIII_th + r.partIII_vd} câu (2.0đ)<br>
          - Phần IV (Tự luận): ${r.partIV_nb + r.partIV_th + r.partIV_vd} câu (3.0đ)
        </td>
      </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
`;

  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MaTran_DacTa_${state.exam.subject.replace(/[^a-zA-Z0-9]/g, '_')}_CV7991.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 2. Xuất Slide sang Presentation HTML chuyên nghiệp (Full screen presentation bundle)
export function exportToPresentationHtml(state: HarnessEdState): void {
  const slides = state.slides.slides;
  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Slide Trình Chiếu: ${state.slides.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Be Vietnam Pro', sans-serif; }
    .slide-aspect { aspect-ratio: 16 / 9; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 flex flex-col items-center justify-center min-h-screen p-4">
  <div class="max-w-5xl w-full">
    <div class="flex items-center justify-between mb-4 text-xs text-slate-400">
      <div>Hệ Thống Trình Chiếu Bài Giảng GDPT 2018 - CV 5512</div>
      <div id="slideCounter">Slide 1 / ${slides.length}</div>
    </div>

    <!-- Khung chiếu 16:9 -->
    <div id="slideContainer" class="slide-aspect w-full bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-10 flex flex-col justify-between relative overflow-hidden">
      <!-- Slides will be rendered here via JS -->
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between mt-4">
      <div class="flex items-center gap-2">
        <button onclick="prevSlide()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition">◀ Trang Trước</button>
        <button onclick="nextSlide()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition">Trang Sau ▶</button>
      </div>
      <div class="text-xs text-slate-400">Dùng phím mũi tên ⬅ ➡ hoặc phím Space để chuyển slide</div>
      <button onclick="toggleFullScreen()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium">Toàn Màn Hình</button>
    </div>
  </div>

  <script>
    const slidesData = ${JSON.stringify(slides)};
    let currentIndex = 0;

    function renderSlide() {
      const s = slidesData[currentIndex];
      const container = document.getElementById('slideContainer');
      const counter = document.getElementById('slideCounter');
      counter.innerText = 'Slide ' + (currentIndex + 1) + ' / ' + slidesData.length;

      let html = '<div class="flex items-center justify-between border-b border-slate-800 pb-3">';
      html += '<span class="text-xs text-blue-400 font-semibold uppercase tracking-wider">' + (s.visualTag || 'GDPT 2018') + '</span>';
      html += '<span class="text-xs text-slate-400">${state.khbd.subject} - ${state.khbd.grade}</span></div>';

      html += '<div class="my-auto"><h1 class="text-3xl font-bold text-white mb-2">' + s.title + '</h1>';
      if (s.subtitle) {
        html += '<p class="text-base text-blue-300 mb-6">' + s.subtitle + '</p>';
      }
      html += '<ul class="space-y-3 mt-4">';
      s.bullets.forEach(b => {
        html += '<li class="flex items-start gap-3 text-lg text-slate-200"><span class="text-blue-500 mt-1">●</span><span>' + b + '</span></li>';
      });
      html += '</ul></div>';

      if (s.teacherNotes) {
        html += '<div class="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">';
        html += '<span><b>Ghi chú sư phạm:</b> ' + s.teacherNotes + '</span>';
        html += '<span>${state.khbd.teacherName}</span></div>';
      }

      container.innerHTML = html;
    }

    function prevSlide() {
      if (currentIndex > 0) { currentIndex--; renderSlide(); }
    }
    function nextSlide() {
      if (currentIndex < slidesData.length - 1) { currentIndex++; renderSlide(); }
    }
    function toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') nextSlide();
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') prevSlide();
    });

    renderSlide();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Slide_${state.slides.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 3. TẠO SINGLE-FILE HTML TỰ VẬN HÀNH (Alpine.js + Tailwind CDN + Lucide Icons CDN)
// Cho phép giáo viên tải về 1 file .html duy nhất và click đúp mở ngay offline không cần cài đặt gì!
export function generateStandaloneSingleFileHtml(state: HarnessEdState): string {
  const jsonStateString = JSON.stringify(state);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HarnessEd - ${state.khbd.lessonTitle} (CV 5512 & CV 7991)</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Alpine.js CDN -->
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Be Vietnam Pro', sans-serif; background-color: #F8FAFC; color: #0F172A; }
    .ratio-16-9 { aspect-ratio: 16 / 9; }
    @media print {
      .no-print { display: none !important; }
      .print-page { page-break-after: always; }
    }
  </style>
</head>
<body x-data="harnessEdApp()" x-init="initApp()" class="min-h-screen flex flex-col bg-slate-50 text-slate-900">

  <!-- TOP BAR: Scope 1 Shell Specs -->
  <header class="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 shrink-0 no-print shadow-2xs">
    <!-- Zone 1: Wordmark -->
    <div class="flex items-center gap-2.5 shrink-0">
      <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
        HE
      </div>
      <div>
        <span class="font-bold text-base text-slate-900 tracking-tight whitespace-nowrap">HarnessEd</span>
        <span class="text-[10px] text-slate-500 block">Nền tảng Sư phạm Số BGD&ĐT</span>
      </div>
    </div>

    <!-- Zone 2: Bộ chọn nhanh (Môn học, Khối lớp, Bộ sách, Tên bài học) -->
    <div class="flex items-center gap-2 flex-1 max-w-3xl overflow-x-auto text-xs py-0.5">
      <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shrink-0">
        <span class="text-[10px] text-slate-400 uppercase font-semibold">Môn</span>
        <select x-model="state.khbd.subject" class="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none">
          <option value="Toán học">Toán học</option>
          <option value="Ngữ văn">Ngữ văn</option>
          <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
          <option value="Vật lí">Vật lí</option>
          <option value="Hóa học">Hóa học</option>
          <option value="Sinh học">Sinh học</option>
          <option value="Lịch sử">Lịch sử</option>
          <option value="Địa lí">Địa lí</option>
          <option value="Tin học">Tin học</option>
          <option value="Tiếng Anh">Tiếng Anh</option>
        </select>
      </div>

      <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shrink-0">
        <span class="text-[10px] text-slate-400 uppercase font-semibold">Khối</span>
        <select x-model="state.khbd.grade" class="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none">
          <option value="Lớp 6">Lớp 6</option>
          <option value="Lớp 7">Lớp 7</option>
          <option value="Lớp 8">Lớp 8</option>
          <option value="Lớp 9">Lớp 9</option>
          <option value="Lớp 10">Lớp 10</option>
          <option value="Lớp 11">Lớp 11</option>
          <option value="Lớp 12">Lớp 12</option>
        </select>
      </div>

      <div class="flex items-center gap-1 bg-blue-50/70 border border-blue-200 rounded-lg px-2 py-1 shrink-0">
        <span class="text-[10px] text-blue-500 uppercase font-bold">Bộ sách</span>
        <select x-model="state.khbd.textbookSeries" class="bg-transparent font-bold text-blue-900 text-xs focus:outline-none">
          <option value="Cánh Diều">Cánh Diều</option>
          <option value="Kết Nối Tri Thức">Kết Nối Tri Thức</option>
          <option value="Chân Trời Sáng Tạo">Chân Trời Sáng Tạo</option>
        </select>
      </div>

      <div class="flex-1 min-w-[180px]">
        <input type="text" x-model="state.khbd.lessonTitle" placeholder="Tên bài học..." class="w-full text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white px-2.5 py-1 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none transition">
      </div>
    </div>

    <!-- Zone 3: Primary Action -->
    <div class="flex items-center gap-2 shrink-0">
      <button @click="window.print()" class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
        In A4 / PDF
      </button>
      <button @click="copyJsonState()" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition">
        Sao Chép JSON
      </button>
    </div>
  </header>

  <!-- MAIN SPLIT-PANE WORKSPACE (Scope 1 Shell Specs) -->
  <main class="flex-1 flex overflow-hidden">
    <!-- Bảng điều khiển bên trái rộng 380px -->
    <aside class="w-[380px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto p-4 no-print space-y-4">
      
      <!-- 3 Chế Độ Điều Hướng Chính -->
      <div>
        <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Chế Độ Làm Việc
        </div>
        <div class="space-y-1.5 p-1 bg-slate-100 rounded-xl">
          <button @click="activeTab = 'khbd'" :class="activeTab === 'khbd' ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'" class="w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Soạn KHBD 5512</span>
            </div>
            <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">4/4 HĐ ✓</span>
          </button>

          <button @click="activeTab = 'slides'" :class="activeTab === 'slides' ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'" class="w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Trình Chiếu Slide Bài Giảng</span>
            </div>
            <span class="text-[10px] text-slate-400 font-mono" x-text="state.slides.slides.length + ' slide'"></span>
          </button>

          <button @click="activeTab = 'exam'" :class="activeTab === 'exam' ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'" class="w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Ngân Hàng Đề Thi 7991</span>
            </div>
            <span class="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">4 Phần</span>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-1.5 mt-2">
          <button @click="activeTab = 'json'" :class="activeTab === 'json' ? 'bg-blue-100/70 text-blue-800 font-semibold' : 'text-slate-500 hover:bg-slate-100'" class="px-2.5 py-1.5 text-[11px] rounded-md transition text-center">
            JSON State Bàn Giao
          </button>
          <button @click="window.print()" class="px-2.5 py-1.5 text-[11px] text-slate-500 hover:bg-slate-100 rounded-md transition text-center">
            In Ấn Hồ Sơ
          </button>
        </div>
      </div>

      <!-- Giám sát Ma Trận Đề Thi CV 7991 -->
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
        <div class="flex justify-between items-center font-bold text-slate-800">
          <span>Barem Điểm CV 7991:</span>
          <span class="text-emerald-700 font-mono">10.0 / 10.0 điểm</span>
        </div>
        <div class="flex justify-between text-slate-600 text-[11px]">
          <span>Nhận biết (40%):</span>
          <span class="font-semibold text-slate-800">4.0 điểm</span>
        </div>
        <div class="flex justify-between text-slate-600 text-[11px]">
          <span>Thông hiểu (30%):</span>
          <span class="font-semibold text-slate-800">3.0 điểm</span>
        </div>
        <div class="flex justify-between text-slate-600 text-[11px]">
          <span>Vận dụng (30%):</span>
          <span class="font-semibold text-slate-800">3.0 điểm</span>
        </div>
        <div class="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 mt-1">
          ✓ Phần II: Đúng/Sai 4 lệnh a-b-c-d chuẩn CV 7991
        </div>
      </div>

      <!-- Quick Export Center -->
      <div class="border-t border-slate-100 pt-3 mt-auto">
        <button @click="copyJsonState()" class="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition">
          Sao Chép JSON State Bàn Giao
        </button>
      </div>
    </aside>

    <!-- Vùng làm việc trực quan bên phải -->
    <section class="flex-1 overflow-y-auto p-8 bg-slate-100">
      <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-full">
        
        <!-- PHÂN HỆ 1: KẾ HOẠCH BÀI DẠY (CV 5512) -->
        <div x-show="activeTab === 'khbd'" class="space-y-6">
          
          <!-- Banner: Chuyển Đổi Nhanh KHBD Thành Slide (Scope 3) -->
          <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 no-print shadow-sm">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-sm sm:text-base">Chuyển Đổi Nhanh KHBD Thành Slide Deck</h3>
                <span class="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold uppercase">1-Click 16:9</span>
              </div>
              <p class="text-xs text-blue-100 mt-0.5">Tự động trích xuất 4 hoạt động 5512 sang Slide trình chiếu 16:9 với thẻ trực quan hóa kiến thức</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="isEditingKhbd = !isEditingKhbd" class="px-3 py-1.5 bg-blue-800/80 hover:bg-blue-800 border border-blue-400/40 text-white rounded-xl text-xs font-semibold transition">
                <span x-text="isEditingKhbd ? 'Đang Sửa Trực Tiếp' : 'Bật Sửa Trực Tiếp'"></span>
              </button>
              <button @click="convertKhbdToSlides()" class="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-xs transition hover:scale-105">
                Chuyển Đổi Sang Slide (16:9)
              </button>
            </div>
          </div>

          <div class="text-center border-b border-slate-200 pb-4">
            <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">Phụ lục IV - Công văn số 5512/BGDĐT-GDTrH</span>
            <h1 class="text-xl font-bold text-slate-900 uppercase mt-1">KẾ HOẠCH BÀI DẠY</h1>
            <p class="text-lg font-bold text-blue-600" x-text="state.khbd.lessonTitle"></p>
            <p class="text-xs text-slate-500 mt-1" x-text="'Môn: ' + state.khbd.subject + ' - ' + state.khbd.grade + ' · Bộ sách: ' + (state.khbd.textbookSeries || 'Cánh Diều') + ' · Thời lượng: ' + state.khbd.durationPeriods + ' tiết'"></p>
          </div>

          <!-- Mục tiêu -->
          <div class="space-y-3">
            <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide">I. Mục tiêu bài dạy</h2>
            <div>
              <h3 class="text-xs font-semibold text-slate-700">1. Về kiến thức:</h3>
              <ul class="list-disc pl-5 text-xs text-slate-600 space-y-1 mt-1">
                <template x-for="(item, idx) in state.khbd.knowledgeObjectives" :key="idx">
                  <li>
                    <template x-if="!isEditingKhbd"><span x-text="item"></span></template>
                    <template x-if="isEditingKhbd">
                      <input type="text" x-model="state.khbd.knowledgeObjectives[idx]" class="w-full text-xs p-1 border border-slate-300 rounded focus:border-blue-500">
                    </template>
                  </li>
                </template>
              </ul>
            </div>
            <div>
              <h3 class="text-xs font-semibold text-slate-700">2. Về năng lực:</h3>
              <p class="text-xs text-slate-600 italic">a) Năng lực chung:</p>
              <ul class="list-disc pl-5 text-xs text-slate-600 space-y-1">
                <template x-for="(item, idx) in state.khbd.generalCompetencies" :key="idx">
                  <li>
                    <template x-if="!isEditingKhbd"><span x-text="item"></span></template>
                    <template x-if="isEditingKhbd">
                      <input type="text" x-model="state.khbd.generalCompetencies[idx]" class="w-full text-xs p-1 border border-slate-300 rounded focus:border-blue-500">
                    </template>
                  </li>
                </template>
              </ul>
              <p class="text-xs text-slate-600 italic mt-1">b) Năng lực đặc thù:</p>
              <ul class="list-disc pl-5 text-xs text-slate-600 space-y-1">
                <template x-for="(item, idx) in state.khbd.specificCompetencies" :key="idx">
                  <li>
                    <template x-if="!isEditingKhbd"><span x-text="item"></span></template>
                    <template x-if="isEditingKhbd">
                      <input type="text" x-model="state.khbd.specificCompetencies[idx]" class="w-full text-xs p-1 border border-slate-300 rounded focus:border-blue-500">
                    </template>
                  </li>
                </template>
              </ul>
            </div>
          </div>

          <!-- 4 Hoạt động chuẩn 5512 (Bảng tiến trình 4 hoạt động có Inline Editable) -->
          <div class="space-y-6 pt-4 border-t border-slate-200">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide">II. Tiến trình dạy học (Đủ 4 hoạt động chuẩn CV 5512)</h2>
              <span class="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ 4 Hoạt Động Chuẩn</span>
            </div>
            <template x-for="(act, idx) in state.khbd.activities" :key="act.id">
              <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 shadow-2xs">
                <div class="bg-slate-100 p-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <span class="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center" x-text="act.number"></span>
                    <h3 class="text-sm font-bold text-slate-900" x-text="act.name"></h3>
                  </div>
                  <span class="text-xs font-medium text-slate-500" x-text="'~' + act.durationMinutes + ' phút'"></span>
                </div>
                
                <div class="p-4 space-y-3 text-xs text-slate-700">
                  <div>
                    <b class="text-slate-900 block mb-0.5">a) Mục tiêu:</b>
                    <template x-if="!isEditingKhbd"><p class="bg-white p-2 rounded border border-slate-200" x-text="act.target"></p></template>
                    <template x-if="isEditingKhbd"><textarea x-model="act.target" rows="2" class="w-full p-2 border border-blue-400 rounded bg-white text-xs"></textarea></template>
                  </div>
                  <div>
                    <b class="text-slate-900 block mb-0.5">b) Nội dung:</b>
                    <template x-if="!isEditingKhbd"><p class="bg-white p-2 rounded border border-slate-200" x-text="act.content"></p></template>
                    <template x-if="isEditingKhbd"><textarea x-model="act.content" rows="2" class="w-full p-2 border border-blue-400 rounded bg-white text-xs"></textarea></template>
                  </div>
                  <div>
                    <b class="text-slate-900 block mb-0.5">c) Sản phẩm:</b>
                    <template x-if="!isEditingKhbd"><p class="bg-white p-2 rounded border border-slate-200" x-text="act.product"></p></template>
                    <template x-if="isEditingKhbd"><textarea x-model="act.product" rows="2" class="w-full p-2 border border-blue-400 rounded bg-white text-xs"></textarea></template>
                  </div>

                  <div>
                    <b class="text-slate-900 block mb-1">d) Tổ chức thực hiện (Bảng tiến trình 4 bước chuẩn):</b>
                    <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <table class="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr class="bg-slate-100 text-slate-700 border-b border-slate-200">
                            <th class="p-2 w-1/4 font-semibold">Các bước tiến hành</th>
                            <th class="p-2 w-3/8 font-semibold border-l border-slate-200">Hoạt động của Giáo viên</th>
                            <th class="p-2 w-3/8 font-semibold border-l border-slate-200">Hoạt động của Học sinh</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                          <template x-for="step in act.implementation" :key="step.title">
                            <tr>
                              <td class="p-2 align-top font-bold text-blue-700" x-text="step.title"></td>
                              <td class="p-2 align-top border-l border-slate-200 text-slate-700">
                                <template x-if="!isEditingKhbd"><span x-text="step.teacherAction"></span></template>
                                <template x-if="isEditingKhbd"><textarea x-model="step.teacherAction" rows="2" class="w-full p-1 border border-blue-300 rounded text-xs"></textarea></template>
                              </td>
                              <td class="p-2 align-top border-l border-slate-200 text-slate-700">
                                <template x-if="!isEditingKhbd"><span x-text="step.studentAction"></span></template>
                                <template x-if="isEditingKhbd"><textarea x-model="step.studentAction" rows="2" class="w-full p-1 border border-blue-300 rounded text-xs"></textarea></template>
                              </td>
                            </tr>
                          </template>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- PHÂN HỆ 2: SLIDE TRÌNH CHIẾU (Slide Deck 16:9 + Thẻ trực quan + Toàn màn hình) -->
        <div x-show="activeTab === 'slides'" class="space-y-6">
          <div class="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-bold text-slate-900">Trình Chiếu Slide Bài Giảng</h2>
                <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono font-semibold" x-text="'Slide ' + (currentSlideIndex + 1) + ' / ' + state.slides.slides.length"></span>
              </div>
              <p class="text-xs text-slate-500" x-text="state.khbd.lessonTitle"></p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="convertKhbdToSlides()" class="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold shadow-xs">
                Đồng Bộ Từ KHBD 5512
              </button>
              <button @click="toggleFullScreen()" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs">
                Toàn Màn Hình
              </button>
              <button @click="prevSlide()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium">Trang Trước</button>
              <button @click="nextSlide()" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold">Trang Sau</button>
            </div>
          </div>

          <!-- Màn hình Slide 16:9 với Thẻ trực quan hóa kiến thức -->
          <div id="deckContainer" class="ratio-16-9 bg-slate-950 text-white rounded-2xl p-8 sm:p-10 flex flex-col justify-between shadow-2xl border border-slate-800 relative overflow-hidden">
            <!-- Header slide -->
            <div class="flex justify-between items-center text-xs border-b border-slate-800/80 pb-3">
              <span class="font-bold tracking-wider uppercase text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-800/50" x-text="state.slides.slides[currentSlideIndex].visualTag || 'GDPT 2018'"></span>
              <span class="text-slate-400 font-mono" x-text="(currentSlideIndex + 1) + ' / ' + state.slides.slides.length"></span>
            </div>

            <!-- Content slide: Thẻ trực quan hóa kiến thức -->
            <div class="my-auto py-4 space-y-4">
              <div>
                <h3 class="text-2xl sm:text-3xl font-bold text-white tracking-tight" x-text="state.slides.slides[currentSlideIndex].title"></h3>
                <p class="text-sm sm:text-base text-blue-300 font-medium mt-1" x-text="state.slides.slides[currentSlideIndex].subtitle || ''"></p>
              </div>

              <!-- Thẻ trực quan hóa kiến thức (Cards Grid) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <template x-for="bullet in state.slides.slides[currentSlideIndex].bullets" :key="bullet">
                  <div class="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl shadow-xs transition flex flex-col gap-1">
                    <p class="text-sm text-slate-100 leading-relaxed" x-text="bullet"></p>
                  </div>
                </template>
              </div>
            </div>

            <!-- Footer slide -->
            <div class="text-[11px] text-slate-400 pt-3 border-t border-slate-800 flex justify-between items-center">
              <span><b>Ghi chú GV:</b> <span class="text-slate-300" x-text="state.slides.slides[currentSlideIndex].teacherNotes || 'Dành thời gian cho học sinh ghi nhớ nội dung trọng tâm.'"></span></span>
              <span class="text-slate-500 font-mono">Dùng ◀ ▶ để chuyển trang</span>
            </div>
          </div>

          <!-- Controls phụ bên dưới -->
          <div class="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
            <button @click="prevSlide()" class="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-100">◀ Trang Trước</button>
            <div class="flex items-center gap-1.5 overflow-x-auto">
              <template x-for="(s, idx) in state.slides.slides" :key="idx">
                <button @click="currentSlideIndex = idx" :class="idx === currentSlideIndex ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'" class="w-8 h-7 text-xs font-bold rounded flex items-center justify-center transition" x-text="idx + 1"></button>
              </template>
            </div>
            <button @click="nextSlide()" class="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">Trang Sau ▶</button>
          </div>
        </div>

        <!-- PHÂN HỆ 3: ĐỀ KIỂM TRA CHUẨN CÔNG VĂN 7991 (4 PHẦN) -->
        <div x-show="activeTab === 'exam'" class="space-y-8">
          <div class="text-center border-b border-slate-200 pb-4">
            <h1 class="text-xl font-bold text-slate-900 uppercase" x-text="state.exam.title"></h1>
            <p class="text-xs text-slate-500" x-text="'Thời gian: ' + state.exam.durationMinutes + ' phút · Chuẩn Công văn 7991/BGDĐT-GDTrH'"></p>
          </div>

          <!-- PHẦN I: TN NHIỀU LỰA CHỌN -->
          <div>
            <div class="bg-blue-50/70 p-3 rounded-lg border border-blue-200 mb-4">
              <h2 class="text-sm font-bold text-blue-900">PHẦN I. CÂU TRẮC NGHIỆM NHIỀU LỰA CHỌN (3,0 điểm)</h2>
              <p class="text-xs text-blue-700">Mỗi câu hỏi chỉ chọn một phương án đúng (0,25 điểm/câu).</p>
            </div>
            <div class="space-y-4">
              <template x-for="q in state.exam.partI" :key="q.id">
                <div class="text-xs text-slate-800 border-b border-slate-100 pb-3">
                  <p class="font-medium text-slate-900 mb-1" x-text="'Câu ' + q.questionNumber + ': ' + q.content"></p>
                  <div class="grid grid-cols-2 gap-2 pl-4 text-slate-600">
                    <div><b>A.</b> <span x-text="q.options.A"></span></div>
                    <div><b>B.</b> <span x-text="q.options.B"></span></div>
                    <div><b>C.</b> <span x-text="q.options.C"></span></div>
                    <div><b>D.</b> <span x-text="q.options.D"></span></div>
                  </div>
                  <div class="mt-1 pl-4 text-[11px] text-emerald-700 font-semibold" x-text="'Đáp án đúng: ' + q.correctAnswer"></div>
                </div>
              </template>
            </div>
          </div>

          <!-- PHẦN II: TN ĐÚNG/SAI 4 Ý A-B-C-D -->
          <div>
            <div class="bg-amber-50/70 p-3 rounded-lg border border-amber-200 mb-4">
              <h2 class="text-sm font-bold text-amber-900">PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG / SAI 4 Ý (2,0 điểm)</h2>
              <p class="text-xs text-amber-800">Thí sinh trả lời từng lệnh a, b, c, d. Barem CV 7991: Đúng 1 ý = 0,1đ; Đúng 2 ý = 0,25đ; Đúng 3 ý = 0,5đ; Đúng 4 ý = 1,0đ.</p>
            </div>
            <div class="space-y-6">
              <template x-for="q in state.exam.partII" :key="q.id">
                <div class="border border-slate-200 rounded-lg p-4 bg-slate-50/50 text-xs">
                  <p class="font-bold text-slate-900 mb-2" x-text="'Câu ' + q.questionNumber + ': ' + q.contextText"></p>
                  <table class="w-full border-collapse border border-slate-300 text-xs mt-2 bg-white">
                    <thead>
                      <tr class="bg-slate-100 text-slate-700">
                        <th class="border border-slate-300 p-2 w-16 text-center">Lệnh</th>
                        <th class="border border-slate-300 p-2 text-left">Nội dung khẳng định</th>
                        <th class="border border-slate-300 p-2 w-20 text-center">Đúng</th>
                        <th class="border border-slate-300 p-2 w-20 text-center">Sai</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template x-for="st in q.statements" :key="st.subId">
                        <tr>
                          <td class="border border-slate-300 p-2 text-center font-bold" x-text="st.subId + ')'"></td>
                          <td class="border border-slate-300 p-2" x-text="st.text"></td>
                          <td class="border border-slate-300 p-2 text-center text-emerald-600 font-bold" x-text="st.isCorrect ? '✓' : ''"></td>
                          <td class="border border-slate-300 p-2 text-center text-rose-600 font-bold" x-text="!st.isCorrect ? '✓' : ''"></td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                  <div class="mt-2 text-[11px] text-slate-500 italic" x-text="'Giải thích: ' + q.explanation"></div>
                </div>
              </template>
            </div>
          </div>

          <!-- PHẦN III: TRẢ LỜI NGẮN -->
          <div>
            <div class="bg-indigo-50/70 p-3 rounded-lg border border-indigo-200 mb-4">
              <h2 class="text-sm font-bold text-indigo-900">PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (2,0 điểm)</h2>
              <p class="text-xs text-indigo-700">Thí sinh điền kết quả vào ô đáp số (0,5 điểm/câu).</p>
            </div>
            <div class="space-y-3">
              <template x-for="q in state.exam.partIII" :key="q.id">
                <div class="text-xs text-slate-800 border-b border-slate-100 pb-2">
                  <p class="font-medium" x-text="'Câu ' + q.questionNumber + ': ' + q.content"></p>
                  <p class="text-blue-700 font-semibold pl-4 mt-1" x-text="'Đáp số: ' + q.correctShortAnswer + (q.unit ? ' ' + q.unit : '')"></p>
                </div>
              </template>
            </div>
          </div>

          <!-- PHẦN IV: TỰ LUẬN -->
          <div>
            <div class="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 mb-4">
              <h2 class="text-sm font-bold text-emerald-900">PHẦN IV. TỰ LUẬN (3,0 điểm)</h2>
              <p class="text-xs text-emerald-700">Trình bày bài giải chi tiết và thang điểm chuẩn.</p>
            </div>
            <div class="space-y-4">
              <template x-for="q in state.exam.partIV" :key="q.id">
                <div class="border border-slate-200 rounded-lg p-4 bg-slate-50/50 text-xs">
                  <p class="font-bold text-slate-900 mb-2" x-text="'Câu ' + q.questionNumber + ' (' + q.totalPoints + ' điểm): ' + q.content"></p>
                  <div class="bg-white p-3 rounded border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap" x-text="q.modelAnswer"></div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- PHÂN HỆ 4: JSON STATE BÀN GIAO -->
        <div x-show="activeTab === 'json'" class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 class="text-base font-bold text-slate-900">Khối JSON State Bàn Giao Phiên Làm Việc</h2>
            <button @click="copyJsonState()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium">Sao Chép JSON</button>
          </div>
          <pre class="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-[500px]" x-text="JSON.stringify(state, null, 2)"></pre>
        </div>

      </div>
    </section>
  </main>

  <script>
    function harnessEdApp() {
      return {
        activeTab: 'khbd',
        currentSlideIndex: 0,
        isEditingKhbd: false,
        state: ${jsonStateString},
        initApp() {
          if (window.lucide) {
            window.lucide.createIcons();
          }
          window.addEventListener('keydown', (e) => {
            if (this.activeTab === 'slides') {
              if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
                e.preventDefault();
                this.nextSlide();
              } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault();
                this.prevSlide();
              }
            }
          });
        },
        convertKhbdToSlides() {
          const khbd = this.state.khbd;
          const generatedSlides = [
            {
              id: 's-title',
              visualTag: 'Bài Học Mới',
              title: khbd.lessonTitle.toUpperCase(),
              subtitle: 'Chương trình GDPT 2018 · Bộ sách ' + (khbd.textbookSeries || 'Cánh Diều'),
              bullets: [
                'Môn học: ' + khbd.subject + ' - Khối: ' + khbd.grade,
                'Thời lượng: ' + khbd.durationPeriods + ' tiết',
                'Giáo viên: ' + khbd.teacherName + ' (' + khbd.departmentName + ')',
                'Đơn vị: ' + khbd.schoolName
              ],
              teacherNotes: 'Giới thiệu tổng quan bài học, tạo tâm thế học tập hứng khởi cho học sinh.'
            },
            {
              id: 's-obj',
              visualTag: 'Mục Tiêu 5512',
              title: 'MỤC TIÊU & YÊU CẦU CẦN ĐẠT',
              subtitle: 'Chuẩn năng lực và phẩm chất theo Công văn 5512',
              bullets: [
                'Kiến thức: ' + (khbd.knowledgeObjectives[0] || 'Nắm vững kiến thức trọng tâm của bài.'),
                'Năng lực chung: ' + (khbd.generalCompetencies[0] || 'Tự chủ và tự học, hợp tác nhóm.'),
                'Năng lực đặc thù: ' + (khbd.specificCompetencies[0] || 'Giải quyết vấn đề và mô hình hóa.'),
                'Phẩm chất: ' + (khbd.qualities[0] || 'Chăm chỉ, trách nhiệm trong các hoạt động.')
              ],
              teacherNotes: 'Nêu rõ chuẩn đầu ra bài học để học sinh chủ động theo dõi quá trình học tập.'
            }
          ];

          khbd.activities.forEach((act, idx) => {
            const step1 = act.implementation[0] ? act.implementation[0].teacherAction : 'Giao nhiệm vụ học tập.';
            const step2 = act.implementation[1] ? act.implementation[1].studentAction : 'Học sinh nghiên cứu và thực hiện.';
            generatedSlides.push({
              id: 's-act-' + act.id,
              visualTag: act.number === 1 ? 'Khởi Động' : act.number === 2 ? 'Kiến Thức Mới' : act.number === 3 ? 'Luyện Tập' : 'Vận Dụng',
              title: 'HOẠT ĐỘNG ' + act.number + ': ' + act.name.toUpperCase(),
              subtitle: 'Mục tiêu: ' + act.target,
              bullets: [
                'Nội dung: ' + act.content,
                'Nhiệm vụ GV: ' + step1,
                'Nhiệm vụ HS: ' + step2,
                'Sản phẩm cần đạt: ' + act.product
              ],
              teacherNotes: 'Thời lượng ~' + act.durationMinutes + ' phút. Giáo viên quan sát hỗ trợ các nhóm.'
            });
          });

          generatedSlides.push({
            id: 's-end',
            visualTag: 'Dặn Dò',
            title: 'HƯỚNG DẪN TỰ HỌC & DẶN DÒ',
            subtitle: 'Củng cố kiến thức và chuẩn bị cho tiết học sau',
            bullets: [
              'Ghi nhớ kiến thức cốt lõi và làm bài tập rèn luyện trong SGK.',
              'Hoàn thành bài tập vận dụng thực tiễn.',
              'Xem trước nội dung của bài học kế tiếp.'
            ],
            teacherNotes: 'Dặn dò học sinh nộp bài tập về nhà đúng thời hạn.'
          });

          this.state.slides.slides = generatedSlides;
          this.activeTab = 'slides';
          this.currentSlideIndex = 0;
        },
        toggleFullScreen() {
          const elem = document.getElementById('deckContainer') || document.documentElement;
          if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
              document.documentElement.requestFullscreen();
            });
          } else {
            document.exitFullscreen();
          }
        },
        prevSlide() {
          if (this.currentSlideIndex > 0) this.currentSlideIndex--;
        },
        nextSlide() {
          if (this.currentSlideIndex < this.state.slides.slides.length - 1) this.currentSlideIndex++;
        },
        copyJsonState() {
          navigator.clipboard.writeText(JSON.stringify(this.state, null, 2));
          alert('Đã sao chép toàn bộ khối JSON State vào Clipboard!');
        }
      };
    }
  </script>
</body>
</html>`;
}

// 4. Download Standalone HTML bundle to user machine
export function downloadStandaloneHtml(state: HarnessEdState): void {
  const html = generateStandaloneSingleFileHtml(state);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HarnessEd_${state.khbd.subject}_CV5512_CV7991_Offline.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 5. Download raw JSON file
export function downloadJsonFile(state: HarnessEdState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `harness_ed_state_${state.khbd.subject}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
