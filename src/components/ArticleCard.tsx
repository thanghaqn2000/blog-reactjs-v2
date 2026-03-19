import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ArticleProps {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  description: string;
  date: string;
  readTime: string;
  image: string;
  status: string;
  content?: string;
  sub_type?: string;
  source?: string;
  author_type?: 'system' | 'admin' | string;
  author: {
    name: string;
    avatar: string;
  };
  trending?: boolean;
  date_post?: string;
}

const ArticleCard = ({ 
  id, 
  slug,
  title, 
  date_post, 
  category, 
  description,
  date, 
  status,
  image, 
  author,
  source,
  author_type,
  sub_type,
  trending = false
}: ArticleProps) => {
  const { user } = useAuth();
  const defaultImage = import.meta.env.VITE_DEFAULT_IMG_POST;
  const imageUrl = image || defaultImage;
  const isSystemAuthor = author_type === 'system';
  const displayAuthorName = isSystemAuthor ? (source ?? '') : author.name;
  const displayAuthorLabel = isSystemAuthor ? 'Nguồn' : 'Tác giả';
  const displayAuthorInitial = (displayAuthorName?.trim()?.charAt(0) ?? '?').toUpperCase();

  return (
    <Link to={`/article/${slug}`} className="block group">
      <motion.article 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card hover-effect overflow-hidden flex flex-col h-full"
      >
        {/* Image container */}
        <div className="relative aspect-[21/9] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Category chip */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex flex-wrap items-center gap-1.5">
              {sub_type === 'vip' && (
                <span className="chip bg-amber-600 text-white flex items-center gap-1.5">
                  <Crown size={14} className="shrink-0" />
                  VIP
                </span>
              )}
            </div>
            {user?.is_admin && (
              <span className={`chip bg-white/90 backdrop-blur-sm ${status === 'pending' ? 'text-red-500' : 'text-primary'}`}>
                {status}
              </span>
            )}
          </div>
          
          {/* Trending badge */}
          {/* {trending && (
            <div className="absolute top-3 right-3">
              <span className="chip bg-primary text-white flex items-center space-x-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1"></span>
                <span>Trending</span>
              </span>
            </div>
          )} */}
        </div>
        
        {/* Content */}
        <div className="flex flex-col flex-grow p-4">
          <h3 className="font-display font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="text-foreground/70 text-sm mb-3 line-clamp-5">
            {description}
          </p>
          
          {/* Author & metadata */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-3">
                {isSystemAuthor ? (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {displayAuthorInitial}
                  </div>
                ) : author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-8 h-8 rounded-full object-cover bg-slate-200"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {displayAuthorInitial}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 leading-none mb-1">{displayAuthorLabel}</span>
                  <span className="text-sm font-bold text-gray-800 leading-none">{displayAuthorName}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-foreground/60">
              <span>{date_post ?? date}</span>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
};

export default ArticleCard;
