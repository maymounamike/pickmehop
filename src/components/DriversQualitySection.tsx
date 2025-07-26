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
    <section className="py-16 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            The best drivers in each destination
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto"></div>
        </div>

        {/* Vetting Process */}
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
                    Each driver is carefully handpicked and vetted by our team
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
                  {vettingProcess.map((step, index) => (
                    <div key={index} className="text-center relative">
                      {/* Connection Arrow */}
                      {index < vettingProcess.length - 1 && (
                        <div className="hidden lg:block absolute top-8 -right-2 w-4 h-px bg-accent"></div>
                      )}
                      
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <step.icon className="w-6 h-6 text-accent" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-800 leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-sm font-semibold text-gray-800 leading-tight mb-2">
                        {step.subtitle}
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