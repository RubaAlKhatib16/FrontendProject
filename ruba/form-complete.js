// Complete Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Toastr
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    // State Management
    let state = {
        started: false,
        submitted: false,
        timeRemaining: 15 * 60, // 15 minutes in seconds
        timerInterval: null,
        answers: {
            q1: null,
            q2: null,
            q3: null,
            q4: null,
            q5: null
        },
        correctAnswers: {
            q1: 'A',
            q2: 'B',
            q3: 'A',
            q4: 'B',
            q5: 'B'
        },
        scores: {
            q1: 2,
            q2: 2,
            q3: 2,
            q4: 2,
            q5: 2
        },
        totalQuestions: 5,
        totalPoints: 10
    };

    // DOM Elements
    const elements = {
        startFormBtn: document.getElementById('start-form-btn'),
        completeForm: document.getElementById('complete-form'),
        instructionsSection: document.querySelector('.instructions-section'),
        checkAnswersBtn: document.getElementById('check-answers-btn'),
        submitFormBtn: document.getElementById('submit-form-btn'),
        reviewAnswersBtn: document.getElementById('review-answers-btn'),
        resultsSection: document.getElementById('results-section'),
        viewAnswersBtn: document.getElementById('view-answers-btn'),
        nextFormBtn: document.getElementById('next-form-btn'),
        backCourseBtn: document.getElementById('back-course-btn'),
        saveBtn: document.getElementById('save-btn'),
        exitBtn: document.getElementById('exit-btn'),
        
        // Progress Elements
        progressFill: document.getElementById('progress-fill'),
        formProgress: document.getElementById('form-progress'),
        
        // Summary Elements
        answeredCount: document.getElementById('answered-count'),
        correctCount: document.getElementById('correct-count'),
        pointsEarned: document.getElementById('points-earned'),
        scorePercent: document.getElementById('score-percent'),
        
        // Results Elements
        finalScore: document.getElementById('final-score'),
        finalCorrect: document.getElementById('final-correct'),
        finalPoints: document.getElementById('final-points'),
        finalTime: document.getElementById('final-time'),
        finalBananas: document.getElementById('final-bananas'),
        resultsMessage: document.getElementById('results-message'),
        
        // Timer Elements
        floatingTimer: document.getElementById('floating-timer'),
        timerDisplay: document.getElementById('timer-display'),
        floatingBonus: document.getElementById('floating-bonus'),
        timeBonus: document.getElementById('time-bonus'),
        
        // Monkey Helper
        monkeyHelper: document.getElementById('monkey-helper'),
        monkeyMessage: document.getElementById('monkey-message'),
        
        // Radio Inputs
        radioInputs: document.querySelectorAll('input[type="radio"]')
    };

    // Initialize
    function init() {
        loadSavedProgress();
        setupEventListeners();
        updateProgress();
        updateMonkeyMessage('Ready to learn about computers? Click Start Form to begin! 🐵');
    }

    // Event Listeners
    function setupEventListeners() {
        // Start Form Button
        elements.startFormBtn.addEventListener('click', startForm);
        
        // Radio Input Changes
        elements.radioInputs.forEach(input => {
            input.addEventListener('change', handleAnswerChange);
        });
        
        // Hint Buttons
        document.querySelectorAll('.btn-hint').forEach(btn => {
            btn.addEventListener('click', toggleHint);
        });
        
        // Check Answers Button
        elements.checkAnswersBtn.addEventListener('click', checkAnswers);
        
        // Submit Form Button
        elements.submitFormBtn.addEventListener('click', submitForm);
        
        // Review Answers Button
        elements.reviewAnswersBtn.addEventListener('click', reviewAnswers);
        
        // View Answers Button
        elements.viewAnswersBtn.addEventListener('click', viewAnswers);
        
        // Next Form Button
        elements.nextFormBtn.addEventListener('click', nextForm);
        
        // Back to Course Button
        elements.backCourseBtn.addEventListener('click', backToCourse);
        
        // Save Button
        elements.saveBtn.addEventListener('click', saveProgress);
        
        // Exit Button
        elements.exitBtn.addEventListener('click', exitForm);
        
        // Window Before Unload
        window.addEventListener('beforeunload', handleBeforeUnload);
    }

    // Start Form
    function startForm() {
        state.started = true;
        
        // Show form, hide instructions
        elements.instructionsSection.style.display = 'none';
        elements.completeForm.style.display = 'block';
        
        // Show floating timer and bonus
        elements.floatingTimer.style.display = 'block';
        elements.floatingBonus.style.display = 'block';
        
        // Start timer
        startTimer();
        
        // Update monkey message
        updateMonkeyMessage('Great! Answer all 5 questions. Remember to use hints if you need help! 🐵');
        
        // Show success message
        toastr.success('Form started! You have 15 minutes to complete it.');
    }

    // Handle Answer Change
    function handleAnswerChange(e) {
        const questionNumber = e.target.name;
        const answerValue = e.target.value;
        
        // Save answer
        state.answers[questionNumber] = answerValue;
        
        // Update question status
        updateQuestionStatus(questionNumber, answerValue);
        
        // Update progress
        updateProgress();
        
        // Save progress automatically
        saveProgress();
    }

    // Update Question Status
    function updateQuestionStatus(questionId, answer) {
        const statusElement = document.getElementById(`status-${questionId.slice(1)}`);
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="status-content">
                    <i class="fas fa-check-circle"></i>
                    <span>Answered: Option ${answer}</span>
                </div>
            `;
            statusElement.style.borderLeftColor = '#4CAF50';
        }
    }

    // Update Progress
    function updateProgress() {
        const answeredCount = Object.values(state.answers).filter(answer => answer !== null).length;
        const progressPercent = (answeredCount / state.totalQuestions) * 100;
        
        // Update progress bar
        elements.progressFill.style.width = `${progressPercent}%`;
        elements.formProgress.textContent = `${Math.round(progressPercent)}%`;
        
        // Update summary
        elements.answeredCount.textContent = `${answeredCount}/${state.totalQuestions}`;
        
        // Enable/disable buttons
        elements.submitFormBtn.disabled = answeredCount < state.totalQuestions;
        
        // Update monkey message based on progress
        if (answeredCount === 0) {
            updateMonkeyMessage('Start answering questions! The first one is easy! 🐵');
        } else if (answeredCount === state.totalQuestions) {
            updateMonkeyMessage('All questions answered! Ready to submit? 🎉');
        } else if (answeredCount >= state.totalQuestions / 2) {
            updateMonkeyMessage(`You're halfway there! ${state.totalQuestions - answeredCount} questions to go! 💪`);
        }
    }

    // Start Timer
    function startTimer() {
        clearInterval(state.timerInterval);
        
        state.timerInterval = setInterval(() => {
            if (state.timeRemaining <= 0) {
                clearInterval(state.timerInterval);
                timeUp();
                return;
            }
            
            state.timeRemaining--;
            updateTimerDisplay();
            
            // Update time bonus
            updateTimeBonus();
        }, 1000);
    }

    // Update Timer Display
    function updateTimerDisplay() {
        const minutes = Math.floor(state.timeRemaining / 60);
        const seconds = state.timeRemaining % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        elements.timerDisplay.textContent = timeString;
        
        // Add warning class if less than 5 minutes
        if (state.timeRemaining < 5 * 60) {
            elements.floatingTimer.style.borderColor = '#ff9800';
            elements.timerDisplay.style.color = '#ff9800';
        }
        
        // Add danger class if less than 1 minute
        if (state.timeRemaining < 60) {
            elements.floatingTimer.style.borderColor = '#f44336';
            elements.timerDisplay.style.color = '#f44336';
            elements.floatingTimer.style.animation = 'pulse 1s infinite';
        }
    }

    // Update Time Bonus
    function updateTimeBonus() {
        let bonusPoints = 0;
        
        if (state.timeRemaining > 10 * 60) { // More than 10 minutes
            bonusPoints = 3;
        } else if (state.timeRemaining > 5 * 60) { // More than 5 minutes
            bonusPoints = 2;
        } else if (state.timeRemaining > 0) { // More than 0 minutes
            bonusPoints = 1;
        }
        
        elements.timeBonus.textContent = `+${bonusPoints} points`;
    }

    // Time Up
    function timeUp() {
        toastr.warning('Time\'s up! Form will be submitted automatically.');
        submitForm();
    }

    // Toggle Hint
    function toggleHint(e) {
        const hintNumber = e.target.dataset.hint || e.target.closest('.btn-hint').dataset.hint;
        const hintContent = document.getElementById(`hint-${hintNumber}`);
        
        if (hintContent) {
            const isVisible = hintContent.style.display === 'block';
            hintContent.style.display = isVisible ? 'none' : 'block';
            
            // Update button text
            const button = e.target.closest('.btn-hint');
            if (button) {
                const icon = button.querySelector('i');
                if (isVisible) {
                    icon.className = 'fas fa-lightbulb';
                    button.innerHTML = '<i class="fas fa-lightbulb"></i> Need a hint?';
                } else {
                    icon.className = 'fas fa-lightbulb';
                    button.innerHTML = '<i class="fas fa-lightbulb"></i> Hide hint';
                }
            }
        }
    }

    // Check Answers
    function checkAnswers() {
        let correctCount = 0;
        let earnedPoints = 0;
        
        // Calculate scores
        for (const [questionId, userAnswer] of Object.entries(state.answers)) {
            if (userAnswer === state.correctAnswers[questionId]) {
                correctCount++;
                earnedPoints += state.scores[questionId];
            }
        }
        
        const scorePercent = (correctCount / state.totalQuestions) * 100;
        
        // Update summary
        elements.correctCount.textContent = correctCount;
        elements.pointsEarned.textContent = `${earnedPoints}/${state.totalPoints}`;
        elements.scorePercent.textContent = `${Math.round(scorePercent)}%`;
        
        // Show feedback for each question
        showQuestionFeedback();
        
        // Enable submit button
        elements.submitFormBtn.disabled = false;
        
        // Show review button
        elements.reviewAnswersBtn.style.display = 'block';
        
        // Update monkey message
        updateMonkeyMessage(`You got ${correctCount} out of ${state.totalQuestions} correct! Ready to submit? 🐵`);
        
        toastr.info(`You have ${correctCount} correct answers out of ${state.totalQuestions}.`);
    }

    // Show Question Feedback
    function showQuestionFeedback() {
        document.querySelectorAll('.option-item').forEach(item => {
            const input = item.querySelector('input[type="radio"]');
            const feedback = item.querySelector('.option-feedback');
            
            if (input && feedback) {
                // Show feedback for selected options
                if (input.checked) {
                    feedback.style.display = 'block';
                    
                    // Highlight correct/incorrect
                    if (input.dataset.correct === 'true') {
                        item.style.borderColor = '#4CAF50';
                        item.style.background = 'rgba(76, 175, 80, 0.05)';
                    } else {
                        item.style.borderColor = '#f44336';
                        item.style.background = 'rgba(244, 67, 54, 0.05)';
                    }
                }
                
                // Highlight correct answer
                if (input.dataset.correct === 'true') {
                    item.style.borderColor = '#4CAF50';
                    item.style.background = 'rgba(76, 175, 80, 0.05)';
                    feedback.style.display = 'block';
                }
            }
        });
    }

    // Submit Form
    function submitForm() {
        if (state.submitted) return;
        
        state.submitted = true;
        clearInterval(state.timerInterval);
        
        // Calculate final results
        let correctCount = 0;
        let earnedPoints = 0;
        
        for (const [questionId, userAnswer] of Object.entries(state.answers)) {
            if (userAnswer === state.correctAnswers[questionId]) {
                correctCount++;
                earnedPoints += state.scores[questionId];
            }
        }
        
        // Calculate time bonus
        let timeBonus = 0;
        if (state.timeRemaining > 10 * 60) {
            timeBonus = 3;
        } else if (state.timeRemaining > 5 * 60) {
            timeBonus = 2;
        } else if (state.timeRemaining > 0) {
            timeBonus = 1;
        }
        
        // Calculate bananas (1 banana per correct answer)
        const bananasEarned = correctCount;
        
        // Calculate final score percentage
        const totalPointsWithBonus = earnedPoints + timeBonus;
        const maxPossiblePoints = state.totalPoints + 3; // Max time bonus is 3
        const scorePercent = Math.round((totalPointsWithBonus / maxPossiblePoints) * 100);
        
        // Update results display
        elements.finalScore.textContent = `${scorePercent}%`;
        elements.finalCorrect.textContent = correctCount;
        elements.finalPoints.textContent = totalPointsWithBonus;
        elements.finalBananas.textContent = bananasEarned;
        
        // Format time taken
        const totalTime = 15 * 60 - state.timeRemaining;
        const minutesTaken = Math.floor(totalTime / 60);
        const secondsTaken = totalTime % 60;
        elements.finalTime.textContent = `${minutesTaken}:${secondsTaken.toString().padStart(2, '0')}`;
        
        // Update results message based on score
        updateResultsMessage(scorePercent, correctCount);
        
        // Hide form, show results
        elements.completeForm.style.display = 'none';
        elements.resultsSection.style.display = 'block';
        
        // Hide floating elements
        elements.floatingTimer.style.display = 'none';
        elements.floatingBonus.style.display = 'none';
        
        // Update monkey message
        updateMonkeyMessage(`Congratulations! You earned ${bananasEarned} bananas! 🍌🎉`);
        
        // Save final results
        saveFinalResults(scorePercent, correctCount, totalPointsWithBonus, bananasEarned);
        
        // Show celebration
        showCelebration(correctCount);
    }

    // Update Results Message
    function updateResultsMessage(scorePercent, correctCount) {
        let message = '';
        
        if (scorePercent >= 90) {
            message = 'Outstanding! You\'re a computer expert! Perfect score! 🌟';
        } else if (scorePercent >= 80) {
            message = 'Excellent work! You know a lot about computers! Keep it up! 🎉';
        } else if (scorePercent >= 70) {
            message = 'Great job! You\'re learning well! A few more tries and you\'ll be perfect! 💪';
        } else if (scorePercent >= 60) {
            message = 'Good effort! You\'re getting the hang of computers! Review the answers to learn more! 📚';
        } else {
            message = 'Good start! Computers can be tricky at first. Try again to improve your score! 🐵';
        }
        
        elements.resultsMessage.innerHTML = `
            <div class="message-content">
                <i class="fas fa-comment-dots"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // Show Celebration
    function showCelebration(correctCount) {
        // Create confetti
        createConfetti();
        
        // Play success sound (if available)
        playSuccessSound();
        
        // Show success toast
        toastr.success(`Form submitted successfully! You got ${correctCount} correct answers.`);
        
        // Animate score display
        animateScoreDisplay();
    }

    // Create Confetti
    function createConfetti() {
        const colors = ['#FFC727', '#7CAF53', '#2196F3', '#FF9800', '#E91E63'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    top: -20px;
                    left: ${Math.random() * 100}%;
                    z-index: 9999;
                    pointer-events: none;
                    animation: confettiFall ${1 + Math.random()}s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                // Remove after animation
                setTimeout(() => confetti.remove(), 2000);
            }, i * 50);
        }
        
        // Add confetti animation to styles
        if (!document.querySelector('#confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Play Success Sound
    function playSuccessSound() {
        // Try to play a success sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Play a happy tune
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    
                    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    
                    osc.start(audioContext.currentTime);
                    osc.stop(audioContext.currentTime + 0.2);
                }, index * 100);
            });
        } catch (error) {
            console.log('Audio not supported or user blocked audio');
        }
    }

    // Animate Score Display
    function animateScoreDisplay() {
        const scoreCircle = document.querySelector('.score-circle');
        if (scoreCircle) {
            scoreCircle.style.animation = 'pulse 1s ease 3';
        }
    }

    // Review Answers
    function reviewAnswers() {
        // Hide results, show form
        elements.resultsSection.style.display = 'none';
        elements.completeForm.style.display = 'block';
        
        // Show feedback
        showQuestionFeedback();
        
        // Update monkey message
        updateMonkeyMessage('Take your time reviewing the answers. Learn from any mistakes! 📚');
    }

    // View Answers
    function viewAnswers() {
        // Scroll to first question
        document.querySelector('.question-card').scrollIntoView({ behavior: 'smooth' });
        
        // Call review answers
        reviewAnswers();
    }

    // Next Form
    function nextForm() {
        if (confirm('Move to the next form? Your progress has been saved.')) {
            // In a real app, this would navigate to the next form
            window.location.href = 'form-complete.html?course=computer-basics&form=2';
        }
    }

    // Back to Course
    function backToCourse() {
        if (confirm('Return to course page? Your progress has been saved.')) {
            window.location.href = 'course-details.html?course=computer-basics';
        }
    }

    // Save Progress
    function saveProgress() {
        try {
            const progress = {
                answers: state.answers,
                timeRemaining: state.timeRemaining,
                started: state.started,
                submitted: state.submitted,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem('form1_progress', JSON.stringify(progress));
            
            // Show save feedback
            const saveIcon = elements.saveBtn.querySelector('i');
            const originalClass = saveIcon.className;
            
            saveIcon.className = 'fas fa-check';
            elements.saveBtn.style.background = 'rgba(76, 175, 80, 0.1)';
            elements.saveBtn.style.color = '#4CAF50';
            elements.saveBtn.style.borderColor = 'rgba(76, 175, 80, 0.3)';
            
            setTimeout(() => {
                saveIcon.className = originalClass;
                elements.saveBtn.style.background = '';
                elements.saveBtn.style.color = '';
                elements.saveBtn.style.borderColor = '';
            }, 1000);
            
            console.log('Progress saved');
        } catch (error) {
            console.error('Error saving progress:', error);
            toastr.error('Failed to save progress');
        }
    }

    // Save Final Results
    function saveFinalResults(score, correct, points, bananas) {
        try {
            const finalResults = {
                score: score,
                correctAnswers: correct,
                points: points,
                bananas: bananas,
                completed: true,
                completedAt: new Date().toISOString()
            };
            
            localStorage.setItem('form1_results', JSON.stringify(finalResults));
            
            // Also update course progress
            updateCourseProgress();
        } catch (error) {
            console.error('Error saving final results:', error);
        }
    }

    // Update Course Progress
    function updateCourseProgress() {
        try {
            const courseProgress = JSON.parse(localStorage.getItem('course_progress')) || {};
            
            if (!courseProgress['computer-basics']) {
                courseProgress['computer-basics'] = {};
            }
            
            courseProgress['computer-basics'].form1 = {
                completed: true,
                score: state.submitted ? calculateScore() : 0,
                completedAt: new Date().toISOString()
            };
            
            localStorage.setItem('course_progress', JSON.stringify(courseProgress));
        } catch (error) {
            console.error('Error updating course progress:', error);
        }
    }

    // Calculate Score
    function calculateScore() {
        let correctCount = 0;
        for (const [questionId, userAnswer] of Object.entries(state.answers)) {
            if (userAnswer === state.correctAnswers[questionId]) {
                correctCount++;
            }
        }
        return Math.round((correctCount / state.totalQuestions) * 100);
    }

    // Load Saved Progress
    function loadSavedProgress() {
        try {
            const savedProgress = localStorage.getItem('form1_progress');
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                
                // Restore answers
                if (progress.answers) {
                    state.answers = progress.answers;
                    
                    // Check radio buttons
                    for (const [questionId, answer] of Object.entries(progress.answers)) {
                        const input = document.querySelector(`input[name="${questionId}"][value="${answer}"]`);
                        if (input) {
                            input.checked = true;
                            updateQuestionStatus(questionId, answer);
                        }
                    }
                }
                
                // Restore timer
                if (progress.timeRemaining) {
                    state.timeRemaining = progress.timeRemaining;
                }
                
                // Restore state
                state.started = progress.started || false;
                state.submitted = progress.submitted || false;
                
                // If form was started, show it
                if (state.started && !state.submitted) {
                    startForm();
                }
                
                // If form was submitted, show results
                if (state.submitted) {
                    const savedResults = localStorage.getItem('form1_results');
                    if (savedResults) {
                        const results = JSON.parse(savedResults);
                        showSubmittedResults(results);
                    }
                }
                
                console.log('Progress loaded');
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    // Show Submitted Results
    function showSubmittedResults(results) {
        // Update results display
        elements.finalScore.textContent = `${results.score}%`;
        elements.finalCorrect.textContent = results.correctAnswers;
        elements.finalPoints.textContent = results.points;
        elements.finalBananas.textContent = results.bananas;
        
        // Show results section
        elements.instructionsSection.style.display = 'none';
        elements.completeForm.style.display = 'none';
        elements.resultsSection.style.display = 'block';
        
        // Update monkey message
        updateMonkeyMessage(`Welcome back! You scored ${results.score}% on this form. 🎯`);
    }

    // Exit Form
    function exitForm() {
        if (confirm('Are you sure you want to exit? Your progress will be saved automatically.')) {
            saveProgress();
            window.location.href = 'course-details.html?course=computer-basics';
        }
    }

    // Handle Before Unload
    function handleBeforeUnload(e) {
        if (state.started && !state.submitted) {
            saveProgress();
            
            // Custom message for some browsers
            e.preventDefault();
            e.returnValue = 'Your progress will be saved. Are you sure you want to leave?';
        }
    }

    // Update Monkey Message
    function updateMonkeyMessage(message) {
        if (elements.monkeyMessage) {
            elements.monkeyMessage.innerHTML = `<p>${message}</p>`;
            
            // Add animation
            elements.monkeyMessage.style.animation = 'none';
            setTimeout(() => {
                elements.monkeyMessage.style.animation = 'speechFloat 3s ease-in-out infinite';
            }, 10);
        }
    }

    // Initialize the form
    init();
    
    console.log('Form Complete initialized successfully! 🐵');
});