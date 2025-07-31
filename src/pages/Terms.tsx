import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms & Conditions</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Please read these terms carefully before using our services
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-8">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  By accessing and using Pick Me Hop's services, you accept and agree to be bound by the terms and provision of this agreement. These Terms and Conditions apply to all users of the service, including passengers, drivers, and visitors to our website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. Service Description</h2>
                <p className="text-muted-foreground mb-4">
                  Pick Me Hop provides airport transfer and transportation services in Paris, France. Our services include:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Airport transfers to and from Charles de Gaulle (CDG), Orly (ORY), and Beauvais airports</li>
                  <li>City transportation within Paris and surrounding areas</li>
                  <li>Group transportation services</li>
                  <li>Corporate transportation solutions</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">3. Booking and Payment</h2>
                <h3 className="text-xl font-semibold mb-3">3.1 Booking Process</h3>
                <p className="text-muted-foreground mb-4">
                  Bookings can be made through our website, mobile app, or by contacting our customer service. All bookings are subject to availability and confirmation.
                </p>
                
                <h3 className="text-xl font-semibold mb-3">3.2 Payment Terms</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Payment is required at the time of booking</li>
                  <li>We accept major credit cards, debit cards, and other approved payment methods</li>
                  <li>All prices are in Euros (EUR) and include applicable taxes</li>
                  <li>Prices may vary based on distance, time, and vehicle type</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">4. Cancellation and Refund Policy</h2>
                <h3 className="text-xl font-semibold mb-3">4.1 Cancellation by Customer</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Free cancellation up to 24 hours before scheduled pickup</li>
                  <li>Cancellations between 12-24 hours: 50% refund</li>
                  <li>Cancellations less than 12 hours: No refund</li>
                  <li>No-show: No refund</li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-3">4.2 Cancellation by Pick Me Hop</h3>
                <p className="text-muted-foreground mb-4">
                  In rare cases where we must cancel your booking due to unforeseen circumstances, you will receive a full refund or alternative arrangement at no extra cost.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. Customer Responsibilities</h2>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Provide accurate pickup and destination information</li>
                  <li>Be ready at the designated pickup time and location</li>
                  <li>Provide correct flight information for airport transfers</li>
                  <li>Inform us of any special requirements or changes</li>
                  <li>Treat drivers and vehicles with respect</li>
                  <li>Follow all safety instructions</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-4">
                  Pick Me Hop's liability is limited to the cost of the transportation service. We are not liable for indirect, incidental, or consequential damages. Our drivers are fully insured, and we maintain comprehensive commercial insurance coverage.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">7. Privacy and Data Protection</h2>
                <p className="text-muted-foreground mb-4">
                  We are committed to protecting your privacy and personal data in accordance with GDPR regulations. Please refer to our Privacy Policy for detailed information about how we collect, use, and protect your data.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">8. Modifications to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  Pick Me Hop reserves the right to modify these terms at any time. Changes will be posted on our website, and continued use of our services constitutes acceptance of the modified terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">9. Contact Information</h2>
                <p className="text-muted-foreground mb-4">
                  For questions about these Terms and Conditions, please contact us:
                </p>
                <ul className="list-none text-muted-foreground mb-4">
                  <li>Email: legal@pickmehop.com</li>
                  <li>Phone: +33 1 23 45 67 89</li>
                  <li>Address: Paris, France</li>
                </ul>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;