import { useAuth } from '@/contexts/AuthContext';
import {
  chatbotService,
  ChatMessage,
  Conversation,
  QuotaInfo
} from '@/services/chatbot.service';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type { Conversation, ChatMessage as Message };

interface ChatContextType {
  // Legacy states for backward compatibility
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  showQuickReplies: boolean;
  setShowQuickReplies: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  
  // New API-based states
  quota: QuotaInfo | null;
  conversations: Conversation[];
  currentConversationId: number | null;
  
  // Actions
  refreshQuota: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  createNewConversation: (title?: string) => Promise<void>;
  switchConversation: (conversationId: number) => Promise<void>;
  deleteConversation: (conversationId: number) => Promise<void>;
  updateConversationTitle: (conversationId: number, title: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  // Get auth state
  const { token } = useAuth();
  
  // Legacy states
  const [isOpen, setIsOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // API-based states
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load quota on mount
  const refreshQuota = useCallback(async () => {
    try {
      const quotaData = await chatbotService.getQuota();
      setQuota(quotaData);
    } catch (error) {
      console.error('Failed to load quota:', error);
    }
  }, []);

  // Load conversations on mount
  const refreshConversations = useCallback(async () => {
    try {
      const convs = await chatbotService.getConversations();
      setConversations(convs);
      
      // If no current conversation, select the first one
      // Use functional update to avoid stale closure
      setCurrentConversationId(prevId => {
        if (!prevId && convs.length > 0) {
          return convs[0].id;
        }
        return prevId;
      });
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (currentConversationId) {
        try {
          const conv = await chatbotService.getConversation(currentConversationId);
          setMessages(conv.messages || []);
        } catch (error) {
          console.error('Failed to load messages:', error);
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    };

    loadMessages();
  }, [currentConversationId]);

  // Initial load - only when authenticated (has token)
  useEffect(() => {
    if (token) {
      refreshQuota();
      refreshConversations();
    }
  }, [token, refreshQuota, refreshConversations]);

  // Create new conversation
  const createNewConversation = async (title?: string) => {
    try {
      const newConv = await chatbotService.createConversation(title);
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
      setShowQuickReplies(true);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  };

  // Switch conversation
  const switchConversation = async (conversationId: number) => {
    setCurrentConversationId(conversationId);
    setShowQuickReplies(false);
  };

  // Delete conversation
  const deleteConversation = async (conversationId: number) => {
    try {
      await chatbotService.deleteConversation(conversationId);
      
      // Calculate remaining conversations before state update
      const remaining = conversations.filter(c => c.id !== conversationId);
      
      // Remove from local state
      setConversations(remaining);
      
      // If deleting current conversation, switch to another
      if (conversationId === currentConversationId) {
        if (remaining.length > 0) {
          setCurrentConversationId(remaining[0].id);
        } else {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  };

  // Update conversation title
  const updateConversationTitle = async (conversationId: number, title: string) => {
    try {
      const updatedConv = await chatbotService.updateConversationTitle(conversationId, title);
      
      // Update local state
      setConversations(prev =>
        prev.map(conv => conv.id === conversationId ? updatedConv : conv)
      );
    } catch (error) {
      console.error('Failed to update conversation title:', error);
      throw error;
    }
  };

  // Send message
  const sendMessage = async (content: string) => {
    try {
      // Check quota first
      if (!quota || quota.remaining <= 0) {
        throw new Error('QUOTA_EXCEEDED');
      }

      setIsLoading(true);

      // Lazy create conversation if needed
      let convId = currentConversationId;
      if (!convId) {
        const newConv = await chatbotService.createConversation();
        convId = newConv.id;
        setCurrentConversationId(newConv.id);
        setConversations(prev => [newConv, ...prev]);
      }

      // Optimistic UI - add user message immediately
      const tempUserMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMsg]);

      // Send message to API
      const response = await chatbotService.sendMessage(convId, content);

      // Handle different responses
      if (chatbotService.isQuotaExceeded(response)) {
        // Quota exceeded
        setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
        setQuota(response.quota);
        throw new Error('QUOTA_EXCEEDED');
      } else if (chatbotService.isOpenAIFailed(response)) {
        // OpenAI failed
        setMessages(prev =>
          prev.map(m =>
            m.id === tempUserMsg.id
              ? { ...response.user_message, status: 'failed' as const }
              : m
          )
        );
        throw new Error('OPENAI_FAILED');
      } else if (chatbotService.isSuccess(response)) {
        // Success
        setMessages(prev =>
          prev.filter(m => m.id !== tempUserMsg.id).concat([
            response.user_message,
            response.assistant_message,
          ])
        );

        // Update quota
        if (quota) {
          setQuota({
            ...quota,
            used: quota.used + 1,
            remaining: quota.remaining - 1,
          });
        }

        // Refresh conversations to update message count
        refreshConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isVisible,
        setIsVisible,
        messages,
        setMessages,
        showQuickReplies,
        setShowQuickReplies,
        isLoading,
        setIsLoading,
        quota,
        conversations,
        currentConversationId,
        refreshQuota,
        refreshConversations,
        createNewConversation,
        switchConversation,
        deleteConversation,
        updateConversationTitle,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};
