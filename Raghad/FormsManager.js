// forms-manager.js - النسخة النهائية المصححة
const FormsManager = {
  init() {
    this.updateCardLinks();
  },

  getForms() {
    try {
      const forms = JSON.parse(localStorage.getItem("forms") || "[]");
      console.log("📋 عدد النماذج في التخزين:", forms.length);
      return forms;
    } catch (error) {
      console.error("❌ خطأ في قراءة النماذج:", error);
      return [];
    }
  },

  getActiveForms(category) {
    const forms = this.getForms();
    console.log(`🔍 البحث عن نماذج للفئة: "${category}"`);

    const activeForms = forms.filter(
      (f) =>
        f.category === category &&
        f.status === "active" &&
        f.audience === "youth"
    );

    console.log(`✅ وجدنا ${activeForms.length} نموذج نشط للفئة "${category}"`);
    return activeForms;
  },

  updateCardLinks() {
    console.log("🔄 بدء تحديث أزرار البطاقات...");

    const cards = document.querySelectorAll(".learn-card");
    console.log(`🎴 عدد البطاقات الموجودة: ${cards.length}`);

    cards.forEach((card, index) => {
      const h3 = card.querySelector("h3");
      if (!h3) {
        console.warn(`⚠️ بطاقة ${index} بدون عنوان h3`);
        return;
      }

      const category = h3.textContent.trim();
      const activeForms = this.getActiveForms(category);
      const button = card.querySelector(".pill-btn");

      if (!button) {
        console.warn(`⚠️ بطاقة "${category}" بدون زر`);
        return;
      }

      if (activeForms.length > 0) {
        // تحديث الزر ليعمل
        button.href = `all-forms.html?category=${encodeURIComponent(category)}`;
        button.classList.remove("disabled");
        button.innerHTML = `<i class="fas fa-play"></i> ابدأ التعلم (${activeForms.length})`;
        button.onclick = null; // إزالة أي onclick سابق

        console.log(`✅ "${category}": ${activeForms.length} نموذج متاح`);
      } else {
        // تعطيل الزر
        button.href = "#";
        button.onclick = (e) => {
          e.preventDefault();
          alert("لا توجد نماذج نشطة لهذه الفئة حاليًا. حاول مرة أخرى لاحقًا.");
        };
        button.classList.add("disabled");
        button.innerHTML = `<i class="fas fa-clock"></i> قريبًا`;

        console.log(`❌ "${category}": لا توجد نماذج متاحة`);
      }
    });

    console.log("✅ اكتمل تحديث الأزرار");
  },
};

// جعل FormsManager متاحًا عالميًا
window.FormsManager = FormsManager;

// التهيئة التلقائية
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 بدء تهيئة FormsManager...");

  // الانتظار قليلاً لتحميل DOM بالكامل
  setTimeout(() => {
    if (window.FormsManager && typeof FormsManager.init === "function") {
      FormsManager.init();
      console.log("✅ FormsManager تم تهيئته بنجاح");
    } else {
      console.error("❌ FormsManager غير متاح");
    }
  }, 500);
});

console.log("📄 forms-manager.js تم تحميله");
