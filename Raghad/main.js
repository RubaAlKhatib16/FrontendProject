// ============================================
// ENHANCED QUIZ SYSTEM FOR TECHSHERE ACADEMY
// ============================================

const quizManager = {
  // Initialize all features
  init() {
    this.loadProgress();
    this.setupQuizInteractions();
    this.setupProfileActions();
    this.setupFAQAccordion();
    this.setupSmoothScrolling();
    this.setupAnimations();

    // Show welcome message for first-time visitors
    if (!localStorage.getItem("welcomeShown")) {
      setTimeout(() => {
        this.showToast(
          "🎉 Welcome to TechSphere Academy! Start your learning journey today.",
          "success"
        );
        localStorage.setItem("welcomeShown", "true");
      }, 1000);
    }
  },

  // ============================
  // QUIZ FUNCTIONALITY
  // ============================

  setupQuizInteractions() {
    // Visual feedback for selected answers
    document.querySelectorAll(".quiz-option").forEach((option) => {
      option.addEventListener("click", function () {
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;

          // Remove selection from other options in same question
          const questionDiv = this.closest(".quiz-question");
          questionDiv
            .querySelectorAll(".quiz-option")
            .forEach((otherOption) => {
              otherOption.style.background = "";
              otherOption.style.borderColor = "transparent";
            });

          // Highlight selected option
          this.style.background = "#f0f9ff";
          this.style.borderColor = "#60a5fa";
          this.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.1)";

          // Save answer to localStorage
          quizManager.saveAnswer(radio.name, radio.value);
        }
      });
    });

    // Setup quiz timer if present
    this.setupQuizTimer();

    // Add keyboard navigation
    this.setupKeyboardNavigation();
  },

  setupQuizTimer() {
    const timerElement = document.querySelector(".quiz-timer");
    if (timerElement) {
      let timeLeft = 1800; // 30 minutes in seconds
      const updateTimer = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.innerHTML = `<i class="far fa-clock"></i> ${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;

        // Change color when time is running out
        if (timeLeft <= 300) {
          // 5 minutes remaining
          timerElement.style.color = "#ef4444";
          timerElement.style.animation = "pulse 1s infinite";
        }

        if (timeLeft <= 0) {
          clearInterval(timer);
          this.submitCurrentQuiz();
          this.showToast(
            "⏰ Time's up! Quiz submitted automatically.",
            "warning"
          );
        }
        timeLeft--;
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      localStorage.setItem("quizTimer", timer);
    }
  },

  submitCurrentQuiz() {
    // Determine which quiz is currently active
    const forms = document.querySelectorAll("form[id]");
    forms.forEach((form) => {
      if (form.querySelectorAll(".quiz-question").length > 0) {
        this.submitQuiz(form.id);
      }
    });
  },

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const currentQuestion =
          document.querySelector(".quiz-question:focus-within") ||
          document.querySelector(".quiz-question");
        if (currentQuestion) {
          const options = currentQuestion.querySelectorAll(".quiz-option");
          const currentIndex = Array.from(options).findIndex((opt) =>
            opt.querySelector('input[type="radio"]:checked')
          );

          let nextIndex;
          if (e.key === "ArrowDown") {
            nextIndex =
              currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          } else {
            nextIndex =
              currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          }

          if (options[nextIndex]) {
            const radio = options[nextIndex].querySelector(
              'input[type="radio"]'
            );
            radio.checked = true;
            radio.dispatchEvent(new Event("change"));
            options[nextIndex].scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }
    });
  },

  saveAnswer(questionName, answer) {
    const quizId = window.location.pathname.includes("web-quiz")
      ? "webDevQuiz"
      : "aiQuiz";
    const answers = JSON.parse(localStorage.getItem("quizAnswers") || "{}");
    if (!answers[quizId]) answers[quizId] = {};
    answers[quizId][questionName] = answer;
    localStorage.setItem("quizAnswers", JSON.stringify(answers));
  },

  submitQuiz(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const correctAnswers = {
      webDevQuiz: { q1: "c", q2: "c", q3: "c", q4: "b" },
      aiQuiz: { q1: "b", q2: "b", q3: "b", q4: "c" },
    };

    const quizName =
      formId === "webDevQuiz" ? "Web Development Quiz" : "AI & Robotics Quiz";
    const correct = correctAnswers[formId];
    let score = 0;
    const total = Object.keys(correct).length;
    let allAnswered = true;

    // Check all questions
    for (const [question, correctAnswer] of Object.entries(correct)) {
      const selected = form.querySelector(`input[name="${question}"]:checked`);
      if (!selected) {
        allAnswered = false;
        this.highlightUnanswered(question);
      } else {
        if (selected.value === correctAnswer) {
          score++;
          this.markCorrect(selected);
        } else {
          this.markIncorrect(selected, correctAnswer);
        }
      }
    }

    if (!allAnswered) {
      this.showToast(
        "Please answer all questions before submitting!",
        "warning"
      );
      return;
    }

    // Calculate results
    const percentage = Math.round((score / total) * 100);
    const result = {
      name: quizName,
      score: score,
      total: total,
      percentage: percentage,
      date: new Date().toISOString(),
      passed: percentage >= 70,
      timeSpent: this.calculateTimeSpent(),
    };

    // Display results
    this.displayResults(formId, result);

    // Save results
    this.saveQuizResult(result);

    // Show celebration for high scores
    if (percentage >= 90) {
      setTimeout(() => {
        this.showCelebration();
      }, 500);
    }
  },

  calculateTimeSpent() {
    const startTime = localStorage.getItem("quizStartTime");
    if (startTime) {
      const timeSpent = Math.floor((Date.now() - parseInt(startTime)) / 1000);
      localStorage.removeItem("quizStartTime");
      return timeSpent;
    }
    return 0;
  },

  displayResults(formId, result) {
    const resultElementId =
      formId === "webDevQuiz" ? "webDevQuizResult" : "aiQuizResult";
    const resultEl = document.getElementById(resultElementId);

    if (resultEl) {
      const emoji = result.passed ? "🎉" : "💪";
      const message = result.passed
        ? "Excellent work! You've mastered this topic!"
        : "Good effort! Review the material and try again for an even better score!";

      resultEl.innerHTML = `
                <div class="result-card">
                    <h3 style="margin-bottom: 1rem;">Quiz Results</h3>
                    <div class="result-score">${result.score}/${result.total}</div>
                    <div class="progress-bar" style="margin: 1.5rem auto; max-width: 300px;">
                        <div class="progress-fill" style="width: ${result.percentage}%"></div>
                    </div>
                    <p class="result-feedback">${emoji} ${message}</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                        <button onclick="quizManager.retakeQuiz('${formId}')" class="btn btn-secondary">
                            <i class="fas fa-redo"></i> Retake Quiz
                        </button>
                        <button onclick="quizManager.nextQuiz('${formId}')" class="btn btn-primary">
                            <i class="fas fa-arrow-right"></i> Next Topic
                        </button>
                    </div>
                </div>
            `;

      // Scroll to results
      resultEl.scrollIntoView({ behavior: "smooth" });
    }
  },

  highlightUnanswered(questionName) {
    const questionDiv = document
      .querySelector(`input[name="${questionName}"]`)
      ?.closest(".quiz-question");
    if (questionDiv) {
      questionDiv.style.animation = "pulse 2s infinite";
      questionDiv.style.borderLeftColor = "#ef4444";
    }
  },

  markCorrect(radio) {
    const questionDiv = radio.closest(".quiz-question");
    questionDiv.style.borderLeftColor = "#10b981";
    questionDiv.style.background = "#f0fdf4";
  },

  markIncorrect(radio, correctAnswer) {
    const questionDiv = radio.closest(".quiz-question");
    questionDiv.style.borderLeftColor = "#ef4444";
    questionDiv.style.background = "#fef2f2";

    // Show correct answer - CORRECTED SYNTAX
    const correctRadio = questionDiv.querySelector(
      `input[value="${correctAnswer}"]`
    );
    if (correctRadio) {
      correctRadio.parentElement.style.background = "#d1fae5";
      correctRadio.parentElement.style.fontWeight = "600";
    }
  },

  retakeQuiz(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.reset();

    // Reset styles
    form.querySelectorAll(".quiz-question").forEach((q) => {
      q.style.borderLeftColor = "";
      q.style.background = "";
      q.style.animation = "";
    });

    // Reset options
    form.querySelectorAll(".quiz-option").forEach((opt) => {
      opt.style.background = "";
      opt.style.borderColor = "transparent";
      opt.style.boxShadow = "";
    });

    const resultEl = form.querySelector(".quiz-result");
    if (resultEl) {
      resultEl.innerHTML = "";
    }

    // Set new start time
    localStorage.setItem("quizStartTime", Date.now());

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    this.showToast("Quiz reset. Good luck!", "success");
  },

  nextQuiz(currentQuizId) {
    const nextQuiz =
      currentQuizId === "webDevQuiz" ? "ai-quiz.html" : "youth.html#programs";
    window.location.href = nextQuiz;
  },

  saveQuizResult(result) {
    const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
    results.push(result);
    localStorage.setItem("quizResults", JSON.stringify(results));

    // Update profile progress
    this.updateProfileProgress();
  },

  updateProfileProgress() {
    const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
    const passedQuizzes = results.filter((r) => r.passed).length;
    const progress = Math.min((passedQuizzes / 6) * 100, 100);

    // Update progress bars on profile page
    document
      .querySelectorAll(".track-progress .fill")
      .forEach((circle, index) => {
        const percentages = [80, 60, 30, 10];
        const percentage = percentages[index] || 0;
        const offset = 251.2 - (251.2 * percentage) / 100;
        circle.style.strokeDashoffset = offset;

        const percentageText =
          circle.parentElement.querySelector(".track-percentage");
        if (percentageText) {
          percentageText.textContent = `${percentage}%`;
        }
      });
  },

  loadProgress() {
    const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
    const passedQuizzes = results.filter((r) => r.passed).length;
    const progress = Math.min((passedQuizzes / 6) * 100, 100);

    // Update progress bars
    document.querySelectorAll(".progress-fill").forEach((bar) => {
      bar.style.width = `${progress}%`;
    });

    // Update stats on youth page
    if (document.querySelector(".hero-stats")) {
      document
        .querySelectorAll(".hero-stats .stat h3")
        .forEach((stat, index) => {
          if (index === 0) {
            const totalUsers = 10000 + results.length * 10;
            stat.textContent = totalUsers.toLocaleString() + "+";
          }
        });
    }
  },

  // ============================
  // PROFILE FUNCTIONALITY
  // ============================

  setupProfileActions() {
    // Delete account confirmation
    const deleteBtn = document.querySelector(".danger-btn");
    if (deleteBtn && deleteBtn.textContent.includes("Delete")) {
      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.showConfirmationModal(
          "Delete Account",
          "Are you sure you want to delete your account? This will permanently remove all your data, progress, and quiz history. This action cannot be undone.",
          "Delete",
          "danger",
          () => {
            this.showToast(
              "Account deletion scheduled. You will receive a confirmation email.",
              "danger"
            );
            // In a real app, this would make an API call
          }
        );
      });
    }

    // Load user's quiz history
    this.loadQuizHistory();
  },

  loadQuizHistory() {
    const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
    const tableBody = document.querySelector("#quizHistory");

    if (tableBody) {
      // Clear existing rows except template
      tableBody.innerHTML = "";

      results.forEach((result, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${result.name}</td>
                    <td>${result.category || "General"}</td>
                    <td>${new Date(result.date).toLocaleDateString()}</td>
                    <td><strong>${result.percentage}%</strong></td>
                    <td><span class="status-badge ${
                      result.passed ? "completed" : "pending"
                    }">
                        ${
                          result.passed
                            ? "Passed"
                            : result.percentage > 50
                            ? "Review"
                            : "Needs Work"
                        }
                    </span></td>
                    <td>
                        <a href="#" class="action-btn secondary" onclick="quizManager.reviewQuiz(${index})">
                            <i class="fas fa-eye"></i> Review
                        </a>
                    </td>
                `;
        tableBody.appendChild(row);
      });
    }
  },

  reviewQuiz(index) {
    const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
    const result = results[index];
    if (result) {
      this.showToast(
        `Reviewing ${result.name} - Score: ${result.percentage}%`,
        "success"
      );
      // In a real app, this would navigate to a quiz review page
    }
  },

  // ============================
  // FAQ ACCORDION
  // ============================

  setupFAQAccordion() {
    document.querySelectorAll(".faq-question").forEach((btn, index) => {
      btn.style.animationDelay = `${index * 0.1}s`;

      btn.addEventListener("click", () => {
        const item = btn.parentElement;
        const isOpen = item.classList.contains("open");

        // Close all other items
        document.querySelectorAll(".faq-item").forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove("open");
            const otherAnswer = otherItem.querySelector(".faq-answer");
            if (otherAnswer) {
              otherAnswer.style.maxHeight = "0";
            }
          }
        });

        // Toggle current item
        item.classList.toggle("open");
        const answer = item.querySelector(".faq-answer");
        if (isOpen) {
          answer.style.maxHeight = "0";
        } else {
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  },

  // ============================
  // SMOOTH SCROLLING
  // ============================

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });

          // Update URL without page reload
          history.pushState(null, null, targetId);
        }
      });
    });
  },

  // ============================
  // ANIMATIONS
  // ============================

  setupAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe elements for animation
    document
      .querySelectorAll(".step-card, .learn-card, .faq-item, .profile-section")
      .forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(el);
      });
  },

  // ============================
  // MODAL SYSTEM
  // ============================

  showConfirmationModal(title, message, confirmText, confirmType, onConfirm) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-cancel">Cancel</button>
                    <button class="btn btn-${confirmType} modal-confirm">${confirmText}</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Add CSS for modal
    if (!document.querySelector("#modal-styles")) {
      const style = document.createElement("style");
      style.id = "modal-styles";
      style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                .modal-content {
                    background: white;
                    border-radius: var(--radius);
                    padding: 2rem;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: var(--shadow-lg);
                    animation: slideIn 0.3s ease;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .modal-header h3 {
                    margin: 0;
                    color: var(--dark);
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--gray);
                }
                .modal-body {
                    margin-bottom: 2rem;
                    color: var(--gray-dark);
                    line-height: 1.6;
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }
                .btn-danger {
                    background: var(--danger);
                    color: white;
                }
                .btn-danger:hover {
                    background: #dc2626;
                }
            `;
      document.head.appendChild(style);
    }

    // Event listeners
    modal
      .querySelector(".modal-close")
      .addEventListener("click", () => modal.remove());
    modal
      .querySelector(".modal-cancel")
      .addEventListener("click", () => modal.remove());
    modal.querySelector(".modal-confirm").addEventListener("click", () => {
      onConfirm();
      modal.remove();
    });

    // Close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },

  // ============================
  // CELEBRATION FOR HIGH SCORES
  // ============================

  showCelebration() {
    const celebration = document.createElement("div");
    celebration.className = "celebration";
    celebration.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); 
                       display: flex; align-items: center; justify-content: center; z-index: 10001;">
                <div style="background: white; padding: 3rem; border-radius: var(--radius); text-align: center; max-width: 500px;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                    <h2 style="color: var(--primary); margin-bottom: 1rem;">Outstanding Performance!</h2>
                    <p style="color: var(--gray-dark); margin-bottom: 2rem; line-height: 1.6;">
                        You've scored 90% or higher! Your hard work and dedication are paying off. 
                        Keep up the excellent work!
                    </p>
                    <button class="btn btn-primary" onclick="this.closest('.celebration').remove()">
                        Continue Learning
                    </button>
                </div>
            </div>
        `;
    document.body.appendChild(celebration);
  },

  // ============================
  // TOAST NOTIFICATION SYSTEM
  // ============================

  showToast(message, type = "success") {
    // Remove existing toasts
    document.querySelectorAll(".toast").forEach((toast) => toast.remove());

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas fa-${
                  type === "success"
                    ? "check-circle"
                    : type === "warning"
                    ? "exclamation-triangle"
                    : "exclamation-circle"
                }"></i>
                <span>${message}</span>
            </div>
        `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  },
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  quizManager.init();

  // Set quiz start time
  if (document.querySelector(".page-quiz")) {
    localStorage.setItem("quizStartTime", Date.now());
  }

  // Add CSS for animations and toast
  const animationStyles = document.createElement("style");
  animationStyles.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 10000;
            border-left: 4px solid var(--success);
            max-width: 300px;
        }
        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }
        .toast-warning { border-left-color: var(--warning); }
        .toast-danger { border-left-color: var(--danger); }
    `;
  document.head.appendChild(animationStyles);
});

// ============================================
// GLOBAL EXPORTS FOR HTML ONCLICK ATTRIBUTES
// ============================================

window.submitQuiz = (formId) => quizManager.submitQuiz(formId);
window.showToast = (message, type) => quizManager.showToast(message, type);
window.quizManager = quizManager;

// Add this line at the very end of main.js file
window.FormsDisplay = formsDisplay; // Only if you want to access it globally
