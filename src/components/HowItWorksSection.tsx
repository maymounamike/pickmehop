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
    <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative">
        {/* How it works */}
        <div className="text-center mb-16 animate-bounce-in">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-800 mb-6 leading-tight">
            How it <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">works</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
            Book your ride in three simple steps and enjoy a stress-free journey
          </p>
        </div>
          
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-20 animate-slide-up">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-white to-slate-50 rounded-3xl border-2 border-purple-200 flex items-center justify-center mx-auto shadow-glow group-hover:scale-110 group-hover:border-primary group-hover:shadow-elegant group-hover:bg-gradient-to-br group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-500 animate-glow-pulse">
                  <step.icon className="w-10 h-10 text-primary group-hover:text-accent transition-colors duration-300" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-primary to-accent text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg animate-bounce-in">
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 font-display group-hover:text-primary transition-colors duration-300">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="text-center mb-12 animate-bounce-in">
          <h3 className="font-display text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
            Reliable and <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">safe</span>
          </h3>
          <p className="text-slate-600 text-lg max-w-xl mx-auto font-medium">
            Every aspect of your journey is designed with your comfort and safety in mind
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-glow transition-all duration-500 group border-2 hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5 rounded-2xl animate-glow-pulse">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-accent/20 group-hover:scale-110 transition-all duration-300 shadow-glow">
                    <feature.icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors duration-300" />
                  </div>
                  <h4 className="font-semibold text-slate-800 font-display group-hover:text-primary transition-colors duration-300">{feature.title}</h4>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;