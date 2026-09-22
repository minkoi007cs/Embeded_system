/**
 * EMBEDDED SYSTEMS & ROBOTICS - FULL COMPREHENSIVE CURRICULUM DATA
 * Level 0 through Level 6
 */

const CURRICULUM_DATA = [
  // =========================================================================
  // LEVEL 0: NỀN TẢNG TOÁN HỌC, ĐIỆN TỬ VÀ KHOA HỌC MÁY TÍNH
  // =========================================================================
  {
    id: "level-0",
    number: 0,
    title: "Level 0: Nền Tảng Toán & Khoa Học Máy Tính",
    shortTitle: "Level 0: Nền Tảng",
    badgeColor: "#38bdf8",
    description: "Xây dựng tư duy phần mềm cấp thấp, bản đồ phân vùng bộ nhớ C, con trỏ, bitwise, đại số tuyến tính vector cho robotics và các định luật mạch điện cơ bản.",
    lessons: [
      {
        id: "l0-c-memory-layout",
        title: "Bản Đồ Phân Vùng Bộ Nhớ Trong Lập Trình C Nhúng",
        duration: "45 phút",
        difficulty: "Cơ bản",
        summary: "Phân biệt chi tiết 5 phân vùng bộ nhớ: Text, Data, BSS, Heap và Stack trên vi điều khiển.",
        content: `
## 1. Mục Tiêu Bài Học
- Hiểu rõ 5 phân vùng bộ nhớ cốt lõi trong hệ thống nhúng: **Text (.text)**, **Initialized Data (.data)**, **Uninitialized Data (.bss)**, **Heap**, và **Stack**.
- Nắm vững vị trí lưu trữ vật lý (Flash ROM vs SRAM) khi nạp chương trình vào vi điều khiển.
- Nhận biết nguy cơ xung đột giữa Stack và Heap dẫn đến lỗi sập nguồn hoặc treo chip (Crash / HardFault).

## 2. Bản Chất Lý Thuyết & Phân Vùng Bộ Nhớ

Trong lập trình C cho máy tính thông thường (PC), hệ điều hành quản lý bộ nhớ ảo (Virtual Memory). Tuy nhiên, trên vi điều khiển nhúng (như STM32 Cortex-M, ESP32, AVR), **CPU truy cập trực tiếp vào không gian địa chỉ vật lý (Physical Address Space)**.

\`\`\`
ĐỊA CHỈ CAO (0x2001FFFF - Đỉnh RAM)
┌──────────────────────────────────────────────┐
│                  STACK                       │ ◄── Tăng trưởng đi XUỐNG (Grow Downwards)
│ (Biến cục bộ, Địa chỉ trả về hàm, Ngữ cảnh)  │     Con trỏ SP (Stack Pointer)
├──────────────────────────────────────────────┤
│                      ▼                       │
│              [ VÙNG NHỚ TRỐNG ]              │
│                      ▲                       │
├──────────────────────────────────────────────┤
│                   HEAP                       │ ◄── Tăng trưởng đi LÊN (Grow Upwards)
│ (Bộ nhớ cấp phát động: malloc, calloc)       │
├──────────────────────────────────────────────┤
│                   .BSS                       │ ◄── Biến toàn cục / static CHƯA khởi tạo
│ (Khởi tạo về 0 bởi Startup Code)             │     hoặc khởi tạo = 0
├──────────────────────────────────────────────┤
│                  .DATA                       │ ◄── Biến toàn cục / static ĐÃ khởi tạo
│ (Giá trị khởi tạo lưu Flash, copy sang RAM)  │     giá trị khác 0 (vd: int count = 100;)
└──────────────────────────────────────────────┘
ĐỊA CHỈ THẤP (0x20000000 - Đáy RAM)

┌──────────────────────────────────────────────┐
│                  .TEXT                       │ ◄── Nằm trong bộ nhớ FLASH (0x08000000)
│ (Mã máy biên dịch, Bảng ngắt Vector Table)   │     Chỉ đọc (Read-Only)
├──────────────────────────────────────────────┤
│                 .RODATA                      │ ◄── Hằng số const, chuỗi ký tự "Hello"
└──────────────────────────────────────────────┘
\`\`\`

### Chi Tiết Từng Phân Vùng:
1. **.text Segment (Code)**: Nằm trong bộ nhớ Flash. Chứa toàn bộ tập lệnh mã máy CPU sẽ thực thi.
2. **.rodata (Read-Only Data)**: Chứa các chuỗi ký tự không đổi như \`printf("Error\\n")\` hoặc các biến \`const\`. Nằm trong Flash để tiết kiệm RAM.
3. **.data Segment**: Chứa các biến \`global\` hoặc \`static\` được gán giá trị khởi tạo khác 0. Khi vi điều khiển khởi động, đoạn code Startup sẽ copy các giá trị này từ Flash sang RAM.
4. **.bss Segment**: Chứa các biến \`global\` hoặc \`static\` chưa gán giá trị (mặc định = 0). Startup code sẽ chạy vòng lặp gán toàn bộ vùng này về 0 (Zero-fill).
5. **Heap**: Vùng nhớ phục vụ cấp phát động bằng \`malloc()\`, \`calloc()\`. Trong hệ thống nhúng thời gian thực (Hard Real-time), người ta hạn chế tối đa hoặc cấm hoàn toàn dùng \`malloc\` do nguy cơ phân mảnh bộ nhớ (Fragmentation).
6. **Stack**: Nơi lưu trữ biến cục bộ của hàm, con trỏ khung stack, và các thanh ghi của CPU khi xảy ra ngắt (Interrupt context). Stack mở rộng từ địa chỉ cao xuống địa chỉ thấp.

## 3. Mã Nguồn Minh Họa Vị Trí Ô Nhớ

\`\`\`c
#include <stdint.h>
#include <stdlib.h>

const uint32_t firmware_version = 0x01020304; // Nằm ở .rodata (Flash)
uint32_t system_ticks = 0;                    // Nằm ở .bss (RAM, khởi tạo = 0)
uint32_t baud_rate = 115200;                  // Nằm ở .data (RAM, copy từ Flash lúc boot)

void Process_Sensor_Data(void) {
    uint8_t buffer[64];                       // Nằm ở STACK (giải phóng khi hàm return)
    static uint16_t sample_count = 1;         // Nằm ở .data (chỉ khởi tạo 1 lần)
    uint8_t *heap_ptr = (uint8_t*)malloc(32); // Con trỏ heap_ptr nằm ở Stack,
                                              // nhưng 32 bytes cấp phát nằm ở HEAP!
    sample_count++;
    free(heap_ptr);
}
\`\`\`

## 4. Nguy Cơ Nghiêm Trọng: Stack Overflow (Tràn Ngăn Xếp)
Nếu ứng dụng nhúng gọi hàm đệ quy quá sâu hoặc khai báo mảng cục bộ quá lớn trên Stack (ví dụ \`char temp[4096]\` trong khi RAM chỉ có 8KB), Stack sẽ phình to vượt qua ranh giới vùng nhớ trống và ghi đè trực tiếp lên vùng nhớ Heap hoặc biến toàn cục. Hiện tượng này làm hỏng dữ liệu và dẫn tới lỗi \`HardFault\`.
        `,
        quizzes: [
          {
            id: "q0-1",
            question: "Trong một dự án nhúng STM32, biến 'static int counter = 0;' được lưu trữ ở phân vùng bộ nhớ nào?",
            options: [
              "Phân vùng Stack vì là biến cục bộ",
              "Phân vùng .text trong bộ nhớ Flash",
              "Phân vùng .bss trong bộ nhớ SRAM",
              "Phân vùng .data trong bộ nhớ SRAM"
            ],
            correct: 2,
            explanation: "Biến có từ khóa static và được khởi tạo bằng 0 (hoặc chưa khởi tạo giá trị) sẽ được lưu trữ trong phân vùng .bss của SRAM. Startup code sẽ tự động xóa phân vùng này về 0 lúc khởi động."
          },
          {
            id: "q0-2",
            question: "Tại sao trong các hệ thống nhúng yêu cầu an toàn cao (như y tế, hàng không, phanh ABS ô tô), việc sử dụng malloc() thường bị cấm?",
            options: [
              "Vì vi điều khiển không có bộ nhớ RAM để cấp phát",
              "Vì malloc() gây ra hiện tượng phân mảnh bộ nhớ (Memory Fragmentation) và thời gian thực thi không xác định (Non-deterministic timing)",
              "Vì malloc() làm hỏng mã nguồn trong bộ nhớ Flash",
              "Vì malloc() chỉ chạy được trên hệ điều hành Linux 64-bit"
            ],
            correct: 1,
            explanation: "malloc() có thời gian thực thi không cố định (tùy thuộc vào việc tìm kiếm khối nhớ trống) và sau nhiều lần cấp phát/giải phóng sẽ sinh ra các lỗ hổng vụn vặt (phân mảnh), dẫn đến tình trạng dù tổng RAM trống vẫn còn nhưng không thể cấp phát được khối liên tục, gây sập hệ thống."
          },
          {
            id: "q0-3",
            question: "Điều gì xảy ra khi một hàm gọi đệ quy vô hạn trên vi điều khiển?",
            options: [
              "Vi điều khiển tự động nhân đôi dung lượng RAM để chứa dữ liệu",
              "Biến toàn cục bị compiler xóa bỏ để giải phóng bộ nhớ",
              "Hiện tượng Stack Overflow xảy ra: Stack phình to đè vào Heap/Data, gây lỗi HardFault Crash",
              "Chương trình sẽ tự động chuyển sang chế độ ngủ Deep Sleep"
            ],
            correct: 2,
            explanation: "Mỗi lần gọi hàm, địa chỉ trả về và các biến cục bộ được đẩy (push) vào Stack. Đệ quy vô hạn làm Stack tăng trưởng liên tục vượt qua giới hạn RAM và đè vào các phân vùng khác, kích hoạt ngắt phần cứng HardFault của ARM Cortex-M."
          }
        ]
      },
      {
        id: "l0-pointers-callbacks",
        title: "Con Trỏ Nâng Cao, Con Trỏ Hàm & Callbacks Trong Thiết Kế Driver",
        duration: "50 phút",
        difficulty: "Trung bình",
        summary: "Làm chủ con trỏ mảng, ép kiểu con trỏ bộ nhớ truy cập thanh ghi phần cứng và kỹ thuật Callback hướng sự kiện.",
        content: `
## 1. Mục Tiêu Bài Học
- Làm chủ kỹ thuật ép kiểu con trỏ địa chỉ để thao tác trực tiếp với các thanh ghi ngoại vi (Memory-Mapped I/O).
- Hiểu và áp dụng thành thạo **Con trỏ hàm (Function Pointer)** để thiết kế kiến trúc Callback bất đồng bộ và Máy trạng thái (Finite State Machine).

## 2. Bản Chất Con Trỏ Trong Lập Trình Nhúng

Trên PC, con trỏ là địa chỉ ảo. Trên MCU, con trỏ trỏ trực tiếp tới một chân cắm điện tử hoặc thanh ghi bên trong chip!

\`\`\`c
// Ép kiểu địa chỉ thanh ghi GPIOA_ODR (0x40020014 trên STM32F4) thành con trỏ
#define GPIOA_ODR  (*((volatile uint32_t *)0x40020014))

// Thao tác trực tiếp với phần cứng: Bật chân PA5 lên mức HIGH
GPIOA_ODR |= (1 << 5);
\`\`\`

## 3. Kiến Trúc Callback Với Con Trỏ Hàm
Trong hệ thống nhúng, khi một sự kiện xảy ra (như nhận được 1 byte UART hoặc ngắt Timer), tầng Driver phần cứng không nên xử lý logic ứng dụng. Thay vào đó, nó sẽ gọi một hàm ngược lại (Callback) do tầng ứng dụng đăng ký trước.

\`\`\`c
// Định nghĩa kiểu dữ liệu con trỏ hàm: nhận vào uint8_t, trả về void
typedef void (*UART_RxCallback_t)(uint8_t received_byte);

static UART_RxCallback_t g_rx_callback = NULL;

// Tầng Application đăng ký hàm xử lý
void UART_Register_Callback(UART_RxCallback_t callback) {
    g_rx_callback = callback;
}

// Tầng Driver thực thi ngắt phần cứng
void USART1_IRQHandler(void) {
    if (USART1->SR & (1 << 5)) { // Kiểm tra cờ RXNE (Receive buffer not empty)
        uint8_t data = USART1->DR;
        if (g_rx_callback != NULL) {
            g_rx_callback(data); // Gọi hàm Callback của tầng trên
        }
    }
}
\`\`\`
        `,
        quizzes: [
          {
            id: "q0-4",
            question: "Cú pháp nào sau đây khai báo đúng một con trỏ hàm có tên 'motor_step_fn' nhận vào 1 số nguyên 32-bit và không trả về giá trị?",
            options: [
              "void *motor_step_fn(int32_t speed);",
              "void (*motor_step_fn)(int32_t speed);",
              "void motor_step_fn(*int32_t speed);",
              "(*void) motor_step_fn(int32_t speed);"
            ],
            correct: 1,
            explanation: "Cú pháp chuẩn của con trỏ hàm trong C là: return_type (*function_pointer_name)(parameter_types). Cặp ngoặc tròn quanh (*motor_step_fn) là bắt buộc, nếu không sẽ biến thành khai báo một hàm trả về con trỏ void*."
          }
        ]
      },
      {
        id: "l0-volatile-qualifier",
        title: "Từ Khóa volatile, const & Bẫy Tối Ưu Hóa Trình Biên Dịch",
        duration: "40 phút",
        difficulty: "Cơ bản",
        summary: "Giải thích tại sao thiếu volatile trong ISR hoặc đọc thanh ghi sẽ dẫn tới lỗi treo chip vô tận.",
        content: `
## 1. Mục Tiêu Bài Học
- Hiểu rõ cơ chế tối ưu hóa thanh ghi của trình biên dịch GCC / Clang (-O2, -O3).
- Giải thích bản chất từ khóa \`volatile\` và 3 trường hợp bắt buộc phải sử dụng trong lập trình nhúng.

## 2. Bản Chất Bẫy Tối Ưu Hóa (Compiler Optimization Bug)

Hãy xem đoạn mã C sau:
\`\`\`c
uint8_t flag = 0; // KHÔNG có volatile

void EXTI0_IRQHandler(void) {
    flag = 1; // Ngắt ngoài xảy ra khi bấm nút
}

int main(void) {
    while (flag == 0) {
        // Đợi người dùng bấm nút
    }
    TurnOnLED();
}
\`\`\`

Khi biên dịch với cờ tối ưu hóa \`-O2\`, trình biên dịch phân tích thấy bên trong vòng lặp \`while\` không có dòng lệnh nào thay đổi biến \`flag\`. Compiler sẽ nạp giá trị \`flag\` vào thanh ghi CPU (như R0) một lần duy nhất. Cho dù ngắt xảy ra và cập nhật \`flag = 1\` trong RAM, CPU vẫn chỉ kiểm tra thanh ghi R0 cũ và rơi vào vòng lặp vô tận!

## 3. Khắc Phục Với Từ Khóa \`volatile\`
Khai báo \`volatile uint8_t flag = 0;\` bắt buộc CPU mỗi khi đọc hoặc ghi biến này phải truy xuất trực tiếp vào địa chỉ RAM, không được lưu đệm trong thanh ghi tạm thời.
        `,
        quizzes: [
          {
            id: "q0-5",
            question: "Trường hợp nào sau đây KHÔNG bắt buộc phải sử dụng từ khóa volatile?",
            options: [
              "Biến chia sẻ giữa hàm phục vụ ngắt (ISR) và vòng lặp chính main()",
              "Con trỏ trỏ tới thanh ghi ngoại vi phần cứng (Hardware Registers)",
              "Biến đếm cục bộ i trong vòng lặp for(int i=0; i<10; i++) chỉ dùng tính toán nội bộ",
              "Biến chia sẻ giữa 2 Task độc lập trong hệ điều hành thời gian thực FreeRTOS"
            ],
            correct: 2,
            explanation: "Biến đếm cục bộ trong vòng lặp nội bộ không bị thay đổi bởi ngắt hay luồng khác, compiler tối ưu nó vào thanh ghi CPU là tối ưu và an toàn nhất, không cần volatile."
          }
        ]
      },
      {
        id: "l0-math-for-robotics",
        title: "Đại Số Tuyến Tính Cho Robotics: Ma Trận Quay, Euler & Quaternions",
        duration: "60 phút",
        difficulty: "Nâng cao",
        summary: "Toán học không gian biểu diễn tư thế robot: Ma trận quay SO(3), góc Roll-Pitch-Yaw và hiện tượng khóa trục Gimbal Lock.",
        content: `
## 1. Mục Tiêu Bài Học
- Hiểu cách biểu diễn hướng và vị trí của robot trong không gian 3 chiều.
- Phân biệt giữa Góc Euler (Roll, Pitch, Yaw) và Số phức 4 chiều (Quaternions).
- Bản chất hiện tượng Khóa Trục (Gimbal Lock) và lý do ROS2 sử dụng Quaternion làm chuẩn mặc định.

## 2. Ma Trận Quay Trong Không Gian 2D & 3D

Khi robot xoay một góc $\\theta$ quanh trục $Z$, tọa độ của một điểm $P$ biến đổi qua ma trận quay $R_z(\\theta)$:

$$R_z(\\theta) = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta & 0 \\\\ \\sin\\theta & \\cos\\theta & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}$$

## 3. Góc Euler vs Quaternions
- **Góc Euler**: Dễ hình dung đối với con người (Roll: lật ngang, Pitch: gục đầu, Yaw: xoay hướng). Tuy nhiên, khi góc Pitch tiến tới $\\pm 90^\\circ$, một bậc tự do bị triệt tiêu, gây ra hiện tượng **Gimbal Lock** (mất phương hướng hoàn toàn).
- **Quaternion**: Biểu diễn bằng bộ 4 số $q = [w, x, y, z]$ thỏa mãn $w^2 + x^2 + y^2 + z^2 = 1$. Quaternion hoàn toàn không bị Gimbal Lock, tính toán phép quay mượt mà và tốn ít phép nhân lượng giác hơn ma trận $3 \\times 3$.
        `,
        quizzes: [
          {
            id: "q0-6",
            question: "Tại sao hệ thống ROS2 và các thuật toán định vị Robot hiện đại sử dụng Quaternion thay vì góc Euler (Roll, Pitch, Yaw) để biểu diễn hướng?",
            options: [
              "Vì Quaternion tốn ít bộ nhớ RAM hơn",
              "Vì góc Euler bị hiện tượng khóa trục (Gimbal Lock) khi góc Pitch đạt ±90 độ, làm mất 1 bậc tự do toán học",
              "Vì vi điều khiển không tính được hàm Sin và Cos",
              "Vì Quaternion chỉ dùng được cho xe 2 bánh vi sai"
            ],
            correct: 1,
            explanation: "Hiện tượng Gimbal Lock xảy ra khi hai trong ba trục quay bị trùng vào cùng một mặt phẳng (thường khi pitch = ±90°), dẫn tới việc mất một bậc tự do quay và gây ra lỗi nhảy số cực lớn khi tính toán vi phân tư thế robot."
          }
        ]
      }
    ]
  },

  // =========================================================================
  // LEVEL 1: VI ĐIỀU KHIỂN & ĐIỆN TỬ PHẦN CỨNG BARE-METAL
  // =========================================================================
  {
    id: "level-1",
    number: 1,
    title: "Level 1: Vi Điều Khiển & Ngoại Vi Bare-Metal",
    shortTitle: "Level 1: MCU & Ngoại Vi",
    badgeColor: "#0288d1",
    description: "Lập trình bare-metal trực tiếp trên thanh ghi, cấu hình xung nhịp, ngoại vi GPIO, EXTI, Timer/PWM, ADC và các giao thức truyền thông nối tiếp UART, SPI, I2C.",
    lessons: [
      {
        id: "l1-baremetal-gpio",
        title: "Bản Chất Ngoại Vi GPIO: Push-Pull, Open-Drain & Phân Tích Thanh Ghi",
        duration: "55 phút",
        difficulty: "Cơ bản",
        summary: "Phân tích cấu trúc mạch nội bộ GPIO: Transistor P-MOS / N-MOS, diode bảo vệ và các chế độ ngõ ra.",
        content: `
## 1. Mục Tiêu Bài Học
- Hiểu cấu tạo mạch bán dẫn bên trong một chân GPIO vi điều khiển.
- Phân biệt rõ sự khác nhau giữa chế độ **Push-Pull** (Đẩy-Kéo) và **Open-Drain** (Cực máng hở).
- Viết driver cấu hình thanh ghi GPIOA_MODER và GPIOA_ODR chuẩn bare-metal không cần thư viện HAL.

## 2. Cấu Trúc Điện Tử Của Chân GPIO

Mỗi chân GPIO được điều khiển bởi cặp transistor MOSFET:
- **P-MOS** nối lên đường nguồn dương ($V_{DD} = 3.3V$).
- **N-MOS** nối xuống đường đất ($GND = 0V$).

\`\`\`
SƠ ĐỒ NGUYÊN LÝ PUSH-PULL VS OPEN-DRAIN:

    PUSH-PULL MODE                   OPEN-DRAIN MODE (Cần điện trở Pull-up)
         VDD (3.3V)                               VDD (3.3V)
             │                                        │
        ┌────┴────┐                              [ R_pullup ]
        │  P-MOS  │ (Bật khi ra HIGH)                 │
        └────┬────┘                                   ├───► Chân Output Pin
             ├───► Chân Output Pin                    │
        ┌────┴────┐                              ┌────┴────┐
        │  N-MOS  │ (Bật khi ra LOW)             │  N-MOS  │ (Bật khi ra LOW)
        └────┬────┘                              └────┬────┘
             │                                        │
            GND                                      GND
\`\`\`

### Khi Nào Dùng Gì?
- **Push-Pull**: Dùng để điều khiển LED, chân chip select SPI, xung PWM cho động cơ... Chế độ này có thể chủ động bơm dòng ra 3.3V hoặc kéo dòng xuống 0V rất nhanh.
- **Open-Drain**: Transistor P-MOS phía trên bị ngắt kết nối. Chân chỉ có thể kéo xuống 0V hoặc để lơ lửng (Floating - trở kháng cao). Bắt buộc phải có **điện trở kéo lên (Pull-up Resistor)**. Dùng trong bus **I2C** để nhiều thiết bị có thể cùng nối chung một đường dây mà không gây chập nguồn (Wired-AND).

## 3. Lập Trình Thao Tác Thanh Ghi Trực Tiếp

\`\`\`c
// 1. Bật xung Clock cho GPIO Port A trong thanh ghi RCC_AHB1ENR
RCC->AHB1ENR |= (1 << 0); // Bit 0 là GPIOAEN

// 2. Cấu hình chân PA5 làm Output trong thanh ghi GPIOA_MODER (2 bit cho 1 chân)
// Reset 2 bit [11:10] về 00, sau đó set thành 01 (General purpose output mode)
GPIOA->MODER &= ~(3 << (5 * 2));
GPIOA->MODER |=  (1 << (5 * 2));

// 3. Bật chân PA5 lên mức cao (HIGH) qua thanh ghi ODR
GPIOA->ODR |= (1 << 5);

// 4. Hoặc bật cực nhanh bằng thanh ghi BSRR (Bit Set/Reset Register - Atomic access)
GPIOA->BSRR = (1 << 5);        // Set bit 5 lên 1 (không cần đọc-sửa-ghi)
GPIOA->BSRR = (1 << (5 + 16)); // Reset bit 5 về 0
\`\`\`
        `,
        quizzes: [
          {
            id: "q1-1",
            question: "Tại sao giao thức I2C bắt buộc phải sử dụng các chân GPIO ở chế độ Open-Drain kết hợp với điện trở Pull-up?",
            options: [
              "Để tăng tốc độ truyền dữ liệu lên hàng Gigahertz",
              "Để nhiều thiết bị cùng chia sẻ một đường dây mà không bị ngắn mạch khi một thiết bị kéo xuống 0V và thiết bị khác kéo lên 3.3V (Wired-AND logic)",
              "Vì chế độ Push-Pull tiêu tốn gấp 10 lần dung lượng bộ nhớ Flash",
              "Để bảo vệ chân vi điều khiển khỏi sét đánh"
            ],
            correct: 1,
            explanation: "Nếu dùng Push-Pull, khi Device A xuất mức 1 (3.3V) và Device B xuất mức 0 (0V) trên cùng một dây SDA, dòng điện ngắn mạch sẽ chạy thẳng từ nguồn qua 2 chip xuống đất và gây cháy chip. Chế độ Open-Drain kết hợp Pull-up tạo thành logic Wired-AND an toàn tuyệt đối."
          },
          {
            id: "q1-2",
            question: "Ưu điểm cốt lõi của thanh ghi BSRR (Bit Set/Reset Register) so với thanh ghi ODR (Output Data Register) khi bật tắt chân GPIO là gì?",
            options: [
              "BSRR thao tác nguyên tử (Atomic), không cần chu kỳ Đọc-Sửa-Ghi (Read-Modify-Write), tránh xung đột khi có ngắt ISR xen ngang",
              "BSRR cho phép đổi màu bóng LED",
              "BSRR có thể tăng điện áp chân vi điều khiển từ 3.3V lên 5V",
              "BSRR chỉ hoạt động được khi có hệ điều hành RTOS"
            ],
            correct: 0,
            explanation: "Khi ghi vào ODR: 'ODR |= (1<<5)', CPU phải đọc ODR vào thanh ghi CPU, sửa bit, rồi ghi ngược lại. Nếu có ngắt ISR xảy ra giữa chừng và sửa chân khác, giá trị sẽ bị ghi đè sai. Với BSRR, chỉ cần 1 lệnh ghi trực tiếp (Atomic), an toàn 100% trước ngắt."
          }
        ]
      },
      {
        id: "l1-timers-pwm",
        title: "Timers & PWM: Input Capture, Output Compare & Điều Khiển Động Cơ",
        duration: "65 phút",
        difficulty: "Trung bình",
        summary: "Nguyên lý bộ đếm phần cứng, Prescaler, Auto-reload register và kỹ thuật tạo xung PWM điều khiển tốc độ động cơ DC.",
        content: `
## 1. Mục Tiêu Bài Học
- Hiểu công thức tính tần số ngắt Timer từ xung nhịp hệ thống (System Clock), Prescaler (PSC) và Auto-Reload Register (ARR).
- Phân biệt giữa chế độ **Output Compare (PWM)** và **Input Capture** (đọc xung Encoder).
- Viết chương trình phát xung PWM điều khiển độ sáng LED hoặc tốc độ động cơ.

## 2. Công Thức Tính Tần Số Timer

Tần số của bộ đếm Timer ($f_{timer}$) và tần số tràn ngắt ($f_{overflow}$) được tính theo công thức:

$$f_{counter} = \\frac{f_{CK\\_PSC}}{PSC + 1}$$

$$f_{overflow} = \\frac{f_{counter}}{ARR + 1} = \\frac{f_{CK\\_PSC}}{(PSC + 1) \\times (ARR + 1)}$$

*Ví dụ*: Với xung nhịp $f_{CK\\_PSC} = 84 \\text{ MHz}$, muốn tạo xung PWM tần số $1 \\text{ kHz}$ cho mạch cầu H điều khiển động cơ:
- Chọn $PSC = 83$ $\\Rightarrow f_{counter} = \\frac{84\\text{MHz}}{84} = 1 \\text{ MHz}$.
- Chọn $ARR = 999$ $\\Rightarrow f_{PWM} = \\frac{1\\text{MHz}}{1000} = 1000 \\text{ Hz} = 1 \\text{ kHz}$.
- Độ rộng xung (Duty Cycle) sẽ điều khiển qua thanh ghi so sánh $CCR$:
  $$\\text{Duty Cycle} (\\%) = \\frac{CCR}{ARR + 1} \\times 100$$
        `,
        quizzes: [
          {
            id: "q1-3",
            question: "Một vi điều khiển chạy xung nhịp 16 MHz. Muốn tạo ngắt Timer chính xác 1 giây (1 Hz), nếu chọn Prescaler PSC = 15999, giá trị thanh ghi Auto-Reload (ARR) phải đặt là bao nhiêu?",
            options: [
              "999",
              "1000",
              "1599",
              "9999"
            ],
            correct: 0,
            explanation: "f_counter = 16 MHz / (15999 + 1) = 16.000.000 / 16.000 = 1000 Hz. Để có chu kỳ 1 giây (1 Hz): f_overflow = 1000 Hz / (ARR + 1) = 1 => ARR + 1 = 1000 => ARR = 999."
          }
        ]
      },
      {
        id: "l1-serial-protocols",
        title: "Giao Thức Truyền Thông Nối Tiếp: UART, SPI & I2C Toàn Tập",
        duration: "75 phút",
        difficulty: "Trung bình",
        summary: "So sánh chi tiết 3 giao thức kinh điển: Giản đồ xung, tốc độ, khoảng cách truyền, cấu trúc phần cứng và kỹ thuật lập trình Ring Buffer.",
        content: `
## 1. Bảng So Sánh Tổng Quan 3 Giao Thức

| Tiêu Chí | UART / USART | SPI | I2C |
| :--- | :--- | :--- | :--- |
| **Số dây tín hiệu** | 2 dây (TX, RX) | 4 dây (MOSI, MISO, SCK, CS) | 2 dây (SDA, SCL) |
| **Đồng bộ xung clock** | Bất đồng bộ (Asynchronous) | Đồng bộ (Có dây SCK riêng) | Đồng bộ (Có dây SCL riêng) |
| **Cấu hình mạch chân** | Push-Pull | Push-Pull | Open-Drain + Pull-up |
| **Tốc độ truyền** | Chậm (thường <= 1 Mbps) | Rất nhanh (lên tới 50+ Mbps) | Vừa phải (100k, 400k, 1M, 3.4M) |
| **Số lượng thiết bị** | Điểm - Điểm (Point-to-Point) | 1 Master - Nhiều Slave (Mỗi Slave 1 dây CS) | 1 Master - Lên tới 127 Slaves (Dùng địa chỉ 7-bit) |
| **Ứng dụng tiêu biểu** | Debug Terminal, Module GPS, Bluetooth | Thẻ nhớ SD, Màn hình TFT, Flash SPI | Cảm biến IMU, RTC, Màn hình OLED SSD1306 |

## 2. Kỹ Thuật Ring Buffer (Hàng Đợi Vòng) Cho UART
Khi nhận dữ liệu UART tốc độ cao, nếu xử lý trực tiếp trong hàm ngắt ISR sẽ làm nghẽn CPU. Giải pháp chuẩn là đẩy dữ liệu vào một mảng xoay vòng (Ring Buffer) và để hàm main xử lý dần:

\`\`\`c
#define UART_BUFFER_SIZE 128

typedef struct {
    uint8_t buffer[UART_BUFFER_SIZE];
    volatile uint16_t head;
    volatile uint16_t tail;
} RingBuffer_t;

void RingBuffer_Put(RingBuffer_t *rb, uint8_t data) {
    uint16_t next_head = (rb->head + 1) % UART_BUFFER_SIZE;
    if (next_head != rb->tail) { // Kiểm tra đệm chưa đầy
        rb->buffer[rb->head] = data;
        rb->head = next_head;
    }
}
\`\`\`
        `,
        quizzes: [
          {
            id: "q1-4",
            question: "Trong giao thức SPI, nếu cấu hình CPOL = 1 và CPHA = 1, điều đó có nghĩa là gì?",
            options: [
              "Xung clock rỗi ở mức LOW, lấy mẫu dữ liệu ở sườn lên đầu tiên",
              "Xung clock rỗi ở mức HIGH, lấy mẫu dữ liệu ở sườn lên thứ hai",
              "Xung clock rỗi ở mức LOW, lấy mẫu dữ liệu ở sườn xuống đầu tiên",
              "Xung clock rỗi ở mức HIGH, lấy mẫu dữ liệu ở sườn xuống đầu tiên"
            ],
            correct: 1,
            explanation: "CPOL=1 nghĩa là đường Clock rỗi ở mức HIGH (3.3V). CPHA=1 nghĩa là việc lấy mẫu dữ liệu (sample) xảy ra ở sườn chuyển mạch thứ hai (tức là sườn lên từ LOW lên HIGH)."
          }
        ]
      }
    ]
  },

  // =========================================================================
  // LEVEL 2: ARM CORTEX-M & FREERTOS CHUYÊN SÂU
  // =========================================================================
  {
    id: "level-2",
    number: 2,
    title: "Level 2: ARM Cortex-M & FreeRTOS Chuyên Sâu",
    shortTitle: "Level 2: ARM & FreeRTOS",
    badgeColor: "#388e3c",
    description: "Nhân ARM Cortex-M, ngắt lồng nhau NVIC, bộ điều khiển DMA, quy trình Bootloader, Linker Script và làm chủ lập trình đa nhiệm thời gian thực với FreeRTOS.",
    lessons: [
      {
        id: "l2-arm-nvic-dma",
        title: "Kiến Trúc Nhân ARM Cortex-M: NVIC, Quyền Hạn & Bộ Đệm DMA",
        duration: "65 phút",
        difficulty: "Nâng cao",
        summary: "Phân biệt Thread Mode vs Handler Mode, MSP vs PSP, cơ chế phân cấp ưu tiên ngắt và truyền nhận dữ liệu không tốn CPU với DMA.",
        content: `
## 1. Mục Tiêu Bài Học
- Hiểu kiến trúc nội vi của vi xử lý ARM Cortex-M3/M4.
- Làm chủ 2 chế độ thực thi (Thread vs Handler Mode) và 2 con trỏ ngăn xếp (MSP vs PSP).
- Thiết lập kênh DMA đọc ADC đa kênh hoặc truyền UART tự động không làm gián đoạn CPU.

## 2. Các Chế Độ Hoạt Động & Ngăn Xếp
ARM Cortex-M có thiết kế chuyên dụng cho hệ điều hành:
1. **Thread Mode**: Chế độ chạy mã ứng dụng thông thường (hàm main hoặc các Task trong RTOS). Thường sử dụng con trỏ ngăn xếp **PSP (Process Stack Pointer)**.
2. **Handler Mode**: Chế độ tự động kích hoạt khi có ngắt (Exception / ISR). Luôn sử dụng con trỏ ngăn xếp **MSP (Main Stack Pointer)** với quyền ưu tiên đặc quyền (Privileged).

\`\`\`
CƠ CHẾ PHÂN CHIA NGĂN XẾP TRONG HỆ ĐIỀU HÀNH RTOS:
   Task 1 (Chạy trên PSP1) ──┐
   Task 2 (Chạy trên PSP2) ──┼──► Ngăn cách lỗi giữa các tác vụ độc lập
   Task 3 (Chạy trên PSP3) ──┘
             ▲
             │ (Ngắt xảy ra -> CPU tự động chuyển sang MSP)
             ▼
   Hệ thống Ngắt / OS Kernel (Chạy trên MSP riêng biệt)
\`\`\`

## 3. Bộ Điều Khiển DMA (Direct Memory Access)
Trong các tác vụ truyền thông nối tiếp hoặc lấy mẫu cảm biến, nếu CPU phải thức dậy cho từng byte thì hệ thống sẽ mất 100% hiệu năng. DMA là một bộ vi xử lý phụ chuyên trách việc copy dữ liệu thẳng từ ngoại vi vào RAM:
- **Peripheral-to-Memory**: Đọc liên tục 8 kênh ADC vào mảng \`uint16_t adc_buffer[8]\`.
- **Memory-to-Peripheral**: Gửi chuỗi 1024 ký tự ra UART trong khi CPU vẫn đang chạy thuật toán tính toán động học robot!
        `,
        quizzes: [
          {
            id: "q2-1",
            question: "Trong kiến trúc ARM Cortex-M, việc phân chia 2 con trỏ ngăn xếp MSP (Main Stack Pointer) và PSP (Process Stack Pointer) mang lại lợi ích kỹ thuật lớn nhất nào cho hệ điều hành RTOS?",
            options: [
              "Tăng gấp đôi tốc độ xung nhịp CPU",
              "Cho phép mỗi Task trong RTOS có một vùng Stack riêng biệt (dùng PSP), trong khi mã Kernel và các hàm ngắt dùng chung MSP an toàn, ngăn Task lỗi làm hỏng toàn bộ hệ điều hành",
              "Biến vi điều khiển thành vi xử lý 64-bit",
              "Giúp giảm dung lượng bộ nhớ Flash của chip"
            ],
            correct: 1,
            explanation: "Tách biệt PSP cho các Task và MSP cho OS Kernel/Ngắt là cốt lõi bảo vệ hệ thống. Nếu một Task bị tràn Stack hoặc lỗi bộ nhớ, nó chỉ ảnh hưởng đến PSP của chính nó mà không làm sập nhân hệ thống đang chạy trên MSP."
          }
        ]
      },
      {
        id: "l2-freertos-multitasking",
        title: "FreeRTOS Toàn Tập: Task Lifecycle, Queues, Semaphore & Mutex",
        duration: "80 phút",
        difficulty: "Nâng cao",
        summary: "Bản chất chuyển đổi ngữ cảnh (Context Switch), ngắt PendSV, lập lịch ưu tiên và giải quyết vấn đề Nghịch đảo ưu tiên (Priority Inversion).",
        content: `
## 1. Mục Tiêu Bài Học
- Nắm vững chu trình sống của Task trong FreeRTOS: Running, Ready, Blocked, Suspended.
- Hiểu bản chất cơ chế chuyển đổi ngữ cảnh (Context Switching) lưu trữ thanh ghi qua ngắt PendSV.
- Sử dụng thành thạo Queue để truyền tin, Binary Semaphore để xử lý ngắt trì hoãn, và Mutex để bảo vệ tài nguyên chia sẻ.
- Phân tích bản chất hiện tượng **Nghịch đảo ưu tiên (Priority Inversion)** và cách giải quyết bằng **Thừa kế ưu tiên (Priority Inheritance)**.

## 2. Vấn Đề Nghịch Đảo Ưu Tiên (Priority Inversion)

Hãy tưởng tượng một sự cố lịch sử trên tàu vũ trụ **Mars Pathfinder (1997)**:
- **Task Cao (High)**: Cần đọc cảm biến quan trọng qua cổng I2C.
- **Task Thấp (Low)**: Đang chiếm Mutex của cổng I2C để đọc dữ liệu đo nhiệt độ.
- **Task Trung Bình (Medium)**: Một tác vụ tính toán thời gian dài không dùng I2C nhưng có mức ưu tiên cao hơn Task Thấp.

\`\`\`
HIỆN TƯỢNG NGHỊCH ĐẢO ƯU TIÊN:
1. Task Thấp chiếm Mutex I2C.
2. Task Cao thức dậy, yêu cầu Mutex I2C -> Bị Block (đợi Task Thấp nhả).
3. Đột nhiên Task Trung Bình thức dậy -> Chiếm quyền CPU vì ưu tiên cao hơn Task Thấp!
4. HỆ QUẢ: Task Thấp không được chạy để nhả Mutex -> Task Cao bị bỏ đói vô thời hạn!
\`\`\`

### Giải Pháp: Thừa Kế Ưu Tiên (Priority Inheritance)
Trong FreeRTOS, khi dùng \`xSemaphoreCreateMutex()\`, nếu Task Cao bị chặn bởi Task Thấp đang giữ Mutex, hệ điều hành sẽ **tạm thời nâng mức ưu tiên của Task Thấp lên bằng Task Cao** để nó hoàn thành nhanh nhất và nhả Mutex.
        `,
        quizzes: [
          {
            id: "q2-2",
            question: "Tại sao trong hàm phục vụ ngắt (ISR), ta KHÔNG ĐƯỢC PHÉP sử dụng Mutex hoặc các hàm FreeRTOS thông thường như xQueueSend() mà phải dùng phiên bản xQueueSendFromISR()?",
            options: [
              "Vì ngắt ISR không có tên hàm",
              "Vì ngắt ISR không bao giờ được phép bị chặn (Blocked) hay đợi chờ tài nguyên, và hàm FromISR có cơ chế riêng để yêu cầu chuyển đổi ngữ cảnh khi thoát ngắt",
              "Vì hàm Mutex làm cháy thanh ghi NVIC của vi điều khiển",
              "Vì vi điều khiển ARM không hỗ trợ ngắt khi đã cài FreeRTOS"
            ],
            correct: 1,
            explanation: "Ngắt ISR phải thực thi càng nhanh càng tốt và tuyệt đối không thể bị đưa vào trạng thái Blocked (chờ đợi). Các hàm đuôi '...FromISR' không bao giờ block và cung cấp tham số pxHigherPriorityTaskWoken để báo cho CPU biết có cần kích hoạt chuyển ngữ cảnh (Yield) ngay khi thoát ngắt hay không."
          }
        ]
      }
    ]
  },

  // =========================================================================
  // LEVEL 3: HỆ THỐNG NHÚNG NÂNG CAO & MẠNG CÔNG NGHIỆP
  // =========================================================================
  {
    id: "level-3",
    number: 3,
    title: "Level 3: Hệ Thống Nhúng Nâng Cao & Mạng Công Nghiệp",
    shortTitle: "Level 3: Mạng & Embedded Linux",
    badgeColor: "#f57c00",
    description: "Các bus mạng công nghiệp chuẩn ô tô: CAN Bus, Modbus RS-485, kết nối IoT MQTT và nền tảng Linux nhúng (Embedded Linux) cơ sở.",
    lessons: [
      {
        id: "l3-can-bus",
        title: "Mạng CAN Bus (Controller Area Network) Trong Ô Tô & Robot Công Nghiệp",
        duration: "70 phút",
        difficulty: "Nâng cao",
        summary: "Cơ chế phân xử bit không phá hủy (Non-destructive Bitwise Arbitration), vi sai CAN_H / CAN_L và cấu trúc khung tin CAN.",
        content: `
## 1. Mục Tiêu Bài Học
- Hiểu tại sao CAN Bus là chuẩn truyền thông bắt buộc trong ngành công nghiệp ô tô và robot tự hành AGV/AMR.
- Phân tích cơ chế mức điện áp vi sai (CAN_High, CAN_Low) chống nhiễu điện từ cực mạnh.
- Làm chủ thuật toán phân xử quyền ưu tiên bản tin bằng ID (Identifier) mà không làm mất dữ liệu.

## 2. Bản Chất Mức Logic: Trội (Dominant) vs Lặn (Recessive)
Trên đường dây CAN vi sai:
- **Bit 0 là Dominant (Mức Trội)**: Khi một node xuất bit 0, điện áp $V_{diff} = CAN_H - CAN_L \\approx 2.0V$. Mức này luôn 'đè bẹp' mức 1.
- **Bit 1 là Recessive (Mức Lặn)**: Điện áp $V_{diff} \\approx 0V$.

\`\`\`
PHÂN XỬ TRANH CHẤP TRÊN CAN BUS:
Node A (ID 0x14 = 0001 0100) : 0 0 0 1  0 1 0 0 ...
Node B (ID 0x12 = 0001 0010) : 0 0 0 1  0 0 1 0 ...
Trạng thái Bus thực tế      : 0 0 0 1  0 0 ... (Node B thắng phân xử vì bit thứ 6 là Dominant '0'!)
Node A phát hiện bus là '0' trong khi mình phát '1' -> Tự động rút lui nhường đường!
\`\`\`
Nhờ cơ chế này, bản tin có ID càng nhỏ thì mức độ ưu tiên càng cao và không bao giờ bị xung đột gây hỏng gói tin!
        `,
        quizzes: [
          {
            id: "q3-1",
            question: "Giả sử 2 node cùng phát bản tin lên bus CAN cùng một thời điểm: Node 1 có ID = 0x0A0 và Node 2 có ID = 0x050. Node nào sẽ giành quyền ưu tiên truyền dữ liệu trước?",
            options: [
              "Node 1 vì số 0x0A0 lớn hơn 0x050",
              "Node 2 vì số 0x050 nhỏ hơn, chứa bit 0 (Dominant) xuất hiện sớm hơn trong quá trình phân xử",
              "Cả 2 node cùng bị hủy gói tin và phải đợi ngẫu nhiên",
              "Tùy thuộc vào node nào có dây dẫn ngắn hơn"
            ],
            correct: 1,
            explanation: "Trong CAN bus, bit 0 là mức Trội (Dominant). Identifier càng nhỏ thì các bit 0 xuất hiện càng sớm, đè bẹp các bit 1 (Recessive) của node đối thủ, do đó Node 2 (0x050) sẽ chiến thắng phân xử và truyền tiếp mà không bị gián đoạn."
          }
        ]
      }
    ]
  },

  // =========================================================================
  // LEVEL 4: NỀN TẢNG KỸ THUẬT ROBOTICS & ĐIỀU KHIỂN HỌC
  // =========================================================================
  {
    id: "level-4",
    number: 4,
    title: "Level 4: Nền Tảng Kỹ Thuật Robotics & Điều Khiển Tự Động",
    shortTitle: "Level 4: Robotics Foundations",
    badgeColor: "#512da8",
    description: "Cảm biến Encoder, IMU, giải thuật lọc bù & Kalman (EKF), điều khiển hồi tiếp vòng kín PID, động học vi sai bánh xe và cánh tay robot nối tiếp.",
    lessons: [
      {
        id: "l4-pid-controller",
        title: "Bộ Điều Khiển Hồi Tiếp Vòng Kín PID & Kỹ Thuật Anti-Windup",
        duration: "75 phút",
        difficulty: "Nâng cao",
        summary: "Toán học của 3 khâu P, I, D, phương pháp cân chỉnh Ziegler-Nichols và giải quyết hiện tượng bão hòa tích phân trong điều khiển động cơ.",
        content: `
## 1. Mục Tiêu Bài Học
- Hiểu ý nghĩa vật lý của 3 khâu: Tỉ lệ ($K_p$), Tích phân ($K_i$) và Vi phân ($K_d$).
- Viết thuật toán PID số (Discrete PID Algorithm) chạy trên vi điều khiển thời gian thực.
- Nhận diện và triệt tiêu hiện tượng **Integrator Windup** khi ngõ ra bị giới hạn phần cứng (bão hòa PWM).

## 2. Phương Trình Điều Khiển PID Liên Tục & Rời Rạc Hóa

Tín hiệu điều khiển $u(t)$ theo sai số $e(t) = Setpoint - ProcessVariable$:

$$u(t) = K_p e(t) + K_i \\int_0^t e(\\tau) d\\tau + K_d \\frac{de(t)}{dt}$$

Rời rạc hóa trên vi điều khiển với chu kỳ lấy mẫu $\\Delta t$:
- Khâu P: $P = K_p \\cdot e[k]$
- Khâu I: $I = I_{prev} + K_i \\cdot e[k] \\cdot \\Delta t$
- Khâu D: $D = K_d \\cdot \\frac{e[k] - e[k-1]}{\\Delta t}$

\`\`\`c
typedef struct {
    float Kp, Ki, Kd;
    float integral;
    float prev_error;
    float out_min, out_max;
} PID_Controller_t;

float PID_Compute(PID_Controller_t *pid, float setpoint, float measured, float dt) {
    float error = setpoint - measured;
    
    // 1. Khâu P
    float p_out = pid->Kp * error;
    
    // 2. Khâu I kèm kỹ thuật Anti-Windup Clamping
    pid->integral += error * dt;
    float i_out = pid->Ki * pid->integral;
    
    // 3. Khâu D (Có thể lọc thông thấp để tránh khuếch đại nhiễu)
    float derivative = (error - pid->prev_error) / dt;
    float d_out = pid->Kd * derivative;
    
    float output = p_out + i_out + d_out;
    
    // Giới hạn bão hòa phần cứng (Saturation Limit)
    if (output > pid->out_max) {
        output = pid->out_max;
    } else if (output < pid->out_min) {
        output = pid->out_min;
    }
    
    pid->prev_error = error;
    return output;
}
\`\`\`
        `,
        quizzes: [
          {
            id: "q4-1",
            question: "Hiện tượng Integrator Windup (Bão hòa tích phân) trong bộ điều khiển PID xảy ra trong hoàn cảnh nào?",
            options: [
              "Khi động cơ bị cháy",
              "Khi sai số tồn tại trong thời gian dài (như động cơ bị kẹt tải) khiến khâu I tích lũy giá trị cực lớn vượt xa ngưỡng công suất tối đa của mạch công suất, làm hệ thống phản ứng rất chậm trễ khi tải được giải phóng",
              "Khi người dùng đặt hệ số Kd = 0",
              "Khi chu kỳ lấy mẫu dt quá nhỏ"
            ],
            correct: 1,
            explanation: "Khi cơ cấu chấp hành đã đạt trần công suất tối đa (100% PWM) mà sai số vẫn còn, khâu tích phân I tiếp tục cộng dồn tới giá trị khổng lồ. Khi hệ thống bắt đầu đổi chiều, khâu I phải mất rất nhiều thời gian để xả hết lượng tích lũy này, gây ra độ vọt lố nghiêm trọng và đáp ứng chậm."
          }
        ]
      },
      {
        id: "l4-diff-drive-kinematics",
        title: "Mô Hình Động Học Xe Robot Tự Hành Bánh Vi Sai & Tính Toán Odometry",
        duration: "80 phút",
        difficulty: "Nâng cao",
        summary: "Biến đổi từ vận tốc 2 bánh xe sang vận tốc dài và vận tốc góc của robot, cập nhật vị trí x, y, theta theo chu kỳ thời gian thực.",
        content: `
## 1. Động Học Thuận Bánh Vi Sai (Forward Kinematics)

Xe robot vi sai có 2 bánh truyền động độc lập đặt cách nhau khoảng cách $L$ (Track width), bán kính mỗi bánh là $r$.
Khi biết vận tốc góc 2 bánh xe $\\omega_L, \\omega_R$ từ Encoder:

- Vận tốc dài bánh trái: $v_L = \\omega_L \\cdot r$
- Vận tốc dài bánh phải: $v_R = \\omega_R \\cdot r$

Vận tốc dài tịnh tiến của thân xe ($v$) và vận tốc góc quay quanh trục trọng tâm ($\\omega$):

$$v = \\frac{v_R + v_L}{2}$$

$$\\omega = \\frac{v_R - v_L}{L}$$

## 2. Tích Phân Quỹ Đạo (Odometry Integration)
Trong một chu kỳ thời gian $\\Delta t$:
- Độ dịch chuyển góc: $\\Delta\\theta = \\omega \\cdot \\Delta t$
- Độ dịch chuyển dài: $\\Delta s = v \\cdot \\Delta t$

Tọa độ mới $(x_{k+1}, y_{k+1}, \\theta_{k+1})$ trong hệ tọa độ toàn cục (World Frame):

$$x_{k+1} = x_k + \\Delta s \\cdot \\cos\\left(\\theta_k + \\frac{\\Delta\\theta}{2}\\right)$$

$$y_{k+1} = y_k + \\Delta s \\cdot \\sin\\left(\\theta_k + \\frac{\\Delta\\theta}{2}\\right)$$

$$\\theta_{k+1} = \\theta_k + \\Delta\\theta$$
        `,
        quizzes: [
          {
            id: "q4-2",
            question: "Nếu một xe tự hành 2 bánh vi sai có khoảng cách 2 bánh L = 0.5m. Bánh phải quay tiến với vận tốc vR = 0.4 m/s và bánh trái quay lùi với vận tốc vL = -0.4 m/s. Trạng thái chuyển động của xe là gì?",
            options: [
              "Xe chạy thẳng về phía trước với vận tốc 0.4 m/s",
              "Xe xoay tròn tại chỗ ngược chiều kim đồng hồ với vận tốc góc 1.6 rad/s mà không tịnh tiến (v = 0)",
              "Xe đi lùi về phía sau",
              "Xe bị mất thăng bằng lật nghiêng"
            ],
            correct: 1,
            explanation: "v = (vR + vL) / 2 = (0.4 + (-0.4)) / 2 = 0 m/s (không tịnh tiến). Vận tốc góc w = (vR - vL) / L = (0.4 - (-0.4)) / 0.5 = 0.8 / 0.5 = 1.6 rad/s (quay tại chỗ ngược chiều kim đồng hồ)."
          }
        ]
      }
    ]
  },

  // =========================================================================
  // LEVEL 5: ROBOT THÔNG MINH VỚI ROS2, SLAM & SIMULATION
  // =========================================================================
  {
    id: "level-5",
    number: 5,
    title: "Level 5: Robot Thông Minh: ROS2, SLAM & Nav2",
    shortTitle: "Level 5: ROS2, SLAM & Nav2",
    badgeColor: "#c2185b",
    description: "Làm chủ Robot Operating System 2 (Humble/Jazzy), mô hình hóa URDF, mô phỏng Gazebo 3D, lập bản đồ thời gian thực SLAM và điều hướng thông minh Nav2.",
    lessons: [
      {
        id: "l5-ros2-core-microros",
        title: "Kiến Trúc ROS2 & Cầu Nối Phần Cứng Micro-ROS Với Vi Điều Khiển",
        duration: "85 phút",
        difficulty: "Nâng cao",
        summary: "DDS Middleware, 4 mô hình giao tiếp cốt lõi (Topics, Services, Actions, Parameters) và cách nạp Micro-ROS lên board STM32/ESP32.",
        content: `
## 1. Mục Tiêu Bài Học
- Hiểu kiến trúc phân tán DDS (Data Distribution Service) loại bỏ Master Node của ROS1.
- Nắm rõ 4 mô hình truyền thông: Topic (Pub/Sub - Dòng dữ liệu cảm biến liên tục), Service (Req/Res - Lệnh cấu hình nhanh), Action (Goal/Feedback/Result - Di chuyển đến đích có phản hồi tiến độ), Parameter (Cấu hình tham số động).
- Kết nối STM32 với ROS2 qua cổng UART sử dụng giao thức **Micro-ROS**.

\`\`\`
KIẾN TRÚC TỔNG THỂ ROBOT THÔNG MINH (HIGH-LEVEL + LOW-LEVEL):
┌────────────────────────────────────────────────────────┐
│  MÁY TÍNH NHÚNG (Raspberry Pi 4 / Jetson Orin)         │
│  Hệ điều hành: Ubuntu 22.04 LTS                        │
│  ROS2 Humble:                                          │
│  - SLAM Toolbox (Lập bản đồ từ 2D Lidar)              │
│  - Nav2 (Quy hoạch đường đi tránh vật cản)             │
│  - Micro-ROS Agent (Cầu nối truyền thông)              │
└───────────────────────────┬────────────────────────────┘
                            │ UART / USB (Baud 115200 / 921600)
┌───────────────────────────▼────────────────────────────┐
│  VI ĐIỀU KHIỂN THỜI GIAN THỰC (STM32F4 / ESP32)        │
│  - Micro-ROS Client Node (Publish /odom, Sub /cmd_vel) │
│  - FreeRTOS (Vòng lặp PID 100Hz điều khiển động cơ)    │
│  - Đọc Encoder và Cảm biến IMU                         │
└────────────────────────────────────────────────────────┘
\`\`\`
        `,
        quizzes: [
          {
            id: "q5-1",
            question: "Khi điều khiển một robot di chuyển tới một tọa độ đích cách xa 50 mét, mô hình truyền thông nào trong ROS2 là lựa chọn tối ưu nhất và tại sao?",
            options: [
              "Topic: Vì nó gửi dữ liệu liên tục không cần xác nhận",
              "Service: Vì nó đơn giản và tiết kiệm bộ nhớ",
              "Action: Vì nó cho phép gửi Mục tiêu (Goal), nhận liên tục Phản hồi tiến độ (Feedback) trong suốt hành trình và có thể Hủy bỏ (Cancel) khi gặp sự cố khẩn cấp",
              "Parameter: Vì tọa độ là một con số cố định"
            ],
            correct: 2,
            explanation: "Action là mô hình truyền thông bất đồng bộ cho các tác vụ tốn thời gian dài. Nó cung cấp Goal (Mục tiêu), Feedback (Robot đang đi được bao nhiêu mét), Result (Đã đến đích an toàn hay thất bại) và khả năng Hủy lệnh (Cancel Goal) khi có chướng ngại vật bất ngờ."
          }
        ]
      },
      {
        id: "l5-slam-and-nav2",
        title: "Lập Bản Đồ Tự Hành SLAM & Điều Hướng Tránh Vật Cản Với Nav2",
        duration: "90 phút",
        difficulty: "Nâng cao",
        summary: "Thuật toán SLAM Toolbox, bản đồ lưới chiếm chỗ Occupancy Grid, cây tọa độ TF2 và hệ thống Cây hành vi Behavior Trees.",
        content: `
## 1. Cây Tọa Độ Biến Đổi TF2 Trong Robot Tự Hành
Để robot biết cảm biến Lidar nằm ở đâu so với trọng tâm xe, ROS2 sử dụng cây biến đổi hệ tọa độ TF:
- \`map\`: Khung tọa độ bản đồ cố định toàn cục (World Frame).
- \`odom\`: Khung tọa độ ước lượng chuyển động từ encoder/IMU (có trôi nhẹ theo thời gian).
- \`base_link\`: Khung tọa độ gắn cố định vào trọng tâm xe robot.
- \`laser_frame\`: Khung tọa độ của cảm biến Lidar (cách \`base_link\` một khoảng dịch $x, y, z$).

\`\`\`
CÂY HỆ TỌA ĐỘ TF2:
map ────────► odom ────────► base_link ────────► laser_frame
 (Do SLAM/AMCL)   (Do Bánh xe/IMU)    (Do cấu trúc cơ khí)
\`\`\`

## 2. Cơ Chế Bản Đồ Chi Phí Costmap Trong Nav2
Nav2 tính toán đường đi bằng cách thổi phồng (Inflation) các vật cản:
- **Lethal Obstacle**: Vùng có tường hoặc vật cản (chi phí 254).
- **Inscribed Inflation**: Vùng xung quanh vật cản bằng bán kính xe, robot đi vào chắc chắn sẽ va chạm.
- **Free Space**: Không gian trống an toàn (chi phí 0).
        `,
        quizzes: [
          {
            id: "q5-2",
            question: "Trong ngăn xếp điều hướng ROS2 Nav2, thành phần AMCL (Adaptive Monte Carlo Localization) chịu trách nhiệm chính cho việc gì?",
            options: [
              "Xây dựng bản đồ phòng lần đầu tiên",
              "Ước lượng vị trí và hướng chính xác của robot trên một bản đồ đã có sẵn bằng thuật toán bộ lọc hạt (Particle Filter)",
              "Điều khiển tốc độ động cơ DC",
              "Giao tiếp với camera nhận diện khuôn mặt"
            ],
            correct: 1,
            explanation: "AMCL sử dụng thuật toán bộ lọc hạt (Particle Filter) để đối chiếu đám mây điểm quét Lidar thời gian thực với bản đồ tĩnh đã lưu, từ đó ước lượng tọa độ chính xác của robot và triệt tiêu sai số tích lũy (drift) của Odometry bánh xe."
          }
        ]
      }
    ]
  },

  // =========================================================================
  // LEVEL 6: DỰ ÁN CAPSTONE THỰC CHIẾN & EDGE AI
  // =========================================================================
  {
    id: "level-6",
    number: 6,
    title: "Level 6: Dự Án Capstone & Edge AI Thực Chiến",
    shortTitle: "Level 6: Capstone & Edge AI",
    badgeColor: "#fbc02d",
    description: "Tích hợp toàn diện vào 2 dự án kỹ thuật quy mô lớn: Xe tự hành AMR kho thông minh, Cánh tay robot 6-DOF, Trí tuệ nhân tạo TinyML trên vi điều khiển.",
    lessons: [
      {
        id: "l6-capstone-amr",
        title: "Dự Án Capstone 1: Xây Dựng Xe Tự Hành Thông Minh AMR Hoàn Chỉnh",
        duration: "120 phút",
        difficulty: "Chuyên sâu",
        summary: "Hướng dẫn tích hợp từng bước phần cứng STM32, cảm biến Lidar, máy tính nhúng Ubuntu ROS2 và thuật toán Nav2 bám điểm.",
        content: `
## 1. Yêu Cầu Kỹ Thuật Đồ Án Kỹ Sư
Dự án Capstone AMR là sự hội tụ đỉnh cao của toàn bộ 5 Cấp độ trước đó:

### Yêu Cầu Tầng Dưới (Firmware MCU):
- Vi điều khiển: **STM32F401RE / ESP32**.
- Hệ điều hành: **FreeRTOS**.
- 2 Vòng lặp PID vận tốc động cơ chạy ở tần số 100 Hz.
- Đọc Encoder vi sai 2 bánh, đọc cảm biến IMU 6 trục và tính toán Odometry.
- Node Micro-ROS: Nhận lệnh \`/cmd_vel\` từ ROS2 và xuất bản dữ liệu \`/odom\` cùng trạng thái pin \`/battery_state\`.

### Yêu Cầu Tầng Trên (High-Level Computing):
- Máy tính nhúng: **Raspberry Pi 4 (4GB RAM)** hoặc **Jetson Orin Nano**.
- Cảm biến: **2D Lidar RPLidar A1M8** gắn trên đỉnh xe + Camera RGB.
- Hệ điều hành: **Ubuntu 22.04 LTS Server** chạy **ROS2 Humble**.
- Dựng bản đồ kho 2D bằng **SLAM Toolbox**.
- Tự động di chuyển bám lộ trình giao hàng không va chạm bằng **Nav2**.

\`\`\`
SƠ ĐỒ KHỐI PHẦN CỨNG TOÀN DIỆN CHO CAPSTONE AMR:
┌─────────────────┐       USB      ┌──────────────────┐
│  2D Lidar       ├────────────────┤                  │
└─────────────────┘                │  Raspberry Pi 4  │
┌─────────────────┐       CSI      │  (Ubuntu 22.04)  │
│  Pi Camera v2   ├────────────────┤  - ROS2 Humble   │
└─────────────────┘                │  - Nav2 / SLAM   │
                                   └─────────┬────────┘
                                             │ UART (Micro-ROS)
┌────────────────────────────────────────────┴────────┐
│  STM32F401RE Base Controller Board                  │
│  - FreeRTOS Kernel                                  │
│  - 2x Motor Speed PID Controllers                   │
│  - Complementary Filter IMU                         │
└───┬─────────────┬─────────────┬─────────────┬───────┘
    │ PWM         │ Encoder     │ I2C         │ Power
┌───▼───┐     ┌───▼───┐     ┌───▼───┐     ┌───▼───────────┐
│ L298N │     │ 2x Đĩa│     │MPU6050│     │ Khối Nguồn    │
│ Driver│     │ Encoder     │ IMU   │     │ Pin Li-ion    │
└───┬───┘     └───────┘     └───────┘     │ 3S 12V + Buck │
    │                                     └───────────────┘
┌───▼───────────┐
│ 2x Động Cơ DC │
│ Giảm Tốc GA25 │
└───────────────┘
\`\`\`
        `,
        quizzes: [
          {
            id: "q6-1",
            question: "Trong dự án xe tự hành AMR, nếu dữ liệu Odometry từ bánh xe bị trượt (Wheel Slip) trên sàn gạch trơn, giải pháp kỹ thuật nào sau đây giải quyết triệt để nhất sai số tích lũy?",
            options: [
              "Tăng điện áp cấp cho động cơ",
              "Hợp nhất cảm biến (Sensor Fusion) giữa Odometry bánh xe và cảm biến gia tốc/góc quay IMU thông qua Bộ lọc Kalman mở rộng (Robot Localization EKF node), đồng thời kết hợp định vị AMCL từ tia quét Lidar",
              "Bỏ qua cảm biến Lidar và chỉ dùng camera",
              "Khởi động lại vi điều khiển mỗi 5 phút"
            ],
            correct: 1,
            explanation: "Hiện tượng trượt bánh là nhược điểm chí mạng của Odometry thuần túy. Bằng cách sử dụng package 'robot_localization' (thuật toán EKF) để hợp nhất dữ liệu từ Encoder và con quay hồi chuyển IMU, kết hợp với quét đối chiếu bản đồ AMCL của Lidar, robot sẽ bù trừ hoàn hảo sai số trượt bánh."
          }
        ]
      }
    ]
  }
];
