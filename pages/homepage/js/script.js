const proofColumns = document.querySelectorAll('.proof-col');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {

    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    } else {
      entry.target.classList.remove('is-visible');
    }

  });
}, {
  threshold: 0.2
});

proofColumns.forEach(col => observer.observe(col));


// ===============================
// HERO - SCROLL ANIMATION
// ===============================

const heroContent = document.querySelector('.hero-content');

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  // Descendo
  if (currentScrollY > lastScrollY && currentScrollY > 50) {
    heroContent.classList.add('hero-content-hidden');
  }

  // Subindo
  else if (currentScrollY < lastScrollY) {
    heroContent.classList.remove('hero-content-hidden');
  }

  lastScrollY = currentScrollY;
});