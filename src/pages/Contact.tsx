import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MessageCircle, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Get in touch with our friendly team for any questions or support
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
                
                <div className="space-y-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Mail className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold">Email Support</h3>
                          <p className="text-muted-foreground">contact@pickmehop.com</p>
                          <p className="text-sm text-muted-foreground">Response within 2 hours</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <MessageCircle className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold">WhatsApp</h3>
                          <p className="text-muted-foreground">+33 6 12 34 56 78</p>
                          <p className="text-sm text-muted-foreground">Instant messaging support</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Phone className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold">Emergency Hotline</h3>
                          <p className="text-muted-foreground">+33 1 23 45 67 89</p>
                          <p className="text-sm text-muted-foreground">For urgent assistance during your trip</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Clock className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold">Operating Hours</h3>
                          <p className="text-muted-foreground">24/7 Service Available</p>
                          <p className="text-sm text-muted-foreground">Customer support: Mon-Sun 6:00 AM - 11:00 PM</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Need Immediate Help?</h3>
                  <p className="text-muted-foreground mb-4">
                    If you're currently traveling or have an urgent booking issue, use our AI assistant in the Help section for instant support.
                  </p>
                  <Button variant="outline" className="w-full">
                    Open AI Assistant
                  </Button>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help you?" />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Tell us about your inquiry or feedback..."
                        className="min-h-[120px]"
                      />
                    </div>
                    
                    <Button className="w-full">Send Message</Button>
                    
                    <p className="text-sm text-muted-foreground text-center">
                      We'll get back to you within 2 hours during business hours.
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

export default Contact;