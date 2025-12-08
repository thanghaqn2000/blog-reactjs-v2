import { Filter, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import ArticleCard, { ArticleProps } from "../../../components/ArticleCard";
import MainLayout from "../../../layouts/MainLayout";

const mockArticles: ArticleProps[] = [
  {
    id: '1',
    description: 'The Impact of Fed Rate Decisions on Stock Market Performance',
    title: 'The Impact of Fed Rate Decisions on Stock Market Performance',
    excerpt: 'A comprehensive analysis of how Federal Reserve interest rate changes have historically affected equity markets.',
    category: 'Kinh tế',
    date: 'May 12, 2023',
    readTime: '7 min read',
    status: "pending",
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    trending: true
  },
  {
    id: '2',
    description: 'ESG Investing: Balancing Profit and Responsibility in Your Portfolio',
    title: 'ESG Investing: Balancing Profit and Responsibility in Your Portfolio',
    excerpt: 'How environmental, social, and governance factors are reshaping investment strategies for the modern investor.',
    category: 'Đầu tư',
    date: 'May 8, 2023',
    readTime: '5 min read',
    status: "pending",
    image: 'https://images.unsplash.com/photo-1591033594798-43282868f85f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    }
  },
  {
    id: '3',
    description: 'Quarterly Earnings Guide: What Numbers Really Matter',
    title: 'Quarterly Earnings Guide: What Numbers Really Matter',
    excerpt: 'Beyond EPS and revenue: The key metrics that intelligent investors focus on during earnings season.',
    category: 'Phân tích',
    date: 'May 5, 2023',
    readTime: '6 min read',
    status: "pending",
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'Robert Fernandez',
      avatar: 'https://randomuser.me/api/portraits/men/46.jpg'
    },
    trending: true
  },
  {
    id: '4',
    description: 'Cryptocurrency and Traditional Markets: The Convergence',
    title: 'Cryptocurrency and Traditional Markets: The Convergence',
    excerpt: 'How digital assets are increasingly influencing and correlating with conventional financial markets.',
    category: 'Tiền điện tử',
    date: 'May 3, 2023',
    readTime: '8 min read',
    status: "pending",
    image: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'Alex Wang',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
    }
  },
  {
    id: '5',
    description: 'Tech Stock Analysis: Valuations in a Post-Pandemic World',
    title: 'Tech Stock Analysis: Valuations in a Post-Pandemic World',
    excerpt: 'As the world adjusts to post-pandemic realities, tech stocks face new challenges and opportunities.',
    category: 'Công nghệ',
    date: 'Apr 28, 2023',
    readTime: '6 min read',
    status: "pending",
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'David Kim',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
    }
  },
  {
    id: '6',
    description: 'The Small Cap Advantage: Finding Hidden Gems in Today\'s Market',
    title: 'The Small Cap Advantage: Finding Hidden Gems in Today\'s Market',
    excerpt: 'Why smaller companies might offer outsized returns for investors willing to accept additional risk.',
    category: 'Đầu tư',
    date: 'Apr 25, 2023',
    readTime: '5 min read',
    status: "pending",
    image: 'https://images.unsplash.com/photo-1579226905180-636b76d96082?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'Emily Rodriguez',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
    }
  },
];

// All available categories for filtering
const categories = Array.from(new Set(mockArticles.map(article => article.category)));

const Articles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredArticles, setFilteredArticles] = useState<ArticleProps[]>(mockArticles);
  
  // Filter articles based on search term and category
  useEffect(() => {
    let results = mockArticles;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(article => 
        article.title.toLowerCase().includes(term) || 
        article.excerpt.toLowerCase().includes(term)
      );
    }
    
    if (selectedCategory) {
      results = results.filter(article => article.category === selectedCategory);
    }
    
    setFilteredArticles(results);
  }, [searchTerm, selectedCategory]);
  
  return (
    <MainLayout>
      <section className="pt-28 pb-16 sm:pt-32 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Page header */}
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Bài viết về tài chính
            </h1>
            <p className="text-foreground/70 text-lg">
              Khám phá bộ sưu tập bài viết, phân tích và ý kiến chuyên gia về thị trường tài chính.
            </p>
          </div>
          
          {/* Filters */}
          <div className="mb-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
            {/* Search */}
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
            
            {/* Category filter */}
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
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-foreground/80 hover:bg-secondary/80'
                  } transition-colors`}
                >
                  Tất cả
                </button>
                
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`chip ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-foreground/80 hover:bg-secondary/80'
                    } transition-colors`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mb-6 text-sm text-foreground/70 ">
            Showing {filteredArticles.length} articles
          </div>
          
          {/* Articles grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredArticles.map(article => (
                <ArticleCard key={article.id} {...article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-foreground/70">Không tìm thấy bài viết phù hợp với tiêu chí của bạn.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
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
