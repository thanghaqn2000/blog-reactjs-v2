import Navbar from '@/components/footer-header/Navbar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useChatContext } from '@/contexts/ChatContext';
import { chatService } from '@/services/chat.service';
import {
  Loader2,
  MessageSquarePlus,
  MoreVertical,
  PanelLeft,
  PanelLeftClose,
  Pencil,
  Send,
  Trash2,
  User
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const ChatPage = () => {
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    conversations,
    currentConversationId,
    createNewConversation,
    switchConversation,
    deleteConversation,
    updateConversationTitle,
  } = useChatContext();

  const [inputMessage, setInputMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll to bottom with debounce
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      const viewport = scrollElement.querySelector('[data-radix-scroll-area-viewport]');
      const targetElement = viewport || scrollElement;
      
      // Use instant scroll during streaming to avoid lag
      targetElement.scrollTo({
        top: targetElement.scrollHeight,
        behavior: 'auto',
      });
    }
  }, []);

  useEffect(() => {
    // Debounce scroll to reduce jank
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      scrollToBottom();
    }, 50);

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentConversationId]);

  const handleSendMessage = async () => {
    const textToSend = inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user' as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    setStreamingMessageId(botMessageId);
    const botMessage = {
      id: botMessageId,
      text: '',
      sender: 'bot' as const,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);

    try {
      await chatService.sendMessageStream(
        textToSend,
        4,
        (chunk: string) => {
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
      console.error('Streaming failed:', error);
      try {
        const response = await chatService.sendMessage(textToSend);
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
      setStreamingMessageId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditConversation = (convId: string, currentTitle: string) => {
    setEditingConvId(convId);
    setEditTitle(currentTitle);
  };

  const handleSaveTitle = (convId: string) => {
    if (editTitle.trim()) {
      updateConversationTitle(convId, editTitle.trim());
    }
    setEditingConvId(null);
  };

  const handleDeleteConversation = (convId: string) => {
    if (confirm('Bạn có chắc muốn xóa cuộc hội thoại này?')) {
      deleteConversation(convId);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex bg-gray-50 pt-16 sm:pt-20 h-screen">
        {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-gray-900 text-white flex flex-col overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cuộc hội thoại</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-gray-800"
            onClick={() => setIsSidebarOpen(false)}
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pb-4">
          <Button
            onClick={createNewConversation}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white"
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Chat mới
          </Button>
        </div>

        <Separator className="bg-gray-700" />

        {/* Conversations List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                  conv.id === currentConversationId
                    ? 'bg-gray-800'
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => switchConversation(conv.id)}
              >
                {editingConvId === conv.id ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveTitle(conv.id);
                      }
                    }}
                    onBlur={() => handleSaveTitle(conv.id)}
                    className="flex-1 h-7 text-sm bg-gray-700 border-gray-600"
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="flex-1 text-sm truncate">{conv.title}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditConversation(conv.id, conv.title);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Đổi tên
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm">Người dùng</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b bg-white flex items-center px-6">
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <img 
              src="/bot-ai.jpeg" 
              alt="Bot AI" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <h1 className="text-lg font-semibold">Chuyên viên tư vấn AI</h1>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 bg-white" ref={scrollAreaRef}>
          <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
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
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.text}
                      {message.sender === 'bot' && 
                       streamingMessageId === message.id && 
                       message.text && (
                        <span className="inline-block w-0.5 h-4 ml-1 bg-gray-900 animate-pulse"></span>
                      )}
                    </p>
                  </div>

                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && messages[messages.length - 1]?.text === '' && (
                <div className="flex justify-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      src="/bot-ai.jpeg" 
                      alt="Bot AI" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn của bạn..."
                  disabled={isLoading}
                  className="pr-12 py-6 rounded-xl border-gray-300 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
                className="h-12 w-12 rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Trợ lý AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default ChatPage;
