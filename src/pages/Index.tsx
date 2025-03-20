
import { usePosts } from "@/contexts/PostsContext";
import FeaturedArticles from "../components/FeaturedArticles";
import Hero from "../components/Hero";
import MainLayout from "../layouts/MainLayout";
import FeaturedSavedPosts from "../components/FeaturedSavedPosts";

const Index = () => {
  const { posts } = usePosts();
  const featuredPosts = posts.filter(post => post.featured && post.status === 'published');
  
  return (
    <MainLayout>
      <Hero />
      {featuredPosts.length > 0 && <FeaturedSavedPosts posts={featuredPosts} />}
      <FeaturedArticles />
    </MainLayout>
  );
};

export default Index;
