// כל הקריאות לשרת עוברות כאן: מצרף את ה-JWT ל-header ומתרגם שגיאות לאובייקט אחיד
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5140/api';

const TOKEN_KEY = 'watchstore.auth';

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY));
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  if (auth) localStorage.setItem(TOKEN_KEY, JSON.stringify(auth));
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(method, path, body) {
  const auth = loadAuth();
  const headers = { 'Content-Type': 'application/json' };

  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    let message = data?.message ?? defaultMessage(response.status);

    if (data?.errors) {
      message += ' ' + Object.values(data.errors).flat().join(' ');
    }

    throw new ApiError(response.status, message, data);
  }

  return data;
}

function defaultMessage(status) {
  switch (status) {
    case 401: return 'יש להתחבר מחדש.';
    case 403: return 'אין לך הרשאה לפעולה זו.';
    case 404: return 'לא נמצא.';
    default: return `שגיאה (${status})`;
  }
}

export const api = {
  login: (username, password) =>
    request('POST', '/auth/login', { username, password }),

  register: (data) => request('POST', '/auth/register', data),

  getProducts: (params) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    );
    return request('GET', `/products?${query}`);
  },

  getProduct: (id) => request('GET', `/products/${id}`),

  createOrder: (productId, quantity) =>
    request('POST', '/orders', { items: [{ productId, quantity }] }),

  getOrders: () => request('GET', '/orders')
};
