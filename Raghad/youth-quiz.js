document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const formId = urlParams.get("formId");

  if (!formId) {
    showError(
      "No quiz specified. Please select a quiz from the Programs page."
    );
    return;
  }

  loadForm(formId);
});

function loadForm(formId) {
  const forms = JSON.parse(localStorage.getItem("forms") || "[]");
  const form = forms.find((f) => f.id == formId);

  if (!form) {
    showError(
      "Quiz not found. It may have been removed or is no longer available."
    );
    return;
  }

  if (form.status !== "active") {
    showError("This quiz is currently inactive. Please try another quiz.");
    return;
  }

  renderQuiz(form);
}

function renderQuiz(form) {
  // Hide loading, show quiz form
  document.getElementById("quizLoading").style.display = "none";
  document.getElementById("dynamicQuizForm").style.display = "block";

  // Set quiz title
  document.getElementById("quizTitle").textContent = form.title;

  // Render questions
  const formElement = document.getElementById("dynamicQuizForm");
  formElement.innerHTML = "";

  form.questions.forEach((question, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "quiz-question";
    questionDiv.id = `question-${index}`;

    let questionHTML = `
      <p><strong>Q${index + 1})</strong> ${question.text}</p>
    `;

    if (question.type === "multiple") {
      question.answers.forEach((answer, answerIndex) => {
        questionHTML += `
          <div class="quiz-option">
            <input type="radio" id="q${index}-a${answerIndex}" name="q${index}" value="${answerIndex}">
            <label for="q${index}-a${answerIndex}">${answer.text}</label>
          </div>
        `;
      });
    } else if (question.type === "text") {
      questionHTML += `
        <textarea name="q${index}" rows="4" placeholder="Type your answer here..." style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem;"></textarea>
      `;
    }

    questionDiv.innerHTML = questionHTML;
    formElement.appendChild(questionDiv);
  });

  // Add submit button
  const submitBar = document.createElement("div");
  submitBar.className = "quiz-submit-bar";
  submitBar.innerHTML = `
    <button type="button" class="primary-btn" id="submitQuizBtn">
      <i class="fas fa-paper-plane"></i> Submit Answers
    </button>
    <p id="quizResult" class="quiz-result"></p>
  `;
  formElement.appendChild(submitBar);

  // Setup question interactions
  setupQuestionInteractions(form);
}

function setupQuestionInteractions(form) {
  // Add click handlers for options
  document.querySelectorAll(".quiz-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      const radio = option.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;

        // Remove selection from other options in same question
        const questionDiv = option.closest(".quiz-question");
        questionDiv.querySelectorAll(".quiz-option").forEach((otherOption) => {
          otherOption.style.background = "";
          otherOption.style.borderColor = "transparent";
        });

        // Highlight selected option
        option.style.background = "#f0f9ff";
        option.style.borderColor = "#60a5fa";
        option.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.1)";
      }
    });
  });

  // Setup submit button
  document.getElementById("submitQuizBtn").addEventListener("click", () => {
    submitQuiz(form);
  });
}

function submitQuiz(form) {
  let score = 0;
  let totalMultipleChoice = 0;
  const userAnswers = {};

  // Collect answers
  form.questions.forEach((question, index) => {
    if (question.type === "multiple") {
      totalMultipleChoice++;
      const selected = document.querySelector(
        `input[name="q${index}"]:checked`
      );
      if (selected) {
        userAnswers[`q${index}`] = selected.value;
        const selectedIndex = parseInt(selected.value);
        if (question.answers[selectedIndex]?.correct) {
          score++;
        }
      }
    } else {
      const textAnswer = document.querySelector(
        `textarea[name="q${index}"]`
      ).value;
      userAnswers[`q${index}`] = textAnswer;
    }
  });

  const percentage =
    totalMultipleChoice > 0
      ? Math.round((score / totalMultipleChoice) * 100)
      : 0;
  const passed = percentage >= 70;

  // Save result (you can adjust this as needed)
  saveQuizResult(form, score, totalMultipleChoice, percentage);

  // Display results
  displayResults(score, totalMultipleChoice, percentage, passed);
}

function saveQuizResult(form, score, total, percentage) {
  const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
  results.push({
    id: form.id,
    name: form.title,
    score: score,
    total: total,
    percentage: percentage,
    date: new Date().toISOString(),
    passed: percentage >= 70,
    card: form.card,
  });
  localStorage.setItem("quizResults", JSON.stringify(results));
}

function displayResults(score, total, percentage, passed) {
  const resultEl = document.getElementById("quizResult");
  const emoji = passed ? "🎉" : "💪";
  const message = passed
    ? "Excellent work! You've mastered this topic!"
    : "Good effort! Review the material and try again for an even better score!";

  resultEl.innerHTML = `
    <div class="result-card">
      <h3 style="margin-bottom: 1rem;">Quiz Results</h3>
      <div class="result-score">${score}/${total}</div>
      <div class="progress-bar" style="margin: 1.5rem auto; max-width: 300px;">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
      <p class="result-feedback">${emoji} ${message}</p>
      <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
        <button onclick="location.reload()" class="btn btn-secondary">
          <i class="fas fa-redo"></i> Retake Quiz
        </button>
        <button onclick="window.location.href='youth.html'" class="btn btn-primary">
          <i class="fas fa-home"></i> Back to Programs
        </button>
      </div>
    </div>
  `;

  // Scroll to results
  resultEl.scrollIntoView({ behavior: "smooth" });
}

function showError(message) {
  document.getElementById("quizLoading").style.display = "none";
  document.getElementById("quizError").style.display = "block";
  document.getElementById("errorMessage").textContent = message;
}
