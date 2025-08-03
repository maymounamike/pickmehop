import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";

import DriversQualitySection from "@/components/DriversQualitySection";
import ReliableSafeSection from "@/components/ReliableSafeSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content" role="main" tabIndex={-1}>
        <HeroSection />
        <PricingSection />
        
        <DriversQualitySection />
        <ReliableSafeSection />
        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
