import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ReviewsSection from "@/components/ReviewsSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content" role="main" tabIndex={-1}>
        <HeroSection />
        <ReviewsSection />
      </main>
    </div>
  );
};

export default Index;
