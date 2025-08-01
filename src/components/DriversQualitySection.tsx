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
    <section className="py-20 bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            The best drivers in each destination
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>

        {/* Vetting Process */}
        <div className="max-w-6xl mx-auto animate-scale-in">
          <Card className="border-0 shadow-elegant bg-gradient-to-r from-card via-accent/5 to-card backdrop-blur-sm">
            <CardContent className="p-8 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="text-center lg:text-left">
                  <h3 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-8 leading-tight">
                    Each driver is carefully 
                    <span className="bg-gradient-primary bg-clip-text text-transparent"> handpicked and vetted</span> by our team
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    We believe in quality over quantity. Every driver goes through our comprehensive vetting process.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {vettingProcess.map((step, index) => (
                    <div key={index} className="text-center relative group">
                      {/* Connection Line */}
                      {index < vettingProcess.length - 1 && (
                        <div className="hidden lg:block absolute top-10 -right-4 w-8 h-px bg-gradient-to-r from-primary to-accent opacity-30"></div>
                      )}
                      
                      <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card group-hover:scale-110 transition-transform duration-300">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground leading-tight font-display">
                        {step.title}
                      </h4>
                      <p className="text-sm font-semibold text-primary leading-tight mb-2">
                        {step.subtitle}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed hidden lg:block">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DriversQualitySection;