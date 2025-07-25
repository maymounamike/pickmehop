import BookingForm from "./BookingForm";
import heroBackground from "@/assets/hero-background.jpg";

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
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
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Hero Text */}
        <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Pick Me Hop Before We Go Go
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
            Your friendly, reliable ride service - hop in and let us take you where you need to go!
          </p>
        </div>
        
        {/* Booking Form */}
        <div className="flex-shrink-0 w-full max-w-md lg:max-w-none">
          <BookingForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;