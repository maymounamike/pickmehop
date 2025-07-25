import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Security headers function called')
    
    // Return comprehensive security headers
    const securityHeaders = {
      // Content Security Policy - strict but allows inline styles for UI components
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com; frame-ancestors 'none';",
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Enable XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Strict transport security (HTTPS only)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions policy
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      
      // Cache control for security
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      
      ...corsHeaders
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        headers: securityHeaders,
        message: 'Security headers configured'
      }),
      { 
        headers: { 
          ...securityHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in security headers function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to apply security headers' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})