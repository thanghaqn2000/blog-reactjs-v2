import { createContext, useContext, useEffect, useState } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  showQuickReplies: boolean;
  setShowQuickReplies: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  // New multi-conversation support
  conversations: Conversation[];
  currentConversationId: string | null;
  createNewConversation: () => void;
  switchConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const createDefaultConversation = (): Conversation => ({
  id: Date.now().toString(),
  title: 'Cuộc hội thoại mới',
  messages: [
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('chatIsOpen');
    return saved ? JSON.parse(saved) : true;
  });

  const [isVisible, setIsVisible] = useState(false);

  // Multi-conversation support
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('chatConversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((conv: Conversation) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
      } catch (error) {
        console.error('Failed to parse conversations:', error);
      }
    }
    // Create default conversation
    return [createDefaultConversation()];
  });

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => {
    const saved = localStorage.getItem('currentConversationId');
    return saved || (conversations.length > 0 ? conversations[0].id : null);
  });

  // Legacy states for backward compatibility
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Get messages from current conversation (derived state)
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  // Custom setMessages that updates the conversation directly
  const setMessages = (
    updater: Message[] | ((prev: Message[]) => Message[])
  ) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id !== currentConversationId) return conv;
        
        const currentMessages = conv.messages;
        const newMessages = typeof updater === 'function' 
          ? updater(currentMessages)
          : updater;
        
        // Auto-update title from first user message
        const shouldUpdateTitle = conv.messages.length === 1 && newMessages.length > 1;
        const newTitle = shouldUpdateTitle
          ? newMessages.find(m => m.sender === 'user')?.text.slice(0, 30) + '...' || conv.title
          : conv.title;
        
        return {
          ...conv,
          messages: newMessages,
          title: newTitle,
          updatedAt: new Date(),
        };
      })
    );
  };

  // Create new conversation
  const createNewConversation = () => {
    const newConv = createDefaultConversation();
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setShowQuickReplies(true);
  };

  // Switch conversation
  const switchConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setShowQuickReplies(false);
  };

  // Delete conversation
  const deleteConversation = (conversationId: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== conversationId);
      // If deleting current conversation, switch to another
      if (conversationId === currentConversationId) {
        if (filtered.length > 0) {
          setCurrentConversationId(filtered[0].id);
        } else {
          // Create new conversation if no conversations left
          const newConv = createDefaultConversation();
          setCurrentConversationId(newConv.id);
          return [newConv];
        }
      }
      return filtered;
    });
  };

  // Update conversation title
  const updateConversationTitle = (conversationId: string, title: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, title, updatedAt: new Date() } : conv
      )
    );
  };

  // Auto show chat after 2 seconds on first load
  useEffect(() => {
    const hasShown = localStorage.getItem('chatHasShown');
    if (!hasShown) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('chatHasShown', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, []);

  // Persist conversations to localStorage
  useEffect(() => {
    localStorage.setItem('chatConversations', JSON.stringify(conversations));
  }, [conversations]);

  // Persist current conversation ID
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('currentConversationId', currentConversationId);
    }
  }, [currentConversationId]);

  // Persist isOpen to localStorage
  useEffect(() => {
    localStorage.setItem('chatIsOpen', JSON.stringify(isOpen));
  }, [isOpen]);

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
        conversations,
        currentConversationId,
        createNewConversation,
        switchConversation,
        deleteConversation,
        updateConversationTitle,
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

