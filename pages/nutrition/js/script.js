// =========================================
// NUTRITION CAROUSEL — 3D
// =========================================

document.addEventListener('DOMContentLoaded', () => {

  const track =
    document.querySelector('.carousel-track');

  const panels =
    document.querySelectorAll('.nutrition-panel');

  const buttonLeft =
    document.querySelector('.carousel-button-left');

  const buttonRight =
    document.querySelector('.carousel-button-right');


  if (!track || panels.length !== 4) {

    console.error(
      'Carousel Nutrition: painéis não encontrados.'
    );

    return;

  }


  // =========================================
  // POSIÇÕES DOS PAINÉIS
  // =========================================

  const positions = {

    front: {

      transform:
        'translate(-50%, -50%) translateZ(180px) scale(1)',

      zIndex: 4,

      opacity: 1,

      filter: 'brightness(1)'

    },


    left: {

      transform:
        'translate(-50%, -50%) translateX(-270px) rotateY(55deg) scale(0.88)',

      zIndex: 3,

      opacity: 0.75,

      filter: 'brightness(0.75)'

    },


    back: {

      transform:
        'translate(-50%, -50%) translateZ(-180px) scale(0.82)',

      zIndex: 1,

      opacity: 0.25,

      filter: 'brightness(0.45)'

    },


    right: {

      transform:
        'translate(-50%, -50%) translateX(270px) rotateY(-55deg) scale(0.88)',

      zIndex: 3,

      opacity: 0.75,

      filter: 'brightness(0.75)'

    }

  };


  // =========================================
  // ORDEM ATUAL
  // =========================================

  let order = [3, 4, 1, 2];


  // =========================================
  // APLICAR POSIÇÕES
  // =========================================

  function updateCarousel() {

    const positionNames = [

      'front',
      'left',
      'back',
      'right'

    ];


    panels.forEach((panel, index) => {

      const panelNumber =
        index + 1;


      const positionIndex =
        order.indexOf(panelNumber);


      const position =
        positionNames[positionIndex];


      const settings =
        positions[position];


      panel.style.transform =
        settings.transform;


      panel.style.zIndex =
        settings.zIndex;


      panel.style.opacity =
        settings.opacity;


      panel.style.filter =
        settings.filter;

    });

  }


  // =========================================
  // GIRAR PARA A ESQUERDA
  // =========================================

  function rotateLeft() {

    order = [order[3], order[0], order[1], order[2]];


    updateCarousel();

  }


  // =========================================
  // GIRAR PARA A DIREITA
  // =========================================

  function rotateRight() {

    order = [order[1], order[2], order[3], order[0]];


    updateCarousel();

  }


  // =========================================
  // BOTÃO ESQUERDO
  // =========================================

  if (buttonLeft) {

    buttonLeft.addEventListener(
      'click',
      () => {

        rotateRight();

      }
    );

  }


  // =========================================
  // BOTÃO DIREITO
  // =========================================

  if (buttonRight) {

    buttonRight.addEventListener(
      'click',
      () => {

        rotateLeft();

      }
    );

  }


  // =========================================
  // DRAG
  // =========================================

  let isDragging = false;

  let startX = 0;

  let currentX = 0;

  let dragDistance = 0;


  const DRAG_THRESHOLD = 80;


  // =========================================
  // MOUSE DOWN
  // =========================================

  track.addEventListener(
    'mousedown',
    (event) => {

      isDragging = true;

      startX =
        event.clientX;

      currentX =
        event.clientX;

      dragDistance = 0;

      track.style.cursor =
        'grabbing';

    }
  );


  // =========================================
  // MOUSE MOVE
  // =========================================

  document.addEventListener(
    'mousemove',
    (event) => {

      if (!isDragging) {

        return;

      }


      currentX =
        event.clientX;


      dragDistance =
        currentX - startX;

    }
  );


  // =========================================
  // MOUSE UP
  // =========================================

  document.addEventListener(
    'mouseup',
    () => {

      if (!isDragging) {

        return;

      }


      isDragging = false;

      track.style.cursor =
        'grab';


      if (
        Math.abs(dragDistance) <
        DRAG_THRESHOLD
      ) {

        return;

      }


      if (dragDistance < 0) {

        rotateLeft();

      } else {

        rotateRight();

      }

    }
  );


  // =========================================
  // TOUCH START
  // =========================================

  track.addEventListener(
    'touchstart',
    (event) => {

      startX =
        event.touches[0].clientX;

      currentX =
        startX;

      dragDistance = 0;

    },
    {
      passive: true
    }
  );


  // =========================================
  // TOUCH MOVE
  // =========================================

  track.addEventListener(
    'touchmove',
    (event) => {

      currentX =
        event.touches[0].clientX;


      dragDistance =
        currentX - startX;

    },
    {
      passive: true
    }
  );


  // =========================================
  // TOUCH END
  // =========================================

  track.addEventListener(
    'touchend',
    () => {

      if (
        Math.abs(dragDistance) <
        DRAG_THRESHOLD
      ) {

        return;

      }


      if (dragDistance < 0) {

        rotateLeft();

      } else {

        rotateRight();

      }

    }
  );


  // =========================================
  // CURSOR
  // =========================================

  track.style.cursor =
    'grab';


  // =========================================
  // INICIALIZAR CARROSSEL
  // =========================================

  updateCarousel();

});



