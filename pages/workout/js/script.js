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

});