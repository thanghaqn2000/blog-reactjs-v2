import { API_CONFIG } from '@/config/api.config';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Tạo instance axios với cấu hình mặc định
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    (error) => {
      // Xử lý các lỗi phổ biến
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // Xử lý lỗi unauthorized
            window.location.href = '/login';
            break;
          case 403:
            // Xử lý lỗi forbidden
            console.error('Bạn không có quyền truy cập');
            break;
          case 404:
            // Xử lý lỗi not found
            console.error('Không tìm thấy tài nguyên');
            break;
          case 500:
            // Xử lý lỗi server
            console.error('Lỗi server');
            break;
          default:
            console.error('Có lỗi xảy ra');
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Tạo instance cho admin API
export const adminApi = createAxiosInstance(`${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN_PREFIX}`);

// Tạo instance cho v1 API
export const v1Api = createAxiosInstance(`${API_CONFIG.BASE_URL}${API_CONFIG.V1_PREFIX}`); 
