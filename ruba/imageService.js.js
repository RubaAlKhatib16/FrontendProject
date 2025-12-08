// imageService.js - خدمة مركزية للصور
const ImageService = {
    // تخزين جميع الصور
    storageKeys: {
        avatar: 'monkeyITKids_avatar',
        theme: 'monkeyITKids_theme',
        progress: 'monkeyITKids_progress'
    },
    
    // تحويل الصورة إلى base64
    async imageToBase64(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL());
            };
            img.onerror = reject;
            img.src = url;
        });
    },
    
    // حفظ صورة البروفايل
    async saveProfileImage(imageElement) {
        try {
            let imageSrc;
            
            // إذا كانت الصورة من الإنترنت
            if (imageElement.src.startsWith('http')) {
                imageSrc = await this.imageToBase64(imageElement.src);
            } else {
                // إذا كانت محلية، استخدم المسار المباشر
                imageSrc = imageElement.src;
            }
            
            localStorage.setItem(this.storageKeys.avatar, imageSrc);
            
            // إرسال حدث بأن الصورة تم تحديثها
            this.dispatchImageUpdateEvent(imageSrc);
            
            return imageSrc;
        } catch (error) {
            console.error('Error saving profile image:', error);
            return null;
        }
    },
    
    // استرجاع صورة البروفايل
    getProfileImage() {
        try {
            const savedImage = localStorage.getItem(this.storageKeys.avatar);
            if (savedImage && savedImage.startsWith('data:image')) {
                return savedImage; // base64
            }
            return savedImage || 'img/profile1.png';
        } catch (error) {
            console.error('Error getting profile image:', error);
            return 'img/profile1.png';
        }
    },
    
    // تحديث جميع الصور في الصفحة
    updateAllProfileImages() {
        const avatarSrc = this.getProfileImage();
        const selectors = [
            '.profile-img',
            '.nav-profile',
            '.main-avatar',
            '.avatar',
            '.user-avatar',
            '.sidebar-header img',
            '[data-profile-image]'
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(img => {
                if (img.tagName === 'IMG') {
                    img.src = avatarSrc;
                }
            });
        });
        
        return avatarSrc;
    },
    
    // إرسال حدث تحديث الصورة
    dispatchImageUpdateEvent(imageSrc) {
        const event = new CustomEvent('profileImageUpdated', {
            detail: { imageSrc }
        });
        window.dispatchEvent(event);
    },
    
    // الاشتراك في تحديثات الصورة
    onProfileImageUpdate(callback) {
        window.addEventListener('profileImageUpdated', (e) => {
            callback(e.detail.imageSrc);
        });
    },
    
    // حفظ تقدم المستخدم
    saveUserProgress(progressData) {
        try {
            localStorage.setItem(this.storageKeys.progress, JSON.stringify(progressData));
            return true;
        } catch (error) {
            console.error('Error saving progress:', error);
            return false;
        }
    },
    
    // استرجاع تقدم المستخدم
    getUserProgress() {
        try {
            const progress = localStorage.getItem(this.storageKeys.progress);
            return progress ? JSON.parse(progress) : null;
        } catch (error) {
            console.error('Error getting progress:', error);
            return null;
        }
    }
};

// تصدير الخدمة
window.ImageService = ImageService;