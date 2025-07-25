import BookingForm from "./BookingForm";
import heroBackground from "@/assets/hero-background.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Hero Text */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Hop on board with Pick Me Hop
          </h1>
          <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl">
            Your friendly, reliable ride service - hop in and let us take you where you need to go!
          </p>
        </div>
        
        {/* Booking Form */}
        <div className="flex-shrink-0">
          <BookingForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;