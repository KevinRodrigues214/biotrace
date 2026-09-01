document.addEventListener('DOMContentLoaded', () => {
  const profilePanel = document.querySelector('.profile-panel');
  const logoutButton = document.getElementById('logoutButton');
  const profileForm = document.getElementById('profileForm');
  const profileKey = 'profile_data';
  const userKey = 'logged_user';

  const loadSavedProfile = () => {
    try {
      return JSON.parse(sessionStorage.getItem(profileKey) || '{}');
    } catch (error) {
      return {};
    }
  };

  const setInputValue = (id, value) => {
    const field = document.getElementById(id);
    if (field && value !== undefined && value !== null && value !== '') {
      field.value = value;
    }
  };

  const savedProfile = loadSavedProfile();
  const currentUserName = (sessionStorage.getItem(userKey) || '').trim();

  if (currentUserName && !savedProfile.profileName) {
    savedProfile.profileName = currentUserName;
  }

  setInputValue('profileName', savedProfile.profileName || currentUserName);
  setInputValue('profileAge', savedProfile.profileAge);
  setInputValue('profileGender', savedProfile.profileGender);
  setInputValue('profileHeight', savedProfile.profileHeight);
  setInputValue('profileWeight', savedProfile.profileWeight);

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      const shouldLogout = window.confirm('Do you want to log out?');

      if (!shouldLogout) {
        return;
      }

      sessionStorage.removeItem(userKey);
      sessionStorage.removeItem(profileKey);
      window.location.href = '/pages/loginAndRegistration/';
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const nextProfile = { ...loadSavedProfile() };
      const fieldIds = ['profileName', 'profileAge', 'profileGender', 'profileHeight', 'profileWeight'];
      let hasChanges = false;

      fieldIds.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const value = field.value.trim();

        if (fieldId === 'profileName' && value) {
          sessionStorage.setItem(userKey, value);
          nextProfile.profileName = value;
          hasChanges = true;
          return;
        }

        if (value !== '') {
          nextProfile[fieldId] = value;
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        alert('No changes detected.');
        return;
      }

      sessionStorage.setItem(profileKey, JSON.stringify(nextProfile));
      alert('Profile updated successfully!');
      window.location.href = '/pages/homepage/';
    });
  }

  if (!profilePanel) {
    return;
  }

  profilePanel.offsetHeight;

  requestAnimationFrame(() => {
    profilePanel.classList.add('is-visible');
  });
});
