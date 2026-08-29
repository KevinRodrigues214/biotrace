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


    // Duração da transição do container, em ms
    // (precisa bater com o "0.6s" definido no CSS acima)
    const CONTAINER_DURATION = 800;


    // =========================================
    // 1º: CONTAINER SOBE
    // =========================================

    container.offsetHeight; // força o estado inicial

    container.classList.add('is-visible');


    // =========================================
    // 2º e 3º: CALENDAR + CARD, DEPOIS QUE
    // O CONTAINER TERMINAR
    // =========================================

    setTimeout(() => {

        calendar.offsetHeight;
        calendar.classList.add('is-visible');

        card.offsetHeight;
        card.classList.add('is-visible');

    }, CONTAINER_DURATION);

});// =========================================================
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


    // =========================================
    // SCROLL SUAVE (mesma técnica da Nutrition)
    // =========================================

    function smoothScrollTo(target) {

        if (isScrolling) {
            return;
        }

        isScrolling = true;

        const startPosition = window.scrollY;
        const targetPosition = target.offsetTop;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();


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
            }

        }

        requestAnimationFrame(animateScroll);

    }


    // =========================================
    // BOTÃO "+ ADD EXERCISE" DESCE PRA SEÇÃO 2
    // =========================================

    if (addExerciseButton) {

        addExerciseButton.addEventListener('click', () => {
            smoothScrollTo(section2);
        });

    }


    // =========================================
    // SCROLL VIA RODA DO MOUSE (sem parar no meio)
    // =========================================

    window.addEventListener(
        'wheel',
        (event) => {

            if (isScrolling) {
                event.preventDefault();
                return;
            }

            const currentScroll = window.scrollY;
            const section1Top = section1.offsetTop;
            const section2Top = section2.offsetTop;


            // Descer pra Seção 2

            if (event.deltaY > 0 && currentScroll < section2Top - 10) {
                event.preventDefault();
                smoothScrollTo(section2);
            }

            // Subir pra Seção 1

            else if (event.deltaY < 0 && currentScroll > section1Top + 10) {
                event.preventDefault();
                smoothScrollTo(section1);
            }

        },
        { passive: false }
    );

});// =========================================================
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