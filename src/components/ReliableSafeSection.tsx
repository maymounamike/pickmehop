import { Card, CardContent } from "@/components/ui/card";
import { Plane, RefreshCw, Phone, Clock, Shield, Star } from "lucide-react";

const ReliableSafeSection = () => {
  const features = [
    {
      icon: Plane,
      title: "Flight Monitoring",
      subtitle: "Always on time",
      description: "Our drivers monitor flights and always arrive on time, even if your flight is delayed"
    },
    {
      icon: RefreshCw,
      title: "Flexible Cancellation", 
      subtitle: "80% refund",
      description: "Cancel up to 24 hours before pickup and get an 80% refund with no hassle"
    },
    {
      icon: Phone,
      title: "24/7 Support",
      subtitle: "Always available",
      description: "Round-the-clock customer support to assist you whenever you need help"
    }
  ];

  const trustIndicators = [
    { icon: Shield, text: "Fully Licensed & Insured" },
    { icon: Star, text: "5-Star Rated Drivers" },
    { icon: Clock, text: "Punctual Service Guaranteed" }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-[#0D2C54]/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0D2C54] mb-6">
            Reliable and Safe
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience peace of mind with our professional service standards and commitment to excellence
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div className="w-16 h-16 bg-[#FFB400] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-[#0D2C54]" />
                </div>
                <h3 className="text-xl font-bold text-[#0D2C54] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#FFB400] font-semibold mb-4">
                  {feature.subtitle}
                </p>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center justify-center gap-3 text-center md:text-left">
                <div className="w-10 h-10 bg-[#0D2C54]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <indicator.icon className="w-5 h-5 text-[#0D2C54]" />
                </div>
                <span className="font-semibold text-[#0D2C54]">
                  {indicator.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-[#FFB400] text-[#0D2C54] px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow">
            <Shield className="w-5 h-5" />
            <span>Your Safety is Our Priority</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReliableSafeSection;