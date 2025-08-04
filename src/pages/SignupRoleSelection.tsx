import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Car, Handshake, Users, CheckCircle, Clock, Shield, TrendingUp } from "lucide-react";

const SignupRoleSelection = () => {
  const navigate = useNavigate();

  const handleDriverSignup = () => {
    navigate("/signup/driver");
  };

  const handlePartnerSignup = () => {
    navigate("/signup/partner");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Join the Pick Me Hop Family
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose how you'd like to work with us and become part of our growing community
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Driver Card */}
          <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Car className="h-10 w-10 text-primary-foreground" />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Become a Driver
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Drive passengers safely to their destinations with flexible hours and competitive earnings
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-left">
                    <Clock className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Flexible schedule</span>
                  </div>
                  <div className="flex items-center text-left">
                    <TrendingUp className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Weekly payouts</span>
                  </div>
                  <div className="flex items-center text-left">
                    <Shield className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Insurance covered</span>
                  </div>
                  <div className="flex items-center text-left">
                    <Users className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">English-speaking community</span>
                  </div>
                </div>

                <Button 
                  onClick={handleDriverSignup}
                  className="w-full bg-coral hover:bg-coral/90 text-coral-foreground font-semibold py-3"
                  size="lg"
                >
                  Apply as Driver
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Partner Card */}
          <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Handshake className="h-10 w-10 text-primary-foreground" />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Become a Partner
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Partner with us as a taxi company or service provider to expand your business reach
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-left">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Bulk ride assignments</span>
                  </div>
                  <div className="flex items-center text-left">
                    <Users className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Business dashboard</span>
                  </div>
                  <div className="flex items-center text-left">
                    <Shield className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Priority support</span>
                  </div>
                  <div className="flex items-center text-left">
                    <TrendingUp className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Custom rates</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePartnerSignup}
                  className="w-full bg-coral hover:bg-coral/90 text-coral-foreground font-semibold py-3"
                  size="lg"
                >
                  Apply as Partner
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-card/50 rounded-lg px-4 py-2 mb-4">
            <Shield className="h-4 w-4 text-warning mr-2" />
            <span className="text-sm text-muted-foreground">
              All applications require admin approval before activation
            </span>
          </div>
          
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Button 
              variant="link" 
              className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
              onClick={() => navigate("/auth")}
            >
              Sign in
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupRoleSelection;