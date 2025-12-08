// script.js
document.addEventListener('DOMContentLoaded', function() {
    const burgerBtn = document.getElementById('burgerBtn');
    const sidebar = document.getElementById('sidebar');

    
     function updateSidebarUserName() {
        const userNameElement = document.getElementById('sidebarUserName');
        if (!userNameElement) return;
        
        try {
            // جلب بيانات المستخدم من localStorage
            const currentUser = JSON.parse(localStorage.getItem("currentuser")) || {};
            
            // عرض اسم المستخدم أو الاسم الافتراضي
            if (currentUser.name) {
                userNameElement.textContent = `Hi, ${currentUser.name}!`;
            } else if (currentUser.username) {
                userNameElement.textContent = `Hi, ${currentUser.username}!`;
            } else {
                // إذا لم يكن هناك مستخدم مسجل، عرض "Child" كافتراضي
                userNameElement.textContent = "Hi, Child!";
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            userNameElement.textContent = "Hi, Child!";
        }
    }
    
    // استدعاء الدالة عند تحميل الصفحة
    updateSidebarUserName();
    
    // تحديث الاسم عند أي تغيير في localStorage (للتوافق مع صفحات أخرى)
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentuser') {
            updateSidebarUserName();
        }
    });
    // Toggle sidebar
    function toggleMenu() {
        const isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true';
        
        burgerBtn.classList.toggle('active');
        sidebar.classList.toggle('active');
        burgerBtn.setAttribute('aria-expanded', !isExpanded);
        sidebar.setAttribute('aria-hidden', isExpanded);
        
        // Prevent body scrolling when sidebar is open
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }
    
    // Close sidebar when clicking outside
    function closeMenuOnClickOutside(event) {
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(event.target) && 
            !burgerBtn.contains(event.target)) {
            closeMenu();
        }
    }
    
    // Close sidebar when pressing Escape key
    function closeMenuOnEscape(event) {
        if (event.key === 'Escape' && sidebar.classList.contains('active')) {
            closeMenu();
        }
    }
    
    function closeMenu() {
        burgerBtn.classList.remove('active');
        sidebar.classList.remove('active');
        burgerBtn.setAttribute('aria-expanded', 'false');
        sidebar.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    // Event listeners
    burgerBtn.addEventListener('click', toggleMenu);
    document.addEventListener('click', closeMenuOnClickOutside);
    document.addEventListener('keydown', closeMenuOnEscape);
    
    // Close sidebar when clicking on links
    sidebar.querySelectorAll('a, button').forEach(element => {
        element.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });
    
    
    // Profile click handler
    const profileImg = document.querySelector('.profile-img');
    if (profileImg) {
        profileImg.addEventListener('click', function() {
            // يمكن إضافة وظيفة القائمة المنسدلة للبروفايل هنا
            console.log('Profile clicked - add dropdown functionality');
        });
    }
    
    // Let's Go button click handler
    const kidsBtn = document.querySelector('.kids-btn');
    if (kidsBtn) {
        kidsBtn.addEventListener('click', function() {
           
            console.log('Let\'s Go button clicked');
            // window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        });
    }
});





class Typewriter {
    constructor(elementId, phrases, options = {}) {
        this.element = document.getElementById(elementId);
        this.phrases = phrases;
        this.currentPhrase = 0;
        this.currentChar = 0;
        this.isDeleting = false;
        this.isWaiting = false;
        
        // Options
        this.speed = options.speed || 100;
        this.deleteSpeed = options.deleteSpeed || 50;
        this.waitTime = options.waitTime || 2000;
        this.loop = options.loop !== false;
        
        this.init();
    }
    
    init() {
        this.type();
    }
    
    type() {
        const currentPhrase = this.phrases[this.currentPhrase];
        
        // Determine current text
        if (this.isDeleting) {
            this.currentChar--;
        } else {
            this.currentChar++;
        }
        
        // Update text
        this.element.textContent = currentPhrase.substring(0, this.currentChar);
        this.element.classList.remove('completed');
        
        // If phrase is complete
        if (!this.isDeleting && this.currentChar === currentPhrase.length) {
            this.isWaiting = true;
            this.element.classList.add('completed');
            
            setTimeout(() => {
                this.isWaiting = false;
                this.isDeleting = true;
                this.type();
            }, this.waitTime);
            return;
        }
        
        // If phrase is deleted
        if (this.isDeleting && this.currentChar === 0) {
            this.isDeleting = false;
            this.currentPhrase = (this.currentPhrase + 1) % this.phrases.length;
        }
        
        // Calculate speed
        let speed = this.speed;
        if (this.isDeleting) {
            speed = this.deleteSpeed;
        }
        if (this.isWaiting) {
            speed = this.waitTime;
        }
        
        // Continue typing
        setTimeout(() => this.type(), speed);
    }
    
    addPhrase(phrase) {
        this.phrases.push(phrase);
    }
    
    clearPhrases() {
        this.phrases = [];
    }
}

// Initialize typewriter when page loads
document.addEventListener('DOMContentLoaded', function() {
    const phrases = [
        "CATCH BANANAS.",
        "LEARN CODING.",
        "SOLVE Forms.",
        "JOIN FUN!",
        "BE CREATIVE!",
        "HAVE FUN!"
    ];
    
    const typewriter = new Typewriter('typewriter', phrases, {
        speed: 100,
        deleteSpeed: 50,
        waitTime: 1500,
        loop: true
    });
    
    // Optional: Add interactive phrase adding
    const kidsBtn = document.querySelector('.kids-btn');
    if (kidsBtn) {
        kidsBtn.addEventListener('click', function() {
            const newPhrases = [
                "GREAT JOB!",
                "YOU DID IT!",
                "AWESOME!",
                "KEEP GOING!",
                "SUPER STAR!",
                "GENIUS!"
            ];
            const randomPhrase = newPhrases[Math.floor(Math.random() * newPhrases.length)];
            typewriter.addPhrase(randomPhrase);
        });
    }
     
});


// إضافة تأثيرات تفاعلية للبطاقات
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach((card, index) => {
        // تأثير عند التمرير
        card.addEventListener('mouseenter', function() {
            const emoji = this.querySelector('.monkey-emoji');
            if (emoji) {
                emoji.style.animation = 'emojiBounce 0.5s ease 3';
                setTimeout(() => {
                    emoji.style.animation = 'emojiBounce 2s infinite';
                }, 1500);
            }
        });
        
        // تأثير عند النقر
        const learnBtn = card.querySelector('.learn-btn');
        if (learnBtn) {
            learnBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const monkey = card.querySelector('.monkey-emoji');
                if (monkey) {
                    monkey.style.transform = 'rotate(360deg) scale(1.5)';
                    monkey.style.transition = 'all 0.5s ease';
                    
                    setTimeout(() => {
                        monkey.style.transform = '';
                        monkey.style.transition = '';
                    }, 500);
                }
                
                // يمكن إضافة وظيفة الانتقال للصفحة المناسبة
                const cardTitle = card.querySelector('h3').textContent;
                console.log(`Clicked: ${cardTitle}`);
            });
        }
        
       
    });
    
    // زر CTA الرئيسي
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            this.style.animation = 'buttonPulse 0.5s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
            
            // تأثير المطر الموزي
            createBananaRain();
        });
    }
    
    // تأثير المطر الموزي
    function createBananaRain() {
        const container = document.querySelector('.kids-love-section');
        for (let i = 0; i < 15; i++) {
            const banana = document.createElement('div');
            banana.className = 'falling-banana';
            banana.textContent = '🍌';
            banana.style.left = Math.random() * 100 + 'vw';
            banana.style.fontSize = Math.random() * 20 + 20 + 'px';
            banana.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(banana);
            
            setTimeout(() => {
                banana.remove();
            }, 3000);
        }
    }
    
    // إضافة CSS للفواكة المتساقطة
    const style = document.createElement('style');
    style.textContent = `
        .falling-banana {
            position: absolute;
            top: -50px;
            z-index: 1000;
            animation: fallBanana 3s linear forwards;
            pointer-events: none;
            filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
        }
        
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
        
        @keyframes buttonPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    `;
    document.head.appendChild(style);
});




