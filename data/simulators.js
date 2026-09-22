/**
 * EMBEDDED SYSTEMS & ROBOTICS - INTERACTIVE SIMULATORS ENGINE
 */

const Simulators = {
  // =========================================================================
  // 1. MEMORY LAYOUT SIMULATOR
  // =========================================================================
  memory: {
    stackDepth: 2,
    heapBlocks: 1,
    isOverflow: false,

    init() {
      this.bindEvents();
      this.render();
    },

    bindEvents() {
      document.getElementById("btnAllocStack")?.addEventListener("click", () => this.pushStack());
      document.getElementById("btnPopStack")?.addEventListener("click", () => this.popStack());
      document.getElementById("btnAllocHeap")?.addEventListener("click", () => this.allocHeap());
      document.getElementById("btnFreeHeap")?.addEventListener("click", () => this.freeHeap());
      document.getElementById("btnTriggerStackOverflow")?.addEventListener("click", () => this.triggerOverflow());
      document.getElementById("btnResetMemory")?.addEventListener("click", () => this.reset());
    },

    log(msg, type = "system") {
      const box = document.getElementById("memoryLogBox");
      if (!box) return;
      const el = document.createElement("div");
      el.className = `log-entry ${type}`;
      el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      box.prepend(el);
    },

    pushStack() {
      if (this.isOverflow) return;
      if (this.stackDepth >= 6) {
        this.triggerOverflow();
        return;
      }
      this.stackDepth++;
      const addr = (0x2001FFFF - (this.stackDepth * 128)).toString(16).toUpperCase();
      this.log(`Stack Push: Gọi hàm Sensor_Read() -> Lưu SP=0x${addr}, biến buffer[64]`, "stack");
      this.render();
    },

    popStack() {
      if (this.isOverflow) this.isOverflow = false;
      if (this.stackDepth > 1) {
        this.stackDepth--;
        const addr = (0x2001FFFF - (this.stackDepth * 128)).toString(16).toUpperCase();
        this.log(`Stack Pop: Thoát hàm -> Thu hồi khung ngăn xếp, SP khôi phục về 0x${addr}`, "stack");
      } else {
        this.log("Stack đã ở đáy hàm main() - Không thể pop thêm!", "system");
      }
      this.render();
    },

    allocHeap() {
      if (this.isOverflow) return;
      if (this.heapBlocks >= 5) {
        this.log("Heap Out of Memory (OOM): Cấp phát thất bại, malloc trả về NULL!", "error");
        return;
      }
      this.heapBlocks++;
      const addr = (0x20000400 + (this.heapBlocks * 128)).toString(16).toUpperCase();
      this.log(`malloc(32): Cấp phát thành công khối 32 bytes tại địa chỉ Heap 0x${addr}`, "heap");
      this.render();
    },

    freeHeap() {
      if (this.heapBlocks > 0) {
        this.heapBlocks--;
        this.log("free(): Giải phóng khối nhớ động trên Heap thành công.", "heap");
      } else {
        this.log("Heap hiện tại đang trống, không có khối nhớ nào để giải phóng.", "system");
      }
      this.render();
    },

    triggerOverflow() {
      this.isOverflow = true;
      this.stackDepth = 7;
      this.heapBlocks = 4;
      this.log("CRITICAL ERROR: Stack Overflow! Ngăn xếp phình to đè vào vùng nhớ Heap/Data -> Kích hoạt HardFault_Handler()!", "error");
      this.render();
    },

    reset() {
      this.stackDepth = 2;
      this.heapBlocks = 1;
      this.isOverflow = false;
      this.log("Đặt lại trạng thái bộ nhớ vi điều khiển.", "system");
      this.render();
    },

    render() {
      const container = document.getElementById("memoryVisualizer");
      if (!container) return;

      const spAddr = (0x2001FFFF - (this.stackDepth * 128)).toString(16).toUpperCase();
      const heapAddr = (0x20000400 + (this.heapBlocks * 128)).toString(16).toUpperCase();

      container.innerHTML = `
        <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">▲ ĐỊA CHỈ CAO (0x2001FFFF - SRAM TOP)</div>
        
        <div class="mem-seg seg-stack ${this.isOverflow ? 'overflow-active' : ''}" style="height: ${45 + this.stackDepth * 14}px;">
          <div>
            <span>STACK SEGMENT (${this.stackDepth} frames)</span><br>
            <small style="font-weight: normal; opacity: 0.85;">Biến cục bộ, Return Address, Frame Pointers</small>
          </div>
          <div style="text-align: right;">
            <span>SP: 0x${spAddr}</span><br>
            <small>▼ Tăng trưởng xuống</small>
          </div>
        </div>

        <div class="mem-seg seg-free-space" style="${this.isOverflow ? 'display: none;' : ''}">
          <span>[ VÙNG NHỚ TRỐNG (FREE SRAM) ]</span>
        </div>

        ${this.isOverflow ? '<div style="background: #ef4444; color: #fff; padding: 8px; text-align: center; border-radius: 4px; font-weight: 800; font-size: 11px;">⚠️ XUNG ĐỘT STACK - HEAP COLLISION!</div>' : ''}

        <div class="mem-seg seg-heap" style="height: ${35 + this.heapBlocks * 12}px;">
          <div>
            <span>HEAP SEGMENT (${this.heapBlocks} blocks malloc)</span><br>
            <small style="font-weight: normal; opacity: 0.85;">Cấp phát động con trỏ</small>
          </div>
          <div style="text-align: right;">
            <span>BRK: 0x${heapAddr}</span><br>
            <small>▲ Tăng trưởng lên</small>
          </div>
        </div>

        <div class="mem-seg seg-bss">
          <span>.BSS SEGMENT (Zero-initialized)</span>
          <span>0x20000100</span>
        </div>

        <div class="mem-seg seg-data">
          <span>.DATA SEGMENT (Copied from Flash at Boot)</span>
          <span>0x20000000</span>
        </div>

        <div style="font-size: 11px; color: #64748b; margin: 6px 0 2px 0;">▼ ĐÁY SRAM (0x20000000) | FLASH MEMORY TIẾP THEO ▼</div>

        <div class="mem-seg seg-text">
          <span>.TEXT & .RODATA (FLASH ROM - 0x08000000)</span>
          <span>Read-Only</span>
        </div>
      `;
    }
  },

  // =========================================================================
  // 2. GPIO REGISTERS SIMULATOR
  // =========================================================================
  gpio: {
    moder: 0x00000400, // Bit 10 = 1 (PA5 Mode = 01: General Purpose Output)
    odr: 0x00000020,   // Bit 5 = 1 (PA5 Output = HIGH)

    init() {
      this.render();
    },

    toggleModerBit(bitIndex) {
      this.moder ^= (1 << bitIndex);
      this.render();
    },

    toggleOdrBit(bitIndex) {
      this.odr ^= (1 << bitIndex);
      this.render();
    },

    render() {
      const moderBox = document.getElementById("moderBitfield");
      const odrBox = document.getElementById("odrBitfield");
      if (!moderBox || !odrBox) return;

      // Render MODER (16 bits hiển thị chân 0 đến 7)
      moderBox.innerHTML = "";
      for (let i = 15; i >= 0; i--) {
        const isSet = (this.moder & (1 << i)) !== 0;
        const cell = document.createElement("div");
        cell.className = `bit-cell ${isSet ? 'active-bit' : ''}`;
        cell.innerHTML = `<span class="bit-num">${i}</span><span class="bit-val">${isSet ? 1 : 0}</span>`;
        cell.addEventListener("click", () => this.toggleModerBit(i));
        moderBox.appendChild(cell);
      }

      // Render ODR (16 bits hiển thị chân 0 đến 15)
      odrBox.innerHTML = "";
      for (let i = 15; i >= 0; i--) {
        const isSet = (this.odr & (1 << i)) !== 0;
        const cell = document.createElement("div");
        cell.className = `bit-cell ${isSet ? 'active-bit' : ''}`;
        cell.innerHTML = `<span class="bit-num">${i}</span><span class="bit-val">${isSet ? 1 : 0}</span>`;
        cell.addEventListener("click", () => this.toggleOdrBit(i));
        odrBox.appendChild(cell);
      }

      // Đánh giá chế độ PA5: 2 bit [11:10]
      const pa5ModeBits = (this.moder >> 10) & 0x03;
      const modeTextEl = document.getElementById("moderModeText");
      let modeDesc = "";
      let isOutput = false;
      if (pa5ModeBits === 0) modeDesc = "00 (Input Mode - Đọc đầu vào)";
      else if (pa5ModeBits === 1) { modeDesc = "01 (Output Mode - Xuất tín hiệu)"; isOutput = true; }
      else if (pa5ModeBits === 2) modeDesc = "10 (Alternate Function Mode - Chức năng phụ)";
      else if (pa5ModeBits === 3) modeDesc = "11 (Analog Mode - Bộ ADC/DAC)";
      if (modeTextEl) modeTextEl.textContent = modeDesc;

      // Đánh giá trạng thái logic chân PA5 Out: Bit 5
      const pa5OutBit = (this.odr >> 5) & 0x01;
      const odrTextEl = document.getElementById("odrPinText");
      if (odrTextEl) odrTextEl.textContent = `${pa5OutBit} (${pa5OutBit ? 'HIGH - 3.3V' : 'LOW - 0.0V'})`;

      // LED logic: Chỉ sáng khi được cấu hình Output VÀ ODR bit 5 = 1
      const ledEl = document.getElementById("virtualLed");
      const labelEl = document.getElementById("ledStateLabel");
      if (isOutput && pa5OutBit === 1) {
        ledEl?.classList.add("on");
        if (labelEl) {
          labelEl.textContent = "LED ON (SÁNG) - Dòng điện 10mA";
          labelEl.style.color = "var(--accent-green)";
        }
      } else {
        ledEl?.classList.remove("on");
        if (labelEl) {
          labelEl.textContent = isOutput ? "LED OFF (TẮT) - 0.0V" : "LED OFF (Chân không ở chế độ Output)";
          labelEl.style.color = "var(--text-muted)";
        }
      }
    }
  },

  // =========================================================================
  // 3. PID CONTROLLER SIMULATOR
  // =========================================================================
  pid: {
    kp: 2.0,
    ki: 0.5,
    kd: 0.8,
    setpoint: 100,
    animationId: null,

    init() {
      this.bindInputs();
      this.simulate();
    },

    bindInputs() {
      const bind = (id, target, displayId, suffix = "") => {
        const slider = document.getElementById(id);
        const disp = document.getElementById(displayId);
        slider?.addEventListener("input", (e) => {
          this[target] = parseFloat(e.target.value);
          if (disp) disp.textContent = `${this[target]}${suffix}`;
          this.simulate();
        });
      };

      bind("sliderKp", "kp", "valKp");
      bind("sliderKi", "ki", "valKi");
      bind("sliderKd", "kd", "valKd");
      bind("sliderSetpoint", "setpoint", "valSetpoint", " RPM");
    },

    simulate() {
      const canvas = document.getElementById("pidCanvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      // Mô phỏng toán học hệ thống điều khiển động cơ DC
      const dt = 0.02; // 20ms sample time
      const steps = 300;
      let pv = 0; // Process variable (tốc độ thực tế)
      let prevPv = 0;
      let integral = 0;
      let prevError = this.setpoint;

      const data = [];
      let maxPv = 0;
      let settlingIndex = -1;

      // Thông số động cơ (Motor transfer function: First-order with inertia)
      const motorInertia = 0.85;

      for (let i = 0; i < steps; i++) {
        const error = this.setpoint - pv;
        integral += error * dt;
        // Anti-windup
        integral = Math.max(-50, Math.min(50, integral));
        const derivative = (error - prevError) / dt;

        let u = (this.kp * error) + (this.ki * integral) + (this.kd * derivative);
        u = Math.max(-200, Math.min(200, u)); // Saturation

        // Cập nhật động học động cơ
        pv = (pv * motorInertia) + (u * (1 - motorInertia) * 1.05);

        data.push(pv);
        if (pv > maxPv) maxPv = pv;

        // Tính thời gian xác lập (nằm trong dải ±2% của setpoint)
        if (Math.abs(error) > this.setpoint * 0.02) {
          settlingIndex = i;
        }

        prevError = error;
        prevPv = pv;
      }

      // Hiển thị số liệu thống kê
      const overshoot = Math.max(0, ((maxPv - this.setpoint) / this.setpoint) * 100).toFixed(1);
      const settlingTime = ((settlingIndex + 1) * dt).toFixed(2);
      const finalError = Math.abs(this.setpoint - data[data.length - 1]).toFixed(1);

      document.getElementById("statOvershoot").textContent = `${overshoot}%`;
      document.getElementById("statSettling").textContent = `${settlingTime}s`;
      document.getElementById("statError").textContent = `${finalError} RPM`;

      // Vẽ đồ thị lên Canvas
      ctx.clearRect(0, 0, width, height);

      // Lưới tọa độ
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Tỉ lệ scale
      const maxVal = Math.max(this.setpoint * 1.5, maxPv * 1.1, 150);
      const getY = (v) => height - 30 - ((v / maxVal) * (height - 60));

      // 1. Vẽ đường Setpoint
      const setpointY = getY(this.setpoint);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(40, setpointY);
      ctx.lineTo(width, setpointY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label Setpoint
      ctx.fillStyle = "#ef4444";
      ctx.font = "11px Fira Code, monospace";
      ctx.fillText(`SP: ${this.setpoint}`, 5, setpointY + 4);

      // 2. Vẽ đường đáp ứng thực tế (PV)
      ctx.strokeStyle = "#00d2ff";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00d2ff";
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const stepX = (width - 50) / steps;
      for (let i = 0; i < steps; i++) {
        const x = 45 + i * stepX;
        const y = getY(data[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  },

  // =========================================================================
  // 4. DIFFERENTIAL DRIVE ROBOT SIMULATOR
  // =========================================================================
  robot: {
    vl: 30,
    vr: 35,
    x: 300,
    y: 200,
    theta: 0,
    wheelBase: 50,
    trail: [],
    timer: null,

    init() {
      this.bindInputs();
      this.startLoop();
    },

    bindInputs() {
      const vlSlider = document.getElementById("sliderVl");
      const vrSlider = document.getElementById("sliderVr");

      vlSlider?.addEventListener("input", (e) => {
        this.vl = parseFloat(e.target.value);
        document.getElementById("valVl").textContent = `${this.vl} mm/s`;
      });

      vrSlider?.addEventListener("input", (e) => {
        this.vr = parseFloat(e.target.value);
        document.getElementById("valVr").textContent = `${this.vr} mm/s`;
      });

      document.getElementById("btnRobotStraight")?.addEventListener("click", () => {
        this.setVelocities(35, 35);
      });
      document.getElementById("btnRobotTurnLeft")?.addEventListener("click", () => {
        this.setVelocities(15, 35);
      });
      document.getElementById("btnRobotTurnRight")?.addEventListener("click", () => {
        this.setVelocities(35, 15);
      });
      document.getElementById("btnRobotSpin")?.addEventListener("click", () => {
        this.setVelocities(-25, 25);
      });
      document.getElementById("btnRobotStop")?.addEventListener("click", () => {
        this.setVelocities(0, 0);
      });
      document.getElementById("btnRobotClear")?.addEventListener("click", () => {
        this.trail = [];
      });
    },

    setVelocities(vl, vr) {
      this.vl = vl;
      this.vr = vr;
      const s1 = document.getElementById("sliderVl");
      const s2 = document.getElementById("sliderVr");
      if (s1) s1.value = vl;
      if (s2) s2.value = vr;
      document.getElementById("valVl").textContent = `${vl} mm/s`;
      document.getElementById("valVr").textContent = `${vr} mm/s`;
    },

    startLoop() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => this.update(), 40); // 25 FPS
    },

    update() {
      const dt = 0.04;
      const v = (this.vr + this.vl) / 2.0;
      const omega = (this.vr - this.vl) / this.wheelBase;

      // Tích phân Odometry
      this.x += v * Math.cos(this.theta + (omega * dt) / 2.0) * dt;
      this.y += v * Math.sin(this.theta + (omega * dt) / 2.0) * dt;
      this.theta += omega * dt;

      // Wrap góc [-PI, PI]
      while (this.theta > Math.PI) this.theta -= 2 * Math.PI;
      while (this.theta < -Math.PI) this.theta += 2 * Math.PI;

      // Giới hạn biên màn hình
      if (this.x < 20) this.x = 580;
      if (this.x > 580) this.x = 20;
      if (this.y < 20) this.y = 380;
      if (this.y > 380) this.y = 20;

      // Lưu vết quỹ đạo
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 250) this.trail.shift();

      // Cập nhật text Odometry
      document.getElementById("odomX").textContent = `${this.x.toFixed(1)} mm`;
      document.getElementById("odomY").textContent = `${this.y.toFixed(1)} mm`;
      document.getElementById("odomTheta").textContent = `${(this.theta * 180 / Math.PI).toFixed(1)}°`;
      document.getElementById("odomLinVel").textContent = `${v.toFixed(1)} mm/s`;
      document.getElementById("odomAngVel").textContent = `${omega.toFixed(2)} rad/s`;

      this.render();
    },

    render() {
      const canvas = document.getElementById("robotCanvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Lưới nền
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Vẽ vết chuyển động (Trail)
      if (this.trail.length > 1) {
        ctx.strokeStyle = "rgba(0, 210, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // Vẽ xe robot
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.theta);

      // Thân xe robot
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-22, -18, 44, 36, 6);
      ctx.fill();
      ctx.stroke();

      // Mũi tên chỉ hướng trước
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(8, -7);
      ctx.lineTo(8, 7);
      ctx.closePath();
      ctx.fill();

      // Bánh trái & Bánh phải
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(-10, -22, 20, 5); // Bánh trái
      ctx.fillRect(-10, 17, 20, 5);  // Bánh phải

      // Cảm biến Lidar tròn ở giữa
      ctx.fillStyle = "#00d2ff";
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  },

  // =========================================================================
  // 5. SERIAL WAVEFORM SIMULATOR
  // =========================================================================
  waveform: {
    protocol: "uart",

    init() {
      const select = document.getElementById("protocolSelect");
      select?.addEventListener("change", (e) => {
        this.protocol = e.target.value;
        this.render();
      });
      this.render();
    },

    render() {
      const canvas = document.getElementById("waveformCanvas");
      const expl = document.getElementById("waveformExplanation");
      if (!canvas || !expl) return;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (this.protocol === "uart") {
        this.drawUart(ctx, width, height);
        expl.innerHTML = `
          <strong>Phân Tích Dạng Sóng UART (Ký tự 'A' = mã ASCII 0x41 = 0b01000001):</strong><br>
          1. <strong>Đường rỗi (Idle)</strong>: Luôn ở mức cao (HIGH = 3.3V).<br>
          2. <strong>Start Bit</strong>: Sườn xuống từ 1 về 0 thông báo có byte mới.<br>
          3. <strong>Data Bits</strong>: Truyền bit trọng số thấp trước (LSB First): 1, 0, 0, 0, 0, 0, 1, 0.<br>
          4. <strong>Stop Bit</strong>: Trả về mức cao (HIGH) kết thúc khung truyền.
        `;
      } else if (this.protocol === "spi_mode0") {
        this.drawSpi(ctx, width, height, 0, 0);
        expl.innerHTML = `
          <strong>Phân Tích SPI Mode 0 (CPOL = 0, CPHA = 0 - Byte 0x93):</strong><br>
          - <strong>CPOL = 0</strong>: Xung nhịp SCK rỗi ở mức THẤP (LOW = 0V).<br>
          - <strong>CPHA = 0</strong>: Lấy mẫu dữ liệu (Sample) ở <em>sườn lên đầu tiên (Rising Edge)</em> của SCK.<br>
          - Dây CS kéo xuống mức 0 để kích hoạt chip Slave trước khi truyền.
        `;
      } else if (this.protocol === "spi_mode3") {
        this.drawSpi(ctx, width, height, 1, 1);
        expl.innerHTML = `
          <strong>Phân Tích SPI Mode 3 (CPOL = 1, CPHA = 1 - Byte 0x93):</strong><br>
          - <strong>CPOL = 1</strong>: Xung nhịp SCK rỗi ở mức CAO (HIGH = 3.3V).<br>
          - <strong>CPHA = 1</strong>: Lấy mẫu dữ liệu (Sample) ở <em>sườn lên thứ hai</em> của xung SCK.
        `;
      } else if (this.protocol === "i2c") {
        this.drawI2c(ctx, width, height);
        expl.innerHTML = `
          <strong>Phân Tích Giao Thức I2C (Start Condition, 7-bit Address, R/W, ACK):</strong><br>
          - <strong>START Condition</strong>: SDA tụt từ 1 xuống 0 trong khi SCL vẫn đang ở mức CAO (HIGH).<br>
          - Dữ liệu trên đường SDA chỉ được phép thay đổi khi SCL ở mức THẤP.<br>
          - <strong>ACK Bit</strong>: Thiết bị Slave kéo đường SDA xuống 0 ở xung clock thứ 9 để xác nhận đã nhận dữ liệu an toàn.
        `;
      }
    },

    drawUart(ctx, w, h) {
      // Bits: Idle(1), Start(0), D0(1), D1(0), D2(0), D3(0), D4(0), D5(0), D6(1), D7(0), Stop(1), Idle(1)
      const bits = [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1];
      const labels = ["IDLE", "START", "D0=1", "D1=0", "D2=0", "D3=0", "D4=0", "D5=0", "D6=1", "D7=0", "STOP", "IDLE"];
      const bitWidth = (w - 80) / bits.length;
      const yHigh = 70;
      const yLow = 170;

      ctx.strokeStyle = "#00d2ff";
      ctx.lineWidth = 3;
      ctx.beginPath();

      let currentX = 40;
      ctx.moveTo(currentX, bits[0] ? yHigh : yLow);

      for (let i = 0; i < bits.length; i++) {
        const nextY = bits[i] ? yHigh : yLow;
        ctx.lineTo(currentX, nextY);
        ctx.lineTo(currentX + bitWidth, nextY);

        // Label bit
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px Fira Code, monospace";
        ctx.fillText(labels[i], currentX + 6, 210);

        // Đường gióng đứt nét
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(currentX, 40);
        ctx.lineTo(currentX, 190);
        ctx.stroke();
        ctx.restore();

        currentX += bitWidth;
      }
      ctx.stroke();

      // Tiêu đề kênh
      ctx.fillStyle = "#00d2ff";
      ctx.font = "bold 13px Fira Code, monospace";
      ctx.fillText("CH1: TX (Baud 9600)", 40, 45);
    },

    drawSpi(ctx, w, h, cpol, cpha) {
      const bitCount = 8;
      const bitWidth = (w - 100) / (bitCount + 2);
      const yCs = 50;
      const ySck = 110;
      const yMosi = 180;
      const sckLow = cpol ? ySck : ySck + 35;
      const sckHigh = cpol ? ySck - 35 : ySck;

      // 1. Dây CS
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, yCs - 15);
      ctx.lineTo(60, yCs - 15);
      ctx.lineTo(60, yCs + 15);
      ctx.lineTo(w - 60, yCs + 15);
      ctx.lineTo(w - 60, yCs - 15);
      ctx.lineTo(w - 40, yCs - 15);
      ctx.stroke();
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 11px Fira Code";
      ctx.fillText("CS (Chip Select Active LOW)", 40, yCs - 22);

      // 2. Dây SCK
      ctx.strokeStyle = "#38bdf8";
      ctx.beginPath();
      let x = 80;
      ctx.moveTo(40, sckLow);
      ctx.lineTo(x, sckLow);
      for (let i = 0; i < bitCount; i++) {
        ctx.lineTo(x, sckHigh);
        ctx.lineTo(x + bitWidth / 2, sckHigh);
        ctx.lineTo(x + bitWidth / 2, sckLow);
        ctx.lineTo(x + bitWidth, sckLow);
        x += bitWidth;
      }
      ctx.lineTo(w - 40, sckLow);
      ctx.stroke();
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`SCK (CPOL=${cpol}, CPHA=${cpha})`, 40, ySck - 25);

      // 3. Dây MOSI (0x93 = 1001 0011)
      const dataBits = [1, 0, 0, 1, 0, 0, 1, 1];
      ctx.strokeStyle = "#10b981";
      ctx.beginPath();
      x = 80;
      ctx.moveTo(40, yMosi + 15);
      for (let i = 0; i < bitCount; i++) {
        const val = dataBits[i];
        const yVal = val ? yMosi - 15 : yMosi + 15;
        ctx.lineTo(x, yVal);
        ctx.lineTo(x + bitWidth, yVal);

        ctx.fillStyle = "#10b981";
        ctx.fillText(`B${7 - i}=${val}`, x + 6, yMosi + 32);
        x += bitWidth;
      }
      ctx.stroke();
      ctx.fillStyle = "#10b981";
      ctx.fillText("MOSI (Byte: 0x93)", 40, yMosi - 25);
    },

    drawI2c(ctx, w, h) {
      const yScl = 80;
      const ySda = 170;

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 12px Fira Code";
      ctx.fillText("SCL (Clock)", 40, yScl - 25);

      ctx.fillStyle = "#00d2ff";
      ctx.fillText("SDA (Data & Start/ACK)", 40, ySda - 25);

      // START condition: SDA tụt khi SCL HIGH
      ctx.strokeStyle = "#38bdf8"; // SCL
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(40, yScl - 15);
      ctx.lineTo(130, yScl - 15);
      ctx.lineTo(130, yScl + 15); // SCL tụt sau khi SDA đã tụt!
      for (let i = 0; i < 9; i++) {
        const x = 140 + i * 65;
        ctx.lineTo(x, yScl + 15);
        ctx.lineTo(x, yScl - 15);
        ctx.lineTo(x + 30, yScl - 15);
        ctx.lineTo(x + 30, yScl + 15);
        ctx.lineTo(x + 65, yScl + 15);
      }
      ctx.stroke();

      // SDA
      ctx.strokeStyle = "#00d2ff";
      ctx.beginPath();
      ctx.moveTo(40, ySda - 15);
      ctx.lineTo(90, ySda - 15);
      ctx.lineTo(90, ySda + 15); // START CONDITION!
      ctx.lineTo(140, ySda + 15);
      // Giả lập vài bit địa chỉ 0x3C (0111100)
      ctx.lineTo(140 + 65, ySda + 15); // 0
      ctx.lineTo(140 + 65, ySda - 15); // 1
      ctx.lineTo(140 + 130, ySda - 15);
      ctx.stroke();

      // Chú thích Start
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 11px Fira Code";
      ctx.fillText("▼ START CONDITION", 50, ySda + 35);
    }
  }
};
