
import { Link } from "react-router-dom";
import { Post } from "@/contexts/PostsContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturedSavedPostsProps {
  posts: Post[];
}

const FeaturedSavedPosts = ({ posts }: FeaturedSavedPostsProps) => {
  if (posts.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Featured Posts</h2>
          <Link
            to="/articles"
            className="hidden sm:flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <span>View all posts</span>
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                {post.thumbnailUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.thumbnailUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                )}
                <CardContent className="flex-grow pt-6">
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="pt-0 pb-6">
                  <Link
                    to={`/article/${post.id}`}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Read More
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSavedPosts;
