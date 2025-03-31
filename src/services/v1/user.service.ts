import { v1Api } from "../axios";

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
  }
}; 
