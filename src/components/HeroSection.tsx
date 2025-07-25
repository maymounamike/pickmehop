import BookingForm from "./BookingForm";
import heroBackground from "@/assets/hero-background.jpg";

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-4 sm:py-8"
      aria-label="Book a ride service"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
        role="img"
        aria-label="City landscape background"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-2 sm:py-4 lg:py-8 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 max-h-screen">
        {/* Hero Text */}
        <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
          <h1 className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 lg:mb-4 leading-tight">
            Pick Me Hop Before<br />We Go Go
          </h1>
          <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-white/90 mb-3 sm:mb-4 lg:mb-6 max-w-2xl mx-auto lg:mx-0">
            Your friendly, reliable ride service - hop in and let us take you where you need to go!
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