const temporaryWorkoutStore = new Map();
const dayCompletionStore = new Map();
const confirmedWorkoutStore = new Map();
let selectedDate = null;

const exercisesByCategory = {
    push: [
        'Bench Press',
        'Overhead Press',
        'Incline Dumbbell Press',
        'Dumbbell Lateral Raise',
        'Triceps Pushdown'
    ],
    pull: [
        'Pull-Up',
        'Barbell Row',
        'Lat Pulldown',
        'Seated Cable Row',
        'Face Pull'
    ],
    legs: [
        'Back Squat',
        'Romanian Deadlift',
        'Leg Press',
        'Walking Lunges',
        'Leg Curl'
    ],
    core: [
        'Plank',
        'Hanging Leg Raise',
        'Cable Crunch',
        'Russian Twist',
        'Ab Wheel Rollout'
    ]
};

function populateExerciseOptions(category, selectedName = '') {
    const exerciseNameSelect = document.querySelector('#exerciseName');

    if (!exerciseNameSelect) {
        return;
    }

    const exercises = exercisesByCategory[category] || [];
    exerciseNameSelect.innerHTML = '<option value="">Select an exercise</option>';

    exercises.forEach((exerciseName) => {
        const option = document.createElement('option');
        option.value = exerciseName;
        option.textContent = exerciseName;
        exerciseNameSelect.appendChild(option);
    });

    exerciseNameSelect.value = selectedName;
}

function buildTodayItemMarkup(data) {
    const weightPart =
        data.weight
            ? ` · ${data.weight}kg`
            : '';

    const isChecked = Boolean(data.checked);

    return `
        <label class="exercise-checkbox">
            <input type="checkbox" ${isChecked ? 'checked' : ''}>
            <span class="checkmark"></span>
        </label>

        <div class="exercise-info">
            <span class="exercise-name">${data.name}</span>
            <span class="exercise-target">${data.targetSets || 0} × ${data.targetReps || 0}</span>
        </div>

        <div class="exercise-stats">
            <span>${data.sets || 0} Sets</span>
            <span>${data.reps || 0} Reps${weightPart}</span>
        </div>

        <div class="exercise-item-actions">
            <button type="button" class="exercise-item-edit" aria-label="Edit exercise">✎</button>
            <button type="button" class="exercise-item-remove" aria-label="Remove exercise">✕</button>
        </div>
    `;
}

function getSelectedDateKey() {
    const selected = document.querySelector('.calendar-day.selected');
    const fallback = selected && selected.dataset.date
        ? selected.dataset.date
        : selectedDate || null;

    return fallback;
}

function getSavedWorkoutForDate(dateKey) {
    if (!dateKey) {
        return [];
    }

    return temporaryWorkoutStore.get(dateKey) || [];
}

function saveWorkoutForDate(dateKey, entries) {
    if (!dateKey) {
        return;
    }

    temporaryWorkoutStore.set(dateKey, entries);
}

function showSaveConfirmation(message) {
    let confirmation = document.querySelector('.save-confirmation');

    if (!confirmation) {
        confirmation = document.createElement('div');
        confirmation.className = 'save-confirmation';
        confirmation.setAttribute('role', 'status');
        confirmation.setAttribute('aria-live', 'polite');
        document.body.appendChild(confirmation);
    }

    confirmation.textContent = message;
    confirmation.classList.remove('visible');
    requestAnimationFrame(() => confirmation.classList.add('visible'));

    clearTimeout(showSaveConfirmation.timeoutId);
    showSaveConfirmation.timeoutId = setTimeout(() => {
        confirmation.classList.remove('visible');
    }, 2800);
}

function copyEntries(entries) {
    return JSON.parse(JSON.stringify(entries || []));
}

function restoreConfirmedWorkoutState(dateKey) {
    const confirmed = confirmedWorkoutStore.get(dateKey);
    const currentItems = temporaryWorkoutStore.get(dateKey) || confirmedWorkoutStore.get(dateKey) || [];

    if (confirmed) {
        temporaryWorkoutStore.set(dateKey, copyEntries(confirmed));
        return;
    }

    if (currentItems.length) {
        temporaryWorkoutStore.set(
            dateKey,
            currentItems.map((item) => ({
                ...item,
                checked: false
            }))
        );
        return;
    }

    temporaryWorkoutStore.delete(dateKey);
}

function syncSelectedWorkoutList() {
    const activeDate = getSelectedDateKey();

    if (activeDate) {
        renderWorkoutListForDate(activeDate);
    }
}

function syncCalendarDayState(dateKey) {
    const targetDay = Array.from(document.querySelectorAll('.calendar-day'))
        .find((cell) => cell.dataset.date === dateKey);

    if (!targetDay) {
        return;
    }

    targetDay.classList.remove('day-done', 'day-partial');

    const state = dayCompletionStore.get(dateKey);

    if (state === 'day-done' || state === 'day-partial') {
        targetDay.classList.add(state);
    }
}

