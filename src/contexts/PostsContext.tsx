
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: 'published' | 'draft' | 'review';
  date: string;
  category: string;
  author: string;
  thumbnailUrl?: string;
  featured?: boolean;
}

// Sample posts data
const initialPosts: Post[] = [
  { 
    id: '1', 
    title: 'Understanding Market Trends in 2023',
    excerpt: 'An in-depth analysis of market trends and predictions for the upcoming year.',
    content: '<p>This is the full content of the article about market trends...</p>',
    status: 'published',
    date: '2023-05-15',
    category: 'Markets',
    author: 'John Doe'
  },
  { 
    id: '2', 
    title: 'Cryptocurrency: The Next Decade',
    excerpt: 'Exploring the future of cryptocurrency and its impact on global finance.',
    content: '<p>This is the full content about cryptocurrency future...</p>',
    status: 'draft',
    date: '2023-05-10',
    category: 'Crypto',
    author: 'Jane Smith'
  },
  { 
    id: '3', 
    title: 'Investment Strategies for Beginners',
    excerpt: 'A comprehensive guide to investment strategies for those new to the market.',
    content: '<p>This is the full content about investment strategies...</p>',
    status: 'published',
    date: '2023-05-08',
    category: 'Investment',
    author: 'John Doe'
  },
  { 
    id: '4', 
    title: 'The Impact of AI on Financial Markets',
    excerpt: 'How artificial intelligence is reshaping the landscape of financial markets.',
    content: '<p>This is the full content about AI impact...</p>',
    status: 'review',
    date: '2023-05-05',
    category: 'Technology',
    author: 'Jane Smith'
  },
  { 
    id: '5', 
    title: 'Global Economic Outlook Post-Pandemic',
    excerpt: 'Analyzing the global economic situation as we emerge from the pandemic.',
    content: '<p>This is the full content about global economic outlook...</p>',
    status: 'published',
    date: '2023-05-01',
    category: 'Economy',
    author: 'John Doe'
  },
];

interface PostsContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'date'>) => string;
  updatePost: (post: Post) => void;
  deletePost: (id: string) => void;
  getPost: (id: string) => Post | undefined;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const addPost = (postData: Omit<Post, 'id' | 'date'>) => {
    const id = Date.now().toString();
    const newPost: Post = {
      ...postData,
      id,
      date: new Date().toISOString().split('T')[0]
    };
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
    return id;
  };

  const updatePost = (updatedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const deletePost = (id: string) => {
    setPosts(prevPosts => 
      prevPosts.filter(post => post.id !== id)
    );
  };

  const getPost = (id: string) => {
    return posts.find(post => post.id === id);
  };

  return (
    <PostsContext.Provider value={{ posts, addPost, updatePost, deletePost, getPost }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};
