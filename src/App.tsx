import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import Login from "./components/authenticate/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import StockInsight from "./components/StockInsight";
import { ChatProvider } from "./contexts/ChatContext";
import { PostsProvider } from "./contexts/PostsContext";
import Dashboard from "./pages/admin/Dashboard";
import FeedbackManagement from "./pages/admin/FeedbackManagement";
import HeroSlides from "./pages/admin/HeroSlides";
import NotificationDetail from "./pages/admin/notifications/NotificationDetail";
import NotificationsManagement from "./pages/admin/notifications/NotificationsManagement";
import CreatePost from "./pages/admin/posts/CreatePost";
import EditPost from "./pages/admin/posts/EditPost";
import PostDetail from "./pages/admin/posts/PostDetail";
import Posts from "./pages/admin/posts/Posts";
import UserChatHistory from "./pages/admin/users/UserChatHistory";
import UserManagement from "./pages/admin/users/UserManagement";
import ChatPage from "./pages/client/ChatPage";
import Profile from "./pages/client/Profile";
import Article from "./pages/home/article/ArticleDetail";
import Articles from "./pages/home/article/ArticleList";
import AuthCallback from "./pages/home/AuthCallback";
import ExchangeRate from "./pages/home/ExchangeRate";
import Feedback from "./pages/home/Feedback";
import Index from "./pages/home/Index";
import NotFound from "./pages/home/NotFound";
import VipNews from "./pages/home/VipNews";

const queryClient = new QueryClient();

const AdminLayout = () => (
  <AdminRoute>
    <PostsProvider>
      <Outlet />
    </PostsProvider>
  </AdminRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ChatProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Authentication routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Admin routes - PostsProvider chỉ active trong admin */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="users/:id/chat-history" element={<UserChatHistory />} />
                <Route path="feedback" element={<FeedbackManagement />} />
                <Route path="posts" element={<Posts />} />
                <Route path="posts/create" element={<CreatePost />} />
                <Route path="posts/edit/:id" element={<EditPost />} />
                <Route path="posts/detail/:id" element={<PostDetail />} />
                <Route path="hero-slides" element={<HeroSlides />} />
                <Route path="analytics" element={<Dashboard />} />
                <Route path="notifications" element={<NotificationsManagement />} />
                <Route path="notifications/:id" element={<NotificationDetail />} />
                <Route path="settings" element={<Dashboard />} />
              </Route>
              
              {/* VIP News route */}
              <Route path="/vip-news" element={<VipNews />} />
              <Route path="/stock-insight" element={<StockInsight />} />
              
              {/* Gold price route */}
              <Route path="/exchange-rate" element={<ExchangeRate />} />
              
              {/* Investment routes */}
              <Route path="/investment/stocks" element={<NotFound />} />
              <Route path="/investment/crypto" element={<NotFound />} />
              
              {/* Policy routes */}
              <Route path="/policy/fiscal" element={<NotFound />} />
              <Route path="/policy/monetary" element={<NotFound />} />
              
              {/* Owner routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/owner/settings" element={<NotFound />} />
              
              {/* Chat route - Protected */}
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              
              {/* Original routes */}
              <Route path="/articles" element={<Articles />} />
              <Route path="/article/:slug" element={<Article />} />
              <Route path="/markets" element={<NotFound />} />
              
              {/* Feedback route - protected */}
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                }
              />

              {/* Auth callback route */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* 404 route */}
              <Route path="/404" element={<NotFound />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </ChatProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
