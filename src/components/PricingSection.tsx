import { Car, Users, Luggage, Plane, MapPin, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MickeyMouseIcon from "./MickeyMouseIcon";

const PricingSection = () => {
  const destinations = [
    {
      name: "Paris Orly Airport",
      code: "ORY",
      icon: Plane,
      options: [
        {
          passengers: "1-4",
          luggage: "up to 4",
          price: 65,
          vehicle: "Sedan",
          vehicleIcon: Car
        },
        {
          passengers: "5-8",
          luggage: "up to 8",
          price: 90,
          vehicle: "Minivan",
          vehicleIcon: Users
        }
      ]
    },
    {
      name: "Charles de Gaulle Airport",
      code: "CDG",
      icon: Plane,
      options: [
        {
          passengers: "1-4",
          luggage: "up to 4",
          price: 75,
          vehicle: "Sedan",
          vehicleIcon: Car
        },
        {
          passengers: "5-8",
          luggage: "up to 8",
          price: 135,
          vehicle: "Minivan",
          vehicleIcon: Users
        }
      ]
    },
    {
      name: "Paris Beauvais Airport",
      code: "BVA",
      icon: Plane,
      options: [
        {
          passengers: "1-4",
          luggage: "up to 4",
          price: 150,
          vehicle: "Sedan",
          vehicleIcon: Car
        },
        {
          passengers: "5-8",
          luggage: "up to 8",
          price: 220,
          vehicle: "Minivan",
          vehicleIcon: Users
        }
      ]
    },
    {
      name: "Disneyland Paris",
      code: "DLP",
      icon: MickeyMouseIcon,
      options: [
        {
          passengers: "1-4",
          luggage: "up to 4",
          price: 80,
          vehicle: "Sedan",
          vehicleIcon: Car
        },
        {
          passengers: "5-8",
          luggage: "up to 8",
          price: 110,
          vehicle: "Minivan",
          vehicleIcon: Users
        }
      ]
    }
  ];

  const amenities = [
    { icon: Clock, text: "1 hour free waiting time at airports" },
    { icon: Shield, text: "Meet & greet service" },
    { icon: MapPin, text: "Flight tracking" }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
            Transparent Pricing for Your Journey
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Fixed prices to Paris airports and Disneyland with no hidden fees
          </p>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto">
            At Pick Me Hop, we believe in transparent pricing. All our rates are fixed with no surprises, 
            so you can relax knowing exactly what you'll pay.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {destinations.map((destination, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <destination.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {destination.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">
                  {destination.code}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {destination.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <option.vehicleIcon className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {option.vehicle}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        €{option.price}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{option.passengers} passengers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Luggage className="w-3 h-3" />
                        <span>{option.luggage} pieces</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Amenities */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            Included with every journey
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <amenity.icon className="w-4 h-4 text-primary" />
                <span className="text-sm">{amenity.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Need a different route? Contact us for a custom quote
          </p>
          <Button variant="outline" size="lg">
            Get Custom Quote
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;