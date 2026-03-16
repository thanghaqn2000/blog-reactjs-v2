import { adminApi } from "../axios";

export interface AdminFeedbackItem {
  id: number;
  title: string;
  content: string;
  page_issue: string | null;
  image_url: string | null;
  phone_number: string | null;
  status: "waiting" | "done";
  created_at: string;
  updated_at: string;
  user_name: string;
}

export interface FeedbackListMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
  next_page: number | null;
  previous_page: number | null;
}

export interface GetFeedbacksParams {
  page?: number;
  per_page?: number;
  title?: string;
  /** 0 = waiting, 1 = done */
  status?: 0 | 1;
}

export interface GetFeedbacksResponse {
  data: AdminFeedbackItem[];
  meta: FeedbackListMeta;
}

export const adminFeedbackService = {
  async getFeedbacks(
    params?: GetFeedbacksParams
  ): Promise<GetFeedbacksResponse> {
    const response = await adminApi.get<GetFeedbacksResponse>("/feedbacks", {
      params,
      withCredentials: true,
    });
    return response.data;
  },

  async getFeedbackById(id: number): Promise<{ data: AdminFeedbackItem }> {
    const response = await adminApi.get<{ data: AdminFeedbackItem }>(
      `/feedbacks/${id}`,
      { withCredentials: true }
    );
    return response.data;
  },

  async updateStatus(
    id: number,
    status: "waiting" | "done"
  ): Promise<{ data: AdminFeedbackItem }> {
    const response = await adminApi.patch<{ data: AdminFeedbackItem }>(
      `/feedbacks/${id}`,
      { feedback: { status } },
      { withCredentials: true }
    );
    return response.data;
  },

  async deleteFeedback(id: number): Promise<void> {
    await adminApi.delete(`/feedbacks/${id}`, { withCredentials: true });
  },
};
