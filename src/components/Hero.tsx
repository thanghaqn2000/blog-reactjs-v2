
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Default slides that will be used if no custom slides are found
const defaultSlideImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920',
    alt: 'Stock market trading',
    heading: 'Empower Your Investment Journey',
    description: 'In-depth analysis and real-time market insights to help you make informed decisions.'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920',
    alt: 'Financial team meeting',
    heading: 'Expert Financial Analysis',
    description: 'Get access to expert opinions and comprehensive market research.'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920',
    alt: 'Digital finance technology',
    heading: 'Future of Digital Finance',
    description: 'Stay ahead with insights on blockchain, cryptocurrencies, and financial technology.'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920',
    alt: 'Global markets data',
    heading: 'Global Market Trends',
    description: 'Explore international market trends and investment opportunities worldwide.'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920',
    alt: 'Retirement planning',
    heading: 'Secure Your Financial Future',
    description: 'Learn strategies for long-term wealth building and retirement planning.'
  }
];

const Hero = () => {
  // Try to get slides from localStorage, otherwise use defaults
  const getSlidesFromStorage = () => {
    try {
      const storedSlides = localStorage.getItem('heroSlides');
      return storedSlides ? JSON.parse(storedSlides) : defaultSlideImages;
    } catch (error) {
      console.error('Error loading slides from storage:', error);
      return defaultSlideImages;
    }
  };

  const [slideImages, setSlideImages] = useState(getSlidesFromStorage());
  const [activeSlide, setActiveSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi | null>(null);

  // Check for updates to slides in localStorage
  useEffect(() => {
    const checkForUpdates = () => {
      setSlideImages(getSlidesFromStorage());
    };

    // Initial check
    checkForUpdates();

    // Add storage event listener to update slides if changed in another tab
    window.addEventListener('storage', checkForUpdates);
    
    return () => {
      window.removeEventListener('storage', checkForUpdates);
    };
  }, []);

  // Set the active slide based on current embla slide
  const onSelect = useCallback(() => {
    if (!api) return;
    setActiveSlide(api.selectedScrollSnap());
  }, [api]);

  // Connect carousel API events
  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (api) {
        api.scrollNext();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [api]);

  const handleSlideChange = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  return (
    <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 relative overflow-hidden">
      {/* Slideshow Background */}
      <div className="absolute inset-0">
        <Carousel 
          className="w-full h-full"
          setApi={setApi}
          opts={{
            loop: true, // Enable infinite looping
            align: "center"
          }}
        >
          <CarouselContent className="h-full">
            {slideImages.map((slide, index) => (
              <CarouselItem key={slide.id} className="h-full">
                <div className="relative w-full h-[calc(100vh-80px)] min-h-[500px]">
                  <img 
                    src={slide.url} 
                    alt={slide.alt}
                    className="absolute inset-0 w-full h-full object-cover object-center -z-10"
                  />
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-black/40 -z-10"></div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Updated navigation buttons - positioned and styled for better visibility */}
          <CarouselPrevious 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-all cursor-pointer" 
          />
          <CarouselNext 
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-all cursor-pointer" 
          />
        </Carousel>
        
        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slideImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeSlide === index ? 'bg-white scale-125' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero content */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-up">
            {/* Tag */}
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-white mb-6 backdrop-blur-sm">
              <span>Financial insights that matter</span>
            </div>
            
            {/* Headline - Dynamic based on active slide */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white drop-shadow-md">
              {slideImages[activeSlide]?.heading || 'Welcome to our platform'}
            </h1>
            
            {/* Description - Dynamic based on active slide */}
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-sm">
              {slideImages[activeSlide]?.description || 'Discover financial insights and opportunities'}
            </p>
            
            {/* Call to action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/articles" 
                className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-primary text-white font-medium shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all"
              >
                Báo cáo
              </Link>
              <Link 
                to="/markets" 
                className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-white text-primary font-medium shadow-md hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all"
              >
                <span>Tín hiệu</span>
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
