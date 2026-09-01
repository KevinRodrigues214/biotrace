function getInitialsFromName(username) {
    const Namesparts = username.trim().split(/\s+/).filter(Boolean);

    if (!Namesparts.length) {
        return 'US';
    }

    if (Namesparts.length >= 2) {
        return (Namesparts[0][0] + Namesparts[Namesparts.length - 1][0]).toUpperCase();
    }

    return Namesparts[0].substring(0, 2).toUpperCase();
}

function inicializarHeader() {
    const loggedUser = (sessionStorage.getItem('logged_user') || '').trim();
    const currentPath = window.location.pathname.toLowerCase();
    const loginPath = '/pages/loginandregistration/';

    if (!loggedUser) {
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

    userNameElement.textContent = loggedUser;

    const initials = getInitialsFromName(loggedUser);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1a1f26&color=fff&bold=true&length=2`;

    userAvatarElement.src = avatarUrl;
    userAvatarElement.alt = `Avatar de ${loggedUser}`;

    topbar.classList.add('header-animate-in');
    if (navList) {
        navList.classList.add('nav-animate-in');
    }

    console.log('Success! Animated and updated header with initials:', initials);
}

window.applyUserHeader = inicializarHeader;

document.addEventListener('DOMContentLoaded', inicializarHeader);
