import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Users, Clock, MapPin, Shield, Star } from "lucide-react";

const Services = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Professional airport transfers and transportation services in Paris
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <Card>
                <CardHeader>
                  <Plane className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Airport Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Reliable transfers to and from Charles de Gaulle (CDG), Orly (ORY), and Beauvais airports with flight tracking and meet & greet service.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Group Transportation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Comfortable vehicles for families and groups up to 8 passengers with ample luggage space for your convenience.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>24/7 Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Round-the-clock service for early morning flights and late-night arrivals with advance booking available.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <MapPin className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>City Tours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Customized Paris city tours with English-speaking drivers who know all the best spots and hidden gems.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Corporate Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Professional transportation for business travelers with executive vehicles and priority booking.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Star className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Premium Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Luxury vehicles, complimentary WiFi, water bottles, and personalized service for a premium travel experience.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Booking Section */}
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Book Your Transfer</h2>
                <p className="text-lg text-muted-foreground">
                  Ready to experience our premium service? Book your airport transfer now with our easy online booking system.
                </p>
              </div>
              <BookingForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;