// =========================================
// CALENDÁRIO DE NUTRIÇÃO
// =========================================

const nutritionMealsByDate = new Map();
let selectedNutritionDate = null;

function getUserStorageSlug() {
  return window.UserStorage.getCurrentUserSlug();
}

function getNutritionStorageKey() {
  return window.UserStorage.getUserStorageKey('nutrition_session_data');
}

function loadNutritionSessionState() {
  return window.UserStorage.readUserData('nutrition_session_data', {});
}

function persistNutritionSessionState() {
  const payload = {
    selectedDate: selectedNutritionDate,
    goals: nutritionGoals,
    meals: [...nutritionMealsByDate.entries()].map(([dateKey, meals]) => [dateKey, meals])
  };

  window.UserStorage.saveUserData('nutrition_session_data', payload);
}

function hydrateNutritionSessionState() {
  const saved = loadNutritionSessionState();

  if (saved.meals && Array.isArray(saved.meals)) {
    nutritionMealsByDate.clear();
    saved.meals.forEach(([dateKey, meals]) => {
      if (dateKey && Array.isArray(meals)) {
        nutritionMealsByDate.set(dateKey, meals);
      }
    });
  }

  if (saved.goals) {
    nutritionGoals = saved.goals;
  }

  if (saved.selectedDate) {
    selectedNutritionDate = saved.selectedDate;
  }
}

function getNutritionTodayKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function escapeNutritionHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));
}

let nutritionGoals = null;

function renderGoalsCard() {
  const content = document.querySelector('#goalsContent');
  if (!content) return;

  if (!nutritionGoals) {
    content.innerHTML = `
      <button class="goals-add-button" id="goalsAddButton" type="button">
        <span class="goals-add-icon">+</span>
        <span>Add Your Goals</span>
      </button>
    `;

    content.querySelector('#goalsAddButton').addEventListener('click', () => {
      renderGoalsForm();
    });
    return;
  }

  content.innerHTML = `
    <div class="goals-list">
      <div class="goal"><span>Calories</span><strong>${nutritionGoals.calories} kcal</strong></div>
      <div class="goal"><span>Protein</span><strong>${nutritionGoals.protein} g</strong></div>
      <div class="goal"><span>Carbohydrates</span><strong>${nutritionGoals.carbs} g</strong></div>
      <div class="goal"><span>Total Fat</span><strong>${nutritionGoals.fat} g</strong></div>
    </div>
    <div class="goals-actions">
      <button class="goals-edit-button" id="goalsEditButton" type="button">Edit</button>
      <button class="goals-delete-button" id="goalsDeleteButton" type="button">Delete</button>
    </div>
  `;

  content.querySelector('#goalsEditButton').addEventListener('click', renderGoalsForm);
  content.querySelector('#goalsDeleteButton').addEventListener('click', () => {
    if (window.confirm('Delete your goals?')) {
      nutritionGoals = null;
      persistNutritionSessionState();
      renderGoalsCard();
    }
  });
}

function renderGoalsForm() {
  const content = document.querySelector('#goalsContent');
  if (!content) return;

  const goal = nutritionGoals || { calories: '', protein: '', carbs: '', fat: '' };
  content.innerHTML = `
    <form class="goals-form" id="goalsForm">
      <div class="goals-field">
        <label for="goalCalories">Calories (kcal)</label>
        <input id="goalCalories" type="number" min="0" value="${goal.calories}" required>
      </div>
      <div class="goals-field">
        <label for="goalProtein">Protein (g)</label>
        <input id="goalProtein" type="number" min="0" value="${goal.protein}" required>
      </div>
      <div class="goals-field">
        <label for="goalCarbs">Carbohydrates (g)</label>
        <input id="goalCarbs" type="number" min="0" value="${goal.carbs}" required>
      </div>
      <div class="goals-field">
        <label for="goalFat">Total Fat (g)</label>
        <input id="goalFat" type="number" min="0" value="${goal.fat}" required>
      </div>
      <div class="goals-actions">
        <button class="goals-save-button" type="submit">Save</button>
      </div>
    </form>
  `;

  content.querySelector('#goalsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = Array.from(content.querySelectorAll('input'));
    const valid = fields.every((field) => /^\d+(\.\d+)?$/.test(field.value.trim()));

    if (!valid) {
      fields.forEach((field) => {
        field.classList.toggle('goals-field-invalid', !/^\d+(\.\d+)?$/.test(field.value.trim()));
      });
      return;
    }

    nutritionGoals = {
      calories: fields[0].value,
      protein: fields[1].value,
      carbs: fields[2].value,
      fat: fields[3].value
    };

    persistNutritionSessionState();
    renderGoalsCard();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  hydrateNutritionSessionState();
  renderGoalsCard();
});

function updateMealPlan() {
  const list = document.querySelector('#mealPlanList');
  if (!list) return;

  const meals = nutritionMealsByDate.get(getNutritionTodayKey()) || [];

  if (!meals.length) {
    list.innerHTML = '<div class="meal-plan-empty">No meals added today</div>';
    return;
  }

  const mealTypes = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack'
  };

  list.innerHTML = meals.map((meal) => `
    <div class="meal-plan-entry">
      <div class="meal-plan-entry-info">
        <span class="meal-plan-entry-name">${escapeNutritionHtml(meal.mealName)}</span>
        <span class="meal-plan-entry-type">
          ${escapeNutritionHtml(mealTypes[meal.mealType] || meal.mealType)} · ${escapeNutritionHtml(meal.mealTime)}
        </span>
      </div>
      <strong class="meal-plan-entry-calories">
        ${escapeNutritionHtml(meal.calories)} kcal
      </strong>
    </div>
  `).join('');
}

function updateDailyOverview() {
  const chart = document.querySelector('#dailyOverviewChart');
  const caloriesLabel = document.querySelector('#dailyOverviewCalories');
  const proteinLabel = document.querySelector('#dailyOverviewProtein');
  const carbsLabel = document.querySelector('#dailyOverviewCarbs');
  const fatLabel = document.querySelector('#dailyOverviewFat');

  if (!chart) return;

  const meals = nutritionMealsByDate.get(getNutritionTodayKey()) || [];
  const totals = meals.reduce((total, meal) => ({
    calories: total.calories + Number(meal.calories || 0),
    protein: total.protein + Number(meal.protein || 0),
    carbs: total.carbs + Number(meal.carbs || 0),
    fat: total.fat + Number(meal.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const proteinCalories = totals.protein * 4;
  const carbsCalories = totals.carbs * 4;
  const fatCalories = totals.fat * 9;
  const macroCalories = proteinCalories + carbsCalories + fatCalories;
  const proteinAngle = macroCalories ? proteinCalories / macroCalories * 360 : 0;
  const carbsAngle = macroCalories ? proteinAngle + carbsCalories / macroCalories * 360 : 0;
  const fatAngle = macroCalories ? carbsAngle + fatCalories / macroCalories * 360 : 0;

  chart.style.setProperty('--protein-angle', `${proteinAngle}deg`);
  chart.style.setProperty('--carbs-angle', `${carbsAngle}deg`);
  chart.style.setProperty('--fat-angle', `${fatAngle}deg`);

  if (caloriesLabel) caloriesLabel.textContent = totals.calories.toLocaleString('en-US');
  if (proteinLabel) proteinLabel.textContent = `${totals.protein} g`;
  if (carbsLabel) carbsLabel.textContent = `${totals.carbs} g`;
  if (fatLabel) fatLabel.textContent = `${totals.fat} g`;
}

function updateLastSevenDaysOverview() {
  const chart = document.querySelector('#lastSevenDaysChart');
  const caloriesLabel = document.querySelector('#lastSevenDaysCalories');
  const proteinLabel = document.querySelector('#lastSevenDaysProtein');
  const carbsLabel = document.querySelector('#lastSevenDaysCarbs');
  const fatLabel = document.querySelector('#lastSevenDaysFat');

  if (!chart) return;

  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');

    (nutritionMealsByDate.get(dateKey) || []).forEach((meal) => {
      totals.calories += Number(meal.calories || 0);
      totals.protein += Number(meal.protein || 0);
      totals.carbs += Number(meal.carbs || 0);
      totals.fat += Number(meal.fat || 0);
    });
  }

  const proteinCalories = totals.protein * 4;
  const carbsCalories = totals.carbs * 4;
  const fatCalories = totals.fat * 9;
  const macroCalories = proteinCalories + carbsCalories + fatCalories;
  const proteinAngle = macroCalories ? proteinCalories / macroCalories * 360 : 0;
  const carbsAngle = macroCalories ? proteinAngle + carbsCalories / macroCalories * 360 : 0;
  const fatAngle = macroCalories ? carbsAngle + fatCalories / macroCalories * 360 : 0;

  chart.style.setProperty('--protein-angle', `${proteinAngle}deg`);
  chart.style.setProperty('--carbs-angle', `${carbsAngle}deg`);
  chart.style.setProperty('--fat-angle', `${fatAngle}deg`);

  if (caloriesLabel) caloriesLabel.textContent = totals.calories.toLocaleString('en-US');
  if (proteinLabel) proteinLabel.textContent = `${totals.protein} g`;
  if (carbsLabel) carbsLabel.textContent = `${totals.carbs} g`;
  if (fatLabel) fatLabel.textContent = `${totals.fat} g`;
}

document.addEventListener('DOMContentLoaded', () => {

  const calendar =
    document.querySelector('#nutritionCalendar');

  const monthTitle =
    document.querySelector('#nutritionCalendarMonthTitle');

  const prevButton =
    document.querySelector('.nutrition-calendar-nav-left');

  const nextButton =
    document.querySelector('.nutrition-calendar-nav-right');

  if (!calendar || !monthTitle || !prevButton || !nextButton) {
    return;
  }

  const dayCells =
    Array.from(calendar.querySelectorAll('.calendar-day'));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mondayBase = new Date(today);
  const todayWeekday = (today.getDay() + 6) % 7;
  mondayBase.setDate(today.getDate() - todayWeekday);

  let weekOffset = 0;
  let selectedDate = toDateKey(today);
  selectedNutritionDate = selectedDate;

  const MIN_WEEK_OFFSET = -4;
  const MAX_WEEK_OFFSET = 0;

  function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function applyStateClasses(cell, date, dateKey) {
    cell.classList.remove('active', 'selected', 'past', 'completed');

    if (date < today) {
      cell.classList.add('past');
    }

    if (dateKey === toDateKey(today)) {
      cell.classList.add('active');
    }

    if (dateKey === selectedDate) {
      cell.classList.add('selected');
    }

    if (nutritionMealsByDate.has(dateKey)) {
      cell.classList.add('completed');
    }
  }

  function renderCalendarWeek() {
    const monday = new Date(mondayBase);
    monday.setDate(mondayBase.getDate() + (weekOffset * 7));

    dayCells.forEach((cell, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const dateKey = toDateKey(date);
      cell.dataset.date = dateKey;

      const dayNumber = cell.querySelector('.day-number');
      if (dayNumber) {
        dayNumber.textContent = date.getDate();
      }

      const dayName = cell.querySelector('.day-name');
      if (dayName) {
        dayName.textContent = date.toLocaleDateString('en-US', { weekday: 'short' });
      }

      const oldToday = cell.querySelector('.today-label');
      if (oldToday) {
        oldToday.remove();
      }

      const oldSelected = cell.querySelector('.selected-label');
      if (oldSelected) {
        oldSelected.remove();
      }

      applyStateClasses(cell, date, dateKey);

      if (dateKey === toDateKey(today)) {
        const todayTag = document.createElement('div');
        todayTag.className = 'today-label';
        todayTag.textContent = 'Today';
        cell.insertBefore(todayTag, cell.firstChild);
      }
    });

    if (!dayCells.some((cell) => cell.dataset.date === selectedDate)) {
      selectedDate = dayCells[0].dataset.date;
    }

    selectedNutritionDate = selectedDate;

    dayCells.forEach((cell) => {
      if (cell.dataset.date === selectedDate) {
        const dayNumber = cell.querySelector('.day-number');
        const selectedTag = document.createElement('div');
        selectedTag.className = 'selected-label';
        selectedTag.textContent = 'Selected';

        if (dayNumber) {
          cell.insertBefore(selectedTag, dayNumber.nextSibling);
        } else {
          cell.appendChild(selectedTag);
        }
      }
    });

    monthTitle.textContent = `Nutrition in ${monthNames[monday.getMonth()]}`;
    prevButton.disabled = weekOffset <= MIN_WEEK_OFFSET;
    nextButton.disabled = weekOffset >= MAX_WEEK_OFFSET;

    document.dispatchEvent(
      new CustomEvent('nutrition:dateSelected', {
        detail: { date: selectedDate }
      })
    );
  }

  function setSelectedDate(dateKey) {
    selectedDate = dateKey;
    selectedNutritionDate = dateKey;
    persistNutritionSessionState();
    renderCalendarWeek();
  }

  window.renderNutritionCalendarWeek = renderCalendarWeek;

  calendar.addEventListener('click', (event) => {
    const cell = event.target.closest('.calendar-day');

    if (!cell || !cell.dataset.date) {
      return;
    }

    setSelectedDate(cell.dataset.date);
  });

  prevButton.addEventListener('click', () => {
    if (weekOffset > MIN_WEEK_OFFSET) {
      weekOffset -= 1;
      renderCalendarWeek();
    }
  });

  nextButton.addEventListener('click', () => {
    if (weekOffset < MAX_WEEK_OFFSET) {
      weekOffset += 1;
      renderCalendarWeek();
    }
  });

  renderCalendarWeek();
});

// =========================================
// SECTION 2 — ELEMENTOS
// =========================================

const nutritionSection =
  document.querySelector('.nutrition-page');

const mealsSection =
  document.querySelector('.nutrition-meals');

const mealsPage =
  document.querySelector('.meals-page');

const mealsCover =
  document.querySelector('.meals-cover');

// =========================================
// ESTADO INICIAL DA CAPA
// =========================================

function updateMealsCoverState() {

  if (
    !nutritionSection ||
    !mealsSection
  ) {
    return;
  }


  const scrollPosition =
    window.scrollY;

  const mealsTop =
    mealsSection.offsetTop;


  // =======================================
  // USUÁRIO ESTÁ NA SECTION 2
  // =======================================

  if (
    scrollPosition >= mealsTop - 50
  ) {

    mealsSection.classList.add(
      'meals-open'
    );

  }


  // =======================================
  // USUÁRIO ESTÁ NA SECTION 1
  // =======================================

  else {

    mealsSection.classList.remove(
      'meals-open'
    );

  }

}


// =========================================
// VERIFICAR AO CARREGAR A PÁGINA
// =========================================

updateMealsCoverState();

// =========================================
// SECTION 2 — ANIMAÇÃO DOS ELEMENTOS
// =========================================

if (
  nutritionSection &&
  mealsSection &&
  mealsPage
) {

  const mealsObserver =
    new IntersectionObserver(

      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            mealsPage.classList.add(
              'meals-visible'
            );

          } else {

            mealsPage.classList.remove(
              'meals-visible'
            );

          }

        });

      },

      {
        threshold: 0.35
      }

    );


  mealsObserver.observe(
    mealsSection
  );

}



// =========================================
// SECTION SCROLL — TRANSIÇÃO SUAVE
// =========================================

if (
  nutritionSection &&
  mealsSection
) {

  let isScrolling =
    false;


  const SCROLL_DURATION =
    1100;


  // =========================================
  // SCROLL SUAVE
  // =========================================

  function smoothScrollTo(target) {

    if (isScrolling) {

      return;

    }


    isScrolling =
      true;


    const startPosition =
      window.scrollY;


    const targetPosition =
      target.offsetTop;


    const distance =
      targetPosition -
      startPosition;


    const startTime =
      performance.now();



    // =========================================
    // SE ESTAMOS INDO PARA SECTION 2
    // =========================================

    if (
      target === mealsSection &&
      mealsCover
    ) {

      // Mantém a capa fechada

      mealsSection.classList.remove(
        'meals-open'
      );

    }



    // =========================================
    // ANIMAÇÃO DO SCROLL
    // =========================================

    function animateScroll(currentTime) {

      const elapsed =
        currentTime -
        startTime;


      const progress =
        Math.min(
          elapsed /
          SCROLL_DURATION,
          1
        );



      // =======================================
      // EASING
      // =======================================

      const ease =
        progress < 0.5

          ? 4 *
            progress *
            progress *
            progress

          : 1 -
            Math.pow(
              -2 *
              progress +
              2,
              3
            ) / 2;



      // =======================================
      // MOVIMENTAR PÁGINA
      // =======================================

      window.scrollTo(

        0,

        startPosition +
        distance *
        ease

      );



      // =======================================
      // CONTINUAR ANIMAÇÃO
      // =======================================

      if (
        progress < 1
      ) {

        requestAnimationFrame(
          animateScroll
        );

      } else {

        isScrolling =
          false;



        // =====================================
        // CHEGOU NA SECTION 2
        // =====================================

        if (
          target === mealsSection
        ) {

          setTimeout(
            () => {

              mealsSection.classList.add(
                'meals-open'
              );

            },

            180
          );

        }



       // =====================================
// FINAL DA TRANSIÇÃO
// =====================================

if (progress >= 1) {

  isScrolling = false;


  // =====================================
  // INDO PARA SECTION 2
  // =====================================

  if (target === mealsSection) {

    setTimeout(() => {

      mealsSection.classList.add(
        'meals-open'
      );

    }, 180);

  }


  // =====================================
  // VOLTANDO PARA SECTION 1
  // =====================================

  if (target === nutritionSection) {

    mealsSection.classList.remove(
      'meals-open'
    );

  }

}

      }

    }



    requestAnimationFrame(
      animateScroll
    );

  }



  // =========================================
  // MOUSE WHEEL
  // =========================================

 window.addEventListener(

  'wheel',

  (event) => {


    // =======================================
    // FORMULÁRIO ABERTO
    // =======================================
    // O scroll pertence somente ao formulário.
    // A página e a capa não devem reagir.

    const mealFormStage =
      document.querySelector('.meals-stage');


    if (
      mealFormStage &&
      mealFormStage.classList.contains('form-open')
    ) {

      return;

    }


    // =======================================
    // BLOQUEAR DURANTE ANIMAÇÃO
    // =======================================

    if (isScrolling) {

      event.preventDefault();

      return;

    }



      const currentScroll =
        window.scrollY;


      const nutritionTop =
        nutritionSection.offsetTop;


      const mealsTop =
        mealsSection.offsetTop;



      // =======================================
      // DESCER PARA SECTION 2
      // =======================================

      if (

        event.deltaY > 0 &&

        currentScroll <
        mealsTop - 10

      ) {

        event.preventDefault();


        smoothScrollTo(
          mealsSection
        );

      }



      // =======================================
      // SUBIR PARA SECTION 1
      // =======================================

      else if (
  event.deltaY < 0 &&
  currentScroll > nutritionTop + 10
) {

  event.preventDefault();

  // =====================================
  // FECHAR A CAPA IMEDIATAMENTE
  // =====================================

  mealsSection.classList.remove(
    'meals-open'
  );


  // =====================================
  // DEPOIS COMEÇA O SCROLL
  // =====================================

  smoothScrollTo(
    nutritionSection
  );

}

    },

    {
      passive: false
    }

  );

}// =========================================
// ADD MEAL MODAL
// =========================================

document.addEventListener('DOMContentLoaded', () => {

  const mealModal =
    document.querySelector('#mealModal');

  const closeMealModal =
    document.querySelector('#closeMealModal');

  const cancelMeal =
    document.querySelector('#cancelMeal');

  const overlay =
    document.querySelector('.meal-modal-overlay');

  const mealCards =
    document.querySelectorAll(
      '.meal-card, .add-meal-button'
    );


  if (!mealModal) {
    return;
  }


  // =========================================
  // ABRIR
  // =========================================

  function openMealModal() {

    mealModal.classList.add('active');

    document.body.style.overflow = 'hidden';

  }


  // =========================================
  // FECHAR
  // =========================================

  function closeMealModalFunction() {

    mealModal.classList.remove('active');

    document.body.style.overflow = '';

  }


  // =========================================
  // CARDS
  // =========================================

  mealCards.forEach((card) => {

    card.addEventListener(
      'click',
      openMealModal
    );

  });


  // =========================================
  // BOTÃO X
  // =========================================

  if (closeMealModal) {

    closeMealModal.addEventListener(
      'click',
      closeMealModalFunction
    );

  }


  // =========================================
  // CANCEL
  // =========================================

  if (cancelMeal) {

    cancelMeal.addEventListener(
      'click',
      closeMealModalFunction
    );

  }


  // =========================================
  // CLICAR FORA
  // =========================================

  if (overlay) {

    overlay.addEventListener(
      'click',
      closeMealModalFunction
    );

  }


  // =========================================
  // ESC
  // =========================================

  document.addEventListener(
    'keydown',
    (event) => {

      if (
        event.key === 'Escape' &&
        mealModal.classList.contains('active')
      ) {

        closeMealModalFunction();

      }

    }
  );

});
// =========================================
// MEAL FORM TRANSITION
// =========================================

