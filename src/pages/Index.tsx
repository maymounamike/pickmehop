import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ReviewsSection from "@/components/ReviewsSection";
import BookingForm from "@/components/BookingForm";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content" role="main" tabIndex={-1}>
        <HeroSection />
        <section id="booking" className="py-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <BookingForm />
          </div>
        </section>
        <HowItWorksSection />
        <ReviewsSection />
      </main>
    </div>
  );
};

export default Index;
