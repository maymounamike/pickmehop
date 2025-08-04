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
      className="relative min-h-screen lg:min-h-[140vh] flex items-center justify-center overflow-hidden pt-16 sm:pt-20 pb-20 sm:pb-32"
      style={{ backgroundColor: '#2d5d3d' }}
      aria-label="Book a ride service"
    >
      {/* Background Image - Hidden on mobile and tablet, visible on desktop */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden lg:block"
        style={{
          backgroundImage: `url(${heroBackground})`,
          filter: 'brightness(0.7)'
        }}
      />
      
      {/* Improved Overlay for Better Contrast */}
      <div className="absolute inset-0 bg-dark-base/40" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      
      {/* Content */}
      <div 
        className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:justify-between transition-transform duration-75 ease-out"
        style={{ 
          transform: `translateY(${Math.min(translateY * 0.3, 30)}px)` 
        }}
      >
        {/* Hero Text */}
        <div className="text-center lg:text-left max-w-2xl lg:flex-1 lg:pr-12 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
              style={{ textShadow: '1px 1px 2px rgba(45, 52, 54, 0.8)' }}>
            Pick Me Hop<br />
            <span className="text-secondary" style={{ textShadow: '1px 1px 2px rgba(45, 52, 54, 0.8)' }}>Before We Go Go</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-white mb-8 leading-relaxed font-normal"
             style={{ textShadow: '1px 1px 2px rgba(45, 52, 54, 0.8)' }}>
            Friendly, experienced, reliable English-speaking drivers just waiting for you to <span className="text-secondary cursor-pointer hover:text-highlight transition-colors">Hop On In</span>
          </p>
        </div>
        
        {/* Booking Form Section */}
        <div className="w-full max-w-md lg:max-w-lg lg:flex-shrink-0 animate-scale-in delay-300">
          {/* Trust Indicators - Now above the form */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white text-sm font-medium mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ff4444' }} />
              <span style={{ textShadow: '1px 1px 2px rgba(45, 52, 54, 0.6)' }}>Fixed Prices</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse delay-100" style={{ backgroundColor: '#ff4444' }} />
              <span style={{ textShadow: '1px 1px 2px rgba(45, 52, 54, 0.6)' }}>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse delay-200" style={{ backgroundColor: '#ff4444' }} />
              <span style={{ textShadow: '1px 1px 2px rgba(45, 52, 54, 0.6)' }}>Flight Tracking</span>
            </div>
          </div>
          
          <BookingForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;