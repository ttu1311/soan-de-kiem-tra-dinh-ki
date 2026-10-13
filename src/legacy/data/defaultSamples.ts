import { HarnessEdState } from '../types/edtech';

export const defaultMathGrade10State: HarnessEdState = {
  version: '2025.1-CV7991',
  lastUpdated: '2025-02-28T09:30:00Z',
  meta: {
    curriculumFramework: 'GDPT_2018',
    khbdLegalRef: '5512/BGDĐT-GDTrH',
    examLegalRef: '7991/BGDĐT-GDTrH',
    totalPointsTarget: 10.0,
    cognitiveRatio: '40% Nhận biết - 30% Thông hiểu - 30% Vận dụng',
  },
  khbd: {
    schoolName: 'TRƯỜNG THPT CHUYÊN QUỐC HỌC',
    departmentName: 'TỔ TOÁN - TIN HỌC',
    teacherName: 'ThS. Nguyễn Văn Toàn',
    subject: 'Toán học',
    grade: 'Lớp 10',
    textbookSeries: 'Cánh Diều',
    lessonTitle: 'HÀM SỐ BẬC HAI VÀ ĐỒ THỊ',
    durationPeriods: 2,
    knowledgeObjectives: [
      'Thiết lập được bảng biến thiên và vẽ được đồ thị hàm số bậc hai y = ax² + bx + c (a ≠ 0).',
      'Nhận biết được tọa độ đỉnh, trục đối xứng, khoảng đồng biến và nghịch biến của parabol.',
      'Vận dụng được kiến thức về hàm số bậc hai để giải quyết một số bài toán tối ưu thực tiễn (tầm xa quỹ đạo bóng, diện tích lớn nhất).'
    ],
    generalCompetencies: [
      'Năng lực tự chủ và tự học: Tự giác tìm hiểu đồ thị parabol qua phần mềm vẽ hình học và hoàn thành phiếu học tập cá nhân.',
      'Năng lực giao tiếp và hợp tác: Tương tác nhóm 4 học sinh để phân tích sự thay đổi hình dáng đồ thị khi hệ số a thay đổi dấu.',
      'Năng lực giải quyết vấn đề và sáng tạo: Mô hình hóa đường cong cổng vòm Parabol bằng hàm số bậc hai để tìm độ cao an toàn cho xe tải.'
    ],
    specificCompetencies: [
      'Năng lực mô hình hóa toán học: Chuyển đổi bài toán quỹ đạo vật ném xiên sang phương trình bậc hai y = ax² + bx + c.',
      'Năng lực tư duy và lập luận toán học: Suy luận chiều bề lõm và giá trị lớn nhất/nhỏ nhất từ dấu của hệ số a.'
    ],
    qualities: [
      'Chăm chỉ: Tích cực thực hành vẽ đồ thị chính xác theo từng bước tọa độ đỉnh và bảng giá trị.',
      'Trách nhiệm: Hoàn thành nhiệm vụ nhóm được phân công và phản biện mang tính xây dựng.'
    ],
    teacherSupplies: 'Máy chiếu, bài giảng trình chiếu điện tử, phiếu học tập số 1 & 2, thước kẻ parabol, phần mềm GeoGebra minh họa.',
    studentSupplies: 'Sách giáo khoa Toán 10 (Bộ Cánh Diều/Kết nối tri thức), vở ghi, thước kẻ, máy tính cầm tay Casio fx-580VN X.',
    activities: [
      {
        id: 'act-1',
        number: 1,
        name: 'Hoạt động 1: Mở đầu / Khởi động (Xác định vấn đề)',
        durationMinutes: 7,
        target: 'Kích hoạt hứng thú học tập, kết nối hình ảnh thực tế (quỹ đạo bóng rổ, cầu treo Cổng Vàng) với đường cong parabol đã học ở lớp 9.',
        content: 'Quan sát clip ngắn về cú ném bóng rổ 3 điểm của vận động viên. Nhận xét quỹ đạo của quả bóng và trả lời câu hỏi: Có thể biểu diễn quỹ đạo này bằng một hàm số đã biết không?',
        product: 'Câu trả lời của học sinh: Quỹ đạo bóng là đường cong parabol có bề lõm quay xuống dưới, có thể mô tả qua dạng y = ax² + bx + c.',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Trình chiếu hình ảnh cầu vòm St. Louis và cú ném bóng rổ; phát lệnh yêu cầu HS thảo luận cặp đôi trong 2 phút về dạng quỹ đạo.',
            studentAction: 'Tiếp nhận câu hỏi, quan sát hình ảnh và trao đổi ngắn với bạn cùng bàn.'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Quan sát các cặp thảo luận, gợi ý liên hệ lại đồ thị y = ax² (lớp 9) với đồ thị tổng quát có chứa thêm bx + c.',
            studentAction: 'Huy động kiến thức cũ, phác họa nhanh hình dáng đường cong vào giấy nháp.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Mời đại diện 2 học sinh trình bày nhận xét trước lớp; yêu cầu các học sinh khác nhận xét, bổ sung.',
            studentAction: 'Báo cáo: Quỹ đạo có điểm cao nhất (đỉnh) và hai nhánh đối xứng nhau qua một đường thẳng đứng.'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Chốt lại vấn đề: Quỹ đạo này chính là đồ thị của hàm số bậc hai y = ax² + bx + c (a ≠ 0). Dẫn dắt vào bài mới.',
            studentAction: 'Lắng nghe, ghi tựa bài mới vào vở.'
          }
        ]
      },
      {
        id: 'act-2',
        number: 2,
        name: 'Hoạt động 2: Hình thành kiến thức mới (Khảo sát và vẽ đồ thị hàm bậc hai)',
        durationMinutes: 20,
        target: 'Học sinh nắm vững định nghĩa đỉnh I(-b/(2a); -Δ/(4a)), trục đối xứng x = -b/(2a), chiều biến thiên và quy trình 4 bước vẽ parabol.',
        content: 'Khám phá biến đổi y = a(x + b/(2a))² - Δ/(4a); xây dựng bảng biến thiên với 2 trường hợp a > 0 và a < 0; xây dựng quy trình 4 bước vẽ parabol.',
        product: 'Bảng biến thiên hoàn chỉnh trên bảng lớp; phiếu học tập số 1 ghi đủ công thức tọa độ đỉnh, trục đối xứng và 4 bước vẽ đồ thị.',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Chia lớp thành 4 nhóm, phát Phiếu học tập số 1: Yêu cầu biến đổi vế phải của y = ax² + bx + c về dạng bình phương đúng và xác định điểm cực trị.',
            studentAction: 'Các nhóm nhận phiếu, phân công nhóm trưởng điều hành và thư ký ghi chép.'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Theo dõi hoạt động của các nhóm, hỗ trợ các nhóm gặp khó khăn trong biến đổi đại số thêm bết hạng tử.',
            studentAction: 'Thực hiện biến đổi: y = a[ (x + b/2a)² - (b² - 4ac)/4a² ] = a(x + b/2a)² - Δ/4a. Nhận xét dấu khi x = -b/2a.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Gọi nhóm 1 trình bày trường hợp a > 0, nhóm 3 trình bày trường hợp a < 0. Trình chiếu mô phỏng GeoGebra kiểm chứng trực quan.',
            studentAction: 'Đại diện nhóm treo bảng phụ, thuyết minh bảng biến thiên và tọa độ đỉnh parabol.'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Chuẩn hóa kiến thức: Định nghĩa tọa độ đỉnh I(-b/2a; -Δ/4a), trục đối xứng x = -b/2a; quy trình vẽ 4 bước: Đỉnh -> Trục đối xứng -> Điểm đặc biệt -> Vẽ parabol uốn cong mượt mà.',
            studentAction: 'Ghi nội dung định lý và quy trình vẽ vào vở lý thuyết.'
          }
        ]
      },
      {
        id: 'act-3',
        number: 3,
        name: 'Hoạt động 3: Luyện tập (Vẽ parabol và giải toán biến thiên)',
        durationMinutes: 12,
        target: 'Học sinh rèn luyện kỹ năng lập bảng biến thiên và vẽ chính xác đồ thị hàm số y = x² - 4x + 3 và y = -x² + 2x + 3.',
        content: 'Thực hiện bài tập cá nhân: Lập bảng biến thiên và vẽ đồ thị hai hàm số cụ thể; tìm tọa độ giao điểm với trục tung và trục hoành.',
        product: 'Bài làm trên vở của học sinh; 2 bài giải chuẩn xác của đại diện HS trên 2 bảng nhóm.',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Giao nhiệm vụ: Dãy A làm câu a (y = x² - 4x + 3), Dãy B làm câu b (y = -x² + 2x + 3) trong thời gian 7 phút.',
            studentAction: 'Mở vở bài tập, độc lập tính toán tọa độ đỉnh I, trục đối xứng và bảng giá trị (5 điểm đối xứng).'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Đi vòng quanh lớp quan sát, phát hiện sai sót phổ biến (nhầm dấu hoành độ đỉnh -b/2a, vẽ góc nhọn thay vì cong tròn ở đỉnh).',
            studentAction: 'Thực hiện vẽ đồ thị trên hệ trục tọa độ Oxy, chấm 5 điểm đối xứng và nối cong trơn.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Chọn 2 học sinh lên bảng hoàn thành bài vẽ; gọi học sinh dưới lớp nhận xét độ chính xác và tính thẩm mỹ.',
            studentAction: 'Học sinh đối chiếu bài làm, nhận xét việc chọn bảng giá trị x = 0, 1, 2, 3, 4 đối xứng qua trục x = 2.'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Đánh giá, chấm điểm động viên; lưu ý nét vẽ parabol luôn nhận đỉnh làm điểm uốn cực trị mượt mà, không vẽ gãy khúc.',
            studentAction: 'Tự chỉnh sửa bài làm trong vở nếu có sai sót.'
          }
        ]
      },
      {
        id: 'act-4',
        number: 4,
        name: 'Hoạt động 4: Vận dụng (Mô hình hóa thực tiễn tối ưu)',
        durationMinutes: 6,
        target: 'Học sinh biết vận dụng giá trị lớn nhất/nhỏ nhất của hàm số bậc hai để giải bài toán nông nghiệp: Tìm kích thước mảnh đất chữ nhật có chu vi 100m để diện tích nuôi trồng lớn nhất.',
        content: 'Bài toán: Bác An có 100m dây lưới thép muốn rào một khu đất hình chữ nhật ven sông (bờ sông thẳng không cần rào). Hãy tìm chiều dài và chiều rộng để diện tích rào được là lớn nhất?',
        product: 'Công thức diện tích S(x) = x(100 - 2x) = -2x² + 100x và kết luận: Kích thước tối ưu x = 25m, y = 50m, S_max = 1250 m².',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Chiếu đề bài toán thực tế của Bác An; yêu cầu HS lập biểu thức diện tích theo một ẩn số x (chiều rộng) và giao nhiệm vụ làm việc theo bàn.',
            studentAction: 'Đọc kỹ dữ kiện, vẽ hình phác thảo mảnh đất ven sông 3 cạnh lưới thép.'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Gợi ý: Tổng chiều dài 3 cạnh lưới là 2x + y = 100 => y = 100 - 2x. Diện tích là hàm bậc hai theo x.',
            studentAction: 'Viết biểu thức S(x) = x(100 - 2x) = -2x² + 100x (với 0 < x < 50); tìm hoành độ đỉnh x = -b/2a = -100/(2*(-2)) = 25.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Mời một học sinh nêu kết quả và giải thích ý nghĩa đỉnh parabol là giá trị lớn nhất do hệ số a = -2 < 0.',
            studentAction: 'Trình bày: Chiều rộng rào 25m, chiều dài 50m thì diện tích đạt cực đại 1250 m².'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Khẳng định giá trị thực tiễn to lớn của hàm bậc hai trong kinh tế, kỹ thuật và xây dựng. Giao bài tập về nhà trong SGK.',
            studentAction: 'Ghi nhận bài học, lưu bài tập về nhà vào sổ nhật ký học tập.'
          }
        ]
      }
    ]
  },
  slides: {
    title: 'HÀM SỐ BẬC HAI VÀ ĐỒ THỊ',
    subject: 'Toán học 10',
    grade: 'Chương trình GDPT 2018',
    slides: [
      {
        id: 's-1',
        type: 'title',
        title: 'BÀI 2: HÀM SỐ BẬC HAI VÀ ĐỒ THỊ',
        subtitle: 'Môn: Toán học 10 - Bộ sách Giáo khoa mới',
        bullets: [
          'Giáo viên hướng dẫn: ThS. Nguyễn Văn Toàn',
          'Thời lượng: 2 tiết học',
          'Yêu cầu kỹ năng: Sử dụng máy tính cầm tay & thước vẽ parabol'
        ],
        teacherNotes: 'Chào mừng cả lớp. Nhắc nhở học sinh chuẩn bị đầy đủ compa, thước kẻ và phiếu học tập trên bàn.',
        visualTag: 'Trang Bìa'
      },
      {
        id: 's-2',
        type: 'objectives',
        title: 'MỤC TIÊU BÀI HỌC (CV 5512)',
        subtitle: 'Chuẩn năng lực và phẩm chất cần đạt',
        bullets: [
          'Kiến thức: Thiết lập bảng biến thiên & vẽ chuẩn xác đồ thị y = ax² + bx + c (a ≠ 0).',
          'Kỹ năng: Xác định tọa độ đỉnh I(-b/2a; -Δ/4a), trục đối xứng x = -b/2a.',
          'Năng lực chung: Tự chủ giải quyết vấn đề và hợp tác nhóm hiệu quả.',
          'Vận dụng thực tiễn: Giải bài toán tối ưu diện tích và quỹ đạo chuyển động ném xiên.'
        ],
        teacherNotes: 'Chiếu mục tiêu nhanh trong 1 phút để học sinh định hình rõ đích đến của buổi học.',
        visualTag: 'Mục Tiêu'
      },
      {
        id: 's-3',
        type: 'activity',
        activityIdRef: 'act-1',
        title: 'HOẠT ĐỘNG 1: KHỞI ĐỘNG - KẾT NỐI',
        subtitle: 'Đường cong Parabol trong đời sống và tự nhiên',
        bullets: [
          'Quan sát: Quỹ đạo bóng rổ khi ném vào rổ, vòi phun nước nghệ thuật, dây cáp cầu treo.',
          'Câu hỏi thảo luận (2 phút): Điểm chung về hình dáng của các hiện tượng trên là gì?',
          'Dự đoán: Có thể mô tả các quỹ đạo này bằng biểu thức toán học nào?'
        ],
        teacherNotes: 'Kích hoạt tư duy học sinh bằng hình ảnh trực quan sinh động. Khuyến khích phản xạ nhanh.',
        visualTag: 'Khởi Động'
      },
      {
        id: 's-4',
        type: 'content',
        activityIdRef: 'act-2',
        title: 'HOẠT ĐỘNG 2: ĐẶC TRƯNG HÌNH HỌC ĐỒ THỊ PARABOL',
        subtitle: 'Tọa độ đỉnh và Trục đối xứng',
        bullets: [
          'Đỉnh Parabol: I(-b / 2a ; -Δ / 4a) với Δ = b² - 4ac.',
          'Trục đối xứng: Đường thẳng x = -b / 2a (chia đôi đồ thị thành hai nhánh đối xứng).',
          'Bề lõm Parabol: Quay lên trên khi a > 0 (Đỉnh là điểm thấp nhất).',
          'Bề lõm Parabol: Quay xuống dưới khi a < 0 (Đỉnh là điểm cao nhất).'
        ],
        teacherNotes: 'Nhấn mạnh quy tắc nhớ nhanh: Hoành độ đỉnh là nghiệm kép của đạo hàm hoặc x = -b/(2a).',
        visualTag: 'Kiến Thức Mới'
      },
      {
        id: 's-5',
        type: 'content',
        activityIdRef: 'act-2',
        title: 'QUY TRÌNH 4 BƯỚC VẼ ĐỒ THỊ BẬC HAI',
        subtitle: 'Chuẩn thao tác hình học',
        bullets: [
          'Bước 1: Xác định tọa độ đỉnh I(-b/2a; -Δ/4a).',
          'Bước 2: Vẽ trục đối xứng x = -b/2a bằng nét đứt mỏng.',
          'Bước 3: Lập bảng 5 điểm giá trị đối xứng (gồm đỉnh I, giao điểm với Oy (0; c) và các điểm phụ).',
          'Bước 4: Vẽ đường cong parabol đi qua 5 điểm, uốn cong mượt mà ở đỉnh.'
        ],
        teacherNotes: 'Cảnh báo lỗi vẽ gãy góc nhọn tại đỉnh. Nhắc học sinh uốn cong hình chén trơn tru.',
        visualTag: 'Kỹ Năng Vẽ'
      },
      {
        id: 's-6',
        type: 'quiz',
        activityIdRef: 'act-3',
        title: 'HOẠT ĐỘNG 3: LUYỆN TẬP TƯƠNG TÁC',
        subtitle: 'Khảo sát y = x² - 4x + 3',
        bullets: [
          'Tọa độ đỉnh I: x_I = -(-4)/2 = 2 => y_I = 2² - 4(2) + 3 = -1 => I(2; -1).',
          'Trục đối xứng: x = 2.',
          'Giao với Oy: Điểm A(0; 3) => Điểm đối xứng qua trục là A\'(4; 3).',
          'Giao với Ox: x² - 4x + 3 = 0 <=> x = 1 hoặc x = 3 => Điểm (1; 0) và (3; 0).'
        ],
        teacherNotes: 'Cho học sinh 5 phút làm vào vở, gọi 1 em lên vẽ nhanh trên bảng phụ.',
        visualTag: 'Luyện Tập'
      },
      {
        id: 's-7',
        type: 'summary',
        activityIdRef: 'act-4',
        title: 'HOẠT ĐỘNG 4: VẬN DỤNG VÀ DẶN DÒ',
        subtitle: 'Tối ưu hóa diện tích & Bài tập về nhà',
        bullets: [
          'Thực tiễn: Mô hình hóa diện tích mảnh đất rào thép S(x) = -2x² + 100x đạt cực đại tại x = 25m.',
          'Ghi nhớ: Hàm số bậc hai luôn đạt GTLN/GTNN tại đỉnh x = -b/(2a).',
          'Bài tập về nhà: Bài 1, 2, 4 trang 43 SGK Toán 10 tập 1.',
          'Chuẩn bị bài sau: Dấu của tam thức bậc hai.'
        ],
        teacherNotes: 'Dặn dò HS đọc trước bài mới và hoàn thành bài tập trên ứng dụng học tập số.',
        visualTag: 'Tổng Kết'
      }
    ]
  },
  exam: {
    title: 'ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA HỌC KỲ I - NĂM HỌC 2024 - 2025',
    schoolName: 'TRƯỜNG THPT CHUYÊN QUỐC HỌC',
    subject: 'TOÁN HỌC 10',
    grade: 'Lớp 10',
    durationMinutes: 90,
    semester: 'Giữa Học kỳ 1',
    academicYear: '2024 - 2025',
    matrixRows: [
      {
        id: 'mr-1',
        topic: 'Chương II: Hàm số và Đồ thị',
        contentUnit: 'Hàm số bậc hai và đồ thị (y = ax² + bx + c)',
        partI_nb: 8,
        partI_th: 4,
        partI_vd: 0,
        partII_nb: 1, // 1 câu đúng/sai mức nhận biết/thông hiểu
        partII_th: 1, // 1 câu đúng/sai mức vận dụng
        partII_vd: 0,
        partIII_nb: 2,
        partIII_th: 1,
        partIII_vd: 1,
        partIV_nb: 0,
        partIV_th: 1,
        partIV_vd: 1,
        learningOutcomes: '- Nhận biết: Tọa độ đỉnh, trục đối xứng, chiều bề lõm parabol.\n- Thông hiểu: Lập bảng biến thiên, tìm điều kiện tham số để đồ thị đi qua điểm cho trước.\n- Vận dụng: Giải bài toán tối ưu quỹ đạo ném và bài toán cực trị hình học.'
      }
    ],
    // PHẦN I: Trắc nghiệm nhiều lựa chọn (12 câu x 0.25đ = 3.0 điểm)
    partI: [
      {
        id: 'q1-1',
        questionNumber: 1,
        topic: 'Hàm số bậc hai',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Tọa độ đỉnh I của parabol (P): y = 2x² - 4x + 1 là:',
        options: {
          A: 'I(1; -1)',
          B: 'I(-1; 7)',
          C: 'I(2; 1)',
          D: 'I(1; 1)'
        },
        correctAnswer: 'A',
        explanation: 'x_I = -b/(2a) = -(-4)/(2*2) = 1. Thay x = 1 vào hàm số: y_I = 2(1)² - 4(1) + 1 = -1. Vậy I(1; -1).'
      },
      {
        id: 'q1-2',
        questionNumber: 2,
        topic: 'Hàm số bậc hai',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Trục đối xứng của parabol (P): y = -x² + 6x - 5 là đường thẳng có phương trình:',
        options: {
          A: 'x = -3',
          B: 'x = 3',
          C: 'y = 3',
          D: 'x = 6'
        },
        correctAnswer: 'B',
        explanation: 'Trục đối xứng x = -b/(2a) = -6 / (2*(-1)) = 3.'
      },
      {
        id: 'q1-3',
        questionNumber: 3,
        topic: 'Hàm số bậc hai',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Cho hàm số y = ax² + bx + c có đồ thị với bề lõm quay lên trên. Khẳng định nào sau đây là đúng?',
        options: {
          A: 'a < 0',
          B: 'a > 0',
          C: 'c > 0',
          D: 'b < 0'
        },
        correctAnswer: 'B',
        explanation: 'Đồ thị parabol có bề lõm quay lên trên khi và chỉ khi hệ số a > 0.'
      },
      {
        id: 'q1-4',
        questionNumber: 4,
        topic: 'Hàm số bậc hai',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Điểm nào sau đây thuộc đồ thị hàm số y = 3x² - 2x + 1?',
        options: {
          A: 'M(1; 2)',
          B: 'N(0; 2)',
          C: 'P(-1; 0)',
          D: 'Q(2; 5)'
        },
        correctAnswer: 'A',
        explanation: 'Với x = 1: y = 3(1)² - 2(1) + 1 = 2 => Điểm M(1; 2) thuộc đồ thị.'
      },
      {
        id: 'q1-5',
        questionNumber: 5,
        topic: 'Hàm số bậc hai',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Giao điểm của parabol (P): y = x² - 3x + 2 với trục tung Oy là điểm:',
        options: {
          A: '(1; 0)',
          B: '(2; 0)',
          C: '(0; 2)',
          D: '(0; -2)'
        },
        correctAnswer: 'C',
        explanation: 'Cho x = 0 => y = 2. Giao điểm với Oy là (0; 2).'
      },
      {
        id: 'q1-6',
        questionNumber: 6,
        topic: 'Hàm số bậc hai',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Khoảng đồng biến của hàm số y = x² - 4x + 5 là:',
        options: {
          A: '(-∞; 2)',
          B: '(2; +∞)',
          C: '(-∞; -2)',
          D: '(-2; +∞)'
        },
        correctAnswer: 'B',
        explanation: 'Do a = 1 > 0 và x_đỉnh = 2, hàm số nghịch biến trên (-∞; 2) và đồng biến trên (2; +∞).'
      },
      {
        id: 'q1-7',
        questionNumber: 7,
        topic: 'Hàm số bậc hai',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Bảng biến thiên có mũi tên đi lên tới đỉnh (1; 4) rồi đi xuống tới -∞ là của hàm số có hệ số a thỏa mãn:',
        options: {
          A: 'a > 0',
          B: 'a < 0',
          C: 'a = 0',
          D: 'a tùy ý'
        },
        correctAnswer: 'B',
        explanation: 'Hàm số đạt giá trị lớn nhất tại đỉnh khi bề lõm quay xuống dưới, tương ứng a < 0.'
      },
      {
        id: 'q1-8',
        questionNumber: 8,
        topic: 'Hàm số bậc hai',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Giá trị nhỏ nhất của hàm số y = x² - 6x + 10 trên tập số thực R bằng:',
        options: {
          A: '1',
          B: '3',
          C: '10',
          D: '-1'
        },
        correctAnswer: 'A',
        explanation: 'y = (x - 3)² + 1 ≥ 1 với mọi x. GTNN là 1 khi x = 3.'
      },
      {
        id: 'q1-9',
        questionNumber: 9,
        topic: 'Hàm số bậc hai',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Biết parabol y = ax² + bx + 2 đi qua hai điểm A(1; 5) và B(-1; 3). Giá trị của a + b là:',
        options: {
          A: '3',
          B: '1',
          C: '4',
          D: '2'
        },
        correctAnswer: 'A',
        explanation: 'Thay A(1; 5): a + b + 2 = 5 => a + b = 3.'
      },
      {
        id: 'q1-10',
        questionNumber: 10,
        topic: 'Hàm số bậc hai',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Cho hàm số y = -x² + 2(m - 1)x + 3. Trục đối xứng của parabol là x = 2 khi m nhận giá trị:',
        options: {
          A: 'm = 3',
          B: 'm = 1',
          C: 'm = -1',
          D: 'm = 2'
        },
        correctAnswer: 'A',
        explanation: 'Trục đối xứng x = -b/(2a) = -2(m - 1) / (-2) = m - 1. Ta có m - 1 = 2 => m = 3.'
      },
      {
        id: 'q1-11',
        questionNumber: 11,
        topic: 'Hàm số bậc hai',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Cho parabol (P): y = ax² + bx + c có đỉnh I(2; -1) và cắt trục hoành tại điểm có hoành độ x = 1. Giá trị c bằng:',
        options: {
          A: '3',
          B: '-3',
          C: '1',
          D: '-1'
        },
        correctAnswer: 'A',
        explanation: '(P) có dạng y = a(x - 2)² - 1. Đi qua (1; 0) => a(1 - 2)² - 1 = 0 => a = 1. Khi đó y = (x - 2)² - 1 = x² - 4x + 3 => c = 3.'
      },
      {
        id: 'q1-12',
        questionNumber: 12,
        topic: 'Hàm số bậc hai',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Tập hợp tất cả các giá trị của tham số m để đồ thị hàm số y = x² - 2x + m cắt trục hoành tại hai điểm phân biệt là:',
        options: {
          A: 'm < 1',
          B: 'm > 1',
          C: 'm ≤ 1',
          D: 'm ≥ 1'
        },
        correctAnswer: 'A',
        explanation: 'Phương trình hoành độ giao điểm x² - 2x + m = 0 có 2 nghiệm phân biệt khi Δ\' = 1 - m > 0 <=> m < 1.'
      }
    ],

    // PHẦN II: Trắc nghiệm Đúng / Sai (Mỗi câu gồm 4 lệnh a-b-c-d chuẩn CV 7991, 2 câu x 1.0đ = 2.0 điểm)
    partII: [
      {
        id: 'q2-1',
        questionNumber: 1,
        topic: 'Hàm số bậc hai',
        level: 'thong_hieu',
        maxPoints: 1.0,
        contextText: 'Cho parabol (P) có phương trình y = f(x) = x² - 4x + 3. Xét tính Đúng / Sai của các khẳng định sau:',
        statements: [
          {
            subId: 'a',
            text: 'Tọa độ đỉnh của parabol (P) là I(2; -1).',
            isCorrect: true
          },
          {
            subId: 'b',
            text: 'Parabol (P) có trục đối xứng là đường thẳng y = 2.',
            isCorrect: false
          },
          {
            subId: 'c',
            text: 'Hàm số đồng biến trên khoảng (2; +∞) và nghịch biến trên khoảng (-∞; 2).',
            isCorrect: true
          },
          {
            subId: 'd',
            text: 'Đồ thị (P) cắt trục hoành Ox tại hai điểm phân biệt có tọa độ là A(1; 0) và B(3; 0).',
            isCorrect: true
          }
        ],
        explanation: 'Lệnh a: Đúng (I(2; -1)). Lệnh b: Sai vì trục đối xứng là x = 2 (không phải y = 2). Lệnh c: Đúng vì a = 1 > 0. Lệnh d: Đúng vì nghiệm của x² - 4x + 3 = 0 là x = 1 và x = 3.'
      },
      {
        id: 'q2-2',
        questionNumber: 2,
        topic: 'Mô hình hóa thực tế',
        level: 'van_dung',
        maxPoints: 1.0,
        contextText: 'Một quả bóng được sút lên từ độ cao h₀ = 1 mét so với mặt đất. Độ cao h (mét) của quả bóng sau t giây được tính theo công thức: h(t) = -5t² + 20t + 1 (với t ≥ 0). Xét tính Đúng / Sai của các nhận định sau:',
        statements: [
          {
            subId: 'a',
            text: 'Sau 1 giây kể từ khi sút, quả bóng đạt độ cao là 16 mét so với mặt đất.',
            isCorrect: true
          },
          {
            subId: 'b',
            text: 'Quả bóng đạt độ cao lớn nhất sau 2 giây kể từ khi sút.',
            isCorrect: true
          },
          {
            subId: 'c',
            text: 'Độ cao lớn nhất mà quả bóng có thể đạt được là 20 mét.',
            isCorrect: false
          },
          {
            subId: 'd',
            text: 'Trong khoảng thời gian từ t = 0 đến t = 2 giây, bóng chuyển động đi lên; sau t = 2 giây bóng bắt đầu rơi xuống.',
            isCorrect: true
          }
        ],
        explanation: 'Lệnh a: Đúng vì h(1) = -5(1) + 20(1) + 1 = 16m. Lệnh b: Đúng vì đỉnh t = -b/(2a) = -20/(-10) = 2s. Lệnh c: Sai vì h_max = h(2) = -5(4) + 40 + 1 = 21m (không phải 20m). Lệnh d: Đúng theo tính đơn điệu của hàm số.'
      }
    ],

    // PHẦN III: Trắc nghiệm Trả lời ngắn (4 câu x 0.5đ = 2.0 điểm)
    partIII: [
      {
        id: 'q3-1',
        questionNumber: 1,
        topic: 'Hàm số bậc hai',
        level: 'nhan_biet',
        points: 0.5,
        content: 'Biết đỉnh của parabol y = x² - 6x + c nằm trên trục hoành. Tìm giá trị của hằng số c.',
        correctShortAnswer: '9',
        explanation: 'Đỉnh nằm trên trục hoành <=> Δ = b² - 4ac = 0 <=> 36 - 4c = 0 <=> c = 9.'
      },
      {
        id: 'q3-2',
        questionNumber: 2,
        topic: 'Hàm số bậc hai',
        level: 'nhan_biet',
        points: 0.5,
        content: 'Tìm hoành độ đỉnh x_I của parabol y = -3x² + 12x - 7.',
        correctShortAnswer: '2',
        explanation: 'x_I = -b/(2a) = -12 / (2 * (-3)) = 2.'
      },
      {
        id: 'q3-3',
        questionNumber: 3,
        topic: 'Hàm số bậc hai',
        level: 'thong_hieu',
        points: 0.5,
        content: 'Cho hàm số f(x) = x² - 2x + 3. Tìm giá trị nhỏ nhất của hàm số trên đoạn [2; 5].',
        correctShortAnswer: '3',
        explanation: 'Hàm số đồng biến trên [1; +∞), do đó trên [2; 5] hàm số đồng biến. GTNN đạt tại x = 2: f(2) = 2² - 4 + 3 = 3.'
      },
      {
        id: 'q3-4',
        questionNumber: 4,
        topic: 'Mô hình bài toán tối ưu',
        level: 'van_dung',
        points: 0.5,
        content: 'Bác An rào một mảnh vườn hình chữ nhật có một cạnh dựa vào tường nhà có sẵn. Tổng chiều dài 3 cạnh lưới thép rào là 40 mét. Diện tích lớn nhất (tính bằng m²) mà bác An có thể rào được là bao nhiêu?',
        correctShortAnswer: '200',
        unit: 'm²',
        explanation: 'Gọi chiều rộng hai bên là x (m) => chiều dài cạnh đối diện tường là 40 - 2x. Diện tích S(x) = x(40 - 2x) = -2x² + 40x. Đỉnh tại x = 10 => S_max = 10 * 20 = 200 m².'
      }
    ],

    // PHẦN IV: Tự luận (2 câu x 1.5đ = 3.0 điểm)
    partIV: [
      {
        id: 'q4-1',
        questionNumber: 1,
        topic: 'Khảo sát và vẽ đồ thị parabol',
        level: 'thong_hieu',
        totalPoints: 1.5,
        content: 'Cho parabol (P): y = -x² + 2x + 3.\na) Lập bảng biến thiên và vẽ đồ thị (P) trên mặt phẳng tọa độ Oxy.\nb) Tìm tất cả các giá trị của tham số m để đường thẳng d: y = m cắt parabol (P) tại hai điểm phân biệt có hoành độ dương.',
        subQuestions: [
          {
            label: 'Ý a (1.0 điểm)',
            text: 'Lập bảng biến thiên và vẽ chuẩn xác đồ thị (P).',
            points: 1.0
          },
          {
            label: 'Ý b (0.5 điểm)',
            text: 'Biện luận số nghiệm dương của phương trình hoành độ giao điểm.',
            points: 0.5
          }
        ],
        modelAnswer: `HƯỚNG DẪN CHẤM Ý a (1.0đ):
- Tọa độ đỉnh I(1; 4), trục đối xứng x = 1 (0.25đ)
- Bảng biến thiên: Hàm số đồng biến trên (-∞; 1), nghịch biến trên (1; +∞), cực đại y = 4 (0.25đ)
- Điểm đặc biệt: Cắt Oy tại (0; 3); cắt Ox tại (-1; 0) và (3; 0) (0.25đ)
- Vẽ đồ thị parabol trơn đều, chính xác (0.25đ)

HƯỚNG DẪN CHẤM Ý b (0.5đ):
- Phương trình hoành độ giao điểm: -x² + 2x + 3 = m <=> x² - 2x + (m - 3) = 0 (*)
- Để d cắt (P) tại hai điểm phân biệt có hoành độ dương thì (*) phải có 2 nghiệm phân biệt dương:
  + Δ' = 1 - (m - 3) = 4 - m > 0 <=> m < 4 (0.25đ)
  + S = 2 > 0 (luôn đúng)
  + P = m - 3 > 0 <=> m > 3 (0.25đ)
- Kết luận: 3 < m < 4.`
      },
      {
        id: 'q4-2',
        questionNumber: 2,
        topic: 'Bài toán mô hình hóa thực tiễn',
        level: 'van_dung',
        totalPoints: 1.5,
        content: 'Một chiếc cổng hình parabol có chiều rộng hai chân cổng d = AB = 8 mét và chiều cao tính từ điểm cao nhất của cổng xuống mặt đất là h = 6 mét.\na) Chọn hệ trục tọa độ Oxy thích hợp và viết phương trình parabol mô tả chiếc cổng đó.\nb) Một xe tải chở hàng hình hộp chữ nhật có chiều rộng 4 mét và chiều cao 4.2 mét muốn đi qua cổng. Hỏi xe tải đó có thể đi lọt qua cổng mà không bị chạm vào vòm cổng không? Vì sao?',
        subQuestions: [
          {
            label: 'Ý a (0.75 điểm)',
            text: 'Thiết lập hệ tọa độ và xác định phương trình parabol.',
            points: 0.75
          },
          {
            label: 'Ý b (0.75 điểm)',
            text: 'Kiểm tra điều kiện chiều cao để xe đi lọt qua cổng an toàn.',
            points: 0.75
          }
        ],
        modelAnswer: `HƯỚNG DẪN CHẤM Ý a (0.75đ):
- Chọn hệ trục tọa độ Oxy sao cho gốc O là trung điểm chân cổng AB, trục Oy thẳng đứng hướng lên.
- Chân cổng A(-4; 0), B(4; 0). Đỉnh cổng I(0; 6) (0.25đ)
- Phương trình parabol có dạng y = ax² + 6 (do đỉnh nằm trên trục tung).
- Parabol đi qua B(4; 0) nên: a(4)² + 6 = 0 <=> 16a = -6 <=> a = -3/8 (0.25đ)
- Vậy phương trình parabol của cổng là: y = -3/8 x² + 6 (0.25đ)

HƯỚNG DẪN CHẤM Ý b (0.75đ):
- Xe tải rộng 4m, khi xe đi chính giữa cổng thì mỗi bên cách trục tung x = 2m và x = -2m (0.25đ)
- Độ cao của vòm cổng tại vị trí mép xe (x = 2m) là:
  y = -3/8 * (2)² + 6 = -3/8 * 4 + 6 = -1.5 + 6 = 4.5 mét (0.25đ)
- So sánh: Chiều cao xe tải là 4.2m < 4.5m (chiều cao vòm cổng tại mép).
  Do đó, xe tải hoàn toàn đi lọt qua cổng an toàn (còn cách vòm cổng khoảng 0.3m) (0.25đ).`
      }
    ]
  }
};

