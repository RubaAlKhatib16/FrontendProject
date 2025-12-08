document.addEventListener('DOMContentLoaded', function () {
      /* -------------------------------------------
       👤 1) تحديث اسم المستخدم من localStorage
    ------------------------------------------- */
    
    function updateUserName() {
        try {
            // جلب بيانات المستخدم من localStorage
            const currentUser = JSON.parse(localStorage.getItem("currentuser")) || {};
            
            // تحديث الاسم في السايدبار
            const sidebarUserName = document.getElementById('sidebarUserName');
            if (sidebarUserName) {
                if (currentUser.name) {
                    sidebarUserName.textContent = `Hi, ${currentUser.name}!`;
                } else if (currentUser.username) {
                    sidebarUserName.textContent = `Hi, ${currentUser.username}!`;
                } else {
                    sidebarUserName.textContent = "Hi, Child!";
                }
            }
            
            // تحديث الاسم في قسم الترحيب الرئيسي
            const welcomeUserName = document.getElementById('welcomeUserName');
            if (welcomeUserName) {
                const highlightSpan = welcomeUserName.querySelector('.highlight');
                if (highlightSpan) {
                    if (currentUser.name) {
                        highlightSpan.textContent = currentUser.name;
                    } else if (currentUser.username) {
                        highlightSpan.textContent = currentUser.username;
                    } else {
                        highlightSpan.textContent = "Child!";
                    }
                }
            }
            
            // تحديث الحقول الأخرى إذا كانت موجودة
            updateFormFields(currentUser);
            
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    }
    
    // تحديث حقول النموذج بالمعلومات المحفوظة
    function updateFormFields(user) {
        // تحديث حقل اسم المستخدم
        const usernameInput = document.getElementById('username');
        if (usernameInput && user.username && usernameInput.value === "SuperCoder2024") {
            usernameInput.value = user.username;
        }
        
        // تحديث حقل البريد الإلكتروني للأبوين
        const parentEmailInput = document.getElementById('parent-email');
        if (parentEmailInput && user.parentEmail && parentEmailInput.value === "parent@email.com") {
            parentEmailInput.value = user.parentEmail;
        } else if (parentEmailInput && user.email && parentEmailInput.value === "parent@email.com") {
            // إذا كان هناك حقل email في بيانات المستخدم
            parentEmailInput.value = user.email;
        }
    }
    
    // استدعاء الدالة عند تحميل الصفحة
    updateUserName();
    
    // تحديث الاسم عند تغيير localStorage من صفحة أخرى
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentuser') {
            updateUserName();
        }
    });

    /* -------------------------------------------
       🔔 1) الدوال العامة (Toast / Sound / Celebration)
    ------------------------------------------- */

    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-brown);
            color: #fff;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 9999;
            animation: toastIn .3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = "toastOut .3s ease forwards";
            setTimeout(() => toast.remove(), 300);
        }, 3000);

        if (!document.querySelector('#toast-style')) {
            const style = document.createElement('style');
            style.id = 'toast-style';
            style.textContent = `
            @keyframes toastIn {
                from { transform: translate(-50%, 50px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            @keyframes toastOut {
                from { transform: translate(-50%,0); opacity: 1; }
                to { transform: translate(-50%,50px); opacity: 0; }
            }`;
            document.head.appendChild(style);
        }
    }

    function playSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.frequency.value = 800;
            gain.gain.value = 0.1;

            osc.start();
            osc.stop(audioContext.currentTime + 0.1);
        } catch (e) { }
    }

    function createFallingBanana() {
        const banana = document.createElement('div');
        banana.textContent = '🍌';
        banana.style.cssText = `
            position: fixed;
            top: -40px;
            left: ${Math.random() * 100}vw;
            font-size: ${20 + Math.random() * 20}px;
            z-index: 2000;
            animation: fall ${2 + Math.random() * 2}s linear forwards;
        `;
        document.body.appendChild(banana);
        setTimeout(() => banana.remove(), 3000);
    }

    function showCelebration() {
        const c = document.querySelector('.banana-celebration');
        if (!c) return;

        c.style.display = "flex";

        for (let i = 0; i < 20; i++) createFallingBanana();

        setTimeout(() => c.style.display = "none", 5000);
    }

    const styleFall = document.createElement('style');
    styleFall.textContent = `
        @keyframes fall {
            from { transform: translateY(0) rotate(0); opacity: 1; }
            to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
    `;
    document.head.appendChild(styleFall);

    /* -------------------------------------------
       📌 2) Sidebar Toggle
    ------------------------------------------- */
    const burgerBtn = document.getElementById('burger');
    const sidebar = document.querySelector('.sidebar');

    burgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        burgerBtn.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !burgerBtn.contains(e.target)) {
            sidebar.classList.remove('active');
            burgerBtn.classList.remove('active');
        }
    });

    /* -------------------------------------------
       🎨 3) Avatar Storage Integration
    ------------------------------------------- */

    const avatarStorage = window.avatarStorage;
