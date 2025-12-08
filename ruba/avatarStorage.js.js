// avatarStorage.js - ملف مستقل لحفظ واسترجاع الصورة
class AvatarStorage {
    constructor() {
        this.storageKey = 'monkeyITKids_avatar';
        this.defaultAvatar = 'img/profile1.png';
    }
    
    // حفظ الصورة
    saveAvatar(imageSrc) {
        try {
            // إذا كانت الصورة من نفس الموقع، نخزن المسار فقط
            if (imageSrc.startsWith('http') || imageSrc.includes('base64')) {
                // تخزين كـ base64
                localStorage.setItem(this.storageKey, imageSrc);
            } else {
                // تخزين المسار النسبي
                localStorage.setItem(this.storageKey, imageSrc);
            }
            console.log('Avatar saved to localStorage:', imageSrc);
            return true;
        } catch (error) {
            console.error('Error saving avatar:', error);
            return false;
        }
    }
    
    // استرجاع الصورة
    getAvatar() {
        try {
            const savedAvatar = localStorage.getItem(this.storageKey);
            return savedAvatar || this.defaultAvatar;
        } catch (error) {
            console.error('Error getting avatar:', error);
            return this.defaultAvatar;
        }
    }
    
    // مسح الصورة المحفوظة
    clearAvatar() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing avatar:', error);
            return false;
        }
    }
    
    // تحديث كل الصور في الصفحة الحالية
    updatePageAvatars() {
        const avatarSrc = this.getAvatar();
        
        // تحديث جميع الصور التي لها كلاس avatar
        document.querySelectorAll('.avatar, .profile-img, .nav-profile, .main-avatar').forEach(img => {
            img.src = avatarSrc;
        });
        
        // تحديث الصور في الـ sidebar إذا وجدت
        const sidebarImg = document.querySelector('.sidebar-header img');
        if (sidebarImg) sidebarImg.src = avatarSrc;
        
        return avatarSrc;
    }
}

// إنشاء نسخة عامة يمكن استخدامها في كل مكان
window.avatarStorage = new AvatarStorage();