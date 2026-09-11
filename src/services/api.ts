import axios from 'axios';

const api = axios.create({
  baseURL: 'https://store-production-4392.up.railway.app',
  timeout: 10000,
});

// Interceptor — يحط الـ token تلقائياً في كل request
api.interceptors.request.use((config) => {
  try {
    const state = require('../store/auth.store').useAuthStore.getState();
    const token = state.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export const setToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default api;