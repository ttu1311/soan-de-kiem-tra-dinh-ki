# Soạn đề kiểm tra định kì — công cụ AI hỗ trợ giáo viên THPT

> Công cụ hỗ trợ giáo viên soạn đề, tham khảo phụ lục Công văn 7991/BGDĐT-GDTrH; giáo viên chịu trách nhiệm rà soát và duyệt.
> Đây **không** phải sản phẩm của Bộ GD&ĐT và không có xác nhận pháp lý.

Ứng dụng web (React + Vite + Express) giúp giáo viên THPT tạo **bài kiểm tra định kì**: ma trận, bản đặc tả, đề cho học sinh và đáp án / hướng dẫn chấm.
Chỉ chức năng đề kiểm tra được đưa vào luồng chính; mã kế hoạch bài dạy/slide của bản ZIP cũ được giữ trong `src/legacy/` (không nạp vào ứng dụng).

## Luồng sử dụng

1. **Thông tin & nội dung** — môn, lớp 10–12, tên bài, thời lượng, cấu trúc điểm (mặc định 3 – 2 – 2 – 3 theo mẫu phụ lục, chỉnh được), chủ đề đã dạy + yêu cầu cần đạt, dán nội dung nguồn. Có nút *Thử với ví dụ* (Toán 10 – Hàm số bậc hai; chỉ điền sẵn đầu vào).
2. **Ma trận & đặc tả** — lời gọi AI #1 tạo *bản nháp* có cấu trúc; giáo viên sửa và bấm **Xác nhận ma trận** (sau đó ma trận bị khóa).
3. **Câu hỏi & kiểm tra** — lời gọi AI #2 viết câu hỏi/đáp án/hướng dẫn chấm theo ma trận đã xác nhận. Mã kiểm tra tổng điểm, số câu, đủ 4 ý Đúng/Sai, thiếu đáp án, khớp ma trận… và báo lỗi theo từng câu; sửa tay hoặc tạo lại riêng câu lỗi. Có thể nhờ AI rà soát thêm (cảnh báo tham khảo).
4. **Xem trước & duyệt** — xem cả 4 tài liệu, bấm **Duyệt đề** (chỉ khi không còn lỗi). Sửa gì sau đó thì việc duyệt tự hủy.
5. **Tải về / In** — `.docx` thật cho ma trận, bản đặc tả, đề học sinh (không đáp án), đáp án + hướng dẫn chấm; in / lưu PDF khổ A4.

## Chạy trên máy

```bash
npm install
cp .env.example .env.local        # rồi điền GEMINI_API_KEY (khóa của bạn, không commit)
npm run dev                       # http://localhost:3000
```

Các lệnh khác: `npm run lint` (tsc), `npm test` (kiểm thử đơn vị + API), `npm run test:e2e` (Playwright, dùng máy chủ Gemini giả `scripts/mock-gemini.ts`, không cần khóa), `npm run build`, `npm start`.

## Kiến trúc

- `shared/` — schema (zod), chia điểm/ô câu hỏi, kiểm tra bằng mã, mô hình tài liệu; dùng chung cho trình duyệt và máy chủ.
- `server/` — gọi Gemini bằng `@google/genai` (`responseJsonSchema`), kiểm tra lại kết quả bằng zod, thử lại có giới hạn, đổi lỗi mạng/hạn mức/dữ liệu sai thành thông báo tiếng Việt, giới hạn tốc độ theo IP.
- `api/` — cầu nối hàm serverless cho Vercel (dùng chung `server/handlers.ts`).
- `src/` — giao diện; `src/lib/docx.ts` dựng `.docx` bằng thư viện `docx`; bản xem trước/in A4 dùng cùng mô hình tài liệu.

**Khóa API**: chỉ đọc từ biến môi trường `GEMINI_API_KEY` ở phía máy chủ. Không có trong mã trình duyệt, tệp xuất hay kho mã (`.env*` đã được `.gitignore`).

## Triển khai

**Đang chạy**: https://soan-de-kiem-tra-dinh-ki.vercel.app (Vercel, dự án `soan-de-kiem-tra-dinh-ki`, Production, vùng iad1).

**Vercel** (đơn giản nhất): `npx vercel login`, `npx vercel link --project <tên>`, thêm secret `GEMINI_API_KEY` cho Production (Project → Settings → Environment Variables, bật *Sensitive*), rồi `npx vercel deploy --prod`. Lưu ý:
- `vercel.json` đặt `"framework": "vite"` — nếu bước `vercel link` tự đặt framework của dự án thành `services` thì bản dựng sẽ lỗi "no services are declared"; dòng này ghi đè lại.
- Thời gian chạy tối đa của hàm API đặt trong từng tệp `api/**/*.ts` (`maxDuration = 300`).
- Chỉ **tên miền Production** (`<dự án>.vercel.app`) công khai; các URL riêng của từng lần triển khai bị Vercel Authentication chặn. Đừng bật "All deployments" nếu muốn người lạ mở được.

**Render / Railway / Docker…**: `npm ci && npm run build`, rồi `npm start` (xem `render.yaml`). Đặt `GEMINI_API_KEY` trong phần Secret/Environment của dịch vụ.

Biến tuỳ chọn:
- `GEMINI_MODEL` — model ưu tiên. Thứ tự thử mặc định: `gemini-3.8-flash` → `gemini-3.6-flash` → `gemini-flash-latest` → `gemini-2.5-flash`. Model không tồn tại, đang quá tải (503) hoặc hết hạn mức riêng sẽ tự chuyển sang model kế tiếp.
- `AI_RATE_LIMIT` — số lần gọi AI / IP / 10 phút (mặc định 40).

Mỗi yêu cầu AI có ngân sách tối đa 270 giây (hàm bị ngắt ở 300 giây): hết ngân sách sẽ báo lỗi "AI trả lời quá lâu" thay vì treo.

## Giới hạn đã biết

- Chỉ nhận nội dung nguồn dán dưới dạng văn bản (chưa đọc PDF/DOCX).
- Công thức dùng ký hiệu Unicode (x², √, ≥…), chưa dựng công thức dạng Word Equation.
- AI có thể sai (đặc biệt đáp án/tính toán): bắt buộc giáo viên rà soát; kiểm tra bằng mã chỉ bắt lỗi cấu trúc/điểm, không chứng minh đáp án đúng.
- Cách chấm Đúng–Sai lũy tiến (10/25/50/100%) là cách của đề thi tốt nghiệp THPT từ 2025, không nằm trong phụ lục 7991; có thể chọn cách tuyến tính.
- Thời gian AI phụ thuộc tải của Gemini: lúc đo, ma trận 40–130 giây, 21 câu hỏi 40–90 giây; khi Gemini quá tải có thể chậm hơn hoặc báo lỗi để thử lại.
- Bản nháp lưu trong trình duyệt (localStorage); có nút lưu/mở bản nháp `.json` để chuyển máy.
