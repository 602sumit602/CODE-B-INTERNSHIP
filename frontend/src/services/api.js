import axios from 'axios';
import { handleMockRequest } from './mockBackend';

const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

// Check if configured URL is a placeholder, empty, or dummy domain
export const isPlaceholderUrl = (url) => {
  if (!url) return true;
  if (/your-backend/i.test(url)) return true;
  if (/your-backend-url/i.test(url)) return true;
  if (/example\.com/i.test(url)) return true;
  // If hosted on vercel.app and no remote backend is provided
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app') && (!url || url.startsWith('/'))) {
    return true;
  }
  return false;
};

export const isMockModeActive = isPlaceholderUrl(rawApiBaseUrl);

// Retrieve default axios adapter (XHR/fetch in browser, http in node)
const defaultAdapter = axios.getAdapter(['xhr', 'http', 'fetch']);

const hybridAdapter = async (config) => {
  // If placeholder or mock mode is configured, handle immediately
  if (isMockModeActive) {
    return handleMockRequest(config);
  }

  try {
    const response = await defaultAdapter(config);
    return response;
  } catch (error) {
    const status = error.response?.status;
    // If backend returns 404 (route missing or placeholder host), 405 (static rewrite on Vercel),
    // 502/503/504 (server sleeping / starting), or network failure (ERR_CONNECTION_REFUSED)
    const isNetworkOrNotFound = !error.response || [404, 405, 500, 502, 503, 504].includes(status);

    if (isNetworkOrNotFound) {
      console.warn(
        `[Code-B API] Live backend returned ${status || 'Network Error'} (${config.url}). Seamlessly falling back to local interactive demo storage.`
      );
      return handleMockRequest(config);
    }

    throw error;
  }
};

const api = axios.create({
  baseURL: isMockModeActive ? '' : rawApiBaseUrl,
  adapter: hybridAdapter,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
      const currentPath = window.location.pathname;
      if (!publicPaths.some((p) => currentPath.startsWith(p))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
