function getInitialsFromName(username) {
    const partesDoNome = username.trim().split(/\s+/).filter(Boolean);

    if (!partesDoNome.length) {
        return 'US';
    }

    if (partesDoNome.length >= 2) {
        return (partesDoNome[0][0] + partesDoNome[partesDoNome.length - 1][0]).toUpperCase();
    }

    return partesDoNome[0].substring(0, 2).toUpperCase();
}

function inicializarHeader() {
    const usuarioLogado = (sessionStorage.getItem('usuario_logado') || '').trim();
    const currentPath = window.location.pathname.toLowerCase();
    const loginPath = '/pages/loginandregistration/';

    if (!usuarioLogado) {
        if (!currentPath.startsWith(loginPath) && !currentPath.endsWith('/pages/loginandregistration')) {
            window.location.href = '/pages/loginAndRegistration/';
        }
        return;
    }

    const topbar = document.querySelector('.topbar');
    const navList = document.querySelector('.nav-list');
    const userNameElement = document.getElementById('userName');
    const userAvatarElement = document.getElementById('userAvatar');

    if (!userNameElement || !userAvatarElement || !topbar) {
        return;
    }

    userNameElement.textContent = usuarioLogado;

    const iniciais = getInitialsFromName(usuarioLogado);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(iniciais)}&background=1a1f26&color=fff&bold=true&length=2`;

    userAvatarElement.src = avatarUrl;
    userAvatarElement.alt = `Avatar de ${usuarioLogado}`;

    topbar.classList.add('header-animate-in');
    if (navList) {
        navList.classList.add('nav-animate-in');
    }

    console.log('Sucesso! Header animado e atualizado com as iniciais:', iniciais);
}

window.applyUserHeader = inicializarHeader;

document.addEventListener('DOMContentLoaded', inicializarHeader);
