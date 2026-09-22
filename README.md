# 🚀 Embedded Systems & Robotics Comprehensive Self-Study Hub

> **Kho tri thức và Lộ trình Tự học Toàn diện Chuyên ngành Hệ thống Nhúng & Robotics**  
> Dành cho sinh viên, kỹ sư và những người đam mê công nghệ muốn chinh phục từ con số 0 đến cấp độ kỹ sư thực chiến.

---

## 📌 BẮT ĐẦU TỪ ĐÂU? (START HERE)

Dự án được vận hành dựa trên 2 tài liệu cốt lõi:

1. 📖 **[`tech.md`](./tech.md) - Tài liệu Kỹ thuật Trung tâm & Toàn bộ Roadmap**:
   - Chứa lộ trình chi tiết 6 Cấp độ (từ C/C++ cấp thấp, Vi điều khiển Bare-metal, ARM Cortex-M, FreeRTOS, Toán động học Robot đến ROS2, SLAM, Nav2 và Edge AI).
   - Quy chuẩn định dạng bài học trực quan (có sơ đồ Mermaid, ASCII thanh ghi, giản đồ thời gian).
   - Chuẩn câu hỏi trắc nghiệm (Quiz) củng cố kiến thức và tư duy gỡ lỗi (debugging).
2. 📝 **[`process.md`](./process.md) - Nhật ký Tiến trình & Lịch sử Commit**:
   - **QUY CHUẨN BẮT BUỘC**: Ghi lại chi tiết tiến độ học tập, bài học đã viết/học, lý do thay đổi và bài học rút ra qua từng commit.

---

## 🗺️ TỔNG QUAN LỘ TRÌNH 6 CẤP ĐỘ

| Cấp độ | Tên Chuyên Đề | Trọng Tâm Kiến Thức | Thư Mục |
| :---: | :--- | :--- | :--- |
| **0** | **Nền Tảng Toán & Khoa Học Máy Tính** | Cấp phát bộ nhớ C, Con trỏ, Bitwise, Đại số tuyến tính 3D, Vật lý điện tử | [`00-prerequisites/`](./00-prerequisites/) |
| **1** | **Vi Điều Khiển & Điện Tử Cơ Bản** | Kiến trúc MCU, Bare-metal GPIO, Ngắt ngoài EXTI, Timer/PWM, UART, SPI, I2C | [`01-embedded-fundamentals/`](./01-embedded-fundamentals/) |
| **2** | **ARM Cortex-M & RTOS Chuyên Sâu** | Nhân ARM, NVIC, DMA, Quá trình Bootloader, Linker Script, FreeRTOS đa nhiệm | [`02-mcu-architecture-arm/`](./02-mcu-architecture-arm/) & [`03-rtos-concurrency/`](./03-rtos-concurrency/) |
| **3** | **Hệ Thống Nhúng Nâng Cao & Mạng** | CAN Bus, RS-485 Modbus, Wi-Fi/BLE/MQTT, Linux Nhúng căn bản | [`03-rtos-concurrency/`](./03-rtos-concurrency/) |
| **4** | **Nền Tảng Robotics & Điều Khiển Tự Động** | Encoder, IMU, Lọc Kalman (KF/EKF), Điều khiển PID, Động học vi sai & cánh tay robot | [`04-robotics-foundations/`](./04-robotics-foundations/) |
| **5** | **Robot Thông Minh: ROS2, SLAM & Vision** | ROS2 Nodes/Topics/Services/Actions, URDF, Mô phỏng Gazebo, Lidar SLAM, Nav2 | [`05-ros2-and-simulation/`](./05-ros2-and-simulation/) |
| **6** | **Dự Án Capstone & Công Nghiệp** | Xe tự hành AMR hoàn chỉnh, Cánh tay robot, CI/CD và Unit Testing cho Firmware | [`06-advanced-edge-ai/`](./06-advanced-edge-ai/) |

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```
Embeded-system/
├── tech.md                          # Kiến trúc kỹ thuật và Roadmap chi tiết
├── process.md                       # Nhật ký tiến trình làm việc từng commit
├── README.md                        # Giới thiệu tổng quan (File này)
├── templates/                       # Mẫu chuẩn hóa soạn thảo
│   ├── lesson-template.md           # Template bài giảng lý thuyết chuẩn
│   ├── lab-template.md              # Template bài tập thực hành phần cứng/mô phỏng
│   └── quiz-template.md             # Template bộ câu hỏi trắc nghiệm đánh giá
├── 00-prerequisites/                # Cấp độ 0: Nền tảng
├── 01-embedded-fundamentals/        # Cấp độ 1: MCU Bare-metal & Ngoại vi
├── 02-mcu-architecture-arm/         # Cấp độ 2A: ARM Cortex-M nội bộ
├── 03-rtos-concurrency/             # Cấp độ 2B & 3: FreeRTOS & Giao thức mạng
├── 04-robotics-foundations/         # Cấp độ 4: Toán học & Điều khiển Robot
├── 05-ros2-and-simulation/          # Cấp độ 5: ROS2, SLAM & Nav2
├── 06-advanced-edge-ai/             # Cấp độ 6: Capstone Project & Edge AI
└── assets/                          # Sơ đồ mạch, hình ảnh minh họa, waveform
```

---

## 🛠️ CÔNG CỤ ĐỀ XUẤT CHO VIỆC HỌC TẬP

- **Mô phỏng (Không cần phần cứng ngay)**: [Wokwi Simulator](https://wokwi.com/), Renode, Gazebo 3D.
- **Phần cứng thực tế giá rẻ**: Board STM32 Nucleo/BlackPill (F401/F411), Kit ESP32, Mạch nạp ST-Link V2, Mạch đo xung Logic Analyzer 24M 8CH, Cảm biến MPU6050, Động cơ Encoder.
- **Phần mềm**: VS Code, `arm-none-eabi-gcc`, OpenOCD, Ubuntu 22.04 LTS (chạy ROS2 Humble).

---
*Chúc bạn có một hành trình tự học vững vàng và sớm làm chủ công nghệ Hệ thống Nhúng & Robotics!*
