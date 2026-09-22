# MẪU THIẾT KẾ BÀI THỰC HÀNH & LAB KỸ THUẬT (LAB TEMPLATE)

> **Tên bài thực hành**: [LAB-XX]: [Tiêu đề thực hành]  
> **Cấp độ**: [Level X] | **Hình thức**: [Mô phỏng Wokwi / Board phần cứng thật]  
> **Thời gian dự kiến**: [60 - 90 phút]

---

## 1. MỤC TIÊU THỰC HÀNH
- [ ] Thiết lập môi trường biên dịch và cấu hình chân cắm ngoại vi.
- [ ] Viết driver C/C++ hoàn chỉnh giải quyết bài toán đặt ra.
- [ ] Đo kiểm và kiểm chứng dạng sóng tín hiệu trên thiết bị đo (Logic Analyzer / Serial Plotter).

---

## 2. YÊU CẦU THIẾT BỊ & CÔNG CỤ

### 2.1. Phương án 1: Mô phỏng trực tuyến (Simulator - Miễn phí 100%)
- Trình mô phỏng: **Wokwi** (hoặc Gazebo / Webots nếu là bài Robotics).
- Link project mẫu Wokwi: `https://wokwi.com/projects/...`

### 2.2. Phương án 2: Phần cứng thật (Hardware Bench)
| Linh kiện | Số lượng | Ghi chú |
| :--- | :---: | :--- |
| Board STM32F401 / ESP32 | 1 | Board điều khiển chính |
| Cảm biến / Module ngoại vi | 1 | MPU6050 / OLED SSD1306 / L298N |
| Dây cắm Breadboard | 10 | Đực - Cái |
| Thiết bị USB Logic Analyzer | 1 | Để bắt xung kiểm tra |

---

## 3. SƠ ĐỒ ĐẤU DÂY & KẾT NỐI (PINOUT & WIRING)

```
       MCU (STM32 / ESP32)                  MODULE NGOẠI VI
      ┌────────────────────┐              ┌────────────────┐
      │               3.3V ├──────────────┤ VCC            │
      │                GND ├──────────────┤ GND            │
      │        PA5 (SCK)   ├──────────────┤ SCL / SCK      │
      │        PA7 (MOSI)  ├──────────────┤ SDA / MOSI     │
      │        PA4 (CS)    ├──────────────┤ CS             │
      └────────────────────┘              └────────────────┘
```

---

## 4. CÁC BƯỚC TIẾN HÀNH (STEP-BY-STEP PROCEDURE)

### Bước 1: Khởi tạo Project & Cấu hình Clock
- Cấu hình tần số hoạt động của MCU.
- Bật xung Clock cho các Port GPIO và ngoại vi liên quan.

### Bước 2: Viết hàm Driver cơ sở
- Hoàn thành các hàm `Init()`, `Read()`, `Write()`.

### Bước 3: Kiểm thử vòng lặp chính & Xử lý ngắt
- Nạp code và kiểm tra phản hồi qua cổng UART Terminal.

---

## 5. THỬ THÁCH NÂNG CAO (CHALLENGE / BONUS)
- [ ] *Thử thách 1*: Tối ưu hóa việc truyền dữ liệu bằng ngắt DMA thay vì vòng lặp `while polling`.
- [ ] *Thử thách 2*: Xử lý ngoại lệ khi ngoại vi bị mất kết nối (Timeout recovery / Bus reset).
