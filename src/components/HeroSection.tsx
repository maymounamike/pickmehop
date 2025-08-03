import { useEffect, useState } from "react";
import BookingForm from "./BookingForm";
import heroBackground from "@/assets/hero-background.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate transform based on scroll position within hero bounds
  const heroHeight = window.innerHeight * 1.4; // 140vh
  const maxScroll = heroHeight - window.innerHeight;
  const scrollProgress = Math.min(scrollY / maxScroll, 1);
  // Limit translateY to prevent form from being cut off
  const maxTranslateY = isMobile ? 100 : 80; // Reduced movement
  const translateY = Math.min(scrollProgress * maxTranslateY, 100);

  return (
    <section 
      className="relative min-h-screen lg:min-h-[140vh] flex items-start justify-center overflow-hidden pt-16 sm:pt-24 pb-32 sm:pb-40 bg-gradient-hero"
      aria-label="Book a ride service"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-float delay-1000 hidden lg:block" />
      <div className="absolute top-40 right-20 w-20 h-20 bg-accent/20 rounded-full animate-float delay-2000 hidden lg:block" />
      <div className="absolute bottom-40 left-20 w-24 h-24 bg-primary/20 rounded-full animate-float delay-500 hidden lg:block" />
      
      {/* Content */}
      <div 
        className="relative z-10 container mx-auto px-4 py-4 sm:py-6 lg:py-8 flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-start lg:justify-between lg:pt-20 transition-transform duration-75 ease-out"
        style={{ 
          transform: `translateY(${translateY}px)` 
        }}
      >
        {/* Hero Text */}
        <div className="text-center lg:text-left max-w-2xl lg:flex-1 lg:pr-8 animate-fade-in">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 sm:mb-7 lg:mb-8 leading-tight">
            Pick Me Hop<br />
            <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
              Before We Go Go
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/90 mb-8 sm:mb-9 lg:mb-10 leading-relaxed font-light">
            Friendly, experienced, reliable English-speaking drivers<br />
            just waiting for you to <span className="font-medium text-accent">Hop On In</span>
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>846 Five-Star Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-100" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-200" />
              <span>Flight Tracking</span>
            </div>
          </div>
        </div>
        
        {/* Booking Form */}
        <div className="w-full max-w-md lg:max-w-sm lg:flex-shrink-0 animate-scale-in delay-300">
          <BookingForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;