import Navbar from '@/components/footer-header/Navbar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import VipUpgradeModal from '@/components/VipUpgradeModal';
import { useChatContext } from '@/contexts/ChatContext';
import {
  AlertCircle,
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
    isLoading,
    conversations,
    currentConversationId,
    createNewConversation,
    switchConversation,
    deleteConversation,
    updateConversationTitle,
    sendMessage,
    quota,
  } = useChatContext();

  const [inputMessage, setInputMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingConvId, setEditingConvId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryMessage, setRetryMessage] = useState('');
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll to bottom with debounce
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      const viewport = scrollElement.querySelector('[data-radix-scroll-area-viewport]');
      const targetElement = viewport || scrollElement;
      
      targetElement.scrollTo({
        top: targetElement.scrollHeight,
        behavior: 'auto',
      });
    }
  }, []);

  useEffect(() => {
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
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentConversationId]);

  const handleSendMessage = async (messageOverride?: string) => {
    // Use override message or input message
    const textToSend = messageOverride !== undefined 
      ? messageOverride.trim() 
      : inputMessage.trim();
      
    if (!textToSend || isLoading) return;

    // Check quota availability and limit
    if (!quota) {
      // Quota not loaded yet
      return;
    }
    
    if (quota.remaining <= 0) {
      setShowQuotaModal(true);
      return;
    }

    // Only clear input if not using override
    if (messageOverride === undefined) {
      setInputMessage('');
    }

    try {
      await sendMessage(textToSend);
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      
      if (errorMsg === 'QUOTA_EXCEEDED') {
        setShowQuotaModal(true);
      } else if (errorMsg === 'OPENAI_FAILED') {
        setErrorMessage('Có lỗi xảy ra khi xử lý tin nhắn của bạn.');
        setRetryMessage(textToSend);
        setShowErrorDialog(true);
      } else {
        setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại.');
        setRetryMessage(textToSend);
        setShowErrorDialog(true);
      }
    }
  };

  const handleRetry = async () => {
    setShowErrorDialog(false);
    if (retryMessage) {
      const messageToRetry = retryMessage;
      setRetryMessage('');
      // Send directly with the retry message
      await handleSendMessage(messageToRetry);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditConversation = (convId: number, currentTitle: string) => {
    setEditingConvId(convId);
    setEditTitle(currentTitle);
  };

  const handleSaveTitle = async (convId: number) => {
    if (editTitle.trim()) {
      try {
        await updateConversationTitle(convId, editTitle.trim());
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    }
    setEditingConvId(null);
  };

  const handleDeleteConversation = async (convId: number) => {
    if (confirm('Bạn có chắc muốn xóa cuộc hội thoại này?')) {
      try {
        await deleteConversation(convId);
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
  };

  const handleCreateNewConversation = async () => {
    try {
      await createNewConversation();
    } catch (error) {
      console.error('Failed to create conversation:', error);
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
              onClick={handleCreateNewConversation}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white"
              disabled={isLoading}
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
          {/* <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm">Người dùng</span>
            </div>
          </div> */}
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
            <div className="flex items-center gap-3 flex-1">
              <img 
                src="/bot-ai.jpeg" 
                alt="Bot AI" 
                className="h-8 w-8 rounded-full object-cover"
              />
              <div>
                <h1 className="text-lg font-semibold">Chuyên viên tư vấn AI</h1>
                {quota && (
                  <p className="text-xs text-gray-500">
                    Lượt nhắn: {quota.remaining}/{quota.total_limit} tin nhắn còn lại
                  </p>
                )}
              </div>
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
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
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
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.status === 'failed'
                          ? 'bg-red-50 border border-red-200 text-gray-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      {message.status === 'failed' && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>Tin nhắn gửi thất bại</span>
                        </div>
                      )}
                      {message.status === 'pending' && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-white/80">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Đang gửi...</span>
                        </div>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
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
                    disabled={isLoading || !quota || quota.remaining === 0}
                    className="pr-12 py-6 rounded-xl border-gray-300 focus:border-blue-500"
                  />
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim() || !quota || quota.remaining === 0}
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

      {/* Quota Exceeded Modal */}
      <VipUpgradeModal 
        open={showQuotaModal} 
        onClose={() => setShowQuotaModal(false)} 
      />

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Có lỗi xảy ra
            </AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowErrorDialog(false)}>
              Đóng
            </Button>
            <AlertDialogAction onClick={handleRetry}>
              Thử lại
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatPage;
