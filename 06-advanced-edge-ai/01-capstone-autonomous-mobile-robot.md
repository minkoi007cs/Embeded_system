# Dự Án Capstone 1: Xây Dựng Xe Tự Hành Thông Minh AMR (Autonomous Mobile Robot) Hoàn Chỉnh

> **Chuyên mục**: Level 6 - Đồ Án Kỹ Sư Thực Chiến  
> **Thời lượng ước tính**: 120 phút  
> **Tài liệu tham chiếu**: [`tech.md`](../tech.md) & [`process.md`](../process.md)

---

## 1. TỔNG QUAN DỰ ÁN & MỤC TIÊU ĐỒ ÁN (CAPSTONE OVERVIEW)

Dự án Capstone AMR là sự kết hợp toàn diện của mọi kiến thức từ Cấp độ 0 đến Cấp độ 5:
- **Tầng cứng cấp thấp (Low-Level Firmware)**: Vi điều khiển STM32F4 / ESP32 chạy FreeRTOS, đọc 2 Encoder vi sai, đọc cảm biến IMU 6-DOF, điều khiển 2 vòng lặp PID tốc độ động cơ 100Hz, và chạy Node **Micro-ROS**.
- **Tầng tính toán cấp cao (High-Level Compute)**: Máy tính nhúng Raspberry Pi 4 chạy Ubuntu 22.04 + ROS2 Humble, kết nối cảm biến **2D Lidar RPLidar A1M8** và **Camera**, chạy gói **SLAM Toolbox** để lập bản đồ kho hàng thời gian thực và ngăn xếp **Nav2** tự động di chuyển tránh vật cản.

---

## 2. SƠ ĐỒ KIẾN TRÚC PHẦN CỨNG TOÀN DIỆN (SYSTEM ARCHITECTURE)

```
┌─────────────────────────────────────────────────────────────┐
│              HIGH-LEVEL COMPUTE (Raspberry Pi 4)            │
│  - Ubuntu 22.04 LTS Server                                  │
│  - ROS2 Humble Middleware                                   │
│  - SLAM Toolbox: Lập bản đồ lưới Occupancy Grid             │
│  - Nav2: Điều hướng tự hành tránh chướng ngại vật động      │
│  - TF2 Transform Tree (map -> odom -> base_link -> laser)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
               Cổng USB / UART Serial (Baudrate 115200)
               Giao thức: Micro-ROS Agent <-> Client
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             LOW-LEVEL CONTROLLER (STM32F401RE / ESP32)      │
│  - FreeRTOS Real-time Kernel                                │
│  - Micro-ROS Client Node ("stm32_diff_drive_base")          │
│    + Sub: /cmd_vel (v_x, omega_z)                           │
│    + Pub: /odom, /imu/data, /battery_voltage                │
│  - Task 1 (100Hz): Bộ điều khiển PID tốc độ động cơ        │
│  - Task 2 (100Hz): Đọc Encoder và Cảm biến IMU MPU6050      │
│  - Task 3 (10Hz) : Giám sát an toàn điện áp & Quản lý sạc   │
└──────────────┬──────────────┬──────────────┬────────────────┘
               │ PWM          │ Xung A, B    │ I2C (400kHz)
        ┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
        │  Mạch Cầu H ││ 2x Encoder  ││ Cảm biến    │
        │  L298N / TB ││ Quang vi sai││ IMU MPU6050 │
        └──────┬──────┘└─────────────┘└─────────────┘
               │ Điện áp động cơ
        ┌──────▼──────┐
        │ 2x Động cơ  │
        │ DC GA25 12V │
        └─────────────┘
```

---

## 3. CÁC BƯỚC TRIỂN KHAI THỰC TẾ TỪ CON SỐ 0

### Bước 1: Lắp ráp cơ khí và đấu nối dây dẫn
1. Gắn 2 động cơ DC kèm đĩa Encoder vào khung gầm xe, 1 bánh xe đa hướng (Caster Wheel) ở phía trước để giữ thăng bằng.
2. Nối kênh xung Encoder A và B vào các chân Timer Encoder Mode của STM32 (ví dụ PA0, PA1 cho TIM2).
3. Đấu nối dây PWM từ TIM3 ra mạch cầu H để điều khiển tốc độ.

