import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhoneVerificationRequest {
  phone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone }: PhoneVerificationRequest = await req.json();

    if (!phone) {
      throw new Error('Phone number is required');
    }

    console.log('Sending SMS verification to:', phone);

    // Initialize Twilio client
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error('Twilio credentials not configured');
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code in Supabase (temporary table)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabase
      .from('phone_verifications')
      .upsert({
        phone: phone,
        code: verificationCode,
        expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        created_at: new Date()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue with SMS even if DB fails
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = btoa(`${accountSid}:${authToken}`);

    const smsBody = new URLSearchParams({
      To: phone,
      From: twilioPhone,
      Body: `Your Pick Me Hop verification code is: ${verificationCode}. Valid for 5 minutes.`
    });

    const smsResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: smsBody
    });

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error('Twilio error:', errorText);
      throw new Error('Failed to send SMS verification');
    }

    const smsResult = await smsResponse.json();
    console.log('SMS sent successfully:', smsResult.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent',
        messageSid: smsResult.sid 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in send-phone-verification function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);