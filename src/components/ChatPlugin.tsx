import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatContext } from '@/contexts/ChatContext';
import { chatService } from '@/services/chat.service';
import { ArrowDown, Loader2, MessageCircle, Minus, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatPlugin = () => {
  const {
    isOpen,
    setIsOpen,
    isVisible,
    messages,
    setMessages,
    showQuickReplies,
    setShowQuickReplies,
    isLoading,
    setIsLoading,
  } = useChatContext();

  const [inputMessage, setInputMessage] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hàm scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      // ScrollArea của shadcn/ui có thể có viewport bên trong
      const viewport = scrollElement.querySelector('[data-radix-scroll-area-viewport]');
      const targetElement = viewport || scrollElement;
      
      // Sử dụng smooth scroll để mượt mà hơn
      targetElement.scrollTo({
        top: targetElement.scrollHeight,
        behavior: 'smooth',
      });
      
      // Ẩn button sau khi scroll xuống
      setShowScrollButton(false);
    }
  };

  // Hàm check xem user có đang ở cuối chat không
  const checkScrollPosition = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      const viewport = scrollElement.querySelector('[data-radix-scroll-area-viewport]');
      const targetElement = viewport || scrollElement;
      
      const scrollTop = targetElement.scrollTop;
      const scrollHeight = targetElement.scrollHeight;
      const clientHeight = targetElement.clientHeight;
      
      // Hiển thị button nếu user scroll lên hơn 100px từ cuối
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll khi messages thay đổi (bao gồm cả khi bot đang streaming)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll khi quick replies xuất hiện/biến mất
  useEffect(() => {
    scrollToBottom();
  }, [showQuickReplies]);

  // Scroll khi loading state thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [isLoading]);

  // Attach scroll event listener để detect khi user scroll
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      const viewport = scrollElement.querySelector('[data-radix-scroll-area-viewport]');
      const targetElement = viewport || scrollElement;
      
      // Add scroll event listener
      targetElement.addEventListener('scroll', checkScrollPosition);
      
      // Cleanup
      return () => {
        targetElement.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [isOpen]);

  // Auto show quick replies sau 5s không hoạt động
  useEffect(() => {
    // Clear timer cũ nếu có
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Chỉ set timer nếu chat đang mở và không đang loading
    if (isOpen && !isLoading && !showQuickReplies) {
      inactivityTimerRef.current = setTimeout(() => {
        setShowQuickReplies(true);
      }, 5000); // 5 giây
    }

    // Cleanup khi component unmount hoặc dependencies thay đổi
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isOpen, isLoading, showQuickReplies, inputMessage, setShowQuickReplies]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    // Ẩn quick replies khi user gửi message
    setShowQuickReplies(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = textToSend;
    setInputMessage('');
    setIsLoading(true);

    // Tạo bot message placeholder cho streaming
    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);

    try {
      // Sử dụng streaming
      await chatService.sendMessageStream(
        currentInput,
        4,
        (chunk: string) => {
          // Cập nhật message với chunk mới
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: msg.text + chunk }
                : msg
            )
          );
        }
      );
    } catch (error) {
      // Nếu streaming fail, fallback về non-streaming
      console.error('Streaming failed, using fallback:', error);
      try {
        const response = await chatService.sendMessage(currentInput);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { 
                  ...msg, 
                  text: response.answer || 'Xin lỗi, tôi không hiểu câu hỏi của bạn.' 
                }
              : msg
          )
        );
      } catch (fallbackError) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { 
                  ...msg, 
                  text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.' 
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = (text: string) => {
    handleSendMessage(text);
  };

  const quickReplyOptions = [
    'Cần tư vấn đầu tư sinh lời',
    'Thành viên AD Securities hiện tại',
    'Chiến lược đầu tư 2025 của AD Securities',
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && isVisible && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50 animate-in fade-in slide-in-from-bottom-4 duration-500"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && isVisible && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] z-50">
          <Card className="w-full h-full shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500 relative">
            {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">Chuyên viên tư vấn AI</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-white/20"
              title="Thu nhỏ chat"
            >
              <Minus className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Avatar cho Bot (bên trái) */}
                  {message.sender === 'bot' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                      <img 
                        src="/bot-ai.jpeg" 
                        alt="Bot AI" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.text}
                      {message.sender === 'bot' && isLoading && message.text && (
                        <span className="inline-block w-1 h-4 ml-1 bg-gray-600 animate-pulse"></span>
                      )}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user'
                          ? 'text-white/70'
                          : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Icon cho User (bên phải) */}
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-700" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Quick Reply Options */}
              {showQuickReplies && !isLoading && (
                <div className="flex flex-col gap-2 mt-2">
                  {quickReplyOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full text-left justify-start text-sm hover:bg-primary hover:text-white transition-colors"
                      onClick={() => handleQuickReply(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              className="absolute bottom-24 right-8 h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-all z-10 animate-in fade-in slide-in-from-bottom-2 duration-300"
              size="icon"
              title="Cuộn xuống tin nhắn mới nhất"
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatPlugin;