### Bước 2: Lập trình Firmware STM32 với FreeRTOS
1. Cấu hình Timer 2 và Timer 4 ở chế độ **Encoder Interface Mode (X4 decoding)**.
2. Thiết lập hàm ngắt chu kỳ $10 \\text{ ms}$ ($100 \\text{ Hz}$) để tính vận tốc góc $\\omega$ của 2 bánh xe.
3. Chạy 2 bộ điều khiển PID độc lập cho 2 bánh xe để đảm bảo khi nhận lệnh đi thẳng, xe không bị lệch sang trái hoặc phải do sai lệch cơ khí.
4. Cài đặt Micro-ROS client, đăng ký nhận bản tin `/cmd_vel` và chuyển đổi sang tốc độ đặt cho 2 bánh xe:
   $$v_L = v_x - \\frac{\\omega_z \\cdot L}{2}$$
   $$v_R = v_x + \\frac{\\omega_z \\cdot L}{2}$$

### Bước 3: Cấu hình ROS2 trên Raspberry Pi 4
1. Cài đặt Ubuntu Server 22.04 LTS 64-bit và cài đặt ROS2 Humble.
2. Viết file mô tả robot **URDF / Xacro** mô tả chính xác kích thước xe, vị trí bánh xe, và vị trí cảm biến Lidar.
3. Chạy node Micro-ROS Agent:
   ```bash
   ros2 run micro_ros_agent micro_ros_agent serial --dev /dev/ttyUSB0 -b 115200
   ```
4. Kiểm tra việc xuất bản dữ liệu:
   ```bash
   ros2 topic echo /odom
   ```

### Bước 4: Lập bản đồ SLAM và Điều hướng Nav2
1. Khởi động node Lidar và gói **SLAM Toolbox**:
   ```bash
   ros2 launch slam_toolbox online_async_launch.py
   ```
2. Dùng tay cầm điều khiển (hoặc phím điều hướng `teleop_twist_keyboard`) lái robot đi vòng quanh căn phòng để dựng bản đồ hoàn chỉnh.
3. Lưu bản đồ:
   ```bash
   ros2 run nav2_map_server map_saver_cli -f my_warehouse_map
   ```
4. Khởi động ngăn xếp **Nav2**:
   ```bash
   ros2 launch nav2_bringup bringup_launch.py map:=my_warehouse_map.yaml
   ```
5. Mở **RViz2**, dùng công cụ *2D Goal Pose* bấm vào một điểm bất kỳ trên bản đồ: Robot sẽ tự động tính toán đường đi mượt mà, chủ động tránh bàn ghế và người đi lại, cập nhật quỹ đạo liên tục và dừng chính xác tại điểm hẹn!

---

## 4. BÀI TẬP TRẮC NGHIỆM CỦNG CỐ KIẾN THỨC (QUIZ)

#### Câu hỏi 1: Trong ngăn xếp điều hướng tự hành Nav2, sự khác biệt căn bản giữa Global Costmap (Bản đồ chi phí toàn cục) và Local Costmap (Bản đồ chi phí cục bộ) là gì?
- [ ] A. Global Costmap chỉ dùng cho xe 4 bánh, Local Costmap dùng cho xe 2 bánh
- [ ] B. Global Costmap tính toán đường đi tổng thể từ điểm xuất phát đến đích trên toàn bộ bản đồ tĩnh đã lưu; trong khi Local Costmap là một cửa sổ cuộn (Rolling Window) nhỏ bao quanh robot cập nhật liên tục từ Lidar để phát hiện và né tránh các chướng ngại vật động bất ngờ (như người hoặc thùng hàng mới đặt)
- [ ] C. Global Costmap được lưu trên đám mây, Local Costmap lưu trong RAM của STM32
- [ ] D. Cả 2 bản đồ đều làm cùng một nhiệm vụ duy nhất

<details>
<summary><b>👉 Xem Đáp Án & Giải Thích Chi Tiết</b></summary>

**Đáp án đúng: B**

**Giải thích chuyên sâu:**  
Đây là kiến trúc phân tầng kinh điển trong robot tự hành. Bộ quy hoạch toàn cục (Global Planner) dựa vào Global Costmap để tìm con đường ngắn nhất trên bản đồ tĩnh của cả tòa nhà. Nhưng trên đường đi thực tế, nếu có người bước ngang qua, Local Costmap (được cập nhật tức thời ở tần số cao từ tia quét Lidar) sẽ đánh dấu vùng nguy hiểm quanh người đó và kích hoạt bộ điều khiển cục bộ (Local Controller) bẻ lái né tránh tức thì mà không cần tính toán lại toàn bộ lộ trình dài.
</details>

---

> 💡 *Sau khi hoàn thành bài học này, đừng quên cập nhật tiến độ vào [`process.md`](../process.md) trước khi commit!*
