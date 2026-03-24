import { adminApi } from '../axios';

export type AdminPostAuthor =
  | string
  | {
      name?: string;
      avatar_url?: string;
    };

export interface Post {
  id: number;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  status: string;
  content: string;
  created_at: string;
  updated_at: string;
  sub_type?: string;
  date_post?: string;
  author?: AdminPostAuthor;
}

export interface ChartStock {
  id: number;
  rank: string;
  name: string;
  price: string;
}

export interface PaginationMeta {
  current_page: number;
  next_page: number | null;
  previous_page: number | null;
  total_pages: number;
  total_count: number;
  next_page_url: string | null;
  previous_page_url: string | null;
}

export interface GetPostsResponse {
  data: Post[];
  meta: PaginationMeta;
}

export interface CreatePostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface GetChartStockResponse {
  data: ChartStock[];
  total: number;
  page: number;
  limit: number;
}
export interface PresignUrlResponse {
  url: string;
  key: string;
}

/** Query admin posts index — chỉ gửi field có giá trị hợp lệ (theo BE) */
export interface GetFilterPost {
  page?: number;
  per_page?: number;
  /** title_cont */
  title?: string;
  /** news | finance | report */
  category?: string;
  /** pending | publish */
  status?: string;
  /** normal | vip */
  sub_type?: string;
  date_post_from?: string;
  date_post_to?: string;
  /** @deprecated dùng title */
  search?: string;
}

export type AdminPostsFilters = {
  title?: string;
  category?: string;
  status?: string;
  sub_type?: string;
  date_post_from?: string;
  date_post_to?: string;
};

const VALID_CATEGORY = ['news', 'finance', 'report'] as const;
const VALID_STATUS = ['pending', 'publish'] as const;
const VALID_SUB_TYPE = ['normal', 'vip'] as const;

export function buildAdminPostsParams(
  page: number,
  perPage: number,
  filters: AdminPostsFilters
): GetFilterPost {
  const params: GetFilterPost = { page, per_page: perPage };
  const title = filters.title?.trim();
  if (title) params.title = title;
  if (filters.category && VALID_CATEGORY.includes(filters.category as (typeof VALID_CATEGORY)[number])) {
    params.category = filters.category;
  }
  if (filters.status && VALID_STATUS.includes(filters.status as (typeof VALID_STATUS)[number])) {
    params.status = filters.status;
  }
  if (filters.sub_type && VALID_SUB_TYPE.includes(filters.sub_type as (typeof VALID_SUB_TYPE)[number])) {
    params.sub_type = filters.sub_type;
  }
  const from = filters.date_post_from?.trim();
  const to = filters.date_post_to?.trim();
  if (from) params.date_post_from = from;
  if (to) params.date_post_to = to;
  return params;
}

export function adminPostAuthorLabel(author?: AdminPostAuthor): string {
  if (author == null) return 'Admin';
  if (typeof author === 'string') return author || 'Admin';
  return author.name || 'Admin';
}

export interface CreatePost {
  post: {
    title: string;
    description: string;
    content: string;
    category: string;
    status: string;
    sub_type?: string;
    date_post?: string;
    image_key?: string;
  };
}

export interface PresignUrl {
  filename: string;
  content_type: string;
}

class PostService {
  async getPosts(params?: GetFilterPost): Promise<GetPostsResponse> {
    const response = await adminApi.get('/posts', { params, withCredentials: true });
    return response.data;
  }

  /** Bài hệ thống tự đăng — cùng query lọc/phân trang như GET /posts (BE: author_type system) */
  async getAutoPosts(params?: GetFilterPost): Promise<GetPostsResponse> {
    const response = await adminApi.get('/posts/auto_posts', { params, withCredentials: true });
    return response.data;
  }

  async createPost(params: CreatePost): Promise<CreatePostsResponse> {
    const response = await adminApi.post('/posts', params, { 
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async deletePost(id: number): Promise<void> {
    await adminApi.delete(`/posts/${id}`, { withCredentials: true });
  }

  async updatePost(id: number, params: CreatePost): Promise<CreatePostsResponse> {
    const response = await adminApi.put(`/posts/${id}`, params, { 
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async presignUrl(params: PresignUrl): Promise<PresignUrlResponse> {
    const response = await adminApi.post(`/posts/presign`, params, { withCredentials: true });
    return response.data;
  }

  async getChartStock(params?: GetFilterPost): Promise<GetChartStockResponse> {
    const response = await adminApi.get('/charts', { params, withCredentials: true });
    return response.data;
  }
}

export const postService = new PostService(); 
