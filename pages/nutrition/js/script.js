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

  if (window.location.hash === '#goal-panel') {
    order = [4, 1, 2, 3];
  }

  updateCarousel();

  if (window.location.hash === '#goal-panel') {
    const nutritionPage = document.querySelector('.nutrition-page');

    requestAnimationFrame(() => {
      window.scrollTo({
        top: nutritionPage?.offsetTop || 0,
        behavior: 'smooth'
      });
    });
  }

});



// =========================================
// CALENDÁRIO DE NUTRIÇÃO
// =========================================

const nutritionMealsByDate = new Map();
const nutritionMealLoads = new Map();
const nutritionMealLoadedDates = new Set();
const nutritionDailySummaries = new Map();
let nutritionWeeklyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0 };
let nutritionApiErrorReported = false;
let nutritionBackendReady = Promise.resolve();
let selectedNutritionDate = null;
let selectedBodyGoal = null;
let nutritionGoals = null;

function mealFromApi(meal) {
  return {
    mealId: meal._id,
    mealName: meal.mealName,
    mealType: meal.mealType,
    mealTime: meal.mealTime,
    mealQuantity: meal.quantity ?? '',
    mealUnit: meal.unit || 'g',
    calories: meal.calories,
    protein: meal.protein ?? 0,
    carbs: meal.carbs ?? 0,
    fat: meal.fat ?? 0,
    fiber: meal.fiber ?? 0,
    sodium: meal.sodium ?? 0,
    sugar: meal.sugar ?? 0
  };
}

function mealsUpdated() {
  persistNutritionSessionState();
  document.dispatchEvent(new CustomEvent('nutrition:mealsUpdated'));
}

async function loadMealsForDate(dateKey, { force = false, notify = true } = {}) {
  if (!force && nutritionMealLoadedDates.has(dateKey)) {
    return nutritionMealsByDate.get(dateKey) || [];
  }

  if (!force && nutritionMealLoads.has(dateKey)) {
    return nutritionMealLoads.get(dateKey);
  }

  const request = window.BioTraceApi.request(
    `/meals?date=${encodeURIComponent(dateKey)}`,
    { authenticated: true }
  ).then((meals) => {
    if (!Array.isArray(meals)) {
      throw new Error('The meals API returned an invalid response.');
    }

    const normalizedMeals = meals.map(mealFromApi);
    if (normalizedMeals.length) {
      nutritionMealsByDate.set(dateKey, normalizedMeals);
    } else {
      nutritionMealsByDate.delete(dateKey);
    }
    nutritionMealLoadedDates.add(dateKey);

    if (notify) {
      mealsUpdated();
    } else {
      persistNutritionSessionState();
    }
    return normalizedMeals;
  }).finally(() => {
    nutritionMealLoads.delete(dateKey);
  });

  nutritionMealLoads.set(dateKey, request);
  return request;
}

document.addEventListener('nutrition:dateSelected', (event) => {
  const dateKey = event.detail && event.detail.date;
  if (dateKey) {
    nutritionBackendReady
      .then(() => loadMealsForDate(dateKey))
      .catch(reportNutritionApiError);
  }
});

function reportNutritionApiError(error) {
  console.error('Nutrition API error:', error);
  if (!nutritionApiErrorReported) {
    nutritionApiErrorReported = true;
    window.alert(error.message || 'Unable to load meals from the server.');
  }
}

function getLastSevenNutritionDateKeys() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    return getNutritionDateKey(date);
  });
}

function getNutritionDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function getNutritionSummaryRange(days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(today);
  from.setDate(today.getDate() - days + 1);
  return { from: getNutritionDateKey(from), to: getNutritionDateKey(today) };
}

async function refreshNutritionSummary() {
  const range = getNutritionSummaryRange(35);
  const weeklyRange = getNutritionSummaryRange(7);
  const [calendarSummary, weeklySummary] = await Promise.all([
    window.BioTraceApi.request(
      `/nutrition/summary?from=${range.from}&to=${range.to}`,
      { authenticated: true }
    ),
    window.BioTraceApi.request(
      `/nutrition/summary?from=${weeklyRange.from}&to=${weeklyRange.to}`,
      { authenticated: true }
    )
  ]);

  nutritionApiErrorReported = false;
  nutritionDailySummaries.clear();
  calendarSummary.days.forEach((day) => nutritionDailySummaries.set(day.date, day));
  nutritionWeeklyTotals = weeklySummary.totals;
}

async function getNutritionGoalFromApi() {
  try {
    const response = await window.BioTraceApi.request('/nutrition-goal', { authenticated: true });
    nutritionApiErrorReported = false;
    return response.nutritionGoal;
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

function goalFromApi(goal) {
  return {
    goalType: goal.goalType,
    calories: goal.calories,
    protein: goal.protein,
    carbs: goal.carbohydrates,
    fat: goal.fats
  };
}

function goalPayload(goal, goalType) {
  return {
    goalType: ['loss', 'gain', 'maintenance'].includes(goalType) ? goalType : 'maintenance',
    calories: Number(goal.calories),
    protein: Number(goal.protein),
    carbohydrates: Number(goal.carbs),
    fats: Number(goal.fat)
  };
}

async function migrateLegacyNutritionData() {
  const saved = loadNutritionSessionState();
  const migrationUser = sessionStorage.getItem('auth_user_id') || getUserStorageSlug();
  const migrationKey = `nutrition_legacy_migrated_${migrationUser}`;
  const alreadyMigrated = sessionStorage.getItem(migrationKey) === 'true';
  let legacyGoalPending = false;

  if (!alreadyMigrated) {
    if (['loss', 'gain', 'maintenance'].includes(saved.selectedBodyGoal)) {
      try {
        await window.BioTraceApi.request('/profile/goal', {
          method: 'PATCH',
          authenticated: true,
          body: { goalType: saved.selectedBodyGoal }
        });
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
        legacyGoalPending = true;
      }
    }

    const existingGoal = await getNutritionGoalFromApi();
    if (!existingGoal && saved.goals) {
      const goal = await window.BioTraceApi.request('/nutrition-goal', {
        method: 'PUT',
        authenticated: true,
        body: goalPayload(saved.goals, saved.selectedBodyGoal)
      });
      nutritionGoals = goalFromApi(goal.nutritionGoal);
    }

    const legacyMeals = [];
    if (Array.isArray(saved.meals)) {
      saved.meals.forEach(([date, meals]) => {
        if (!Array.isArray(meals)) {
          return;
        }
        meals.forEach((meal, index) => {
          if (meal) {
            legacyMeals.push({
              ...meal,
              date,
              legacyKey: `${date}-${index}`
            });
          }
        });
      });
    }

    if (legacyMeals.length) {
      await window.BioTraceApi.request('/meals/import-legacy', {
        method: 'POST',
        authenticated: true,
        body: { meals: legacyMeals }
      });
    }

    if (!legacyGoalPending) {
      sessionStorage.setItem(migrationKey, 'true');
    }
  }

  try {
    const response = await window.BioTraceApi.request('/profile', { authenticated: true });
    selectedBodyGoal = response.profile.goalType || null;
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
    selectedBodyGoal = null;
  }

  const nutritionGoal = await getNutritionGoalFromApi();
  nutritionGoals = nutritionGoal ? goalFromApi(nutritionGoal) : null;
}

async function initializeNutritionBackend() {
  const saved = loadNutritionSessionState();
  selectedBodyGoal = saved.selectedBodyGoal || null;
  selectedNutritionDate = saved.selectedDate || getNutritionTodayKey();

  await migrateLegacyNutritionData();
  await refreshNutritionSummary();

  const selectedDateRequest = loadMealsForDate(selectedNutritionDate, { notify: false });
  const lastSevenRequests = getLastSevenNutritionDateKeys().map((dateKey) =>
    loadMealsForDate(dateKey, { notify: false })
  );
  await Promise.all([selectedDateRequest, ...lastSevenRequests]);
  persistNutritionSessionState();
  setupBodyGoalChoices();
  renderGoalsCard();
  document.dispatchEvent(new CustomEvent('nutrition:mealsUpdated'));
}

document.addEventListener('DOMContentLoaded', () => {
  nutritionBackendReady = initializeNutritionBackend().catch(reportNutritionApiError);
});

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
    selectedBodyGoal
  };

  window.UserStorage.saveUserData('nutrition_session_data', payload);
}

