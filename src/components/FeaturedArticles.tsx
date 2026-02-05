import { Button } from "@/components/ui/button";
import { formatDate } from "@/config/date.config";
import { postServiceV1 } from "@/services/v1/post.service";
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArticleCard from './ArticleCard';
import SidebarStock from './SidebarStock';
const defaultImage = import.meta.env.VITE_DEFAULT_IMG_POST;

interface Article {
  id: string;
  title: string;
  excerpt: string;
  description: string;
  date: string;
  image: string;
  category: string;
  readTime: string;
  status: string;
  author: {
    name: string;
    avatar: string;
  };
}

const FeaturedArticles = () => {
  const navigate = useNavigate();
  const [visibleArticles, setVisibleArticles] = useState({
    'Báo cáo': 6,
    'Tin tức': 6,
    'Tài chính': 6
  });

  const [articles, setArticles] = useState<{
    report: Article[];
    news: Article[];
    finance: Article[];
  }>({
    report: [],
    news: [],
    finance: []
  });  
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const [reportResponse, newsResponse, financeResponse] = await Promise.all([
          postServiceV1.getPosts({ category: 'report', limit: 10 }),
          postServiceV1.getPosts({ category: 'news', limit: 10 }),
          postServiceV1.getPosts({ category: 'finance', limit: 10 })
        ]);
        setArticles({
          report: reportResponse.data.map(post => ({
            id: post.id.toString(),
            title: post.title,
            excerpt: post.title,
            date: formatDate(post.created_at),
            image: post.image_url || defaultImage,
            category: post.category,
            description: post.description,
            status: post.status,
            date_post: post.date_post ? formatDate(post.date_post) : formatDate(post.created_at),
            sub_type: post.sub_type,
            readTime: '5 min read',
            author: {
              name: post.author || 'Admin',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
            }
          })),
          news: newsResponse.data.map(post => ({
            id: post.id.toString(),
            title: post.title,
            excerpt: post.title,
            date: formatDate(post.created_at),
            image: post.image_url || defaultImage,
            category: post.category,
            description: post.description,
            status: post.status,
            date_post: post.date_post ? formatDate(post.date_post) : formatDate(post.created_at),
            sub_type: post.sub_type,
            readTime: '5 min read',
            author: {
              name: post.author || 'Admin',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
            }
          })),
          finance: financeResponse.data.map(post => ({
            id: post.id.toString(),
            title: post.title,
            excerpt: post.title,
            date: formatDate(post.created_at),
            image: post.image_url,
            category: post.category,
            description: post.description,
            readTime: '5 min read',
            status: post.status,
            date_post: post.date_post ? formatDate(post.date_post) : formatDate(post.created_at),
            sub_type: post.sub_type,
            author: {
              name: post.author || 'Admin',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
            }
          }))
        });
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, []);
  
  // Filter articles by category
  const reportArticles = articles.report;
  const portfolioArticles = articles.news;
  const marketArticles = articles.finance;
  
  const loadMore = (category: string) => {
    const getArticlesByCategoryLabel = (label: string) => {
      if (label === 'Báo cáo') return reportArticles;
      if (label === 'Tin tức') return portfolioArticles;
      return marketArticles;
    };

    setVisibleArticles(prev => ({
      ...prev,
      [category]: Math.min(
        prev[category as keyof typeof prev] + 3,
        getArticlesByCategoryLabel(category).length
      )
    }));
  };
  
  // Handler for category title click
  const handleCategoryClick = (category: string) => {
    navigate(`/articles?category=${encodeURIComponent(category)}`);
  };
  
  return (
    <section className="pt-5 pb-16 relative">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="section-title">
            Thông tin mới nhất
          </h2>
          <Link 
            to="/articles" 
            className="hidden sm:flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <span>Xem tất cả bài viết</span>
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {/* Two-column layout: Articles (2/3) and Sidebar (1/3) */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Articles column (2/3 width) */}
          <div className="w-full lg:w-2/3">
            {/* Reports Category */}
            <div className="mb-12">
              <h3 
                className="text-xl font-bold mb-6 flex items-center border-l-4 border-primary pl-3 cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleCategoryClick('Báo cáo')}
              >
                Báo cáo
              </h3>
              {reportArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Hiện tại bài viết đang trống
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                  {reportArticles.slice(0, visibleArticles['Báo cáo']).map((article) => (
                    <div key={article.id} className="flex h-full">
                      <ArticleCard {...article} />
                    </div>
                  ))}
                </div>
              )}
              
              {/* See more button */}
              {visibleArticles['Báo cáo'] < reportArticles.length && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => loadMore('Báo cáo')}
                    className="mt-4"
                  >
                    See more
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* News Category */}
            <div className="mb-12">
              <h3 
                className="text-xl font-bold mb-6 flex items-center border-l-4 border-primary pl-3 cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleCategoryClick('Tin tức')}
              >
                Tin tức
              </h3>
              {portfolioArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Hiện tại bài viết đang trống
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                  {portfolioArticles.slice(0, visibleArticles['Tin tức']).map((article) => (
                    <div key={article.id} className="flex h-full">
                      <ArticleCard {...article} />
                    </div>
                  ))}
                </div>
              )}
              
              {/* See more button */}
              {visibleArticles['Tin tức'] < portfolioArticles.length && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => loadMore('Tin tức')}
                    className="mt-4"
                  >
                    See more
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Market Information Category */}
            <div>
              <h3 
                className="text-xl font-bold mb-6 flex items-center border-l-4 border-primary pl-3 cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleCategoryClick('Tài chính')}
              >
                Tài chính
              </h3>
              {marketArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Hiện tại bài viết đang trống
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                  {marketArticles.slice(0, visibleArticles['Tài chính']).map((article) => (
                    <div key={article.id} className="flex h-full">
                      <ArticleCard {...article} />
                    </div>
                  ))}
                </div>
              )}
              
              {/* See more button */}
              {visibleArticles['Tài chính'] < marketArticles.length && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => loadMore('Tài chính')}
                    className="mt-4"
                  >
                    See more
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* View all link (mobile) */}
            <div className="mt-10 text-center sm:hidden">
              <Link 
                to="/articles" 
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <span>View all articles</span>
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
          
          {/* Sidebar Stock component */}
          <SidebarStock className="w-full lg:w-1/3" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticles;
