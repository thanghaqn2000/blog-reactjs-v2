import { adminApi } from "../axios";

export interface UserQuota {
  total_limit: number;
  used: number;
  remaining: number;
}

export interface User {
  id: number;
  name?: string;
  username?: string;
  email: string;
  role: string;
  status?: string;
  is_vip?: boolean;
  joined_date?: string;
  last_login?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user_quota?: UserQuota;
}

export interface GetUsersResponse {
  data: User[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: string;
  status: string;
  is_vip?: boolean;
  password?: string;
}

export interface UserQuotaAttributes {
  daily_limit?: number;
  used_today?: number;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  is_vip?: boolean;
  password?: string;
  user_quota_attributes?: UserQuotaAttributes;
  /** Số nguyên: +20 tăng 20 quota, -20 giảm 20. Nếu có thì bỏ qua user_quota_attributes. */
  quota_adjustment?: number;
}

class UserService {
  // Lấy danh sách users
  async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    const response = await adminApi.get("/users", {
      params,
      withCredentials: true,
    });
    return response.data;
  }

  // Lấy thông tin chi tiết user
  async getUserById(id: number): Promise<User> {
    const response = await adminApi.get(`/users/${id}`, {
      withCredentials: true,
    });
    return response.data;
  }

  // Tạo user mới
  async createUser(data: CreateUserPayload): Promise<User> {
    const response = await adminApi.post("/users", data, {
      withCredentials: true,
    });
    return response.data;
  }

  // Cập nhật thông tin user (body gửi dạng { user: { ... } }), dùng PATCH
  async updateUser(id: number, data: UpdateUserPayload): Promise<User> {
    const response = await adminApi.patch(`/users/${id}`, { user: data }, {
      withCredentials: true,
    });
    return response.data;
  }

  // Xóa user
  async deleteUser(id: number): Promise<void> {
    await adminApi.delete(`/users/${id}`, { withCredentials: true });
  }
}

export const userService = new UserService();
