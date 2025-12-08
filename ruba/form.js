// form.js
document.addEventListener('DOMContentLoaded', function() {
    // العناصر الأساسية
    const options = document.querySelectorAll(".option");
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");
    const hintBtn = document.getElementById("hintBtn");
    const soundBtn = document.getElementById("soundBtn");
    const continueBtn = document.getElementById("continueBtn");
    const progressText = document.getElementById("progress-text");
    const progressFill = document.querySelector(".progress-fill");
    const progressCurrent = document.querySelector(".progress-current");
    const currentQuestion = document.getElementById("current-question");
    const bananaCount = document.getElementById("banana-count");
    const timerElement = document.getElementById("timer");
    const monkeySpeech = document.getElementById("monkey-speech");
    const celebrationModal = document.getElementById("celebration-modal");
    const feedbackMessage = document.getElementById("feedback-message");

    // حالة النموذج
    let state = {
        currentQuestionIndex: 1,
        totalQuestions: 10,
        selectedOption: null,
        isAnswered: false,
        score: 0,
        bananas: 0,
        timeLeft: 30,
        timerInterval: null,
        soundEnabled: true
    };

    // قائمة الأسئلة (مثال)
    const questions = [
        {
            id: 1,
            question: "What is a computer?",
            options: [
                { text: "A machine that stores and processes information", correct: true, hint: "Correct Answer" },
                { text: "A type of fruit", correct: false, hint: "That's a banana!" },
                { text: "A toy used for fun", correct: false, hint: "Computers can be fun, but they're more than toys" },
                { text: "A musical instrument", correct: false, hint: "You can make music with computers, but they're not instruments" }
            ],
            difficulty: "Easy",
            icon: "fas fa-desktop"
        },
        {
            id: 2,
            question: "What does CPU stand for?",
            options: [
                { text: "Central Processing Unit", correct: true, hint: "That's right!" },
                { text: "Computer Personal Unit", correct: false, hint: "Close, but not quite" },
                { text: "Central Power Unit", correct: false, hint: "Think about what processes information" },
                { text: "Control Processing Unit", correct: false, hint: "Starts with Central..." }
            ],
            difficulty: "Medium",
            icon: "fas fa-microchip"
        }
        
    ];

    // تهيئة النموذج
    function initializeForm() {
        updateProgress();
        startTimer();
        loadQuestion(state.currentQuestionIndex);
        updateBananaCount();
        
        // تحديث الرسالة حسب الوقت
        updateMonkeyMessage("Pick the best answer! You can do it! 🐵");
    }

    // تحميل السؤال
    function loadQuestion(questionIndex) {
        const question = questions[questionIndex - 1];
        if (!question) return;

        // تحديث نص السؤال
        document.getElementById("question-text").textContent = question.question;
        
        // تحديث رقم السؤال
        currentQuestion.textContent = questionIndex;
        
        // تحديث الأيقونة
        const iconElement = document.querySelector(".question-icon i");
        if (iconElement) {
            iconElement.className = question.icon;
        }
        
        // تحديث الصعوبة
        document.querySelector(".difficulty-tag").textContent = question.difficulty;
        
        // تحديث الخيارات
        updateOptions(question.options);
        
        // إعادة تعيط الحالة
        state.selectedOption = null;
        state.isAnswered = false;
        nextBtn.disabled = true;
        backBtn.disabled = questionIndex === 1;
        
        // إخفاء التغذية الراجعة
        feedbackMessage.style.display = 'none';
        
        // إعادة تعيط الخيارات
        options.forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
    }

    // تحديث الخيارات
    function updateOptions(optionsData) {
        options.forEach((option, index) => {
            if (optionsData[index]) {
                const optionText = option.querySelector('.option-text');
                const optionHint = option.querySelector('.option-hint span');
                const optionIcon = option.querySelector('.option-hint i');
                
                if (optionText) optionText.textContent = optionsData[index].text;
                if (optionHint) optionHint.textContent = optionsData[index].hint;
                if (optionIcon) {
                    optionIcon.className = optionsData[index].correct ? "fas fa-check" : "fas fa-times";
                }
                
                // تعيين سمة البيانات للصحة
                option.dataset.correct = optionsData[index].correct;
            }
        });
    }

    // حدث النقر على الخيارات
    options.forEach(option => {
        option.addEventListener("click", () => {
            if (state.isAnswered) return;
            
            // إزالة التحديد السابق
            options.forEach(o => o.classList.remove("selected"));
            
            // تحديد الخيار الحالي
            option.classList.add("selected");
            state.selectedOption = option;
            
            // تمكين زر التالي
            nextBtn.disabled = false;
            state.isAnswered = true;
            
            // التحقق من الإجابة
            const isCorrect = option.dataset.correct === "true";
            
            // إظهار التغذية الراجعة
            showFeedback(isCorrect);
            
            // تحديث رسالة القرد
            updateMonkeyMessage(isCorrect ? 
                "Excellent choice! 🎉 You're learning fast!" : 
                "Good try! Let's learn why this is the right answer!"
            );
            
            // تشغيل الصوت
            if (state.soundEnabled) {
                playSound(isCorrect ? 'correct' : 'incorrect');
            }
        });
    });

    // إظهار التغذية الراجعة
    function showFeedback(isCorrect) {
        const feedbackContent = feedbackMessage.querySelector('.feedback-content');
        const icon = feedbackContent.querySelector('i');
        const text = feedbackContent.querySelector('p');
        
        if (isCorrect) {
            feedbackMessage.style.background = '#e8f5e9';
            feedbackMessage.style.borderLeftColor = '#4caf50';
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#4caf50';
            text.textContent = 'Great choice! Computers are indeed machines that store and process information.';
            text.style.color = '#2e7d32';
            
            // كسب موزة
            earnBanana();
        } else {
            feedbackMessage.style.background = '#ffebee';
            feedbackMessage.style.borderLeftColor = '#f44336';
            icon.className = 'fas fa-times-circle';
            icon.style.color = '#f44336';
            text.textContent = 'Almost! Computers are electronic devices that process information. Try again!';
            text.style.color = '#c62828';
        }
        
        feedbackMessage.style.display = 'block';
    }

    // زر التالي
    nextBtn.addEventListener("click", () => {
        // إذا كان هناك خيار محدد
        if (state.selectedOption) {
            const isCorrect = state.selectedOption.dataset.correct === "true";
            
            // إذا كانت الإجابة صحيحة، عرض الاحتفال
            if (isCorrect && !state.isAnswered) {
                showCelebration();
                state.isAnswered = true;
                return;
            }
        }
        
        // الانتقال للسؤال التالي
        if (state.currentQuestionIndex < state.totalQuestions) {
            state.currentQuestionIndex++;
            loadQuestion(state.currentQuestionIndex);
            updateProgress();
            resetTimer();
        } else {
            // إذا انتهت الأسئلة
            showCompletionModal();
        }
    });

    // زر السابق
    backBtn.addEventListener("click", () => {
        if (state.currentQuestionIndex > 1) {
            state.currentQuestionIndex--;
            loadQuestion(state.currentQuestionIndex);
            updateProgress();
            resetTimer();
        }
    });

    // زر المساعدة
    hintBtn.addEventListener("click", () => {
        if (state.soundEnabled) playSound('hint');
        showHint();
    });

    // تبديل الصوت
    soundBtn.addEventListener("click", () => {
        state.soundEnabled = !state.soundEnabled;
        soundBtn.classList.toggle('active', state.soundEnabled);
        soundBtn.innerHTML = state.soundEnabled ? 
            '<i class="fas fa-volume-up"></i> Sound On' : 
            '<i class="fas fa-volume-mute"></i> Sound Off';
        
        if (state.soundEnabled) playSound('click');
    });

    // تحديث التقدم
    function updateProgress() {
        const progress = (state.currentQuestionIndex / state.totalQuestions) * 100;
        const progressPercent = Math.round(progress);
        
        // تحديث النص
        progressText.textContent = `${progressPercent}%`;
        
        // تحديث الدائرة
        const circumference = 2 * Math.PI * 36; // 2πr
        const offset = circumference - (progressPercent / 100) * circumference;
        progressFill.style.strokeDashoffset = offset;
        
        // تحديث شريط التقدم
        progressCurrent.style.width = `${progressPercent}%`;
    }

    // عد تنازلي
    function startTimer() {
        clearInterval(state.timerInterval);
        state.timeLeft = 30;
        updateTimerDisplay();
        
        state.timerInterval = setInterval(() => {
            state.timeLeft--;
            updateTimerDisplay();
            
            if (state.timeLeft <= 0) {
                clearInterval(state.timerInterval);
                timeUp();
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(state.timerInterval);
        startTimer();
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(state.timeLeft / 60);
        const seconds = state.timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // تغيير اللون عند انخفاض الوقت
        if (state.timeLeft <= 10) {
            timerElement.style.color = '#ff4444';
            timerElement.style.animation = 'pulse 1s infinite';
        } else {
            timerElement.style.color = '';
            timerElement.style.animation = '';
        }
    }

    function timeUp() {
        if (state.soundEnabled) playSound('timeup');
        updateMonkeyMessage("Time's up! Let's check the answer together! ⏰");
        
        // إظهار الإجابة الصحيحة
        options.forEach(option => {
            if (option.dataset.correct === "true") {
                option.classList.add('correct');
            }
        });
        
        // إظهار التغذية الراجعة
        showFeedback(false);
    }

    // كسب الموز
    function earnBanana() {
        state.bananas++;
        updateBananaCount();
        
        // تأثير بصري
        createBananaAnimation();
        
        // تحديث رسالة القرد
        updateMonkeyMessage("You earned a banana! 🍌 Great job!");
    }

    function updateBananaCount() {
        bananaCount.textContent = state.bananas;
        
        // تأثير عند التحديث
        bananaCount.style.transform = 'scale(1.5)';
        setTimeout(() => {
            bananaCount.style.transform = 'scale(1)';
        }, 300);
    }

    function createBananaAnimation() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const banana = document.createElement('div');
                banana.textContent = '🍌';
                banana.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    font-size: 24px;
                    z-index: 1000;
                    pointer-events: none;
                    animation: bananaFly 1s ease-out forwards;
                    --target-x: ${Math.random() * 100 - 50}px;
                    --target-y: ${Math.random() * 100 - 50}px;
                `;
                
                document.body.appendChild(banana);
                
                setTimeout(() => banana.remove(), 1000);
            }, i * 100);
        }
        
        // إضافة CSS للأنيميشن
        if (!document.querySelector('#banana-animation')) {
            const style = document.createElement('style');
            style.id = 'banana-animation';
            style.textContent = `
                @keyframes bananaFly {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--target-x), var(--target-y)) scale(0);
                        opacity: 0;
                    }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // تحديث رسالة القرد
    function updateMonkeyMessage(message) {
        monkeySpeech.textContent = message;
        
        // تأثير الظهور
        monkeySpeech.style.animation = 'none';
        setTimeout(() => {
            monkeySpeech.style.animation = 'speechFloat 3s ease-in-out infinite';
        }, 10);
    }

    // إظهار تلميح
    function showHint() {
        // إظهار تلميح لجميع الخيارات
        options.forEach(option => {
            const hint = option.querySelector('.option-hint');
            if (hint) {
                hint.style.opacity = '0.5';
            }
        });
        
        // إظهار رسالة
        updateMonkeyMessage("Look at the hints below each option for clues! 🧐");
    }

    // إظهار الاحتفال
    function showCelebration() {
        celebrationModal.style.display = 'flex';
        
        if (state.soundEnabled) playSound('celebration');
    }

    // إظهار نهاية النموذج
    function showCompletionModal() {
        const modal = celebrationModal;
        const content = modal.querySelector('.celebration-body');
        
        content.innerHTML = `
            <h2>🎊 Course Completed! 🎊</h2>
            <p>You've finished the Computer Basics course!</p>
            <div class="reward-earned">
                <div class="reward-icon">🏆</div>
                <div class="reward-info">
                    <h3>Course Certificate Unlocked!</h3>
                    <p>Score: ${state.score}/${state.totalQuestions}</p>
                    <p>Bananas Earned: ${state.bananas}</p>
                </div>
            </div>
            <button id="restartBtn" class="continue-btn">
                <i class="fas fa-redo"></i> Try Again
            </button>
            <button id="homeBtn" class="continue-btn" style="margin-top: 10px; background: var(--accent-green);">
                <i class="fas fa-home"></i> Back to Home
            </button>
        `;
        
        modal.style.display = 'flex';
        
        // إضافة الأحداث للأزرار الجديدة
        setTimeout(() => {
            document.getElementById('restartBtn').addEventListener('click', restartForm);
            document.getElementById('homeBtn').addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }, 100);
    }

    // إعادة تشغيل النموذج
    function restartForm() {
        state.currentQuestionIndex = 1;
        state.selectedOption = null;
        state.isAnswered = false;
        state.score = 0;
        state.bananas = 0;
        
        celebrationModal.style.display = 'none';
        initializeForm();
        updateBananaCount();
    }

    // تشغيل الأصوات
    function playSound(type) {
        // في تطبيق حقيقي، ستستخدم ملفات صوتية
        console.log(`Playing ${type} sound`);
        
        // محاكاة الأصوات باستخدام Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            let frequency = 800;
            let duration = 0.1;
            
            switch(type) {
                case 'correct':
                    frequency = 1000;
                    break;
                case 'incorrect':
                    frequency = 400;
                    break;
                case 'click':
                    frequency = 600;
                    break;
                case 'celebration':
                    // صوت احتفالي
                    playCelebrationSound();
                    return;
                case 'timeup':
                    frequency = 300;
                    duration = 0.5;
                    break;
                case 'hint':
                    frequency = 700;
                    break;
            }
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.log('Audio not supported:', e);
        }
    }

    function playCelebrationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // تشغيل عدة نغمات للاحتفال
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = freq;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                }, index * 100);
            });
        } catch (e) {
            console.log('Celebration audio not supported');
        }
    }

    // زر الاستمرار في الاحتفال
    continueBtn.addEventListener('click', () => {
        celebrationModal.style.display = 'none';
        
        // الانتقال للسؤال التالي
        if (state.currentQuestionIndex < state.totalQuestions) {
            state.currentQuestionIndex++;
            loadQuestion(state.currentQuestionIndex);
            updateProgress();
            resetTimer();
        } else {
            showCompletionModal();
        }
    });

    // زر الرجوع للصفحة الرئيسية
    document.querySelector('.logo').addEventListener('click', () => {
        if (confirm('Return to home page? Your progress will be saved.')) {
            window.location.href = 'index.html';
        }
    });

    // تهيئة النموذج
    initializeForm();
    
    // حفظ التقدم في localStorage
    function saveProgress() {
        const progress = {
            currentQuestion: state.currentQuestionIndex,
            bananas: state.bananas,
            score: state.score,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('monkeyITKids_form_progress', JSON.stringify(progress));
    }

    // تحميل التقدم من localStorage
    function loadProgress() {
        const saved = localStorage.getItem('monkeyITKids_form_progress');
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                state.currentQuestionIndex = progress.currentQuestion || 1;
                state.bananas = progress.bananas || 0;
                state.score = progress.score || 0;
            } catch (e) {
                console.log('Error loading progress:', e);
            }
        }
    }

    // تحميل التقدم عند البدء
    loadProgress();

    // حفظ التقدم عند الخروج
    window.addEventListener('beforeunload', saveProgress);
    window.addEventListener('pagehide', saveProgress);

    console.log("Form initialized successfully! 🐵");
});