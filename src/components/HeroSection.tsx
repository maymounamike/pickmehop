import BookingForm from "./BookingForm";
import heroBackground from "@/assets/hero-background.jpg";

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-[160vh] flex items-start justify-center overflow-hidden pt-16 sm:pt-24 pb-16 sm:pb-20 bg-black lg:bg-transparent"
      aria-label="Book a ride service"
    >
      {/* Background Image - Hidden on mobile/tablet, visible on desktop */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden lg:block"
        style={{ backgroundImage: `url(${heroBackground})` }}
        role="img"
        aria-label="City landscape background"
      />
      
      {/* Overlay - Only visible on desktop when background image is shown */}
      <div className="absolute inset-0 bg-black/60 hidden lg:block" aria-hidden="true" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-4 sm:py-6 lg:py-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 max-h-screen">
        {/* Hero Text */}
        <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-5 lg:mb-6 leading-tight">
            Pick Me Hop Before<br />We Go Go
          </h1>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-white/90 mb-6 sm:mb-7 lg:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Friendly, experienced, reliable English-speaking drivers<br />just waiting for you to Hop On In
          </p>
        </div>
        
        {/* Booking Form */}
        <div className="flex-shrink-0 w-full max-w-lg lg:max-w-xl">
          <BookingForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;