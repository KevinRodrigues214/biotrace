(function () {
  const API_BASE_URL = window.BIOTRACE_API_URL || 'http://localhost:3000/api';

  async function request(path, { authenticated = false, ...options } = {}) {
    const headers = new Headers(options.headers || {});
    let body = options.body;

    if (body !== undefined && !(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(body);
    }

    if (authenticated) {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Your session has expired. Please log in again.');
      }
      headers.set('Authorization', `Bearer ${token}`);
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
        body
      });
    } catch {
      throw new Error('Unable to connect to the BioTrace API. Make sure the server is running.');
    }

    const responseBody = await response.json();
    if (!response.ok) {
      const error = new Error(responseBody.message || `Request failed with status ${response.status}.`);
      error.status = response.status;
      throw error;
    }

    return responseBody;
  }

  window.BioTraceApi = { request };
})();