function applyCompletedWorkoutState(dateKey) {
    const items = getSavedWorkoutForDate(dateKey);

    if (!items.length) {
        dayCompletionStore.delete(dateKey);
        confirmedWorkoutStore.delete(dateKey);
        temporaryWorkoutStore.delete(dateKey);
        syncCalendarDayState(dateKey);
        return;
    }

    const checked = items.filter((item) => item.checked).length;
    const total = items.length;

    if (checked === total) {
        dayCompletionStore.set(dateKey, 'day-done');
    } else if (checked > 0) {
        dayCompletionStore.set(dateKey, 'day-partial');
    } else {
        dayCompletionStore.delete(dateKey);
    }

    confirmedWorkoutStore.set(dateKey, copyEntries(items));
    temporaryWorkoutStore.set(dateKey, copyEntries(items));
    syncCalendarDayState(dateKey);
}

function formatWorkoutTitle(items) {
    const names = items
        .map((item) => item && item.name ? item.name.trim() : '')
        .filter(Boolean);

    if (!names.length) {
        return 'Workout Plan';
    }

    if (names.length === 1) {
        return names[0];
    }

    if (names.length === 2) {
        return `${names[0]} & ${names[1]}`;
    }

    return `${names.slice(0, -1).join(', ')}, ${names[names.length - 1]}`;
}

function updateWorkoutCardTitle(dateKey) {
    const titleEl = document.querySelector('.workout-card-header h1');

    if (!titleEl) {
        return;
    }

    const items = getSavedWorkoutForDate(dateKey);
    titleEl.textContent = formatWorkoutTitle(items);
}

function updateWorkoutCardLabel(dateKey) {
    const labelEl = document.querySelector('#workoutDateLabel');

    if (!labelEl || !dateKey) {
        return;
    }

    const selected = new Date(`${dateKey}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const differenceInDays = Math.round((today - selected) / (1000 * 60 * 60 * 24));

    if (differenceInDays === 0) {
        labelEl.textContent = "TODAY'S WORKOUT";
        return;
    }

    if (differenceInDays === 1) {
        labelEl.textContent = "YESTERDAY'S WORKOUT";
        return;
    }

    const month = selected.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
    labelEl.textContent = `WORKOUT FOR ${month} ${selected.getDate()}`;
}

function renderWorkoutListForDate(dateKey) {
    const todayList = document.querySelector('#todayExerciseList');

    if (!todayList) {
        return;
    }

    const items = getSavedWorkoutForDate(dateKey);
    todayList.innerHTML = '';

    items.forEach((itemData) => {
        const item = document.createElement('article');
        item.className = 'exercise-item';
        item.dataset.sourceCard = itemData.sourceCard || '';
        item.dataset.date = dateKey;

        if (itemData.checked) {
            item.classList.add('completed');
        }

        item.innerHTML = buildTodayItemMarkup(itemData);
        todayList.appendChild(item);
    });

    updateWorkoutCardTitle(dateKey);
    updateWorkoutCardLabel(dateKey);
    syncCalendarDayState(dateKey);
}

function saveCardToDate(card, dateKey) {
    const todayList = document.querySelector('#todayExerciseList');

    if (!todayList || !dateKey) {
        return;
    }

    const data =
        card.dataset.exerciseData
            ? JSON.parse(card.dataset.exerciseData)
            : null;

    if (!data) {
        return;
    }

    const items = getSavedWorkoutForDate(dateKey);
    const cardId = card.dataset.cardId;
    const index = items.findIndex((item) => item.sourceCard === cardId);

    const previousItem = items[index] || null;

    const itemData = {
        ...data,
        sourceCard: cardId,
        date: dateKey,
        checked: previousItem ? Boolean(previousItem.checked) : false
    };

    if (index >= 0) {
        items[index] = itemData;
    } else {
        items.push(itemData);
    }

    saveWorkoutForDate(dateKey, items);

    if (dateKey === getSelectedDateKey()) {
        renderWorkoutListForDate(dateKey);
    }

    return true;
}

function saveCardToToday(card) {
    const today = new Date();
    const dateKey = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');

    if (saveCardToDate(card, dateKey)) {
        showSaveConfirmation('Workout saved for today.');
    }
}

function openDatePickerModal(card) {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const minDate = new Date(todayDate);
    minDate.setDate(minDate.getDate() - 30);

    const defaultDate = new Date(todayDate);
    defaultDate.setDate(defaultDate.getDate() - 1);

    const modal = document.querySelector('.date-picker-modal');

    if (!modal) {
        const modalMarkup = `
            <div class="date-picker-modal" aria-hidden="true">
                <div class="date-picker-backdrop" data-close="true"></div>
                <div class="date-picker-panel" role="dialog" aria-modal="true" aria-labelledby="datePickerTitle">
                    <div class="date-picker-header">
                        <span class="date-picker-kicker">SAVE TO PAST DAY</span>
                        <h3 id="datePickerTitle">Choose a date</h3>
                    </div>

                    <p class="date-picker-copy">
                        Pick any day between <strong id="datePickerRange"></strong>.
                    </p>

                    <label class="date-picker-field" for="pastDateInput">
                        <span>Workout date</span>
                        <input id="pastDateInput" type="date" />
                    </label>

                    <p class="date-picker-error" aria-live="polite"></p>

                    <div class="date-picker-actions">
                        <button type="button" class="date-picker-cancel">Cancel</button>
                        <button type="button" class="date-picker-confirm">Save</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalMarkup);
    }

    const activeModal = document.querySelector('.date-picker-modal');
    const dateInput = activeModal.querySelector('#pastDateInput');
    const rangeLabel = activeModal.querySelector('#datePickerRange');
    const errorLabel = activeModal.querySelector('.date-picker-error');
    const cancelButton = activeModal.querySelector('.date-picker-cancel');
    const confirmButton = activeModal.querySelector('.date-picker-confirm');

    dateInput.min = minDate.toISOString().slice(0, 10);
    dateInput.max = defaultDate.toISOString().slice(0, 10);
    dateInput.value = defaultDate.toISOString().slice(0, 10);

    rangeLabel.textContent = `${minDate.toISOString().slice(0, 10)} to ${defaultDate.toISOString().slice(0, 10)}`;
    errorLabel.textContent = '';
    activeModal.classList.add('active');
    activeModal.setAttribute('aria-hidden', 'false');

    const closeModal = () => {
        activeModal.classList.remove('active');
        activeModal.setAttribute('aria-hidden', 'true');
    };

    const handleConfirm = () => {
        const chosenDate = dateInput.value;

        if (!chosenDate) {
            errorLabel.textContent = 'Please choose a valid date.';
            return;
        }

        const normalized = new Date(chosenDate + 'T00:00:00');
        const isValidDate = !Number.isNaN(normalized.getTime());
        const isAllowed =
            isValidDate &&
            normalized >= minDate &&
            normalized < todayDate;

        if (!isAllowed) {
            errorLabel.textContent = 'Please choose a date within the last 30 days.';
            return;
        }

        closeModal();
        saveCardToDate(card, chosenDate);
        showSaveConfirmation(`Workout saved for ${chosenDate}.`);

        selectedDate = chosenDate;
        markSelected(chosenDate); 
    };

    cancelButton.onclick = () => closeModal();
    confirmButton.onclick = handleConfirm;

    activeModal.querySelector('[data-close="true"]').onclick = () => closeModal();
    dateInput.onkeydown = (event) => {
        if (event.key === 'Enter') {
            handleConfirm();
        }
    };
}

