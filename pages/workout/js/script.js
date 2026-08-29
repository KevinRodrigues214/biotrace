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
    let selectedDate = toDateKey(today);

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

            cell.classList.remove('active', 'selected');

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

        markSelected(selectedDate);

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
            selectedDate = cell.dataset.date;
            markSelected(selectedDate);
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
            </div>
        `;
    }


    // =========================================
    // MARKUP DE UM ITEM NO TODAY'S WORKOUT
    // =========================================

    function buildTodayItemMarkup(data) {

        const weightPart =
            data.weight
                ? ` · ${data.weight}kg`
                : '';

        return `
            <label class="exercise-checkbox">
                <input type="checkbox">
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


    // =========================================
    // ENCONTRAR ITEM DO TODAY'S WORKOUT PELO CARD DE ORIGEM
    // =========================================

    function getTodayItemByCardId(cardId) {

        if (!todayList) {
            return null;
        }

        return todayList.querySelector(
            `.exercise-item[data-source-card="${cardId}"]`
        );
    }


    // =========================================
    // SALVAR CARD -> TODAY'S WORKOUT
    // =========================================

    function saveCardToToday(card) {

        if (!todayList) {
            return;
        }

        const data =
            card.dataset.exerciseData
                ? JSON.parse(card.dataset.exerciseData)
                : null;

        if (!data) {
            return;
        }

        const cardId = card.dataset.cardId;

        let item = getTodayItemByCardId(cardId);

        if (item) {

            item.innerHTML = buildTodayItemMarkup(data);

        } else {

            item = document.createElement('article');

            item.className = 'exercise-item';
            item.dataset.sourceCard = cardId;

            item.innerHTML = buildTodayItemMarkup(data);

            todayList.appendChild(item);
        }
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


            currentCard = card;
            currentTodayItem = null;


            const categoryPanel =
                card.closest('.category-panel');

            const category =
                categoryPanel
                    ? categoryPanel.dataset.category
                    : '';


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


    // =========================================
    // AÇÕES DENTRO DO TODAY'S WORKOUT
    // (editar / remover / marcar checkbox)
    // =========================================

    if (todayList) {

        todayList.addEventListener('click', (event) => {

            // REMOVER

            const removeBtn =
                event.target.closest('.exercise-item-remove');

            if (removeBtn) {

                const item =
                    removeBtn.closest('.exercise-item');

                if (item) {
                    item.remove();
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


            // CHECKBOX — marca/desmarca como concluído

            const checkbox =
                event.target.closest('input[type="checkbox"]');

            if (checkbox) {

                const item =
                    checkbox.closest('.exercise-item');

                if (item) {
                    item.classList.toggle(
                        'completed',
                        checkbox.checked
                    );
                }
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

        // só fica verde se tiver pelo menos um exercício
        // adicionado E com o check marcado
        const hasCheckedExercise =
            todayList &&
            todayList.querySelector('.exercise-item.completed');

        if (!hasCheckedExercise) {
            return;
        }

        const targetDay =
            document.querySelector('.calendar-day.selected') ||
            document.querySelector('.calendar-day.active');

        if (targetDay) {
            targetDay.classList.add('day-done');
        }

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