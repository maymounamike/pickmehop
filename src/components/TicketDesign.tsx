import React from 'react';
import { Plane, User, MapPin, Calendar, Clock, Phone, Building2 } from 'lucide-react';

export interface TicketData {
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

interface TicketDesignProps {
  data: TicketData;
  className?: string;
}

export const TicketDesign: React.FC<TicketDesignProps> = ({ data, className = "" }) => {
  // Generate airport codes based on location
  const getAirportCode = (location: string) => {
    const locationLower = location.toLowerCase();
    if (locationLower.includes('charles de gaulle') || locationLower.includes('cdg')) return 'CDG';
    if (locationLower.includes('orly') || locationLower.includes('ory')) return 'ORY';
    if (locationLower.includes('beauvais') || locationLower.includes('bva')) return 'BVA';
    if (locationLower.includes('disneyland') || locationLower.includes('disney')) return 'DIS';
    return 'PAR'; // Default for Paris locations
  };

  const fromCode = getAirportCode(data.fromLocation);
  const toCode = getAirportCode(data.toLocation);

  return (
    <div className={`relative bg-white ${className}`} style={{ width: '800px', height: '300px' }}>
      {/* Main Ticket Container */}
      <div className="relative w-full h-full bg-gradient-to-r from-[#0D2C54] via-[#0D2C54] to-[#1a3a6b] rounded-lg shadow-2xl overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }} />
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex h-full">
          
          {/* Left Section - Main Info */}
          <div className="flex-1 p-6 text-white">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#FFB400]">PICK ME HOP</h1>
                <p className="text-xs text-gray-300">BILLET POUR PARIS / TICKET TO PARIS</p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <User className="w-4 h-4" />
                <span>PASSAGER/PASSENGER</span>
              </div>
            </div>

            {/* Airport Codes Section */}
            <div className="flex items-center justify-center mb-6 space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FFB400]">{fromCode}</div>
                <div className="text-xs text-gray-300 mt-1">FROM</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 border-2 border-[#FFB400] rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-[#FFB400]">✓</span>
                </div>
                <Plane className="w-6 h-6 text-[#FFB400] rotate-90" />
                <div className="w-8 h-8 border-2 border-[#FFB400] rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-[#FFB400]">✓</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FFB400]">{toCode}</div>
                <div className="text-xs text-gray-300 mt-1">TO</div>
              </div>
            </div>

            {/* Customer and Trip Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-gray-400 mb-1">CUSTOMER NAME</div>
                <div className="font-semibold text-sm">{data.customerName}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">PASSENGERS</div>
                <div className="font-semibold">{data.passengers} PAX</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">VEHICLE TYPE</div>
                <div className="font-semibold">{data.vehicleType}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">TOTAL PRICE</div>
                <div className="font-semibold text-[#FFB400]">€{data.totalPrice}</div>
              </div>
            </div>
          </div>

          {/* Dashed Line Separator */}
          <div className="w-px bg-gray-600 relative">
            <div className="absolute inset-y-0 left-0 w-px border-l-2 border-dashed border-gray-400"></div>
          </div>

          {/* Right Section - Details */}
          <div className="w-64 p-6 text-white">
            
            {/* Date and Time */}
            <div className="mb-4">
              <div className="text-gray-400 text-xs mb-1">DATE D'ARRIVÉE/DATE OF ARRIVAL</div>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-[#FFB400]" />
                <span className="font-semibold text-sm">{data.pickupDate}</span>
              </div>
              
              <div className="text-gray-400 text-xs mb-1">HEURE DE DÉPART</div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#FFB400]" />
                <span className="font-semibold text-sm">{data.pickupTime}</span>
              </div>
            </div>

            {/* Booking Reference */}
            <div className="mb-4 p-3 bg-black/20 rounded">
              <div className="text-gray-400 text-xs mb-1">BON N°</div>
              <div className="font-mono font-bold text-[#FFB400]">{data.bookingReference}</div>
              <div className="text-gray-400 text-xs mt-1">ORDER ID: {data.orderId}</div>
            </div>

            {/* Company Info */}
            <div className="text-xs space-y-1 text-gray-300">
              <div className="flex items-start space-x-1">
                <Building2 className="w-3 h-3 mt-0.5 text-[#FFB400]" />
                <span>10 RUE DE RICHEMONT, 75013 PARIS</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3 text-[#FFB400]" />
                <span>09 49 325 039</span>
              </div>
              <div>EMERGENCY: 00012</div>
              <div>SIRET: 949 325 039 00012</div>
              <div>VAT: 075230489</div>
            </div>

            {/* Thank You Message */}
            <div className="mt-4 text-center">
              <div className="text-xs text-[#FFB400] font-semibold">Merci / Thank You</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-white rounded-full transform -translate-x-2 -translate-y-2"></div>
        <div className="absolute top-0 right-0 w-4 h-4 bg-white rounded-full transform translate-x-2 -translate-y-2"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-white rounded-full transform -translate-x-2 translate-y-2"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full transform translate-x-2 translate-y-2"></div>

        {/* Barcode */}
        <div className="absolute bottom-4 left-6">
          <div className="text-xs text-gray-400 mb-1">BOARDING PASS</div>
          <div className="flex space-x-px">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="w-px bg-white"
                style={{ height: `${Math.random() * 12 + 8}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage component for testing
export const TicketPreview: React.FC = () => {
  const sampleData: TicketData = {
    bookingReference: "PMH2024001",
    orderId: "ORD-ABC123456",
    customerName: "JEAN DUPONT",
    fromLocation: "Charles de Gaulle International Airport",
    toLocation: "Disneyland Paris",
    pickupDate: "15 DEC 2024",
    pickupTime: "14:30",
    passengers: 2,
    vehicleType: "SEDAN",
    totalPrice: 80,
    paymentMethod: "CARD",
    driverName: "Pierre Martin",
    driverPhone: "+33 6 12 34 56 78"
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Airline-Style Ticket Design</h1>
      <div className="flex justify-center">
        <TicketDesign data={sampleData} />
      </div>
    </div>
  );
};

export default TicketDesign;