// تفاعلية قسم Learning Activities
document.addEventListener('DOMContentLoaded', function() {
    const activityCards = document.querySelectorAll('.activity-card');
    const startButtons = document.querySelectorAll('.start-btn');
    
    // تأثيرات البطاقات
    activityCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '2';
        });
    });
    
    // تأثيرات أزرار البدء
    startButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // تأثير النقر
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            // تأثير الجسيمات
            createButtonParticles(this);
            
            // رسالة نجاح
            const card = this.closest('.activity-card');
            const cardTitle = card.querySelector('.card-title').textContent;
            
            showSuccessMessage(`Starting: ${cardTitle.trim()}`);
        });
    });
    
    // تأثير الجسيمات للزر
    function createButtonParticles(button) {
        const rect = button.getBoundingClientRect();
        const colors = ['#FFD54F', '#4CAF50', '#2196F3', '#FF5722'];
        
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'button-particle';
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50 + 30;
            
            particle.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${rect.left + rect.width/2}px;
                top: ${rect.top + rect.height/2}px;
                pointer-events: none;
                z-index: 1000;
                animation: particleExplode 0.8s ease-out forwards;
                --tx: ${Math.cos(angle) * distance}px;
                --ty: ${Math.sin(angle) * distance}px;
                --rotation: ${Math.random() * 360}deg;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 800);
        }
        
        // إضافة CSS للجسيمات
        if (!document.querySelector('#particle-style')) {
            const style = document.createElement('style');
            style.id = 'particle-style';
            style.textContent = `
                @keyframes particleExplode {
                    0% {
                        transform: translate(0, 0) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--tx), var(--ty)) rotate(var(--rotation)) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // عرض رسالة النجاح
    function showSuccessMessage(text) {
        // إزالة الرسالة السابقة إن وجدت
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) existingMessage.remove();
        
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <div class="message-content">
                <span class="message-icon">🎉</span>
                <span class="message-text">${text}</span>
                <span class="message-close">×</span>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // إضافة CSS للرسالة
        if (!document.querySelector('#message-style')) {
            const style = document.createElement('style');
            style.id = 'message-style';
            style.textContent = `
                .success-message {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(45deg, #4CAF50, #8BC34A);
                    color: white;
                    padding: 20px 30px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
                    font-family: "Itim", cursive;
                }
                
                .message-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .message-icon {
                    font-size: 24px;
                    animation: bounceIcon 1s infinite;
                }
                
                .message-text {
                    font-size: 16px;
                    flex: 1;
                }
                
                .message-close {
                    font-size: 24px;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.3s;
                }
                
                .message-close:hover {
                    opacity: 1;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
                
                @keyframes bounceIcon {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // زر الإغلاق
        const closeBtn = message.querySelector('.message-close');
        closeBtn.addEventListener('click', () => {
            message.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => message.remove(), 300);
        });
        
        // إزالة تلقائية بعد 3 ثوان
        setTimeout(() => {
            if (message.parentNode) {
                message.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => message.remove(), 300);
            }
        }, 3000);
    }
    
    // تفاعلية نقاط الأمان
    const safetyPoints = document.querySelectorAll('.safety-point');
    safetyPoints.forEach(point => {
        point.addEventListener('click', function() {
            const title = this.querySelector('.point-title').textContent;
            const check = this.querySelector('.point-check');
            
            // تأثير التأكيد
            check.style.transform = 'scale(1.5)';
            check.style.color = '#FFD54F';
            
            setTimeout(() => {
                check.style.transform = '';
                check.style.color = '#4CAF50';
            }, 300);
            
            console.log(`Selected: ${title}`);
        });
    });
    
    // تحديث شريط التقدم
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        let width = 65;
        const interval = setInterval(() => {
            if (width < 100) {
                width += 0.5;
                progressFill.style.width = `${width}%`;
                document.querySelector('.progress-percent').textContent = `${Math.round(width)}%`;
            } else {
                clearInterval(interval);
            }
        }, 100);
        
        setTimeout(() => clearInterval(interval), 7000);
    }
});



