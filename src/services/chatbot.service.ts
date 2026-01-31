import { tokenStore, v1Api } from './axios';

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

// ==================== STREAMING TYPES ====================

export type SSEEventType = 'user_message' | 'chunk' | 'done' | 'error';

export interface SSEUserMessageEvent {
  id: number;
  conversation_id: number;
  role: 'user';
  content: string;
  status: 'pending';
  created_at: string;
}

export interface SSEChunkEvent {
  content: string;
}

export interface SSEDoneEvent {
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}

export interface SSEErrorEvent {
  error: string;
  message: string;
}

export interface StreamingCallbacks {
  onUserMessage?: (data: SSEUserMessageEvent) => void;
  onChunk?: (data: SSEChunkEvent) => void;
  onDone?: (data: SSEDoneEvent) => void;
  onError?: (data: SSEErrorEvent) => void;
}

export interface StreamingResult {
  success: boolean;
  error?: string;
  fallbackUsed?: boolean;
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
   * Send message with SSE streaming
   * POST /api/v1/conversations/:conversation_id/messages/stream
   * 
   * @param conversationId - The conversation ID
   * @param content - Message content
   * @param callbacks - Event callbacks for streaming
   * @param abortController - Optional abort controller for cancellation
   * @returns StreamingResult with success status
   */
  async streamMessage(
    conversationId: number,
    content: string,
    callbacks: StreamingCallbacks,
    abortController?: AbortController
  ): Promise<StreamingResult> {
    try {
      // ✅ FIX: Get token from tokenStore (same as axios interceptor)
      const token = tokenStore.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${v1Api.defaults.baseURL}/conversations/${conversationId}/messages/stream`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'JWTAuthorization': `Bearer ${token}`,  // ✅ FIX: Backend expects JWTAuthorization
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: { content } }),
        signal: abortController?.signal,
      });

      if (!response.ok) {
        // Handle HTTP errors - fallback to non-streaming
        console.error('Streaming failed with status:', response.status);
        return await this.fallbackToNonStreaming(conversationId, content, callbacks);
      }

      // Parse SSE stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Parse SSE events (format: "event: name\ndata: json\n\n")
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer

        for (const eventStr of events) {
          if (!eventStr.trim()) continue;

          const lines = eventStr.split('\n');
          let eventName: SSEEventType = 'chunk';
          let data = '';

          lines.forEach(line => {
            if (line.startsWith('event:')) {
              eventName = line.substring(6).trim() as SSEEventType;
            } else if (line.startsWith('data:')) {
              data = line.substring(5).trim();
            }
          });

          if (data) {
            try {
              const parsedData = JSON.parse(data);
              this.handleSSEEvent(eventName, parsedData, callbacks);
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

      return { success: true };

    } catch (error: any) {
      // Handle abort (user cancelled)
      if (error.name === 'AbortError') {
        return { success: false, error: 'CANCELLED' };
      }

      // Handle network errors - fallback to non-streaming
      console.error('Streaming error:', error);
      return await this.fallbackToNonStreaming(conversationId, content, callbacks);
    }
  }

  /**
   * Handle SSE event based on type
   */
  private handleSSEEvent(
    eventName: SSEEventType, 
    data: any, 
    callbacks: StreamingCallbacks
  ): void {
    switch (eventName) {
      case 'user_message':
        callbacks.onUserMessage?.(data as SSEUserMessageEvent);
        break;

      case 'chunk':
        callbacks.onChunk?.(data as SSEChunkEvent);
        break;

      case 'done':
        callbacks.onDone?.(data as SSEDoneEvent);
        break;

      case 'error':
        callbacks.onError?.(data as SSEErrorEvent);
        break;

      default:
        console.warn('Unknown SSE event:', eventName);
    }
  }

  /**
   * Fallback to non-streaming API when streaming fails
   */
  private async fallbackToNonStreaming(
    conversationId: number,
    content: string,
    callbacks: StreamingCallbacks
  ): Promise<StreamingResult> {
    try {
      const response = await this.sendMessage(conversationId, content);

      // Handle success
      if (this.isSuccess(response)) {
        // Simulate streaming events for consistency
        callbacks.onUserMessage?.({
          id: parseInt(response.user_message.id),
          conversation_id: conversationId,
          role: 'user',
          content: response.user_message.content,
          status: 'pending',
          created_at: response.user_message.created_at,
        });

        // Send full content as single chunk
        callbacks.onChunk?.({ content: response.assistant_message.content });

        // Send done event
        callbacks.onDone?.({
          user_message: response.user_message,
          assistant_message: response.assistant_message,
        });

        return { success: true, fallbackUsed: true };
      }

      // Handle quota exceeded
      if (this.isQuotaExceeded(response)) {
        callbacks.onError?.({
          error: response.error,
          message: response.message,
        });
        return { success: false, error: 'QUOTA_EXCEEDED', fallbackUsed: true };
      }

      // Handle OpenAI failed
      if (this.isOpenAIFailed(response)) {
        callbacks.onError?.({
          error: response.error,
          message: response.message,
        });
        return { success: false, error: 'OPENAI_FAILED', fallbackUsed: true };
      }

      return { success: false, error: 'UNKNOWN_ERROR', fallbackUsed: true };

    } catch (error: any) {
      console.error('Fallback also failed:', error);
      callbacks.onError?.({
        error: 'Network Error',
        message: 'Failed to send message. Please try again.',
      });
      return { success: false, error: 'NETWORK_ERROR', fallbackUsed: true };
    }
  }

  /**
   * Send message to conversation (non-streaming, kept for fallback)
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
