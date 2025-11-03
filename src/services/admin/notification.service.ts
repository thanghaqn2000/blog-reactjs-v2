import { adminApi } from '../axios';

export interface Notification {
  id: number;
  title: string;
  content: string;
  link?: string;
  type: 'sent_now' | 'scheduled';
  scheduled_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GetNotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateNotificationRequest {
  title: string;
  content: string;
  link?: string;
  type: 'sent_now' | 'scheduled';
  scheduled_at?: string;
}

export interface CreateNotificationResponse {
  data: Notification;
  message: string;
}

export interface GetFilterNotifications {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'sent' | 'failed' | 'cancelled';
  type?: 'sent_now' | 'scheduled';
}

class NotificationService {
  async listNotifications(params?: GetFilterNotifications): Promise<GetNotificationsResponse> {
    const response = await adminApi.get('/notifications', { params, withCredentials: true });
    return response.data;
  }

  async createNotification(params: CreateNotificationRequest): Promise<CreateNotificationResponse> {
    const response = await adminApi.post('/notifications', params, { withCredentials: true });
    return response.data;
  }

  async getNotification(id: number): Promise<{ data: Notification }> {
    const response = await adminApi.get(`/notifications/${id}`, { withCredentials: true });
    return response.data;
  }

  async updateNotification(id: number, params: Partial<CreateNotificationRequest>): Promise<CreateNotificationResponse> {
    const response = await adminApi.put(`/notifications/${id}`, params, { withCredentials: true });
    return response.data;
  }

  async deleteNotification(id: number): Promise<void> {
    await adminApi.delete(`/notifications/${id}`, { withCredentials: true });
  }

  async cancelNotification(id: number): Promise<CreateNotificationResponse> {
    const response = await adminApi.patch(`/notifications/${id}/cancel`, {}, { withCredentials: true });
    return response.data;
  }

  async resendNotification(id: number): Promise<CreateNotificationResponse> {
    const response = await adminApi.patch(`/notifications/${id}/resend`, {}, { withCredentials: true });
    return response.data;
  }

  // Get notification statistics
  async getNotificationStats(): Promise<{
    total: number;
    sent: number;
    pending: number;
    failed: number;
    cancelled: number;
  }> {
    const response = await adminApi.get('/notifications/stats', { withCredentials: true });
    return response.data;
  }
}

export const notificationService = new NotificationService();
