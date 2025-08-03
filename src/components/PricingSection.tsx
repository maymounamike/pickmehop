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

        {/* Destination Service Boxes */}
        <div className="mb-10">
          <RadioGroup 
            value={selectedService} 
            onValueChange={setSelectedService}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {destinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden">
                <CardHeader className="text-center pb-4 bg-muted/30">
                  {/* Destination Icon and Info */}
                  <div className="w-10 h-10 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                    <destination.destinationIcon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {destination.destination}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">
                    {destination.destinationCode}
                  </p>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  {/* Sedan Option */}
                  <div className="relative">
                    <RadioGroupItem 
                      value={destination.sedan.id} 
                      id={destination.sedan.id}
                      className="peer sr-only"
                    />
                    <Label 
                      htmlFor={destination.sedan.id}
                      className="flex cursor-pointer"
                    >
                      <div className={[
                        "w-full p-4 rounded-lg border-2 transition-all duration-300",
                        "peer-checked:border-primary peer-checked:bg-primary/5",
                        "hover:bg-muted/50"
                      ].join(" ")}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-foreground">Sedan</span>
                          </div>
                          <div className="text-xl font-bold text-green-600">
                            €{destination.sedan.price}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{destination.sedan.passengers} passengers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Luggage className="w-3 h-3" />
                            <span>{destination.sedan.luggage} pieces</span>
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* Minivan Option */}
                  <div className="relative">
                    <RadioGroupItem 
                      value={destination.minivan.id} 
                      id={destination.minivan.id}
                      className="peer sr-only"
                    />
                    <Label 
                      htmlFor={destination.minivan.id}
                      className="flex cursor-pointer"
                    >
                      <div className={[
                        "w-full p-4 rounded-lg border-2 transition-all duration-300",
                        "peer-checked:border-primary peer-checked:bg-primary/5",
                        "hover:bg-muted/50"
                      ].join(" ")}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-foreground">Minivan</span>
                          </div>
                          <div className="text-xl font-bold text-green-600">
                            €{destination.minivan.price}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{destination.minivan.passengers} passengers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Luggage className="w-3 h-3" />
                            <span>{destination.minivan.luggage} pieces</span>
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* Price Difference */}
                  <div className="text-center pt-2 border-t border-muted">
                    <p className="text-sm text-muted-foreground">
                      Price Difference: <span className="font-semibold text-foreground">€{destination.priceDifference}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </RadioGroup>
        </div>

        {/* Selected Service Summary and Book Now Button */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm border-2 border-primary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Selected Service
            </h3>
            {(() => {
              const selected = getSelectedServiceDetails();
              return selected ? (
                <div className="mb-4">
                  <p className="text-base text-muted-foreground">
                    {selected.destination} - {selected.vehicle}
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    €{selected.price}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selected.passengers} passengers • {selected.luggage} luggage pieces
                  </p>
                </div>
              ) : null;
            })()}
            
            <Button 
              onClick={handleBookNow}
              className="w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold"
              size="lg"
            >
              Book Now - €{getSelectedServiceDetails()?.price}
            </Button>
          </div>
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