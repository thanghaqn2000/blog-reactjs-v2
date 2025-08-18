import { formatDate } from '@/config/date.config';
import { showToast } from '@/config/toast.config';
import { useAuth } from '@/contexts/AuthContext';
import { Post as ApiPost, postService } from '@/services/admin/post.service';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Post {
  id: string;
  title: string;
  description: string;
  excerpt: string;
  content: string;
  status: 'publish' | 'pending';
  date: string;
  category: string;
  author: string;
  thumbnailUrl?: string;
  featured?: boolean;
  imageFile?: File;
}



interface PostsContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  deletePost: (id: string) => void;
  getPost: (id: string) => Post | undefined;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();


  const convertApiPostToContextPost = (apiPost: ApiPost): Post => {
    return {
      id: apiPost.id.toString(),
      title: apiPost.title,
      description: apiPost.description,
      excerpt: apiPost.title ?? '',
      content: apiPost.content ?? '',
      status: apiPost.status as 'publish' | 'pending',
      date: formatDate(apiPost.created_at),
      category: apiPost.category,
      author: 'Admin',
      thumbnailUrl: apiPost.image_url
    };
  };

  const fetchPosts = async () => {
    if (!token) {
      setPosts([])
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await postService.getPosts();
      const convertedPosts = response.data.map(convertApiPostToContextPost);
      setPosts(convertedPosts);
      setError(null);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách bài viết');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);





  const deletePost = async (id: string) => {
    try {
      await postService.deletePost(parseInt(id));
      setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      showToast.success('Xóa bài viết thành công!');
    } catch (error) {
      showToast.error('Có lỗi xảy ra khi xóa bài viết');
      console.error(error);
    }
  };



  const getPost = (id: string) => {
    return posts.find(post => post.id === id);
  };

  return (
    <PostsContext.Provider value={{ posts, loading, error, fetchPosts, deletePost, getPost }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};
