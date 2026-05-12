import axios from 'axios';
import { clearAuthSession, getStoredToken } from './auth';

const desktopApiUrl = window.hishobDesktop?.apiUrl;

const resolveBrowserApiUrl = () => {
  const configuredUrl = process.env.REACT_APP_API_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (desktopApiUrl) {
    return desktopApiUrl;
  }

  const { protocol, hostname, port } = window.location;

  if (port === '5000') {
    return '/api/v1';
  }

  return `${protocol}//${hostname}:5000/api/v1`;
};

const baseURL = resolveBrowserApiUrl();

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
