import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticator } from "https://deno.land/x/otpauth@v9.2.2/dist/otpauth.esm.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TwoFactorRequest {
  action: 'setup' | 'verify' | 'disable';
  token?: string;
  backupCode?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roleData || roleData.length === 0) {
      throw new Error('Admin access required');
    }

    const { action, token, backupCode }: TwoFactorRequest = await req.json();

    switch (action) {
      case 'setup': {
        // Generate secret for TOTP
        const secret = authenticator.generateSecret();
        const serviceName = 'Pick Me Hop';
        const accountName = user.email || user.id;
        
        // Generate QR code URI
        const otpAuthUri = authenticator.keyuri(accountName, serviceName, secret);
        
        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () => 
          Math.random().toString(36).substr(2, 8).toUpperCase()
        );

        // Save to database (disabled until verified)
        const serviceRoleClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { error: insertError } = await serviceRoleClient
          .from('admin_2fa')
          .upsert({
            user_id: user.id,
            secret: secret,
            backup_codes: backupCodes,
            enabled: false
          });

        if (insertError) {
          console.error('2FA setup error:', insertError);
          throw new Error('Failed to setup 2FA');
        }

        return new Response(
          JSON.stringify({
            success: true,
            qrCodeUri: otpAuthUri,
            backupCodes: backupCodes,
            message: 'Scan QR code with your authenticator app, then verify with a token'
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      case 'verify': {
        if (!token) {
          throw new Error('Token required for verification');
        }

        // Get user's 2FA settings
        const serviceRoleClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: twoFactorData, error: fetchError } = await serviceRoleClient
          .from('admin_2fa')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError || !twoFactorData) {
          throw new Error('2FA setup not found');
        }

        let isValidToken = false;

        // Check TOTP token
        try {
          isValidToken = authenticator.verify({
            token: token,
            secret: twoFactorData.secret
          });
        } catch (error) {
          console.error('TOTP verification error:', error);
        }

        // If TOTP fails, check backup codes
        if (!isValidToken && twoFactorData.backup_codes?.includes(token.toUpperCase())) {
          isValidToken = true;
          
          // Remove used backup code
          const updatedBackupCodes = twoFactorData.backup_codes.filter(
            (code: string) => code !== token.toUpperCase()
          );
          
          await serviceRoleClient
            .from('admin_2fa')
            .update({ backup_codes: updatedBackupCodes })
            .eq('user_id', user.id);
        }

        if (!isValidToken) {
          throw new Error('Invalid token or backup code');
        }

        // Enable 2FA if not already enabled
        if (!twoFactorData.enabled) {
          await serviceRoleClient
            .from('admin_2fa')
            .update({ 
              enabled: true,
              last_used: new Date().toISOString()
            })
            .eq('user_id', user.id);
        } else {
          await serviceRoleClient
            .from('admin_2fa')
            .update({ last_used: new Date().toISOString() })
            .eq('user_id', user.id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: twoFactorData.enabled ? '2FA verified successfully' : '2FA enabled successfully'
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      case 'disable': {
        // Verify current token before disabling
        if (!token) {
          throw new Error('Token required to disable 2FA');
        }

        const serviceRoleClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: twoFactorData, error: fetchError } = await serviceRoleClient
          .from('admin_2fa')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError || !twoFactorData) {
          throw new Error('2FA setup not found');
        }

        // Verify token before disabling
        let isValidToken = false;
        try {
          isValidToken = authenticator.verify({
            token: token,
            secret: twoFactorData.secret
          });
        } catch (error) {
          console.error('TOTP verification error:', error);
        }

        if (!isValidToken && !twoFactorData.backup_codes?.includes(token.toUpperCase())) {
          throw new Error('Invalid token - cannot disable 2FA');
        }

        // Delete 2FA settings
        await serviceRoleClient
          .from('admin_2fa')
          .delete()
          .eq('user_id', user.id);

        return new Response(
          JSON.stringify({
            success: true,
            message: '2FA disabled successfully'
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error: any) {
    console.error('Error in admin-2fa function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);