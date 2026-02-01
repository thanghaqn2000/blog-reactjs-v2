import { v1Api } from "../axios";

export interface Post {
  id: number;
  title: string;
  image_url: string ;
  category: string;
  description: string;
  status: string;
  author: string;
  content: string;
  created_at: string;
  updated_at: string;
  date_post?: string;
  sub_type?: string;
}

export interface GetFilterPost {
  page?: number;
  limit?: number;
  title?: string;
  category?: string;
}

export interface GetPostsResponse {
  data: Post[];
  total: number;
  page: number;
}

export interface GetPostDetailResponse {
  data: Post;
}

export const postServiceV1 = {
  async getPosts(params?: GetFilterPost): Promise<GetPostsResponse> {
    const response = await v1Api.get('/posts', { params, withCredentials: true });
    return response.data;
  },

  async getDetailPost(id: number): Promise<GetPostDetailResponse> {
    const response = await v1Api.get(`/posts/${id}`, {withCredentials: true });
    return response.data;
  }
}
