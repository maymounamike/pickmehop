import { Car, Users, Luggage, Plane, MapPin, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import MickeyMouseIcon from "./MickeyMouseIcon";

const PricingSection = () => {
  // Group services by destination for simplified display
  const destinations = [
    {
      id: "beauvais",
      destination: "Beauvais (BVA) - To/From Paris",
      destinationCode: "BVA",
      destinationIcon: Plane,
      sedan: { id: "beauvais-sedan", price: 150, passengers: "1-4", luggage: "up to 4" },
      minivan: { id: "beauvais-minivan", price: 220, passengers: "5-8", luggage: "up to 8" },
      priceDifference: 70
    },
    {
      id: "orly",
      destination: "Paris Orly Airport (ORY)",
      destinationCode: "ORY",
      destinationIcon: Plane,
      sedan: { id: "orly-sedan", price: 65, passengers: "1-4", luggage: "up to 4" },
      minivan: { id: "orly-minivan", price: 90, passengers: "5-8", luggage: "up to 8" },
      priceDifference: 25
    },
    {
      id: "cdg",
      destination: "Charles de Gaulle Airport (CDG)",
      destinationCode: "CDG",
      destinationIcon: Plane,
      sedan: { id: "cdg-sedan", price: 75, passengers: "1-4", luggage: "up to 4" },
      minivan: { id: "cdg-minivan", price: 135, passengers: "5-8", luggage: "up to 8" },
      priceDifference: 60
    },
    {
      id: "disney",
      destination: "Disneyland Paris (Disney) - To/From Paris",
      destinationCode: "DLP",
      destinationIcon: MickeyMouseIcon,
      sedan: { id: "disney-sedan", price: 80, passengers: "1-4", luggage: "up to 4" },
      minivan: { id: "disney-minivan", price: 110, passengers: "5-8", luggage: "up to 8" },
      priceDifference: 30
    }
  ];

  // Flatten for radio group options
  const serviceOptions = destinations.flatMap(dest => [
    {
      id: dest.sedan.id,
      destination: dest.destination,
      destinationCode: dest.destinationCode,
      vehicle: "Sedan",
      price: dest.sedan.price,
      passengers: dest.sedan.passengers,
      luggage: dest.sedan.luggage
    },
    {
      id: dest.minivan.id,
      destination: dest.destination,
      destinationCode: dest.destinationCode,
      vehicle: "Minivan",
      price: dest.minivan.price,
      passengers: dest.minivan.passengers,
      luggage: dest.minivan.luggage
    }
  ]);

  const [selectedService, setSelectedService] = useState<string>(serviceOptions[0].id);

  const getSelectedServiceDetails = () => {
    return serviceOptions.find(service => service.id === selectedService);
  };

  const handleBookNow = () => {
    const selectedOption = getSelectedServiceDetails();
    console.log(`Booking for ${selectedOption?.destination} - ${selectedOption?.vehicle} - €${selectedOption?.price}`);
    // Scroll to booking form at the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
            Transparent Pricing for Your Journey
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Fixed prices to Paris airports and Disneyland with no hidden fees
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {destinations.map((destination) => (
            <div key={destination.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Destination Header */}
              <div className="bg-primary/5 px-6 py-5 text-center border-b border-border">
                <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <destination.destinationIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {destination.destination.split(' (')[0]}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  {destination.destinationCode} - {destination.id === 'disney' ? 'To/From Paris/CDG/ORY' : 'To/From Paris'}
                </p>
              </div>
              
              {/* Vehicle Options */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sedan Card */}
                  <div className="group cursor-pointer" onClick={() => setSelectedService(destination.sedan.id)}>
                    <div className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                      selectedService === destination.sedan.id 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border hover:border-primary/50 hover:shadow-sm'
                    }`}>
                      <div className="text-center mb-3">
                        <Car className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h4 className="font-semibold text-foreground text-sm">SEDAN</h4>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground mb-1">
                          {destination.sedan.price} €
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{destination.sedan.passengers}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Luggage className="w-3 h-3" />
                            <span>{destination.sedan.luggage}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Minivan Card */}
                  <div className="group cursor-pointer" onClick={() => setSelectedService(destination.minivan.id)}>
                    <div className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                      selectedService === destination.minivan.id 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border hover:border-primary/50 hover:shadow-sm'
                    }`}>
                      <div className="text-center mb-3">
                        <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h4 className="font-semibold text-foreground text-sm">MINIVAN</h4>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground mb-1">
                          {destination.minivan.price} €
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{destination.minivan.passengers}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Luggage className="w-3 h-3" />
                            <span>{destination.minivan.luggage}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto">
            <p className="text-muted-foreground mb-4">
              Need a different route? Contact us for a custom quote
            </p>
            <Button variant="outline" size="lg" className="bg-background hover:bg-primary hover:text-primary-foreground">
              Get Custom Quote
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            At Pick Me Hop, we believe in transparent pricing. All our rates are fixed with no surprises, 
            so you can relax knowing exactly what you'll pay.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;