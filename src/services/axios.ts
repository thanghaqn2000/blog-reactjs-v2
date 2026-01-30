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

// Tạo một object để lưu trữ token
const tokenStore = {
  token: null as string | null,
  setToken: function(newToken: string | null) {
    this.token = newToken;
  },
  getToken: function() {
    return this.token;
  }
};

// Hàm để cập nhật token
export const setAuthToken = (token: string | null) => {
  tokenStore.setToken(token);
};

// Thêm interceptor cho v1 API để tự động thêm token
v1Api.interceptors.request.use((config) => {
  const token = tokenStore.getToken();
  if (token) {
    config.headers.JWTAuthorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Thêm interceptor cho admin API để tự động thêm token
adminApi.interceptors.request.use((config) => {
  const token = tokenStore.getToken();
  if (token) {
    config.headers.JWTAuthorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
}); 
