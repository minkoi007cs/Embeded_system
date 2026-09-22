/**
 * EMBEDDED SYSTEMS & ROBOTICS HUB - APPLICATION CONTROLLER
 */

class AppController {
  constructor() {
    this.curriculum = CURRICULUM_DATA;
    this.currentLevel = this.curriculum[0];
    this.currentLesson = this.currentLevel.lessons[0];

    // Load progress from localStorage
    this.loadState();

    this.initTheme();
    this.bindGlobalEvents();
    this.renderSidebar();
    this.renderActiveLesson();
    this.renderRoadmap();
    this.renderProcessTimeline();
    this.updateProgressStats();

    // Khởi tạo các bộ mô phỏng
    Simulators.memory.init();
    Simulators.gpio.init();
    Simulators.pid.init();
    Simulators.robot.init();
    Simulators.waveform.init();
  }

  loadState() {
    const saved = localStorage.getItem("embed_robotics_progress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.completedLessons = new Set(parsed.completedLessons || []);
        this.quizAnswers = parsed.quizAnswers || {};
      } catch (e) {
        this.completedLessons = new Set();
        this.quizAnswers = {};
      }
    } else {
      this.completedLessons = new Set();
      this.quizAnswers = {};
    }
  }

  saveState() {
    localStorage.setItem("embed_robotics_progress", JSON.stringify({
      completedLessons: Array.from(this.completedLessons),
      quizAnswers: this.quizAnswers
    }));
    this.updateProgressStats();
  }

  initTheme() {
    const isLight = localStorage.getItem("embed_theme") === "light";
    if (isLight) {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
    }
    document.getElementById("themeToggle")?.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      document.body.classList.toggle("dark-theme");
      const lightActive = document.body.classList.contains("light-theme");
      localStorage.setItem("embed_theme", lightActive ? "light" : "dark");
    });
  }

  bindGlobalEvents() {
    // Navigation Tabs
    const navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        navButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const targetTab = btn.getAttribute("data-tab");
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        const pane = document.getElementById(`pane-${targetTab}`);
        if (pane) pane.classList.add("active");

        if (targetTab === "quiz") {
          this.renderQuizArena();
        } else if (targetTab === "simulators") {
          // Trigger redraw of active simulator
          Simulators.pid.simulate();
          Simulators.waveform.render();
        }
      });
    });

    // Simulator sub-tabs
    const simTabBtns = document.querySelectorAll(".sim-tab-btn");
    simTabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        simTabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const simKey = btn.getAttribute("data-sim");
        document.querySelectorAll(".sim-content-pane").forEach(p => p.classList.remove("active"));
        const target = document.getElementById(`sim-${simKey}`);
        if (target) target.classList.add("active");

        if (simKey === "pid") Simulators.pid.simulate();
        if (simKey === "serial") Simulators.waveform.render();
      });
    });

    // Search filter
    document.getElementById("lessonSearch")?.addEventListener("input", (e) => {
      this.filterSidebar(e.target.value.toLowerCase());
    });

    // Toggle completed lesson
    document.getElementById("btnToggleCompleted")?.addEventListener("click", () => {
      if (!this.currentLesson) return;
      if (this.completedLessons.has(this.currentLesson.id)) {
        this.completedLessons.delete(this.currentLesson.id);
      } else {
        this.completedLessons.add(this.currentLesson.id);
      }
      this.saveState();
      this.renderSidebar();
      this.updateCompletedButton();
    });

    // Toolbar jumps
    document.getElementById("btnJumpToQuiz")?.addEventListener("click", () => {
      const qSection = document.getElementById("embeddedQuizSection");
      qSection?.scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("btnOpenSim")?.addEventListener("click", () => {
      document.querySelector('.nav-btn[data-tab="simulators"]')?.click();
    });

    // Quiz filter & reset
    document.getElementById("quizLevelFilter")?.addEventListener("change", (e) => {
      this.renderQuizArena(e.target.value);
    });

    document.getElementById("btnResetQuizProgress")?.addEventListener("click", () => {
      if (confirm("Bạn có chắc chắn muốn đặt lại toàn bộ kết quả trắc nghiệm?")) {
        this.quizAnswers = {};
        this.saveState();
        this.renderQuizArena();
        this.renderActiveLesson();
      }
    });
  }

  // =========================================================================
  // SIDEBAR RENDERING
  // =========================================================================
  renderSidebar() {
    const list = document.getElementById("levelAccordionList");
    if (!list) return;

    list.innerHTML = "";

    this.curriculum.forEach(level => {
      const group = document.createElement("div");
      group.className = "level-group";
      if (level.id === this.currentLevel.id) {
        group.classList.add("open");
      }

      // Đếm tiến độ level
      let doneCount = 0;
      level.lessons.forEach(l => {
        if (this.completedLessons.has(l.id)) doneCount++;
      });
      const pct = Math.round((doneCount / level.lessons.length) * 100);

      // Header button
      const headerBtn = document.createElement("button");
      headerBtn.className = "level-header-btn";
      headerBtn.innerHTML = `
        <div class="level-header-left">
          <span class="level-badge" style="background: ${level.badgeColor}22; color: ${level.badgeColor}; border: 1px solid ${level.badgeColor}44;">L${level.number}</span>
          <span>${level.shortTitle}</span>
        </div>
        <span class="level-progress-ring">${doneCount}/${level.lessons.length}</span>
      `;
      headerBtn.addEventListener("click", () => {
        group.classList.toggle("open");
      });
      group.appendChild(headerBtn);

      // Sublist bài học
      const sublist = document.createElement("div");
      sublist.className = "lesson-sublist";

      level.lessons.forEach(lesson => {
        const itemBtn = document.createElement("button");
        itemBtn.className = `lesson-item-btn ${lesson.id === this.currentLesson.id ? 'active' : ''}`;
        const isDone = this.completedLessons.has(lesson.id);

        itemBtn.innerHTML = `
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 230px;">
            ${lesson.title}
          </span>
          <span class="lesson-status-icon">${isDone ? '✅' : '⚪'}</span>
        `;

        itemBtn.addEventListener("click", () => {
          this.currentLevel = level;
          this.currentLesson = lesson;
          this.renderSidebar();
          this.renderActiveLesson();

          // Tự động chuyển về tab curriculum nếu đang ở tab khác
          document.querySelector('.nav-btn[data-tab="curriculum"]')?.click();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });

        sublist.appendChild(itemBtn);
      });

      group.appendChild(sublist);
      list.appendChild(group);
    });
  }

  filterSidebar(query) {
    const items = document.querySelectorAll(".lesson-item-btn");
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const parentGroup = item.closest(".level-group");
      if (text.includes(query) || query === "") {
        item.style.display = "flex";
        if (query !== "") parentGroup?.classList.add("open");
      } else {
        item.style.display = "none";
      }
    });
  }

  // =========================================================================
  // LESSON CONTENT RENDERING
  // =========================================================================
  renderActiveLesson() {
    if (!this.currentLesson) return;

    // Header info
    document.getElementById("lessonLevelTag").textContent = this.currentLevel.title;
    document.getElementById("lessonDurationTag").textContent = `⏱️ ${this.currentLesson.duration}`;
    document.getElementById("lessonDifficultyTag").textContent = this.currentLesson.difficulty;
    document.getElementById("lessonTitle").textContent = this.currentLesson.title;
    document.getElementById("lessonDesc").textContent = this.currentLesson.summary;

    this.updateCompletedButton();

    // Render markdown content
    const bodyBox = document.getElementById("lessonBodyMarkdown");
    if (bodyBox) {
      bodyBox.innerHTML = this.parseMarkdown(this.currentLesson.content);
    }

    // Render Quizzes
    this.renderEmbeddedQuizzes();
  }

  updateCompletedButton() {
    const isDone = this.completedLessons.has(this.currentLesson.id);
    const icon = document.getElementById("completedBtnIcon");
    const text = document.getElementById("completedBtnText");
    const btn = document.getElementById("btnToggleCompleted");

    if (isDone) {
      if (icon) icon.textContent = "✅";
      if (text) text.textContent = "Đã hoàn thành bài học này";
      btn?.classList.remove("secondary");
    } else {
      if (icon) icon.textContent = "⚪";
      if (text) text.textContent = "Đánh dấu đã hoàn thành";
      btn?.classList.add("secondary");
    }
  }

  parseMarkdown(md) {
    if (!md) return "";

    let html = md.trim();

    // Code blocks ```c ... ```
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
    });

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Paragraphs
    html = html.split('\n\n').map(p => {
      if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<ul') || p.startsWith('<table')) {
        return p;
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  }

  // =========================================================================
  // EMBEDDED QUIZZES
  // =========================================================================
  renderEmbeddedQuizzes() {
    const container = document.getElementById("embeddedQuizList");
    const countBadge = document.getElementById("quizCountBadge");
    if (!container) return;

    const quizzes = this.currentLesson.quizzes || [];
    if (countBadge) countBadge.textContent = `${quizzes.length} câu hỏi`;

    container.innerHTML = "";

    if (quizzes.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">Chưa có bài quiz cho chuyên đề này.</p>`;
      return;
    }

    quizzes.forEach((quiz, idx) => {
      const card = this.createQuizCard(quiz, idx + 1);
      container.appendChild(card);
    });
  }

  createQuizCard(quiz, number) {
    const card = document.createElement("div");
    card.className = "quiz-card";

    const savedAnswer = this.quizAnswers[quiz.id];

    card.innerHTML = `
      <div class="quiz-header">
        <span class="quiz-q-num">CÂU HỎI ${number}</span>
        <span class="quiz-category-tag">${this.currentLevel.shortTitle}</span>
      </div>
      <div class="quiz-question-text">${quiz.question}</div>
      <div class="quiz-options-group" id="opts-${quiz.id}">
        ${quiz.options.map((opt, i) => {
          let extraClass = "";
          if (savedAnswer !== undefined) {
            extraClass = "locked";
            if (i === quiz.correct) extraClass += " selected-correct";
            else if (i === savedAnswer.selected && !savedAnswer.isCorrect) extraClass += " selected-wrong";
          }
          const letters = ["A", "B", "C", "D"];
          return `
            <button class="quiz-option-btn ${extraClass}" data-opt="${i}">
              <span class="opt-prefix">${letters[i]}.</span>
              <span>${opt}</span>
            </button>
          `;
        }).join('')}
      </div>
      <div class="quiz-explanation-box ${savedAnswer !== undefined ? 'show' : ''}" id="expl-${quiz.id}">
        <strong>👉 Giải Thích Chi Tiết:</strong><br>
        ${quiz.explanation}
      </div>
    `;

    // Bind click options
    const optButtons = card.querySelectorAll(".quiz-option-btn");
    optButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        if (this.quizAnswers[quiz.id] !== undefined) return; // Đã trả lời rồi

        const chosenIndex = parseInt(btn.getAttribute("data-opt"));
        const isCorrect = (chosenIndex === quiz.correct);

        this.quizAnswers[quiz.id] = {
          selected: chosenIndex,
          isCorrect: isCorrect
        };
        this.saveState();

        // Cập nhật giao diện nút
        optButtons.forEach((b, idx) => {
          b.classList.add("locked");
          if (idx === quiz.correct) b.classList.add("selected-correct");
          else if (idx === chosenIndex && !isCorrect) b.classList.add("selected-wrong");
        });

        // Mở box giải thích
        card.querySelector(".quiz-explanation-box")?.classList.add("show");
      });
    });

    return card;
  }

  // =========================================================================
  // QUIZ ARENA (FULL POOL)
  // =========================================================================
  renderQuizArena(levelFilter = "all") {
    const list = document.getElementById("arenaQuizList");
    if (!list) return;

    list.innerHTML = "";

    let allQuizzes = [];
    this.curriculum.forEach(lvl => {
      if (levelFilter === "all" || lvl.number.toString() === levelFilter) {
        lvl.lessons.forEach(lsn => {
          if (lsn.quizzes) {
            lsn.quizzes.forEach(q => {
              allQuizzes.push({ quiz: q, level: lvl });
            });
          }
        });
      }
    });

    // Cập nhật thống kê
    let answered = 0;
    let correct = 0;
    allQuizzes.forEach(item => {
      const ans = this.quizAnswers[item.quiz.id];
      if (ans) {
        answered++;
        if (ans.isCorrect) correct++;
      }
    });

    const acc = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    document.getElementById("totalQuizAnswered").textContent = answered;
    document.getElementById("totalQuizCorrect").textContent = correct;
    document.getElementById("totalQuizAccuracy").textContent = `${acc}%`;

    // Render từng câu
    allQuizzes.forEach((item, index) => {
      const card = this.createQuizCard(item.quiz, index + 1);
      list.appendChild(card);
    });
  }

  // =========================================================================
  // ROADMAP GRID
  // =========================================================================
  renderRoadmap() {
    const grid = document.getElementById("roadmapVisualGrid");
    if (!grid) return;

    grid.innerHTML = "";

    this.curriculum.forEach(level => {
      let done = 0;
      level.lessons.forEach(l => { if (this.completedLessons.has(l.id)) done++; });
      const pct = Math.round((done / level.lessons.length) * 100);

      const card = document.createElement("div");
      card.className = "roadmap-stage-card";
      card.innerHTML = `
        <div class="stage-card-top">
          <span class="stage-badge" style="background: ${level.badgeColor}22; color: ${level.badgeColor}; border: 1px solid ${level.badgeColor}55;">
            LEVEL ${level.number}
          </span>
          <span style="font-size: 13px; font-weight: 700; color: ${pct === 100 ? 'var(--accent-green)' : 'var(--text-muted)'}">
            ${pct}% Hoàn Thành (${done}/${level.lessons.length})
          </span>
        </div>
        <h2 class="stage-card-title">${level.title}</h2>
        <p class="stage-card-desc">${level.description}</p>
        <div class="stage-topics-tags">
          ${level.lessons.map(l => `<span class="topic-tag">${this.completedLessons.has(l.id) ? '✅' : '⚪'} ${l.title}</span>`).join('')}
        </div>
      `;

      card.addEventListener("click", () => {
        this.currentLevel = level;
        this.currentLesson = level.lessons[0];
        this.renderSidebar();
        this.renderActiveLesson();
        document.querySelector('.nav-btn[data-tab="curriculum"]')?.click();
      });

      grid.appendChild(card);
    });
  }

  // =========================================================================
  // PROCESS LOG VIEWER (REAL LOG FROM PROCESS.MD)
  // =========================================================================
  renderProcessTimeline() {
    const timeline = document.getElementById("processTimeline");
    if (!timeline) return;

    const entries = [
      {
        date: "2026-09-22",
        commit: "f77fa83",
        title: "feat(app): Hoàn thiện nền tảng Web Learning Hub và toàn bộ khóa học Level 0 tới Level 6",
        details: "Xây dựng Single Page App với 5 mô phỏng tương tác, Đấu trường Quiz, hoàn thiện bài học từ Level 0 đến Level 6."
      },
      {
        date: "2026-09-22",
        commit: "ec45ff4",
        title: "docs(process): Cập nhật hash commit thực tế cho phiên bản khởi tạo",
        details: "Đồng bộ hóa mã băm (Commit hash) chuẩn của Git vào tài liệu kỹ thuật process.md."
      },
      {
        date: "2026-09-22",
        commit: "1697dbf",
        title: "docs(core): Thiết lập kiến trúc kỹ thuật tech.md và chuẩn hóa quy trình process.md",
        details: "Khởi tạo lộ trình 6 Level từ cơ bản đến nâng cao, 3 bộ templates chuẩn hóa và cấu trúc thư mục dự án."
      }
    ];

    timeline.innerHTML = entries.map(e => `
      <div class="timeline-entry">
        <div class="timeline-header">
          <span class="timeline-date">📅 ${e.date}</span>
          <span class="timeline-commit-hash">commit ${e.commit}</span>
        </div>
        <h3 class="timeline-title">${e.title}</h3>
        <p class="timeline-details">${e.details}</p>
      </div>
    `).join('');
  }

  // =========================================================================
  // PROGRESS STATS
  // =========================================================================
  updateProgressStats() {
    let totalLessons = 0;
    this.curriculum.forEach(lvl => totalLessons += lvl.lessons.length);

    const completed = this.completedLessons.size;
    const pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

    const fill = document.getElementById("headerProgressFill");
    const text = document.getElementById("headerProgressText");

    if (fill) fill.style.width = `${pct}%`;
    if (text) text.textContent = `${pct}%`;
  }
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  window.app = new AppController();
});
