import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Search, Shield, Users, Car, Globe, ArrowRight, Star } from "lucide-react";

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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Main Driver Profile Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0D2C54] mb-4">
            The best drivers in Paris
          </h2>
        </div>

        {/* Driver Profile Card */}
        <div className="max-w-6xl mx-auto mb-20">
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Driver Photo Section */}
                <div className="relative bg-gradient-to-br from-[#0D2C54]/5 to-[#FFB400]/5 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#FFB400] shadow-xl">
                        <img 
                          src="/lovable-uploads/f96ccf5b-59cc-4691-b437-013293cc74b5.png" 
                          alt="Professional driver Michael"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Verified Badge */}
                      <div className="absolute -bottom-2 -right-2 bg-[#FFB400] text-[#0D2C54] rounded-full p-2 shadow-lg">
                        <Star className="w-6 h-6 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Information Section */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-3xl font-bold text-[#0D2C54] mb-2">Michael</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        Professional driver with extensive experience in Paris transportation. 
                        Committed to providing safe, comfortable, and reliable service for all passengers.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Car Information */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FFB400]/10 rounded-full flex items-center justify-center">
                          <Car className="w-5 h-5 text-[#FFB400]" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground block">Car</span>
                          <span className="font-semibold text-[#0D2C54]">Ford Kuga 2024</span>
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FFB400]/10 rounded-full flex items-center justify-center">
                          <Globe className="w-5 h-5 text-[#FFB400]" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground block">Languages</span>
                          <span className="font-semibold text-[#0D2C54]">English, French</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vetting Process Section */}
        <div className="bg-gradient-to-r from-[#0D2C54]/5 to-[#FFB400]/5 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-[#0D2C54] mb-4">
              Each driver is carefully handpicked and vetted by our team
            </h3>
          </div>

          {/* Desktop Vetting Process */}
          <div className="hidden lg:flex items-center justify-between max-w-5xl mx-auto">
            {vettingProcess.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#FFB400] rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <step.icon className="w-8 h-8 text-[#0D2C54]" />
                  </div>
                  <h4 className="font-bold text-[#0D2C54] mb-1 text-sm">
                    {step.title}
                  </h4>
                  <p className="font-semibold text-[#FFB400] text-sm mb-2">
                    {step.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[120px]">
                    {step.description}
                  </p>
                </div>
                
                {index < vettingProcess.length - 1 && (
                  <div className="flex items-center mx-8">
                    <div className="w-16 h-px bg-[#FFB400]/30"></div>
                    <ArrowRight className="w-4 h-4 text-[#FFB400] ml-2" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Vetting Process */}
          <div className="lg:hidden space-y-6">
            {vettingProcess.map((step, index) => (
              <div key={index} className="flex items-center gap-4 bg-white/50 rounded-xl p-4">
                <div className="w-12 h-12 bg-[#FFB400] rounded-xl flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-6 h-6 text-[#0D2C54]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#0D2C54] mb-1">
                    {step.title} {step.subtitle}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Final Badge */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-[#0D2C54] text-white px-6 py-3 rounded-full shadow-lg">
              <CheckCircle className="w-5 h-5 text-[#FFB400]" />
              <span className="font-semibold">Ready for the first ride</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriversQualitySection;