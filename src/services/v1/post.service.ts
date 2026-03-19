import { v1Api } from "../axios";

export type PostAuthor =
  | string
  | {
      name?: string;
      avatar_url?: string;
      avatar?: string;
    };

export interface Post {
  id: number;
  slug: string;
  title: string;
  image_url: string ;
  category: string;
  description: string;
  status: string;
  source?: string;
  author_type?: 'system' | 'admin' | string;
  content: string;
  created_at: string;
  updated_at: string;
  date_post?: string;
  sub_type?: string;
  author?: PostAuthor;
}

export function getPostAuthorInfo(post: Post): { name: string; avatar: string } {
  if (!post.author) return { name: "Admin", avatar: "" };
  if (typeof post.author === "string") return { name: post.author || "Admin", avatar: "" };
  return {
    name: post.author.name || "Admin",
    avatar: post.author.avatar_url ?? post.author.avatar ?? "",
  };
}

export interface GetFilterPost {
  page?: number;
  limit?: number;
  title?: string;
  category?: string;
  featured?: boolean;
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

  async getDetailPost(slugOrId: string): Promise<GetPostDetailResponse> {
    const response = await v1Api.get(`/posts/${slugOrId}`, {withCredentials: true });
    return response.data;
  }
}
