import { useAuth } from '@/contexts/AuthContext';
import {
  chatbotService,
  ChatMessage,
  Conversation,
  QuotaInfo,
  StreamingCallbacks
} from '@/services/chatbot.service';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

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
  
  // Streaming states
  isStreaming: boolean;
  streamingContent: string;
  
  // Actions
  refreshQuota: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  createNewConversation: (title?: string) => Promise<void>;
  switchConversation: (conversationId: number) => Promise<void>;
  deleteConversation: (conversationId: number) => Promise<void>;
  updateConversationTitle: (conversationId: number, title: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  cancelStreaming: () => void;
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
  
  // Streaming states
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentTempUserIdRef = useRef<string | null>(null);
  const currentRealUserIdRef = useRef<string | null>(null);

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
          
          // ✅ Cleanup old pending messages from backend
          const cleanedMessages = (conv.messages || []).map(m => {
            // If user message is still pending (shouldn't happen, but just in case)
            if (m.role === 'user' && m.status === 'pending') {
              return { ...m, status: 'success' as const };
            }
            return m;
          });
          
          setMessages(cleanedMessages);
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

  // Cancel streaming
  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // ✅ FIX: Cleanup ALL states when cancelling
    setIsStreaming(false);
    setStreamingContent('');
    setIsLoading(false);
    
    // ✅ FIX: Remove temp message AND update ALL pending user messages
    setMessages(prev => {
      // First, filter out temp message if exists
      let filtered = prev;
      if (currentTempUserIdRef.current) {
        filtered = prev.filter(m => m.id !== currentTempUserIdRef.current);
      }
      
      // Then, update ALL remaining pending user messages to success
      return filtered.map(m => {
        if (m.role === 'user' && m.status === 'pending') {
          return { ...m, status: 'success' as const };
        }
        return m;
      });
    });
    
    // Clear refs
    currentTempUserIdRef.current = null;
    currentRealUserIdRef.current = null;
  }, []);

  // Send message with streaming
  const sendMessage = async (content: string) => {
    // Generate temporary ID for optimistic UI
    const tempUserId = `temp-user-${Date.now()}`;
    
    try {
      // Check quota first
      if (!quota || quota.remaining <= 0) {
        throw new Error('QUOTA_EXCEEDED');
      }

      setIsLoading(true);
      setIsStreaming(true);
      setStreamingContent('');

      // Lazy create conversation if needed
      let convId = currentConversationId;
      if (!convId) {
        const newConv = await chatbotService.createConversation();
        convId = newConv.id;
        setCurrentConversationId(newConv.id);
        setConversations(prev => [newConv, ...prev]);
      }

      // ✅ FIX 1: Add optimistic user message immediately
      const tempUserMsg: ChatMessage = {
        id: tempUserId,
        role: 'user',
        content,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMsg]);

      // ✅ Track temp user ID for cleanup on cancel
      currentTempUserIdRef.current = tempUserId;

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Define streaming callbacks
      const callbacks: StreamingCallbacks = {
        onUserMessage: (data) => {          
          // ✅ Track real user message ID for cancel handling
          const realUserId = data.id.toString();
          currentRealUserIdRef.current = realUserId;
          
          // Replace temp user message with real one from backend
          setMessages(prev => 
            prev.map(m => 
              m.id === tempUserId 
                ? {
                    id: realUserId,
                    conversation_id: data.conversation_id,
                    role: data.role,
                    content: data.content,
                    status: data.status,
                    created_at: data.created_at,
                  }
                : m
            )
          );
        },

        onChunk: (data) => {
          // Append chunk to streaming content
          setStreamingContent(prev => prev + data.content);
        },

        onDone: (data) => {
          
          // ✅ FIX 2: Update user message status and add assistant message
          setMessages(prev => {
            // Filter out temp message if still exists
            const withoutTemp = prev.filter(m => m.id !== tempUserId);
            
            // ✅ FIX: Convert both IDs to string for comparison (type-safe)
            const userMsgId = String(data.user_message.id);
            const hasUserMsg = withoutTemp.some(m => String(m.id) === userMsgId);
            
            if (hasUserMsg) {
              // Update existing user message and add assistant
              return [
                ...withoutTemp.map(m => 
                  String(m.id) === userMsgId ? data.user_message : m
                ),
                data.assistant_message
              ];
            } else {
              // Add both messages (shouldn't happen if onUserMessage worked)
              return [...withoutTemp, data.user_message, data.assistant_message];
            }
          });

          // ✅ Update quota ONLY on success (as per requirement)
          if (quota) {
            setQuota({
              ...quota,
              used: quota.used + 1,
              remaining: quota.remaining - 1,
            });
          }

          // Clear streaming state
          setStreamingContent('');
          setIsStreaming(false);
          setIsLoading(false);
          
          // ✅ Clear ID refs (message already replaced)
          currentTempUserIdRef.current = null;
          currentRealUserIdRef.current = null;

          // Refresh conversations to update message count
          refreshConversations();
        },

        onError: (data) => {
          console.error('❌ Streaming error:', data);
          
          // Remove temp user message on error
          setMessages(prev => prev.filter(m => m.id !== tempUserId));
          
          // Clear streaming state
          setStreamingContent('');
          setIsStreaming(false);
          setIsLoading(false);
          
          // ✅ Clear ID refs
          currentTempUserIdRef.current = null;
          currentRealUserIdRef.current = null;

          // Throw error to be caught by caller
          if (data.error === 'Quota exceeded') {
            throw new Error('QUOTA_EXCEEDED');
          } else if (data.error === 'OpenAI Service Error') {
            throw new Error('OPENAI_FAILED');
          } else {
            throw new Error(data.message || 'Unknown error');
          }
        },
      };

      // Start streaming
      const result = await chatbotService.streamMessage(
        convId,
        content,
        callbacks,
        abortControllerRef.current
      );

      // Handle result
      if (!result.success) {
        if (result.error === 'CANCELLED') {
          // User cancelled - just cleanup (already done in onError)
          return;
        }
        // Other errors handled in callbacks
      }

      // Clean up abort controller
      abortControllerRef.current = null;

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // ✅ FIX 3: Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserId));
      
      // Cleanup on error
      setStreamingContent('');
      setIsStreaming(false);
      setIsLoading(false);
      
      // ✅ Clear ID refs
      currentTempUserIdRef.current = null;
      currentRealUserIdRef.current = null;
      
      throw error;
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
        isStreaming,
        streamingContent,
        refreshQuota,
        refreshConversations,
        createNewConversation,
        switchConversation,
        deleteConversation,
        updateConversationTitle,
        sendMessage,
        cancelStreaming,
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
