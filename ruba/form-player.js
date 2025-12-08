// form-player.js - مشغل النماذج للأطفال
document.addEventListener('DOMContentLoaded', function() {
    console.log('Form Player Loaded');
    
    // ==================== تهيئة المتغيرات ====================
    let currentForm = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let score = 0;
    
    // ==================== العناصر ====================
    const elements = {
        // عناصر الواجهة
        formTitle: document.getElementById('formTitle'),
        formDescriptionSection: document.getElementById('formDescriptionSection'),
        formDescription: document.getElementById('formDescription'),
        formTime: document.getElementById('formTime'),
        formDifficulty: document.getElementById('formDifficulty'),
        formProgress: document.getElementById('formProgress'),
        
        // حاويات
        questionsContainer: document.getElementById('questionsContainer'),
        progressFill: document.getElementById('progressFill'),
        
        // أزرار التنقل
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        submitBtn: document.getElementById('submitBtn'),
        
        // نافذة النتائج
        resultsModal: document.getElementById('resultsModal'),
        scoreValue: document.getElementById('scoreValue'),
        totalScore: document.getElementById('totalScore'),
        bananasCount: document.getElementById('bananasCount'),
        resultMessage: document.getElementById('resultMessage'),
        reviewBtn: document.getElementById('reviewBtn'),
        homeBtn: document.getElementById('homeBtn')
    };
    
    // ==================== تحميل النموذج ====================
    function loadForm() {
        console.log('Loading form...');
        
        try {
            // جلب معرف النموذج من URL
            const urlParams = new URLSearchParams(window.location.search);
            const formId = urlParams.get('id') || 
                          localStorage.getItem('currentFormId') || 
                          '1';
            
            console.log('Form ID:', formId);
            
            // جلب النموذج من localStorage
            let kidsForms = [];
            try {
                kidsForms = JSON.parse(localStorage.getItem('monkeyITKids_forms_kids')) || [];
                console.log('Forms from storage:', kidsForms);
            } catch (e) {
                console.error('Error parsing forms from storage:', e);
                kidsForms = [];
            }
            
            // جلب النموذج الحالي
            currentForm = kidsForms.find(form => {
                console.log('Checking form:', form.id, typeof form.id, 'vs', formId, typeof formId);
                return form.id == formId;
            });
            
            console.log('Found form:', currentForm);
            
            if (!currentForm) {
                console.error('Form not found!');
                
                // استخدام نموذج افتراضي للاختبار
                currentForm = {
                    id: formId,
                    title: "Sample Form",
                    description: "This is a sample form for testing.",
                    time: "10-15 min",
                    difficulty: 2,
                    category: "programming",
                    questions: [
                        {
                            id: 1,
                            question: "What is 2 + 2?",
                            type: "multiple-choice",
                            options: ["3", "4", "5", "6"],
                            correctAnswer: 1,
                            points: 10,
                            font: "Comic Sans MS",
                            bold: true
                        },
                        {
                            id: 2,
                            question: "What is the color of the sky?",
                            type: "multiple-choice",
                            options: ["Red", "Green", "Blue", "Yellow"],
                            correctAnswer: 2,
                            points: 10,
                            font: "Comic Sans MS",
                            bold: true
                        }
                    ]
                };
                
                console.log('Using sample form:', currentForm);
            }
            
            // تحديث واجهة النموذج
            updateFormUI();
            
            // تهيئة إجابات المستخدم
            userAnswers = new Array(currentForm.questions.length).fill(null);
            
            // عرض أول سؤال
            displayQuestion(0);
            
            // تحديث شريط التقدم
            updateProgress();
            
        } catch (error) {
            console.error('Error loading form:', error);
            showError('Error loading form. Please try again.', error);
        }
    }
    
    // ==================== تحديث واجهة النموذج ====================
    function updateFormUI() {
        if (!currentForm) return;
        
        // تحديث العنوان
        elements.formTitle.textContent = currentForm.title || "Untitled Form";
        
        // تحديث الوصف
        const description = currentForm.description || "No description available.";
        elements.formDescription.textContent = description;
        
        // تحديث الوقت
        elements.formTime.textContent = `⏱️ ${currentForm.time || "10-15 min"}`;
        
        // تحديث الصعوبة
        const difficulty = currentForm.difficulty || 2;
        let stars = "";
        for (let i = 0; i < 5; i++) {
            stars += i < difficulty ? "⭐" : "☆";
        }
        elements.formDifficulty.textContent = stars;
        
        // إظهار القسم إذا كان هناك وصف
        if (description && description !== "No description available.") {
            elements.formDescriptionSection.style.display = 'block';
        } else {
            elements.formDescriptionSection.style.display = 'none';
        }
    }
    
    // ==================== عرض السؤال ====================
    function displayQuestion(index) {
        console.log('Displaying question', index);
        
        if (!currentForm || !currentForm.questions || index < 0 || index >= currentForm.questions.length) {
            console.error('Invalid question index:', index);
            return;
        }
        
        const question = currentForm.questions[index];
        currentQuestionIndex = index;
        
        // بناء HTML للسؤال
        let questionHTML = `
            <div class="question-card">
                <div class="question-header">
                    <h3>Question ${index + 1} of ${currentForm.questions.length}</h3>
                    <span class="question-points">${question.points || 10} points</span>
                </div>
                <div class="question-text" style="
                    font-family: '${question.font || 'Comic Sans MS'}';
                    font-weight: ${question.bold ? 'bold' : 'normal'};
                    font-style: ${question.italic ? 'italic' : 'normal'};
                    font-size: ${question.fontSize || '20px'};
                ">
                    ${question.question || question.text || "Question text not available"}
                </div>
        `;
        
        // بناء الخيارات حسب نوع السؤال
        if (question.type === 'multiple-choice' || question.type === 'true-false') {
            const options = question.options || [];
            
            questionHTML += `<div class="options-container">`;
            
            options.forEach((option, optIndex) => {
                // معالجة الخيارات سواء كانت نصاً مباشراً أو كائنات
                const optionText = typeof option === 'object' ? option.text : option;
                const isSelected = userAnswers[index] === optIndex;
                
                questionHTML += `
                    <div class="option ${isSelected ? 'selected' : ''}" 
                         data-index="${optIndex}"
                         onclick="selectOption(${optIndex})">
                        <div class="option-marker">${String.fromCharCode(65 + optIndex)}</div>
                        <div class="option-text">${optionText || `Option ${optIndex + 1}`}</div>
                        <div class="option-check">✓</div>
                    </div>
                `;
            });
            
            questionHTML += `</div>`;
            
        } else if (question.type === 'text') {
            questionHTML += `
                <div class="text-answer-container">
                    <textarea id="textAnswer" 
                              placeholder="Type your answer here..." 
                              rows="4"
                              oninput="saveTextAnswer(this.value)">${userAnswers[index] || ''}</textarea>
                </div>
            `;
        } else {
            // نوع غير معروف
            questionHTML += `
                <div class="question-error">
                    <p>⚠️ This question type is not supported.</p>
                </div>
            `;
        }
        
        questionHTML += `</div>`;
        
        elements.questionsContainer.innerHTML = questionHTML;
        
        // تحديث أزرار التنقل
        updateNavigationButtons();
        
        // تحديث شريط التقدم
        updateProgress();
    }
    
    // ==================== اختيار خيار ====================
    window.selectOption = function(optionIndex) {
        console.log('Selected option:', optionIndex);
        
        // إلغاء تحديد جميع الخيارات
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // تحديد الخيار المختار
        const selectedOption = document.querySelector(`.option[data-index="${optionIndex}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        // حفظ الإجابة
        userAnswers[currentQuestionIndex] = optionIndex;
        
        // تمكين زر التالي
        elements.nextBtn.disabled = false;
        
        // إذا كان هذا هو السؤال الأخير، عرض زر التقديم
        if (currentQuestionIndex === currentForm.questions.length - 1) {
            elements.nextBtn.style.display = 'none';
            elements.submitBtn.style.display = 'flex';
        }
    };
    
    // ==================== حفظ الإجابة النصية ====================
    window.saveTextAnswer = function(text) {
        userAnswers[currentQuestionIndex] = text;
        
        // إذا كان هناك نص، تمكين الزر التالي
        elements.nextBtn.disabled = !text.trim();
        
        // إذا كان السؤال الأخير، عرض زر التقديم
        if (currentQuestionIndex === currentForm.questions.length - 1 && text.trim()) {
            elements.nextBtn.style.display = 'none';
            elements.submitBtn.style.display = 'flex';
        }
    };
    
    // ==================== تحديث أزرار التنقل ====================
    function updateNavigationButtons() {
        // زر السابق
        elements.prevBtn.disabled = currentQuestionIndex === 0;
        
        // زر التالي
        const hasAnswer = userAnswers[currentQuestionIndex] !== null && 
                         userAnswers[currentQuestionIndex] !== undefined;
        elements.nextBtn.disabled = !hasAnswer;
        
        // إخفاء/إظهار زر التقديم
        if (currentQuestionIndex < currentForm.questions.length - 1) {
            elements.nextBtn.style.display = 'flex';
            elements.submitBtn.style.display = 'none';
        } else {
            elements.nextBtn.style.display = 'none';
            if (hasAnswer) {
                elements.submitBtn.style.display = 'flex';
            }
        }
    }
    
    // ==================== تحديث شريط التقدم ====================
    function updateProgress() {
        if (!currentForm || !currentForm.questions) return;
        
        const totalQuestions = currentForm.questions.length;
        const answeredQuestions = userAnswers.filter(answer => 
            answer !== null && answer !== undefined && answer !== ''
        ).length;
        
        const progressPercent = (answeredQuestions / totalQuestions) * 100;
        
        // تحديث شريط التقدم
        elements.progressFill.style.width = `${progressPercent}%`;
        
        // تحديث النص
        elements.formProgress.textContent = `Question ${currentQuestionIndex + 1}/${totalQuestions} (${answeredQuestions} answered)`;
    }
    
    // ==================== الانتقال للسؤال التالي ====================
    function goToNextQuestion() {
        if (currentQuestionIndex < currentForm.questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        }
    }
    
    // ==================== الانتقال للسؤال السابق ====================
    function goToPrevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
        }
    }
    
  // ==================== تقديم النموذج ====================
function submitForm() {
    console.log('Submitting form...');
    console.log('User answers:', userAnswers);
    console.log('Form data:', currentForm);
    
    if (!currentForm || !currentForm.questions) {
        showError('No questions to submit!');
        return;
    }
    
    // حساب النتيجة
    score = 0;
    let correctAnswers = 0;
    let questionResults = [];
    
    currentForm.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        let isCorrect = false;
        let correctAnswerIndex = null;
        
        // البحث عن الإجابة الصحيحة في الخيارات
        if (question.type === 'multiple-choice' && question.options) {
            // البحث عن الخيار الصحيح
            question.options.forEach((option, optIndex) => {
                if (option.correct === true) {
                    correctAnswerIndex = optIndex;
                }
            });
            
            // التحقق من إجابة المستخدم
            if (userAnswer !== null && userAnswer !== undefined) {
                const selectedOption = question.options[userAnswer];
                if (selectedOption && selectedOption.correct === true) {
                    score += question.points || 10;
                    correctAnswers++;
                    isCorrect = true;
                    console.log(`Question ${index} - Correct! Score: ${score}`);
                }
            }
        } 
        else if (question.type === 'true-false' && question.options && question.options.length > 0) {
            // معالجة أسئلة الصح/خطأ
            const correctAnswer = question.options[0].correct; // أول خيار يحوي القيمة الصحيحة
            const userAnswerStr = userAnswer === 0 ? 'true' : 'false'; // 0=true, 1=false
            
            if (userAnswer !== null && userAnswer !== undefined) {
                const userIsTrue = userAnswer === 0; // 0 = true, 1 = false
                if (userIsTrue === correctAnswer) {
                    score += question.points || 10;
                    correctAnswers++;
                    isCorrect = true;
                }
            }
            correctAnswerIndex = correctAnswer ? 0 : 1;
        }
        
        // حفظ نتيجة السؤال
        questionResults.push({
            questionIndex: index,
            userAnswer: userAnswer,
            correctAnswer: correctAnswerIndex,
            isCorrect: isCorrect,
            points: isCorrect ? (question.points || 10) : 0
        });
    });
    
    // حساب النقاط الكلية
    const totalPoints = currentForm.questions.reduce((sum, q) => sum + (q.points || 10), 0);
    
    // حساب الموزات بناءً على النسبة المئوية
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const bananasEarned = Math.floor(percentage / 10) + 1; // كل 10% = 1 موزة
    
    console.log(`Final Score: ${score}/${totalPoints} (${percentage}%)`);
    console.log(`Bananas: ${bananasEarned}`);
    console.log('Question Results:', questionResults);
    
    // تحديث واجهة النتائج
    updateResultsUI(score, totalPoints, bananasEarned, percentage, questionResults);
    
    // تحديث بيانات المستخدم
    updateUserData(score, bananasEarned);
    
    // عرض نافذة النتائج
    elements.resultsModal.style.display = 'flex';
    
    // تمييز الإجابات الصحيحة والخاطئة
    highlightAnswers(questionResults);
    
    // تأثيرات الاحتفال
    celebrateCompletion(bananasEarned);
}

// ==================== تحديث واجهة النتائج ====================
function updateResultsUI(score, totalPoints, bananasEarned, percentage, questionResults) {
    elements.scoreValue.textContent = score;
    elements.totalScore.textContent = totalPoints;
    elements.bananasCount.textContent = bananasEarned;
    
    // تحديد رسالة النتيجة
    let message = "";
    let emoji = "";
    
    if (percentage >= 90) {
        message = "Excellent! You're a genius!";
        emoji = "🎯";
    } else if (percentage >= 70) {
        message = "Great job! You're doing amazing!";
        emoji = "⭐";
    } else if (percentage >= 50) {
        message = "Good work! Keep practicing!";
        emoji = "💪";
    } else if (percentage > 0) {
        message = "Nice try! Practice makes perfect!";
        emoji = "🌱";
    } else {
        message = "Let's try again! You can do it!";
        emoji = "🔄";
    }
    
    elements.resultMessage.textContent = `${emoji} ${message}`;
    
    // إضافة تفاصيل الإجابات
    const resultsDetails = document.createElement('div');
    resultsDetails.className = 'results-details';
    resultsDetails.innerHTML = `
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
            <h4 style="margin-bottom: 10px; color: #6e3c14;">📋 Results Breakdown:</h4>
            ${questionResults.map((result, index) => {
                const question = currentForm.questions[index];
                return `
                    <div class="question-result" style="margin-bottom: 10px; padding: 10px; 
                          background: ${result.isCorrect ? '#e8f5e9' : '#ffebee'}; 
                          border-radius: 5px; border-left: 4px solid ${result.isCorrect ? '#4CAF50' : '#f44336'};">
                        <strong>Q${index + 1}:</strong> ${result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        <span style="float: right; color: #666;">${result.points} points</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // إضافة التفاصيل بعد رسالة النتيجة
    elements.resultMessage.after(resultsDetails);
}

// ==================== تمييز الإجابات ====================
function highlightAnswers(questionResults) {
    questionResults.forEach((result, index) => {
        const questionContainer = document.querySelector('.question-card');
        if (!questionContainer) return;
        
        if (result.isCorrect) {
            // تمييز الإجابة الصحيحة باللون الأخضر
            const selectedOption = document.querySelector(`.option[data-index="${result.userAnswer}"]`);
            if (selectedOption) {
                selectedOption.style.backgroundColor = '#d4edda';
                selectedOption.style.borderColor = '#c3e6cb';
                
                // إضافة علامة صح
                const checkMark = selectedOption.querySelector('.option-check');
                if (checkMark) {
                    checkMark.style.display = 'block';
                    checkMark.style.color = '#155724';
                }
            }
        } else {
            // تمييز الإجابة الخاطئة باللون الأحمر
            const selectedOption = document.querySelector(`.option[data-index="${result.userAnswer}"]`);
            if (selectedOption) {
                selectedOption.style.backgroundColor = '#f8d7da';
                selectedOption.style.borderColor = '#f5c6cb';
                
                // إضافة علامة خطأ
                const checkMark = selectedOption.querySelector('.option-check');
                if (checkMark) {
                    checkMark.style.display = 'block';
                    checkMark.textContent = '✗';
                    checkMark.style.color = '#721c24';
                }
            }
            
            // تمييز الإجابة الصحيحة باللون الأخضر
            const correctOption = document.querySelector(`.option[data-index="${result.correctAnswer}"]`);
            if (correctOption && correctOption !== selectedOption) {
                correctOption.style.backgroundColor = '#d4edda';
                correctOption.style.borderColor = '#c3e6cb';
                
                // إضافة علامة صح للإجابة الصحيحة
                const correctMark = document.createElement('div');
                correctMark.className = 'correct-answer-marker';
                correctMark.textContent = '✓ Correct Answer';
                correctMark.style.cssText = `
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #155724;
                    font-size: 12px;
                    font-weight: bold;
                `;
                correctOption.style.position = 'relative';
                correctOption.appendChild(correctMark);
            }
        }
    });
}

// ==================== تحديث دالة loadForm للتعامل مع البيانات ====================
function loadForm() {
    console.log('Loading form...');
    
    try {
        // جلب معرف النموذج من URL
        const urlParams = new URLSearchParams(window.location.search);
        const formId = urlParams.get('id');
        
        console.log('Form ID from URL:', formId);
        
        // جلب النموذج من localStorage
        let kidsForms = [];
        try {
            kidsForms = JSON.parse(localStorage.getItem('admin_kids_forms')) || 
                       JSON.parse(localStorage.getItem('monkeyITKids_forms_kids')) || 
                       [];
            console.log('Forms found:', kidsForms.length);
        } catch (e) {
            console.error('Error parsing forms from storage:', e);
            kidsForms = [];
        }
        
        // جلب النموذج الحالي
        currentForm = kidsForms.find(form => form.id == formId);
        
        console.log('Current form:', currentForm);
        
        if (!currentForm) {
            console.warn('Form not found, using sample form');
          // نموذج افتراضي لاختبار عرض الفورم لصفحة test
currentForm = {
    id: formId || 1,
    title: "Monkey IT Kids – Beginner Quiz",
    description: "Fun introduction to computers and digital safety!",
    time: "10–15 min",
    difficulty: 1,
    category: "kids",
    questions: [
        {
            text: "What is a computer mainly used for?",
            type: "multiple-choice",
            points: 10,
            font: "Comic Sans MS",
            bold: true,
            options: [
                { text: "Eating bananas", correct: false },
                { text: "Sending and storing information", correct: true },
                { text: "Sleeping", correct: false },
                { text: "Drawing only", correct: false }
            ]
        },
        {
            text: "Which of these is a programming language?",
            type: "multiple-choice",
            points: 10,
            font: "Comic Sans MS",
            bold: false,
            options: [
                { text: "Python", correct: true },
                { text: "Banana", correct: false },
                { text: "Water", correct: false },
                { text: "Tree", correct: false }
            ]
        },
        {
            text: "Which device helps you click on things?",
            type: "multiple-choice",
            points: 10,
            font: "Comic Sans MS",
            bold: false,
            options: [
                { text: "Mouse", correct: true },
                { text: "Banana", correct: false },
                { text: "Speaker", correct: false },
                { text: "Fridge", correct: false }
            ]
        },
        {
            text: "Which of the following is safe online?",
            type: "multiple-choice",
            points: 10,
            font: "Comic Sans MS",
            bold: true,
            options: [
                { text: "Sharing your home address", correct: false },
                { text: "Keeping personal info private", correct: true },
                { text: "Talking to strangers", correct: false },
                { text: "Opening every link you get", correct: false }
            ]
        }
    ]
};
  
         }
        
        // تنظيف بيانات النموذج
        cleanFormData(currentForm);
        
        // تحديث واجهة النموذج
        updateFormUI();
        
        // تهيئة إجابات المستخدم
        userAnswers = new Array(currentForm.questions.length).fill(null);
        
        // عرض أول سؤال
        displayQuestion(0);
        
        // تحديث شريط التقدم
        updateProgress();
        
    } catch (error) {
        console.error('Error loading form:', error);
        showError('Error loading form. Please try again.', error);
    }
}

// ==================== تنظيف بيانات النموذج ====================
function cleanFormData(form) {
    if (!form.questions) return;
    
    form.questions.forEach((question, index) => {
        // التأكد من وجود نوع السؤال
        if (!question.type) question.type = 'multiple-choice';
        
        // التأكد من وجود الخيارات
        if (!question.options) {
            question.options = [
                { text: "Option 1", correct: false },
                { text: "Option 2", correct: true }
            ];
        }
        
        // التأكد من أن كل خيار له خاصية correct
        question.options.forEach((option, optIndex) => {
            if (typeof option === 'string') {
                question.options[optIndex] = { 
                    text: option, 
                    correct: optIndex === 0 // أول خيار صحيح افتراضياً
                };
            } else if (option && typeof option === 'object') {
                if (typeof option.correct === 'undefined') {
                    option.correct = optIndex === 0;
                }
            }
        });
        
        // التأكد من وجود نقطة صحيحة واحدة على الأقل
        const hasCorrectAnswer = question.options.some(opt => opt.correct === true);
        if (!hasCorrectAnswer && question.options.length > 0) {
            question.options[0].correct = true;
        }
    });
}

// ==================== تحديث CSS ====================
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .option.correct {
        background-color: #d4edda !important;
        border-color: #c3e6cb !important;
    }
    
    .option.incorrect {
        background-color: #f8d7da !important;
        border-color: #f5c6cb !important;
    }
    
    .option-check {
        display: none;
        font-size: 20px;
        font-weight: bold;
    }
    
    .option.selected .option-check {
        display: block;
    }
    
    .results-details {
        animation: slideIn 0.5s ease;
    }
    
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .banana-animation {
        position: fixed;
        font-size: 30px;
        z-index: 1000;
        animation: floatBanana 3s ease-in-out forwards;
    }
    
    @keyframes floatBanana {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(additionalStyles);
    
    // ==================== تحديث بيانات المستخدم ====================
    function updateUserData(newScore, bananasEarned) {
        try {
            // جلب بيانات المستخدم الحالية
            let currentUser = JSON.parse(localStorage.getItem('currentuser')) || {};
            
            // تحديث إحصائيات المستخدم
            currentUser.totalScore = (currentUser.totalScore || 0) + newScore;
            currentUser.totalForms = (currentUser.totalForms || 0) + 1;
            currentUser.bananas = (currentUser.bananas || 0) + bananasEarned;
            
            // حفظ النموذج المكتمل
            if (!currentUser.completedForms) {
                currentUser.completedForms = [];
            }
            
            currentUser.completedForms.push({
                formId: currentForm.id,
                formTitle: currentForm.title,
                score: newScore,
                totalScore: currentForm.totalPoints || 100,
                date: new Date().toISOString(),
                bananasEarned: bananasEarned
            });
            
            // حفظ البيانات المحدثة
            localStorage.setItem('currentuser', JSON.stringify(currentUser));
            
            console.log('User data updated:', currentUser);
            
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    }
    
    // ==================== تأثيرات الاحتفال ====================
    function celebrateCompletion(bananasCount) {
        console.log('Celebrating with', bananasCount, 'bananas!');
        
        // إضافة فواكة متساقطة
        for (let i = 0; i < Math.min(bananasCount, 30); i++) {
            setTimeout(() => {
                createFallingBanana();
            }, i * 100);
        }
        
        // تأثيرات صوتية (اختياري)
        playCelebrationSound();
    }
    
    function createFallingBanana() {
        const banana = document.createElement('div');
        banana.className = 'falling-banana';
        banana.textContent = '🍌';
        banana.style.cssText = `
            position: fixed;
            top: -50px;
            left: ${Math.random() * 100}vw;
            font-size: ${20 + Math.random() * 20}px;
            z-index: 2000;
            animation: fallBanana 3s linear forwards;
            pointer-events: none;
        `;
        document.body.appendChild(banana);
        
        setTimeout(() => {
            if (banana.parentNode) {
                banana.remove();
            }
        }, 3000);
    }
    
    function playCelebrationSound() {
        try {
            // يمكن إضافة صوت احتفال هنا
            // const audio = new Audio('sound/celebration.mp3');
            // audio.volume = 0.3;
            // audio.play();
        } catch (e) {
            console.log('Audio not supported or file not found');
        }
    }
    
    // ==================== عرض رسالة خطأ ====================
    function showError(message, error = null) {
        console.error('Error:', message, error);
        
        elements.questionsContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon"></div>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                ${error ? `<small>${error.message}</small>` : ''}
                <button onclick="window.location.href='index.html'" class="home-btn">
                    <i class="fas fa-home"></i> Back to Home
                </button>
            </div>
        `;
    }
    
    // ==================== Event Listeners ====================
    
    // زر السابق
    elements.prevBtn.addEventListener('click', goToPrevQuestion);
    
    // زر التالي
    elements.nextBtn.addEventListener('click', goToNextQuestion);
    
    // زر التقديم
    elements.submitBtn.addEventListener('click', submitForm);
    
    // زر مراجعة الإجابات
    elements.reviewBtn.addEventListener('click', function() {
        elements.resultsModal.style.display = 'none';
        currentQuestionIndex = 0;
        displayQuestion(0);
    });
    
    // زر العودة للرئيسية
    elements.homeBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // ==================== تهيئة الصفحة ====================
    
    // إضافة CSS للرسوم المتحركة إذا لم تكن موجودة
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        @keyframes fallBanana {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .error-state {
            text-align: center;
            padding: 50px 20px;
            background: #f9f9f9;
            border-radius: 15px;
            margin: 20px 0;
        }
        
        .error-icon {
            font-size: 60px;
            margin-bottom: 20px;
        }
        
        .error-state h3 {
            color: #6e3c14;
            margin-bottom: 15px;
        }
        
        .error-state p {
            color: #666;
            margin-bottom: 20px;
        }
        
        .error-state small {
            color: #999;
            display: block;
            margin: 10px 0;
            font-family: monospace;
        }
        
        .home-btn {
            background: #6e3c14;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-family: 'Itim', cursive;
            font-size: 18px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin-top: 20px;
            transition: all 0.3s ease;
        }
        
        .home-btn:hover {
            background: #8B4513;
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(animationStyles);
    
    // بدء تحميل النموذج
    loadForm();
});