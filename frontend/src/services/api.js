const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let authToken = localStorage.getItem('auth_token') || null;

const routeMap = {
  '/login': '/auth/login',
  '/logout': '/auth/logout',
  '/me': '/auth/me',
  '/verify-otp': '/auth/verify-otp',
  '/change-password': '/auth/change-password',
  '/register': '/auth/register',
};

export function setAuthToken(token) {
  authToken = token;
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

export async function api(method, url, body = null) {
  const mappedUrl = routeMap[url] || url;
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  try {
    const response = await fetch(`${API_BASE_URL}${mappedUrl}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : {};

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: { error: err.message || 'Network error' },
    };
  }
}
