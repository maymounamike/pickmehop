// Ticket Image Generator Utility
// This utility helps convert the React ticket component to an image for email use

import { TicketData } from '../components/TicketDesign';

/**
 * Generates ticket HTML that can be rendered as an image
 */
export const generateTicketHTML = (data: TicketData): string => {
  const getAirportCode = (location: string) => {
    const locationLower = location.toLowerCase();
    if (locationLower.includes('charles de gaulle') || locationLower.includes('cdg')) return 'CDG';
    if (locationLower.includes('orly') || locationLower.includes('ory')) return 'ORY';
    if (locationLower.includes('beauvais') || locationLower.includes('bva')) return 'BVA';
    if (locationLower.includes('disneyland') || locationLower.includes('disney')) return 'DIS';
    return 'PAR';
  };

  const fromCode = getAirportCode(data.fromLocation);
  const toCode = getAirportCode(data.toLocation);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          background: #f0f0f0;
          padding: 20px;
        }
        
        .ticket-container {
          width: 800px;
          height: 300px;
          background: linear-gradient(135deg, #0D2C54 0%, #0D2C54 50%, #1a3a6b 100%);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          margin: 0 auto;
        }
        
        .background-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E");
          background-repeat: repeat;
        }
        
        .ticket-content {
          position: relative;
          z-index: 10;
          display: flex;
          height: 100%;
          color: white;
        }
        
        .left-section {
          flex: 1;
          padding: 24px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #FFB400;
        }
        
        .subtitle {
          font-size: 10px;
          color: #d1d5db;
          margin-top: 4px;
        }
        
        .passenger-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
        }
        
        .airport-section {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 24px 0;
          gap: 32px;
        }
        
        .airport-code {
          text-align: center;
        }
        
        .airport-code .code {
          font-size: 30px;
          font-weight: bold;
          color: #FFB400;
        }
        
        .airport-code .label {
          font-size: 10px;
          color: #d1d5db;
          margin-top: 4px;
        }
        
        .flight-path {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkbox {
          width: 32px;
          height: 32px;
          border: 2px solid #FFB400;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: #FFB400;
        }
        
        .plane-icon {
          width: 24px;
          height: 24px;
          color: #FFB400;
          transform: rotate(90deg);
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          font-size: 10px;
        }
        
        .detail-item .label {
          color: #9ca3af;
          margin-bottom: 4px;
        }
        
        .detail-item .value {
          font-weight: 600;
          font-size: 12px;
        }
        
        .price {
          color: #FFB400 !important;
        }
        
        .separator {
          width: 1px;
          background: linear-gradient(to bottom, transparent, #6b7280, transparent);
          position: relative;
        }
        
        .separator::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 8px,
            #9ca3af 8px,
            #9ca3af 16px
          );
        }
        
        .right-section {
          width: 256px;
          padding: 24px;
        }
        
        .datetime-section {
          margin-bottom: 16px;
        }
        
        .datetime-item {
          margin-bottom: 12px;
        }
        
        .datetime-item .label {
          color: #9ca3af;
          font-size: 10px;
          margin-bottom: 4px;
        }
        
        .datetime-item .value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 12px;
        }
        
        .icon {
          width: 16px;
          height: 16px;
          color: #FFB400;
        }
        
        .booking-ref {
          background: rgba(0,0,0,0.2);
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 16px;
        }
        
        .booking-ref .label {
          color: #9ca3af;
          font-size: 10px;
          margin-bottom: 4px;
        }
        
        .booking-ref .value {
          font-family: monospace;
          font-weight: bold;
          color: #FFB400;
        }
        
        .order-id {
          color: #9ca3af;
          font-size: 10px;
          margin-top: 4px;
        }
        
        .company-info {
          font-size: 10px;
          color: #d1d5db;
          line-height: 1.4;
        }
        
        .company-info .info-line {
          display: flex;
          align-items: flex-start;
          gap: 4px;
          margin-bottom: 4px;
        }
        
        .company-info .icon {
          width: 12px;
          height: 12px;
          color: #FFB400;
          margin-top: 1px;
        }
        
        .thank-you {
          text-align: center;
          margin-top: 16px;
          font-size: 10px;
          color: #FFB400;
          font-weight: 600;
        }
        
        .decorative-circles {
          position: absolute;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
        }
        
        .circle-tl { top: -8px; left: -8px; }
        .circle-tr { top: -8px; right: -8px; }
        .circle-bl { bottom: -8px; left: -8px; }
        .circle-br { bottom: -8px; right: -8px; }
        
        .barcode {
          position: absolute;
          bottom: 16px;
          left: 24px;
        }
        
        .barcode .label {
          font-size: 10px;
          color: #9ca3af;
          margin-bottom: 4px;
        }
        
        .barcode-lines {
          display: flex;
          gap: 1px;
        }
        
        .barcode-line {
          width: 1px;
          background: white;
        }
      </style>
    </head>
    <body>
      <div class="ticket-container">
        <div class="background-pattern"></div>
        
        <div class="decorative-circles circle-tl"></div>
        <div class="decorative-circles circle-tr"></div>
        <div class="decorative-circles circle-bl"></div>
        <div class="decorative-circles circle-br"></div>
        
        <div class="ticket-content">
          <div class="left-section">
            <div class="header">
              <div>
                <div class="logo">PICK ME HOP</div>
                <div class="subtitle">BILLET POUR PARIS / TICKET TO PARIS</div>
              </div>
              <div class="passenger-info">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>PASSAGER/PASSENGER</span>
              </div>
            </div>
            
            <div class="airport-section">
              <div class="airport-code">
                <div class="code">${fromCode}</div>
                <div class="label">FROM</div>
              </div>
              
              <div class="flight-path">
                <div class="checkbox">✓</div>
                <svg class="plane-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m2 2 20 20"/>
                  <path d="m6 6 14 14"/>
                  <path d="m12 2v20"/>
                  <path d="m2 12h20"/>
                </svg>
                <div class="checkbox">✓</div>
              </div>
              
              <div class="airport-code">
                <div class="code">${toCode}</div>
                <div class="label">TO</div>
              </div>
            </div>
            
            <div class="details-grid">
              <div class="detail-item">
                <div class="label">CUSTOMER NAME</div>
                <div class="value">${data.customerName}</div>
              </div>
              <div class="detail-item">
                <div class="label">PASSENGERS</div>
                <div class="value">${data.passengers} PAX</div>
              </div>
              <div class="detail-item">
                <div class="label">VEHICLE TYPE</div>
                <div class="value">${data.vehicleType}</div>
              </div>
              <div class="detail-item">
                <div class="label">TOTAL PRICE</div>
                <div class="value price">€${data.totalPrice}</div>
              </div>
            </div>
          </div>
          
          <div class="separator"></div>
          
          <div class="right-section">
            <div class="datetime-section">
              <div class="datetime-item">
                <div class="label">DATE D'ARRIVÉE/DATE OF ARRIVAL</div>
                <div class="value">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>${data.pickupDate}</span>
                </div>
              </div>
              
              <div class="datetime-item">
                <div class="label">HEURE DE DÉPART</div>
                <div class="value">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <span>${data.pickupTime}</span>
                </div>
              </div>
            </div>
            
            <div class="booking-ref">
              <div class="label">BON N°</div>
              <div class="value">${data.bookingReference}</div>
              <div class="order-id">ORDER ID: ${data.orderId}</div>
            </div>
            
            <div class="company-info">
              <div class="info-line">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                </svg>
                <span>10 RUE DE RICHEMONT, 75013 PARIS</span>
              </div>
              <div class="info-line">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>09 49 325 039</span>
              </div>
              <div>EMERGENCY: 00012</div>
              <div>SIRET: 949 325 039 00012</div>
              <div>VAT: 075230489</div>
            </div>
            
            <div class="thank-you">Merci / Thank You</div>
          </div>
        </div>
        
        <div class="barcode">
          <div class="label">BOARDING PASS</div>
          <div class="barcode-lines">
            ${Array.from({ length: 40 }, () => 
              `<div class="barcode-line" style="height: ${Math.random() * 12 + 8}px;"></div>`
            ).join('')}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * CSS styles for email-safe ticket (inline styles)
 */
