// adminStorage.js - تخزين وإدارة النماذج للأطفال
const AdminStorage = {
    // مفاتيح التخزين
    KIDS_FORMS_KEY: 'monkeyITKids_forms_kids',
  
    defaultKidsForms: [
        {
            id: 1,
            title: "Programming Basics Challenge",
            description: "A beginner-friendly form that teaches kids the foundations of programming—like sequences, patterns, logic, and simple coding ideas.",
            category: "programming",
            difficulty: 2,
            time: "15-20 min",
            image: "img/programming.png",
            tags: ["Logic Building", "Problem Solving"],
            status: "active",
            audience: "kids",
            createdDate: new Date().toISOString(),
            questions: [
                {
                    id: 1,
                    question: "What is a sequence in programming?",
                    type: "multiple-choice",
                    options: [
                        "A set of instructions in order",
                        "A type of computer",
                        "A programming language",
                        "A game"
                    ],
                    correctAnswer: 0,
                    points: 10,
                    font: "Comic Sans MS",
                    bold: true,
                    italic: false
                }
            ],
            totalPoints: 10
        }
    ],
    
    // تهيئة التخزين
    init: function() {
        if (!localStorage.getItem(this.KIDS_FORMS_KEY)) {
            this.saveKidsForms(this.defaultKidsForms);
        }
    },
    
    // الحصول على جميع نماذج الأطفال
    getKidsForms: function() {
        const forms = localStorage.getItem(this.KIDS_FORMS_KEY);
        return forms ? JSON.parse(forms) : this.defaultKidsForms;
    },
    
    // الحصول على نموذج معين
    getFormById: function(id, audience = "kids") {
        const key = audience === "kids" ? this.KIDS_FORMS_KEY : this.YOUTH_FORMS_KEY;
        const forms = JSON.parse(localStorage.getItem(key)) || [];
        return forms.find(form => form.id == id);
    },
    
    // حفظ نماذج الأطفال
    saveKidsForms: function(forms) {
        localStorage.setItem(this.KIDS_FORMS_KEY, JSON.stringify(forms));
    },
    
    // إضافة نموذج جديد
    addForm: function(form, audience = "kids") {
        const key = audience === "kids" ? this.KIDS_FORMS_KEY : this.YOUTH_FORMS_KEY;
        const forms = JSON.parse(localStorage.getItem(key)) || [];
        
        // توليد ID جديد
        form.id = forms.length > 0 ? Math.max(...forms.map(f => f.id)) + 1 : 1;
        form.createdDate = new Date().toISOString();
        form.audience = audience;
        
        // حساب النقاط الكلية
        form.totalPoints = form.questions.reduce((sum, q) => sum + (q.points || 10), 0);
        
        forms.push(form);
        localStorage.setItem(key, JSON.stringify(forms));
        return form.id;
    },
    
    // تحديث نموذج
    updateForm: function(id, updatedForm, audience = "kids") {
        const key = audience === "kids" ? this.KIDS_FORMS_KEY : this.YOUTH_FORMS_KEY;
        const forms = JSON.parse(localStorage.getItem(key)) || [];
        const index = forms.findIndex(form => form.id == id);
        
        if (index !== -1) {
            updatedForm.id = id;
            updatedForm.totalPoints = updatedForm.questions.reduce((sum, q) => sum + (q.points || 10), 0);
            forms[index] = updatedForm;
            localStorage.setItem(key, JSON.stringify(forms));
            return true;
        }
        return false;
    },
    
    // حذف نموذج
    deleteForm: function(id, audience = "kids") {
        const key = audience === "kids" ? this.KIDS_FORMS_KEY : this.YOUTH_FORMS_KEY;
        const forms = JSON.parse(localStorage.getItem(key)) || [];
        const newForms = forms.filter(form => form.id != id);
        localStorage.setItem(key, JSON.stringify(newForms));
        return true;
    },
    
    // تغيير حالة النموذج
    toggleFormStatus: function(id, audience = "kids") {
        const key = audience === "kids" ? this.KIDS_FORMS_KEY : this.YOUTH_FORMS_KEY;
        const forms = JSON.parse(localStorage.getItem(key)) || [];
        const index = forms.findIndex(form => form.id == id);
        
        if (index !== -1) {
            forms[index].status = forms[index].status === "active" ? "inactive" : "active";
            localStorage.setItem(key, JSON.stringify(forms));
            return forms[index].status;
        }
        return null;
    },
    
    // الحصول على إحصائيات
    getStats: function(audience = "kids") {
        const key = audience === "kids" ? this.KIDS_FORMS_KEY : this.YOUTH_FORMS_KEY;
        const forms = JSON.parse(localStorage.getItem(key)) || [];
        
        return {
            total: forms.length,
            active: forms.filter(f => f.status === "active").length,
            inactive: forms.filter(f => f.status === "inactive").length,
            totalQuestions: forms.reduce((sum, f) => sum + f.questions.length, 0)
        };
    }
};

// تهيئة التخزين
AdminStorage.init();