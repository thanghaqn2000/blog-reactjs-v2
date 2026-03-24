import { formatDate } from '@/config/date.config';
import { showToast } from '@/config/toast.config';
import { useAuth } from '@/contexts/AuthContext';
import {
  AdminPostsFilters,
  Post as ApiPost,
  adminPostAuthorLabel,
  buildAdminPostsParams,
  postService,
} from '@/services/admin/post.service';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

export interface Post {
  id: string;
  slug: string;
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
  sub_type?: string;
  date_post?: string;
}

function convertApiPostToContextPost(apiPost: ApiPost): Post {
  return {
    id: apiPost.id.toString(),
    slug: apiPost.slug,
    title: apiPost.title,
    description: apiPost.description,
    excerpt: apiPost.title ?? '',
    content: apiPost.content ?? '',
    status: apiPost.status as 'publish' | 'pending',
    date: formatDate(apiPost.created_at),
    category: apiPost.category,
    author: adminPostAuthorLabel(apiPost.author),
    thumbnailUrl: apiPost.image_url,
    sub_type: apiPost.sub_type,
    date_post: apiPost.date_post,
  };
}

export type AdminPostsListScope = 'manual' | 'auto';

export interface FetchPostsOptions {
  /** Mặc định giữ scope lần gọi trước (tab đang xem). Nên truyền rõ từ màn Posts. */
  scope?: AdminPostsListScope;
}

interface PostsContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  /** `page` mặc định 1; `filters` undefined = giữ bộ lọc theo `scope`; `options.scope` cập nhật tab đang fetch */
  fetchPosts: (
    page?: number,
    filters?: AdminPostsFilters,
    options?: FetchPostsOptions
  ) => Promise<void>;
  deletePost: (id: string) => void;
  getPost: (id: string) => Post | undefined;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const { token } = useAuth();
  const manualFiltersRef = useRef<AdminPostsFilters>({});
  const autoFiltersRef = useRef<AdminPostsFilters>({});
  const scopeRef = useRef<AdminPostsListScope>('manual');
  const currentPageRef = useRef(1);
  /** Tăng mỗi lần bắt đầu fetch; response chỉ áp dụng state nếu khớp (tránh race khi đổi tab / debounce). */
  const listFetchSeqRef = useRef(0);

  const fetchPosts = useCallback(
    async (page: number = 1, filters?: AdminPostsFilters, options?: FetchPostsOptions) => {
      if (!token) {
        listFetchSeqRef.current += 1;
        setPosts([]);
        setLoading(false);
        return;
      }

      listFetchSeqRef.current += 1;
      const seq = listFetchSeqRef.current;

      if (options?.scope !== undefined) {
        scopeRef.current = options.scope;
      }
      const scope = scopeRef.current;

      if (filters !== undefined) {
        if (scope === 'auto') {
          autoFiltersRef.current = filters;
        } else {
          manualFiltersRef.current = filters;
        }
      }

      const activeFilters = scope === 'auto' ? autoFiltersRef.current : manualFiltersRef.current;
      currentPageRef.current = page;

      try {
        setLoading(true);
        const params = buildAdminPostsParams(page, 10, activeFilters);
        const response =
          scope === 'auto'
            ? await postService.getAutoPosts(params)
            : await postService.getPosts(params);

        if (seq !== listFetchSeqRef.current) return;

        const convertedPosts = response.data.map(convertApiPostToContextPost);
        setPosts(convertedPosts);
        if (response.meta) {
          currentPageRef.current = response.meta.current_page;
          setPagination({
            currentPage: response.meta.current_page,
            totalPages: response.meta.total_pages,
            totalCount: response.meta.total_count,
          });
        }
        setError(null);
      } catch (err) {
        if (seq !== listFetchSeqRef.current) return;
        setError('Có lỗi xảy ra khi tải danh sách bài viết');
        console.error(err);
      } finally {
        if (seq === listFetchSeqRef.current) {
          setLoading(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token) {
      listFetchSeqRef.current += 1;
      setPosts([]);
      setLoading(false);
      return;
    }
    manualFiltersRef.current = {};
    autoFiltersRef.current = {};
    scopeRef.current = 'manual';
    void fetchPosts(1, {}, { scope: 'manual' });
  }, [token, fetchPosts]);





  const deletePost = async (id: string) => {
    try {
      await postService.deletePost(parseInt(id));
      showToast.success('Xóa bài viết thành công!');
      await fetchPosts(currentPageRef.current, undefined, { scope: scopeRef.current });
    } catch (error) {
      showToast.error('Có lỗi xảy ra khi xóa bài viết');
      console.error(error);
    }
  };



  const getPost = (id: string) => {
    return posts.find(post => post.id === id);
  };

  return (
    <PostsContext.Provider value={{ posts, loading, error, fetchPosts, deletePost, getPost, pagination }}>
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
