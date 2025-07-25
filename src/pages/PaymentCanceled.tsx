import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Home } from "lucide-react";

const PaymentCanceled = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <XCircle className="h-6 w-6 text-orange-500" />
            Payment Canceled
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your payment was canceled and no charges were made. 
            Your booking was not confirmed.
          </p>
          <p className="text-sm text-muted-foreground">
            You can try booking again or choose a different payment method.
          </p>
          <div className="pt-4 space-y-2">
            <Link to="/">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Try Booking Again
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCanceled;