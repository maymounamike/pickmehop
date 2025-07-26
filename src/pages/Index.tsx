import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DriversQualitySection from "@/components/DriversQualitySection";
import ReviewsSection from "@/components/ReviewsSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content" role="main" tabIndex={-1}>
        <HeroSection />
        <HowItWorksSection />
        <DriversQualitySection />
        <ReviewsSection />
      </main>
    </div>
  );
};

export default Index;
