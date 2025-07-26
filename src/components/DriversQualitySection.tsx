import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckCircle, Search, Shield, Users } from "lucide-react";
import driverMichael from "@/assets/driver-michael.jpg";

const DriversQualitySection = () => {
  const driverProfile = {
    name: "Michael",
    image: driverMichael,
    description: "100% Parisian and in love with showing visitors the hidden gems of Paris. He knows the most authentic places in town, far away from tourist traps.",
    car: "Mercedes",
    languages: "English, French, Spanish"
  };

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

        {/* Driver Profile Card */}
        <div className="max-w-5xl mx-auto mb-16">
          <Card className="border-0 shadow-lg overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Navigation Arrows */}
                <div className="hidden lg:flex items-center justify-center w-16 bg-gray-50">
                  <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Driver Image */}
                <div className="lg:w-1/3 relative">
                  <div className="aspect-square lg:aspect-auto lg:h-80 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={driverProfile.image}
                      alt={`${driverProfile.name} - Professional Driver`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Driver Info */}
                <div className="lg:w-2/3 p-8 lg:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                    {driverProfile.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6 text-base lg:text-lg">
                    {driverProfile.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400 block">Car</span>
                      <span className="text-gray-600 font-medium">{driverProfile.car}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Languages</span>
                      <span className="text-gray-600 font-medium">{driverProfile.languages}</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows */}
                <div className="hidden lg:flex items-center justify-center w-16 bg-gray-50">
                  <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
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