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

  let order = [1, 2, 3, 4];


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

    order = [

      order[3],
      order[0],
      order[1],
      order[2]

    ];


    updateCarousel();

  }


  // =========================================
  // GIRAR PARA A DIREITA
  // =========================================

  function rotateRight() {

    order = [

      order[1],
      order[2],
      order[3],
      order[0]

    ];


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

  const mealCards =
    document.querySelectorAll(
      '.meal-card, .add-meal-button'
    );


  mealCards.forEach((card) => {

  card.addEventListener(
    'click',
    () => {

      lockPageScroll();

      stage.classList.add(
        'form-open'
      );

    }
  );

});


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

  function closeForm() {

  stage.classList.remove(
    'form-open'
  );

  unlockPageScroll();

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

        // Aqui futuramente vamos
        // salvar os dados no sistema.

        closeForm();

      }
    );

  }

});