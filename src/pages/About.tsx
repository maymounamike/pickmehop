import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Award, Shield } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Pick Me Hop</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Your trusted partner for reliable Paris airport transfers with English-speaking drivers
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 mb-16">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    Pick Me Hop was founded with a simple mission: to provide reliable, comfortable, and stress-free airport transfers in Paris. We understand that traveling can be overwhelming, especially when navigating a foreign city.
                  </p>
                  <p className="text-lg text-muted-foreground">
                    That's why we've built a service that puts your comfort and peace of mind first, with English-speaking drivers who know Paris inside and out.
                  </p>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-6">Why Choose Us</h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    With over 846 five-star reviews, we've proven our commitment to excellence. Our drivers are carefully selected, professionally trained, and dedicated to providing exceptional service.
                  </p>
                  <p className="text-lg text-muted-foreground">
                    We offer 24/7 support, flight tracking, and transparent pricing with no hidden fees.
                  </p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">English-Speaking Drivers</h3>
                    <p className="text-muted-foreground">
                      All our drivers speak fluent English for clear communication
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                    <p className="text-muted-foreground">
                      Round-the-clock customer support for your peace of mind
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">846+ 5-Star Reviews</h3>
                    <p className="text-muted-foreground">
                      Trusted by hundreds of satisfied customers
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Safe & Reliable</h3>
                    <p className="text-muted-foreground">
                      Professional drivers with comprehensive insurance coverage
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;