export const sampleHistory11State: HarnessEdState = {
  version: '2025.1-CV7991',
  lastUpdated: '2025-02-28T10:30:00Z',
  meta: {
    curriculumFramework: 'GDPT_2018',
    khbdLegalRef: '5512/BGDĐT-GDTrH',
    examLegalRef: '7991/BGDĐT-GDTrH',
    totalPointsTarget: 10.0,
    cognitiveRatio: '40% Nhận biết - 30% Thông hiểu - 30% Vận dụng',
  },
  khbd: {
    schoolName: 'TRƯỜNG THPT LÊ HỒNG PHONG',
    departmentName: 'TỔ LỊCH SỬ - ĐỊA LÍ',
    teacherName: 'Thầy Lê Hoàng Nam',
    subject: 'Lịch sử',
    grade: 'Lớp 11',
    textbookSeries: 'Kết Nối Tri Thức',
    lessonTitle: 'CÁCH MẠNG CÔNG NGHIỆP THỜI CẬN ĐẠI',
    durationPeriods: 2,
    knowledgeObjectives: [
      'Trình bày được những thành tựu cơ bản của Cách mạng công nghiệp lần thứ nhất (động cơ hơi nước James Watt, máy kéo sợi Jenny) và lần thứ hai (điện lực, động cơ đốt trong).',
      'Phân tích được tác động to lớn về mặt kinh tế, xã hội và văn hóa của các cuộc cách mạng công nghiệp đối với nhân loại.',
      'Rút ra bài học lịch sử cho Việt Nam trong bối cảnh công nghiệp hóa, hiện đại hóa và hội nhập quốc tế hiện nay.'
    ],
    generalCompetencies: [
      'Tự chủ và tự học: Tìm kiếm tư liệu hình ảnh và video lịch sử về động cơ hơi nước của James Watt trên Internet.',
      'Giao tiếp và hợp tác: Tranh biện nhóm về tác động tích cực và mặt trái của đô thị hóa thời kỳ cách mạng công nghiệp.'
    ],
    specificCompetencies: [
      'Tìm hiểu lịch sử: Khai thác lược đồ công nghiệp nước Anh thế kỷ XVIII và tranh cổ động lịch sử.',
      'Vận dụng bài học lịch sử: Liên hệ với cuộc Cách mạng công nghiệp 4.0 hiện nay của Việt Nam.'
    ],
    qualities: [
      'Yêu nước và trách nhiệm: Nhận thức rõ vai trò của tri thức khoa học - công nghệ trong việc bảo vệ và phát triển đất nước.',
      'Chăm chỉ: Đọc kỹ tài liệu chuyên khảo lịch sử.'
    ],
    teacherSupplies: 'Bản đồ kinh tế nước Anh thế kỷ XVIII, video tư liệu về máy hơi nước James Watt, phiếu học tập số 1, 2.',
    studentSupplies: 'SGK Lịch sử 11, sơ đồ tư duy tóm tắt bài học.',
    activities: [
      {
        id: 'act-hist-1',
        number: 1,
        name: 'Hoạt động 1: Mở đầu / Khởi động (Hình ảnh trước và sau công nghiệp)',
        durationMinutes: 6,
        target: 'Tạo cảm xúc lịch sử qua so sánh hình ảnh người thợ dệt thủ công và nhà máy dệt chạy bằng hơi nước khổng lồ tại Anh thế kỷ XVIII.',
        content: 'Quan sát 2 bức tranh tương phản: Cảnh kéo sợi bằng xa gỗ thủ công tại gia đình và Xưởng dệt cơ khí chạy bằng máy hơi nước. Thảo luận điều gì đã làm thay đổi hoàn toàn năng suất sản xuất?',
        product: 'Học sinh phát hiện: Sự xuất hiện của máy móc và động cơ nhiệt đã thay thế sức lao động thủ công của con người.',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Chiếu 2 tranh lịch sử; nêu câu hỏi gợi mở cho cả lớp trong 2 phút.',
            studentAction: 'Quan sát tranh, đối chiếu tư liệu và trao đổi với bạn bên cạnh.'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Khuyến khích học sinh chú ý vào chi tiết ống khói, bánh răng và số lượng công nhân.',
            studentAction: 'Phát hiện sự cơ giới hóa và tập trung sản xuất công xưởng.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Mời đại diện 2 học sinh phát biểu nhận định.',
            studentAction: 'Báo cáo: Nhờ có máy móc, đặc biệt là máy hơi nước, năng suất đã tăng vọt gấp hàng trăm lần.'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Dẫn dắt: Đó chính là cuộc Cách mạng công nghiệp lần thứ nhất khởi đầu tại nước Anh.',
            studentAction: 'Ghi tựa bài vào vở.'
          }
        ]
      },
      {
        id: 'act-hist-2',
        number: 2,
        name: 'Hoạt động 2: Hình thành kiến thức mới (Những phát minh tiêu biểu)',
        durationMinutes: 20,
        target: 'Lập niên biểu và phân tích các phát minh then chốt của Cách mạng công nghiệp lần 1 và lần 2.',
        content: 'Nghiên cứu mục 1 và 2 trong SGK, hoàn thành bảng so sánh: Thời gian khởi đầu, Nơi bắt đầu, Động lực then chốt, Phát minh tiêu biểu của CMCN lần 1 và lần 2.',
        product: 'Bảng phụ hoàn chỉnh của 4 nhóm học sinh.',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Chia lớp làm 4 nhóm, phát phiếu nhiệm vụ hoàn thành bảng so sánh.',
            studentAction: 'Nhận phiếu và chia nhiệm vụ đọc SGK.'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Quan sát, đôn đốc nhóm hoàn thành các mốc: Máy kéo sợi Jenny (1764), Máy hơi nước (1784), Điện năng và Động cơ đốt trong (cuối XIX).',
            studentAction: 'Thảo luận và điền thông tin vào phiếu học tập.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Tổ chức cho các nhóm dán sản phẩm lên tường, đi một vòng xem chéo (kỹ thuật phòng tranh).',
            studentAction: 'Các nhóm dùng bút màu chấm điểm nhận xét sản phẩm của nhóm bạn.'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Chốt lại kiến thức chuẩn: Máy hơi nước của James Watt mở ra kỷ nguyên cơ giới hóa; Điện lực và dầu mỏ mở ra kỷ nguyên tự động hóa sơ khai.',
            studentAction: 'Ghi bảng tổng hợp vào vở.'
          }
        ]
      },
      {
        id: 'act-hist-3',
        number: 3,
        name: 'Hoạt động 3: Luyện tập (Sơ đồ tác động kinh tế - xã hội)',
        durationMinutes: 12,
        target: 'Khái quát hóa tác động sâu sắc của CMCN: Về kinh tế (chuyển từ nông nghiệp sang công nghiệp), về xã hội (hình thành 2 giai cấp tư sản và vô sản).',
        content: 'Vẽ sơ đồ tư duy thể hiện hai mặt tích cực và tiêu cực của Cách mạng công nghiệp thời cận đại.',
        product: 'Sơ đồ tư duy trên giấy A3 của đại diện học sinh.',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Giao nhiệm vụ: Mỗi dãy bàn vẽ sơ đồ nhánh tác động của CMCN.',
            studentAction: 'Phác thảo các nhánh chính: Kinh tế, Xã hội, Đô thị hóa, Môi trường.'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Gợi ý từ khóa: Giai cấp công nhân, Ô nhiễm khói bụi, Xuất khẩu hàng hóa.',
            studentAction: 'Trang trí và điền luận điểm.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Gọi 1 học sinh thuyết trình ngắn trong 2 phút.',
            studentAction: 'Thuyết minh: Bên cạnh việc thúc đẩy kinh tế phát triển thần kỳ, CMCN cũng tạo ra khoảng cách giàu nghèo và ô nhiễm môi trường công nghiệp.'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Nhấn mạnh sự ra đời của phong trào công nhân quốc tế và chủ nghĩa Mác xuất phát từ thực tiễn này.',
            studentAction: 'Ghi nhận và hoàn thiện sơ đồ.'
          }
        ]
      },
      {
        id: 'act-hist-4',
        number: 4,
        name: 'Hoạt động 4: Vận dụng (Liên hệ Việt Nam và CMCN 4.0)',
        durationMinutes: 7,
        target: 'Giúp học sinh liên hệ bài học lịch sử với chiến lược công nghiệp hóa và chuyển đổi số của Việt Nam hiện nay.',
        content: 'Câu hỏi: Cuộc Cách mạng công nghiệp 4.0 ngày nay đem lại cơ hội và thách thức gì cho thanh niên Việt Nam trong kỷ nguyên vươn mình của dân tộc?',
        product: 'Bài viết thu hoạch ngắn 10 dòng của cá nhân học sinh.',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Nêu câu hỏi suy ngẫm thực tế về kỷ nguyên số, AI và tự động hóa tại Việt Nam.',
            studentAction: 'Lắng nghe và độc lập suy nghĩ.'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Gợi ý: Cơ hội tiếp cận tri thức toàn cầu, thách thức nguy cơ bị máy móc thay thế việc làm lặp lại.',
            studentAction: 'Ghi lại các ý tưởng vào sổ tay học tập.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Mời 2 học sinh chia sẻ nguyện vọng nghề nghiệp tương lai.',
            studentAction: 'Chia sẻ: Cần trang bị kỹ năng công nghệ số, tư duy phản biện và khả năng học tập suốt đời.'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Khích lệ tinh thần đổi mới sáng tạo và dặn dò học sinh chuẩn bị bài học tiếp theo.',
            studentAction: 'Đồng thuận và hoàn thành bài tập.'
          }
        ]
      }
    ]
  },
  slides: {
    title: 'CÁCH MẠNG CÔNG NGHIỆP THỜI CẬN ĐẠI',
    subject: 'Lịch sử 11',
    grade: 'Lớp 11 - GDPT 2018',
    slides: [
      {
        id: 'sh-1',
        type: 'title',
        title: 'BÀI 5: CÁCH MẠNG CÔNG NGHIỆP THỜI CẬN ĐẠI',
        subtitle: 'Lịch sử 11 - Chương trình GDPT 2018',
        bullets: [
          'Giáo viên: Thầy Lê Hoàng Nam',
          'Thời lượng: 2 tiết học',
          'Chủ đề: Bước ngoặt phát triển văn minh nhân loại'
        ],
        teacherNotes: 'Chiếu video khởi động 1 phút về cỗ máy hơi nước.',
        visualTag: 'Trang Bìa'
      },
      {
        id: 'sh-2',
        type: 'content',
        title: 'CÁCH MẠNG CÔNG NGHIỆP LẦN THỨ NHẤT',
        subtitle: 'Nửa sau thế kỷ XVIII - Giữa thế kỷ XIX',
        bullets: [
          'Khởi đầu: Nước Anh trong ngành công nghiệp dệt sợi bông.',
          '1764: Giêm Ha-gri-vơ phát minh ra máy kéo sợi Gien-ni.',
          '1784: Giêm Oát (James Watt) hoàn thiện máy hơi nước (Động lực vạn năng).',
          'Tàu hỏa chạy bằng hơi nước (1814) và tàu thủy hơi nước (1807) ra đời.'
        ],
        teacherNotes: 'Nhấn mạnh vai trò của than đá và máy hơi nước.',
        visualTag: 'Phát Minh'
      },
      {
        id: 'sh-3',
        type: 'content',
        title: 'CÁCH MẠNG CÔNG NGHIỆP LẦN THỨ HAI',
        subtitle: 'Cuối thế kỷ XIX - Đầu thế kỷ XX',
        bullets: [
          'Không gian: Diễn ra mạnh mẽ tại Mỹ, Đức, Anh, Pháp.',
          'Nguồn năng lượng mới: Điện lực, Dầu mỏ và Khí đốt.',
          'Động lực then chốt: Động cơ đốt trong và Lưới điện chiếu sáng.',
          'Giao thông: Xe ô tô chạy xăng và Máy bay (anh em nhà Wright).'
        ],
        teacherNotes: 'So sánh tính vượt trội so với lần thứ nhất.',
        visualTag: 'Bước Ngoặt'
      },
      {
        id: 'sh-4',
        type: 'summary',
        title: 'TÁC ĐỘNG VÀ BÀI HỌC LỊCH SỬ',
        subtitle: 'Kinh tế, Xã hội và Văn hóa',
        bullets: [
          'Kinh tế: Chuyển hẳn từ nền kinh tế nông nghiệp sang đại công nghiệp cơ khí.',
          'Xã hội: Hình thành hai giai cấp cơ bản: Tư sản công nghiệp và Vô sản công nghiệp.',
          'Đô thị hóa: Bùng nổ các đô thị lớn tại Luân Đôn, Pa-ri, Niu Oóc.',
          'Bài học: Coi trọng giáo dục, đổi mới sáng tạo và bảo vệ môi trường sinh thái.'
        ],
        teacherNotes: 'Liên hệ thực tiễn Việt Nam thời đại 4.0.',
        visualTag: 'Tổng Kết'
      }
    ]
  },
  exam: {
    title: 'ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA KỲ I - LỊCH SỬ 11',
    schoolName: 'TRƯỜNG THPT LÊ HỒNG PHONG',
    subject: 'LỊCH SỬ 11',
    grade: 'Lớp 11',
    durationMinutes: 45,
    semester: 'Giữa Học kỳ 1',
    academicYear: '2024 - 2025',
    matrixRows: [
      {
        id: 'mr-ls11',
        topic: 'Chủ đề 2: Cách mạng công nghiệp thời cận đại',
        contentUnit: 'Cách mạng công nghiệp lần thứ nhất và lần thứ hai',
        partI_nb: 8,
        partI_th: 4,
        partI_vd: 0,
        partII_nb: 1,
        partII_th: 1,
        partII_vd: 0,
        partIII_nb: 2,
        partIII_th: 1,
        partIII_vd: 1,
        partIV_nb: 0,
        partIV_th: 1,
        partIV_vd: 1,
        learningOutcomes: '- Nhận biết: Nêu các mốc phát minh máy hơi nước, máy kéo sợi, động cơ đốt trong.\n- Thông hiểu: Phân tích nguyên nhân nước Anh khởi đầu CMCN và tác động tới cơ cấu xã hội.\n- Vận dụng: Đánh giá thời cơ và thách thức đối với các nước đang phát triển trong cuộc CMCN.'
      }
    ],
    partI: [
      {
        id: 'q1-ls1',
        questionNumber: 1,
        topic: 'Cách mạng công nghiệp',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Cuộc Cách mạng công nghiệp lần thứ nhất (nửa sau thế kỷ XVIII) khởi đầu từ quốc gia nào?',
        options: {
          A: 'Nước Pháp',
          B: 'Nước Anh',
          C: 'Nước Đức',
          D: 'Hợp chúng quốc Hoa Kỳ'
        },
        correctAnswer: 'B',
        explanation: 'Cách mạng công nghiệp lần thứ nhất bắt đầu đầu tiên ở nước Anh từ những năm 60 của thế kỷ XVIII.'
      },
      {
        id: 'q1-ls2',
        questionNumber: 2,
        topic: 'Cách mạng công nghiệp',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Ngành kinh tế nào là điểm xuất phát đầu tiên của cuộc Cách mạng công nghiệp ở Anh?',
        options: {
          A: 'Ngành dệt sợi',
          B: 'Ngành luyện kim',
          C: 'Ngành đóng tàu',
          D: 'Ngành khai thác than'
        },
        correctAnswer: 'A',
        explanation: 'Công nghiệp dệt (nhẹ) cần ít vốn, thu hồi nhanh và nhu cầu lớn nên khởi đầu trước.'
      },
      {
        id: 'q1-ls3',
        questionNumber: 3,
        topic: 'Cách mạng công nghiệp',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Năm 1784, ai là người đã phát minh ra máy hơi nước hoàn chỉnh, tạo ra động lực thúc đẩy sản xuất?',
        options: {
          A: 'Giêm Ha-gri-vơ',
          B: 'Giêm Oát (James Watt)',
          C: 'Tô-mát Ê-đi-xơn',
          D: 'Hen-ri Pho'
        },
        correctAnswer: 'B',
        explanation: 'James Watt sáng chế ra máy hơi nước hoàn chỉnh vào năm 1784.'
      },
      {
        id: 'q1-ls4',
        questionNumber: 4,
        topic: 'Cách mạng công nghiệp',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Nguồn năng lượng chủ đạo trong cuộc Cách mạng công nghiệp lần thứ hai là:',
        options: {
          A: 'Sức nước và sức gió',
          B: 'Năng lượng mặt trời',
          C: 'Điện năng và dầu mỏ',
          D: 'Năng lượng hạt nhân'
        },
        correctAnswer: 'C',
        explanation: 'CMCN lần thứ hai gắn liền với việc ứng dụng điện năng và động cơ đốt trong dùng dầu mỏ.'
      },
      {
        id: 'q1-ls5',
        questionNumber: 5,
        topic: 'Cách mạng công nghiệp',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Hai giai cấp cơ bản được hình thành trong xã hội tư bản sau Cách mạng công nghiệp là:',
        options: {
          A: 'Tư sản và Vô sản',
          B: 'Địa chủ và Nông dân',
          C: 'Chủ nô và Nô lệ',
          D: 'Quý tộc và Nông nô'
        },
        correctAnswer: 'A',
        explanation: 'Cơ cấu xã hội tư bản phân hóa thành hai giai cấp cơ bản: tư sản và vô sản công nghiệp.'
      },
      {
        id: 'q1-ls6',
        questionNumber: 6,
        topic: 'Cách mạng công nghiệp',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Phát minh nào mở đầu cho sự phát triển của ngành hàng không thế giới vào đầu thế kỷ XX?',
        options: {
          A: 'Tàu hỏa chạy bằng hơi nước',
          B: 'Máy bay của anh em nhà Wright (Rai)',
          C: 'Khinh khí cầu vũ trụ',
          D: 'Tàu điện ngầm London'
        },
        correctAnswer: 'B',
        explanation: 'Năm 1903, anh em nhà Wright (Mỹ) thử nghiệm thành công chuyến bay đầu tiên có người lái.'
      },
      {
        id: 'q1-ls7',
        questionNumber: 7,
        topic: 'Cách mạng công nghiệp',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Động cơ đốt trong ra đời trong cuộc Cách mạng công nghiệp lần thứ hai đã tạo tiền đề cho sự phát triển của ngành công nghiệp:',
        options: {
          A: 'Ô tô và xe máy',
          B: 'Dệt sợi bông',
          C: 'Thủ công mỹ nghệ',
          D: 'Gốm sứ tráng men'
        },
        correctAnswer: 'A',
        explanation: 'Động cơ đốt trong chạy xăng/dầu thúc đẩy ngành ô tô, máy bay phát triển mạnh mẽ.'
      },
      {
        id: 'q1-ls8',
        questionNumber: 8,
        topic: 'Cách mạng công nghiệp',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Phương pháp sản xuất dây chuyền lắp ráp hàng loạt được áp dụng nổi tiếng đầu tiên trong nhà máy của ai?',
        options: {
          A: 'Henry Ford (Pho)',
          B: 'John D. Rockefeller',
          C: 'Andrew Carnegie',
          D: 'Alexander Bell'
        },
        correctAnswer: 'A',
        explanation: 'Henry Ford là người tiên phong ứng dụng dây chuyền sản xuất lắp ráp ô tô hàng loạt tại Mỹ.'
      },
      {
        id: 'q1-ls9',
        questionNumber: 9,
        topic: 'Cách mạng công nghiệp',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Tại sao việc phát minh ra máy hơi nước lại được coi là bước ngoặt quyết định của Cách mạng công nghiệp lần 1?',
        options: {
          A: 'Vì máy hơi nước không tiêu hao bất kỳ nguồn nhiên liệu nào',
          B: 'Vì máy hơi nước tạo ra nguồn động lực vạn năng, giúp nhà máy thoát khỏi sự phụ thuộc vào nguồn nước chảy tự nhiên',
          C: 'Vì máy hơi nước hoàn toàn tự động hóa không cần con người vận hành',
          D: 'Vì nó chấm dứt hoàn toàn sự tồn tại của lao động chân tay'
        },
        correctAnswer: 'B',
        explanation: 'Trước đó nhà máy phải đặt ven sông để dùng guồng nước. Máy hơi nước cho phép xây dựng nhà máy ở bất kỳ đâu.'
      },
      {
        id: 'q1-ls10',
        questionNumber: 10,
        topic: 'Cách mạng công nghiệp',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Một trong những hệ quả tiêu cực lớn nhất của quá trình công nghiệp hóa và đô thị hóa thời cận đại là:',
        options: {
          A: 'Làm giảm năng suất lao động xã hội',
          B: 'Ô nhiễm môi trường sống và phân hóa giàu nghèo sâu sắc',
          C: 'Thu hẹp thương mại buôn bán giữa các quốc gia',
          D: 'Xóa bỏ hoàn toàn văn hóa truyền thống'
        },
        correctAnswer: 'B',
        explanation: 'Công nghiệp hóa sớm gây khói bụi ô nhiễm nghiêm trọng và đời sống giai cấp vô sản bị bóc lột nặng nề.'
      },
      {
        id: 'q1-ls11',
        questionNumber: 11,
        topic: 'Cách mạng công nghiệp',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Điểm khác biệt căn bản giữa Cách mạng công nghiệp lần thứ hai so với lần thứ nhất là:',
        options: {
          A: 'Diễn ra đồng thời ở nhiều quốc gia phát triển và có sự gắn kết chặt chẽ giữa khoa học với kỹ thuật',
          B: 'Chỉ giới hạn duy nhất trong phạm vi nước Anh',
          C: 'Hoàn toàn không sử dụng kim loại trong chế tạo máy',
          D: 'Không có tác động gì đến ngành giao thông vận tải'
        },
        correctAnswer: 'A',
        explanation: 'CMCN lần 2 diễn ra trên bình diện quốc tế rộng lớn (Mỹ, Đức, Anh, Pháp) và khoa học đã trở thành lực lượng sản xuất trực tiếp.'
      },
      {
        id: 'q1-ls12',
        questionNumber: 12,
        topic: 'Cách mạng công nghiệp',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Tác động của Cách mạng công nghiệp đối với quan hệ quốc tế thời cận đại là:',
        options: {
          A: 'Chấm dứt hoàn toàn các cuộc chiến tranh xâm lược thuộc địa',
          B: 'Thúc đẩy các nước tư bản tăng cường xâm chiếm thuộc địa để tìm kiếm thị trường và nguồn tài nguyên nguyên liệu',
          C: 'Tất cả các nước đều đạt được sự phát triển kinh tế ngang bằng nhau',
          D: 'Các nước phương Tây đóng cửa không giao thương với châu Á'
        },
        correctAnswer: 'B',
        explanation: 'Nhu cầu khổng lồ về nguyên liệu và thị trường tiêu thụ thúc đẩy chủ nghĩa đế quốc mở rộng xâm lược thuộc địa.'
      }
    ],
    partII: [
      {
        id: 'q2-ls1',
        questionNumber: 1,
        topic: 'Thành tựu và ý nghĩa máy hơi nước',
        level: 'thong_hieu',
        maxPoints: 1.0,
        contextText: 'Đọc đoạn tư liệu lịch sử sau: "Năm 1784, Giêm Oát (James Watt) đã phát minh ra máy hơi nước. Phát minh này đã khắc phục được nhược điểm của động cơ sức gió và sức nước, có thể hoạt động ở bất kỳ địa điểm và thời tiết nào." Xét tính Đúng / Sai của các khẳng định sau:',
        statements: [
          {
            subId: 'a',
            text: 'Máy hơi nước của James Watt là động lực cơ khí mới đầu tiên không phụ thuộc vào điều kiện tự nhiên tại chỗ.',
            isCorrect: true
          },
          {
            subId: 'b',
            text: 'Phát minh này giúp các xưởng sản xuất vẫn buộc phải xây dựng cạnh bờ sông suối để tận dụng nguồn nước làm nguội máy.',
            isCorrect: false
          },
          {
            subId: 'c',
            text: 'Nhờ có máy hơi nước, ngành giao thông đường sắt và tàu thủy xuyên đại dương có bước tiến nhảy vọt.',
            isCorrect: true
          },
          {
            subId: 'd',
            text: 'Máy hơi nước là mốc đánh dấu sự chuyển biến từ sản xuất thủ công sang nền cơ khí hóa hiện đại của loài người.',
            isCorrect: true
          }
        ],
        explanation: 'Lệnh a: Đúng. Lệnh b: Sai (nhà máy có thể đặt sâu trong nội địa). Lệnh c: Đúng. Lệnh d: Đúng.'
      },
      {
        id: 'q2-ls2',
        questionNumber: 2,
        topic: 'Tác động xã hội của Cách mạng công nghiệp',
        level: 'van_dung',
        maxPoints: 1.0,
        contextText: 'Xét về sự chuyển biến sâu sắc trong đời sống xã hội và cơ cấu giai cấp thời kỳ Cách mạng công nghiệp ở Tây Âu: Xét tính Đúng / Sai của các khẳng định sau:',
        statements: [
          {
            subId: 'a',
            text: 'Sự ra đời của giai cấp vô sản công nghiệp là cơ sở trực tiếp cho sự bùng nổ của phong trào công nhân quốc tế.',
            isCorrect: true
          },
          {
            subId: 'b',
            text: 'Quá trình đô thị hóa diễn ra nhanh chóng khiến đời sống của tầng lớp lao động nghèo ở các khu ổ chuột được nâng cao toàn diện ngay lập tức.',
            isCorrect: false
          },
          {
            subId: 'c',
            text: 'Mâu thuẫn giữa giai cấp tư sản và giai cấp vô sản ngày càng gay gắt, dẫn tới sự xuất hiện của học thuyết chủ nghĩa xã hội khoa học.',
            isCorrect: true
          },
          {
            subId: 'd',
            text: 'Cách mạng công nghiệp không làm thay đổi lối sống, văn hóa hay thời gian làm việc của người lao động châu Âu.',
            isCorrect: false
          }
        ],
        explanation: 'Lệnh a: Đúng. Lệnh b: Sai (đời sống khu ổ chuột rất cơ cực). Lệnh c: Đúng (chủ nghĩa Mác ra đời). Lệnh d: Sai (lối sống và kỷ luật giờ giấc công nghiệp thay đổi triệt để).'
      }
    ],
    partIII: [
      {
        id: 'q3-ls1',
        questionNumber: 1,
        topic: 'Mốc thời gian lịch sử',
        level: 'nhan_biet',
        points: 0.5,
        content: 'Năm nào James Watt được cấp bằng sáng chế cho cỗ máy hơi nước hoàn thiện tạo động lực quay tròn?',
        correctShortAnswer: '1784',
        explanation: 'Năm 1784 James Watt hoàn thiện cỗ máy hơi nước.'
      },
      {
        id: 'q3-ls2',
        questionNumber: 2,
        topic: 'Quốc gia khởi đầu',
        level: 'nhan_biet',
        points: 0.5,
        content: 'Quốc gia nào được mệnh danh là "Công xưởng của thế giới" vào giữa thế kỷ XIX nhờ thành tựu công nghiệp vượt trội?',
        correctShortAnswer: 'Nước Anh',
        explanation: 'Nước Anh chiếm hơn 50% sản lượng than và sắt thép thế giới thời bấy giờ.'
      },
      {
        id: 'q3-ls3',
        questionNumber: 3,
        topic: 'Phát minh điện năng',
        level: 'thong_hieu',
        points: 0.5,
        content: 'Nhà bác học người Mỹ nổi tiếng nào đã phát minh ra bóng đèn sợi đốt thực dụng và hệ thống phân phối điện năng công cộng năm 1879?',
        correctShortAnswer: 'Thomas Edison',
        explanation: 'Thomas Alva Edison sáng chế ra bóng đèn sợi đốt.'
      },
      {
        id: 'q3-ls4',
        questionNumber: 4,
        topic: 'Cách mạng công nghiệp 4.0',
        level: 'van_dung',
        points: 0.5,
        content: 'Yếu tố công nghệ cốt lõi nào hiện nay (viết tắt bằng 2 chữ cái tiếng Anh) đang dẫn dắt cuộc Cách mạng công nghiệp lần thứ tư về trí tuệ máy móc?',
        correctShortAnswer: 'AI',
        explanation: 'AI (Artificial Intelligence - Trí tuệ nhân tạo).'
      }
    ],
    partIV: [
      {
        id: 'q4-ls1',
        questionNumber: 1,
        topic: 'Nguyên nhân và thành tựu CMCN',
        level: 'thong_hieu',
        totalPoints: 1.5,
        content: 'Trình bày những tiền đề thuận lợi giúp nước Anh trở thành quốc gia đầu tiên tiến hành Cách mạng công nghiệp ở thế kỷ XVIII (về chính trị, vốn, nhân công và kỹ thuật).',
        modelAnswer: `HƯỚNG DẪN CHẤM (1.5đ):
- Về chính trị: Nước Anh đã hoàn thành cuộc cách mạng tư sản từ sớm (thế kỷ XVII), thiết lập thể chế quân chủ lập hiến ổn định, tạo điều kiện thuận lợi cho giai cấp tư sản phát triển (0.5đ).
- Về nguồn vốn và nhân công:
  + Tích lũy tư bản lớn thông qua buôn bán thuộc địa và buôn bán nô lệ da đen (0.25đ).
  + Phong trào "rào đất cướp ruộng" biến nông dân thành lực lượng lao động tự do khổng lồ đổ về thành phố làm thuê (0.25đ).
- Về khoa học - kỹ thuật: Nước Anh có nền kinh tế công trường thủ công phát triển cao, người thợ có kỹ năng tinh xảo và phát triển tư duy cơ giới hóa (0.5đ).`
      },
      {
        id: 'q4-ls2',
        questionNumber: 2,
        topic: 'Bài học lịch sử và liên hệ thực tiễn',
        level: 'van_dung',
        totalPoints: 1.5,
        content: 'Từ việc phân tích tác động của các cuộc Cách mạng công nghiệp trong lịch sử cận đại, hãy nêu 02 bài học kinh nghiệm sâu sắc nhất mà Việt Nam có thể vận dụng vào công cuộc đẩy mạnh công nghiệp hóa, hiện đại hóa và hội nhập chuyển đổi số hiện nay.',
        modelAnswer: `HƯỚNG DẪN CHẤM (1.5đ):
- Bài học 1: Coi trọng phát triển nguồn nhân lực chất lượng cao và đầu tư đột phá cho khoa học - công nghệ:
  + Lịch sử chứng minh quốc gia nào làm chủ công nghệ nguồn và năng lượng mới (Anh với máy hơi nước, Mỹ - Đức với điện lực) sẽ vươn lên dẫn đầu thế giới.
  + Việt Nam cần đổi mới căn bản giáo dục, đào tạo nhân lực ngành công nghệ bán dẫn, chuyển đổi số và trí tuệ nhân tạo (0.75đ).
- Bài học 2: Phát triển kinh tế gắn liền với bảo đảm công bằng xã hội và bảo vệ môi trường sinh thái bền vững:
  + Tránh vết xe đổ của các nước phương Tây thế kỷ XIX (ô nhiễm khói bụi, bất bình đẳng, bóc lột cùng cực).
  + Kiên quyết theo đuổi chiến lược tăng trưởng xanh, kinh tế tuần hoàn, không đánh đổi môi trường lấy tăng trưởng kinh tế đơn thuần (0.75đ).`
      }
    ]
  }
};

