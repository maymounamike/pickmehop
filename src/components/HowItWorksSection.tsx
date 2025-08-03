import { Card, CardContent } from "@/components/ui/card";
import { Monitor, UserCheck, Car, Plane, RefreshCw, Phone } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      title: "Book your transfer",
      description: "Reserve and pay for your ride using the form at the top of this page. You will get your driver's details and instructions a few days before the transfer.",
      icon: Monitor
    },
    {
      title: "Meet your driver",
      description: "Your driver will be waiting for you at the arranged meeting point, at the right time. Even if your arrival is delayed.",
      icon: UserCheck
    },
    {
      title: "Enjoy your ride", 
      description: "The driver will escort you to the car, help you with luggage and offer tips about your stay. You can relax in our comfortable, air-conditioned car.",
      icon: Car
    }
  ];

  const features = [
    {
      icon: Plane,
      title: "Our drivers monitor flights and always arrive on time",
      description: ""
    },
    {
      icon: RefreshCw,
      title: "Cancel up to 24 hours before the pickup and get an 80% refund",
      description: ""
    },
    {
      icon: Phone,
      title: "24/7 customer support",
      description: ""
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* How it works */}
        <div className="text-center mb-20">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
            Simple, secure, and stress-free. Get your ride in just three easy steps.
          </p>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center group animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card group-hover:scale-105 transition-all duration-300">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  {/* Connection line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-12 h-px bg-border transform translate-x-6"></div>
                  )}
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reliable and safe */}
        <div className="text-center">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-16">
            Reliable and safe
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center text-center md:text-left group">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
                  {feature.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;