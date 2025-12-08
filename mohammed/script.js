document.addEventListener('DOMContentLoaded', () => {

  /* ===============================
     HAMBURGER (GLOBAL)
  ================================ */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');

  if (hamburgerBtn && sidebar) {
    hamburgerBtn.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
    });
  }

  

  /* ===============================
     DASHBOARD – STUDENTS TABLE
  ================================ */
  const studentsTable = document.getElementById('studentsTable');
  const totalStudentsEl = document.getElementById('totalStudents');

  if (studentsTable) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    studentsTable.innerHTML = '';

    users.forEach((user, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.id ?? index + 1}</td>
        <td>${user.username}</td>
        <td>${user.age}</td>
        <td>${user.score ?? 0}</td>
      `;
      studentsTable.appendChild(tr);
    });

    if (totalStudentsEl) {
      totalStudentsEl.textContent = users.length;
    }
  }

});

/* ===============================
   GLOBAL FUNCTIONS
================================ */
window.toggleCreate = function () {
  const chooseBox = document.getElementById('chooseBox');
  if (chooseBox) {
    chooseBox.style.display =
      chooseBox.style.display === 'flex' ? 'none' : 'flex';
  }
};

window.goToFormPage = function (page) {
  location.href = page;
};

/* ===============================
   DASHBOARD – ALL FORMS TABLE
================================ */
const allFormsEl = document.getElementById('allForms');

if (allFormsEl) {
  const forms = JSON.parse(localStorage.getItem('forms')) || [];
  allFormsEl.innerHTML = '';

  forms.forEach(form => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${form.title}</td>
      <td>${form.audience}</td>
      <td>${form.questions.length}</td>
      <td>${form.status}</td>
    `;
    allFormsEl.appendChild(tr);
  });
}



/* ===============================
   KIDS FORMS COUNTER
================================ */
function getAndDisplayKidsFormsCount() {
  
    const formsData = localStorage.getItem('monkeyITKids_forms_kids');
    
    if (formsData) {
        try {
            const forms = JSON.parse(formsData);
            if (Array.isArray(forms)) {
                updateCounter(forms.length);
                return;
            }
        } catch (e) {
            console.log('Error parsing forms data:', e);
        }
    }
    
    const defaultForms = [
        {
            id: 1,
            title: 'Programming Basics',
            description: 'Learn programming basics',
            questions: []
        }
    ];
    
    localStorage.setItem('monkeyITKids_forms_kids', JSON.stringify(defaultForms));
    updateCounter(1);
}

function updateCounter(count) {
    const counterElement = document.getElementById('totalKids');
    if (counterElement) {
        counterElement.textContent = count;
        console.log(`Kids Forms Counter Updated: ${count}`);
    }
}


document.addEventListener('DOMContentLoaded', getAndDisplayKidsFormsCount);