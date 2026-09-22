# MẪU THIẾT KẾ BỘ CÂU HỎI TRẮC NGHIỆM & PHẢN XẠ KỸ THUẬT (QUIZ TEMPLATE)

> **Mục tiêu**: Đánh giá thực chất khả năng hiểu bản chất phần cứng, đọc hiểu mã nguồn C/C++, phát hiện bug và phân tích tín hiệu.

---

### DẠNG 1: TRẮC NGHIỆM KHÁI NIỆM & NGUYÊN LÝ BẢN CHẤT (CONCEPTUAL)

#### Câu hỏi [Số]: [Đặt câu hỏi kiểm tra bản chất hiện tượng/nguyên lý?]
- [ ] A. [Phương án gây nhiễu 1]
- [ ] B. [Phương án đúng]
- [ ] C. [Phương án gây nhiễu 2]
- [ ] D. [Phương án gây nhiễu 3]

<details>
<summary><b>👉 Xem Đáp Án & Giải Thích Chi Tiết</b></summary>

**Đáp án đúng: B**

**Giải thích chuyên sâu:**
- **Tại sao B đúng**: [Phân tích chi tiết cơ chế vật lý / logic hệ thống].
- **Tại sao A, C, D sai**:
  - *Phương án A sai vì*: ...
  - *Phương án C sai vì*: ...
  - *Phương án D sai vì*: ...
</details>

---

### DẠNG 2: PHÂN TÍCH MÃ NGUỒN & PHÁT HIỆN LỖI (CODE TRACE & BUG SPOTTING)

#### Câu hỏi [Số]: Cho đoạn mã C sau đây dùng trong hệ thống nhúng giao tiếp ngắt. Đoạn mã này tồn tại lỗi tiềm ẩn nguy hiểm nào?

```c
volatile uint8_t rx_flag = 0;
uint16_t sensor_data = 0;

void USART1_IRQHandler(void) {
    if (USART1->SR & USART_SR_RXNE) {
        sensor_data = USART1->DR;
        rx_flag = 1;
    }
}

int main(void) {
    init_hardware();
    while (1) {
        if (rx_flag == 1) {
            process_data(sensor_data);
            rx_flag = 0;
        }
    }
}
```

- [ ] A. Biến `rx_flag` phải khai báo là `const` thay vì `volatile`.
- [ ] B. `sensor_data` (16-bit) không được bảo vệ khi đọc/ghi trên MCU 8-bit dẫn tới lỗi Race Condition (Non-atomic access) và `rx_flag` cần xóa cờ đúng thứ tự.
- [ ] C. Hàm `process_data()` chạy quá chậm làm nổ thanh ghi CPU.
- [ ] D. USART1 không thể kích hoạt ngắt nếu không có DMA.

<details>
<summary><b>👉 Xem Đáp Án & Giải Thích Chi Tiết</b></summary>

**Đáp án đúng: B**

**Giải thích chuyên sâu:**
- Trên các kiến trúc MCU 8-bit hoặc bus dữ liệu hẹp, việc truy xuất biến 16-bit `sensor_data` tốn 2 chu kỳ lệnh (đọc byte cao rồi byte thấp). Nếu ngắt xảy ra ngay giữa 2 chu kỳ này, hàm `main` sẽ đọc phải giá trị bị xé lẻ (corrupted data).
- Ngoài ra, nếu `process_data` mất nhiều thời gian, một byte mới tới từ UART có thể ghi đè làm mất dữ liệu trước khi `rx_flag` được reset về 0 (Buffer Overrun).
</details>

---

### DẠNG 3: ĐỌC DẠNG SÓNG TÍN HIỆU & GIẢN ĐỒ THỜI GIAN (WAVEFORM ANALYSIS)

#### Câu hỏi [Số]: Quan sát giản đồ tín hiệu SPI dưới đây. Xác định cấu hình cực tính xung nhịp (CPOL) và pha xung nhịp (CPHA):

```
SCK  : ───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───
          └───┘   └───┘   └───┘   └───┘   └───┘   

MOSI : ───[ Bit 7 ]───[ Bit 6 ]───[ Bit 5 ]───────
           ^           ^           ^
      Lấy mẫu     Lấy mẫu     Lấy mẫu
```

- [ ] A. CPOL = 0, CPHA = 0 (Xung nhịp rỗi mức LOW, lấy mẫu ở sườn lên đầu tiên).
- [ ] B. CPOL = 1, CPHA = 0 (Xung nhịp rỗi mức HIGH, lấy mẫu ở sườn xuống đầu tiên).
- [ ] C. CPOL = 0, CPHA = 1 (Xung nhịp rỗi mức LOW, lấy mẫu ở sườn xuống thứ hai).
- [ ] D. CPOL = 1, CPHA = 1 (Xung nhịp rỗi mức HIGH, lấy mẫu ở sườn lên thứ hai).

<details>
<summary><b>👉 Xem Đáp Án & Giải Thích Chi Tiết</b></summary>

**Đáp án đúng: B**

**Giải thích chuyên sâu:**
- **CPOL (Clock Polarity)**: Trước khi truyền nhận dữ liệu, đường SCK ở trạng thái mức cao (HIGH) -> `CPOL = 1`.
- **CPHA (Clock Phase)**: Dữ liệu trên đường MOSI được chốt (sample) ở sườn xung chuyển mạch đầu tiên (sườn xuống - falling edge) -> `CPHA = 0`.
</details>
