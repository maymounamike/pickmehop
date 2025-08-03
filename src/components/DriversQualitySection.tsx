import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Search, Shield, Users } from "lucide-react";

const DriversQualitySection = () => {

  const vettingProcess = [
    {
      icon: Users,
      title: "One-on-one",
      subtitle: "Interview",
      description: "Personal screening to ensure quality and professionalism"
    },
    {
      icon: Search,
      title: "Identity and vehicle",
      subtitle: "check",
      description: "Thorough verification of driver credentials and vehicle safety"
    },
    {
      icon: Shield,
      title: "Safety protocol",
      subtitle: "training",
      description: "Comprehensive training on safety procedures and best practices"
    },
    {
      icon: CheckCircle,
      title: "Ready for the",
      subtitle: "first ride",
      description: "Fully qualified and approved for passenger transportation"
    }
  ];

  return (
    <section className="vetting-section">
      <div className="container mx-auto px-4">
        {/* Enhanced Section Header */}
        <div className="section-header">
          <h2 className="font-display text-3xl lg:text-4xl font-bold leading-tight animate-fade-in">
            Our Comprehensive <span className="highlight-text text-primary">Vetting Process</span>
          </h2>
          <p className="subtitle">
            Every driver completes our rigorous 4-step quality process
          </p>
        </div>

        {/* Vetting Container */}
        <div className="vetting-container max-w-1200px mx-auto relative">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-center gap-8 animate-scale-in">
            {vettingProcess.map((step, index) => (
              <div key={index} className="flex items-center group">
                <div className="vetting-card vetting-card-animated text-center">
                  <div className="vetting-icon mx-auto">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-tight font-display mb-2">
                    {step.title}
                  </h3>
                  <h4 className="text-sm font-semibold text-primary leading-tight mb-3">
                    {step.subtitle}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Desktop Arrow */}
                {index < vettingProcess.length - 1 && (
                  <div className="flex items-center justify-center mx-6">
                    <div className="w-12 h-px bg-gradient-to-r from-primary/60 to-primary/30"></div>
                    <div className="absolute">
                      <div className="w-0 h-0 border-l-4 border-r-0 border-t-2 border-b-2 border-transparent border-r-primary ml-1"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Layout - Enhanced Cards */}
          <div className="lg:hidden">
            {/* Grid Container for Mobile */}
            <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:gap-4">
              {vettingProcess.map((step, index) => (
                <div key={index} className="relative">
                  {/* Enhanced Mobile Card */}
                  <div className="vetting-card vetting-card-animated text-center">
                    <div className="vetting-icon mx-auto w-12 h-12 mb-3">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xs font-bold text-foreground leading-tight font-display mb-1">
                      {step.title}
                    </h3>
                    <h4 className="text-xs font-semibold text-primary leading-tight mb-2">
                      {step.subtitle}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed hidden sm:block">
                      {step.description}
                    </p>
                  </div>

                  {/* Enhanced Step Number Badge */}
                  <div className="absolute top-1 left-1 w-6 h-6 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border border-white">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Process Indicator */}
            <div className="process-indicator mt-6">
              <div className="process-line"></div>
              <div className="process-dots">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>

            {/* Enhanced Mobile Process Summary */}
            <div className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <h5 className="text-base font-bold text-foreground">4-Step Quality Process</h5>
              </div>
              <p className="text-sm text-center text-muted-foreground leading-relaxed">
                Every driver completes our comprehensive vetting process before their first ride.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriversQualitySection;