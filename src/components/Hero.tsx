
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { slideV1Service } from "@/services/v1/slide_v1.service";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Default slides that will be used if no custom slides are found
interface HeroSlide {
  id: number;
  url: string;
  alt: string;
  heading: string;
  description: string;
}

const defaultSlideImages: HeroSlide[] = [
  {
    id: 1,
    url: "/slide1.jpg",
    alt: "",
    heading:
      "ORCA - Nền Tảng Tín Hiệu và Phân Tích Cổ Phiếu Chứng Khoán Hiệu Quả Cao",
    description:
      'Phong cách "Sát thủ đại dương" (Mạnh mẽ & Quyết đoán)',
  },
  {
    id: 2,
    url: "/slide2.jpg",
    alt: "orca",
    heading:
      "ORCA - Tiên phong sử dụng AI với độ chính xác cao trong trading.",
    description:
      "ORCA: Bản năng AI. Hành động táo bạo. Lợi nhuận tuyệt đối.",
  },
];

const Hero = () => {
  const [slideImages, setSlideImages] = useState<HeroSlide[]>(defaultSlideImages);
  const [activeSlide, setActiveSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi | null>(null);

  // Load slides từ public API v1; fallback về default nếu lỗi hoặc không có dữ liệu
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const slides = await slideV1Service.getSlides();

        if (!slides || slides.length === 0) {
          setSlideImages(defaultSlideImages);
          return;
        }

        const mapped: HeroSlide[] = slides.map((s) => ({
          id: s.id,
          url: s.image_url,
          alt: s.heading,
          heading: s.heading, 
          description: s.description,
        }));

        setSlideImages(mapped);
      } catch (error) {
        // Nếu không gọi được API (chưa login / lỗi server), giữ default
        console.error("Failed to load hero slides from API:", error);
        setSlideImages(defaultSlideImages);
        // Không spam toast nếu user không phải admin, nhưng log 1 lần là đủ
      }
    };

    fetchSlides();
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
    <section className="relative overflow-hidden">
      {/* Slideshow Background */}
      <div className="absolute inset-0">
        <Carousel
          className="w-full h-full"
          setApi={setApi}
          opts={{
            loop: true, // Enable infinite looping
            align: "center",
          }}
        >
          <CarouselContent className="h-full">
            {slideImages.map((slide, index) => (
              <CarouselItem key={slide.id} className="h-full">
                <div className="relative w-full h-[calc(50vh-40px)] min-h-[250px] max-h-[480px]">
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
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 min-h-[220px] sm:min-h-[260px] md:min-h-[320px] flex items-center">
        {/* Hero content */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-fade-up">
            {/* Headline - Dynamic based on active slide */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 mt-10 text-white drop-shadow-md">
              {slideImages[activeSlide]?.heading || 'Welcome to our platform'}
            </h1>
            
            {/* Description - Dynamic based on active slide */}
            <p className="text-base sm:text-lg text-white/90 mb-6 max-w-2xl mx-auto drop-shadow-sm">
              {slideImages[activeSlide]?.description || 'Discover financial insights and opportunities'}
            </p>
            
            {/* Call to action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                to="/articles" 
                className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary text-white font-medium shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all"
              >
                Báo cáo
              </Link>
              <Link 
                to="/articles" 
                className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-white text-primary font-medium shadow-md hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all"
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
