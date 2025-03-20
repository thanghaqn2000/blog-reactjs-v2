import { adminApi } from '../axios';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

class UserService {
  // Lấy danh sách users
  async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    return adminApi.get('/users', { params });
  }

  // Lấy thông tin chi tiết user
  async getUserById(id: number): Promise<User> {
    return adminApi.get(`/users/${id}`);
  }

  // Tạo user mới
  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return adminApi.post('/users', data);
  }

  // Cập nhật thông tin user
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return adminApi.put(`/users/${id}`, data);
  }

  // Xóa user
  async deleteUser(id: number): Promise<void> {
    return adminApi.delete(`/users/${id}`);
  }
}

export const userService = new UserService(); 
