document.addEventListener('DOMContentLoaded', () => {

  const profilePanel =
    document.querySelector('.profile-panel');

  if (!profilePanel) {
    return;
  }

  // Força o navegador a reconhecer o estado inicial
  profilePanel.offsetHeight;

  // Inicia a animação
  requestAnimationFrame(() => {
    profilePanel.classList.add('is-visible');
  });

});