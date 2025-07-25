import { Card, CardContent } from "@/components/ui/card";
import { Monitor, UserCheck, Car, Plane, RefreshCw, Phone } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "Book your transfer",
      description: "Reserve and pay for your ride using the form at the top of this page. You will get your driver's details and instructions a few days before the transfer.",
      icon: Monitor
    },
    {
      number: "2", 
      title: "Meet your driver",
      description: "Your driver will be waiting for you at the arranged meeting point, at the right time. Even if your arrival is delayed.",
      icon: UserCheck
    },
    {
      number: "3",
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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* How it works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-12">
            How it works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reliable and safe */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">
            Reliable and safe
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground leading-tight">
                    {feature.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;