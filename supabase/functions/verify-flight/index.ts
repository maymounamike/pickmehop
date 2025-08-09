import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { flightNumber, date } = await req.json().catch(() => ({ flightNumber: undefined, date: undefined }));

    if (!flightNumber) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Missing flightNumber' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('AVIATIONSTACK_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Flight API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const params = new URLSearchParams({
      access_key: apiKey,
      flight_iata: String(flightNumber).toUpperCase(),
    });
    if (date) params.set('flight_date', String(date));

    const url = `https://api.aviationstack.com/v1/flights?${params.toString()}`;
    const response = await fetch(url);
    const json = await response.json();

    const flight = Array.isArray(json?.data) && json.data.length > 0 ? json.data[0] : null;

    const valid = !!flight;
    const details = flight
      ? {
          flight_iata: flight.flight?.iata ?? flightNumber,
          airline: flight.airline?.name ?? flight.airline?.iata ?? null,
          status: flight.flight_status ?? null,
          departure_airport: flight.departure?.airport ?? flight.departure?.iata ?? null,
          arrival_airport: flight.arrival?.airport ?? flight.arrival?.iata ?? null,
          scheduled_departure: flight.departure?.scheduled ?? null,
        }
      : null;

    return new Response(
      JSON.stringify({ valid, details }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('verify-flight error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Failed to verify flight' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});