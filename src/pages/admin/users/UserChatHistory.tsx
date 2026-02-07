import { ScrollArea } from "@/components/ui/scroll-area";
import AdminLayout from "@/layouts/AdminLayout";
import {
  AdminConversation,
  AdminMessage,
  GetConversationMessagesResponse,
  chatHistoryService,
} from "@/services/admin/chat-history.service";
import { InfiniteData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const CONVERSATIONS_PAGE_SIZE = 20;
const MESSAGES_PAGE_SIZE = 50;

interface LocationState {
  name?: string;
  email?: string;
  role?: string;
  isVip?: boolean;
}

const UserChatHistory = () => {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [page, setPage] = useState(1);
  const [selectedConversation, setSelectedConversation] =
    useState<AdminConversation | null>(null);

  // Conversations list for this user
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    isFetching: isFetchingConversations,
  } = useQuery({
    queryKey: ["admin-user-conversations", userId, page] as const,
    queryFn: () =>
      chatHistoryService.getUserConversations(userId, {
        page,
        limit: CONVERSATIONS_PAGE_SIZE,
      }),
    enabled: Number.isFinite(userId),
    staleTime: 5 * 60 * 1000,
  });

  const conversations = conversationsData?.data ?? [];
  const pagination = conversationsData?.meta;

  // Messages for selected conversation (cursor-based)
  const {
    data: messagesPages,
    isLoading: isLoadingMessages,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery<
    GetConversationMessagesResponse,
    Error,
    InfiniteData<GetConversationMessagesResponse, number | undefined>,
    readonly ["admin-conversation-messages", number | null],
    number | undefined
  >({
    queryKey: [
      "admin-conversation-messages",
      selectedConversation?.id ?? null,
    ] as const,
    initialPageParam: undefined,
    queryFn: ({ pageParam, queryKey }) => {
      const [, conversationId] = queryKey;
      return chatHistoryService.getConversationMessages(
        conversationId as number,
        {
          cursor: pageParam,
          limit: MESSAGES_PAGE_SIZE,
        }
      );
    },
    enabled: !!selectedConversation && Number.isFinite(userId),
    getNextPageParam: (lastPage) =>
      lastPage.meta?.has_more ? lastPage.meta?.next_cursor ?? undefined : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const messages: AdminMessage[] =
    messagesPages?.pages.flatMap((page) => page.data) ?? [];

  const handleSelectConversation = (conv: AdminConversation) => {
    setSelectedConversation(conv);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/users"
              className="text-xs text-slate-500 hover:text-primary underline-offset-4 hover:underline"
            >
              ← Quay lại danh sách user
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="uppercase tracking-wide font-semibold">
                Đang xem lịch sử chat
              </span>
              <span>•</span>
              <span className="font-medium text-slate-900">
                {state.name || `User #${userId}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Admin Chat Inspector</span>
          </div>
        </div>

        {/* Main content: two-column layout */}
        <div className="flex flex-1 min-h-0">
          <ConversationList
            conversations={conversations}
            pagination={pagination}
            page={page}
            setPage={setPage}
            isLoading={isLoadingConversations}
            isFetching={isFetchingConversations}
            selectedConversationId={selectedConversation?.id ?? null}
            onSelectConversation={handleSelectConversation}
            userName={state.name || `User #${userId}`}
            userEmail={state.email}
            userRole={state.role}
            isVip={state.isVip}
          />

          <MessageViewer
            conversation={selectedConversation}
            messages={messages}
            isLoading={isLoadingMessages}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={!!hasNextPage}
            onLoadMore={fetchNextPage}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserChatHistory;

// --- Sub components reused from inspector ---

interface ConversationListProps {
  conversations: AdminConversation[];
  pagination?: { current_page: number; total_pages: number } & Record<
    string,
    any
  >;
  page: number;
  setPage: (page: number) => void;
  isLoading: boolean;
  isFetching: boolean;
  selectedConversationId: number | null;
  onSelectConversation: (conv: AdminConversation) => void;
  userName: string;
  userEmail?: string;
  userRole?: string;
  isVip?: boolean;
}

const ConversationList = ({
  conversations,
  pagination,
  page,
  setPage,
  isLoading,
  isFetching,
  selectedConversationId,
  onSelectConversation,
  userName,
  userEmail,
  userRole,
  isVip,
}: ConversationListProps) => {
  const totalPages = pagination?.total_pages ?? 1;

  return (
    <section className="w-80 border-r flex flex-col bg-white">
      {/* Compact User Info Header */}
      <div className="px-4 py-2 border-b bg-slate-50">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Thông tin user
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-900">{userName}</p>
          {userRole && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
              {userRole}
            </span>
          )}
          {isVip && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              VIP
            </span>
          )}
        </div>
        {userEmail && (
          <p className="text-[11px] text-slate-500 mt-0.5">{userEmail}</p>
        )}
      </div>

      {/* Conversation List Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Lịch sử hội thoại
        </p>
        {isFetching && (
          <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[56px] rounded-md bg-slate-100 animate-pulse"
              />
            ))
          ) : conversations.length === 0 ? (
            <p className="text-xs text-slate-500 px-2 py-4">
              Chưa có hội thoại nào.
            </p>
          ) : (
            conversations.map((conv) => {
              const createdAt = format(
                new Date(conv.created_at),
                "dd/MM/yyyy HH:mm",
                { locale: vi }
              );
              const isActive = conv.id === selectedConversationId;
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs border transition-colors ${
                    isActive
                      ? "bg-primary/5 border-primary text-primary"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="font-semibold line-clamp-1">
                    {conv.title || `Conversation #${conv.id}`}
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
                    <span>{createdAt}</span>
                    <span>{conv.message_count} msgs</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
      {totalPages > 1 && (
        <div className="px-3 py-2 border-t flex items-center justify-between text-[11px] text-slate-500 bg-slate-50">
          <button
            disabled={page <= 1}
            onClick={() => setPage(Math.max(1, page - 1))}
            className={`px-2 py-1 rounded ${
              page <= 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-slate-100"
            }`}
          >
            Trước
          </button>
          <span>
            Trang {page}/{totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className={`px-2 py-1 rounded ${
              page >= totalPages
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-slate-100"
            }`}
          >
            Sau
          </button>
        </div>
      )}
    </section>
  );
};

interface MessageViewerProps {
  conversation: AdminConversation | null;
  messages: AdminMessage[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
}

const MessageViewer = ({
  conversation,
  messages,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
}: MessageViewerProps) => {
  return (
    <section className="flex-1 flex flex-col bg-slate-50">
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Messages
          </p>
          {conversation && (
            <p className="text-xs text-slate-600 line-clamp-1">
              {conversation.title || `Conversation #${conversation.id}`}
            </p>
          )}
        </div>
      </div>

      {!conversation ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
          Chọn một hội thoại ở giữa để xem lịch sử tin nhắn.
        </div>
      ) : isLoading ? (
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className={`h-10 rounded-xl bg-slate-100 animate-pulse ${
                idx % 2 === 0 ? "w-3/4" : "w-2/3"
              }`}
            />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
          Hội thoại này chưa có tin nhắn.
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-3">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const isAssistant = msg.role === "assistant";
                const timeLabel = format(
                  new Date(msg.created_at),
                  "dd/MM/yyyy HH:mm",
                  { locale: vi }
                );

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        isUser
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : isAssistant
                          ? "bg-slate-200 text-slate-900 rounded-bl-sm border border-slate-300"
                          : "bg-slate-50 text-slate-800 border border-slate-200"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                      <div className="mt-1 flex justify-between items-center text-[11px] opacity-80">
                        <span>{timeLabel}</span>
                        {isAssistant && (
                          <span className="capitalize">
                            {msg.role}                           
                          </span>
                        )}
                        <span className="text-red-500 font-bold">{msg.status !== "success" && ` · ${msg.status}`}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          {hasNextPage && (
            <div className="px-4 py-2 border-t flex justify-center bg-white">
              <button
                disabled={isFetchingNextPage}
                onClick={() => onLoadMore()}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                {isFetchingNextPage ? "Đang tải thêm..." : "Tải thêm tin nhắn"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

