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
    <section className="py-20 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.1),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16 animate-bounce-in">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-800 mb-6 leading-tight">
            Each driver is carefully <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">handpicked and vetted</span> by our team
          </h2>
          <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto font-medium">
            We believe in quality over quantity. Every driver goes through our comprehensive vetting process.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 animate-slide-up">
          {vettingProcess.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-white to-slate-50 rounded-3xl border-2 border-slate-200 flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:scale-110 group-hover:border-primary group-hover:shadow-elegant group-hover:bg-gradient-to-br group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-500 animate-glow-pulse">
                  <step.icon className="w-12 h-12 text-primary group-hover:text-accent transition-colors duration-300" />
                </div>
                {index < vettingProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-14 left-full w-12 h-0.5 bg-gradient-to-r from-primary via-accent to-transparent -translate-x-6 animate-pulse"></div>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-800 font-display group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h4>
                <p className="text-base font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {step.subtitle}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DriversQualitySection;