document.addEventListener('DOMContentLoaded', () => {

  const stage =
    document.querySelector('.meals-stage');

  const mealFormClose =
    document.querySelector('#mealFormClose');

  const mealFormCancel =
    document.querySelector('#mealFormCancel');

  const mealFormSave =
    document.querySelector('#mealFormSave');

  const mealFormDelete =
    document.querySelector('#mealFormDelete');

  const mealFormTitle =
    document.querySelector('#mealFormTitle');

  const mealNameInput =
    document.querySelector('#mealName');

  const mealTypeInput =
    document.querySelector('#mealType');

  const mealTimeInput =
    document.querySelector('#mealTime');

  const mealQuantityInput =
    document.querySelector('#mealQuantity');

  const caloriesInput =
    document.querySelector('#calories');

  const proteinInput =
    document.querySelector('#protein');

  const carbsInput =
    document.querySelector('#carbs');

  const fatInput =
    document.querySelector('#fat');

  const fiberInput =
    document.querySelector('#fiber');

  const sodiumInput =
    document.querySelector('#sodium');

  const sugarInput =
    document.querySelector('#sugar');

  let currentMealCard = null;
  let currentMealIndex = -1;
    // =========================================
  // CONTROLE DO SCROLL DA PÁGINA
  // =========================================

  let pageScrollPosition = 0;


  function lockPageScroll() {

    pageScrollPosition =
      window.scrollY;

    document.body.style.position =
      'fixed';

    document.body.style.top =
      `-${pageScrollPosition}px`;

    document.body.style.left =
      '0';

    document.body.style.right =
      '0';

    document.body.style.width =
      '100%';

    document.body.style.overflow =
      'hidden';

  }


  function unlockPageScroll() {

    document.body.style.position =
      '';

    document.body.style.top =
      '';

    document.body.style.left =
      '';

    document.body.style.right =
      '';

    document.body.style.width =
      '';

    document.body.style.overflow =
      '';

    window.scrollTo(
      0,
      pageScrollPosition
    );

  }

  if (!stage) {
    return;
  }


  // =========================================
  // ABRIR FORMULÁRIO
  // =========================================

  let mealCards = Array.from(
    document.querySelectorAll('.meal-card')
  );

  const addMealButton =
    document.querySelector('.add-meal-button');

  const mealsDateTitle =
    document.querySelector('#mealsDateTitle');

  function updateMealsDateTitle(dateKey) {
    if (!mealsDateTitle || !dateKey) return;

    const selected = new Date(`${dateKey}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const differenceInDays = Math.round(
      (today - selected) / (1000 * 60 * 60 * 24)
    );

    if (differenceInDays === 0) {
      mealsDateTitle.textContent = "TODAY'S MEALS";
      return;
    }

    if (differenceInDays === 1) {
      mealsDateTitle.textContent = "YESTERDAY'S MEALS";
      return;
    }

    const formattedDate = selected.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    }).toUpperCase();

    mealsDateTitle.textContent = `MEALS FOR ${formattedDate}`;
  }

  function resetMealForm() {
    validationFields.forEach(({ field }) => {
      if (field) {
        field.value = '';
        clearFieldError(field);
      }
    });

    const mealUnit = document.querySelector('#mealUnit');
    if (mealUnit) {
      mealUnit.value = 'g';
    }
  }

  function loadMealForm(card) {
    resetMealForm();

    if (!card || !card.dataset.mealName) return;

    mealNameInput.value = card.dataset.mealName;
    mealTypeInput.value = card.dataset.mealType || 'breakfast';
    mealTimeInput.value = card.dataset.mealTime || '';
    mealQuantityInput.value = card.dataset.mealQuantity || '';
    caloriesInput.value = card.dataset.calories || '';
    proteinInput.value = card.dataset.protein || '';
    carbsInput.value = card.dataset.carbs || '';
    fatInput.value = card.dataset.fat || '';
    fiberInput.value = card.dataset.fiber || '';
    sodiumInput.value = card.dataset.sodium || '';
    sugarInput.value = card.dataset.sugar || '';

    const mealUnit = document.querySelector('#mealUnit');
    if (mealUnit) {
      mealUnit.value = card.dataset.mealUnit || 'g';
    }
  }

  function openMealForm(card = null) {
    currentMealCard = card;
    currentMealIndex = card ? Array.from(mealCards).indexOf(card) : -1;
    loadMealForm(card);

    if (mealFormTitle) {
      mealFormTitle.textContent = card?.dataset.mealName
        ? mealTypeInput.options[mealTypeInput.selectedIndex].text
        : 'Add Meal';
    }

    if (mealFormDelete) {
      mealFormDelete.disabled = !card?.dataset.mealName;
    }
    lockPageScroll();
    stage.classList.add('form-open');
  }

  function attachMealCard(card) {
    card.addEventListener('click', () => {
      openMealForm(card);
    });
  }

  mealCards.forEach(attachMealCard);

  function createMealCard() {
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    clearMealCard(card, false);

    if (addMealButton) {
      addMealButton.before(card);
    }

    mealCards.push(card);
    attachMealCard(card);
    return card;
  }

  function renderMealsForDate(dateKey) {
    const meals = nutritionMealsByDate.get(dateKey) || [];
    const cardsNeeded = Math.max(3, meals.length);

    while (mealCards.length > cardsNeeded) {
      const card = mealCards.pop();
      if (card === currentMealCard) {
        currentMealCard = null;
        currentMealIndex = -1;
      }
      card.remove();
    }

    while (mealCards.length < cardsNeeded) {
      createMealCard();
    }

    mealCards.forEach((card, index) => {
      const meal = meals[index];

      if (meal) {
        renderSavedMealCard(card, meal);
      } else {
        clearMealCard(card, false);
      }
    });
  }

  document.addEventListener('nutrition:dateSelected', (event) => {
    const dateKey = event.detail && event.detail.date;
    if (dateKey) {
      updateMealsDateTitle(dateKey);
      renderMealsForDate(dateKey);
    }
  });

  document.addEventListener('nutrition:mealsUpdated', () => {
    window.renderNutritionCalendarWeek();
    updateDailyOverview();
    updateLastSevenDaysOverview();
    updateMealPlan();
  });

  renderMealsForDate(selectedNutritionDate);
  updateMealsDateTitle(selectedNutritionDate);
  updateDailyOverview();
  updateLastSevenDaysOverview();
  updateMealPlan();


  // =========================================
  // CONFIRMAÇÃO
  // =========================================

  function askToClose() {

    const existing =
      stage.querySelector(
        '.meal-close-confirm'
      );


    if (existing) {
      return;
    }


    const confirmation =
      document.createElement('div');

    confirmation.className =
      'meal-close-confirm';


    confirmation.innerHTML = `

      <div class="meal-close-confirm-box">

        <span class="meal-close-label">
          UNSAVED CHANGES
        </span>

        <h3>
          Leave this meal?
        </h3>

        <p>
          Your information has not been saved.
          Do you want to leave?
        </p>

        <div class="meal-close-actions">

          <button
            type="button"
            class="meal-stay-button"
          >
            Stay
          </button>

          <button
            type="button"
            class="meal-leave-button"
          >
            Leave
          </button>

        </div>

      </div>

    `;


    stage.appendChild(
      confirmation
    );


    requestAnimationFrame(() => {

      confirmation.classList.add(
        'active'
      );

    });


    // STAY

    confirmation
      .querySelector(
        '.meal-stay-button'
      )
      .addEventListener(
        'click',
        () => {

          confirmation.classList.remove(
            'active'
          );

          setTimeout(() => {

            confirmation.remove();

          }, 300);

        }
      );


    // LEAVE

    confirmation
      .querySelector(
        '.meal-leave-button'
      )
      .addEventListener(
        'click',
        () => {

          confirmation.classList.remove(
            'active'
          );


          setTimeout(() => {

            confirmation.remove();

            closeForm();

          }, 250);

        }
      );

  }


  // =========================================
  // FECHAR FORMULÁRIO
  // =========================================

  function showFieldError(field, message) {
    if (!field) return;

    const formGroup = field.closest('.meal-form-group');
    const messageEl = formGroup
      ? formGroup.querySelector('.field-error-message')
      : null;

    if (formGroup) {
      formGroup.classList.add('is-invalid');
    }

    if (messageEl) {
      messageEl.textContent = message;
      messageEl.classList.add('visible');
    }
  }

  function clearFieldError(field) {
    if (!field) return;

    const formGroup = field.closest('.meal-form-group');
    const messageEl = formGroup
      ? formGroup.querySelector('.field-error-message')
      : null;

    if (formGroup) {
      formGroup.classList.remove('is-invalid');
    }

    if (messageEl) {
      messageEl.textContent = '';
      messageEl.classList.remove('visible');
    }
  }

  function validateTextField(field, label) {
    if (!field) return true;

    const value = field.value.trim();
    const isValid = value !== '' && /^[A-Za-z\s'-]+$/.test(value);

    if (!isValid) {
      showFieldError(field, `Please use letters only for ${label}.`);
      return false;
    }

    clearFieldError(field);
    return true;
  }

  function validateRequiredField(field, label) {
    if (!field) return true;

    if (field.value.trim() === '') {
      showFieldError(field, `${label} is required.`);
      return false;
    }

    clearFieldError(field);
    return true;
  }

  function validateNumericField(field, label, optional = false) {
    if (!field) return true;

    const value = field.value.trim();
    const isValid = optional && value === '' || /^\d+$/.test(value);

    if (!isValid) {
      showFieldError(field, optional
        ? `Please use numbers only for ${label}.`
        : `${label} must contain numbers only.`);
      return false;
    }

    clearFieldError(field);
    return true;
  }

  const validationFields = [
    { field: mealNameInput, type: 'text', label: 'the meal name' },
    { field: mealTypeInput, type: 'required', label: 'Meal type' },
    { field: mealTimeInput, type: 'required', label: 'Time' },
    { field: mealQuantityInput, type: 'number', label: 'Quantity' },
    { field: caloriesInput, type: 'number', label: 'Calories' },
    { field: proteinInput, type: 'number', label: 'Protein' },
    { field: carbsInput, type: 'number', label: 'Carbohydrates' },
    { field: fatInput, type: 'number', label: 'Total Fat' },
    { field: fiberInput, type: 'number', label: 'Fiber', optional: true },
    { field: sodiumInput, type: 'number', label: 'Sodium', optional: true },
    { field: sugarInput, type: 'number', label: 'Sugars', optional: true }
  ];

  validationFields.forEach(({ field, type, label, optional }) => {
    if (!field) return;

    field.addEventListener('input', () => {
      if (type === 'text') {
        validateTextField(field, label);
      } else if (type === 'required') {
        validateRequiredField(field, label);
      } else {
        validateNumericField(field, label, optional);
      }
    });

    field.addEventListener('change', () => {
      if (type === 'required') {
        validateRequiredField(field, label);
      }

      if (field === mealTypeInput && mealFormTitle) {
        mealFormTitle.textContent = mealTypeInput.options[mealTypeInput.selectedIndex].text;
      }
    });
  });

  function closeForm() {

  stage.classList.remove(
    'form-open'
  );

  unlockPageScroll();

}

  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[character]));
  }

  function collectMealData() {
    const mealUnit = document.querySelector('#mealUnit');

    return {
      mealName: mealNameInput.value.trim(),
      mealType: mealTypeInput.value,
      mealTime: mealTimeInput.value,
      mealQuantity: mealQuantityInput.value.trim(),
      mealUnit: mealUnit ? mealUnit.value : 'g',
      calories: caloriesInput.value.trim(),
      protein: proteinInput.value.trim(),
      carbs: carbsInput.value.trim(),
      fat: fatInput.value.trim(),
      fiber: fiberInput.value.trim(),
      sodium: sodiumInput.value.trim(),
      sugar: sugarInput.value.trim()
    };
  }

  function renderSavedMealCard(card, mealData) {
    const mealType = mealTypeInput.querySelector(`option[value="${mealData.mealType}"]`)?.textContent || mealData.mealType;
    const details = [
      mealType,
      mealData.mealTime,
      `${mealData.calories} kcal`,
      `${mealData.protein} g protein`
    ].join(' · ');

    Object.entries(mealData).forEach(([key, value]) => {
      card.dataset[key] = value;
    });

    card.innerHTML = `
      <div class="meal-card-icon">✓</div>
      <span class="meal-card-title">${escapeHtml(mealData.mealName)}</span>
      <span class="meal-card-subtitle">${escapeHtml(details)}</span>
    `;
  }

  function renderMealCard(card) {
    if (!card) return;

    const meals = nutritionMealsByDate.get(selectedNutritionDate) || [];
    const mealData = collectMealData();
    meals[currentMealIndex] = mealData;
    nutritionMealsByDate.set(selectedNutritionDate, meals);
    persistNutritionSessionState();
    renderSavedMealCard(card, mealData);
    document.dispatchEvent(new CustomEvent('nutrition:mealsUpdated'));
  }

  function clearMealCard(card, removeFromStore = true) {
    if (!card) return;

    Object.keys(card.dataset).forEach((key) => {
      delete card.dataset[key];
    });

    card.innerHTML = `
      <div class="meal-card-icon">+</div>
      <span class="meal-card-title">Add a meal</span>
      <span class="meal-card-subtitle">No meal added</span>
    `;

    if (removeFromStore) {
      const meals = nutritionMealsByDate.get(selectedNutritionDate) || [];
      const cardIndex = Array.from(mealCards).indexOf(card);
      meals.splice(cardIndex, 1);
      while (meals.length && !meals[meals.length - 1]) {
        meals.pop();
      }
      if (meals.length) {
        nutritionMealsByDate.set(selectedNutritionDate, meals);
      } else {
        nutritionMealsByDate.delete(selectedNutritionDate);
      }
      persistNutritionSessionState();
    }
  }


  // =========================================
  // CLOSE
  // =========================================

  if (mealFormClose) {

    mealFormClose.addEventListener(
      'click',
      askToClose
    );

  }


  // =========================================
  // CANCEL
  // =========================================

  if (mealFormCancel) {

    mealFormCancel.addEventListener(
      'click',
      askToClose
    );

  }


  // =========================================
  // SAVE
  // =========================================

  if (mealFormSave) {

    mealFormSave.addEventListener(
      'click',
      () => {

        const fieldsValid = validationFields.map(({ field, type, label, optional }) => {
          if (type === 'text') {
            return validateTextField(field, label);
          }

          if (type === 'required') {
            return validateRequiredField(field, label);
          }

          return validateNumericField(field, label, optional);
        }).every(Boolean);

        if (!fieldsValid) {
          alert('Please correct the highlighted fields before saving.');
          return;
        }

        renderMealCard(currentMealCard);

        closeForm();

      }
    );

  }

  if (mealFormDelete) {
    mealFormDelete.addEventListener('click', () => {
      if (!currentMealCard || !currentMealCard.dataset.mealName) return;

      const shouldDelete = window.confirm('Delete this meal?');
      if (!shouldDelete) return;

      clearMealCard(currentMealCard);
      document.dispatchEvent(new CustomEvent('nutrition:mealsUpdated'));
      closeForm();
    });
  }

  if (addMealButton) {
    addMealButton.addEventListener('click', () => {
      const emptyCard = mealCards.find((card) =>
        card.querySelector('.meal-card-subtitle')?.textContent.trim() === 'No meal added'
      );

      openMealForm(emptyCard || createMealCard());
    });
  }

});
