# NHẬT KÝ TIẾN TRÌNH LÀM VIỆC & LỊCH SỬ COMMIT (PROCESS LOG)
> **Tài liệu theo dõi tiến độ, chi tiết thay đổi và kiểm soát chất lượng qua từng lần Commit**  
> **Dự án**: Hệ thống Nhúng & Robotics (Embedded Systems & Robotics Self-Study)

---

## 1. MỤC ĐÍCH & NGUYÊN TẮC BẮT BUỘC

File `process.md` là cuốn "sổ tay hành trình" (Engineering Logbook) của dự án. Mọi thay đổi về mã nguồn, bài học, sơ đồ và bộ câu hỏi trắc nghiệm đều phải được lưu vết rõ ràng tại đây.

### Nguyên tắc vàng:
1. **Một commit - Một mục đích rõ ràng**: Không gộp nhiều tính năng hoặc bài học không liên quan vào cùng một commit.
2. **Quy chuẩn thông điệp Commit (Conventional Commits)**:
   - `docs(...)`: Thêm hoặc cập nhật bài giảng lý thuyết, tài liệu hướng dẫn.
   - `quiz(...)`: Bổ sung hoặc cập nhật bộ câu hỏi trắc nghiệm / giải thích đáp án.
   - `lab(...)`: Thêm code thực hành, file cấu hình mô phỏng (Wokwi, Gazebo, URDF).
   - `feat(...)`: Viết driver mới, giải thuật điều khiển mới (PID, EKF, SLAM).
   - `fix(...)`: Sửa lỗi logic, sửa bug phần cứng, lỗi timing hoặc đính chính bài học.
   - `refactor(...)`: Tối ưu hóa cấu trúc mã nguồn, chuẩn hóa văn phong bài học.
3. **Cập nhật `process.md` TRƯỚC khi commit**: Viết nhật ký vào file này, lưu lại, rồi mới chạy lệnh `git commit`.

---

## 2. KHUNG MẪU GHI CHÉP CHO MỖI COMMIT (COMMIT LOG TEMPLATE)

Khi thực hiện commit mới, hãy sao chép mẫu dưới đây và điền đầy đủ thông tin vào phần **3. LỊCH SỬ TIẾN TRÌNH CHI TIẾT**:

```markdown
### [YYYY-MM-DD] - Commit: `<commit_hash>` - `<loại(phạm_vi): thông điệp ngắn>`

- **🎯 Mục tiêu của commit**:
  - Tóm tắt mục đích cụ thể cần đạt được trong đợt làm việc này.
- **📝 Chi tiết thay đổi**:
  - Thêm mới / cập nhật các file: `[file_path]`
  - Mô tả nội dung kỹ thuật cốt lõi vừa bổ sung.
- **🗺️ Tiến độ trên Roadmap (`tech.md`)**:
  - Thuộc Level: `Level X - Tên Level`
  - Node kiến thức hoàn thành: `[x] Module Y - Chủ đề Z`
- **💡 Khó khăn, Lỗi gặp phải & Lưu ý kỹ thuật (Gotchas)**:
  - Các lỗi compiler, lỗi nạp chip, lỗi mô phỏng hoặc kiến thức khó cần ghi nhớ.
- **🚀 Kế hoạch cho commit tiếp theo**:
  - Công việc tiếp theo cần triển khai.
```

---

## 3. LỊCH SỬ TIẾN TRÌNH CHI TIẾT (COMMIT HISTORY LOG)

---

### [2026-09-22] - Commit: `1697dbf` - `docs(core): Thiết lập kiến trúc kỹ thuật tech.md và chuẩn hóa quy trình process.md`

- **🎯 Mục tiêu của commit**:
  - Xây dựng bộ khung xương sống cho toàn bộ dự án tự học Hệ thống Nhúng & Robotics.
  - Định hình lộ trình 6 cấp độ từ cơ bản (C/C++, MCU Bare-metal) đến nâng cao (ARM Cortex-M, FreeRTOS, Điều khiển học, ROS2, SLAM, Nav2, Edge AI).
  - Thiết lập quy định bắt buộc về việc theo dõi tiến trình qua `process.md`.
- **📝 Chi tiết thay đổi**:
  - `tech.md`: Biên soạn tài liệu kỹ thuật trung tâm bao gồm triết lý 4 trụ cột, lộ trình 6 Level chi tiết, tiêu chuẩn cấu trúc 7 phần của một bài học, quy chuẩn vẽ sơ đồ (Mermaid, ASCII Bitfield, Timing Waveform), quy cách ra đề Quiz có giải thích sâu, và danh mục công cụ/phần cứng.
  - `process.md`: Khởi tạo file theo dõi tiến trình, quy ước Conventional Commits, mẫu nhật ký và ghi nhận entry mở màn v0.1.0.
  - `README.md`: Giới thiệu dự án, hướng dẫn sinh viên/người học cách tiếp cận và sử dụng tài liệu.
  - `templates/`: Cung cấp 3 mẫu chuẩn hóa: `lesson-template.md`, `quiz-template.md`, `lab-template.md`.
  - Khởi tạo cây thư mục đại diện cho các cấp độ học tập (`00-prerequisites` đến `06-advanced-edge-ai`).
