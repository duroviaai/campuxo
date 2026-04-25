import axios from 'axios';
import env from '../config/env';
import { clearAuth } from '../shared/utils/tokenUtils';

const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      clearAuth();
      if (window.location.pathname !== '/login') window.location.replace('/login?expired=1');
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