function setupBodyGoalChoices() {
  document.querySelectorAll('.goal-choice[data-goal]').forEach((button) => {
    button.classList.toggle('is-selected', button.dataset.goal === selectedBodyGoal);

    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        const response = await window.BioTraceApi.request('/profile/goal', {
          method: 'PATCH',
          authenticated: true,
          body: { goalType: button.dataset.goal }
        });
        selectedBodyGoal = response.profile.goalType;
        nutritionApiErrorReported = false;
        persistNutritionSessionState();
        document.querySelectorAll('.goal-choice[data-goal]').forEach((choice) => {
          choice.classList.toggle('is-selected', choice === button);
        });
        window.location.href = '../../pages/hologram/';
      } catch (error) {
        reportNutritionApiError(error);
      } finally {
        button.disabled = false;
      }
    });
  });
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
  content.querySelector('#goalsDeleteButton').addEventListener('click', async () => {
    if (window.confirm('Delete your goals?')) {
      try {
        await window.BioTraceApi.request('/nutrition-goal', {
          method: 'DELETE',
          authenticated: true
        });
        nutritionGoals = null;
        renderGoalsCard();
      } catch (error) {
        reportNutritionApiError(error);
      }
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

  content.querySelector('#goalsForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = Array.from(content.querySelectorAll('input'));
    const valid = fields.every((field) => /^\d+(\.\d+)?$/.test(field.value.trim()));

    if (!valid) {
      fields.forEach((field) => {
        field.classList.toggle('goals-field-invalid', !/^\d+(\.\d+)?$/.test(field.value.trim()));
      });
      return;
    }

    const nextGoal = {
      calories: fields[0].value,
      protein: fields[1].value,
      carbs: fields[2].value,
      fat: fields[3].value
    };

    try {
      const response = await window.BioTraceApi.request('/nutrition-goal', {
        method: 'PUT',
        authenticated: true,
        body: goalPayload(nextGoal, selectedBodyGoal || nutritionGoals?.goalType)
      });
      nutritionGoals = goalFromApi(response.nutritionGoal);
      renderGoalsCard();
    } catch (error) {
      reportNutritionApiError(error);
    }
  });
}

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

  const totals = nutritionDailySummaries.get(getNutritionTodayKey()) || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

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

  const totals = nutritionWeeklyTotals;

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

    if (
      nutritionDailySummaries.get(dateKey)?.mealCount > 0 ||
      (nutritionMealsByDate.get(dateKey) || []).length > 0
    ) {
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

  const mealUnitInput =
    document.querySelector('#mealUnit');

  const quantityFormGroup =
    document.querySelector('.quantity-form-group');

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

  function updateQuantityAvailability() {
    const isIndividualFood = mealTypeInput?.value === 'individual-food';

    if (mealQuantityInput) {
      mealQuantityInput.disabled = !isIndividualFood;
      if (!isIndividualFood) {
        mealQuantityInput.value = '';
        clearFieldError(mealQuantityInput);
      }
    }

    if (mealUnitInput) {
      mealUnitInput.disabled = !isIndividualFood;
    }

    quantityFormGroup?.classList.toggle('is-disabled', !isIndividualFood);
  }
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

    updateQuantityAvailability();
  }

  function loadMealForm(card) {
    resetMealForm();

    if (!card || !card.dataset.mealName) return;

    mealNameInput.value = card.dataset.mealName;
    mealTypeInput.value = card.dataset.mealType || 'breakfast';
    mealTimeInput.value = card.dataset.mealTime || '';
    mealQuantityInput.value = card.dataset.mealQuantity ?? '';
    caloriesInput.value = card.dataset.calories || '';
    proteinInput.value = card.dataset.protein || '';
    carbsInput.value = card.dataset.carbs || '';
    fatInput.value = card.dataset.fat || '';
    fiberInput.value = card.dataset.fiber || '';
    sodiumInput.value = card.dataset.sodium || '';
    sugarInput.value = card.dataset.sugar || '';

    if (mealUnitInput) {
      mealUnitInput.value = card.dataset.mealUnit || 'g';
    }

    updateQuantityAvailability();
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
    { field: mealQuantityInput, type: 'number', label: 'Quantity', optional: true },
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
        const quantityIsOptional = field === mealQuantityInput
          ? mealTypeInput.value !== 'individual-food'
          : optional;
        validateNumericField(field, label, quantityIsOptional);
      }
    });

    field.addEventListener('change', () => {
      if (type === 'required') {
        validateRequiredField(field, label);
      }

      if (field === mealTypeInput && mealFormTitle) {
        mealFormTitle.textContent = mealTypeInput.options[mealTypeInput.selectedIndex].text;
      }

      if (field === mealTypeInput) {
        updateQuantityAvailability();
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
    return {
      mealName: mealNameInput.value.trim(),
      mealType: mealTypeInput.value,
      mealTime: mealTimeInput.value,
      mealQuantity: mealQuantityInput.value.trim(),
      mealUnit: mealUnitInput ? mealUnitInput.value : 'g',
      calories: caloriesInput.value.trim(),
      protein: proteinInput.value.trim(),
      carbs: carbsInput.value.trim(),
      fat: fatInput.value.trim(),
      fiber: fiberInput.value.trim(),
      sodium: sodiumInput.value.trim(),
      sugar: sugarInput.value.trim()
    };
  }

  function mealPayloadFromForm(mealData) {
    const payload = {
      date: selectedNutritionDate,
      mealName: mealData.mealName,
      mealType: mealData.mealType,
      mealTime: mealData.mealTime,
      calories: Number(mealData.calories),
      protein: Number(mealData.protein),
      carbs: Number(mealData.carbs),
      fat: Number(mealData.fat),
      fiber: Number(mealData.fiber || 0),
      sodium: Number(mealData.sodium || 0),
      sugar: Number(mealData.sugar || 0),
      unit: mealData.mealUnit || 'g'
    };

    if (mealData.mealQuantity !== '') {
      payload.quantity = Number(mealData.mealQuantity);
    }

    return payload;
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
      if (meals.length) {
        nutritionMealsByDate.set(selectedNutritionDate, meals);
      } else {
        nutritionMealsByDate.delete(selectedNutritionDate);
      }
      mealsUpdated();
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
      async () => {

        const fieldsValid = validationFields.map(({ field, type, label, optional }) => {
          if (type === 'text') {
            return validateTextField(field, label);
          }

          if (type === 'required') {
            return validateRequiredField(field, label);
          }

          const quantityIsOptional = field === mealQuantityInput
            ? mealTypeInput.value !== 'individual-food'
            : optional;
          return validateNumericField(field, label, quantityIsOptional);
        }).every(Boolean);

        if (!fieldsValid) {
          alert('Please correct the highlighted fields before saving.');
          return;
        }

        if (!nutritionMealLoadedDates.has(selectedNutritionDate)) {
          alert('Meals are still loading. Please wait a moment and try again.');
          return;
        }

        mealFormSave.disabled = true;
        try {
          const formData = collectMealData();
          const existingMealId = currentMealCard.dataset.mealId;
          const savedMeal = await window.BioTraceApi.request(
            existingMealId ? `/meals/${encodeURIComponent(existingMealId)}` : '/meals',
            {
              method: existingMealId ? 'PUT' : 'POST',
              authenticated: true,
              body: mealPayloadFromForm(formData)
            }
          );
          nutritionApiErrorReported = false;
          const normalizedMeal = mealFromApi(savedMeal);
          const meals = nutritionMealsByDate.get(selectedNutritionDate) || [];

          if (currentMealIndex >= 0 && currentMealIndex < meals.length) {
            meals[currentMealIndex] = normalizedMeal;
          } else {
            meals.push(normalizedMeal);
          }

          nutritionMealsByDate.set(selectedNutritionDate, meals);
          renderSavedMealCard(currentMealCard, normalizedMeal);
          mealsUpdated();
          closeForm();

          try {
            await refreshNutritionSummary();
            mealsUpdated();
          } catch (summaryError) {
            reportNutritionApiError(summaryError);
          }
        } catch (error) {
          reportNutritionApiError(error);
        } finally {
          mealFormSave.disabled = false;
        }
      }
    );

  }

  if (mealFormDelete) {
    mealFormDelete.addEventListener('click', async () => {
      if (!currentMealCard || !currentMealCard.dataset.mealName) return;

      const shouldDelete = window.confirm('Delete this meal?');
      if (!shouldDelete) return;

      const mealId = currentMealCard.dataset.mealId;
      if (!mealId) {
        alert('This meal is not linked to a server record. Reload the page and try again.');
        return;
      }

      mealFormDelete.disabled = true;
      try {
        await window.BioTraceApi.request(`/meals/${encodeURIComponent(mealId)}`, {
          method: 'DELETE',
          authenticated: true
        });
        nutritionApiErrorReported = false;
        clearMealCard(currentMealCard);
        closeForm();

        try {
          await refreshNutritionSummary();
          mealsUpdated();
        } catch (summaryError) {
          reportNutritionApiError(summaryError);
        }
      } catch (error) {
        reportNutritionApiError(error);
      } finally {
        mealFormDelete.disabled = false;
      }
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
