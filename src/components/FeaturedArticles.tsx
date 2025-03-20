import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArticleCard, { ArticleProps } from './ArticleCard';
import SidebarStock from './SidebarStock';

// Sample data
const mockArticles: ArticleProps[] = [
  {
    id: '1',
    title: 'The Impact of Fed Rate Decisions on Stock Market Performance',
    excerpt: 'A comprehensive analysis of how Federal Reserve interest rate changes have historically affected equity markets.',
    category: 'Đầu tư danh mục',
    date: 'May 12, 2023',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    trending: true
  },
  {
    id: '2',
    title: 'ESG Investing: Balancing Profit and Responsibility in Your Portfolio',
    excerpt: 'How environmental, social, and governance factors are reshaping investment strategies for the modern investor.',
    category: 'Đầu tư danh mục',
    date: 'May 8, 2023',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1591033594798-43282868f85f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    }
  },
  {
    id: '3',
    title: 'Quarterly Earnings Guide: What Numbers Really Matter',
    excerpt: 'Beyond EPS and revenue: The key metrics that intelligent investors focus on during earnings season.',
    category: 'Thông tin thị trường',
    date: 'May 5, 2023',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'Robert Fernandez',
      avatar: 'https://randomuser.me/api/portraits/men/46.jpg'
    },
    trending: true
  },
  {
    id: '4',
    title: 'Cryptocurrency and Traditional Markets: The Convergence',
    excerpt: 'How digital assets are increasingly influencing and correlating with conventional financial markets.',
    category: 'Thông tin thị trường',
    date: 'May 3, 2023',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'Alex Wang',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
    }
  },
  {
    id: '5',
    title: 'Tech Stock Analysis: Valuations in a Post-Pandemic World',
    excerpt: 'As the world adjusts to post-pandemic realities, tech stocks face new challenges and opportunities.',
    category: 'Đầu tư danh mục',
    date: 'Apr 28, 2023',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'David Kim',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
    }
  },
  {
    id: '6',
    title: 'The Small Cap Advantage: Finding Hidden Gems in Today\'s Market',
    excerpt: 'Why smaller companies might offer outsized returns for investors willing to accept additional risk.',
    category: 'Thông tin thị trường',
    date: 'Apr 25, 2023',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1579226905180-636b76d96082?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'Emily Rodriguez',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
    }
  }
];

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

const FeaturedArticles = () => {
  const navigate = useNavigate();
  const [visibleArticles, setVisibleArticles] = useState({
    'Đầu tư danh mục': 3,
    'Thông tin thị trường': 3
  });
  
  // Filter articles by category
  const portfolioArticles = mockArticles.filter(article => article.category === 'Đầu tư danh mục');
  const marketArticles = mockArticles.filter(article => article.category === 'Thông tin thị trường');
  
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
            Latest Insights
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
