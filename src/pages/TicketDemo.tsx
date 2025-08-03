import React, { useState } from 'react';
import { TicketDesign, TicketPreview, TicketData } from '../components/TicketDesign';
import { generateEmailTicketHTML, generateTicketHTML } from '../utils/ticketImageGenerator';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Download, Copy, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TicketDemo: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<'default' | 'disneyland' | 'beauvais'>('default');

  const sampleTickets: Record<string, TicketData> = {
    default: {
      bookingReference: "PMH2024001",
      orderId: "ORD-ABC123456",
      customerName: "JEAN DUPONT",
      fromLocation: "Charles de Gaulle International Airport",
      toLocation: "10 Rue de la Paix, 75001 Paris",
      pickupDate: "15 DEC 2024",
      pickupTime: "14:30",
      passengers: 2,
      vehicleType: "SEDAN",
      totalPrice: 80,
      paymentMethod: "CARD",
      driverName: "Pierre Martin",
      driverPhone: "+33 6 12 34 56 78"
    },
    disneyland: {
      bookingReference: "PMH2024002",
      orderId: "ORD-DEF789012",
      customerName: "MARIA GARCIA",
      fromLocation: "Disneyland Paris, Bd de Parc, 77700 Coupvray",
      toLocation: "Orly Airport",
      pickupDate: "20 DEC 2024",
      pickupTime: "09:15",
      passengers: 4,
      vehicleType: "MINIVAN",
      totalPrice: 110,
      paymentMethod: "CARD",
      driverName: "Sophie Dubois",
      driverPhone: "+33 6 87 65 43 21"
    },
    beauvais: {
      bookingReference: "PMH2024003",
      orderId: "ORD-GHI345678",
      customerName: "JOHN SMITH",
      fromLocation: "Beauvais-Tillé Airport",
      toLocation: "Disneyland Paris",
      pickupDate: "25 DEC 2024",
      pickupTime: "16:45",
      passengers: 3,
      vehicleType: "SEDAN",
      totalPrice: 200,
      paymentMethod: "CASH",
      driverName: "Michel Laurent",
      driverPhone: "+33 6 23 45 67 89"
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} has been copied to your clipboard.`,
    });
  };

  const downloadHTML = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Airline-Style Ticket Design for Pick Me Hop
          </h1>
          <p className="text-gray-600">
            Professional boarding pass style confirmation tickets for order confirmation emails.
          </p>
        </div>

        {/* Ticket Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Preview Different Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => setSelectedTicket('default')}
                variant={selectedTicket === 'default' ? 'default' : 'outline'}
              >
                CDG → Paris
              </Button>
              <Button
                onClick={() => setSelectedTicket('disneyland')}
                variant={selectedTicket === 'disneyland' ? 'default' : 'outline'}
              >
                Disneyland → Orly
              </Button>
              <Button
                onClick={() => setSelectedTicket('beauvais')}
                variant={selectedTicket === 'beauvais' ? 'default' : 'outline'}
              >
                Beauvais → Disneyland
              </Button>
            </div>

            {/* Live Preview */}
            <div className="bg-gray-100 p-6 rounded-lg overflow-x-auto">
              <TicketDesign data={sampleTickets[selectedTicket]} />
            </div>
          </CardContent>
        </Card>

        {/* Implementation Details */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Code Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Code</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="react" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="react">React</TabsTrigger>
                  <TabsTrigger value="email">Email HTML</TabsTrigger>
                  <TabsTrigger value="integration">Integration</TabsTrigger>
                </TabsList>
                
                <TabsContent value="react" className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">React Component Usage</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
{`import { TicketDesign, TicketData } from './components/TicketDesign';

const ticketData: TicketData = {
  bookingReference: "PMH2024001",
  orderId: "ORD-ABC123456",
  customerName: "JEAN DUPONT",
  fromLocation: "Charles de Gaulle Airport",
  toLocation: "10 Rue de la Paix, Paris",
  pickupDate: "15 DEC 2024",
  pickupTime: "14:30",
  passengers: 2,
  vehicleType: "SEDAN",
  totalPrice: 80,
  paymentMethod: "CARD"
};

<TicketDesign data={ticketData} />`}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`import { TicketDesign, TicketData } from './components/TicketDesign';

const ticketData: TicketData = {
  bookingReference: "PMH2024001",
  orderId: "ORD-ABC123456",
  customerName: "JEAN DUPONT",
  fromLocation: "Charles de Gaulle Airport",
  toLocation: "10 Rue de la Paix, Paris",
  pickupDate: "15 DEC 2024",
  pickupTime: "14:30",
  passengers: 2,
  vehicleType: "SEDAN",
  totalPrice: 80,
  paymentMethod: "CARD"
};

<TicketDesign data={ticketData} />`, 'React code')}
                      className="mt-2"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="email" className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Email-Safe HTML Generation</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
{`import { generateEmailTicketHTML } from './utils/ticketImageGenerator';

// Generate email-safe HTML
const emailHTML = generateEmailTicketHTML(ticketData);

// Use in email template
const emailTemplate = \`
  <html>
    <body>
      <h1>Booking Confirmation</h1>
      <p>Thank you for your booking!</p>
      
      \${emailHTML}
      
      <p>See you soon!</p>
    </body>
  </html>
\`;`}
                    </pre>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generateEmailTicketHTML(sampleTickets[selectedTicket]), 'Email HTML')}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Email HTML
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadHTML(generateEmailTicketHTML(sampleTickets[selectedTicket]), `ticket-email-${selectedTicket}.html`)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download HTML
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="integration" className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">BookingForm Integration</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
{`// In your booking confirmation function
const sendConfirmationEmail = async (bookingData) => {
  const ticketData: TicketData = {
    bookingReference: bookingData.reference,
    orderId: bookingData.id,
    customerName: bookingData.customerName,
    fromLocation: bookingData.fromLocation,
    toLocation: bookingData.toLocation,
    pickupDate: format(bookingData.pickupDate, "dd MMM yyyy"),
    pickupTime: bookingData.pickupTime,
    passengers: bookingData.passengers,
    vehicleType: bookingData.vehicleType,
    totalPrice: bookingData.totalPrice,
    paymentMethod: bookingData.paymentMethod
  };

  const ticketHTML = generateEmailTicketHTML(ticketData);
  
  // Send email with ticket
  await resend.emails.send({
    from: 'Pick Me Hop <bookings@pickmehop.com>',
    to: [bookingData.email],
    subject: 'Booking Confirmation - Your Ticket',
    html: \`
      <h1>Booking Confirmed!</h1>
      <p>Dear \${bookingData.customerName},</p>
      <p>Your booking has been confirmed. Please find your ticket below:</p>
      \${ticketHTML}
      <p>Thank you for choosing Pick Me Hop!</p>
    \`
  });
};`}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`// In your booking confirmation function
const sendConfirmationEmail = async (bookingData) => {
  const ticketData: TicketData = {
    bookingReference: bookingData.reference,
    orderId: bookingData.id,
    customerName: bookingData.customerName,
    fromLocation: bookingData.fromLocation,
    toLocation: bookingData.toLocation,
    pickupDate: format(bookingData.pickupDate, "dd MMM yyyy"),
    pickupTime: bookingData.pickupTime,
    passengers: bookingData.passengers,
    vehicleType: bookingData.vehicleType,
    totalPrice: bookingData.totalPrice,
    paymentMethod: bookingData.paymentMethod
  };

  const ticketHTML = generateEmailTicketHTML(ticketData);
  
  // Send email with ticket
  await resend.emails.send({
    from: 'Pick Me Hop <bookings@pickmehop.com>',
    to: [bookingData.email],
    subject: 'Booking Confirmation - Your Ticket',
    html: \`
      <h1>Booking Confirmed!</h1>
      <p>Dear \${bookingData.customerName},</p>
      <p>Your booking has been confirmed. Please find your ticket below:</p>
      \${ticketHTML}
      <p>Thank you for choosing Pick Me Hop!</p>
    \`
  });
};`, 'Integration code')}
                      className="mt-2"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Integration Code
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Features & Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Features & Implementation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <h4 className="font-medium mb-2">✨ Key Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Professional airline boarding pass design</li>
                  <li>• Brand colors (#0D2C54 and #FFB400)</li>
                  <li>• Dynamic airport code generation (CDG, ORY, BVA, DIS)</li>
                  <li>• Email-client compatible HTML</li>
                  <li>• Responsive design for mobile and desktop</li>
                  <li>• Automatic route detection and pricing display</li>
                  <li>• Decorative barcode and airline elements</li>
                  <li>• Multi-language support (French/English)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">📧 Email Integration</h4>
                <div className="bg-blue-50 p-4 rounded-lg text-sm">
                  <p className="font-medium text-blue-900 mb-2">Ready for Email</p>
                  <p className="text-blue-700">
                    The ticket uses inline CSS styles and table-based layout for maximum 
                    compatibility with email clients including Gmail, Outlook, and Apple Mail.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">🚀 Quick Setup</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Copy the TicketDesign component to your project</li>
                  <li>2. Import the utility functions for email generation</li>
                  <li>3. Integrate with your booking confirmation system</li>
                  <li>4. Customize colors and company details as needed</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2">🎨 Customization</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <p>
                    <strong>Brand Colors:</strong> Easily modify the color scheme by updating 
                    the CSS variables in the utility functions.
                  </p>
                  <p className="mt-2">
                    <strong>Company Info:</strong> Update the company address, phone numbers, 
                    and registration details in the ticket template.
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Download Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Download & Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                onClick={() => downloadHTML(generateTicketHTML(sampleTickets[selectedTicket]), `ticket-${selectedTicket}.html`)}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Full HTML
              </Button>
              <Button
                onClick={() => downloadHTML(generateEmailTicketHTML(sampleTickets[selectedTicket]), `email-ticket-${selectedTicket}.html`)}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Download Email Version
              </Button>
              <Button
                onClick={() => copyToClipboard(JSON.stringify(sampleTickets[selectedTicket], null, 2), 'Sample data')}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Sample Data
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Test the HTML files in your email client or use them as templates for your booking system.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default TicketDemo;