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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-6 leading-tight">
              Each driver is carefully <span className="text-primary">handpicked and vetted</span> by our team
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We believe in quality over quantity. Every driver goes through our comprehensive vetting process.
            </p>
          </div>

          {/* Vetting Process Flow - Enhanced Mobile Layout */}
          <div className="relative">
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-center gap-12 animate-scale-in">
              {vettingProcess.map((step, index) => (
                <div key={index} className="flex items-center group">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white rounded-2xl border-2 border-border flex items-center justify-center mx-auto mb-4 shadow-card group-hover:scale-105 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-elegant">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground leading-tight font-display mb-1">
                      {step.title}
                    </h4>
                    <p className="text-sm font-semibold text-primary leading-tight">
                      {step.subtitle}
                    </p>
                  </div>
                  
                  {/* Desktop Arrow */}
                  {index < vettingProcess.length - 1 && (
                    <div className="flex items-center justify-center mx-8">
                      <div className="w-16 h-px bg-gradient-to-r from-border to-primary/30 opacity-60"></div>
                      <div className="absolute">
                        <div className="w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-transparent border-r-primary"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Layout - Horizontal Scrolling Cards */}
            <div className="lg:hidden">
              {/* Scroll Indicator */}
              <div className="flex items-center justify-center mb-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
                  <div className="w-6 h-2 bg-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
                </div>
                <span className="text-xs text-muted-foreground ml-3">Swipe to explore</span>
              </div>

              {/* Horizontal Scrolling Container */}
              <div className="overflow-x-auto scrollbar-hide pb-4">
                <div className="flex gap-4 px-4 w-max animate-scale-in">
                  {vettingProcess.map((step, index) => (
                    <div key={index} className="relative flex-none">
                      {/* Mobile Card */}
                      <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6 w-44 text-center group hover:scale-105 transition-all duration-300 hover:border-primary/50 hover:shadow-elegant">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 flex items-center justify-center mx-auto mb-4">
                          <step.icon className="w-7 h-7 text-primary" />
                        </div>
                        <h4 className="text-sm font-bold text-foreground leading-tight font-display mb-1">
                          {step.title}
                        </h4>
                        <p className="text-sm font-semibold text-primary leading-tight mb-3">
                          {step.subtitle}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {/* Mobile Process Connector */}
                      {index < vettingProcess.length - 1 && (
                        <div className="absolute top-8 -right-2 z-10">
                          <div className="w-4 h-px bg-gradient-to-r from-primary to-primary/30"></div>
                          <div className="absolute -right-1 -top-1">
                            <div className="w-0 h-0 border-l-2 border-r-0 border-t-1 border-b-1 border-transparent border-r-primary"></div>
                          </div>
                        </div>
                      )}

                      {/* Step Number Badge */}
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Process Summary */}
              <div className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <h5 className="font-semibold text-foreground">4-Step Quality Process</h5>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Every driver completes our comprehensive vetting process before their first ride
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriversQualitySection;