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
      className="relative min-h-screen lg:min-h-[140vh] flex items-center justify-center overflow-hidden pt-16 sm:pt-20 pb-20 sm:pb-32 bg-gradient-hero"
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
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/40 to-primary/30" />
      
      {/* Content */}
      <div 
        className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:justify-between transition-transform duration-75 ease-out"
        style={{ 
          transform: `translateY(${Math.min(translateY * 0.3, 30)}px)` 
        }}
      >
        {/* Hero Text */}
        <div className="text-center lg:text-left max-w-2xl lg:flex-1 lg:pr-12 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight">
            Pick Me Hop<br />
            <span className="bg-gradient-to-r from-secondary to-highlight bg-clip-text text-transparent">Before We Go Go</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed font-normal">
            Friendly, experienced, reliable English-speaking drivers just waiting for you to <span className="bg-gradient-to-r from-secondary to-highlight bg-clip-text text-transparent">Hop On In</span>
          </p>
        </div>
        
        {/* Booking Form Section */}
        <div className="w-full max-w-md lg:max-w-lg lg:flex-shrink-0 animate-scale-in delay-300">
          {/* Trust Indicators - Now above the form */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm font-medium mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span>Fixed Prices</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-highlight rounded-full animate-pulse delay-100" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-200" />
              <span>Flight Tracking</span>
            </div>
          </div>
          
          <BookingForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;