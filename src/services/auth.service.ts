import { v1Api } from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  is_admin: boolean;
}

export interface TokenInfo {
  access_token: string;
  expired_at: string;
}

export interface AuthResponse {
  token_info: TokenInfo;
  user: User;
}

class AuthService {
  // Đăng nhập
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return v1Api.post('/auth/login', credentials);
  }

  // Đăng xuất
  async logout(): Promise<void> {
    return v1Api.post('/auth/logout');
  }

  // Làm mới token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return v1Api.post('/auth/refresh-token', { refreshToken });
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser(): Promise<User> {
    return v1Api.get('/auth/me');
  }

  // Đổi mật khẩu
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    return v1Api.post('/auth/change-password', data);
  }

  // Quên mật khẩu
  async forgotPassword(email: string): Promise<void> {
    return v1Api.post('/auth/forgot-password', { email });
  }

  // Đặt lại mật khẩu
  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    return v1Api.post('/auth/reset-password', data);
  }
}

export const authService = new AuthService(); 
