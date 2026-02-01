import ArticleCard, { ArticleProps } from "@/components/ArticleCard";
import { formatDate } from "@/config/date.config";
import { Post, postServiceV1 } from "@/services/v1/post.service";
import { Filter, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import MainLayout from "../../../layouts/MainLayout";

const defaultImage = import.meta.env.VITE_DEFAULT_IMG_POST;

function mapPostToArticleProps(post: Post): ArticleProps {
  return {
    id: post.id.toString(),
    title: post.title,
    excerpt: post.description,
    category: post.category,
    description: post.description,
    date: formatDate(post.created_at),
    date_post: post.date_post ? formatDate(post.date_post) : undefined,
    readTime: "5 min read",
    status: post.status,
    image: post.image_url || defaultImage,
    sub_type: post.sub_type,
    author: {
      name: post.author || "Admin",
      avatar: "",
    },
  };
}

const Articles = () => {
  const [articles, setArticles] = useState<ArticleProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await postServiceV1.getPosts({});
      const list = (res.data || []).map(mapPostToArticleProps);
      setArticles(list);
    } catch (e) {
      console.error(e);
      toast.error("Không tải được danh sách bài viết.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const categories = Array.from(new Set(articles.map((a) => a.category)));

  const filteredArticles = articles.filter((article) => {
    const matchSearch =
      !searchTerm ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = !selectedCategory || article.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <MainLayout>
      <section className="pt-28 pb-16 sm:pt-32 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Bài viết về tài chính
            </h1>
            <p className="text-foreground/70 text-lg">
              Khám phá bộ sưu tập bài viết, phân tích và ý kiến chuyên gia về thị trường tài chính.
            </p>
          </div>

          <div className="mb-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-foreground/80">
                <Filter size={16} className="mr-2" />
                <span>Lọc:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`chip ${
                    selectedCategory === null
                      ? "bg-primary text-white"
                      : "bg-secondary text-foreground/80 hover:bg-secondary/80"
                  } transition-colors`}
                >
                  Tất cả
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`chip ${
                      selectedCategory === category
                        ? "bg-primary text-white"
                        : "bg-secondary text-foreground/80 hover:bg-secondary/80"
                    } transition-colors`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6 text-sm text-foreground/70">
            {loading ? "Đang tải..." : `Hiển thị ${filteredArticles.length} bài viết`}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card overflow-hidden h-80 animate-pulse"
                />
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} date_post={article.date_post} {...article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-foreground/70">
                Không tìm thấy bài viết phù hợp với tiêu chí của bạn.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                }}
                className="mt-4 inline-flex items-center justify-center h-10 px-4 rounded-md bg-secondary text-foreground/80 font-medium hover:bg-secondary/80 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Articles;
