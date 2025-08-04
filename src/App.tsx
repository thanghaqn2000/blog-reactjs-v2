import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/authenticate/Login";
import { PostsProvider } from "./contexts/PostsContext";
import Dashboard from "./pages/admin/Dashboard";
import HeroSlides from "./pages/admin/HeroSlides";
import NotificationDetail from "./pages/admin/notifications/NotificationDetail";
import NotificationsManagement from "./pages/admin/notifications/NotificationsManagement";
import CreatePost from "./pages/admin/posts/CreatePost";
import EditPost from "./pages/admin/posts/EditPost";
import PostDetail from "./pages/admin/posts/PostDetail";
import Posts from "./pages/admin/posts/Posts";
import UserManagement from "./pages/admin/users/UserManagement";
import Profile from "./pages/client/Profile";
import Article from "./pages/home/article/ArticleDetail";
import Articles from "./pages/home/article/ArticleList";
import AuthCallback from "./pages/home/AuthCallback";
import Index from "./pages/home/Index";
import NotFound from "./pages/home/NotFound";
import VipNews from "./pages/home/VipNews";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PostsProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Authentication routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/posts" element={<Posts />} />
              <Route path="/admin/posts/create" element={<CreatePost />} />
              <Route path="/admin/posts/edit/:id" element={<EditPost />} />
              <Route path="/admin/posts/detail/:id" element={<PostDetail />} />
              <Route path="/admin/hero-slides" element={<HeroSlides />} />
              <Route path="/admin/analytics" element={<Dashboard />} />
              <Route path="/admin/notifications" element={<NotificationsManagement />} />
              <Route path="/admin/notifications/:id" element={<NotificationDetail />} />
              <Route path="/admin/settings" element={<Dashboard />} />
              
              {/* VIP News route */}
              <Route path="/vip-news" element={<VipNews />} />
              
              {/* Investment routes */}
              <Route path="/investment/stocks" element={<NotFound />} />
              <Route path="/investment/crypto" element={<NotFound />} />
              
              {/* Policy routes */}
              <Route path="/policy/fiscal" element={<NotFound />} />
              <Route path="/policy/monetary" element={<NotFound />} />
              
              {/* Owner routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/owner/settings" element={<NotFound />} />
              
              {/* Original routes */}
              <Route path="/articles" element={<Articles />} />
              <Route path="/article/:id" element={<Article />} />
              <Route path="/markets" element={<NotFound />} />
              
              {/* Auth callback route */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </PostsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
