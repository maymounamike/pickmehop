import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const BookingConfirmation = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex flex-col">
      {/* Header with back button and logo */}
      <div className="flex items-center justify-between p-6">
        <Button 
          variant="outline" 
          onClick={handleBackToHome}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">🚗</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">PickMeHop</h1>
        </div>
        
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Large green checkmark */}
        <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mb-8 animate-scale-in">
          <Check className="w-16 h-16 text-white stroke-[3]" />
        </div>

        {/* Confirmation message */}
        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Thank You for your booking!
          </h2>
          <p className="text-lg text-muted-foreground">
            You will receive a confirmation E-mail soon
          </p>
        </div>
      </div>

      {/* Footer spacer */}
      <div className="h-20"></div>
    </div>
  );
};

export default BookingConfirmation;