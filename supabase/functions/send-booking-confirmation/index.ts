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

// Helper function to get payment method with icon
const getPaymentMethodDisplay = (paymentMethod: string): string => {
  switch(paymentMethod?.toLowerCase()) {
    case 'cash':
      return '💵 Cash Payment';
    case 'card_onboard':
      return '💳 Card Payment (On Board)';
    case 'card_online':
      return '💳 Card Payment (Online)';
    case 'paypal':
      return '🅿️ PayPal';
    default:
      return `💳 ${paymentMethod}`;
  }
};

const generateCustomerEmailHTML = (booking: BookingConfirmationRequest) => {
  // Format date to remove the T22:00:00.000Z part
  const formattedDate = booking.date ? new Date(booking.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  }) : booking.date;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 0; background: white; }
    .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px 20px; text-align: center; }
    .logo { width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: block; border: 3px solid rgba(255,255,255,0.2); }
    .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
    .header p { margin: 5px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 30px 20px; background: #f8fafc; }
    .greeting { font-size: 18px; margin-bottom: 20px; color: #1e293b; }
    .booking-details { background: white; padding: 25px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .booking-details h3 { color: #2563eb; margin-top: 0; margin-bottom: 15px; font-size: 18px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: bold; color: #475569; }
    .detail-value { color: #1e293b; }
    .price-highlight { background: #fef3c7; padding: 10px; border-radius: 6px; margin: 15px 0; text-align: center; }
    .price-highlight .price { font-size: 24px; font-weight: bold; color: #92400e; }
    .contact-info { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
    .footer { text-align: center; padding: 30px 20px; color: #64748b; font-size: 14px; background: #f1f5f9; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://8d3b327c-3050-4151-be81-4ef802ca3a04.lovableproject.com/lovable-uploads/fd647c9d-74ed-4206-99d0-9b04a8f86b41.png" alt="PickMeHop Logo" style="width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: block; border: 3px solid rgba(255,255,255,0.2); object-fit: cover;"">
      <h1>PickMeHop</h1>
      <p>Your Booking is Confirmed!</p>
    </div>
    <div class="content">
      <div class="greeting">Dear ${booking.customerName},</div>
      <p>Thank you for choosing PickMeHop! Your booking has been confirmed and we're excited to serve you.</p>
      
      <div class="booking-details">
        <h3>🚗 Booking Details</h3>
        <div class="detail-row">
          <span class="detail-label">Booking ID:</span>
          <span class="detail-value">${booking.bookingId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">From:</span>
          <span class="detail-value">${booking.fromLocation}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">To:</span>
          <span class="detail-value">${booking.toLocation}</span>
        </div>
         <div class="detail-row">
           <span class="detail-label">Date & Time:</span>
           <span class="detail-value">${formattedDate} at ${booking.time}</span>
         </div>
        <div class="detail-row">
          <span class="detail-label">Passengers:</span>
          <span class="detail-value">${booking.passengers}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Luggage:</span>
          <span class="detail-value">${booking.luggage} pieces</span>
        </div>
         <div class="detail-row">
           <span class="detail-label">Payment Method:</span>
           <span class="detail-value">${getPaymentMethodDisplay(booking.paymentMethod)}</span>
         </div>
        ${booking.flightNumber ? `<div class="detail-row"><span class="detail-label">Flight Number:</span><span class="detail-value">${booking.flightNumber}</span></div>` : ''}
        
        <div class="price-highlight">
          <div>Total Price</div>
          <div class="price">€${booking.estimatedPrice}</div>
        </div>
      </div>
      
      <div class="contact-info">
        <p><strong>📞 What's Next?</strong></p>
        <p>Our driver will contact you shortly to confirm the pickup details. Please keep your phone nearby!</p>
        <p>For immediate assistance, contact us:</p>
        <p>📧 Email: support@pickmehop.com<br>
        📱 WhatsApp: +33 6 66 35 71 39</p>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for choosing PickMeHop!</p>
      <p><a href="https://www.pickmehop.com">www.pickmehop.com</a></p>
      <p>Safe travels! 🚗✨</p>
    </div>
  </div>
 </body>
 </html>
 `;
}

const generateBusinessEmailHTML = (booking: BookingConfirmationRequest) => {
  // Format date to remove the T22:00:00.000Z part
  const formattedDate = booking.date ? new Date(booking.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  }) : booking.date;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 0; background: white; }
    .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px 20px; text-align: center; }
    .logo { width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 15px; display: block; border: 2px solid rgba(255,255,255,0.3); }
    .header h1 { margin: 0; font-size: 22px; font-weight: bold; }
    .content { padding: 30px 20px; background: #f8fafc; }
    .alert-badge { background: #fef2f2; color: #dc2626; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin-bottom: 20px; border: 1px solid #fecaca; }
    .booking-details { background: white; padding: 25px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .booking-details h3 { color: #dc2626; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #fee2e2; padding-bottom: 10px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: bold; color: #475569; }
    .detail-value { color: #1e293b; }
    .action-required { background: #fef3c7; border: 1px solid #fbbf24; color: #92400e; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .action-required strong { color: #b45309; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://8d3b327c-3050-4151-be81-4ef802ca3a04.lovableproject.com/lovable-uploads/fd647c9d-74ed-4206-99d0-9b04a8f86b41.png" alt="PickMeHop Logo" style="width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 15px; display: block; border: 2px solid rgba(255,255,255,0.3); object-fit: cover;">
      <h1>New Booking Alert - PickMeHop</h1>
    </div>
    <div class="content">
      <div class="alert-badge">🚨 NEW BOOKING</div>
      <p>A new booking has been confirmed and requires your immediate attention.</p>
      
      <div class="booking-details">
        <h3>👤 Customer Information</h3>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${booking.customerName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${booking.customerEmail}</span>
        </div>
        ${booking.phone ? `<div class="detail-row"><span class="detail-label">Phone:</span><span class="detail-value">${booking.phone}</span></div>` : ''}
      </div>
      
      <div class="booking-details">
        <h3>🚗 Booking Information</h3>
        <div class="detail-row">
          <span class="detail-label">Booking ID:</span>
          <span class="detail-value">${booking.bookingId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">From:</span>
          <span class="detail-value">${booking.fromLocation}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">To:</span>
          <span class="detail-value">${booking.toLocation}</span>
        </div>
         <div class="detail-row">
           <span class="detail-label">Date & Time:</span>
           <span class="detail-value">${formattedDate} at ${booking.time}</span>
         </div>
        <div class="detail-row">
          <span class="detail-label">Passengers:</span>
          <span class="detail-value">${booking.passengers}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Luggage:</span>
          <span class="detail-value">${booking.luggage} pieces</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estimated Price:</span>
          <span class="detail-value">€${booking.estimatedPrice}</span>
        </div>
         <div class="detail-row">
           <span class="detail-label">Payment Method:</span>
           <span class="detail-value">${getPaymentMethodDisplay(booking.paymentMethod)}</span>
         </div>
        ${booking.flightNumber ? `<div class="detail-row"><span class="detail-label">Flight Number:</span><span class="detail-value">${booking.flightNumber}</span></div>` : ''}
      </div>
      
      <div class="action-required">
        <strong>⚡ Action Required:</strong> Please contact the customer immediately to confirm pickup details and assign a driver for this booking.
      </div>
    </div>
  </div>
 </body>
 </html>
 `;
}

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
        // Format date for SMS
        const formattedDate = booking.date ? new Date(booking.date).toLocaleDateString('en-GB') : booking.date;
        
        const smsMessage = `PickMeHop Booking Confirmed! 
        
Booking ID: ${booking.bookingId}
From: ${booking.fromLocation}
To: ${booking.toLocation}
Date: ${formattedDate} at ${booking.time}
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