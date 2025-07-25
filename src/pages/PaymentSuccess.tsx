import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerificationStatus('error');
        setIsVerifying(false);
        return;
      }

      try {
        // Verify payment with backend
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (error) {
          console.error('Payment verification error:', error);
          setVerificationStatus('error');
        } else {
          setVerificationStatus('success');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setVerificationStatus('error');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {isVerifying ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Verifying Payment...
              </>
            ) : verificationStatus === 'success' ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                Payment Successful!
              </>
            ) : (
              <>
                <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
                Payment Verification Failed
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isVerifying ? (
            <p className="text-muted-foreground">
              Please wait while we verify your payment...
            </p>
          ) : verificationStatus === 'success' ? (
            <>
              <p className="text-muted-foreground">
                Your booking has been confirmed and payment has been processed successfully. 
                We'll contact you shortly with the ride details.
              </p>
              <div className="pt-4">
                <Link to="/">
                  <Button className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                There was an issue verifying your payment. Please contact support if you believe this is an error.
              </p>
              <div className="pt-4 space-y-2">
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;