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
    .substring(0, 1000) // Limit length
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
      specialRequests: requestData.specialRequests ? sanitizeString(requestData.specialRequests) : ''
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

    // Here you would typically save to database or send to booking system
    // For now, we'll simulate processing
    console.log('Booking data validated and sanitized:', sanitizedData)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('Booking submission completed successfully')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Booking submitted successfully',
        bookingId: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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