// FAQ Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    const flamingoBtn = document.querySelector('.flamingo-btn');
    const seeAllBtn = document.querySelector('.see-all-btn');
    const faqItems = document.querySelectorAll('.faq-item');
    
    // فتح/إغلاق الأسئلة
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const answer = this.nextElementSibling;
            
            // إغلاق جميع الأسئلة الأخرى
            if (!isExpanded) {
                faqQuestions.forEach(q => {
                    if (q !== question) {
                        q.setAttribute('aria-expanded', 'false');
                        q.classList.remove('active');
                        const otherAnswer = q.nextElementSibling;
                        otherAnswer.classList.remove('open');
                        otherAnswer.setAttribute('aria-hidden', 'true');
                        
                        // إعادة تعيين السهم
                        const otherArrow = q.querySelector('.arrow-container');
                        otherArrow.style.transform = 'rotate(0deg)';
                        otherArrow.style.background = 'white';
                    }
                });
            }
            
            // تبديل الحالة
            this.setAttribute('aria-expanded', !isExpanded);
            this.classList.toggle('active');
            answer.classList.toggle('open');
            answer.setAttribute('aria-hidden', isExpanded);
            
            // تحريك السهم
            const arrowContainer = this.querySelector('.arrow-container');
            if (!isExpanded) {
                arrowContainer.style.transform = 'rotate(180deg)';
                arrowContainer.style.background = '#7caf53';
                
                // تأثير ظهور الإجابة
                answer.style.maxHeight = answer.scrollHeight + 'px';
                
                
            } else {
                arrowContainer.style.transform = 'rotate(0deg)';
                arrowContainer.style.background = 'white';
                answer.style.maxHeight = '0';
            }
            
            // تأثير اهتزاز للبطاقة
            this.closest('.faq-item').style.animation = 'none';
            setTimeout(() => {
                this.closest('.faq-item').style.animation = 'cardBounce 0.5s ease';
            }, 10);
        });
    });
    
    // زر الفلامنجو التفاعلي
    if (flamingoBtn) {
        flamingoBtn.addEventListener('click', function() {
            // تأثير النقر
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            // إنشاء فقاعات
            createBubbles(this);
            
            // عرض نموذج سؤال
            showQuestionForm();
        });
        
        // تحريك الفلامنجو عند التمرير
        window.addEventListener('scroll', function() {
            const flamingo = document.querySelector('.faq-flamingo');
            if (flamingo) {
                const scrollPercent = window.scrollY / document.body.scrollHeight;
                const rotation = scrollPercent * 10;
                flamingo.style.transform = `translateY(${scrollPercent * 20}px) rotate(${rotation}deg)`;
            }
        });
    }
    
    // زر رؤية جميع الأسئلة
    if (seeAllBtn) {
        seeAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // تأثير الزر
            this.style.animation = 'buttonPulse 0.5s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
            
            // الكشف عن جميع الأسئلة المخفية
            const hiddenItems = document.querySelectorAll('.faq-hidden');
            hiddenItems.forEach(item => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
                item.classList.remove('faq-hidden');
                
                // تأثير ظهور
                item.style.animation = 'itemAppear 0.8s ease';
            });
            
            // تحريك الصفحة لأسفل قليلاً
            window.scrollBy({
                top: 300,
                behavior: 'smooth'
            });
        });
    }
    
    // تأثيرات عند التمرير فوق الأسئلة
    faqItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.question-icon');
            if (icon) {
                icon.style.animation = 'iconWiggle 0.5s ease';
            }
        });
    });
    
    
    
    function createBubbles(button) {
        const rect = button.getBoundingClientRect();
        
        for (let i = 0; i < 20; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'floating-bubble';
            
            const size = Math.random() * 20 + 10;
            const color = `hsl(${Math.random() * 60 + 300}, 100%, 70%)`;
            
            bubble.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${rect.left + rect.width/2}px;
                top: ${rect.top}px;
                pointer-events: none;
                z-index: 1000;
                animation: bubbleRise 2s ease-out forwards;
                --tx: ${(Math.random() - 0.5) * 100}px;
                --ty: -${Math.random() * 150 + 100}px;
            `;
            
            document.body.appendChild(bubble);
            
            setTimeout(() => {
                bubble.remove();
            }, 2000);
        }
        
        // إضافة CSS للفقاعات
        if (!document.querySelector('#bubble-style')) {
            const style = document.createElement('style');
            style.id = 'bubble-style';
            style.textContent = `
                @keyframes bubbleRise {
                    0% {
                        transform: translate(0, 0) scale(0.5);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--tx), var(--ty)) scale(1.2);
                        opacity: 0;
                    }
                }
                
                @keyframes cardBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes buttonPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                
                @keyframes itemAppear {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function showQuestionForm() {
        // يمكن استبدال هذا بنموذج حقيقي
        const formHTML = `
            <div class="question-form-overlay">
                <div class="question-form">
                    <h3>Ask Flamingo a Question! 🦩</h3>
                    <textarea placeholder="Type your question here..." rows="4"></textarea>
                    <div class="form-buttons">
                        <button class="cancel-btn">Cancel</button>
                        <button class="submit-btn">Ask Question</button>
                    </div>
                </div>
            </div>
        `;
        
        const formContainer = document.createElement('div');
        formContainer.innerHTML = formHTML;
        document.body.appendChild(formContainer);
        
        // إضافة CSS للنموذج
        if (!document.querySelector('#form-style')) {
            const style = document.createElement('style');
            style.id = 'form-style';
            style.textContent = `
                .question-form-overlay {
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
                
                .question-form {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 500px;
                    animation: slideUp 0.3s ease;
                }
                
                .question-form h3 {
                    font-family: "Itim", cursive;
                    color: #6e3c14;
                    margin-bottom: 20px;
                }
                
                .question-form textarea {
                    width: 100%;
                    padding: 15px;
                    border: 2px solid #FFD54F;
                    border-radius: 10px;
                    font-family: "Itim", cursive;
                    font-size: 16px;
                    margin-bottom: 20px;
                    resize: vertical;
                }
                
                .form-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: flex-end;
                }
                
                .cancel-btn, .submit-btn {
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-family: "Itim", cursive;
                    font-size: 16px;
                    cursor: pointer;
                    border: none;
                    transition: all 0.3s ease;
                }
                
                .cancel-btn {
                    background: #f5f5f5;
                    color: #666;
                }
                
                .submit-btn {
                    background: linear-gradient(45deg, #FF4081, #E91E63);
                    color: white;
                }
                
                .cancel-btn:hover, .submit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // إضافة معالجات الأحداث
        const overlay = formContainer.querySelector('.question-form-overlay');
        const cancelBtn = formContainer.querySelector('.cancel-btn');
        const submitBtn = formContainer.querySelector('.submit-btn');
        const textarea = formContainer.querySelector('textarea');
        
        cancelBtn.addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => formContainer.remove(), 300);
        });
        
        submitBtn.addEventListener('click', () => {
            const question = textarea.value.trim();
            if (question) {
                // هنا يمكن إرسال السؤال للخادم
                alert(`Question sent: "${question}"\nOur flamingo will answer soon!`);
                formContainer.remove();
            } else {
                textarea.style.borderColor = '#ff4444';
                setTimeout(() => {
                    textarea.style.borderColor = '#FFD54F';
                }, 1000);
            }
        });
        
        // إغلاق بالنقر خارج النموذج
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cancelBtn.click();
            }
        });
        
        // تأثير ظهور
        overlay.style.animation = 'fadeIn 0.3s ease';
    }
    
    // فتح أول سؤال تلقائياً
    setTimeout(() => {
        const firstQuestion = document.querySelector('.faq-question');
        if (firstQuestion) {
            firstQuestion.click();
        }
    }, 1000);
});




document.addEventListener('DOMContentLoaded', function() {
    // تحديث صورة البروفايل من localStorage
    function updateProfileImage() {
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            const savedAvatar = localStorage.getItem('monkeyITKids_avatar');
            profileImage.src = savedAvatar || 'img/profile1.png';
            
            // إضافة حدث النقر للانتقال لصفحة الحساب
            profileImage.addEventListener('click', function() {
                window.location.href = 'profile.html';
            });
        }
    }
    
    // تحديث عند تحميل الصفحة
    updateProfileImage();
    
    // الاستماع لتحديثات الصورة
    window.addEventListener('storage', function(e) {
        if (e.key === 'monkeyITKids_avatar') {
            updateProfileImage();
        }
    });
    
    // أو استخدام خدمة الصور
    if (window.ImageService) {
        ImageService.updateAllProfileImages();
        
        // الاشتراك في التحديثات المستقبلية
        ImageService.onProfileImageUpdate((imageSrc) => {
            const profileImage = document.getElementById('profileImage');
            if (profileImage) {
                profileImage.src = imageSrc;
            }
        });
    }
});

// ==================== جلب وعرض النماذج في قسم Learning Activities ====================

// دالة لجلب نماذج الأطفال من localStorage
function getKidsForms() {
    try {
        // جلب من نظام التخزين الخاص بالأدمن
        const kidsForms = JSON.parse(localStorage.getItem('monkeyITKids_forms_kids')) || [];
        
        // إذا لم تكن هناك نماذج مخزنة، استخدم النماذج الافتراضية
        if (kidsForms.length === 0) {
            return [
              /*  {
                    id: 1,
                    title: "Programming Basics Challenge",
                    description: "A beginner-friendly form that teaches kids the foundations of programming—like sequences, patterns, logic, and simple coding ideas.",
                    category: "programming",
                    difficulty: 2,
                    time: "15-20 min",
                    image: "img/programming.png",
                    tags: ["Logic Building", "Problem Solving"],
                    status: "active",
                    questions: []
                },
                {
                    id: 2,
                    title: "Computer Basics Quiz",
                    description: "A fun and simple quiz that introduces kids to the basic parts of a computer, devices, and common icons.",
                    category: "hardware",
                    difficulty: 2,
                    time: "10-15 min",
                    image: "img/basic.png",
                    tags: ["Hardware Basics", "Device Knowledge"],
                    status: "active",
                    questions: []
                },
                {
                    id: 3,
                    title: "Internet Safety for Kids",
                    description: "An essential form that helps children learn how to stay safe online.",
                    category: "safety",
                    difficulty: 3,
                    time: "20-35 min",
                    image: "img/safe.png",
                    tags: ["Online Safety", "Privacy"],
                    status: "active",
                    questions: []
                }*/
            ];
        }
        
        // إرجاع فقط النماذج النشطة
        return kidsForms.filter(form => form.status === "active");
        
    } catch (error) {
        console.error("Error loading kids forms:", error);
        return [];
    }
}

// دالة لتحويل نماذج الأدمن إلى بطاقات
function createCardsFromForms(forms) {
    const cardsContainer = document.querySelector('.cards-container');
    if (!cardsContainer) return;
    
    // مسح البطاقات الحالية
    cardsContainer.innerHTML = '';
    
    if (forms.length === 0) {
        cardsContainer.innerHTML = `
            <div class="empty-forms-message" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <h3 style="color: #6e3c14; margin-bottom: 15px;">🎯 No Forms Available Yet</h3>
                <p style="color: #666; font-size: 18px;">New learning activities coming soon!</p>
                <img src="img/logo.png" alt="No Forms" style="width: 150px; margin-top: 20px; opacity: 0.7;">
            </div>
        `;
        return;
    }
    
    // إنشاء بطاقة لكل نموذج
    forms.forEach((form, index) => {
        // تحديد لون البادج
        let badgeClass = 'card-badge';
        let badgeText = 'NEW';
        
        if (form.category === 'safety') {
            badgeClass = 'card-badge card-badge-essential';
            badgeText = 'Safety First';
        } else if (index === 1) {
            badgeClass = 'card-badge card-badge-popular';
            badgeText = 'POPULAR';
        } else if (form.category === 'programming') {
            badgeClass = 'card-badge card-badge-coding';
            badgeText = 'CODING';
        }
        
        // بناء النجوم حسب الصعوبة
        let starsHTML = '';
        const difficulty = form.difficulty || 2;
        for (let i = 0; i < 5; i++) {
            starsHTML += `<span class="star ${i < difficulty ? 'active' : ''}">★</span>`;
        }
        
        // بناء الوسوم
        let tagsHTML = '';
        if (form.tags && form.tags.length > 0) {
            form.tags.forEach(tag => {
                tagsHTML += `<span class="feature-tag">${tag}</span>`;
            });
        } else {
            // وسوم افتراضية حسب الفئة
            switch(form.category) {
                case 'programming':
                    tagsHTML = `<span class="feature-tag">Logic Building</span><span class="feature-tag">Problem Solving</span>`;
                    break;
                case 'hardware':
                    tagsHTML = `<span class="feature-tag">Hardware Basics</span><span class="feature-tag">Device Knowledge</span>`;
                    break;
                case 'safety':
                    tagsHTML = `<span class="feature-tag">Online Safety</span><span class="feature-tag">Privacy</span>`;
                    break;
                default:
                    tagsHTML = `<span class="feature-tag">Learning</span><span class="feature-tag">Fun</span>`;
            }
        }
        
        // إنشاء عنصر البطاقة
        const card = document.createElement('div');
        card.className = 'activity-card';
        card.setAttribute('data-form-id', form.id);
        card.setAttribute('data-aos', 'zoom-in');
        card.setAttribute('data-aos-delay', `${(index + 1) * 100}`);
        
        card.innerHTML = `
            <div class="${badgeClass}">
                <span class="badge-text">${badgeText}</span>
            </div>
            <div class="card-image">
                <img src="${form.image || 'img/default-kids.png'}" alt="${form.title}" 
                     onerror="this.src='img/default-kids.png'">
                <div class="image-overlay">
                    <span class="overlay-text">${form.category || 'Learning'}</span>
                </div>
            </div>
            <div class="card-content">
                <h3 class="card-title">
                    <span class="title-icon"></span>
                    ${form.title}
                </h3>
                <p class="card-description">${form.description}</p>
                <div class="card-features">${tagsHTML}</div>
                <button class="start-btn" data-form-id="${form.id}">
                    <span class="btn-text">Start Challenge</span>
                    <span class="btn-arrow">→</span>
                </button>
            </div>
            <div class="card-footer">
                <div class="difficulty">
                    <span class="difficulty-label">Difficulty:</span>
                    <div class="difficulty-stars">${starsHTML}</div>
                </div>
                <div class="estimated-time">⏱️ ${form.time || '10-15 min'}</div>
            </div>
        `;
        
        cardsContainer.appendChild(card);
    });
    
    // إضافة event listeners لأزرار البدء
    addStartButtonListeners();
}

// دالة لإضافة event listeners لأزرار البدء
function addStartButtonListeners() {
    document.querySelectorAll('.start-btn').forEach(button => {
        button.addEventListener('click', function() {
            const formId = this.getAttribute('data-form-id');
            startForm(formId);
        });
    });
}

function startForm(formId) {
    try {
        const kidsForms = JSON.parse(localStorage.getItem('monkeyITKids_forms_kids')) || [];
        const form = kidsForms.find(f => f.id == formId);
        
        if (!form) {
            console.error('Form not found for ID:', formId);
            console.log('Available forms:', kidsForms);
            
            // عرض رسالة صديقة
            showFormError('Form not found! Please try again later.');
            return;
        }
        
        // التأكد من وجود الأسئلة
        if (!form.questions || form.questions.length === 0) {
            console.error('Form has no questions:', form);
            showFormError('This form has no questions yet. Please check back later!');
            return;
        }
        
        // حفظ النموذج الحالي
        localStorage.setItem('currentForm', JSON.stringify(form));
        localStorage.setItem('currentFormId', formId);
        
        // تأثيرات عند النقر
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
        
        // رسالة تحميل
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        this.disabled = true;
        
        // توجيه لصفحة النموذج
        setTimeout(() => {
            window.location.href = `kids-form-player.html?id=${formId}`;
        }, 800);
        
        // استعادة الزر في حالة الخطأ
        setTimeout(() => {
            this.innerHTML = originalText;
            this.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error starting form:', error);
        showFormError('Error loading form. Please try again.');
        
        // استعادة الزر
        this.innerHTML = '<span class="btn-text">Start Challenge</span><span class="btn-arrow">→</span>';
        this.disabled = false;
    }
}

// دالة لعرض رسالة خطأ جذابة
function showFormError(message) {
    // إزالة الرسائل السابقة
    const existingError = document.querySelector('.form-error-message');
    if (existingError) existingError.remove();
    
    // إنشاء رسالة الخطأ
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <div class="error-icon">😢</div>
            <div class="error-text">
                <h4>Oops!</h4>
                <p>${message}</p>
            </div>
            <button class="error-close">&times;</button>
        </div>
    `;
    
    // إضافة CSS للرسالة إذا لم تكن موجودة
    if (!document.querySelector('#error-style')) {
        const style = document.createElement('style');
        style.id = 'error-style';
        style.textContent = `
            .form-error-message {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(45deg, #FF5252, #FF4081);
                color: white;
                padding: 15px 25px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(255, 82, 82, 0.3);
                z-index: 10000;
                animation: slideDown 0.3s ease;
                min-width: 300px;
                max-width: 500px;
            }
            
            .error-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .error-icon {
                font-size: 32px;
                animation: bounce 1s infinite;
            }
            
            .error-text h4 {
                margin: 0 0 5px 0;
                font-size: 18px;
            }
            
            .error-text p {
                margin: 0;
                font-size: 14px;
                opacity: 0.9;
            }
            
            .error-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                margin-left: auto;
                opacity: 0.7;
                transition: opacity 0.3s;
            }
            
            .error-close:hover {
                opacity: 1;
            }
            
            @keyframes slideDown {
                from {
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(errorDiv);
    
    // زر الإغلاق
    const closeBtn = errorDiv.querySelector('.error-close');
    closeBtn.addEventListener('click', () => {
        errorDiv.style.animation = 'slideUp 0.3s ease forwards';
        setTimeout(() => errorDiv.remove(), 300);
    });
    
    // إضافة keyframe للانزلاق لأعلى
    if (!document.querySelector('#slideUp-style')) {
        const slideUpStyle = document.createElement('style');
        slideUpStyle.id = 'slideUp-style';
        slideUpStyle.textContent = `
            @keyframes slideUp {
                from {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
                to {
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(slideUpStyle);
    }
    
    // إزالة تلقائية بعد 5 ثوان
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 5000);
}

// ==================== التحميل التلقائي عند فتح الصفحة ====================

document.addEventListener('DOMContentLoaded', function() {
    // تحميل النماذج وعرض البطاقات
    const kidsForms = getKidsForms();
    createCardsFromForms(kidsForms);
    
    // تحديث تلقائي عند تغيير localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'monkeyITKids_forms_kids') {
            const updatedForms = getKidsForms();
            createCardsFromForms(updatedForms);
        }
    });
    
    // تحديث يدوي (للتجربة)
    window.refreshForms = function() {
        const kidsForms = getKidsForms();
        createCardsFromForms(kidsForms);
        alert('Forms refreshed!');
    };
});



document.addEventListener('DOMContentLoaded', function() {
    // معالجة النقر على أزرار Start Challenge
    const startButtons = document.querySelectorAll('.start-btn');
    
    startButtons.forEach(button => {
        button.addEventListener('click', function() {
            const formId = this.getAttribute('data-form-id');
            loadForm(formId);
        });
    });
    
    // معالجة زر Let's Go في الهيرو
    const kidsBtn = document.querySelector('.kids-btn');
    if (kidsBtn) {
        kidsBtn.addEventListener('click', function() {
            // يمكنك اختيار أي نموذج للبدء به
            window.location.href = 'form.html?form=programming-basics';
        });
    }
});

function loadForm(formId) {
    try {
        // جلب البيانات من localStorage
        const forms = JSON.parse(localStorage.getItem('monkeyITKids_forms_kids'));
        
        if (!forms || !Array.isArray(forms)) {
            throw new Error('No forms found in storage');
        }
        
        // البحث عن النموذج المطلوب
        let selectedForm;
        
        if (formId === 'programming-basics') {
            selectedForm = forms.find(form => form.title.includes('Programming Basics'));
        } else if (formId === 'computer-basics') {
            selectedForm = forms.find(form => form.title.includes('Computer Basics'));
        } else if (formId === 'internet-safety') {
            selectedForm = forms.find(form => form.title.includes('Internet Safety'));
        }
        
        if (!selectedForm) {
            // إذا لم يوجد النموذج، استخدم الأول
            selectedForm = forms[0];
        }
        
        // حفظ النموذج المختار في localStorage
        localStorage.setItem('selectedForm', JSON.stringify(selectedForm));
        
        // الانتقال إلى صفحة النموذج
        window.location.href = 'kids-form-player.html';
        
    } catch (error) {
        console.error('Error loading form:', error);
        showError('Oops! Error loading form. Please try again.');
    }
}

function showError(message) {
    // يمكنك عرض رسالة خطأ في الصفحة
    alert(message);
    // أو عرض div مخصص للخطأ
}