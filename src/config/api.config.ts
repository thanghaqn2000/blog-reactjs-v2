export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  ADMIN_PREFIX: '/api/admin',
  V1_PREFIX: '/api/v1',
} as const; 
