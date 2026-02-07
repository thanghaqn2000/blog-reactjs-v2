import { adminApi } from "../axios";

// Conversations list for a specific user
export interface AdminConversation {
  id: number;
  title: string;
  created_at: string;
  message_count: number;
}

export interface PaginationMeta {
  current_page: number;
  next_page: number | null;
  previous_page: number | null;
  total_pages: number;
  total_count: number;
}

export interface GetUserConversationsResponse {
  data: AdminConversation[];
  meta: PaginationMeta;
}

export interface GetUserConversationsParams {
  page?: number;
  limit?: number;
}

// Messages inside one conversation (cursor-based)
export type AdminMessageRole = "user" | "assistant" | "system";
export type AdminMessageStatus = "success" | "failed" | "pending";

export interface AdminMessage {
  id: number;
  role: AdminMessageRole;
  content: string;
  status: AdminMessageStatus;
  token_usage?: number | null;
  created_at: string;
}

export interface ConversationMessagesMeta {
  next_cursor: number | null;
  has_more: boolean;
}

export interface GetConversationMessagesResponse {
  data: AdminMessage[];
  meta: ConversationMessagesMeta;
}

export interface GetConversationMessagesParams {
  cursor?: number;
  limit?: number;
}

class ChatHistoryService {
  async getUserConversations(
    userId: number,
    params?: GetUserConversationsParams
  ): Promise<GetUserConversationsResponse> {
    const response = await adminApi.get(`/users/${userId}/conversations`, {
      params,
      withCredentials: true,
    });
    return response.data;
  }

  async getConversationMessages(
    conversationId: number,
    params?: GetConversationMessagesParams
  ): Promise<GetConversationMessagesResponse> {
    const response = await adminApi.get(
      `/conversations/${conversationId}/messages`,
      { params, withCredentials: true }
    );
    const raw = response.data as GetConversationMessagesResponse & { next_cursor?: number; messages?: AdminMessage[] };
    const data = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.messages) ? raw.messages : [];
    const meta = raw?.meta ?? {
      next_cursor: raw?.next_cursor ?? null,
      has_more: raw?.next_cursor != null,
    };
    return { data, meta };
  }
}

export const chatHistoryService = new ChatHistoryService();

