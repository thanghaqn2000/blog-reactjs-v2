import { createContext, useContext, useEffect, useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('chatIsOpen');
    return saved ? JSON.parse(saved) : true;
  });

  const [isVisible, setIsVisible] = useState(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chatMessages');
    const savedTime = localStorage.getItem('chatMessagesTime');
    
    if (saved && savedTime) {
      const savedTimestamp = parseInt(savedTime);
      const currentTime = Date.now();
      const oneHourInMs = 60 * 60 * 1000; // 1 giờ = 3600000 ms
      
      // Kiểm tra xem đã quá 1 tiếng chưa
      if (currentTime - savedTimestamp < oneHourInMs) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } else {
        // Đã quá 1 tiếng, xóa lịch sử
        localStorage.removeItem('chatMessages');
        localStorage.removeItem('chatMessagesTime');
      }
    }
    
    // Return tin nhắn chào mừng mặc định
    return [
      {
        id: '1',
        text: 'Xin chào! Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ];
  });

  const [showQuickReplies, setShowQuickReplies] = useState(() => {
    const saved = localStorage.getItem('chatShowQuickReplies');
    return saved ? JSON.parse(saved) : true;
  });

  const [isLoading, setIsLoading] = useState(false);

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

  // Kiểm tra và tự động xóa lịch sử chat sau 1 tiếng
  useEffect(() => {
    const checkAndClearOldMessages = () => {
      const savedTime = localStorage.getItem('chatMessagesTime');
      if (savedTime) {
        const savedTimestamp = parseInt(savedTime);
        const currentTime = Date.now();
        const oneHourInMs = 60 * 60 * 1000; // 1 giờ
        
        // Nếu đã quá 1 tiếng, reset về tin nhắn chào mừng
        if (currentTime - savedTimestamp >= oneHourInMs) {
          setMessages([
            {
              id: '1',
              text: 'Xin chào! Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn?',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
          setShowQuickReplies(true);
          localStorage.removeItem('chatMessages');
          localStorage.removeItem('chatMessagesTime');
        }
      }
    };

    // Kiểm tra ngay lập tức
    checkAndClearOldMessages();

    // Kiểm tra mỗi 1 phút
    const interval = setInterval(checkAndClearOldMessages, 60000);

    return () => clearInterval(interval);
  }, [setMessages, setShowQuickReplies]);

  // Persist isOpen to localStorage
  useEffect(() => {
    localStorage.setItem('chatIsOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  // Persist messages to localStorage với timestamp
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    // Lưu timestamp hiện tại để theo dõi thời gian
    localStorage.setItem('chatMessagesTime', Date.now().toString());
  }, [messages]);

  // Persist showQuickReplies to localStorage
  useEffect(() => {
    localStorage.setItem('chatShowQuickReplies', JSON.stringify(showQuickReplies));
  }, [showQuickReplies]);

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

