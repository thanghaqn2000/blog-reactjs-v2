import SidebarStock from '@/components/SidebarStock';
import { ArrowLeft, Bookmark, Calendar, Clock, Share2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArticleProps } from '../components/ArticleCard';
import MainLayout from "../layouts/MainLayout";

// Reusing the mock data from our other components
const mockArticles: ArticleProps[] = [
  {
    id: '1',
    title: 'The Impact of Fed Rate Decisions on Stock Market Performance',
    excerpt: 'A comprehensive analysis of how Federal Reserve interest rate changes have historically affected equity markets.',
    category: 'Economics',
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
    category: 'Investing',
    date: 'May 8, 2023',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1591033594798-43282868f85f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    }
  },
  // Add more articles as needed
];

// Mock content for article
const articleContent = `
<p class="text-lg leading-relaxed mb-6">Federal Reserve interest rate decisions are among the most influential economic events for financial markets. When the Fed adjusts rates, the effects ripple through every sector of the economy and significantly impact stock market performance.</p>

<h2 class="text-2xl font-bold mt-10 mb-4">Historical Context</h2>

<p class="leading-relaxed mb-6">Historically, Fed rate cuts have generally been positive for stocks, as lower borrowing costs stimulate economic activity and corporate profits. Conversely, rate hikes typically create headwinds for equities as they increase the cost of capital and potentially slow economic growth.</p>

<p class="leading-relaxed mb-6">However, this relationship isn't always straightforward. Markets often react more to the Fed's forward guidance than to the actual rate decision itself. A rate cut paired with pessimistic economic outlook can send stocks tumbling, while a rate hike accompanied by optimistic projections might actually boost markets.</p>

<h2 class="text-2xl font-bold mt-10 mb-4">Sector-Specific Impacts</h2>

<p class="leading-relaxed mb-6">Different sectors respond quite differently to interest rate changes:</p>

<ul class="list-disc pl-6 mb-6 space-y-2">
  <li><strong>Financial sector:</strong> Banks and other financial institutions often benefit from higher interest rates as they can increase lending margins.</li>
  <li><strong>Utilities and Real Estate:</strong> These sectors typically suffer during rate hikes as their high dividend yields become less attractive compared to bonds, and their heavy debt loads become more expensive to service.</li>
  <li><strong>Technology:</strong> Growth-oriented tech companies are generally more sensitive to rate increases because their valuations depend more heavily on distant future earnings, which are discounted at a higher rate when interest rates rise.</li>
  <li><strong>Consumer Staples:</strong> This defensive sector tends to be less affected by rate changes as demand for essential goods remains relatively stable regardless of economic conditions.</li>
</ul>

<h2 class="text-2xl font-bold mt-10 mb-4">Market Timing and Fed Decisions</h2>

<p class="leading-relaxed mb-6">Attempting to time the market based solely on anticipated Fed actions is notoriously difficult. Markets are forward-looking and often price in expected rate changes well before they occur. The actual market reaction frequently depends on how the actual decision compares to prior expectations.</p>

<p class="leading-relaxed mb-6">Moreover, other factors such as corporate earnings, geopolitical events, and broader economic indicators can overshadow the impact of Fed decisions in the short term.</p>

<h2 class="text-2xl font-bold mt-10 mb-4">Long-Term Investment Strategy</h2>

<p class="leading-relaxed mb-6">For long-term investors, it's generally more productive to focus on fundamentals rather than trying to predict short-term market reactions to Fed policies. A diversified portfolio built around your investment goals and time horizon is typically more robust to interest rate fluctuations than one that attempts to capitalize on anticipated monetary policy changes.</p>

<p class="leading-relaxed mb-6">That said, understanding how different assets in your portfolio might respond to changing interest rates can help you maintain appropriate diversification and potentially adjust your asset allocation as the interest rate environment evolves.</p>

<h2 class="text-2xl font-bold mt-10 mb-4">Conclusion</h2>

<p class="leading-relaxed mb-6">While Fed rate decisions undoubtedly impact stock market performance, the relationship is complex and influenced by numerous other factors. Investors should view these policy changes as one component of a broader economic landscape rather than as isolated events that dictate market direction.</p>

<p class="leading-relaxed">By understanding the nuanced relationship between monetary policy and market performance, investors can better navigate the inevitable fluctuations that accompany changes in the interest rate environment.</p>
`;