export const generateEmailTicketHTML = (data: TicketData): string => {
  const getAirportCode = (location: string) => {
    const locationLower = location.toLowerCase();
    if (locationLower.includes('charles de gaulle') || locationLower.includes('cdg')) return 'CDG';
    if (locationLower.includes('orly') || locationLower.includes('ory')) return 'ORY';
    if (locationLower.includes('beauvais') || locationLower.includes('bva')) return 'BVA';
    if (locationLower.includes('disneyland') || locationLower.includes('disney')) return 'DIS';
    return 'PAR';
  };

  const fromCode = getAirportCode(data.fromLocation);
  const toCode = getAirportCode(data.toLocation);

  return `
    <div style="width: 100%; max-width: 600px; margin: 20px auto; background: linear-gradient(135deg, #0D2C54 0%, #1a3a6b 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); font-family: Arial, sans-serif;">
      
      <!-- Main Content -->
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px; color: white; vertical-align: top;">
            
            <!-- Header -->
            <table style="width: 100%; margin-bottom: 20px;">
              <tr>
                <td>
                  <div style="font-size: 22px; font-weight: bold; color: #FFB400;">PICK ME HOP</div>
                  <div style="font-size: 10px; color: #d1d5db; margin-top: 4px;">BILLET POUR PARIS / TICKET TO PARIS</div>
                </td>
                <td style="text-align: right; font-size: 10px;">
                  PASSAGER/PASSENGER
                </td>
              </tr>
            </table>
            
            <!-- Airport Codes -->
            <table style="width: 100%; margin: 20px 0; text-align: center;">
              <tr>
                <td style="width: 30%;">
                  <div style="font-size: 24px; font-weight: bold; color: #FFB400;">${fromCode}</div>
                  <div style="font-size: 10px; color: #d1d5db; margin-top: 4px;">FROM</div>
                </td>
                <td style="width: 40%; text-align: center;">
                  <div style="display: inline-flex; align-items: center; gap: 8px;">
                    <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #FFB400; border-radius: 4px; text-align: center; line-height: 16px; font-size: 10px; color: #FFB400;">✓</span>
                    <span style="color: #FFB400; font-size: 16px;">✈</span>
                    <span style="display: inline-block; width: 20px; height: 20px; border: 2px solid #FFB400; border-radius: 4px; text-align: center; line-height: 16px; font-size: 10px; color: #FFB400;">✓</span>
                  </div>
                </td>
                <td style="width: 30%;">
                  <div style="font-size: 24px; font-weight: bold; color: #FFB400;">${toCode}</div>
                  <div style="font-size: 10px; color: #d1d5db; margin-top: 4px;">TO</div>
                </td>
              </tr>
            </table>
            
            <!-- Customer Details -->
            <table style="width: 100%; font-size: 10px;">
              <tr>
                <td style="width: 50%; padding: 0 10px 10px 0;">
                  <div style="color: #9ca3af; margin-bottom: 4px;">CUSTOMER NAME</div>
                  <div style="font-weight: 600; font-size: 12px;">${data.customerName}</div>
                </td>
                <td style="width: 50%; padding: 0 0 10px 10px;">
                  <div style="color: #9ca3af; margin-bottom: 4px;">PASSENGERS</div>
                  <div style="font-weight: 600;">${data.passengers} PAX</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 10px 0 0;">
                  <div style="color: #9ca3af; margin-bottom: 4px;">VEHICLE TYPE</div>
                  <div style="font-weight: 600;">${data.vehicleType}</div>
                </td>
                <td style="padding: 0 0 0 10px;">
                  <div style="color: #9ca3af; margin-bottom: 4px;">TOTAL PRICE</div>
                  <div style="font-weight: 600; color: #FFB400;">€${data.totalPrice}</div>
                </td>
              </tr>
            </table>
            
          </td>
          
          <!-- Right Section -->
          <td style="width: 200px; padding: 20px; color: white; vertical-align: top; border-left: 2px dashed #6b7280;">
            
            <!-- Date Time -->
            <div style="margin-bottom: 16px;">
              <div style="color: #9ca3af; font-size: 10px; margin-bottom: 4px;">DATE D'ARRIVÉE/DATE OF ARRIVAL</div>
              <div style="font-weight: 600; font-size: 12px; margin-bottom: 8px;">${data.pickupDate}</div>
              
              <div style="color: #9ca3af; font-size: 10px; margin-bottom: 4px;">HEURE DE DÉPART</div>
              <div style="font-weight: 600; font-size: 12px;">${data.pickupTime}</div>
            </div>
            
            <!-- Booking Reference -->
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 16px;">
              <div style="color: #9ca3af; font-size: 10px; margin-bottom: 4px;">BON N°</div>
              <div style="font-family: monospace; font-weight: bold; color: #FFB400;">${data.bookingReference}</div>
              <div style="color: #9ca3af; font-size: 10px; margin-top: 4px;">ORDER ID: ${data.orderId}</div>
            </div>
            
            <!-- Company Info -->
            <div style="font-size: 10px; color: #d1d5db; line-height: 1.4;">
              <div style="margin-bottom: 4px;">10 RUE DE RICHEMONT, 75013 PARIS</div>
              <div style="margin-bottom: 4px;">📞 09 49 325 039</div>
              <div style="margin-bottom: 4px;">EMERGENCY: 00012</div>
              <div style="margin-bottom: 4px;">SIRET: 949 325 039 00012</div>
              <div>VAT: 075230489</div>
            </div>
            
            <!-- Thank You -->
            <div style="text-align: center; margin-top: 16px; font-size: 10px; color: #FFB400; font-weight: 600;">
              Merci / Thank You
            </div>
            
          </td>
        </tr>
      </table>
      
    </div>
  `;
};

export type { TicketData };