function saveCardToPreviousDay(card) {
    openDatePickerModal(card);
}

// =========================================================
// CALENDÁRIO — CARROSSEL DE DATAS REAIS (semana a semana)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    const calendar = document.querySelector('#workoutCalendar');
    const monthTitle = document.querySelector('#calendarMonthTitle');
    const prevButton = document.querySelector('#calendarPrev');
    const nextButton = document.querySelector('#calendarNext');

    if (!calendar) return;

    const dayCells = Array.from(calendar.querySelectorAll('.calendar-day'));

    const monthNames = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentMonday = new Date(today);
    const todayDow = (today.getDay() + 6) % 7; // 0 = segunda
    currentMonday.setDate(today.getDate() - todayDow);

    let weekOffset = 0;
    selectedDate = toDateKey(today);

    const MIN_WEEK_OFFSET = -4; // até 1 mês pra trás
    const MAX_WEEK_OFFSET = 0;  // não deixa ir pro futuro

    function toDateKey(date) {
        return date.toISOString().slice(0, 10);
    }

    function renderWeek() {

        const monday = new Date(currentMonday);
        monday.setDate(monday.getDate() + (weekOffset * 7));

        const visibleDates = [];

        dayCells.forEach((cell, index) => {

            const date = new Date(monday);
            date.setDate(monday.getDate() + index);

            const dateKey = toDateKey(date);
            visibleDates.push(dateKey);
            cell.dataset.date = dateKey;

            let numberEl = cell.querySelector('.day-number');
            if (!numberEl) {
                numberEl = document.createElement('span');
                numberEl.className = 'day-number';
                cell.insertBefore(numberEl, cell.firstChild);
            }
            numberEl.textContent = date.getDate();

            cell.classList.remove('active', 'selected', 'past');
            cell.classList.toggle('past', date < today);

            const oldToday = cell.querySelector('.today-label');
            if (oldToday) oldToday.remove();

            const oldSelected = cell.querySelector('.selected-label');
            if (oldSelected) oldSelected.remove();

            if (dateKey === toDateKey(today)) {
                cell.classList.add('active');
                const label = document.createElement('div');
                label.className = 'today-label';
                label.textContent = 'Today';
                cell.insertBefore(label, cell.firstChild);
            }
        });

        if (!visibleDates.includes(selectedDate)) {
            selectedDate = visibleDates.includes(toDateKey(today))
                ? toDateKey(today)
                : visibleDates[0];
        }

        dayCells.forEach((cell) => {
            if (cell.dataset.date) {
                syncCalendarDayState(cell.dataset.date);
            }
        });

        markSelected(selectedDate);
        syncSelectedWorkoutList();

        if (monthTitle) {
            monthTitle.textContent = `Workout in ${monthNames[monday.getMonth()]}`;
        }

        if (prevButton) prevButton.disabled = weekOffset <= MIN_WEEK_OFFSET;
        if (nextButton) nextButton.disabled = weekOffset >= MAX_WEEK_OFFSET;
    }

    function markSelected(dateKey) {

        dayCells.forEach((cell) => {
            const oldSelected = cell.querySelector('.selected-label');
            if (oldSelected) oldSelected.remove();
            cell.classList.remove('selected');

            if (cell.dataset.date === dateKey) {
                cell.classList.add('selected');
                const label = document.createElement('div');
                label.className = 'selected-label';
                label.textContent = 'Selected';
                cell.appendChild(label);
            }
        });

        document.dispatchEvent(
            new CustomEvent('workout:dateSelected', { detail: { date: dateKey } })
        );
    }

    calendar.addEventListener('click', (event) => {
        const cell = event.target.closest('.calendar-day');
        if (cell && cell.dataset.date) {
            const previousDate = selectedDate;
            const nextDate = cell.dataset.date;

            if (previousDate && previousDate !== nextDate) {
                restoreConfirmedWorkoutState(previousDate);
            }

            selectedDate = nextDate;
            markSelected(selectedDate);
            syncSelectedWorkoutList();
        }
    });

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (weekOffset > MIN_WEEK_OFFSET) { weekOffset -= 1; renderWeek(); }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (weekOffset < MAX_WEEK_OFFSET) { weekOffset += 1; renderWeek(); }
        });
    }

    renderWeek();
    syncSelectedWorkoutList();

    document.addEventListener('workout:dateSelected', (event) => {
        const selected = event.detail && event.detail.date;
        if (selected) {
            renderWorkoutListForDate(selected);
        }
    });

});
// =========================================================
// ANIMAÇÃO DE ENTRADA DA WORKOUT PAGE
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    const container =
        document.querySelector('.workout-container');

    const calendar =
        document.querySelector('.workout-calendar');

    const card =
        document.querySelector('.workout-card');


    if (!container || !calendar || !card) {
        return;
    }


    const CONTAINER_DURATION = 800;


    container.offsetHeight;

    container.classList.add('is-visible');


    setTimeout(() => {

        calendar.offsetHeight;
        calendar.classList.add('is-visible');

        card.offsetHeight;
        card.classList.add('is-visible');

    }, CONTAINER_DURATION);

});

// =========================================================
// EXERCISE FORM TRANSITION + TODAY'S WORKOUT SYNC
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    const workoutStage =
        document.querySelector('.workout-stage');

    const exerciseFormClose =
        document.querySelector('#exerciseFormClose');

    const exerciseFormCancel =
        document.querySelector('#exerciseFormCancel');

    const exerciseFormSave =
        document.querySelector('#exerciseFormSave');

    const exerciseFormTitle =
        document.querySelector('#exerciseFormTitle');

    const exerciseNameInput =
        document.querySelector('#exerciseName');

    const exerciseCategorySelect =
        document.querySelector('#exerciseCategory');

    const targetSetsInput =
        document.querySelector('#targetSets');

    const targetRepsInput =
        document.querySelector('#targetReps');

    const completedSetsInput =
        document.querySelector('#completedSets');

    const completedRepsInput =
        document.querySelector('#completedReps');

    const exerciseWeightInput =
        document.querySelector('#exerciseWeight');

    const addExerciseButton =
        document.querySelector('#addExerciseButton');

    const todayList =
        document.querySelector('#todayExerciseList');


    if (!workoutStage) {
        return;
    }

    populateExerciseOptions(
        exerciseCategorySelect ? exerciseCategorySelect.value : 'push'
    );


    // card que está sendo editado no momento (fonte dos dados)
    let currentCard = null;

    // item do TODAY'S WORKOUT que deve ser sincronizado ao salvar
    // (só é usado quando o Save foi aberto a partir do botão
    // editar de um item do TODAY'S WORKOUT)
    let currentTodayItem = null;


    // =========================================
    // RENDERIZAR CARD VAZIO
    // =========================================

    function renderEmptyCard(card) {

        card.classList.remove('filled');

        delete card.dataset.exerciseData;

        card.innerHTML = `
            <div class="exercise-card-icon">+</div>
            <span class="exercise-card-title">Add Exercise</span>
        `;
    }


    // =========================================
    // RENDERIZAR CARD PREENCHIDO (carrossel)
    // =========================================

    function renderFilledCard(card, data) {

        card.classList.add('filled');

        card.dataset.exerciseData = JSON.stringify(data);

        const weightLine =
            data.weight
                ? ` · ${data.weight}kg`
                : '';

        card.innerHTML = `
            <span class="exercise-card-name">${data.name}</span>
            <span class="exercise-card-target">${data.targetSets || 0} × ${data.targetReps || 0}</span>
            <span class="exercise-card-stats">${data.sets || 0} Sets · ${data.reps || 0} Reps${weightLine}</span>
            <div class="exercise-card-actions">
                <button type="button" class="exercise-card-save">Save to Today</button>
                <button type="button" class="exercise-card-save-past">Save to Previous Day</button>
            </div>
        `;
    }


    // =========================================
    // LIMPAR FORMULÁRIO
    // =========================================

    function clearForm() {

        if (exerciseFormTitle) {
            exerciseFormTitle.textContent = 'Add Exercise';
        }

        if (exerciseNameInput) {
            exerciseNameInput.value = '';
        }

        if (targetSetsInput) {
            targetSetsInput.value = '';
        }

        if (targetRepsInput) {
            targetRepsInput.value = '';
        }

        if (completedSetsInput) {
            completedSetsInput.value = '';
        }

        if (completedRepsInput) {
            completedRepsInput.value = '';
        }

        if (exerciseWeightInput) {
            exerciseWeightInput.value = '';
        }
    }


    // =========================================
    // PREENCHER FORMULÁRIO COM DADOS EXISTENTES
    // =========================================

    function fillForm(data) {

        if (exerciseFormTitle) {
            exerciseFormTitle.textContent = data.name || 'Edit Exercise';
        }

        if (exerciseNameInput) {
            exerciseNameInput.value = data.name || '';
        }

        if (targetSetsInput) {
            targetSetsInput.value = data.targetSets || '';
        }

        if (targetRepsInput) {
            targetRepsInput.value = data.targetReps || '';
        }

        if (completedSetsInput) {
            completedSetsInput.value = data.sets || '';
        }

        if (completedRepsInput) {
            completedRepsInput.value = data.reps || '';
        }

        if (exerciseWeightInput) {
            exerciseWeightInput.value = data.weight || '';
        }
    }


    // =========================================
    // ABRIR FORMULÁRIO — AO CLICAR NO CARD DO CARROSSEL
    // =========================================

    const exerciseCards =
        document.querySelectorAll('.exercise-card');

    exerciseCards.forEach((card, index) => {

        // id estável pra ligar o card ao item do TODAY'S WORKOUT
        card.dataset.cardId = `card-${index}`;

        card.addEventListener('click', (event) => {

            // clicou no botão "Save to Today" -> não abre o form
            const saveBtn =
                event.target.closest('.exercise-card-save');

            if (saveBtn) {
                event.stopPropagation();
                saveCardToToday(card);
                return;
            }

            const previousDayBtn =
                event.target.closest('.exercise-card-save-past');

            if (previousDayBtn) {
                event.stopPropagation();
                saveCardToPreviousDay(card);
                return;
            }


            currentCard = card;
            currentTodayItem = null;


            const categoryPanel =
                card.closest('.category-panel');

            const category =
                categoryPanel
                    ? categoryPanel.dataset.category
                    : '';

            populateExerciseOptions(category);


            const existingData =
                card.dataset.exerciseData
                    ? JSON.parse(card.dataset.exerciseData)
                    : null;

            if (existingData) {
                fillForm(existingData);
            } else {
                clearForm();
            }


            if (exerciseCategorySelect && category) {
                exerciseCategorySelect.value = category;
                exerciseCategorySelect.disabled = true;
            }


            workoutStage.classList.add('form-open');

        });

    });

    function askToRemoveExercise(item) {
        const workoutCard = document.querySelector('.workout-card');
        const confirmationHost = workoutCard || workoutStage;
        const existing = confirmationHost.querySelector('.exercise-remove-confirm');

        if (existing) {
            return;
        }

        const confirmation = document.createElement('div');
        confirmation.className = 'exercise-close-confirm exercise-remove-confirm';
        confirmation.innerHTML = `
            <div class="exercise-close-confirm-box">
                <span class="exercise-close-label">REMOVE EXERCISE</span>
                <h3>Remove this exercise?</h3>
                <p>This exercise will be removed from the selected workout.</p>
                <div class="exercise-close-actions">
                    <button type="button" class="exercise-stay-button">Cancel</button>
                    <button type="button" class="exercise-leave-button">Remove</button>
                </div>
            </div>
        `;

        confirmationHost.appendChild(confirmation);
        requestAnimationFrame(() => confirmation.classList.add('active'));

        const closeConfirmation = () => {
            confirmation.classList.remove('active');
            setTimeout(() => confirmation.remove(), 300);
        };

        confirmation
            .querySelector('.exercise-stay-button')
            .addEventListener('click', closeConfirmation);

        confirmation
            .querySelector('.exercise-leave-button')
            .addEventListener('click', () => {
                const dateKey = item.dataset.date || getSelectedDateKey();
                const sourceCard = item.dataset.sourceCard;
                const items = getSavedWorkoutForDate(dateKey)
                    .filter((entry) => entry.sourceCard !== sourceCard);

                saveWorkoutForDate(dateKey, items);

                if (!items.length && dayCompletionStore.get(dateKey) === 'day-done') {
                    dayCompletionStore.delete(dateKey);
                }

                if (confirmedWorkoutStore.has(dateKey)) {
                    confirmedWorkoutStore.set(dateKey, copyEntries(items));
                }

                closeConfirmation();
                renderWorkoutListForDate(dateKey);
            });
    }


    // =========================================
    // AÇÕES DENTRO DO TODAY'S WORKOUT
    // (editar / remover / marcar checkbox)
    // =========================================

    if (todayList) {

        todayList.addEventListener('click', (event) => {

            const checkbox =
                event.target.closest('input[type="checkbox"]');

            if (checkbox) {
                const item = checkbox.closest('.exercise-item');

                if (item) {
                    const itemDate = item.dataset.date || getSelectedDateKey();
                    const sourceCard = item.dataset.sourceCard;
                    const items = getSavedWorkoutForDate(itemDate);
                    const matchingIndex = items.findIndex((entry) => entry.sourceCard === sourceCard);

                    if (matchingIndex >= 0) {
                        items[matchingIndex].checked = checkbox.checked;
                        saveWorkoutForDate(itemDate, items);
                    }

                    item.classList.toggle('completed', checkbox.checked);
                }

                return;
            }

            // REMOVER

            const removeBtn =
                event.target.closest('.exercise-item-remove');

            if (removeBtn) {

                const item =
                    removeBtn.closest('.exercise-item');

                if (item) {
                    askToRemoveExercise(item);
                }

                return;
            }


            // EDITAR — mesma ação do "+ Add Exercise",
            // mas já abre o form preenchido

            const editBtn =
                event.target.closest('.exercise-item-edit');

            if (editBtn) {

                const item =
                    editBtn.closest('.exercise-item');

                const cardId =
                    item ? item.dataset.sourceCard : null;

                const sourceCard =
                    cardId
                        ? document.querySelector(
                            `.exercise-card[data-card-id="${cardId}"]`
                          )
                        : null;

                if (!sourceCard) {
                    return;
                }

                const data =
                    sourceCard.dataset.exerciseData
                        ? JSON.parse(sourceCard.dataset.exerciseData)
                        : null;

                if (!data) {
                    return;
                }

                currentCard = sourceCard;
                currentTodayItem = item;

                const categoryPanel =
                    sourceCard.closest('.category-panel');

                const category =
                    categoryPanel
                        ? categoryPanel.dataset.category
                        : '';

                populateExerciseOptions(category, data.name);

                fillForm(data);

                if (exerciseCategorySelect && category) {
                    exerciseCategorySelect.value = category;
                    exerciseCategorySelect.disabled = true;
                }


                // desce até a seção do seletor, igual o
                // botão "+ Add Exercise", e então abre o form

                if (addExerciseButton) {
                    addExerciseButton.click();
                }

                setTimeout(() => {
                    workoutStage.classList.add('form-open');
                }, 1100);

                return;
            }


        });

    }


    // =========================================
    // CONFIRMAÇÃO DE SAÍDA
    // =========================================

    function askToClose() {

        const existing =
            workoutStage.querySelector('.exercise-close-confirm');

        if (existing) {
            return;
        }


        const confirmation =
            document.createElement('div');

        confirmation.className =
            'exercise-close-confirm';


        confirmation.innerHTML = `

            <div class="exercise-close-confirm-box">

                <span class="exercise-close-label">
                    UNSAVED CHANGES
                </span>

                <h3>
                    Leave this exercise?
                </h3>

                <p>
                    Your information has not been saved.
                    Do you want to leave?
                </p>

                <div class="exercise-close-actions">

                    <button type="button" class="exercise-stay-button">
                        Stay
                    </button>

                    <button type="button" class="exercise-leave-button">
                        Leave
                    </button>

                </div>

            </div>

        `;


        workoutStage.appendChild(confirmation);


        requestAnimationFrame(() => {
            confirmation.classList.add('active');
        });


        confirmation
            .querySelector('.exercise-stay-button')
            .addEventListener('click', () => {

                confirmation.classList.remove('active');

                setTimeout(() => {
                    confirmation.remove();
                }, 300);

            });


        confirmation
            .querySelector('.exercise-leave-button')
            .addEventListener('click', () => {

                confirmation.classList.remove('active');

                setTimeout(() => {
                    confirmation.remove();
                    closeForm();
                }, 250);

            });

    }


    // =========================================
    // FECHAR FORMULÁRIO
    // =========================================

    function closeForm() {

        workoutStage.classList.remove('form-open');

        if (exerciseCategorySelect) {
            exerciseCategorySelect.disabled = false;
        }

        currentCard = null;
        currentTodayItem = null;
    }


    if (exerciseFormClose) {
        exerciseFormClose.addEventListener('click', askToClose);
    }

    if (exerciseFormCancel) {
        exerciseFormCancel.addEventListener('click', askToClose);
    }


    function showFieldError(field, message) {
        if (!field) return;

        const formGroup = field.closest('.exercise-form-group');
        const messageEl = formGroup ? formGroup.querySelector('.field-error-message') : null;

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

        const formGroup = field.closest('.exercise-form-group');
        const messageEl = formGroup ? formGroup.querySelector('.field-error-message') : null;

        if (formGroup) {
            formGroup.classList.remove('is-invalid');
        }

        if (messageEl) {
            messageEl.textContent = '';
            messageEl.classList.remove('visible');
        }
    }

    function validateExerciseName(field) {
        if (!field) return true;

        const value = field.value.trim();
        if (field.tagName === 'SELECT' && value === '') {
            showFieldError(field, 'Please select an exercise.');
            return false;
        }

        const isValid = value === '' || /^[A-Za-zÀ-ÿ\s'-]+$/.test(value);

        if (!isValid) {
            showFieldError(field, 'Please use letters only for the exercise name.');
            return false;
        }

        clearFieldError(field);
        return true;
    }

    function validateNumericField(field, label) {
        if (!field) return true;

        const value = field.value.trim();
        const isValid = value === '' || /^\d+$/.test(value);

        if (!isValid) {
            showFieldError(field, `Please use numbers only for ${label}.`);
            return false;
        }

        clearFieldError(field);
        return true;
    }

    const validationFields = [
        { field: exerciseNameInput, type: 'name' },
        { field: targetSetsInput, type: 'number', label: 'target sets' },
        { field: targetRepsInput, type: 'number', label: 'target reps' },
        { field: completedSetsInput, type: 'number', label: 'sets' },
        { field: completedRepsInput, type: 'number', label: 'reps' },
        { field: exerciseWeightInput, type: 'number', label: 'weight' }
    ];

    validationFields.forEach(({ field, type, label }) => {
        if (!field) return;

        field.addEventListener('input', () => {
            if (type === 'name') {
                validateExerciseName(field);
            } else {
                validateNumericField(field, label);
            }
        });
    });

    // =========================================
    // SALVAR — MANDA OS DADOS PRO CARD
    // (e sincroniza o item do TODAY'S WORKOUT, se houver)
    // =========================================

    if (exerciseFormSave) {

        exerciseFormSave.addEventListener('click', () => {

            if (!currentCard) {
                closeForm();
                return;
            }

            const nameValid = validateExerciseName(exerciseNameInput);
            const numericValid = [
                { field: targetSetsInput, label: 'target sets' },
                { field: targetRepsInput, label: 'target reps' },
                { field: completedSetsInput, label: 'sets' },
                { field: completedRepsInput, label: 'reps' },
                { field: exerciseWeightInput, label: 'weight' }
            ].every(({ field, label }) => validateNumericField(field, label));

            if (!nameValid || !numericValid) {
                alert('Please correct the highlighted fields before saving.');
                return;
            }

            const nameValue = exerciseNameInput ? exerciseNameInput.value.trim() : '';
            const data = {
                name: nameValue,
                targetSets: targetSetsInput ? targetSetsInput.value : '',
                targetReps: targetRepsInput ? targetRepsInput.value : '',
                sets: completedSetsInput ? completedSetsInput.value : '',
                reps: completedRepsInput ? completedRepsInput.value : '',
                weight: exerciseWeightInput ? exerciseWeightInput.value : ''
            };

            if (!data.name) {
                closeForm();
                return;
            }


            renderFilledCard(currentCard, data);

            if (currentTodayItem) {
                currentTodayItem.innerHTML = buildTodayItemMarkup(data);
            }

            closeForm();

        });

    }

});


// =========================================================
// COMPLETE WORKOUT — DEIXA O DIA ATUAL VERDE
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    const completeWorkoutButton =
        document.querySelector('#completeWorkoutButton');

    const todayList =
        document.querySelector('#todayExerciseList');

    if (!completeWorkoutButton) {
        return;
    }

    completeWorkoutButton.addEventListener('click', () => {
        const selectedKey = getSelectedDateKey();

        if (!selectedKey) {
            return;
        }

        applyCompletedWorkoutState(selectedKey);
    });

});


// =========================================================
// SCROLL-LOCK ENTRE SEÇÃO 1 E SEÇÃO 2
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    const section1 =
        document.querySelector('.workout-page');

    const section2 =
        document.querySelector('.workout-selector');

    const addExerciseButton =
        document.querySelector('#addExerciseButton');


    if (!section1 || !section2) {
        return;
    }


    let isScrolling = false;

    const SCROLL_DURATION = 900;


    function updateWorkoutGateState() {

        const scrollPosition = window.scrollY;
        const section2Top = section2.offsetTop;

        if (scrollPosition >= section2Top - 50) {
            section2.classList.add('workout-open');
        } else {
            section2.classList.remove('workout-open');
        }
    }

    updateWorkoutGateState();


    function smoothScrollTo(target) {

        if (isScrolling) {
            return;
        }

        isScrolling = true;

        const startPosition = window.scrollY;
        const targetPosition = target.offsetTop;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();


        if (target === section2) {
            section2.classList.remove('workout-open');
        }


        function animateScroll(currentTime) {

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / SCROLL_DURATION, 1);

            const ease =
                progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, startPosition + distance * ease);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {

                isScrolling = false;

                if (target === section2) {
                    setTimeout(() => {
                        section2.classList.add('workout-open');
                    }, 180);
                }

            }

        }

        requestAnimationFrame(animateScroll);

    }


    if (addExerciseButton) {

        addExerciseButton.addEventListener('click', () => {
            smoothScrollTo(section2);
        });

    }


    window.addEventListener(
    'wheel',
    (event) => {

        const workoutStage =
            document.querySelector('.workout-stage');

        if (
            workoutStage &&
            workoutStage.classList.contains('form-open')
        ) {

            const formPage =
                document.querySelector('.exercise-form-page');

            if (formPage) {

                event.preventDefault();

                formPage.scrollTop += event.deltaY;

            }

            return;
        }


        if (isScrolling) {
            event.preventDefault();
            return;
        }
            const currentScroll = window.scrollY;
            const section1Top = section1.offsetTop;
            const section2Top = section2.offsetTop;


            if (event.deltaY > 0 && currentScroll < section2Top - 10) {
                event.preventDefault();
                smoothScrollTo(section2);
            }

            else if (event.deltaY < 0 && currentScroll > section1Top + 10) {
                event.preventDefault();

                section2.classList.remove('workout-open');

                smoothScrollTo(section1);
            }

        },
        { passive: false }
    );

});


// =========================================================
// NÍVEL DE FORA — CATEGORY CAROUSEL (sistema solar de categorias)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    const panels = document.querySelectorAll('.category-panel');
    const navLeft = document.querySelector('.category-nav-left');
    const navRight = document.querySelector('.category-nav-right');

    if (panels.length !== 4) {
        return;
    }

    const positions = {
        front: { transform: 'translate(-50%, -50%) translateZ(220px) scale(1)', zIndex: 4, opacity: 1, filter: 'brightness(1)' },
        left:  { transform: 'translate(-50%, -50%) translateX(-440px) rotateY(50deg) scale(0.8)', zIndex: 3, opacity: 0.6, filter: 'brightness(0.6)' },
        back:  { transform: 'translate(-50%, -50%) translateZ(-220px) scale(0.7)', zIndex: 1, opacity: 0, filter: 'brightness(0.3)' },
        right: { transform: 'translate(-50%, -50%) translateX(440px) rotateY(-50deg) scale(0.8)', zIndex: 3, opacity: 0.6, filter: 'brightness(0.6)' }
    };

    let order = [0, 1, 2, 3];

    function updateCategoryCarousel() {
        const positionNames = ['front', 'left', 'back', 'right'];

        panels.forEach((panel, index) => {
            const positionIndex = order.indexOf(index);
            const settings = positions[positionNames[positionIndex]];

            panel.style.transform = settings.transform;
            panel.style.zIndex = settings.zIndex;
            panel.style.opacity = settings.opacity;
            panel.style.filter = settings.filter;

            panel.style.pointerEvents =
                positionNames[positionIndex] === 'front' ? 'auto' : 'none';
        });
    }

    function rotateLeft() {
        order = [order[3], order[0], order[1], order[2]];
        updateCategoryCarousel();
    }

    function rotateRight() {
        order = [order[1], order[2], order[3], order[0]];
        updateCategoryCarousel();
    }

    if (navLeft) navLeft.addEventListener('click', rotateRight);
    if (navRight) navRight.addEventListener('click', rotateLeft);

    updateCategoryCarousel();

});


