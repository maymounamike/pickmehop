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
    const requestBody = await req.json();
    console.log('Create payment request:', requestBody);

    // Initialize Stripe - you'll need to set this secret in Supabase
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    // Extract booking details
    const {
      fromLocation,
      toLocation,
      name,
      email,
      phone,
      amount,
      paymentMethod,
      estimatedPrice,
    } = requestBody;

    // Create product name based on the booking
    const productName = `Ride from ${fromLocation} to ${toLocation}`;
    const finalAmount = amount || (estimatedPrice ? estimatedPrice * 100 : 5000);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethod === 'paypal' ? ['card', 'paypal'] : ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: productName,
              description: `Passenger: ${name}`,
            },
            unit_amount: finalAmount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/payment-canceled`,
      customer_email: email,
      metadata: {
        booking_from: fromLocation,
        booking_to: toLocation,
        passenger_name: name,
        passenger_phone: phone,
        estimated_price: estimatedPrice?.toString() || '50',
      },
    });

    console.log('Stripe session created:', session.id);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create payment session'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});