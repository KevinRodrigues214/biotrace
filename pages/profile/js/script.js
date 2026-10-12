document.addEventListener('DOMContentLoaded', () => {
  const profilePanel = document.querySelector('.profile-panel');
  const logoutButton = document.getElementById('logoutButton');
  const profileForm = document.getElementById('profileForm');
  const profileStatus = document.getElementById('profileStatus');
  const profileSaveButton = profileForm?.querySelector('[type="submit"]');
  let profileExists = false;

  const setStatus = (message, isError = false) => {
    if (profileStatus) {
      profileStatus.textContent = message;
      profileStatus.classList.toggle('is-error', isError);
    }
  };

  const setInputValue = (id, value) => {
    const field = document.getElementById(id);
    if (field && value !== undefined && value !== null) {
      field.value = value;
    }
  };

  async function loadProfile() {
    try {
      const response = await window.BioTraceApi.request('/profile', { authenticated: true });
      const profile = response.profile;
      profileExists = true;
      setInputValue('profileName', profile.user?.name || sessionStorage.getItem('logged_user'));
      setInputValue('profileAge', profile.age);
      setInputValue('profileGender', profile.gender);
      setInputValue('profileHeight', profile.height);
      setInputValue('profileWeight', profile.weight);
    } catch (error) {
      if (error.status === 404) {
        const savedProfile = window.UserStorage.readUserData('profile_data', {});
        setInputValue('profileName', sessionStorage.getItem('logged_user') || '');
        setInputValue('profileAge', savedProfile.profileAge);
        setInputValue('profileGender', savedProfile.profileGender);
        setInputValue('profileHeight', savedProfile.profileHeight);
        setInputValue('profileWeight', savedProfile.profileWeight);
        return;
      }

      setStatus(error.message, true);
      if (profileSaveButton) {
        profileSaveButton.disabled = true;
      }
    }
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      if (!window.confirm('Do you want to log out?')) {
        return;
      }

      window.UserStorage.removeCurrentUserSession();
      window.location.href = '/pages/loginAndRegistration/';
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus('');

      const name = document.getElementById('profileName').value.trim();
      const age = Number(document.getElementById('profileAge').value);
      const gender = document.getElementById('profileGender').value;
      const height = Number(document.getElementById('profileHeight').value);
      const weight = Number(document.getElementById('profileWeight').value);

      if (!name || !Number.isFinite(age) || !gender ||
          !Number.isFinite(height) || !Number.isFinite(weight)) {
        setStatus('Please complete all profile fields with valid values.', true);
        return;
      }

      profileSaveButton.disabled = true;
      try {
        const response = await window.BioTraceApi.request('/profile', {
          method: profileExists ? 'PUT' : 'POST',
          authenticated: true,
          body: { name, age, gender, height, weight }
        });
        const profile = response.profile;
        const updatedName = profile.user?.name || name;

        sessionStorage.setItem('logged_user', updatedName);
        window.UserStorage.saveUserData('profile_data', {
          profileAge: profile.age,
          profileGender: profile.gender,
          profileHeight: profile.height,
          profileWeight: profile.weight
        });

        profileExists = true;
        setStatus('Profile updated successfully.');
        window.location.href = '/pages/homepage/';
      } catch (error) {
        setStatus(error.message, true);
      } finally {
        profileSaveButton.disabled = false;
      }
    });
  }

  loadProfile();

  if (profilePanel) {
    profilePanel.offsetHeight;
    requestAnimationFrame(() => {
      profilePanel.classList.add('is-visible');
    });
  }
});
