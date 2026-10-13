/**
 * DỮ LIỆU ĐẦU VÀO cho nút "Thử với ví dụ" (Toán 10 — Hàm số bậc hai).
 * Đây chỉ là thông tin giáo viên sẽ nhập (chủ đề, yêu cầu cần đạt, nội dung nguồn).
 * Ma trận, câu hỏi và đáp án KHÔNG nằm ở đây — chúng luôn do AI tạo ra khi giáo viên bấm nút tương ứng.
 */
import { defaultStructure, newId } from '../../shared/blueprint.js';
import type { ExamInput } from '../../shared/schema.js';

export const SAMPLE_SOURCE_TOAN10 = `BÀI: HÀM SỐ BẬC HAI

1. Định nghĩa. Hàm số bậc hai theo biến x là hàm số cho bởi công thức y = ax² + bx + c, trong đó a, b, c là các hằng số và a ≠ 0. Tập xác định của hàm số bậc hai là ℝ. Ví dụ: y = 2x² − 4x + 1 (a = 2, b = −4, c = 1); y = −x² + 6x − 5 (a = −1, b = 6, c = −5); y = x² − 9 (a = 1, b = 0, c = −9).

2. Đồ thị. Đồ thị của hàm số bậc hai y = ax² + bx + c (a ≠ 0) là một đường parabol (P) có: đỉnh I(−b/(2a); −Δ/(4a)) với Δ = b² − 4ac; trục đối xứng là đường thẳng x = −b/(2a); bề lõm quay lên trên nếu a > 0 và quay xuống dưới nếu a < 0; cắt trục tung tại điểm (0; c). Giao điểm của (P) với trục hoành là nghiệm của phương trình ax² + bx + c = 0 (nếu có).

3. Cách vẽ parabol. Bước 1: xác định tọa độ đỉnh I. Bước 2: vẽ trục đối xứng x = −b/(2a). Bước 3: xác định giao điểm với trục tung, giao điểm với trục hoành (nếu có) và các điểm đối xứng với chúng qua trục đối xứng. Bước 4: vẽ parabol đi qua các điểm đó, chú ý bề lõm.

4. Sự biến thiên. Với a > 0: hàm số nghịch biến trên khoảng (−∞; −b/(2a)), đồng biến trên khoảng (−b/(2a); +∞); giá trị nhỏ nhất của hàm số là −Δ/(4a), đạt tại x = −b/(2a). Với a < 0: hàm số đồng biến trên khoảng (−∞; −b/(2a)), nghịch biến trên khoảng (−b/(2a); +∞); giá trị lớn nhất của hàm số là −Δ/(4a), đạt tại x = −b/(2a). Bảng biến thiên ghi rõ chiều biến thiên và giá trị của hàm số tại đỉnh.

5. Ví dụ. Hàm số y = x² − 4x + 3 có a = 1 > 0, đỉnh I(2; −1), trục đối xứng x = 2, đồ thị cắt trục Oy tại (0; 3) và cắt trục Ox tại (1; 0), (3; 0). Hàm số nghịch biến trên (−∞; 2), đồng biến trên (2; +∞) và có giá trị nhỏ nhất bằng −1 tại x = 2. Hàm số y = −x² + 6x − 5 có a = −1 < 0, đỉnh I(3; 4), giá trị lớn nhất bằng 4 tại x = 3.

6. Xác định hàm số bậc hai. Nếu parabol y = ax² + bx + c đi qua điểm M(x₀; y₀) thì y₀ = ax₀² + bx₀ + c. Khi biết đồ thị đi qua ba điểm, thay tọa độ từng điểm để lập hệ ba phương trình với ba ẩn a, b, c rồi giải hệ.

7. Ứng dụng. Nhiều hiện tượng thực tế được mô hình hóa bằng hàm số bậc hai. Quỹ đạo của vật ném xiên (quả bóng, tia nước từ vòi phun) có dạng parabol. Độ cao h(t) = −5t² + 20t + 1 (mét) của một vật được ném lên theo thời gian t (giây): vật đạt độ cao lớn nhất tại t = 2 s và độ cao đó là 21 m. Bài toán tối ưu diện tích: dùng 40 m lưới để rào ba cạnh của một mảnh vườn hình chữ nhật có một cạnh là bức tường; gọi x (m) là độ dài mỗi cạnh vuông góc với tường (0 < x < 20) thì diện tích S(x) = x(40 − 2x) = −2x² + 40x, đạt lớn nhất bằng 200 m² khi x = 10. Một cổng vòm có dạng parabol y = −0,5x² + 4 (đơn vị mét; x tính từ trục đối xứng của cổng), chiều cao của cổng tại chính giữa là 4 m.`;

export function sampleToan10Input(): ExamInput {
  return {
    info: {
      subject: 'Toán',
      grade: '10',
      title: 'Kiểm tra định kì — Hàm số bậc hai',
      school: '',
      academicYear: '2026 – 2027',
      semester: 'Giữa học kì 1',
      durationMinutes: 60,
    },
    structure: defaultStructure(),
    topics: [
      {
        id: newId('t'),
        name: 'Khái niệm hàm số bậc hai',
        requirements:
          'Nhận biết được hàm số bậc hai y = ax² + bx + c (a ≠ 0) và tập xác định; xác định được hệ số a, b, c; tính được giá trị của hàm số tại một điểm.',
      },
      {
        id: newId('t'),
        name: 'Đồ thị và sự biến thiên của hàm số bậc hai',
        requirements:
          'Xác định được đỉnh, trục đối xứng, bề lõm, giao điểm với trục tọa độ của parabol; lập được bảng biến thiên, xét được tính đồng biến, nghịch biến; xác định được hệ số của hàm số khi biết đồ thị đi qua các điểm cho trước.',
      },
      {
        id: newId('t'),
        name: 'Ứng dụng của hàm số bậc hai',
        requirements:
          'Tìm được giá trị lớn nhất, nhỏ nhất của hàm số bậc hai; vận dụng hàm số bậc hai để giải quyết một số bài toán thực tiễn (độ cao, quỹ đạo, diện tích lớn nhất).',
      },
    ],
    sourceText: SAMPLE_SOURCE_TOAN10,
    notes: '',
  };
}