- **🗺️ Tiến độ trên Roadmap (`tech.md`)**:
  - [x] Thiết lập nền móng kiến trúc toàn dự án (Architecture Foundation v0.1.0).
- **💡 Khó khăn, Lỗi gặp phải & Lưu ý kỹ thuật (Gotchas)**:
  - Hệ thống Nhúng và Robotics có khối lượng kiến thức rất rộng và giao thoa nhiều ngành (Điện tử, Phần mềm nhúng, Toán giải tích, Động lực học, AI). Cần chia nhỏ theo cấu trúc module độc lập để người học không bị ngợp.
  - Phải ưu tiên công cụ mô phỏng mã nguồn mở (Wokwi, Gazebo) song song với kit phần cứng thật để người học có thể thực hành ngay mà không bị rào cản chi phí.
- **🚀 Kế hoạch cho commit tiếp theo**:
  - Triển khai ứng dụng Web Hub tương tác và hoàn thiện nội dung các bài học từ Level 0 đến Level 6.

---

### [2026-09-22] - Commit: `f77fa83` - `feat(app): Hoàn thiện nền tảng Web Learning Hub và toàn bộ khóa học Level 0 tới Level 6`

- **🎯 Mục tiêu của commit**:
  - Xây dựng ứng dụng Web tương tác hoàn chỉnh (Single Page Application) phục vụ tự học Hệ thống Nhúng & Robotics từ Level 0 đến Level 6.
  - Tích hợp 5 bộ mô phỏng thực tế (Simulators): Bộ nhớ C, Thanh ghi GPIO STM32, Cân chỉnh PID, Động học xe robot vi sai và Bộ phân tích xung Logic.
  - Xây dựng hệ thống Đấu trường Quiz với chấm điểm thời gian thực, lưu tiến độ vào LocalStorage và giải thích cặn kẽ từng câu hỏi.
  - Biên soạn toàn diện các bài học trọng tâm từ Level 0 (Bản đồ bộ nhớ C) đến Level 6 (Capstone Xe tự hành AMR thông minh).
- **📝 Chi tiết thay đổi**:
  - `index.html`: Giao diện Web Hub 5 tab (Bài giảng, Đấu trường Quiz, Phòng mô phỏng, Bản đồ Roadmap, Nhật ký Commit).
  - `app.css`: Giao diện Dark-Theme hiện đại, responsive, hỗ trợ hiệu ứng mạch điện, bóng LED, đồ thị Canvas.
  - `data/curriculum.js`: Cơ sở dữ liệu toàn bộ bài giảng, code mẫu C/C++, phân tích thanh ghi và ngân hàng câu hỏi Quiz từ Level 0 đến Level 6.
  - `data/simulators.js`: Động cơ mô phỏng tương tác 5 phòng lab (Memory Map, GPIO Bitfields, PID Canvas, Differential Drive Robot, Serial Waveforms).
  - `app.js`: Bộ điều khiển trung tâm quản lý chuyển tab, lọc tìm kiếm, tính toán điểm số và lưu tiến độ học tập.
  - Thêm các bài học chi tiết dạng Markdown:
    - `00-prerequisites/01-c-memory-layout.md`
    - `01-embedded-fundamentals/01-baremetal-gpio.md`
    - `02-mcu-architecture-arm/01-arm-cortex-m-core.md`
    - `03-rtos-concurrency/01-freertos-multitasking.md`
    - `04-robotics-foundations/01-pid-closed-loop.md`
    - `05-ros2-and-simulation/01-ros2-architecture-and-microros.md`
    - `06-advanced-edge-ai/01-capstone-autonomous-mobile-robot.md`
- **🗺️ Tiến độ trên Roadmap (`tech.md`)**:
  - [x] Level 0: Hoàn thành bài học C Memory Layout & Math.
  - [x] Level 1: Hoàn thành bài học Bare-metal GPIO & Timers/Serial.
  - [x] Level 2: Hoàn thành bài học ARM Cortex-M Core & FreeRTOS.
  - [x] Level 3: Hoàn thành bài học Mạng CAN Bus & Embedded Linux.
  - [x] Level 4: Hoàn thành bài học PID Closed-loop & Kinematics.
  - [x] Level 5: Hoàn thành bài học ROS2 Core, Micro-ROS, SLAM & Nav2.
  - [x] Level 6: Hoàn thành bài học Đồ án Capstone AMR tự hành toàn diện.
- **💡 Khó khăn, Lỗi gặp phải & Lưu ý kỹ thuật (Gotchas)**:
  - Việc mô phỏng động học xe 2 bánh vi sai đòi hỏi tích phân Euler góc theta chính xác ở chu kỳ cao để tránh sai số lũy tiến (Drift).
  - Mô phỏng khâu chống bão hòa tích phân (Anti-windup) của PID cần tính toán clamping trước khi nạp vào thanh ghi bão hòa để hệ thống không bị trễ pha.
- **🚀 Kế hoạch cho commit tiếp theo**:
  - Người dùng kiểm tra trực tiếp các chức năng trên ứng dụng và đóng góp phản hồi về phần cứng thực tế.

