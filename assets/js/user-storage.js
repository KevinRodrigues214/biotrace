(function () {
  const USER_KEY = 'logged_user';

  function normalizeUserSlug(value) {
    const raw = (value || '').trim();
    const slug = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    return slug || 'guest';
  }

  function getCurrentUserSlug() {
    return normalizeUserSlug(sessionStorage.getItem(USER_KEY));
  }

  function getUserStorageKey(prefix) {
    return `${prefix}_${getCurrentUserSlug()}`;
  }

  function readUserData(prefix, fallback = {}) {
    try {
      const raw = sessionStorage.getItem(getUserStorageKey(prefix));
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveUserData(prefix, value) {
    sessionStorage.setItem(getUserStorageKey(prefix), JSON.stringify(value));
  }

  function removeCurrentUserSession() {
    sessionStorage.removeItem(USER_KEY);
  }

  window.UserStorage = {
    USER_KEY,
    normalizeUserSlug,
    getCurrentUserSlug,
    getUserStorageKey,
    readUserData,
    saveUserData,
    removeCurrentUserSession
  };
})();