export const sampleNaturalScience8State: HarnessEdState = {
  version: '2025.1-CV7991',
  lastUpdated: '2025-02-28T10:00:00Z',
  meta: {
    curriculumFramework: 'GDPT_2018',
    khbdLegalRef: '5512/BGDĐT-GDTrH',
    examLegalRef: '7991/BGDĐT-GDTrH',
    totalPointsTarget: 10.0,
    cognitiveRatio: '40% Nhận biết - 30% Thông hiểu - 30% Vận dụng',
  },
  khbd: {
    schoolName: 'TRƯỜNG THCS NGUYỄN DU',
    departmentName: 'TỔ KHOA HỌC TỰ NHIÊN',
    teacherName: 'Cô Trần Thị Mai',
    subject: 'Khoa học tự nhiên (Phân môn Vật lí)',
    grade: 'Lớp 8',
    textbookSeries: 'Chân Trời Sáng Tạo',
    lessonTitle: 'HIỆN TƯỢNG KHÚC XẠ ÁNH SÁNG',
    durationPeriods: 2,
    knowledgeObjectives: [
      'Nêu được hiện tượng khúc xạ ánh sáng là hiện tượng tia sáng bị đổi phương truyền khi truyền xiên góc qua mặt phân cách giữa hai môi trường trong suốt khác nhau.',
      'Chỉ ra được tia tới, tia khúc xạ, góc tới, góc khúc xạ và pháp tuyến trên hình vẽ.',
      'Giải thích được một số hiện tượng quang học trong đời sống (nhìn thấy đáy chậu nước nông hơn thực tế, chiếc đũa bị gãy khúc trong cốc nước).'
    ],
    generalCompetencies: [
      'Tự chủ và tự học: Tự chuẩn bị dụng cụ thí nghiệm đơn giản với cốc nước và đũa thủy tinh ở nhà.',
      'Giao tiếp và hợp tác: Làm việc nhóm 4 học sinh để bố trí thí nghiệm hộp quang học và ghi chép số liệu góc tới/góc khúc xạ.'
    ],
    specificCompetencies: [
      'Tìm hiểu tự nhiên: Tiến hành thí nghiệm chiếu tia sáng laze từ không khí vào nước và ngược lại.',
      'Vận dụng kiến thức, kỹ năng đã học: Giải thích tại sao người bắt cá bằng xiên phải ngắm xiên xuống dưới vị trí nhìn thấy cá.'
    ],
    qualities: [
      'Trung thực: Ghi chép trung thực số đo góc từ thí nghiệm thực tế, không bịa đặt số liệu.',
      'Chăm chỉ: Tích cực tham gia phân công nhiệm vụ trong nhóm học tập.'
    ],
    teacherSupplies: 'Hộp quang học bán trụ thủy tinh, đèn laze học đường, bảng phụ, video mô phỏng khúc xạ.',
    studentSupplies: 'SGK KHTN 8, vở ghi, thước đo độ, cốc thủy tinh đựng nước và đũa ăn.',
    activities: [
      {
        id: 'act-khtn-1',
        number: 1,
        name: 'Hoạt động 1: Mở đầu / Khởi động (Quan sát chiếc đũa gãy)',
        durationMinutes: 5,
        target: 'Tạo mâu thuẫn nhận thức: Chiếc đũa thẳng khi nhúng vào nước lại trông như bị uốn gãy tại mặt nước.',
        content: 'Học sinh quan sát thí nghiệm nhúng chiếc đũa vào cốc nước trong suốt và trả lời: Chiếc đũa có thật sự bị gãy không? Tại sao mắt ta lại thấy như vậy?',
        product: 'Học sinh kết luận chiếc đũa vẫn thẳng nguyên vẹn, ảo ảnh do đường truyền của ánh sáng qua nước bị đổi hướng.',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Đặt cốc nước và chiếc đũa lên bàn GV; chiếu camera vật thể lên màn hình lớn; yêu cầu HS nhận xét hình dạng đũa.',
            studentAction: 'Quan sát và thảo luận cặp đôi về hình dáng chiếc đũa tại mặt phân cách giữa nước và không khí.'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Rút chiếc đũa ra khỏi cốc nước để chứng minh đũa vẫn thẳng hoàn toàn.',
            studentAction: 'Bất ngờ và đặt câu hỏi vì sao mắt ta lại thấy hình ảnh bị gãy khúc.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Mời 2 học sinh phát biểu giả thuyết nguyên nhân.',
            studentAction: 'Nêu giả thuyết: Tia sáng từ chiếc đũa truyền đến mắt trong nước đã không đi theo đường thẳng.'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Xác nhận mâu thuẫn và giới thiệu: Hiện tượng này gọi là Hiện tượng khúc xạ ánh sáng.',
            studentAction: 'Ghi tên bài mới vào vở.'
          }
        ]
      },
      {
        id: 'act-khtn-2',
        number: 2,
        name: 'Hoạt động 2: Hình thành kiến thức mới (Khảo sát khúc xạ)',
        durationMinutes: 22,
        target: 'Xác định định nghĩa khúc xạ ánh sáng, nhận diện tia tới, tia khúc xạ, pháp tuyến, góc tới i, góc khúc xạ r.',
        content: 'Bố trí thí nghiệm chiếu chùm sáng hẹp từ không khí vào khối bán trụ thủy tinh. Đo góc tới i và góc khúc xạ r tương ứng.',
        product: 'Bảng số liệu góc tới và góc khúc xạ; kết luận r < i khi truyền từ không khí vào nước/thủy tinh.',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Phát hộp quang học cho các nhóm. Giao nhiệm vụ chiếu tia sáng ở các góc tới 30°, 45°, 60° và đo góc khúc xạ.',
            studentAction: 'Nhận thiết bị thí nghiệm, lắp đặt nguồn sáng laze vào đĩa chia độ.'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Quan sát an toàn (nhắc nhở không chiếu laze vào mắt bạn), hướng dẫn cách đọc độ trên đĩa chia độ.',
            studentAction: 'Tiến hành đo và ghi số liệu vào Phiếu học tập số 1.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Thu phiếu học tập của nhóm 1 và nhóm 3, chiếu lên bảng để so sánh số liệu.',
            studentAction: 'Đại diện nhóm báo cáo: Góc khúc xạ luôn nhỏ hơn góc tới khi đi từ không khí vào thủy tinh.'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Chuẩn hóa khái niệm khúc xạ ánh sáng, mặt phẳng tới và mối quan hệ giữa góc tới và góc khúc xạ.',
            studentAction: 'Ghi chép định nghĩa và vẽ hình chính xác vào vở.'
          }
        ]
      },
      {
        id: 'act-khtn-3',
        number: 3,
        name: 'Hoạt động 3: Luyện tập (Vẽ đường truyền tia sáng)',
        durationMinutes: 10,
        target: 'Rèn luyện kỹ năng vẽ hình biểu diễn tia khúc xạ và tính toán góc.',
        content: 'Vẽ đường truyền tia sáng từ không khí vào nước với góc tới i = 45°. Đánh dấu góc tới, góc khúc xạ và pháp tuyến.',
        product: 'Hình vẽ chuẩn xác trong vở học sinh.',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Yêu cầu cả lớp vẽ hình biểu diễn tia sáng truyền qua mặt nước vào vở bài tập.',
            studentAction: 'Dùng thước thẳng và compa vẽ mặt phân cách PQ, pháp tuyến NN\'.'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Hỗ trợ học sinh vẽ đúng chiều mũi tên chỉ đường truyền của tia sáng.',
            studentAction: 'Vẽ tia tới SI và tia khúc xạ IK uốn vào gần pháp tuyến.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Gọi 1 học sinh lên bảng vẽ và giải thích các đại lượng.',
            studentAction: 'Chỉ rõ tia tới SI, góc tới SIN, tia khúc xạ IK, góc khúc xạ KIN\'.'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Nhận xét bài vẽ, nhấn mạnh tia khúc xạ nằm trong mặt phẳng tới.',
            studentAction: 'Hoàn thiện hình vẽ chuẩn mực.'
          }
        ]
      },
      {
        id: 'act-khtn-4',
        number: 4,
        name: 'Hoạt động 4: Vận dụng (Giải thích hiện tượng đời sống)',
        durationMinutes: 8,
        target: 'Vận dụng hiện tượng khúc xạ giải thích tại sao đáy hồ bơi trông có vẻ cạn hơn thực tế.',
        content: 'Bài toán thực tế: Khi đứng trên bờ nhìn xuống đáy hồ bơi, đáy hồ dường như được nâng lên cao. Người bơi không biết bơi có thể gặp nguy hiểm gì?',
        product: 'Văn bản giải thích ngắn: Ánh sáng từ đáy hồ truyền ra không khí bị bẻ gãy ra xa pháp tuyến nên ảnh ảo được nâng lên cao hơn thực tế.',
        implementation: [
          {
            title: 'Bước 1: Chuyển giao nhiệm vụ',
            teacherAction: 'Nêu câu hỏi tình huống an toàn hồ bơi và kỹ năng sinh tồn phòng tránh đuối nước.',
            studentAction: 'Thảo luận cặp đôi về ảo giác độ sâu của hồ bơi.'
          },
          {
            title: 'Bước 2: Thực hiện nhiệm vụ',
            teacherAction: 'Gợi ý vẽ đường kéo dài của tia khúc xạ ló ra không khí đến mắt.',
            studentAction: 'Vẽ giao điểm các tia kéo dài tạo ảnh ảo nằm ở vị trí cao hơn đáy thật.'
          },
          {
            title: 'Bước 3: Báo cáo, thảo luận',
            teacherAction: 'Mời đại diện học sinh trả lời.',
            studentAction: 'Trả lời: Đáy hồ thực tế sâu hơn ta nhìn thấy, nếu chủ quan nhảy xuống có thể bị đuối nước.'
          },
          {
            title: 'Bước 4: Kết luận, nhận định',
            teacherAction: 'Tuyên dương tinh thần liên hệ thực tiễn và giáo dục kỹ năng an toàn bơi lội.',
            studentAction: 'Ghi nhớ lời dặn và bài tập về nhà.'
          }
        ]
      }
    ]
  },
  slides: {
    title: 'HIỆN TƯỢNG KHÚC XẠ ÁNH SÁNG',
    subject: 'KHTN 8',
    grade: 'Lớp 8 - GDPT 2018',
    slides: [
      {
        id: 'sk-1',
        type: 'title',
        title: 'BÀI 15: HIỆN TƯỢNG KHÚC XẠ ÁNH SÁNG',
        subtitle: 'Khoa học tự nhiên 8 - Bộ môn Vật lí',
        bullets: [
          'Giáo viên: Cô Trần Thị Mai',
          'Thời lượng: 2 tiết',
          'Thiết bị: Hộp quang học học đường & Laze'
        ],
        teacherNotes: 'Chuẩn bị sẵn cốc nước và đũa trên bục giảng.',
        visualTag: 'Trang Bìa'
      },
      {
        id: 'sk-2',
        type: 'objectives',
        title: 'MỤC TIÊU CẦN ĐẠT (CV 5512)',
        subtitle: 'Chuẩn đầu ra bài học',
        bullets: [
          'Nắm vững định nghĩa hiện tượng khúc xạ ánh sáng.',
          'Phân biệt tia tới, tia khúc xạ, góc tới i, góc khúc xạ r.',
          'Biết cách vẽ đường truyền của tia sáng qua mặt phân cách.',
          'Giải thích các hiện tượng quang học thực tiễn đời sống.'
        ],
        teacherNotes: 'Trình chiếu mục tiêu nhanh.',
        visualTag: 'Mục Tiêu'
      },
      {
        id: 'sk-3',
        type: 'activity',
        title: 'KHỞI ĐỘNG: ĐŨA GÃY TRONG CỐC NƯỚC',
        subtitle: 'Ảo ảnh thị giác hay hiện tượng vật lí?',
        bullets: [
          'Quan sát: Chiếc đũa cắm xiên vào cốc nước trông như bị bẻ gãy.',
          'Câu hỏi: Có phải chiếc đũa bị gãy thật không?',
          'Nguyên nhân: Đường truyền tia sáng từ đũa vào mắt đã bị đổi hướng!'
        ],
        teacherNotes: 'Rút chiếc đũa ra để học sinh thấy đũa vẫn thẳng.',
        visualTag: 'Khởi Động'
      },
      {
        id: 'sk-4',
        type: 'content',
        title: 'KHÁI NIỆM HIỆN TƯỢNG KHÚC XẠ',
        subtitle: 'Định nghĩa khoa học',
        bullets: [
          'Khúc xạ ánh sáng là hiện tượng tia sáng bị đổi phương truyền khi truyền xiên góc qua mặt phân cách giữa hai môi trường trong suốt.',
          'Tia tới SI, Tia khúc xạ IK.',
          'Pháp tuyến NN\' vuông góc với mặt phân cách tại điểm tới I.',
          'Góc tới i = ∠SIN, Góc khúc xạ r = ∠KIN\'.'
        ],
        teacherNotes: 'Nhấn mạnh điều kiện truyền xiên góc.',
        visualTag: 'Khái Niệm'
      },
      {
        id: 'sk-5',
        type: 'quiz',
        title: 'VẬN DỤNG ĐỜI SỐNG: BẮT CÁ BẰNG XIÊN',
        subtitle: 'Tại sao phải ngắm xiên xuống phía dưới con cá?',
        bullets: [
          'Ánh sáng từ con cá truyền từ nước ra không khí bị khúc xạ (r > i).',
          'Mắt nhìn thấy ảnh ảo của cá nằm nông hơn vị trí thật.',
          'Kết luận: Phải phóng xiên vào phía dưới ảnh nhìn thấy mới trúng cá!'
        ],
        teacherNotes: 'Liên hệ bài học kinh nghiệm của ngư dân xưa.',
        visualTag: 'Vận Dụng'
      }
    ]
  },
  exam: {
    title: 'ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA KỲ II - KHOA HỌC TỰ NHIÊN 8',
    schoolName: 'TRƯỜNG THCS NGUYỄN DU',
    subject: 'KHOA HỌC TỰ NHIÊN 8',
    grade: 'Lớp 8',
    durationMinutes: 60,
    semester: 'Giữa Học kỳ 2',
    academicYear: '2024 - 2025',
    matrixRows: [
      {
        id: 'mr-khtn',
        topic: 'Chủ đề: Ánh sáng',
        contentUnit: 'Hiện tượng khúc xạ ánh sáng và phản xạ toàn phần',
        partI_nb: 8,
        partI_th: 4,
        partI_vd: 0,
        partII_nb: 1,
        partII_th: 1,
        partII_vd: 0,
        partIII_nb: 2,
        partIII_th: 1,
        partIII_vd: 1,
        partIV_nb: 0,
        partIV_th: 1,
        partIV_vd: 1,
        learningOutcomes: '- Nhận biết: Nêu định nghĩa khúc xạ, nhận diện tia tới, tia khúc xạ, pháp tuyến.\n- Thông hiểu: So sánh góc khúc xạ và góc tới khi đi từ môi trường chiết quang hơn sang kém hơn.\n- Vận dụng: Giải thích ảnh ảo đáy chậu nước và tính toán góc lệch.'
      }
    ],
    partI: [
      {
        id: 'q1-k1',
        questionNumber: 1,
        topic: 'Khúc xạ ánh sáng',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Hiện tượng khúc xạ ánh sáng là hiện tượng tia sáng truyền từ môi trường trong suốt này sang môi trường trong suốt khác bị:',
        options: {
          A: 'Hắt trở lại môi trường cũ',
          B: 'Gãy khúc tại mặt phân cách',
          C: 'Dừng lại không truyền tiếp',
          D: 'Biến đổi màu sắc hoàn toàn'
        },
        correctAnswer: 'B',
        explanation: 'Khúc xạ là hiện tượng gãy khúc của tia sáng khi truyền qua mặt phân cách hai môi trường trong suốt.'
      },
      {
        id: 'q1-k2',
        questionNumber: 2,
        topic: 'Khúc xạ ánh sáng',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Pháp tuyến tại điểm tới là đường thẳng:',
        options: {
          A: 'Song song với mặt phân cách',
          B: 'Trùng với tia tới',
          C: 'Vuông góc với mặt phân cách tại điểm tới',
          D: 'Tạo với mặt phân cách góc 45°'
        },
        correctAnswer: 'C',
        explanation: 'Pháp tuyến luôn vuông góc với mặt phân cách tại điểm tới I.'
      },
      {
        id: 'q1-k3',
        questionNumber: 3,
        topic: 'Khúc xạ ánh sáng',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Góc tới là góc tạo bởi:',
        options: {
          A: 'Tia tới và mặt phân cách',
          B: 'Tia tới và pháp tuyến',
          C: 'Tia khúc xạ và pháp tuyến',
          D: 'Tia tới và tia khúc xạ'
        },
        correctAnswer: 'B',
        explanation: 'Góc tới là góc hợp bởi tia tới và đường pháp tuyến.'
      },
      {
        id: 'q1-k4',
        questionNumber: 4,
        topic: 'Khúc xạ ánh sáng',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Khi tia sáng truyền từ không khí vào nước, góc khúc xạ r so với góc tới i có đặc điểm:',
        options: {
          A: 'r > i',
          B: 'r = i',
          C: 'r < i',
          D: 'r = 2i'
        },
        correctAnswer: 'C',
        explanation: 'Khi truyền từ không khí vào nước, tia sáng bị uốn lại gần pháp tuyến nên góc khúc xạ nhỏ hơn góc tới.'
      },
      {
        id: 'q1-k5',
        questionNumber: 5,
        topic: 'Khúc xạ ánh sáng',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Khi tăng góc tới i thì góc khúc xạ r sẽ:',
        options: {
          A: 'Giảm đi',
          B: 'Không thay đổi',
          C: 'Tăng lên',
          D: 'Luôn bằng 0'
        },
        correctAnswer: 'C',
        explanation: 'Góc tới và góc khúc xạ biến thiên cùng chiều: khi i tăng thì r cũng tăng theo.'
      },
      {
        id: 'q1-k6',
        questionNumber: 6,
        topic: 'Khúc xạ ánh sáng',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Nếu tia sáng truyền vuông góc với mặt phân cách giữa hai môi trường (i = 0°) thì tia sáng sẽ:',
        options: {
          A: 'Bị lệch góc 90°',
          B: 'Tiếp tục truyền thẳng không đổi hướng',
          C: 'Bị phản xạ ngược lại toàn bộ',
          D: 'Bị tán sắc thành 7 màu'
        },
        correctAnswer: 'B',
        explanation: 'Khi chiếu vuông góc (i = 0°), góc khúc xạ r = 0°, tia sáng truyền thẳng.'
      },
      {
        id: 'q1-k7',
        questionNumber: 7,
        topic: 'Khúc xạ ánh sáng',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Ảnh của một đồng xu đặt dưới đáy chậu nước khi nhìn từ không khí sẽ:',
        options: {
          A: 'Sâu hơn vị trí thực',
          B: 'Nông hơn vị trí thực (được nâng lên)',
          C: 'Ở cùng độ sâu với vị trí thực',
          D: 'Biến mất không quan sát được'
        },
        correctAnswer: 'B',
        explanation: 'Hiện tượng khúc xạ làm cho ảnh ảo của đáy chậu hay đồng xu trông như được nâng lên cao hơn.'
      },
      {
        id: 'q1-k8',
        questionNumber: 8,
        topic: 'Khúc xạ ánh sáng',
        level: 'nhan_biet',
        points: 0.25,
        content: 'Mặt phẳng tới là mặt phẳng được tạo bởi:',
        options: {
          A: 'Tia tới và mặt phân cách',
          B: 'Tia khúc xạ và mặt phân cách',
          C: 'Tia tới và pháp tuyến tại điểm tới',
          D: 'Hai môi trường trong suốt'
        },
        correctAnswer: 'C',
        explanation: 'Mặt phẳng tới chứa tia tới và pháp tuyến tại điểm tới.'
      },
      {
        id: 'q1-k9',
        questionNumber: 9,
        topic: 'Khúc xạ ánh sáng',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Một tia sáng chiếu từ nước ra không khí với góc tới i = 30°. Góc khúc xạ r có thể nhận giá trị nào sau đây?',
        options: {
          A: 'r = 20°',
          B: 'r = 42°',
          C: 'r = 0°',
          D: 'r = 30°'
        },
        correctAnswer: 'B',
        explanation: 'Khi truyền từ nước ra không khí, tia khúc xạ bẻ xa pháp tuyến nên r > i = 30°, do đó r = 42° là phương án hợp lí.'
      },
      {
        id: 'q1-k10',
        questionNumber: 10,
        topic: 'Khúc xạ ánh sáng',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Hiện tượng nào sau đây KHÔNG PHẢI là hiện tượng khúc xạ ánh sáng?',
        options: {
          A: 'Nhìn chiếc đũa bị gãy khúc trong ly nước',
          B: 'Nhìn đáy bể bơi thấy nông hơn bình thường',
          C: 'Nhìn thấy bóng của mình trên mặt nước phẳng lặng',
          D: 'Ảo tượng mặt đường nhựa nóng trông như có nước ướt'
        },
        correctAnswer: 'C',
        explanation: 'Nhìn thấy bóng của mình trên mặt nước là hiện tượng phản xạ ánh sáng (gương phẳng).'
      },
      {
        id: 'q1-k11',
        questionNumber: 11,
        topic: 'Khúc xạ ánh sáng',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Chiếu tia sáng từ không khí vào khối thủy tinh sao cho tia khúc xạ vuông góc với tia phản xạ. Nếu góc tới i = 60° thì góc khúc xạ r bằng:',
        options: {
          A: '30°',
          B: '45°',
          C: '60°',
          D: '90°'
        },
        correctAnswer: 'A',
        explanation: 'Theo định luật phản xạ i\' = i = 60°. Do tia khúc xạ vuông góc với tia phản xạ nên i\' + 90° + r = 180° => r = 90° - 60° = 30°.'
      },
      {
        id: 'q1-k12',
        questionNumber: 12,
        topic: 'Khúc xạ ánh sáng',
        level: 'thong_hieu',
        points: 0.25,
        content: 'Khi chiếu ánh sáng mặt trời qua một lăng kính thủy tinh hình tam giác, chùm sáng trắng bị tách ra thành dải nhiều màu là do:',
        options: {
          A: 'Sự hấp thụ ánh sáng khác nhau của thủy tinh',
          B: 'Hiện tượng khúc xạ với góc lệch khác nhau của các màu ánh sáng',
          C: 'Hiện tượng giao thoa sóng âm',
          D: 'Lăng kính tự phát ra ánh sáng màu'
        },
        correctAnswer: 'B',
        explanation: 'Các màu sắc bị khúc xạ với góc lệch khác nhau qua lăng kính tạo ra hiện tượng tán sắc ánh sáng.'
      }
    ],
    partII: [
      {
        id: 'q2-k1',
        questionNumber: 1,
        topic: 'Đặc điểm tia khúc xạ',
        level: 'thong_hieu',
        maxPoints: 1.0,
        contextText: 'Chiếu một tia sáng hẹp SI từ không khí vào mặt nước với góc tới i = 45°. Tia khúc xạ trong nước là IK. Xét tính Đúng / Sai của các khẳng định sau:',
        statements: [
          {
            subId: 'a',
            text: 'Tia khúc xạ IK nằm trong mặt phẳng tới chứa tia tới SI và pháp tuyến NN\'.',
            isCorrect: true
          },
          {
            subId: 'b',
            text: 'Góc khúc xạ r tạo bởi tia IK và pháp tuyến lớn hơn 45°.',
            isCorrect: false
          },
          {
            subId: 'c',
            text: 'Tia sáng bị bẻ gãy khúc ngay tại điểm tới I trên mặt phân cách giữa không khí và nước.',
            isCorrect: true
          },
          {
            subId: 'd',
            text: 'Nếu tăng góc tới i từ 45° lên 60° thì góc khúc xạ r trong nước sẽ tăng theo nhưng vẫn nhỏ hơn góc tới.',
            isCorrect: true
          }
        ],
        explanation: 'Lệnh a: Đúng. Lệnh b: Sai vì từ không khí vào nước thì r < i = 45°. Lệnh c: Đúng. Lệnh d: Đúng vì r tăng cùng chiều với i.'
      },
      {
        id: 'q2-k2',
        questionNumber: 2,
        topic: 'Hiện tượng quang học thực tiễn',
        level: 'van_dung',
        maxPoints: 1.0,
        contextText: 'Một người đứng trên bờ ao nhìn xuống đáy ao thấy một chú cá bơi ở vị trí có vẻ sâu khoảng 60 cm. Xét tính Đúng / Sai của các nhận định sư phạm sau:',
        statements: [
          {
            subId: 'a',
            text: 'Vị trí con cá mà người đó quan sát được chỉ là ảnh ảo do hiện tượng khúc xạ ánh sáng tạo ra.',
            isCorrect: true
          },
          {
            subId: 'b',
            text: 'Con cá thật đang bơi ở độ sâu thực tế lớn hơn 60 cm (khoảng 80 cm).',
            isCorrect: true
          },
          {
            subId: 'c',
            text: 'Để phóng lao trúng con cá, người này phải nhắm mũi lao thẳng vào chính giữa hình ảnh con cá nhìn thấy.',
            isCorrect: false
          },
          {
            subId: 'd',
            text: 'Nguyên nhân đáy ao bị nâng lên là do tia sáng truyền từ nước ra không khí có góc khúc xạ lớn hơn góc tới.',
            isCorrect: true
          }
        ],
        explanation: 'Lệnh a: Đúng. Lệnh b: Đúng (ảnh ảo nâng lên gần mặt nước hơn). Lệnh c: Sai (phải nhắm thấp hơn ảnh ảo). Lệnh d: Đúng.'
      }
    ],
    partIII: [
      {
        id: 'q3-k1',
        questionNumber: 1,
        topic: 'Khúc xạ ánh sáng',
        level: 'nhan_biet',
        points: 0.5,
        content: 'Một tia sáng chiếu vuông góc với mặt gương phẳng (góc tới i = 0°). Hỏi góc khúc xạ hoặc phản xạ tương ứng bằng bao nhiêu độ?',
        correctShortAnswer: '0',
        unit: 'độ',
        explanation: 'Góc tới 0 độ thì tia sáng truyền thẳng, góc lệch bằng 0 độ.'
      },
      {
        id: 'q3-k2',
        questionNumber: 2,
        topic: 'Góc tới',
        level: 'nhan_biet',
        points: 0.5,
        content: 'Tia sáng tới tạo với mặt phẳng phân cách một góc 40°. Góc tới i bằng bao nhiêu độ?',
        correctShortAnswer: '50',
        unit: 'độ',
        explanation: 'Góc tới i = 90° - 40° = 50°.'
      },
      {
        id: 'q3-k3',
        questionNumber: 3,
        topic: 'Góc lệch khúc xạ',
        level: 'thong_hieu',
        points: 0.5,
        content: 'Chiếu tia sáng từ không khí vào khối thủy tinh với góc tới i = 60°. Đo được góc khúc xạ r = 35°. Tính góc lệch giữa tia tới và tia khúc xạ (độ)?',
        correctShortAnswer: '25',
        unit: 'độ',
        explanation: 'Góc lệch D = |i - r| = 60° - 35° = 25°.'
      },
      {
        id: 'q3-k4',
        questionNumber: 4,
        topic: 'Độ sâu biểu kiến',
        level: 'van_dung',
        points: 0.5,
        content: 'Biết chiết suất của nước đối với không khí là n = 4/3. Một bể nước sâu thực tế là 120 cm. Người nhìn từ trên xuống theo phương gần vuông góc sẽ thấy đáy bể sâu bao nhiêu cm?',
        correctShortAnswer: '90',
        unit: 'cm',
        explanation: 'Độ sâu biểu kiến h\' = h / n = 120 / (4/3) = 90 cm.'
      }
    ],
    partIV: [
      {
        id: 'q4-k1',
        questionNumber: 1,
        topic: 'Vẽ hình khúc xạ ánh sáng',
        level: 'thong_hieu',
        totalPoints: 1.5,
        content: 'Chiếu một tia sáng SI từ không khí vào một bản thủy tinh trong suốt có hai mặt song song với góc tới i = 45°.\na) Hãy vẽ hình mô tả đường truyền của tia sáng từ không khí vào bản thủy tinh và khi ló ra ngoài không khí.\nb) So sánh phương của tia ló ra ngoài không khí với phương của tia tới SI ban đầu.',
        modelAnswer: `HƯỚNG DẪN CHẤM Ý a (1.0đ):
- Vẽ mặt phân cách thứ nhất, pháp tuyến vuông góc và tia tới SI với góc tới 45° (0.25đ)
- Vẽ tia khúc xạ trong thủy tinh IK bẻ gãy lại gần pháp tuyến (r < 45°) (0.25đ)
- Tại mặt phân cách thứ hai, vẽ pháp tuyến và tia ló ra ngoài không khí KR (0.25đ)
- Ghi chú đầy đủ mũi tên chỉ đường truyền và tên các góc (0.25đ)

HƯỚNG DẪN CHẤM Ý b (0.5đ):
- Tia ló ra ngoài không khí có phương song song với tia tới ban đầu (0.25đ)
- Giải thích: Do bản mặt song song, góc tới tại mặt 2 bằng góc khúc xạ tại mặt 1, nên góc ló bằng góc tới ban đầu (0.25đ).`
      },
      {
        id: 'q4-k2',
        questionNumber: 2,
        topic: 'Bài toán quang hình học thực tiễn',
        level: 'van_dung',
        totalPoints: 1.5,
        content: 'Một bể chứa nước có thành thẳng đứng, đáy bể nằm ngang phẳng, độ sâu của nước trong bể là H = 80 cm. Người ta chiếu một chùm sáng hẹp từ không khí vào mặt nước với góc tới i = 45° tại điểm tới I. Biết góc khúc xạ tương ứng trong nước đo được là r = 32°.\na) Tính khoảng cách từ điểm tới I theo phương thẳng đứng tới vị trí vết sáng in trên đáy bể.\nb) Tìm khoảng cách nằm ngang từ hình chiếu thẳng đứng của điểm I trên đáy bể tới vết sáng trên đáy bể (làm tròn kết quả đến 1 chữ số thập phân).',
        modelAnswer: `HƯỚNG DẪN CHẤM Ý a (0.75đ):
- Điểm tới I nằm trên mặt nước, đáy bể nằm ngang cách mặt nước một khoảng bằng độ sâu bể H = 80 cm.
- Do đó khoảng cách thẳng đứng từ I tới đáy bể chính là H = 80 cm (0.75đ).

HƯỚNG DẪN CHẤM Ý b (0.75đ):
- Gọi vết sáng trên đáy bể là K, hình chiếu của I lên đáy bể là H₀.
- Xét tam giác vuông IH₀K vuông tại H₀, ta có góc ∠H₀IK chính là góc khúc xạ r = 32° (0.25đ)
- Đoạn nằm ngang d = H₀K = H * tan(r) = 80 * tan(32°) (0.25đ)
- Tính toán: tan(32°) ≈ 0.6249 => d = 80 * 0.6249 ≈ 50.0 cm.
- Kết luận: Vết sáng in trên đáy bể cách vị trí hình chiếu thẳng đứng của I là 50.0 cm (0.25đ).`
      }
    ]
  }
};

