import { Button } from "@/components/ui/button";
import { formatDate } from "@/config/date.config";
import { postServiceV1 } from "@/services/v1/post.service";
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArticleCard from './ArticleCard';
import SidebarStock from './SidebarStock';

// Sample data for ranked stocks
const rankedStocks = [
  { id: 1, name: "AAPL", price: 182.52, change: +1.43, rank: 1 },
  { id: 2, name: "MSFT", price: 415.33, change: -0.78, rank: 2 },
  { id: 3, name: "GOOGL", price: 162.08, change: +0.56, rank: 3 },
  { id: 4, name: "AMZN", price: 177.23, change: +2.12, rank: 4 },
  { id: 5, name: "NVDA", price: 946.10, change: -1.25, rank: 5 },
];

// Sample data for fund growth chart
const fundGrowthData = [
  { day: "Mon", value: 143.87 },
  { day: "Tue", value: 144.32 },
  { day: "Wed", value: 143.95 },
  { day: "Thu", value: 145.76 },
  { day: "Fri", value: 146.82 },
  { day: "Sat", value: 147.15 },
  { day: "Sun", value: 148.43 },
];
const defaultImage = import.meta.env.VITE_DEFAULT_IMG_POST;

interface Article {
  id: string;
  title: string;
  excerpt: string;
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
    'Đầu tư danh mục': 3,
    'Thông tin thị trường': 3
  });

  const [articles, setArticles] = useState<{
    news: Article[];
    finance: Article[];
  }>({
    news: [],
    finance: []
  });  
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const [newsResponse, financeResponse] = await Promise.all([
          postServiceV1.getPosts({ category: 'news', limit: 3 }),
          postServiceV1.getPosts({ category: 'finance', limit: 3 })
        ]);
        setArticles({
          news: newsResponse.data.map(post => ({
            id: post.id.toString(),
            title: post.title,
            excerpt: post.title,
            date: formatDate(post.created_at),
            image: post.image_url || defaultImage,
            category: post.category,
            status: post.status,
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
            readTime: '5 min read',
            status: post.status,
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
  const portfolioArticles = articles.news;
  const marketArticles = articles.finance;
  
  const loadMore = (category: string) => {
    setVisibleArticles(prev => ({
      ...prev,
      [category]: Math.min(prev[category as keyof typeof prev] + 3, 
        category === 'Đầu tư danh mục' ? portfolioArticles.length : marketArticles.length)
    }));
  };
  
  // Handler for category title click
  const handleCategoryClick = (category: string) => {
    navigate(`/articles?category=${encodeURIComponent(category)}`);
  };
  
  return (
    <section className="py-16 relative">
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
            <span>View all articles</span>
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {/* Two-column layout: Articles (2/3) and Sidebar (1/3) */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Articles column (2/3 width) */}
          <div className="w-full lg:w-2/3">
            {/* Portfolio Investments Category */}
            <div className="mb-12">
              <h3 
                className="text-xl font-bold mb-6 flex items-center border-l-4 border-primary pl-3 cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleCategoryClick('Đầu tư danh mục')}
              >
                Đầu tư danh mục
              </h3>
              {portfolioArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Hiện tại bài viết đang trống
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                  {portfolioArticles.slice(0, visibleArticles['Đầu tư danh mục']).map((article, index) => (
                    <div key={article.id} className="flex h-full">
                      {index === visibleArticles['Đầu tư danh mục'] - 1 && 
                       visibleArticles['Đầu tư danh mục'] < portfolioArticles.length ? (
                        <div className="relative w-full">
                          <ArticleCard {...article} />
                          <div className="absolute right-3 bottom-3 bg-primary text-white p-1.5 rounded-full shadow-md hover:bg-primary/90 transition-colors">
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      ) : (
                        <ArticleCard {...article} />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* See more button */}
              {visibleArticles['Đầu tư danh mục'] < portfolioArticles.length && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => loadMore('Đầu tư danh mục')}
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
                onClick={() => handleCategoryClick('Thông tin thị trường')}
              >
                Thông tin thị trường
              </h3>
              {marketArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Hiện tại bài viết đang trống
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                  {marketArticles.slice(0, visibleArticles['Thông tin thị trường']).map((article, index) => (
                    <div key={article.id} className="flex h-full">
                      {index === visibleArticles['Thông tin thị trường'] - 1 && 
                       visibleArticles['Thông tin thị trường'] < marketArticles.length ? (
                        <div className="relative w-full">
                          <ArticleCard {...article} />
                          <div className="absolute right-3 bottom-3 bg-primary text-white p-1.5 rounded-full shadow-md hover:bg-primary/90 transition-colors">
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      ) : (
                        <ArticleCard {...article} />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* See more button */}
              {visibleArticles['Thông tin thị trường'] < marketArticles.length && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => loadMore('Thông tin thị trường')}
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
          <SidebarStock 
            rankedStocks={rankedStocks}
            fundGrowthData={fundGrowthData}
            className="w-full lg:w-1/3"
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticles;
