import axios from 'axios';
import toast from 'react-hot-toast';
import env from '../config/env';
import { getToken, clearAuth } from '../shared/utils/tokenUtils';
import { parseApiError } from '../shared/utils/apiErrorHandler';

const httpClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      clearAuth();
      if (window.location.pathname !== '/login') window.location.replace('/login?expired=1');
      return Promise.reject(error);
    }
    if (!error.config?._silent) toast.error(parseApiError(error));
    return Promise.reject(error);
  },
);

export default httpClient;
