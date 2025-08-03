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
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-emerald-100 to-cyan-50">
      <div className="container mx-auto px-4">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-800 mb-8 leading-tight">
              Each driver is carefully <span className="text-cyan-600">handpicked and vetted</span> by our team
            </h2>
            <p className="text-slate-600 text-lg mb-16 max-w-2xl mx-auto">
              We believe in quality over quantity. Every driver goes through our comprehensive vetting process.
            </p>
          </div>

          {/* Vetting Process Flow */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 animate-scale-in">
            {vettingProcess.map((step, index) => (
              <div key={index} className="flex flex-col lg:flex-row items-center group">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-2xl border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:border-emerald-300">
                    <step.icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 leading-tight font-display mb-1">
                    {step.title}
                  </h4>
                  <p className="text-sm font-semibold text-emerald-600 leading-tight">
                    {step.subtitle}
                  </p>
                </div>
                
                {/* Dashed Arrow */}
                {index < vettingProcess.length - 1 && (
                  <div className="flex items-center justify-center mt-6 lg:mt-0 lg:mx-8">
                    <div className="w-px h-12 lg:w-16 lg:h-px bg-gradient-to-b lg:bg-gradient-to-r from-emerald-300 to-cyan-300 opacity-60"></div>
                    <div className="absolute">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 lg:border-t-4 lg:border-b-0 lg:border-l-4 lg:border-r-0 border-transparent border-b-emerald-400 lg:border-t-transparent lg:border-r-emerald-400 rotate-90 lg:rotate-0"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriversQualitySection;