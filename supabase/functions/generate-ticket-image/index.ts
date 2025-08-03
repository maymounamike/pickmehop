import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TicketData {
  bookingReference: string;
  orderId: string;
  customerName: string;
  fromLocation: string;
  toLocation: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleType: string;
  totalPrice: number;
  paymentMethod: string;
  driverName?: string;
  driverPhone?: string;
}

function getAirportCode(location: string): string {
  const locationLower = location.toLowerCase();
  if (locationLower.includes('charles de gaulle') || locationLower.includes('cdg')) return 'CDG';
  if (locationLower.includes('orly') || locationLower.includes('ory')) return 'ORY';
  if (locationLower.includes('beauvais') || locationLower.includes('bva')) return 'BVA';
  if (locationLower.includes('disneyland') || locationLower.includes('disney')) return 'DIS';
  return 'PAR';
}

function generateTicketSVG(data: TicketData): string {
  const fromCode = getAirportCode(data.fromLocation);
  const toCode = getAirportCode(data.toLocation);

  return `
    <svg width="800" height="300" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#0D2C54;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a3a6b;stop-opacity:1" />
        </linearGradient>
        <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
          <circle cx="10" cy="10" r="2" fill="white" opacity="0.05"/>
        </pattern>
      </defs>
      
      <!-- Background -->
      <rect width="800" height="300" rx="12" fill="url(#bgGradient)"/>
      <rect width="800" height="300" rx="12" fill="url(#dots)"/>
      
      <!-- Decorative corners -->
      <circle cx="0" cy="0" r="8" fill="white"/>
      <circle cx="800" cy="0" r="8" fill="white"/>
      <circle cx="0" cy="300" r="8" fill="white"/>
      <circle cx="800" cy="300" r="8" fill="white"/>
      
      <!-- Header -->
      <text x="30" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFB400">PICK ME HOP</text>
      <text x="30" y="60" font-family="Arial, sans-serif" font-size="10" fill="#d1d5db">BILLET POUR PARIS / TICKET TO PARIS</text>
      <text x="650" y="35" font-family="Arial, sans-serif" font-size="10" fill="white">PASSAGER/PASSENGER</text>
      
      <!-- Airport Codes -->
      <text x="120" y="120" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="#FFB400" text-anchor="middle">${fromCode}</text>
      <text x="120" y="140" font-family="Arial, sans-serif" font-size="10" fill="#d1d5db" text-anchor="middle">FROM</text>
      
      <!-- Flight path -->
      <rect x="200" y="95" width="24" height="24" rx="4" fill="none" stroke="#FFB400" stroke-width="2"/>
      <text x="212" y="110" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#FFB400" text-anchor="middle">✓</text>
      
      <text x="260" y="110" font-family="Arial, sans-serif" font-size="20" fill="#FFB400" text-anchor="middle">✈</text>
      
      <rect x="300" y="95" width="24" height="24" rx="4" fill="none" stroke="#FFB400" stroke-width="2"/>
      <text x="312" y="110" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#FFB400" text-anchor="middle">✓</text>
      
      <text x="400" y="120" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="#FFB400" text-anchor="middle">${toCode}</text>
      <text x="400" y="140" font-family="Arial, sans-serif" font-size="10" fill="#d1d5db" text-anchor="middle">TO</text>
      
      <!-- Customer Details -->
      <text x="30" y="180" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">CUSTOMER NAME</text>
      <text x="30" y="195" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="white">${data.customerName}</text>
      
      <text x="250" y="180" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">PASSENGERS</text>
      <text x="250" y="195" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="white">${data.passengers} PAX</text>
      
      <text x="30" y="220" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">VEHICLE TYPE</text>
      <text x="30" y="235" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="white">${data.vehicleType}</text>
      
      <text x="250" y="220" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">TOTAL PRICE</text>
      <text x="250" y="235" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#FFB400">€${data.totalPrice}</text>
      
      <!-- Dashed separator -->
      <line x1="520" y1="30" x2="520" y2="270" stroke="#6b7280" stroke-width="1" stroke-dasharray="5,5"/>
      
      <!-- Right section -->
      <text x="540" y="50" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">DATE D'ARRIVÉE/DATE OF ARRIVAL</text>
      <text x="540" y="70" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="white">${data.pickupDate}</text>
      
      <text x="540" y="95" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">HEURE DE DÉPART</text>
      <text x="540" y="115" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="white">${data.pickupTime}</text>
      
      <!-- Booking reference box -->
      <rect x="540" y="130" width="220" height="50" rx="6" fill="rgba(0,0,0,0.3)"/>
      <text x="550" y="145" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">BON N°</text>
      <text x="550" y="160" font-family="monospace" font-size="12" font-weight="bold" fill="#FFB400">${data.bookingReference}</text>
      <text x="550" y="175" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">ORDER ID: ${data.orderId}</text>
      
      <!-- Company info -->
      <text x="540" y="200" font-family="Arial, sans-serif" font-size="10" fill="#d1d5db">10 RUE DE RICHEMONT, 75013 PARIS</text>
      <text x="540" y="215" font-family="Arial, sans-serif" font-size="10" fill="#d1d5db">📞 09 49 325 039</text>
      <text x="540" y="230" font-family="Arial, sans-serif" font-size="10" fill="#d1d5db">EMERGENCY: 00012</text>
      <text x="540" y="245" font-family="Arial, sans-serif" font-size="10" fill="#d1d5db">SIRET: 949 325 039 00012</text>
      
      <!-- Thank you -->
      <text x="650" y="275" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="#FFB400" text-anchor="middle">Merci / Thank You</text>
      
      <!-- Barcode -->
      <text x="30" y="275" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">BOARDING PASS</text>
      <g transform="translate(30, 285)">
        ${Array.from({ length: 30 }, (_, i) => 
          `<rect x="${i * 3}" y="0" width="1" height="${Math.random() * 8 + 6}" fill="white"/>`
        ).join('')}
      </g>
    </svg>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ticketData: TicketData = await req.json();

    // Generate SVG
    const svgContent = generateTicketSVG(ticketData);

    // Convert SVG to PNG using a simple data URL approach for demonstration
    // In production, you might want to use a proper image conversion service
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;

    return new Response(JSON.stringify({ 
      svg: svgContent,
      dataUrl: svgDataUrl,
      success: true 
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error('Error generating ticket:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 500,
    });
  }
});