document.addEventListener("DOMContentLoaded", () => {
    updatePageAvatars();  // أو اسم الفنكشن الصحيح
});

    // تحديث الصور عند تحميل الصفحة
    avatarStorage.updatePageAvatars();

    function updateSelectedAvatar() {
        const current = avatarStorage.getAvatar();
        const options = document.querySelectorAll('.avatar-option');

        options.forEach(option => {
            const img = option.querySelector('img');
            if (img && img.src.includes(current.split('/').pop())) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    setTimeout(updateSelectedAvatar, 400);

    // عند اختيار أفاتار
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.addEventListener('click', function () {
            const img = this.querySelector('img');
            if (img) {
                avatarStorage.saveAvatar(img.src);
                avatarStorage.updatePageAvatars();
                updateSelectedAvatar();
                showToast("Avatar saved! 🎨");
                playSound();
            }
        });
    });

    /* -------------------------------------------
       ✏️ 4) Edit Inputs
    ------------------------------------------- */

    document.querySelectorAll('.edit-icon').forEach(icon => {
        icon.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input');
            input.focus();
            playSound();
        });
    });

    /* -------------------------------------------
   💾 5) Save Button (محدث)
------------------------------------------- */

const saveBtn = document.querySelector('.save-btn');
saveBtn.addEventListener('click', function() {
    // جمع البيانات من النموذج
    const usernameInput = document.getElementById('username');
    const parentEmailInput = document.getElementById('parent-email');
    const selectedAge = document.querySelector('.age-option.selected');
    
    // جلب بيانات المستخدم الحالية
    const currentUser = JSON.parse(localStorage.getItem("currentuser")) || {};
    
    // تحديث البيانات
    if (usernameInput) {
        currentUser.username = usernameInput.value;
    }
    
    if (parentEmailInput) {
        currentUser.parentEmail = parentEmailInput.value;
    }
    
    if (selectedAge) {
        currentUser.ageGroup = selectedAge.textContent;
    }
    
    // حفظ البيانات في localStorage
    localStorage.setItem("currentuser", JSON.stringify(currentUser));
    
    // تحديث العرض
    updateUserName();
    
    // تأثير النجاح
    saveBtn.innerHTML = '✔ Changes Saved!';
    saveBtn.style.background = "linear-gradient(135deg, #4CAF50, #66BB6A)";
    showToast("Profile updated successfully! 🎉");
    playSound();
    showCelebration();
    
    setTimeout(() => {
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        saveBtn.style.background = "";
    }, 3000);
});

/* -------------------------------------------
   👤 6) تحديث اختيار العمر
------------------------------------------- */

const ageOptions = document.querySelectorAll('.age-option');
ageOptions.forEach(option => {
    option.addEventListener('click', function() {
        // إلغاء تحديد الجميع
        ageOptions.forEach(opt => opt.classList.remove('selected'));
        // تحديد الخيار الحالي
        this.classList.add('selected');
        playSound();
    });
});



    /* -------------------------------------------
       ▶️ 6) Start Form Buttons
    ------------------------------------------- */

    document.querySelectorAll('.start-form-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            this.disabled = true;

            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-play"></i> Start Form';
                this.disabled = false;
            }, 1500);
        });
    });

    /* -------------------------------------------
       🚀 7) Continue Button
    ------------------------------------------- */

    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            showToast("Continuing...🚀");
            continueBtn.style.transform = "scale(0.95)";
            setTimeout(() => continueBtn.style.transform = "", 200);
        });
    }

    /* -------------------------------------------
   👋 8) Sign Out (محدث)
------------------------------------------- */

const signoutBtn = document.querySelector('.signout-btn');
if (signoutBtn) {
    signoutBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to sign out?")) {
            // مسح بيانات المستخدم من localStorage
            localStorage.removeItem("currentuser");
            
            // إعادة تعيين الأسماء
            updateUserName();
            
            // إغلاق السايدبار
            sidebar.classList.remove('active');
            burgerBtn.classList.remove('active');
            
            // رسالة تأكيد
            showToast("Signed out successfully! 👋");
            
            // (اختياري) توجيه لصفحة التسجيل بعد ثانية
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        }
    });
}

    /* -------------------------------------------
       🖼 9) Navbar Avatar Click
    ------------------------------------------- */

    const navProfile = document.querySelector('.nav-profile');
    if (navProfile) {
        navProfile.style.cursor = "pointer";
        navProfile.addEventListener('click', () => {
            document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    /* -------------------------------------------
       🧽 10) RESET AVATAR (اختياري)
    ------------------------------------------- */

    const resetAvatarBtn = document.createElement('button');
    resetAvatarBtn.className = "reset-avatar-btn";
    resetAvatarBtn.innerHTML = "↺ Reset Avatar";
    resetAvatarBtn.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: #ff4444; color: white; padding: 8px 14px;
        border-radius: 20px; border: none; cursor: pointer;
        z-index: 9999; display: none;
    `;
    document.body.appendChild(resetAvatarBtn);

    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.shiftKey && e.key === "R") {
            resetAvatarBtn.style.display = "block";
            setTimeout(() => resetAvatarBtn.style.display = "none", 5000);
        }
    });

    resetAvatarBtn.addEventListener('click', () => {
        avatarStorage.clearAvatar();
        avatarStorage.updatePageAvatars();
        showToast("Avatar reset!");
    });

    console.log("Profile Dashboard Loaded ✔");
});
