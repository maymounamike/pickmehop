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
            {/* Horizontal Scrolling Container */}
            <div className="overflow-x-auto scrollbar-hide pb-6 pt-4">
              <div className="flex gap-6 px-4 w-max animate-scale-in">
                {vettingProcess.map((step, index) => (
                  <div key={index} className="relative flex-none">
                    {/* Enhanced Mobile Card */}
                    <div className="vetting-card vetting-card-animated w-52 text-center">
                      <div className="vetting-icon mx-auto">
                        <step.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground leading-tight font-display mb-2">
                        {step.title}
                      </h3>
                      <h4 className="text-sm font-semibold text-primary leading-tight mb-4">
                        {step.subtitle}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Mobile Process Connector */}
                    {index < vettingProcess.length - 1 && (
                      <div className="absolute top-12 -right-3 z-10">
                        <div className="w-6 h-px bg-gradient-to-r from-primary to-primary/30"></div>
                        <div className="absolute -right-1 -top-1">
                          <div className="w-0 h-0 border-l-2 border-r-0 border-t-1 border-b-1 border-transparent border-r-primary"></div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Step Number Badge */}
                    <div className="absolute top-1 left-1 w-8 h-8 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Process Indicator */}
            <div className="process-indicator">
              <div className="process-line"></div>
              <div className="process-dots">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>

            {/* Enhanced Mobile Process Summary */}
            <div className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h5 className="text-lg font-bold text-foreground">4-Step Quality Process</h5>
              </div>
              <p className="text-center text-muted-foreground leading-relaxed">
                Every driver completes our comprehensive vetting process before their first ride, ensuring the highest standards of safety and professionalism.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriversQualitySection;