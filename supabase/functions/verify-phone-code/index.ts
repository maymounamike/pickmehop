import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhoneVerificationRequest {
  phone: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code }: PhoneVerificationRequest = await req.json();

    if (!phone || !code) {
      throw new Error('Phone number and verification code are required');
    }

    console.log('Verifying phone code for:', phone);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check verification code
    const { data: verification, error: verifyError } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (verifyError || !verification) {
      console.error('Verification failed:', verifyError);
      throw new Error('Invalid or expired verification code');
    }

    // Check if user exists with this phone
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();

    let userId = null;

    if (!profile) {
      // Create new user via phone
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        phone: phone,
        phone_confirm: true,
        user_metadata: { 
          phone_verified: true,
          sign_in_method: 'phone'
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Failed to create user account');
      }

      userId = authData.user.id;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          phone: phone
        });

      // Assign default user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'user'
        });

      if (profileError || roleError) {
        console.error('Profile/Role creation error:', profileError || roleError);
      }
    } else {
      userId = profile.id;
    }

    // Clean up verification code
    await supabase
      .from('phone_verifications')
      .delete()
      .eq('phone', phone);

    // Generate auth session
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      phone: phone
    });

    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Failed to create session');
    }

    console.log('Phone verification successful for user:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Phone verified successfully',
        user_id: userId,
        access_token: sessionData.properties?.access_token,
        refresh_token: sessionData.properties?.refresh_token
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
    console.error('Error in verify-phone-code function:', error);
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