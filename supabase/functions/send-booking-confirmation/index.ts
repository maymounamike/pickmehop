import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Twilio configuration
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

// Function to send SMS using Twilio
const sendSMS = async (to: string, message: string) => {
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE_NUMBER!,
        To: to,
        Body: message,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio SMS failed: ${error}`);
  }

  return await response.json();
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  customerEmail: string;
  customerName: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  estimatedPrice: string;
  paymentMethod: string;
  bookingId: string;
  phone?: string;
  flightNumber?: string;
}

const generateCustomerEmailHTML = (booking: BookingConfirmationRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmation - PickMeHop</h1>
    </div>
    <div class="content">
      <h2>Dear ${booking.customerName},</h2>
      <p>Thank you for choosing PickMeHop! Your booking has been confirmed.</p>
      
      <div class="booking-details">
        <h3>Booking Details:</h3>
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
        <p><strong>From:</strong> ${booking.fromLocation}</p>
        <p><strong>To:</strong> ${booking.toLocation}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Passengers:</strong> ${booking.passengers}</p>
        <p><strong>Luggage:</strong> ${booking.luggage}</p>
        <p><strong>Estimated Price:</strong> €${booking.estimatedPrice}</p>
        <p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
        ${booking.flightNumber ? `<p><strong>Flight Number:</strong> ${booking.flightNumber}</p>` : ''}
      </div>
      
      <p>Our driver will contact you shortly to confirm the pickup details.</p>
      <p>If you have any questions, please contact us at support@pickmehop.com or via WhatsApp at +33 6 66 35 71 39.</p>
    </div>
    <div class="footer">
      <p>Thank you for choosing PickMeHop!</p>
      <p>www.pickmehop.com</p>
    </div>
  </div>
</body>
</html>
`;

const generateBusinessEmailHTML = (booking: BookingConfirmationRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Booking Received - PickMeHop</h1>
    </div>
    <div class="content">
      <h2>New Booking Alert</h2>
      <p>A new booking has been confirmed and requires your attention.</p>
      
      <div class="booking-details">
        <h3>Customer Information:</h3>
        <p><strong>Name:</strong> ${booking.customerName}</p>
        <p><strong>Email:</strong> ${booking.customerEmail}</p>
        ${booking.phone ? `<p><strong>Phone:</strong> ${booking.phone}</p>` : ''}
        
        <h3>Booking Details:</h3>
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
        <p><strong>From:</strong> ${booking.fromLocation}</p>
        <p><strong>To:</strong> ${booking.toLocation}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Passengers:</strong> ${booking.passengers}</p>
        <p><strong>Luggage:</strong> ${booking.luggage}</p>
        <p><strong>Estimated Price:</strong> €${booking.estimatedPrice}</p>
        <p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
        ${booking.flightNumber ? `<p><strong>Flight Number:</strong> ${booking.flightNumber}</p>` : ''}
      </div>
      
      <p><strong>Action Required:</strong> Please contact the customer to confirm pickup details and assign a driver.</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingConfirmationRequest = await req.json();
    console.log("Sending booking confirmation emails and SMS for:", booking.bookingId);

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "PickMeHop <support@pickmehop.com>",
      to: [booking.customerEmail],
      subject: `Booking Confirmation #${booking.bookingId} - PickMeHop`,
      html: generateCustomerEmailHTML(booking),
    });

    console.log("Customer email sent:", customerEmailResponse);

    // Send notification email to business
    const businessEmailResponse = await resend.emails.send({
      from: "PickMeHop <support@pickmehop.com>",
      to: ["noreply@pickmehop.com"],
      subject: `New Booking Alert #${booking.bookingId} - Action Required`,
      html: generateBusinessEmailHTML(booking),
    });

    console.log("Business email sent:", businessEmailResponse);

    // Send SMS confirmation to customer if phone number is provided
    let smsResponse = null;
    if (booking.phone && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      try {
        const smsMessage = `PickMeHop Booking Confirmed! 
        
Booking ID: ${booking.bookingId}
From: ${booking.fromLocation}
To: ${booking.toLocation}
Date: ${booking.date} at ${booking.time}
Passengers: ${booking.passengers}
Price: €${booking.estimatedPrice}

Our driver will contact you shortly. For questions: +33 6 66 35 71 39

Thank you for choosing PickMeHop!`;

        smsResponse = await sendSMS(booking.phone, smsMessage);
        console.log("SMS sent successfully:", smsResponse);
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
        // Don't fail the whole process if SMS fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        customerEmailId: customerEmailResponse.data?.id,
        businessEmailId: businessEmailResponse.data?.id,
        smsId: smsResponse?.sid || null
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);