# Bài 01: Kiến Trúc Nhân ARM Cortex-M: Core Registers, Modes & Stacks (MSP vs PSP)

> **Chuyên mục**: Level 2 - ARM Cortex-M & FreeRTOS  
> **Thời lượng ước tính**: 65 phút  
> **Tài liệu tham chiếu**: [`tech.md`](../tech.md) & [`process.md`](../process.md)

---

## 1. MỤC TIÊU BÀI HỌC (LEARNING OBJECTIVES)
- [ ] Nắm vững cấu trúc tập thanh ghi nội bộ của nhân ARM Cortex-M (R0 - R15, PSR, PRIMASK, CONTROL).
- [ ] Phân biệt rõ ràng 2 chế độ hoạt động: **Thread Mode** và **Handler Mode**.
- [ ] Hiểu lý do vì sao ARM Cortex-M trang bị 2 con trỏ ngăn xếp: **MSP (Main Stack Pointer)** và **PSP (Process Stack Pointer)** và ứng dụng sống còn của chúng trong hệ điều hành thời gian thực (RTOS).

---

## 2. BẢN CHẤT KIẾN TRÚC TẬP THANH GHI NỘI BỘ (ARM CORE REGISTERS)

Nhân ARM Cortex-M (M0, M3, M4, M7) sở hữu tập thanh ghi 32-bit gồm:

```
TẬP THANH GHI NỘI BỘ CỦA NHÂN ARM CORTEX-M:

┌──────────────────────────────────────────────┐
│  R0 - R12: Thanh ghi đa dụng (General Purpose)│ ◄── Dùng tính toán số học, logic
├──────────────────────────────────────────────┤
│  R13 (SP): Con trỏ ngăn xếp (Stack Pointer)  │ ◄── Gồm 2 con trỏ vật lý: MSP & PSP
├──────────────────────────────────────────────┤
│  R14 (LR): Con trỏ liên kết (Link Register)  │ ◄── Lưu địa chỉ trở về khi gọi hàm (BL/BLX)
├──────────────────────────────────────────────┤
│  R15 (PC): Bộ đếm chương trình (Program Ctr) │ ◄── Chứa địa chỉ lệnh kế tiếp CPU thực thi
├──────────────────────────────────────────────┤
│  xPSR    : Thanh ghi trạng thái chương trình │ ◄── Cờ APSR (N, Z, C, V), IPSR, EPSR
├──────────────────────────────────────────────┤
│  CONTROL : Thanh ghi điều khiển đặc quyền     │ ◄── Chọn MSP hay PSP, Privileged/Unprivileged
└──────────────────────────────────────────────┘
```

---

## 3. CƠ CHẾ 2 CHẾ ĐỘ THỰC THI (THREAD MODE VS HANDLER MODE)

ARM thiết kế vi xử lý để chạy mượt mà cả phần mềm Bare-metal lẫn các hệ điều hành như FreeRTOS:

1. **Thread Mode**:
   - Chế độ chạy thông thường của các hàm ứng dụng (`main()`, hoặc các tác vụ Task trong FreeRTOS).
   - Có thể chạy ở mức đặc quyền (Privileged) hoặc không đặc quyền (Unprivileged).
   - Có thể chọn dùng con trỏ ngăn xếp **MSP** hoặc **PSP**.

2. **Handler Mode**:
   - Tự động kích hoạt khi có bất kỳ ngoại lệ (Exception) hoặc ngắt ngoại vi (ISR) nào xảy ra (ví dụ: ngắt Timer, ngắt UART, ngắt SysTick).
   - **Luôn luôn chạy ở mức đặc quyền cao nhất (Privileged)**.
   - **Bắt buộc luôn luôn sử dụng con trỏ ngăn xếp MSP**.

---

## 4. CON TRỎ NGĂN XẾP KÉP: MSP VS PSP

### Tại sao lại cần 2 con trỏ ngăn xếp?
Trong hệ điều hành đa nhiệm (RTOS), mỗi Task có một vùng Stack riêng.
- Nếu chỉ có 1 con trỏ SP duy nhất: Khi một Task bị lỗi tràn Stack, toàn bộ hệ thống ngắt của vi điều khiển cũng sẽ dùng chung vùng nhớ hỏng đó và sập toàn bộ hệ điều hành!
- Nhờ cơ chế 2 con trỏ ngăn xếp:
  - Tất cả các Task người dùng chạy trên con trỏ **PSP** (mỗi Task trỏ tới một vùng RAM khác nhau).
  - Nhân Kernel và toàn bộ các hàm phục vụ ngắt (ISR) chạy biệt lập trên **MSP**.
  - Nếu Task 1 bị lỗi tràn ngăn xếp (Stack Overflow), ngắt HardFault xảy ra sẽ lập tức chuyển sang dùng MSP an toàn, ghi log lỗi và khởi động lại Task đó mà không làm tê liệt toàn bộ phần cứng robot!

---

## 5. BÀI TẬP TRẮC NGHIỆM CỦNG CỐ KIẾN THỨC (QUIZ)

#### Câu hỏi 1: Khi một ngắt phần cứng (ví dụ ngắt Timer) xảy ra trên vi xử lý ARM Cortex-M, CPU sẽ tự động làm điều gì đầu tiên trước khi nhảy vào hàm phục vụ ngắt (ISR)?
- [ ] A. Tự động xóa sạch toàn bộ dữ liệu trong RAM
- [ ] B. Tự động chuyển sang Handler Mode và đẩy (Push) một khung ngăn xếp gồm 8 thanh ghi (R0-R3, R12, LR, PC, xPSR) vào Stack hiện tại (Stack Frame Stacking)
- [ ] C. Tự động tăng điện áp nguồn lên 5V
- [ ] D. Tắt toàn bộ xung nhịp hệ thống

<details>
<summary><b>👉 Xem Đáp Án & Giải Thích Chi Tiết</b></summary>

**Đáp án đúng: B**

**Giải thích chuyên sâu:**  
Đây là tính năng phần cứng cực kỳ thông minh của ARM Cortex-M gọi là "Hardware Context Stacking". CPU tự động dùng phần cứng để lưu 8 thanh ghi cốt lõi vào ngăn xếp chỉ trong 12 chu kỳ xung nhịp mà không cần lập trình viên phải viết mã assembly. Điều này giúp các hàm ISR có thể viết hoàn toàn bằng ngôn ngữ C thông thường!
</details>

---

> 💡 *Sau khi hoàn thành bài học này, đừng quên cập nhật tiến độ vào [`process.md`](../process.md) trước khi commit!*
