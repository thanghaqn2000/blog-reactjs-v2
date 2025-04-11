import { v1Api } from './axios';

export interface LoginCredentials {
  user: {
    phone_number: string;
    password: string;
  }
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  is_admin: boolean;
  require_phone_number: boolean;
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
  async login(phone_number: string, password: string): Promise<AuthResponse> {
    const credentials: LoginCredentials = {
      user: {
        phone_number,
        password
      }
    };
    return (await v1Api.post('/login', credentials, { withCredentials: true })).data;
  }

  // Đăng xuất
  async logout(): Promise<void> {
    return v1Api.delete('/logout', {withCredentials: true});
  }

  // Làm mới token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await v1Api.post('/refresh_tokens', {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Refresh token failed:', error);
      throw error;
    }
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser(): Promise<User> {
    return v1Api.get('/auth/me', { withCredentials: true });
  }

  // Đổi mật khẩu
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    return v1Api.post('/auth/change-password', data, { withCredentials: true });
  }

  // Quên mật khẩu
  async forgotPassword(email: string): Promise<void> {
    return v1Api.post('/auth/forgot-password', { email }, { withCredentials: true });
  }

  // Đặt lại mật khẩu
  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    return v1Api.post('/auth/reset-password', data, { withCredentials: true });
  }

   async verifySocialToken(access_token: string): Promise<AuthResponse> {
    try {
      const response = await v1Api.post('/users/verify_social_token', {access_token}, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      console.error('Refresh token failed:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(); 
