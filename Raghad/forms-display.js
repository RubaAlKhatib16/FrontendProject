// forms-display.js - الإصدار المصحح
class FormsDisplay {
  constructor() {
    this.currentCategory = null;
    this.activeForms = [];
  }

  init() {
    this.loadFormsFromURL();
  }

  loadFormsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");

    if (!category) {
      this.showNoFormMessage();
      return;
    }

    this.currentCategory = category;
    this.loadAndDisplayForms(category);
  }

  loadAndDisplayForms(category) {
    // الحصول على البيانات من localStorage
    const forms = JSON.parse(localStorage.getItem("forms") || "[]");
    console.log("📋 جميع النماذج:", forms);

    // تصفية النماذج النشطة لهذه الفئة
    this.activeForms = forms.filter(
      (form) =>
        form.category === category &&
        form.status === "active" &&
        form.audience === "youth"
    );

    console.log(
      `🔍 النماذج النشطة للفئة "${category}":`,
      this.activeForms.length
    );

    if (this.activeForms.length === 0) {
      this.showNoFormMessage();
      return;
    }

    // عرض النماذج
    this.displayAllForms();
  }

  displayAllForms() {
    const container = document.getElementById("formsContainer");

    let html = `
      <header class="quiz-header">
        <div class="container quiz-header-inner">
          <a href="youth.html" class="quiz-logo">
            <img src="images/logo-1.jpeg" alt="TechSphere Logo">
            <span>${this.currentCategory}</span>
          </a>
          <div class="quiz-meta">
            <span>${this.activeForms.length} نشاط متاح</span>
          </div>
        </div>
      </header>

      <main class="container quiz-main">
        <div class="quiz-user-bar">
          <span><i class="fas fa-user-graduate"></i> برنامج الشباب</span>
          <span><i class="fas fa-folder"></i> ${this.currentCategory}</span>
          <span><i class="fas fa-file-alt"></i> ${this.activeForms.length} نموذج</span>
        </div>

        <div class="forms-list" style="margin-top: 2rem;">
    `;

    // عرض كل نموذج
    this.activeForms.forEach((form, index) => {
      html += this.generateFormHTML(form, index);
    });

    html += `
        </div>
        
        <div class="back-section" style="margin-top: 3rem; text-align: center;">
          <a href="youth.html" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem;">
            <i class="fas fa-arrow-left"></i> العودة إلى البرامج
          </a>
        </div>
      </main>
    `;

    container.innerHTML = html;

    // إضافة الأنماط إذا كانت النماذج تحتوي على أسئلة
    this.setupFormInteractions();
  }

  generateFormHTML(form, index) {
    // تحقق إذا كان النموذج يحتوي على أسئلة أو هو رابط خارجي
    if (form.questions && form.questions.length > 0) {
      // نموذج مع أسئلة (كويز)
      return this.generateQuizHTML(form, index);
    } else {
      // نموذج رابط خارجي
      return this.generateExternalFormHTML(form, index);
    }
  }

  generateQuizHTML(form, index) {
    return `
      <div class="form-quiz" style="background: white; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
          <div>
            <h3 style="color: #2563eb; margin-bottom: 0.5rem;">${
              form.title
            }</h3>
            <p style="color: #64748b; margin-bottom: 1rem;">${
              form.description || "لا يوجد وصف"
            }</p>
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
              <span style="background: #f1f5f9; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; color: #475569;">
                <i class="fas fa-question-circle"></i> ${
                  form.questions?.length || 0
                } سؤال
              </span>
              <span style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem;">
                <i class="fas fa-check-circle"></i> نشط
              </span>
            </div>
          </div>
          <div style="text-align: right;">
            ${
              form.deadline
                ? `
              <div style="color: #ef4444; font-size: 0.875rem;">
                <i class="fas fa-clock"></i> ينتهي في: ${form.deadline}
              </div>
            `
                : ""
            }
          </div>
        </div>
        
        <div class="quiz-content" style="margin-top: 1.5rem;">
          <form class="quiz-form" id="quizForm-${index}">
            ${this.generateQuestionsHTML(form.questions)}
            
            <div class="quiz-submit-bar" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
              <button type="button" class="primary-btn" onclick="submitQuiz(${index})" style="padding: 0.75rem 2rem;">
                <i class="fas fa-paper-plane"></i> إرسال الإجابات
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  generateExternalFormHTML(form, index) {
    return `
      <div class="form-card" style="background: white; border-radius: 12px; padding: 2rem; margin-bottom: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h3 style="color: #2563eb; margin-bottom: 0.5rem;">${
              form.title
            }</h3>
            <p style="color: #64748b; margin-bottom: 1rem; line-height: 1.6;">${
              form.description || "لا يوجد وصف"
            }</p>
          </div>
          <div style="text-align: right;">
            ${
              form.deadline
                ? `
              <div style="color: #ef4444; font-size: 0.875rem; margin-bottom: 0.5rem;">
                <i class="fas fa-clock"></i> ينتهي في: ${form.deadline}
              </div>
            `
                : ""
            }
            <span style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem;">
              <i class="fas fa-external-link-alt"></i> رابط خارجي
            </span>
          </div>
        </div>
        
        <a href="${form.link || "#"}" 
           target="_blank" 
           class="pill-btn" 
           style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none;">
          <i class="fas fa-external-link-alt"></i> 
          ${form.link ? "فتح النموذج الخارجي" : "الرابط غير متاح"}
        </a>
        
        ${
          !form.link
            ? `
          <div style="margin-top: 1rem; padding: 1rem; background: #fef3c7; border-radius: 8px; color: #92400e; font-size: 0.875rem;">
            <i class="fas fa-exclamation-triangle"></i> هذا النموذج لا يحتوي على رابط حاليًا.
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  generateQuestionsHTML(questions) {
    if (!questions || questions.length === 0) {
      return '<p style="color: #64748b; text-align: center; padding: 2rem;">لا توجد أسئلة في هذا النموذج.</p>';
    }

    let html = "";
    questions.forEach((question, qIndex) => {
      html += `
        <div class="quiz-question" style="margin-bottom: 1.5rem; padding: 1.5rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #60a5fa;">
          <p style="font-weight: 600; color: #1e293b; margin-bottom: 1rem;">
            <strong>س ${qIndex + 1}:</strong> ${question.text || "سؤال بدون نص"}
          </p>
      `;

      if (question.type === "multiple") {
        if (question.answers && question.answers.length > 0) {
          question.answers.forEach((answer, aIndex) => {
            html += `
              <div class="quiz-option" style="margin-bottom: 0.5rem; padding: 0.75rem 1rem; background: white; border-radius: 6px; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s;"
                   onclick="selectAnswer(this, ${qIndex}, ${aIndex})">
                <input type="radio" name="q${qIndex}" id="q${qIndex}_a${aIndex}" value="${aIndex}" style="display: none;">
                <label for="q${qIndex}_a${aIndex}" style="cursor: pointer; display: flex; align-items: center; gap: 0.75rem; margin: 0;">
                  <span style="width: 24px; height: 24px; border: 2px solid #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: #475569;">
                    ${String.fromCharCode(65 + aIndex)}
                  </span>
                  <span>${answer.text || "إجابة بدون نص"}</span>
                </label>
              </div>
            `;
          });
        } else {
          html += `<p style="color: #64748b;">لا توجد خيارات لهذا السؤال.</p>`;
        }
      } else if (question.type === "text") {
        html += `
          <textarea name="q${qIndex}" 
                    rows="4" 
                    style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-family: inherit;"
                    placeholder="اكتب إجابتك هنا..."></textarea>
        `;
      }

      html += `</div>`;
    });

    return html;
  }

  setupFormInteractions() {
    // إضافة الأنماط للتفاعلات
    const style = document.createElement("style");
    style.textContent = `
      .quiz-option:hover {
        background: #f0f9ff !important;
        border-color: #60a5fa !important;
      }
      .quiz-option.selected {
        background: #dbeafe !important;
        border-color: #2563eb !important;
      }
      .quiz-option.selected label span:first-child {
        background: #2563eb !important;
        color: white !important;
        border-color: #2563eb !important;
      }
    `;
    document.head.appendChild(style);
  }

  showNoFormMessage() {
    const container = document.getElementById("formsContainer");
    container.innerHTML = `
      <div style="min-height: 70vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="background: white; padding: 3rem; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; max-width: 500px; width: 90%;">
          <div style="font-size: 4rem; margin-bottom: 1rem; color: #64748b;">📭</div>
          <h2 style="color: #1e293b; margin-bottom: 1rem;">لا توجد نماذج نشطة</h2>
          <p style="color: #64748b; margin-bottom: 2rem; line-height: 1.6;">
            لا توجد نماذج نشطة لهذه الفئة حاليًا.<br>
            يرجى المحاولة مرة أخرى لاحقًا أو اختيار فئة أخرى.
          </p>
          <a href="youth.html" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; text-decoration: none;">
            <i class="fas fa-arrow-left"></i> العودة إلى البرامج
          </a>
        </div>
      </div>
    `;
  }
}

// دالات مساعدة عامة
window.selectAnswer = function (element, questionIndex, answerIndex) {
  // إلغاء تحديد جميع الخيارات في هذا السؤال
  const questionDiv = element.closest(".quiz-question");
  questionDiv.querySelectorAll(".quiz-option").forEach((opt) => {
    opt.classList.remove("selected");
  });

  // تحديد الخيار الحالي
  element.classList.add("selected");
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
};

window.submitQuiz = function (formIndex) {
  const form = document.getElementById(`quizForm-${formIndex}`);
  if (!form) return;

  let score = 0;
  let totalQuestions = 0;
  let allAnswered = true;

  // جمع الإجابات
  form.querySelectorAll(".quiz-question").forEach((qDiv, qIndex) => {
    const question =
      window.formsDisplay.activeForms[formIndex]?.questions?.[qIndex];
    if (!question) return;

    totalQuestions++;

    if (question.type === "multiple") {
      const selectedRadio = qDiv.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        const selectedIndex = parseInt(selectedRadio.value);
        if (question.answers[selectedIndex]?.correct) {
          score++;
        }
      } else {
        allAnswered = false;
        qDiv.style.animation = "pulse 1s infinite";
      }
    }
  });

  if (!allAnswered) {
    alert("⚠️ يرجى الإجابة على جميع الأسئلة قبل الإرسال!");
    return;
  }

  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 70;

  // عرض النتائج
  const resultHTML = `
    <div class="result-card" style="background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%); padding: 2rem; border-radius: 12px; text-align: center; margin-top: 1.5rem;">
      <h3 style="color: #1e293b; margin-bottom: 1rem;">نتيجة الاختبار</h3>
      <div style="font-size: 3rem; font-weight: 800; color: #2563eb; margin: 1rem 0;">${score}/${totalQuestions}</div>
      <div style="background: #e2e8f0; height: 10px; border-radius: 5px; width: 100%; margin: 1.5rem 0;">
        <div style="background: ${
          passed ? "#10b981" : "#2563eb"
        }; height: 100%; width: ${percentage}%; border-radius: 5px;"></div>
      </div>
      <p style="color: #475569; font-size: 1.1rem; margin-bottom: 1.5rem;">
        ${
          passed
            ? "🎉 أحسنت! لقد اجتزت الاختبار بنجاح."
            : "💪 جيد، حاول مرة أخرى لتحقيق نتيجة أفضل!"
        }
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button onclick="location.reload()" class="btn btn-secondary" style="padding: 0.75rem 1.5rem;">
          <i class="fas fa-redo"></i> إعادة المحاولة
        </button>
        <button onclick="window.location.href='youth.html'" class="btn btn-primary" style="padding: 0.75rem 1.5rem;">
          <i class="fas fa-home"></i> العودة للبرامج
        </button>
      </div>
    </div>
  `;

  // إضافة النتائج بعد زر الإرسال
  const submitBar = form.querySelector(".quiz-submit-bar");
  if (submitBar) {
    submitBar.insertAdjacentHTML("afterend", resultHTML);
  }
};

// التهيئة
const formsDisplay = new FormsDisplay();
window.formsDisplay = formsDisplay; // لجعلها متاحة للدوال المساعدة

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 بدء تحميل نماذج العرض...");
  formsDisplay.init();
});
