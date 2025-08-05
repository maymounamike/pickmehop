import { Car, Users, Luggage, Plane, MapPin, Clock, Shield, Bus } from "lucide-react";
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
      id: "cdg",
      destination: "Charles de Gaulle Airport (CDG) - To/From Paris",
      destinationCode: "CDG",
      destinationIcon: Plane,
      sedan: { id: "cdg-sedan", price: 75, passengers: "1-4", luggage: "up to 4" },
      minivan: { id: "cdg-minivan", price: 135, passengers: "5-8", luggage: "up to 8" },
      priceDifference: 60
    },
    {
      id: "orly",
      destination: "Paris Orly Airport (ORY) - To/From Paris",
      destinationCode: "ORY",
      destinationIcon: Plane,
      sedan: { id: "orly-sedan", price: 65, passengers: "1-4", luggage: "up to 4" },
      minivan: { id: "orly-minivan", price: 90, passengers: "5-8", luggage: "up to 8" },
      priceDifference: 25
    },
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
      id: "disney",
      destination: "Disneyland Paris (Disney) - To/From Paris/CDG/ORY",
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
    <section className="py-20 bg-muted/30">
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

        {/* Pricing Grid - Mobile-First Compact Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {destinations.map((destination) => (
            <div key={destination.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Destination Header - Clean and Compact */}
              <div className="bg-muted/40 px-6 py-4 text-center border-b border-border">
                <div className="flex justify-center mb-2">
                  <destination.destinationIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {destination.destination.split(' (')[0]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {destination.destinationCode} - {destination.id === 'disney' ? 'To/From Paris/CDG/ORY' : 'To/From Paris'}
                </p>
              </div>
              
              {/* Transport Options - Horizontal Layout */}
              <div className="p-0">
                {/* Sedan Option */}
                <div 
                  className={`p-4 border-b border-border cursor-pointer transition-all hover:bg-muted/20 ${
                    selectedService === destination.sedan.id
                      ? 'bg-primary/5 border-l-4 border-l-primary'
                      : ''
                  }`}
                  onClick={() => setSelectedService(destination.sedan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold text-foreground">SEDAN</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-2xl font-bold text-primary">{destination.sedan.price} €</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{destination.sedan.passengers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Luggage className="h-4 w-4" />
                          <span>{destination.sedan.luggage}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minivan Option */}
                <div 
                  className={`p-4 cursor-pointer transition-all hover:bg-muted/20 ${
                    selectedService === destination.minivan.id
                      ? 'bg-primary/5 border-l-4 border-l-primary'
                      : ''
                  }`}
                  onClick={() => setSelectedService(destination.minivan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bus className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold text-foreground">MINIVAN</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-2xl font-bold text-primary">{destination.minivan.price} €</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{destination.minivan.passengers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Luggage className="h-4 w-4" />
                          <span>{destination.minivan.luggage}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Pricing Rules */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm max-w-4xl mx-auto mb-12">
          <div className="bg-muted/40 px-6 py-4 text-center border-b border-border">
            <div className="flex justify-center mb-2">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Other Destinations
            </h3>
            <p className="text-sm text-muted-foreground">
              Per-kilometer pricing for all other routes
            </p>
          </div>
          
          <div className="p-0">
            {/* Sedan Option */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-foreground">SEDAN</h4>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-2xl font-bold text-primary">5€/km</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>1-4</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Luggage className="h-4 w-4" />
                      <span>up to 4</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Minimum order: 50€
              </div>
            </div>

            {/* Minivan Option */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bus className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-foreground">MINIVAN</h4>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-2xl font-bold text-primary">8€/km</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>5-8</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Luggage className="h-4 w-4" />
                      <span>up to 8</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Minimum order: 80€
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center">
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