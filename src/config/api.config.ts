export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  ADMIN_PREFIX: '/admin',
  V1_PREFIX: '/v1',
} as const; 
