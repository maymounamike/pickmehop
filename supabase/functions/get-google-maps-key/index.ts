
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
    console.log('Getting Google Maps API key...')
    
    // Get the Google Maps API key from Supabase secrets
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    
    console.log('API key exists:', !!googleMapsApiKey)
    console.log('API key length:', googleMapsApiKey?.length || 0)
    
    if (!googleMapsApiKey) {
      console.error('Google Maps API key not found in environment')
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Basic validation of API key format
    if (!googleMapsApiKey.startsWith('AIza')) {
      console.error('Invalid API key format - should start with AIza')
      return new Response(
        JSON.stringify({ error: 'Invalid API key format' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Returning API key successfully')
    return new Response(
      JSON.stringify({ apiKey: googleMapsApiKey }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error retrieving API key:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve API key' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
