// admin-kids.js - إدارة نماذج الأطفال

// ==================== دوال مساعدة عالمية ====================
function showToast(message, type = 'info') {
    // إزالة الـ toast السابقة
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    toast.innerHTML = `
        <i class='bx ${type === 'success' ? 'bx-check-circle' : type === 'error' ? 'bx-error' : 'bx-info-circle'}'></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // إضافة CSS إذا لم تكن موجودة
    if (!document.querySelector('#toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            .admin-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                color: #333;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            }
            .admin-toast.success {
                border-left: 4px solid #4CAF50;
            }
            .admin-toast.error {
                border-left: 4px solid #f44336;
            }
            .admin-toast.info {
                border-left: 4px solid #2196F3;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // إزالة بعد 3 ثواني
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

// جعل الدوال متاحة عالمياً
window.showToast = showToast;

// ==================== التحقق من صحة الأسئلة ====================
function validateQuestions(questions) {
    if (!Array.isArray(questions) || questions.length === 0) {
        showToast('Please add at least one question!', 'error');
        return false;
    }
    
    let isValid = true;
    let errorMessages = [];
    
    questions.forEach((question, index) => {
        // التحقق من نص السؤال
        if (!question.text || question.text.trim() === '') {
            errorMessages.push(`Question ${index + 1}: Missing question text`);
            isValid = false;
        }
        
        // التحقق من النقاط
        if (!question.points || question.points < 1) {
            question.points = 10; // قيمة افتراضية
        }
        
        // التحقق من أنواع الأسئلة المتعددة
        if (question.type === 'multiple-choice' || question.type === 'true-false') {
            if (!question.options || question.options.length < 2) {
                errorMessages.push(`Question ${index + 1}: Need at least 2 options`);
                isValid = false;
            } else {
                // التحقق من وجود إجابة صحيحة واحدة على الأقل
                const hasCorrectAnswer = question.options.some(opt => opt.correct === true);
                if (!hasCorrectAnswer) {
                    errorMessages.push(`Question ${index + 1}: No correct answer selected`);
                    isValid = false;
                }
                
                // التحقق من تسمية الخيارات
                question.options.forEach((option, optIndex) => {
                    if (!option.text || option.text.trim() === '') {
                        errorMessages.push(`Question ${index + 1}, Option ${optIndex + 1}: Missing option text`);
                        isValid = false;
                    }
                });
            }
        }
    });
    
    if (!isValid && errorMessages.length > 0) {
        showToast('Validation errors: ' + errorMessages.join(', '), 'error');
    }
    
    return isValid;
}

// ==================== حفظ النموذج في localStorage ====================
function saveFormToStorage(formData, isEditing = false, currentFormId = null) {
    try {
        const storageKey = 'admin_kids_forms';
        let existingForms = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        if (isEditing && currentFormId) {
            // تحديث نموذج موجود
            const index = existingForms.findIndex(f => f.id == currentFormId);
            if (index !== -1) {
                existingForms[index] = formData;
                showToast('Form updated successfully!', 'success');
            } else {
                existingForms.push(formData);
                showToast('Form created successfully!', 'success');
            }
        } else {
            // إضافة نموذج جديد
            formData.id = Date.now();
            existingForms.push(formData);
            showToast(`Form created successfully! ID: ${formData.id}`, 'success');
        }
        
        // حفظ في localStorage
        localStorage.setItem(storageKey, JSON.stringify(existingForms));
        
        // حفظ نسخة احتياطية للنماذج العامة
        const kidsForms = JSON.parse(localStorage.getItem('monkeyITKids_forms_kids')) || [];
        const existingIndex = kidsForms.findIndex(f => f.id == formData.id);
        if (existingIndex !== -1) {
            kidsForms[existingIndex] = formData;
        } else {
            kidsForms.push(formData);
        }
        localStorage.setItem('monkeyITKids_forms_kids', JSON.stringify(kidsForms));
        
        return formData.id;
    } catch (error) {
        throw new Error('Failed to save form to storage: ' + error.message);
    }
}

// ==================== كود الصفحة الرئيسي ====================
document.addEventListener('DOMContentLoaded', function() {
    // ==================== تهيئة المتغيرات ====================
    let currentFormId = null;
    let questionsTemp = [];
    let isEditing = false;
    
    // ==================== العناصر ====================
    const elements = {
        // العناصر الأساسية
        hamburgerBtn: document.getElementById('hamburgerBtn'),
        sidebar: document.getElementById('sidebar'),
        
        // عناصر الفورم
        formTitle: document.getElementById('formTitle'),
        formDescription: document.getElementById('formDescription'),
        formStatus: document.getElementById('formStatus'),
        formCategory: document.getElementById('formCategory'),
        formDifficulty: document.getElementById('formDifficulty'),
        formTime: document.getElementById('formTime'),
        formImage: document.getElementById('formImage'),
        formTags: document.getElementById('formTags'),
        
        // حاويات الأسئلة
        questionsContainer: document.getElementById('questionsContainer'),
        questionsTableContainer: document.getElementById('questionsTableContainer'),
        
        // الأزرار
        addQuestionBtn: document.getElementById('addQuestionBtn'),
        saveFormBtn: document.getElementById('saveFormBtn'),
        cancelEditBtn: document.getElementById('cancelEditBtn'),
        
        // القوائم
        formsListContainer: document.getElementById('formsListContainer'),
        statsContainer: document.getElementById('statsContainer')
    };
    
    // ==================== إدارة القائمة الجانبية ====================
    if (elements.hamburgerBtn) {
        elements.hamburgerBtn.addEventListener('click', () => {
            elements.sidebar.classList.toggle('hidden');
        });
    }
    
    // ==================== تحميل وإدارة النماذج ====================
    function loadFormsList() {
        if (!elements.formsListContainer) return;
        
        const forms = AdminStorage.getKidsForms();
        elements.formsListContainer.innerHTML = '';
        
        if (forms.length === 0) {
            elements.formsListContainer.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-book-open' style="font-size: 60px; color: #FFD54F;"></i>
                    <h3>No Forms Yet</h3>
                    <p>Create your first learning form for kids!</p>
                </div>
            `;
            return;
        }
        
        const table = document.createElement('table');
        table.className = 'forms-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Questions</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${forms.map(form => `
                    <tr>
                        <td>${form.id}</td>
                        <td>${form.title}</td>
                        <td>${form.category || 'General'}</td>
                        <td>${form.questions.length}</td>
                        <td>
                            <span class="status-${form.status}">
                                ${form.status}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn edit-btn" onclick="editForm(${form.id})">
                                    <i class='bx bx-edit'></i> Edit
                                </button>
                                <button class="action-btn preview-btn" onclick="previewForm(${form.id})">
                                    <i class='bx bx-show'></i> Preview
                                </button>
                                <button class="action-btn delete-btn" onclick="deleteForm(${form.id})">
                                    <i class='bx bx-trash'></i> Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        elements.formsListContainer.appendChild(table);
    }
    
    // ==================== إحصائيات ====================
    function loadStats() {
        if (!elements.statsContainer) return;
        
        const stats = AdminStorage.getStats('kids');
        
        elements.statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total Forms</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.active}</div>
                    <div class="stat-label">Active Forms</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalQuestions}</div>
                    <div class="stat-label">Total Questions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">Kids</div>
                    <div class="stat-label">Audience</div>
                </div>
            </div>
        `;
    }
    
    // ==================== إدارة الأسئلة ====================
    function createQuestionBox(questionData = null) {
        const qIndex = elements.questionsContainer.children.length;
        const qDiv = document.createElement('div');
        qDiv.className = 'question-box';
        
        // بيانات افتراضية للسؤال
        const data = questionData || {
            text: '',
            type: 'multiple-choice',
            required: true,
            font: 'Comic Sans MS',
            bold: true,
            italic: false,
            points: 10,
            options: [
                { text: '', correct: false },
                { text: '', correct: false }
            ]
        };
        
        qDiv.innerHTML = `
            <div class="question-header">
                <h4>Question ${qIndex + 1}</h4>
                <button type="button" class="remove-question-btn" onclick="this.parentElement.parentElement.remove(); updateQuestionsTable()">
                    <i class='bx bx-x'></i>
                </button>
            </div>
            
            <div class="form-row">
                <label>Question Text:</label>
                <input type="text" class="questionText" value="${data.text}" 
                       placeholder="Enter question text" required>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-row">
                    <label>Type:</label>
                    <select class="questionType">
                        <option value="multiple-choice" ${data.type === 'multiple-choice' ? 'selected' : ''}>
                            Multiple Choice
                        </option>
                        <option value="true-false" ${data.type === 'true-false' ? 'selected' : ''}>
                            True/False
                        </option>
                        <option value="text" ${data.type === 'text' ? 'selected' : ''}>
                            Text Answer
                        </option>
                        <option value="matching" ${data.type === 'matching' ? 'selected' : ''}>
                            Matching
                        </option>
                    </select>
                </div>
                
                <div class="form-row">
                    <label>Points:</label>
                    <input type="number" class="questionPoints" value="${data.points || 10}" min="1" max="100">
                </div>
            </div>
            
            <div class="question-format-row">
                <div class="question-format-card">
                    <div class="format-block">
                        <label class="format-title">Font:</label>
                        <select class="questionFont">
                            <option value="Comic Sans MS" ${data.font === 'Comic Sans MS' ? 'selected' : ''}>Comic Sans MS</option>
                            <option value="Arial" ${data.font === 'Arial' ? 'selected' : ''}>Arial</option>
                            <option value="Tahoma" ${data.font === 'Tahoma' ? 'selected' : ''}>Tahoma</option>
                            <option value="Courier New" ${data.font === 'Courier New' ? 'selected' : ''}>Courier New</option>
                        </select>
                    </div>
                    
                    <div class="format-block">
                        <label class="format-title">Formatting:</label>
                        <div class="format-options">
                            <label><input type="checkbox" class="questionBold" ${data.bold ? 'checked' : ''}> Bold</label>
                            <label><input type="checkbox" class="questionItalic" ${data.italic ? 'checked' : ''}> Italic</label>
                        </div>
                    </div>
                    
                    <div class="format-block">
                        <label class="format-title">Required:</label>
                        <input type="checkbox" class="questionRequired" ${data.required ? 'checked' : ''}>
                    </div>
                </div>
            </div>
            
            <div class="answersContainer" style="margin-top: 15px;">
                ${data.type !== 'text' ? 
                    data.options.map((option, optIndex) => `
                        <div class="answer-item">
                            <input type="text" class="answerText" value="${option.text}" 
                                   placeholder="Option ${optIndex + 1}" required>
                            ${data.type === 'multiple-choice' ? 
                                `<label style="display: flex; align-items: center; gap: 5px;">
                                    <input type="radio" name="correctAnswer${qIndex}" 
                                           class="answerCorrect" ${option.correct ? 'checked' : ''}>
                                    Correct
                                </label>` : 
                                data.type === 'true-false' ?
                                `<select class="answerCorrectTF">
                                    <option value="true" ${option.correct ? 'selected' : ''}>True</option>
                                    <option value="false" ${!option.correct ? 'selected' : ''}>False</option>
                                </select>` : ''
                            }
                            <button type="button" class="removeAnswerBtn" onclick="this.parentElement.remove()">
                                <i class='bx bx-trash'></i>
                            </button>
                        </div>
                    `).join('') : 
                    '<div class="answer-item"><em>Text answer - no options needed</em></div>'
                }
            </div>
            
            ${data.type !== 'text' ? `
                <button type="button" class="btn addAnswerBtn" onclick="addAnswerOption(this)">
                    <i class='bx bx-plus'></i> Add Option
                </button>
            ` : ''}
            
            <button type="button" class="btn saveQuestionBtn" onclick="saveQuestionToTemp(this)">
                <i class='bx bx-save'></i> Save Question
            </button>
        `;
        
        elements.questionsContainer.appendChild(qDiv);
        
        // إضافة event listener للنوع
        const typeSelect = qDiv.querySelector('.questionType');
        typeSelect.addEventListener('change', function() {
            updateQuestionType(this);
        });
    }
    
    // ==================== حفظ الأسئلة مؤقتًا ====================
    window.saveQuestionToTemp = function(button) {
        const qDiv = button.closest('.question-box');
        const qIndex = Array.from(elements.questionsContainer.children).indexOf(qDiv);
        
        if (qIndex === -1) {
            showToast('Cannot find question!', 'error');
            return;
        }
        
        // جمع بيانات السؤال
        const questionData = {
            text: qDiv.querySelector('.questionText').value.trim(),
            type: qDiv.querySelector('.questionType').value,
            points: parseInt(qDiv.querySelector('.questionPoints').value) || 10,
            font: qDiv.querySelector('.questionFont').value,
            bold: qDiv.querySelector('.questionBold').checked,
            italic: qDiv.querySelector('.questionItalic').checked,
            required: qDiv.querySelector('.questionRequired').checked,
            options: []
        };
        
        // التحقق من نص السؤال
        if (!questionData.text) {
            showToast('Please enter question text!', 'error');
            qDiv.querySelector('.questionText').focus();
            return;
        }
        
        // جمع الخيارات
        if (questionData.type !== 'text') {
            let hasValidOptions = false;
            
            qDiv.querySelectorAll('.answer-item').forEach((item, optIndex) => {
                const optionText = item.querySelector('.answerText')?.value.trim();
                
                // تخطي الخيارات الفارغة
                if (!optionText) return;
                
                hasValidOptions = true;
                
                let correct = false;
                if (questionData.type === 'multiple-choice') {
                    correct = item.querySelector('.answerCorrect')?.checked || false;
                } else if (questionData.type === 'true-false') {
                    const tfSelect = item.querySelector('.answerCorrectTF');
                    correct = tfSelect ? tfSelect.value === 'true' : false;
                }
                
                questionData.options.push({
                    text: optionText,
                    correct: Boolean(correct)
                });
            });
            
            // التحقق من وجود خيارات صالحة
            if (!hasValidOptions) {
                showToast('Please add at least one valid option!', 'error');
                return;
            }
            
            // لأسئلة الاختيار المتعدد: التأكد من وجود إجابة صحيحة واحدة على الأقل
            if (questionData.type === 'multiple-choice') {
                const hasCorrect = questionData.options.some(opt => opt.correct === true);
                if (!hasCorrect && questionData.options.length > 0) {
                    // جعل أول خيار صحيح افتراضياً
                    questionData.options[0].correct = true;
                    showToast('First option marked as correct by default', 'info');
                }
            }
        }
        
        // حفظ أو تحديث في المصفوفة المؤقتة
        if (questionsTemp[qIndex]) {
            questionsTemp[qIndex] = questionData;
            showToast('Question updated!', 'success');
        } else {
            questionsTemp.push(questionData);
            showToast('Question saved!', 'success');
        }
        
        // تحديث الجدول
        updateQuestionsTable();
    };
    
    // ==================== تحديث جدول الأسئلة ====================
    function updateQuestionsTable() {
        if (!elements.questionsTableContainer) return;
        
        if (questionsTemp.length === 0) {
            elements.questionsTableContainer.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-question-mark' style="font-size: 40px; color: #999;"></i>
                    <p>No questions saved yet</p>
                    <p class="hint">Click "Save Question" in each question box to save it</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <h4>📋 Questions Preview (${questionsTemp.length} questions)</h4>
            <div class="questions-summary">
                <div class="summary-stats">
                    <span>✅ Valid: ${questionsTemp.filter(q => validateSingleQuestion(q)).length}</span>
                    <span>⚠️ Issues: ${questionsTemp.filter(q => !validateSingleQuestion(q)).length}</span>
                    <span>🎯 Points: ${questionsTemp.reduce((sum, q) => sum + (q.points || 10), 0)}</span>
                </div>
            </div>
            <div class="questions-preview-list">
        `;
        
        questionsTemp.forEach((q, i) => {
            const isValid = validateSingleQuestion(q);
            html += `
                <div class="preview-question-item ${isValid ? 'valid' : 'invalid'}">
                    <div class="preview-question-header">
                        <div>
                            <strong>Q${i + 1}:</strong> ${q.text.substring(0, 50)}${q.text.length > 50 ? '...' : ''}
                            ${!isValid ? '<span class="warning-badge">⚠️</span>' : ''}
                        </div>
                        <span class="preview-question-meta">
                            ${q.type} | ${q.points} points
                        </span>
                    </div>
                    ${q.options && q.options.length > 0 ? `
                        <div class="preview-options">
                            ${q.options.map((opt, optIndex) => `
                                <div class="preview-option ${opt.correct ? 'correct' : ''}">
                                    ${String.fromCharCode(65 + optIndex)}. ${opt.text}
                                    ${opt.correct ? ' <span class="correct-mark">✓ Correct</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="question-status">
                        ${isValid ? 
                            '<span class="status-valid">✅ Valid</span>' : 
                            '<span class="status-invalid">⚠️ Check question details</span>'
                        }
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        elements.questionsTableContainer.innerHTML = html;
    }
    
    function validateSingleQuestion(question) {
        if (!question.text || question.text.trim() === '') return false;
        
        if (question.type === 'multiple-choice' || question.type === 'true-false') {
            if (!question.options || question.options.length < 2) return false;
            
            const hasValidOptions = question.options.every(opt => opt.text && opt.text.trim() !== '');
            const hasCorrectAnswer = question.options.some(opt => opt.correct === true);
            
            return hasValidOptions && hasCorrectAnswer;
        }
        
        return true;
    }
    
    // ==================== إضافة خيار جديد ====================
    window.addAnswerOption = function(button) {
        const qDiv = button.closest('.question-box');
        const answersContainer = qDiv.querySelector('.answersContainer');
        const qIndex = Array.from(elements.questionsContainer.children).indexOf(qDiv);
        const type = qDiv.querySelector('.questionType').value;
        
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer-item';
        
        if (type === 'multiple-choice') {
            answerDiv.innerHTML = `
                <input type="text" class="answerText" placeholder="New option" required>
                <label style="display: flex; align-items: center; gap: 5px;">
                    <input type="radio" name="correctAnswer${qIndex}" class="answerCorrect">
                    Correct
                </label>
                <button type="button" class="removeAnswerBtn" onclick="this.parentElement.remove()">
                    <i class='bx bx-trash'></i>
                </button>
            `;
        } else if (type === 'true-false') {
            answerDiv.innerHTML = `
                <input type="text" class="answerText" value="${type === 'true-false' ? 'True/False' : 'Option'}" readonly>
                <select class="answerCorrectTF">
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
                <button type="button" class="removeAnswerBtn" onclick="this.parentElement.remove()">
                    <i class='bx bx-trash'></i>
                </button>
            `;
        }
        
        answersContainer.appendChild(answerDiv);
    };
    
    // ==================== تحديث نوع السؤال ====================
    window.updateQuestionType = function(select) {
        const qDiv = select.closest('.question-box');
        const answersContainer = qDiv.querySelector('.answersContainer');
        const addBtn = qDiv.querySelector('.addAnswerBtn');
        const type = select.value;
        
        // تحديث حاوية الخيارات
        answersContainer.innerHTML = '';
        
        if (type === 'text') {
            answersContainer.innerHTML = '<div class="answer-item"><em>Text answer - no options needed</em></div>';
            if (addBtn) addBtn.style.display = 'none';
        } else {
            if (addBtn) addBtn.style.display = 'inline-block';
            
            // إضافة خيارات افتراضية حسب النوع
            const defaultOptions = type === 'true-false' 
                ? ['True', 'False'] 
                : ['Option 1', 'Option 2'];
            
            defaultOptions.forEach((opt, index) => {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer-item';
                
                if (type === 'multiple-choice') {
                    answerDiv.innerHTML = `
                        <input type="text" class="answerText" value="${opt}" required>
                        <label style="display: flex; align-items: center; gap: 5px;">
                            <input type="radio" name="correctAnswer${Array.from(elements.questionsContainer.children).indexOf(qDiv)}" 
                                   class="answerCorrect" ${index === 0 ? 'checked' : ''}>
                            Correct
                        </label>
                        <button type="button" class="removeAnswerBtn" onclick="this.parentElement.remove()">
                            <i class='bx bx-trash'></i>
                        </button>
                    `;
                } else if (type === 'true-false') {
                    answerDiv.innerHTML = `
                        <input type="text" class="answerText" value="${opt}" readonly>
                        <select class="answerCorrectTF">
                            <option value="true" ${opt === 'True' ? 'selected' : ''}>True</option>
                            <option value="false" ${opt === 'False' ? 'selected' : ''}>False</option>
                        </select>
                        <button type="button" class="removeAnswerBtn" onclick="this.parentElement.remove()">
                            <i class='bx bx-trash'></i>
                        </button>
                    `;
                }
                
                answersContainer.appendChild(answerDiv);
            });
        }
    };
    
    // ==================== حفظ النموذج النهائي ====================
    if (elements.saveFormBtn) {
        elements.saveFormBtn.addEventListener('click', function() {
            // التحقق من البيانات الأساسية
            if (!elements.formTitle.value.trim()) {
                showToast('Please enter form title!', 'error');
                elements.formTitle.focus();
                return;
            }
            
            if (questionsTemp.length === 0) {
                showToast('Please add at least one question!', 'error');
                return;
            }
            
            // التحقق من صحة الأسئلة
            if (!validateQuestions(questionsTemp)) {
                return;
            }
            
            // تنظيف وتنسيق بيانات الأسئلة
            const cleanedQuestions = questionsTemp.map((q, index) => {
                // التأكد من أن كل خيار له خاصية correct
                if (q.options) {
                    q.options = q.options.map((opt, optIndex) => ({
                        text: opt.text || `Option ${optIndex + 1}`,
                        correct: Boolean(opt.correct) || (optIndex === 0 && q.type === 'multiple-choice')
                    }));
                }
                
                return {
                    id: Date.now() + index,
                    question: q.text,
                    text: q.text,
                    type: q.type,
                    points: q.points || 10,
                    font: q.font || 'Comic Sans MS',
                    bold: Boolean(q.bold),
                    italic: Boolean(q.italic),
                    required: q.required !== false,
                    options: q.options || []
                };
            });
            
            // جمع بيانات النموذج
            const formData = {
                id: currentFormId || Date.now(),
                title: elements.formTitle.value.trim(),
                description: elements.formDescription.value.trim(),
                status: elements.formStatus.value,
                category: elements.formCategory?.value || 'programming',
                difficulty: elements.formDifficulty ? parseInt(elements.formDifficulty.value) : 2,
                time: elements.formTime?.value || '10-15 min',
                image: elements.formImage?.value || 'img/basic.png',
                tags: elements.formTags?.value.split(',').map(t => t.trim()).filter(t => t) || [],
                questions: cleanedQuestions,
                audience: 'kids',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            try {
                // الحفظ في localStorage مباشرة
                saveFormToStorage(formData, isEditing, currentFormId);
                
                // إعادة التعيين
                resetForm();
                
                // تحديث القوائم
                loadFormsList();
                loadStats();
                
            } catch (error) {
                console.error('Error saving form:', error);
                showToast('Error saving form: ' + error.message, 'error');
            }
        });
    }
    
    // ==================== وظائف التحكم ====================
    window.editForm = function(formId) {
        // جلب النموذج من localStorage مباشرة
        const storageKey = 'admin_kids_forms';
        const forms = JSON.parse(localStorage.getItem(storageKey)) || [];
        const form = forms.find(f => f.id == formId);
        
        if (!form) {
            showToast('Form not found!', 'error');
            return;
        }
        
        // تعبئة الحقول
        elements.formTitle.value = form.title || '';
        elements.formDescription.value = form.description || '';
        elements.formStatus.value = form.status || 'active';
        if (elements.formCategory) elements.formCategory.value = form.category || 'programming';
        if (elements.formDifficulty) elements.formDifficulty.value = form.difficulty || 2;
        if (elements.formTime) elements.formTime.value = form.time || '10-15 min';
        if (elements.formImage) elements.formImage.value = form.image || '';
        if (elements.formTags) elements.formTags.value = form.tags?.join(', ') || '';
        
        // مسح الأسئلة الحالية
        elements.questionsContainer.innerHTML = '';
        questionsTemp = [];
        
        // إضافة الأسئلة
        form.questions.forEach(q => {
            createQuestionBox({
                text: q.text || q.question || '',
                type: q.type || 'multiple-choice',
                points: q.points || 10,
                font: q.font || 'Comic Sans MS',
                bold: q.bold || false,
                italic: q.italic || false,
                required: q.required !== false,
                options: q.options || []
            });
            
            // حفظ في المصفوفة المؤقتة
            questionsTemp.push({
                text: q.text || q.question,
                type: q.type,
                points: q.points || 10,
                font: q.font || 'Comic Sans MS',
                bold: q.bold || false,
                italic: q.italic || false,
                required: q.required !== false,
                options: q.options || []
            });
        });
        
        // تحديث الواجهة
        updateQuestionsTable();
        currentFormId = formId;
        isEditing = true;
        
        // تغيير نص الزر
        elements.saveFormBtn.innerHTML = '<i class=\'bx bx-save\'></i> Update Form';
        if (elements.cancelEditBtn) elements.cancelEditBtn.style.display = 'inline-block';
        
        // التمرير للأعلى
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        showToast(`Editing form: ${form.title}`, 'info');
    };
    
    window.deleteForm = function(formId) {
        if (!confirm('Are you sure you want to delete this form?')) return;
        
        AdminStorage.deleteForm(formId, 'kids');
        showToast('Form deleted successfully!', 'success');
        
        loadFormsList();
        loadStats();
    };
    
    window.previewForm = function(formId) {
        const form = AdminStorage.getFormById(formId, 'kids');
        if (!form) return;
        
        // إنشاء نافذة معاينة
        const previewHTML = `
            <div class="form-preview-modal" id="previewModal">
                <div class="preview-content">
                    <div class="preview-header">
                        <h3>${form.title}</h3>
                        <button onclick="document.getElementById('previewModal').style.display='none'">
                            <i class='bx bx-x'></i>
                        </button>
                    </div>
                    <p>${form.description}</p>
                    <div class="preview-meta">
                        <span>⏱️ ${form.time}</span>
                        <span>⭐ Difficulty: ${form.difficulty || 2}/5</span>
                        <span>📊 ${form.questions.length} questions</span>
                    </div>
                    <div class="preview-questions">
                        ${form.questions.map((q, i) => `
                            <div class="preview-question">
                                <h4>Q${i + 1}: ${q.question || q.text}</h4>
                                <p>Type: ${q.type} | Points: ${q.points || 10}</p>
                                ${q.options && q.options.length > 0 ? `
                                    <ul class="preview-options">
                                        ${q.options.map((opt, optIndex) => `
                                            <li class="${opt.correct ? 'correct' : ''}">
                                                ${String.fromCharCode(65 + optIndex)}. ${opt.text}
                                                ${opt.correct ? ' (Correct)' : ''}
                                            </li>
                                        `).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // إضافة النافذة إلى الجسم
        const previewDiv = document.createElement('div');
        previewDiv.innerHTML = previewHTML;
        document.body.appendChild(previewDiv);
        
        // عرض النافذة
        document.getElementById('previewModal').style.display = 'flex';
    };
    
    // ==================== إعادة تعيين النموذج ====================
    function resetForm() {
        elements.formTitle.value = '';
        elements.formDescription.value = '';
        elements.formStatus.value = 'active';
        if (elements.formCategory) elements.formCategory.value = 'programming';
        if (elements.formDifficulty) elements.formDifficulty.value = 2;
        if (elements.formTime) elements.formTime.value = '10-15 min';
        if (elements.formImage) elements.formImage.value = '';
        if (elements.formTags) elements.formTags.value = '';
        
        elements.questionsContainer.innerHTML = '';
        questionsTemp = [];
        updateQuestionsTable();
        
        currentFormId = null;
        isEditing = false;
        elements.saveFormBtn.innerHTML = '<i class=\'bx bx-save\'></i> Save Form';
        if (elements.cancelEditBtn) elements.cancelEditBtn.style.display = 'none';
    }
    
    // ==================== تهيئة الصفحة ====================
    function initPage() {
        // تحميل النماذج والإحصائيات
        loadFormsList();
        loadStats();
        
        // إضافة event listener لزر إضافة سؤال
        if (elements.addQuestionBtn) {
            elements.addQuestionBtn.addEventListener('click', () => createQuestionBox());
        }
        
        // إضافة event listener لزر إلغاء التعديل
        if (elements.cancelEditBtn) {
            elements.cancelEditBtn.addEventListener('click', resetForm);
        }
        
        // إضافة زر العودة إذا لم يكن موجود
        if (!document.querySelector('.back-to-list')) {
            const backBtn = document.createElement('button');
            backBtn.className = 'btn back-to-list';
            backBtn.innerHTML = '<i class=\'bx bx-arrow-back\'></i> Back to Forms List';
            backBtn.style.marginRight = '10px';
            backBtn.onclick = () => {
                resetForm();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            
            if (elements.saveFormBtn && elements.saveFormBtn.parentNode) {
                elements.saveFormBtn.parentNode.insertBefore(backBtn, elements.saveFormBtn);
            }
        }
    }
    
    // بدء التشغيل
    initPage();
    
    // جعل الدوال متاحة عالمياً
    window.AdminStorage = AdminStorage;
});