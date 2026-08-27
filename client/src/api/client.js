import axios from 'axios';

export const TOKEN_KEY = 'ems_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 means the token expired or was tampered with — clear it and bounce the
// user to the login screen. `authExpired` lets AuthContext react to that too.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('authExpired'));
    }
    return Promise.reject(error);
  }
);

/** Normalises axios failures into a message the UI can render directly. */
export function toApiError(error) {
  if (error.response) {
    return {
      message: error.response.data?.message || `Request failed (${error.response.status})`,
      fields: error.response.data?.fields || {},
      status: error.response.status,
    };
  }
  if (error.request) {
    return {
      message: 'Cannot reach the server. Make sure the API is running on port 5001.',
      fields: {},
      status: 0,
    };
  }
  return { message: error.message || 'Unexpected error', fields: {}, status: 0 };
}

export default api;
