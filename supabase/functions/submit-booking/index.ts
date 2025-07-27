import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security validation functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .trim()
    .substring(0, 255) // Align with database schema limits
}

// Enhanced CSRF token validation
function validateCSRFToken(token: string): boolean {
  if (!token) return false;
  const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return tokenPattern.test(token);
}

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const limit = rateLimitStore.get(clientId)
  
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return true
  }
  
  if (limit.count >= 5) { // Max 5 requests per minute
    return false
  }
  
  limit.count++
  return true
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Booking submission started')
    
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.log('Rate limit exceeded for IP:', clientIP)
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestData = await req.json()
    console.log('Request data received')

    // Validate required fields
    const requiredFields = ['fromLocation', 'toLocation', 'time', 'passengers', 'luggage', 'name', 'email', 'phone']
    for (const field of requiredFields) {
      if (!requestData[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // CSRF token validation for enhanced security
    if (requestData.csrfToken && !validateCSRFToken(requestData.csrfToken)) {
      console.log('Invalid CSRF token provided')
      return new Response(
        JSON.stringify({ error: 'Invalid security token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Honeypot check - if honeypot field is filled, it's likely a bot
    if (requestData.honeypot) {
      console.log('Honeypot triggered - potential bot submission')
      return new Response(
        JSON.stringify({ error: 'Invalid submission' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate and sanitize inputs
    const sanitizedData = {
      fromLocation: sanitizeString(requestData.fromLocation),
      toLocation: sanitizeString(requestData.toLocation),
      date: requestData.date, // Date validation handled by frontend
      time: sanitizeString(requestData.time),
      passengers: parseInt(requestData.passengers),
      luggage: parseInt(requestData.luggage),
      name: sanitizeString(requestData.name),
      email: sanitizeString(requestData.email),
      phone: sanitizeString(requestData.phone),
      specialRequests: requestData.specialRequests ? sanitizeString(requestData.specialRequests) : '',
      estimatedPrice: requestData.estimatedPrice || '0',
      paymentMethod: requestData.paymentMethod || 'cash',
      flightNumber: requestData.flightNumber ? sanitizeString(requestData.flightNumber) : ''
    }

    // Validate email format
    if (!validateEmail(sanitizedData.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate phone format
    if (!validatePhone(sanitizedData.phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate numeric ranges
    if (sanitizedData.passengers < 1 || sanitizedData.passengers > 8) {
      return new Response(
        JSON.stringify({ error: 'Passengers must be between 1 and 8' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (sanitizedData.luggage < 0 || sanitizedData.luggage > 10) {
      return new Response(
        JSON.stringify({ error: 'Luggage must be between 0 and 10' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create booking ID with PMH prefix and 4 digits
    const bookingId = `PMH${Math.floor(1000 + Math.random() * 9000)}`;
    console.log('Booking data validated and sanitized:', sanitizedData)
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract user ID from authorization header if present
    let userId = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = user?.id || null;
      } catch (error) {
        console.log('No valid user token found, proceeding as guest booking');
      }
    }

    // Save booking to database
    try {
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          booking_id: bookingId,
          from_location: sanitizedData.fromLocation,
          to_location: sanitizedData.toLocation,
          date: sanitizedData.date,
          time: sanitizedData.time,
          passengers: sanitizedData.passengers,
          estimated_price: sanitizedData.estimatedPrice,
          customer_name: sanitizedData.name,
          customer_email: sanitizedData.email,
          customer_phone: sanitizedData.phone,
          status: 'confirmed',
          payment_status: sanitizedData.paymentMethod === 'card_online' ? 'pending' : 'paid'
        });

      if (bookingError) {
        console.error('Error saving booking to database:', bookingError);
        // Continue anyway as we still want to send confirmations
      } else {
        console.log('Booking saved to database successfully');
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Continue anyway
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Send confirmation emails
    try {
      // Parse special requests to extract individual fields
      const specialRequests = sanitizedData.specialRequests || '';
      
      // Extract child seat information
      let childSeat = false;
      let infantCarrierQty = 0;
      let childSeatQty = 0;
      let boosterQty = 0;
      let wheelchairAccess = false;
      let notesToDriver = false;
      let driverNotes = '';

      if (specialRequests) {
        // Check for child seats
        if (specialRequests.includes('Child seats:')) {
          childSeat = true;
          const childSeatMatch = specialRequests.match(/(\d+) Infant carrier\(s\)/);
          if (childSeatMatch) infantCarrierQty = parseInt(childSeatMatch[1]);
          
          const childSeatQtyMatch = specialRequests.match(/(\d+) Child seat\(s\)/);
          if (childSeatQtyMatch) childSeatQty = parseInt(childSeatQtyMatch[1]);
          
          const boosterMatch = specialRequests.match(/(\d+) Booster\(s\)/);
          if (boosterMatch) boosterQty = parseInt(boosterMatch[1]);
        }
        
        // Check for wheelchair access
        wheelchairAccess = specialRequests.includes('Wheelchair access required');
        
        // Extract driver notes
        const notesMatch = specialRequests.match(/Notes: (.+?)(?:;|$)/);
        if (notesMatch) {
          notesToDriver = true;
          driverNotes = notesMatch[1].trim();
        }
      }

      const { error: emailError } = await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          customerEmail: sanitizedData.email,
          customerName: sanitizedData.name,
          fromLocation: sanitizedData.fromLocation,
          toLocation: sanitizedData.toLocation,
          date: sanitizedData.date,
          time: sanitizedData.time,
          passengers: sanitizedData.passengers,
          luggage: sanitizedData.luggage,
          estimatedPrice: sanitizedData.estimatedPrice,
          paymentMethod: sanitizedData.paymentMethod,
          bookingId: bookingId,
          phone: sanitizedData.phone,
          flightNumber: sanitizedData.flightNumber,
          childSeat,
          infantCarrierQty,
          childSeatQty,
          boosterQty,
          wheelchairAccess,
          notesToDriver,
          driverNotes,
        },
      });

      if (emailError) {
        console.error('Error sending confirmation emails:', emailError);
        // Continue anyway as booking was successful
      } else {
        console.log('Confirmation emails sent successfully');
      }
    } catch (error) {
      console.error('Error invoking email function:', error);
      // Continue anyway as booking was successful
    }

    console.log('Booking submission completed successfully')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Booking submitted successfully',
        bookingId: bookingId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in booking submission:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})