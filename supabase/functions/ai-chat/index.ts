import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { message, conversationHistory } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // System prompt for PickMeHop customer support
    const systemPrompt = `You are a helpful customer support assistant for PickMeHop, a premium ride-sharing service that connects customers with professional drivers. 

    Key information about PickMeHop:
    - We provide premium transportation services with professional drivers
    - Customers can book rides from airports, hotels, and other locations
    - We offer various vehicle types and can accommodate special requests like child seats and wheelchair access
    - Payment is processed securely through our platform
    - Customers receive email confirmations for their bookings
    - We have both customer and driver dashboards for managing rides

    You should help customers with:
    - Booking questions and guidance
    - Account and dashboard navigation
    - Payment and pricing inquiries
    - Special accommodation requests
    - General service information
    - Troubleshooting common issues

    Be friendly, professional, and concise. If you don't know specific details about pricing or availability, direct them to contact support or try booking through the platform.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    console.log('Sending request to Anthropic with messages:', messages.length);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.7,
        system: systemPrompt,
        messages: conversationHistory ? [...conversationHistory, { role: 'user', content: message }] : [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Anthropic response received');

    const aiResponse = data.content[0].text;

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        conversationHistory: [...messages.slice(1), { role: 'assistant', content: aiResponse }]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing your request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});