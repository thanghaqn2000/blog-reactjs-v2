import SidebarStock from '@/components/SidebarStock';
import { formatDate } from '@/config/date.config';
import { postServiceV1 } from '@/services/v1/post.service';
import DOMPurify from 'dompurify';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArticleProps } from '../../../components/ArticleCard';
import MainLayout from "../../../layouts/MainLayout";

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
const defaultImage = import.meta.env.VITE_DEFAULT_IMG_POST;


const Article = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await postServiceV1.getDetailPost(parseInt(id));
        const post = response.data;
        setArticle({
          id: post.id.toString(),
          title: post.title,
          excerpt: post.title,
          category: post.category,
          date: formatDate(post.created_at),
          readTime: '5 min read',
          description: post.description,
          status: post.status,
          image: post.image_url || defaultImage,
          content: post.content,
          author: {
            name: post.author || 'Admin',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
          }
        });
      } catch (error) {
        console.error('Error fetching article:', error);
        toast.error('Có lỗi xảy ra khi tải bài viết');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
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
        {/* Hero section - fixed size, smooth upscale */}
        <div className="w-full h-[50vh] relative overflow-hidden bg-muted/30 flex items-center justify-center">
          <img 
            src={article.image}
            alt={article.title}
            className="max-w-full max-h-full w-auto h-auto object-contain object-center"
            style={{ imageRendering: 'smooth' as React.CSSProperties['imageRendering'] }}
            decoding="async"
            fetchPriority="high"
          />
        </div>
        
        {/* Article info section - separated from the image */}
        <div className="bg-background pt-10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-5xl">
              <div className="chip bg-primary text-white mb-4">
                {article.category}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center text-foreground/70 gap-x-8 gap-y-3 text-base mb-8">
                <div className="flex items-center">
                  {/* <img 
                    src={article.author.avatar} 
                    alt={article.author.name}
                    className="w-8 h-8 rounded-full object-cover border border-border mr-3"
                  /> */}
                  <span className="font-medium">{article.author.name || 'Admin'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2" />
                  <span>{article.date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Back link */}
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <Link 
            to="/articles" 
            className="inline-flex items-center text-sm font-medium text-foreground/70 hover:text-blue-500 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span>Trở lại trang chủ</span>
          </Link>
        </div>
        
        {/* Article content */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-5 max-w-[1400px] mx-auto">
            {/* Main content */}
            <div className="w-full lg:max-w-[800px] lg:mx-auto">
              {/* Article actions */}
              {/* <div className="sticky top-20 z-30 float-right ml-6 mb-6 flex flex-col items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-border">
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
              </div> */}
              
              {/* Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || 'Chưa có nội dung') }}
              />
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
