import { adminApi } from '../axios';

export interface Post {
  id: number;
  title: string;
  image_url: string;
  category: string;
  status: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface GetPostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface GetFilterPost {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreatePost {
  post: {
    title: string;
    description: string;
    content: string;
    category: string;
    status: string;
    image?: File;
  };
}

class PostService {
  async getPosts(params?: GetFilterPost): Promise<GetPostsResponse> {
    const response = await adminApi.get('/posts', { params, withCredentials: true });
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
}

export const postService = new PostService(); 
