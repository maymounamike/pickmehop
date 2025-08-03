import { Car, Users, Luggage, Plane, MapPin, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import MickeyMouseIcon from "./MickeyMouseIcon";

const PricingSection = () => {
  // Flatten all destination-vehicle combinations into individual service options
  const serviceOptions = [
    {
      id: "orly-sedan",
      destination: "Paris Orly Airport (ORY)",
      destinationCode: "ORY",
      vehicle: "Sedan",
      vehicleIcon: Car,
      destinationIcon: Plane,
      passengers: "1-4",
      luggage: "up to 4",
      price: 65
    },
    {
      id: "orly-minivan",
      destination: "Paris Orly Airport (ORY)",
      destinationCode: "ORY", 
      vehicle: "Minivan",
      vehicleIcon: Users,
      destinationIcon: Plane,
      passengers: "5-8",
      luggage: "up to 8",
      price: 90
    },
    {
      id: "cdg-sedan",
      destination: "Charles de Gaulle Airport (CDG)",
      destinationCode: "CDG",
      vehicle: "Sedan",
      vehicleIcon: Car,
      destinationIcon: Plane,
      passengers: "1-4",
      luggage: "up to 4",
      price: 75
    },
    {
      id: "cdg-minivan",
      destination: "Charles de Gaulle Airport (CDG)",
      destinationCode: "CDG",
      vehicle: "Minivan", 
      vehicleIcon: Users,
      destinationIcon: Plane,
      passengers: "5-8",
      luggage: "up to 8",
      price: 135
    },
    {
      id: "beauvais-sedan",
      destination: "Beauvais (BVA) - To/From Paris",
      destinationCode: "BVA",
      vehicle: "Sedan",
      vehicleIcon: Car,
      destinationIcon: Plane,
      passengers: "1-4",
      luggage: "up to 4",
      price: 150
    },
    {
      id: "beauvais-minivan",
      destination: "Beauvais (BVA) - To/From Paris",
      destinationCode: "BVA",
      vehicle: "Minivan",
      vehicleIcon: Users,
      destinationIcon: Plane,
      passengers: "5-8",
      luggage: "up to 8",
      price: 220
    },
    {
      id: "disney-sedan",
      destination: "Disneyland Paris (Disney) - To/From Paris",
      destinationCode: "DLP",
      vehicle: "Sedan",
      vehicleIcon: Car,
      destinationIcon: MickeyMouseIcon,
      passengers: "1-4",
      luggage: "up to 4",
      price: 80
    },
    {
      id: "disney-minivan",
      destination: "Disneyland Paris (Disney) - To/From Paris",
      destinationCode: "DLP",
      vehicle: "Minivan",
      vehicleIcon: Users,
      destinationIcon: MickeyMouseIcon,
      passengers: "5-8",
      luggage: "up to 8",
      price: 110
    }
  ];

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

        {/* Individual Service Option Boxes */}
        <div className="mb-10">
          <RadioGroup 
            value={selectedService} 
            onValueChange={setSelectedService}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {serviceOptions.map((service) => (
              <div key={service.id} className="relative">
                <RadioGroupItem 
                  value={service.id} 
                  id={service.id}
                  className="peer sr-only"
                />
                <Label 
                  htmlFor={service.id}
                  className="flex cursor-pointer"
                >
                  <Card className={[
                    "w-full transition-all duration-300 hover:shadow-lg border-2",
                    "peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-lg",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2"
                  ].join(" ")}>
                    <CardHeader className="text-center pb-3 px-4 pt-4">
                      {/* Destination Icon and Info */}
                      <div className="w-8 h-8 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                        <service.destinationIcon className="w-4 h-4 text-primary" />
                      </div>
                      <CardTitle className="text-sm font-semibold text-foreground leading-tight">
                        {service.destination}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-medium">
                        {service.destinationCode}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="px-4 pb-4">
                      {/* Vehicle Type */}
                      <div className="flex items-center justify-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
                        <service.vehicleIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {service.vehicle}
                        </span>
                      </div>

                      {/* Price Display */}
                      <div className="text-center mb-3">
                        <div className="text-2xl font-bold text-green-600">
                          €{service.price}
                        </div>
                      </div>

                      {/* Capacity Information */}
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-3 h-3" />
                          <span>{service.passengers} passengers</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Luggage className="w-3 h-3" />
                          <span>{service.luggage} pieces</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
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