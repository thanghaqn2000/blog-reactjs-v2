import { v1Api } from "../axios";

export interface CreateFeedbackPayload {
  feedback: {
    title: string;
    content: string;
    page_issue?: string | null;
    image_url?: string | null;
    image_key?: string | null;
    phone_number?: string | null;
  };
}

export interface FeedbackItem {
  id: number;
  title: string;
  content: string;
  page_issue: string | null;
  image_url: string | null;
  image_key?: string | null;
  phone_number: string | null;
  status: "waiting" | "done";
  created_at: string;
  updated_at: string;
  user_name: string;
}

export interface CreateFeedbackResponse {
  data: FeedbackItem;
}

export const feedbackServiceV1 = {
  async presign(params: {
    filename: string;
    content_type: string;
  }): Promise<{ url: string; key: string }> {
    const response = await v1Api.post<{ url: string; key: string }>(
      "/feedbacks/presign",
      params,
      { withCredentials: true },
    );
    return response.data;
  },

  async create(payload: CreateFeedbackPayload): Promise<CreateFeedbackResponse> {
    const response = await v1Api.post<CreateFeedbackResponse>(
      "/feedbacks",
      payload,
      { withCredentials: true }
    );
    return response.data;
  },
};
