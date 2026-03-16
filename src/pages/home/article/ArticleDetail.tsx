import SidebarStock from '@/components/SidebarStock';
import VipUpgradeModal from '@/components/VipUpgradeModal';
import { formatDate } from '@/config/date.config';
import { useAuth } from '@/contexts/AuthContext';
import { postServiceV1 } from '@/services/v1/post.service';
import DOMPurify from 'dompurify';
import { ArrowLeft, Calendar, Crown, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArticleProps } from '../../../components/ArticleCard';
import MainLayout from "../../../layouts/MainLayout";

// SidebarStock hiện tự fetch dữ liệu, không cần sample data tại đây
const defaultImage = import.meta.env.VITE_DEFAULT_IMG_POST;


const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        const response = await postServiceV1.getDetailPost(slug);
        const post = response.data;
        setArticle({
          id: post.id.toString(),
          slug: post.slug,
          title: post.title,
          excerpt: post.title,
          category: post.category,
          date: formatDate(post.date_post || post.created_at),
          readTime: '5 min read',
          description: post.description,
          status: post.status,
          image: post.image_url || defaultImage,
          sub_type: post.sub_type,
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
  }, [slug]);
  
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
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h1>
            <p className="text-foreground/70 mb-8">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link 
              to="/articles" 
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-primary text-white font-medium shadow-sm hover:bg-primary/90 transition-all"
            >
              <ArrowLeft size={16} className="mr-2" />
              Trở lại trang chủ
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isVipArticle = article.sub_type === 'vip';
  console.log(article.sub_type);
  const canViewVip = !!user && (user.is_admin || user.is_vip);
  const shouldGateVip = isVipArticle && !canViewVip;

  const getFirstHalfSentences = (html: string) => {
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) return [];
    const parts = text.split(/(?<=[.!?])\s+/);
    return parts.slice(0, 1);
  };

  const firstHalfSentences = shouldGateVip ? getFirstHalfSentences(article.content || '') : [];
  
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
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="chip bg-primary text-white">
                  {article.category}
                </div>
                {article.sub_type === 'vip' && (
                  <div className="chip bg-amber-600 text-white flex items-center gap-1.5">
                    <Crown size={14} className="shrink-0" />
                    VIP
                  </div>
                )}
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
        
        {shouldGateVip && (
          <div className="container mx-auto px-4 sm:px-6 pt-6">
            <div className="max-w-8xl">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                          <Lock size={24} />
                      </div>
                      <div>
                          <p className="font-bold text-amber-900">Bài viết này dành cho user VIP</p>
                          <p className="text-sm text-amber-700">Rất vui nếu quí khách nâng cấp tài khoản để đọc toàn bộ phân tích chuyên sâu.</p>
                      </div>
                  </div>
                  <button onClick={() => setShowUpgradeModal(true)} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95 whitespace-nowrap">
                      Nâng cấp VIP ngay
                  </button>
              </div>
            </div>
          </div>
        )}

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
              {shouldGateVip ? (
                <div className="space-y-6">
                  <div className="prose prose-lg max-w-none">
                    {firstHalfSentences.length > 0 ? (
                      firstHalfSentences.map((s, idx) => <p key={idx}>{s}</p>)
                    ) : (
                      <p>Chưa có nội dung</p>
                    )}
                  </div>

                  <div className="relative rounded-2xl border border-border bg-white overflow-hidden">
                    <div
                      className="pointer-events-none select-none opacity-60 blur-sm px-6 py-6"
                      aria-hidden
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(article.content || ''),
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/60 to-white" />
                        <div className="absolute inset-0 blur-overlay mt-[100px]">
                            <div className="text-center p-6 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm mx-auto">
                                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Crown size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng ký để đọc tiếp</h3>
                                <p className="text-gray-500 text-sm mb-6">Bạn cần tài khoản VIP để xem đầy đủ bài viết này.</p>
                                <button onClick={() => setShowUpgradeModal(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 mb-3">
                                    Nâng cấp ngay
                                </button>
                                {/* <p className="text-xs text-gray-400 italic">Chỉ từ 99.000đ/tháng</p> */}
                            </div>
                        </div>
                  </div>
                </div>
              ) : (
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(article.content || "Chưa có nội dung"),
                  }}
                />
              )}
            </div>

            {/* Sidebar — scroll độc lập */}
            <div className="w-full lg:w-[380px] lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
              <SidebarStock className="w-full" />
            </div>
          </div>
        </div>
      </article>

      <VipUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </MainLayout>
  );
};

export default Article;
