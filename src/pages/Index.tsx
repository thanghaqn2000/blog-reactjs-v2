
import { usePosts } from "@/contexts/PostsContext";
import FeaturedArticles from "../components/FeaturedArticles";
import FeaturedSavedPosts from "../components/FeaturedSavedPosts";
import Hero from "../components/Hero";
import MainLayout from "../layouts/MainLayout";

const Index = () => {
  const { posts } = usePosts();
  const featuredPosts = posts.filter(post => post.featured && post.status === 'publish');
  
  return (
    <MainLayout>
      <Hero />
      {featuredPosts.length > 0 && <FeaturedSavedPosts posts={featuredPosts} />}
      <FeaturedArticles />
    </MainLayout>
  );
};

export default Index;
