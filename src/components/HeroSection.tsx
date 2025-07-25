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
      <div className="absolute inset-0 bg-primary/70" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Hero Text */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Book your airport transfer with Welcome
          </h1>
          <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl">
            Pre-book a trained, English-speaking driver to pick you up at the airport or port for the same price as a regular taxi
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