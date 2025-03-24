import { API_CONFIG } from '@/config/api.config';
import axios from 'axios';

// Tạo instance cho v1 API
export const v1Api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.V1_PREFIX}`,
});

// Tạo instance cho admin API
export const adminApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN_PREFIX}`,
  validateStatus: function (status) {
    return status < 500;
  },
});

// Thêm interceptor cho admin API để tự động thêm token
adminApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
}); 
