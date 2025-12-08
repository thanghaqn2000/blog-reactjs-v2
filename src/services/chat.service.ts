import axios from 'axios';

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8000';

export interface ChatRequest {
  message: string;
  stream: boolean;
  top_k: number;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  answer: string;
  contexts: string[];
  error: string | null;
}

class ChatService {
  async sendMessage(message: string, topK: number = 4): Promise<ChatResponse> {
    try {
      const response = await axios.post<ChatResponse>(
        `${CHAT_API_URL}/chat`,
        {
          message,
          stream: false,
          top_k: topK,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  }

  async sendMessageStream(
    message: string, 
    topK: number = 4,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${CHAT_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          stream: true,
          top_k: topK,
        }),
      });

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Try to parse as SSE format first
        const lines = buffer.split('\n');
        
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.chunk) {
                onChunk(data.chunk);
              }
            } catch (e) {
              console.warn('Failed to parse SSE chunk:', line);
            }
          }
        }
        
        // Keep last incomplete line in buffer
        buffer = lines[lines.length - 1];
      }

      // After stream ends, check if buffer has complete JSON response
      if (buffer.trim()) {
        try {
          const finalData = JSON.parse(buffer);
          if (finalData.answer) {
            // Server returned complete response instead of streaming
            // Simulate streaming by splitting into words
            const words = finalData.answer.split(' ');
            for (const word of words) {
              onChunk(word + ' ');
              await new Promise(resolve => setTimeout(resolve, 30));
            }
          }
        } catch (e) {
          console.warn('Buffer is not valid JSON:', buffer);
        }
      }
    } catch (error) {
      console.error('Stream API error:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();

