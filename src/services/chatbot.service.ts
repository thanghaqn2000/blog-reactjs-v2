import { v1Api } from './axios';

// ==================== TYPES ====================

export interface QuotaInfo {
  total_limit: number;
  used: number;
  remaining: number;
}

export interface ChatMessage {
  id: string;
  conversation_id?: number;
  role: 'user' | 'assistant';
  content: string;
  status: 'success' | 'failed' | 'pending';
  token_usage?: number;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  openai_thread_id?: string;
  message_count: number;
  status: 'active' | 'archived' | 'deleted';
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface SendMessageResponse {
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}

export interface QuotaExceededError {
  error: string;
  message: string;
  quota: QuotaInfo;
}

export interface OpenAIFailedError {
  error: string;
  message: string;
  user_message: ChatMessage;
}

// ==================== CHATBOT SERVICE ====================

class ChatbotService {
  /**
   * Check user's quota
   * GET /api/v1/quota
   */
  async getQuota(): Promise<QuotaInfo> {
    const response = await v1Api.get<QuotaInfo>('/quota');
    return response.data;
  }

  /**
   * List all conversations
   * GET /api/v1/conversations?page=1&per_page=20
   */
  async getConversations(page = 1, perPage = 20): Promise<Conversation[]> {
    const response = await v1Api.get<Conversation[]>('/conversations', {
      params: { page, per_page: perPage }
    });
    return response.data;
  }

  /**
   * Create new conversation
   * POST /api/v1/conversations
   */
  async createConversation(title?: string): Promise<Conversation> {
    // Always send conversation with title (default: "New Conversation")
    const response = await v1Api.post<Conversation>('/conversations', {
      conversation: {
        title: title || 'New Conversation'
      }
    });
    return response.data;
  }

  /**
   * Get conversation detail with messages
   * GET /api/v1/conversations/:id
   */
  async getConversation(conversationId: number): Promise<Conversation> {
    const response = await v1Api.get<Conversation>(`/conversations/${conversationId}`);
    return response.data;
  }

  /**
   * Send message to conversation
   * POST /api/v1/conversations/:conversation_id/messages
   */
  async sendMessage(
    conversationId: number, 
    content: string
  ): Promise<SendMessageResponse | QuotaExceededError | OpenAIFailedError> {
    try {
      const response = await v1Api.post<SendMessageResponse>(
        `/conversations/${conversationId}/messages`,
        { message: { content } }
      );
      return response.data;
    } catch (error: any) {
      // Handle specific error responses
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 429) {
          // Quota exceeded
          return data as QuotaExceededError;
        }
        
        if (status === 503) {
          // OpenAI failed
          return data as OpenAIFailedError;
        }
      }
      throw error;
    }
  }

  /**
   * Update conversation title
   * PATCH /api/v1/conversations/:id
   */
  async updateConversationTitle(
    conversationId: number, 
    title: string
  ): Promise<Conversation> {
    const response = await v1Api.patch<Conversation>(
      `/conversations/${conversationId}`,
      { conversation: { title } }
    );
    return response.data;
  }

  /**
   * Archive conversation
   * PATCH /api/v1/conversations/:id/archive
   */
  async archiveConversation(conversationId: number): Promise<Conversation> {
    const response = await v1Api.patch<Conversation>(
      `/conversations/${conversationId}/archive`
    );
    return response.data;
  }

  /**
   * Soft delete conversation
   * DELETE /api/v1/conversations/:id/delete_conversation
   */
  async deleteConversation(conversationId: number): Promise<Conversation> {
    const response = await v1Api.delete<Conversation>(
      `/conversations/${conversationId}/delete_conversation`
    );
    return response.data;
  }

  /**
   * Hard delete conversation (permanently)
   * DELETE /api/v1/conversations/:id
   */
  async hardDeleteConversation(conversationId: number): Promise<void> {
    await v1Api.delete(`/conversations/${conversationId}`);
  }

  /**
   * Helper: Check if response is quota exceeded error
   */
  isQuotaExceeded(response: any): response is QuotaExceededError {
    return response && response.error === 'Quota exceeded';
  }

  /**
   * Helper: Check if response is OpenAI failed error
   */
  isOpenAIFailed(response: any): response is OpenAIFailedError {
    return response && response.error === 'OpenAI API failed';
  }

  /**
   * Helper: Check if response is successful
   */
  isSuccess(response: any): response is SendMessageResponse {
    return response && response.user_message && response.assistant_message;
  }
}

export const chatbotService = new ChatbotService();
