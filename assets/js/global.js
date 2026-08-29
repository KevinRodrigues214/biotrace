// =========================================
// HEADER GLOBAL
// =========================================

fetch('/assets/partials/header.html')
  .then(response => response.text())
  .then(html => {

    const headerPlaceholder =
      document.getElementById('header-placeholder');

    if (!headerPlaceholder) {
      return;
    }

    headerPlaceholder.innerHTML = html;


    // =========================================
    // ELEMENTOS DO HEADER
    // =========================================

    const toggle =
      document.querySelector('.nav-toggle');

    const navList =
      document.querySelector('.nav-list');

    const topbar =
      document.querySelector('.topbar');


    // =========================================
    // MENU MOBILE
    // =========================================

    if (toggle && navList) {

      toggle.addEventListener(
        'click',
        () => {

          const isOpen =
            navList.classList.toggle('is-open');

          toggle.setAttribute(
            'aria-expanded',
            isOpen
          );

        }
      );

    }


    // =========================================
    // ANIMAÇÃO DO HEADER
    // =========================================

    if (topbar && navList) {

      // Força o navegador a registrar
      // o estado inicial antes da animação

      topbar.offsetHeight;


      // Animação da navegação

      navList.classList.add(
        'nav-animate-in'
      );


      // Animação do header

      topbar.classList.add(
        'header-animate-in'
      );

    }

  })
  .catch(error => {

    console.error(
      'Erro ao carregar o header:',
      error
    );

  });



// =========================================
// NORMALIZAR CAMINHO
// =========================================
// Remove:
// /index.html
// barra final
//
// Exemplo:
//
// /pages/nutrition/
// /pages/nutrition/index.html
//
// viram:
//
// /pages/nutrition
// =========================================

function normalizePath(path) {

  path =
    path.toLowerCase();

  path =
    path.replace(
      /\/index\.html$/,
      ''
    );

  path =
    path.replace(
      /\/+$/,
      ''
    );

  return path === ''
    ? '/'
    : path;

}



// =========================================
// ORDEM DAS PÁGINAS
// =========================================

const pages = [

  '/pages/homepage',

  '/pages/hologram',

  '/pages/nutrition',

  '/pages/workout',

  '/pages/social',

  '/pages/profile'

];



// =========================================
// GLOBAL PAGE TRANSITION
// =========================================

document.addEventListener(
  'click',
  (event) => {


    // =========================================
    // PEGAR LINK CLICADO
    // =========================================

    const link =
      event.target.closest('a[href]');


    if (!link) {
      return;
    }


    // =========================================
    // PEGAR HREF
    // =========================================

    const href =
      link.getAttribute('href');


    // =========================================
    // IGNORAR LINKS ESPECIAIS
    // =========================================

    if (
      !href ||
      href === '#' ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {

      return;

    }


    // =========================================
    // IGNORAR CTRL / CMD / SHIFT / ALT
    // =========================================

    if (
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {

      return;

    }


    // =========================================
    // IGNORAR NOVA ABA
    // =========================================

    if (
      link.target === '_blank'
    ) {

      return;

    }


    // =========================================
    // TRANSFORMAR HREF EM URL
    // =========================================

    let destination;

    try {

      destination =
        new URL(
          href,
          window.location.href
        );

    } catch (error) {

      console.error(
        'URL inválida:',
        href
      );

      return;

    }


    // =========================================
    // IGNORAR LINKS EXTERNOS
    // =========================================

    if (
      destination.origin !==
      window.location.origin
    ) {

      return;

    }


    // =========================================
    // PÁGINA ATUAL
    // =========================================

    const currentPage =
      normalizePath(
        window.location.pathname
      );


    // =========================================
    // PÁGINA DE DESTINO
    // =========================================

    const destinationPage =
      normalizePath(
        destination.pathname
      );


    // =========================================
    // DEBUG
    // =========================================

    console.log(
      '================================='
    );

    console.log(
      'CLIQUE DETECTADO!'
    );

    console.log(
      'Página atual:',
      currentPage
    );

    console.log(
      'Página destino:',
      destinationPage
    );


    // =========================================
    // MESMA PÁGINA
    // =========================================

    if (
      currentPage ===
      destinationPage
    ) {

      console.log(
        'MESMA PÁGINA → SEM TRANSIÇÃO'
      );

      event.preventDefault();

      return;

    }


    // =========================================
    // DESCOBRIR POSIÇÃO DAS PÁGINAS
    // =========================================

    const currentIndex =
      pages.indexOf(
        currentPage
      );

    const destinationIndex =
      pages.indexOf(
        destinationPage
      );


    // =========================================
    // LIMPAR DIREÇÕES ANTERIORES
    // =========================================

    document.documentElement.classList.remove(
      'page-forward',
      'page-backward'
    );


    // =========================================
    // DEFINIR DIREÇÃO
    // =========================================

    if (
      destinationIndex >
      currentIndex
    ) {

      // =======================================
      // INDO PARA FRENTE
      //
      // HomePage
      //    ↓
      // Hologram
      //    ↓
      // Nutrition
      //    ↓
      // Workout
      // =======================================

      document.documentElement.classList.add(
        'page-forward'
      );

      console.log(
        'DIREÇÃO → FRENTE'
      );


    } else if (
      destinationIndex <
      currentIndex
    ) {

      // =======================================
      // VOLTANDO
      //
      // Profile
      //    ↓
      // Social
      //    ↓
      // Workout
      //    ↓
      // Nutrition
      // =======================================

      document.documentElement.classList.add(
        'page-backward'
      );

      console.log(
        'DIREÇÃO → TRÁS'
      );


    } else {

      // =======================================
      // CASO A PÁGINA NÃO ESTEJA NO ARRAY
      // =======================================

      console.log(
        'PÁGINA NÃO ENCONTRADA NA ORDEM'
      );

    }


    // =========================================
    // IMPEDIR NAVEGAÇÃO NORMAL
    // =========================================

    event.preventDefault();


    // =========================================
    // ESPERAR A ANIMAÇÃO
    // =========================================

    setTimeout(
      () => {

        window.location.href =
          destination.href;

      },
      300
    );

  }
);



// =========================================
// DEBUG
// =========================================

console.log(
  'GLOBAL.JS FOI CARREGADO!'
);