import { v1Api } from "../axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface RegisterUserParams {
  user: {
    email: string;
    password: string;
    phone_number: string;
    name: string;
  }
}

interface RegisterUserResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    phone_number: string;
    is_admin: boolean;
  }
}

interface CheckUniquenessResponse {
  code: number;
  data: {
    errors: string;
    field: string;
  };
}

interface UpdateUserParams {
  user: {
    email: string;
    name: string;
    phone_number: string;
    password: string;
    current_password: string;
  }
}

interface UpdateUserResponse {
  user: {
    id: number;
    email: string;
    name: string;
    phone_number: string;
    is_admin: boolean;
    require_phone_number: boolean;
  }
}

export const userService = {
  async registerUser(params: RegisterUserParams): Promise<RegisterUserResponse> {
    try {
      const response = await v1Api.post('/users', params);
      return response.data;
    } catch (error) {
      console.error('Register user failed:', error);
      throw error;
    }
  },

  async checkInfoUniqueness(email?: string, phone_number?: string): Promise<CheckUniquenessResponse> {
    try {
      const params: Record<string, string> = {};
      if (email) params.email = email;
      if (phone_number) params.phone_number = phone_number;

      const response = await v1Api.get('/users/check_info_uniqueness', { params });
      return response.data;
    } catch (error) {
      console.error('Check info uniqueness failed:', error);
      throw error;
    }
  },

  async updateProfile(params: UpdateUserParams, userId: number): Promise<UpdateUserResponse> {
    try {
      const response = await v1Api.put(`/users/${userId}`, params, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  }
}; 