// Sample data for sidebar (you can move this to a separate data file later)
const rankedStocks = [
  { id: 1, name: "AAPL", price: 182.52, change: +1.43, rank: 1 },
  { id: 2, name: "MSFT", price: 415.33, change: -0.78, rank: 2 },
  { id: 3, name: "GOOGL", price: 162.08, change: +0.56, rank: 3 },
  { id: 4, name: "AMZN", price: 177.23, change: +2.12, rank: 4 },
  { id: 5, name: "NVDA", price: 946.10, change: -1.25, rank: 5 },
];

const fundGrowthData = [
  { day: "Mon", value: 143.87 },
  { day: "Tue", value: 144.32 },
  { day: "Wed", value: 143.95 },
  { day: "Thu", value: 145.76 },
  { day: "Fri", value: 146.82 },
  { day: "Sat", value: 147.15 },
  { day: "Sun", value: 148.43 },
];

const Article = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    setIsLoading(true);
    setTimeout(() => {
      const foundArticle = mockArticles.find(a => a.id === id);
      setArticle(foundArticle || null);
      setIsLoading(false);
    }, 500);
  }, [id]);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };
  
  const handleBookmark = () => {
    toast.success('Article saved to your bookmarks');
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (!article) {
    return (
      <MainLayout>
        <div className="container-page min-h-screen pt-20">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Article not found</h1>
            <p className="text-foreground/70 mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Link 
              to="/articles" 
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-primary text-white font-medium shadow-sm hover:bg-primary/90 transition-all"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Articles
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <article className="pt-20 pb-16">
        {/* Hero section */}
        <div className="w-full h-[40vh] sm:h-[50vh] relative">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 z-20 flex items-end">
            <div className="container mx-auto px-4 sm:px-6 pb-10">
              <div className="max-w-3xl">
                <div className="chip bg-primary text-white mb-4">
                  {article.category}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {article.title}
                </h1>
                
                <div className="flex flex-wrap items-center text-white/90 gap-x-6 gap-y-3 text-sm">
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    <span>{article.author.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Back link */}
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <Link 
            to="/articles" 
            className="inline-flex items-center text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span>Back to Articles</span>
          </Link>
        </div>
        
        {/* Article content */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-5 max-w-[1400px] mx-auto">
            {/* Main content */}
            <div className="w-full lg:max-w-[800px] lg:mx-auto">
              {/* Article actions */}
              <div className="sticky top-20 z-30 float-right ml-6 mb-6 flex flex-col items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-border">
                <button 
                  onClick={handleShare}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  aria-label="Share article"
                >
                  <Share2 size={18} />
                </button>
                <button 
                  onClick={handleBookmark}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  aria-label="Bookmark article"
                >
                  <Bookmark size={18} />
                </button>
              </div>
              
              {/* Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: articleContent }}
              />
              
              {/* Author */}
              <div className="mt-16 pt-10 border-t border-border">
                <div className="flex items-center">
                  <img 
                    src={article.author.avatar} 
                    alt={article.author.name}
                    className="w-14 h-14 rounded-full object-cover border border-border mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-lg">
                      {article.author.name}
                    </h3>
                    <p className="text-foreground/70 text-sm">Financial Analyst</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-[380px]">
              <div className="sticky top-20">
                <SidebarStock 
                  rankedStocks={rankedStocks}
                  fundGrowthData={fundGrowthData}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    </MainLayout>
  );
};

export default Article;
