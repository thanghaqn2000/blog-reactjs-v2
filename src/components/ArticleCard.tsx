import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export interface ArticleProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  status: string;
  content?: string;
  author: {
    name: string;
    avatar: string;
  };
  trending?: boolean;
}

const ArticleCard = ({ 
  id, 
  title, 
  excerpt, 
  category, 
  date, 
  status,
  image, 
  author,
  trending = false
}: ArticleProps) => {
  const { user } = useAuth();
  const defaultImage = import.meta.env.VITE_DEFAULT_IMG_POST;
  const imageUrl = image || defaultImage;

  return (
    <Link to={`/article/${id}`} className="block group">
      <motion.article 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card hover-effect overflow-hidden flex flex-col h-full"
      >
        {/* Image container */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Category chip */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <span className="chip bg-white/90 backdrop-blur-sm text-primary">
              {category}
            </span>
            {user?.is_admin && (
              <span className={`chip bg-white/90 backdrop-blur-sm ${status === 'pending' ? 'text-red-500' : 'text-primary'}`}>
                {status}
              </span>
            )}
          </div>
          
          {/* Trending badge */}
          {trending && (
            <div className="absolute top-4 right-4">
              <span className="chip bg-primary text-white flex items-center space-x-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1"></span>
                <span>Trending</span>
              </span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex flex-col flex-grow p-5">
          <h3 className="font-display font-bold text-base sm:text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="text-foreground/70 text-sm mb-4 line-clamp-2">
            {excerpt}
          </p>
          
          {/* Author & metadata */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src={author.avatar} 
                alt={author.name}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
              <span className="text-xs text-foreground/80 font-medium">
                {author.name}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-foreground/60">
              <span>{date}</span>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
};

export default ArticleCard;