// =========================================================
// NÍVEL DE DENTRO — EXERCISE CAROUSEL (uma instância por conjunto)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    const carousels = document.querySelectorAll('.exercise-carousel');

    const positions = {
        front: { transform: 'translate(-50%, -50%) translateZ(160px) scale(1)', zIndex: 4, opacity: 1, filter: 'brightness(1)' },
        left:  { transform: 'translate(-50%, -50%) translateX(-150px) rotateY(55deg) scale(0.85)', zIndex: 3, opacity: 0.7, filter: 'brightness(0.7)' },
        back:  { transform: 'translate(-50%, -50%) translateZ(-160px) scale(0.8)', zIndex: 1, opacity: 0.25, filter: 'brightness(0.45)' },
        right: { transform: 'translate(-50%, -50%) translateX(150px) rotateY(-55deg) scale(0.85)', zIndex: 3, opacity: 0.7, filter: 'brightness(0.7)' }
    };

    carousels.forEach((carousel) => {

        const cards = carousel.querySelectorAll('.exercise-card');
        const navLeft = carousel.querySelector('.exercise-nav-left');
        const navRight = carousel.querySelector('.exercise-nav-right');

        if (cards.length !== 4) {
            return;
        }

        let order = [0, 1, 2, 3];

        function updateCarousel() {
            const positionNames = ['front', 'left', 'back', 'right'];

            cards.forEach((card, index) => {
                const positionIndex = order.indexOf(index);
                const settings = positions[positionNames[positionIndex]];

                card.style.transform = settings.transform;
                card.style.zIndex = settings.zIndex;
                card.style.opacity = settings.opacity;
                card.style.filter = settings.filter;

                card.style.pointerEvents =
                    positionNames[positionIndex] === 'front' ? 'auto' : 'none';
            });
        }

        function rotateLeft() {
            order = [order[3], order[0], order[1], order[2]];
            updateCarousel();
        }

        function rotateRight() {
            order = [order[1], order[2], order[3], order[0]];
            updateCarousel();
        }

        if (navLeft) {
            navLeft.addEventListener('click', (event) => {
                event.stopPropagation();
                rotateRight();
            });
        }

        if (navRight) {
            navRight.addEventListener('click', (event) => {
                event.stopPropagation();
                rotateLeft();
            });
        }

        updateCarousel();

    });

});