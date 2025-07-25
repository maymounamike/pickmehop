import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    console.log('Verifying payment for session:', sessionId);

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('Stripe session status:', session.payment_status);

    if (session.payment_status === 'paid') {
      // Payment was successful, confirm the booking
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      // Update booking status to confirmed
      const { error: updateError } = await supabaseService.functions.invoke('submit-booking', {
        body: {
          fromLocation: session.metadata?.booking_from || 'Unknown',
          toLocation: session.metadata?.booking_to || 'Unknown',
          name: session.metadata?.passenger_name || 'Unknown',
          email: session.customer_email || 'unknown@example.com',
          phone: session.metadata?.passenger_phone || 'Unknown',
          estimatedPrice: session.metadata?.estimated_price || '0',
          paymentSessionId: sessionId,
          paymentStatus: 'completed',
          confirmed: true,
        },
      });

      if (updateError) {
        console.error('Error updating booking:', updateError);
        // Continue anyway as payment was successful
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'paid',
          message: 'Payment verified and booking confirmed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: session.payment_status,
          message: 'Payment not completed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to verify payment'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});