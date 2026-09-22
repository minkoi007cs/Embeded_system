# Bài 01: Bản Chất Ngoại Vi GPIO: Push-Pull, Open-Drain & Lập Trình Thanh Ghi Bare-Metal

> **Chuyên mục**: Level 1 - Vi Điều Khiển & Ngoại Vi  
> **Thời lượng ước tính**: 55 phút  
> **Tài liệu tham chiếu**: [`tech.md`](../tech.md) & [`process.md`](../process.md)

---

## 1. MỤC TIÊU BÀI HỌC (LEARNING OBJECTIVES)
- [ ] Hiểu cặn kẽ cấu trúc bán dẫn bên trong một khối GPIO vi điều khiển (cặp transistor P-MOS và N-MOS, diode bảo vệ ESD).
- [ ] Phân biệt bản chất vật lý giữa chế độ **Push-Pull** (Đẩy-Kéo) và **Open-Drain** (Cực máng hở).
- [ ] Tự viết mã nguồn C điều khiển trực tiếp thanh ghi `MODER`, `ODR`, `BSRR` chuẩn bare-metal thanh ghi mà không dùng thư viện trừu tượng HAL.

---

## 2. BẢN CHẤT MẠCH ĐIỆN TỬ CỦA MỘT CHÂN GPIO

Một chân I/O không chỉ đơn thuần là một sợi dây dẫn nối ra ngoài chip; nó được tích hợp một hệ thống mạch bảo vệ và chuyển mạch phức tạp:

```
SƠ ĐỒ NGUYÊN LÝ MẠCH CỦA MỘT CHÂN GPIO (STM32 / ARM CORTEX-M):

                     VDD (3.3V)
                         │
                    ┌────┴────┐
                    │  Diode  │ (Bảo vệ quá áp > 3.3V)
                    └────┬────┘
                         │
     Đường Điều Khiển    │           Transistor P-MOS
        Output Data ─────┼───────────[ P-MOS ]────────┐
                         │              │             │
                         │              │             ├───► CHÂN GPIO RA NGOÀI
                         │              │             │     (I/O Pin)
     Đường Điều Khiển    │           Transistor N-MOS │
        Output Data ─────┼───────────[ N-MOS ]────────┘
                         │              │
                    ┌────┴────┐        GND (0V)
                    │  Diode  │ (Bảo vệ điện áp âm < 0V)
                    └────┬────┘
                         │
                        GND
```

### 2.1. Chế độ Push-Pull (Đẩy - Kéo)
- Khi phần mềm xuất mức **HIGH (1)**: Transistor P-MOS dẫn (mở thông), nối chân GPIO thẳng lên nguồn $V_{DD}$ (3.3V). Dòng điện được "bơm" (Source current) từ nguồn qua P-MOS ra tải bên ngoài.
- Khi phần mềm xuất mức **LOW (0)**: P-MOS ngắt, Transistor N-MOS dẫn, kéo chân GPIO xuống mass ($GND = 0V$). Dòng điện từ tải bên ngoài bị "hút" (Sink current) qua N-MOS xuống đất.
- **Ứng dụng**: Điều khiển trực tiếp đèn LED, điều khiển chân chọn chip CS trong chuẩn SPI, xuất xung PWM điều khiển tốc độ động cơ DC.

### 2.2. Chế độ Open-Drain (Cực Máng Hở)
- Trong chế độ này, transistor P-MOS phía trên bị ngắt kết nối hoàn toàn khỏi mạch.
- Khi phần mềm xuất mức **LOW (0)**: N-MOS dẫn, kéo chân xuống $0V$.
- Khi phần mềm xuất mức **HIGH (1)**: N-MOS ngắt. Chân rơi vào trạng thái lơ lửng trở kháng cao (High-Z / Floating).
- **Điện trở kéo lên (Pull-up Resistor)**: Bắt buộc phải có một điện trở (thường từ $2.2k\\Omega - 10k\\Omega$) nối từ chân GPIO lên nguồn $V_{DD}$. Khi N-MOS ngắt, điện trở này sẽ kéo điện áp trên chân lên mức 3.3V.
- **Ứng dụng**: Chuẩn giao tiếp **I2C**, giao tiếp 1-Wire (cảm biến nhiệt độ DS18B20). Nhiều thiết bị có thể cùng đấu chung chân trên một đường dây mà không sợ cháy chip khi phát tín hiệu lệch pha (Wired-AND logic).

---

## 3. PHÂN TÍCH THANH GHI BẢN ĐỒ BỘ NHỚ (STM32F4)

Địa chỉ cơ sở của khối GPIOA: `0x40020000`.

### 3.1. Thanh ghi Chế độ `GPIOA_MODER` (Offset: `0x00`)
Mỗi chân GPIO chiếm 2 bit trong thanh ghi 32-bit:
```
Bit [2y+1 : 2y] với y là số thứ tự chân (0 đến 15):
- 00: Input Mode (Chế độ đọc dữ liệu)
- 01: General Purpose Output Mode (Chế độ xuất tín hiệu số)
- 10: Alternate Function Mode (Chế độ chức năng phụ: UART/SPI/Timer)
- 11: Analog Mode (Chế độ tương tự: dùng cho ADC/DAC)
```

### 3.2. Thanh ghi Dữ liệu Ngõ Ra `GPIOA_ODR` (Offset: `0x14`)
Bit thứ $y$ tương ứng với chân $PA_y$:
- Ghi 1: Xuất mức HIGH (3.3V trong chế độ Push-Pull).
- Ghi 0: Xuất mức LOW (0V).

### 3.3. Thanh ghi Thao Tác Nguyên Tử `GPIOA_BSRR` (Offset: `0x18`)
- 16 bit thấp `[15:0]`: Set bit tương ứng lên 1 (BSy).
- 16 bit cao `[31:16]`: Reset bit tương ứng về 0 (BRy).
- **Điểm vượt trội**: Ghi vào BSRR là thao tác nguyên tử (Atomic), không cần chu kỳ Đọc-Sửa-Ghi (Read-Modify-Write) như ODR, loại bỏ hoàn toàn rủi ro bị ngắt ISR ghi đè sai dữ liệu!

---

## 4. MÃ NGUỒN BARE-METAL C MẪU ĐIỀU KHIỂN LED PA5

```c
#include <stdint.h>

/* Định nghĩa địa chỉ thanh ghi phần cứng */
#define RCC_BASE            0x40023800
#define RCC_AHB1ENR         (*(volatile uint32_t *)(RCC_BASE + 0x30))

#define GPIOA_BASE          0x40020000
#define GPIOA_MODER         (*(volatile uint32_t *)(GPIOA_BASE + 0x00))
#define GPIOA_ODR           (*(volatile uint32_t *)(GPIOA_BASE + 0x14))
#define GPIOA_BSRR          (*(volatile uint32_t *)(GPIOA_BASE + 0x18))

static void delay_simple(volatile uint32_t count) {
    while (count--) {
        __asm__("nop"); // Lệnh rỗng tiêu tốn 1 chu kỳ máy
    }
}

int main(void) {
    /* 1. Bật xung Clock cho GPIO Port A */
    RCC_AHB1ENR |= (1 << 0); // Bit 0: GPIOAEN

    /* 2. Cấu hình chân PA5 làm Output Mode (01) */
    GPIOA_MODER &= ~(3 << (5 * 2)); // Xóa 2 bit [11:10] về 00
    GPIOA_MODER |=  (1 << (5 * 2)); // Ghi giá trị 01 vào bit [11:10]

    /* 3. Vòng lặp nhấp nháy LED */
    while (1) {
        // Bật LED PA5 lên HIGH bằng thanh ghi BSRR (Bit 5 = 1)
        GPIOA_BSRR = (1 << 5);
        delay_simple(500000);

        // Tắt LED PA5 về LOW bằng thanh ghi BSRR (Bit 5+16 = 1)
        GPIOA_BSRR = (1 << (5 + 16));
        delay_simple(500000);
    }
}
```

---

## 5. BÀI TẬP TRẮC NGHIỆM CỦNG CỐ KIẾN THỨC (QUIZ)

#### Câu hỏi 1: Nếu cấu hình một chân GPIO ở chế độ Input Floating (đầu vào lơ lửng, không có điện trở kéo Pull-up hay Pull-down), khi để hở chân cắm ngoài không khí, hàm đọc trạng thái `IDR` sẽ trả về kết quả gì?
- [ ] A. Luôn luôn trả về số 0
- [ ] B. Luôn luôn trả về số 1
- [ ] C. Giá trị nhảy loạn xạ ngẫu nhiên (chập chờn) giữa 0 và 1 do nhiễu sóng điện từ môi trường
- [ ] D. Vi điều khiển bị treo ngay lập tức

<details>
<summary><b>👉 Xem Đáp Án & Giải Thích Chi Tiết</b></summary>

**Đáp án đúng: C**

**Giải thích chuyên sâu:**  
Khi chân GPIO ở chế độ Floating, cổng vào nối với cực Gate của transistor MOSFET có trở kháng cực kỳ cao (hàng Mega-ohm). Bất kỳ sóng điện từ, tĩnh điện hay bàn tay người chạm gần đều có thể cảm ứng ra điện áp ký sinh làm mức logic nhảy liên tục giữa 0 và 1. Đó là lý do khi nối nút bấm (Push Button), ta luôn phải kích hoạt điện trở kéo Pull-up (hoặc Pull-down) để cố định điện áp khi nút không được ấn.
</details>

---

> 💡 *Sau khi hoàn thành bài học này, đừng quên cập nhật tiến độ vào [`process.md`](../process.md) trước khi commit!*
