import { formatDate } from "@/config/date.config";
import { Post } from "@/contexts/PostsContext";
import { postServiceV1 } from "@/services/v1/post.service";
import { useEffect, useState } from "react";
import FeaturedArticles from "../../components/FeaturedArticles";
import FeaturedSavedPosts from "../../components/FeaturedSavedPosts";
import Hero from "../../components/Hero";
import MainLayout from "../../layouts/MainLayout";

const defaultImage = import.meta.env.VITE_DEFAULT_IMG_POST;

const Index = () => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await postServiceV1.getPosts({ featured: true, limit: 10 });
        const posts: Post[] = res.data
          .filter((p) => p.status === "publish")
          .map((p) => ({
            id: p.id.toString(),
            title: p.title,
            description: p.description,
            excerpt: p.title ?? "",
            content: p.content ?? "",
            status: p.status as "publish" | "pending",
            date: formatDate(p.created_at),
            category: p.category,
            author: p.author || "Admin",
            thumbnailUrl: p.image_url || defaultImage,
            sub_type: p.sub_type,
            date_post: p.date_post,
          }));
        setFeaturedPosts(posts);
      } catch {
        setFeaturedPosts([]);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <MainLayout>
      <Hero />
      {featuredPosts.length > 0 && <FeaturedSavedPosts posts={featuredPosts} />}
      <FeaturedArticles />
    </MainLayout>
  );
};

export default Index;
