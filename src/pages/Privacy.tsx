import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              How we collect, use, and protect your personal information
            </p>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-8">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  Pick Me Hop ("we," "our," or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our airport transfer and transportation services.
                </p>
                <p className="text-muted-foreground mb-4">
                  This policy complies with the General Data Protection Regulation (GDPR) and other applicable privacy laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Pickup and destination addresses</li>
                  <li>Flight information (for airport transfers)</li>
                  <li>Payment information (processed securely by our payment providers)</li>
                  <li>Special requirements or preferences</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2.2 Technical Information</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Usage data and website interactions</li>
                  <li>Location data (when using our mobile app with permission)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                <h3 className="text-xl font-semibold mb-3">3.1 Service Provision</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Process and fulfill your transportation bookings</li>
                  <li>Coordinate with drivers for pickup and delivery</li>
                  <li>Send booking confirmations and updates</li>
                  <li>Provide customer support and assistance</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">3.2 Business Operations</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Improve our services and user experience</li>
                  <li>Conduct analytics and market research</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">3.3 Communications</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Send service-related notifications</li>
                  <li>Provide customer support</li>
                  <li>Share promotional offers (with your consent)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">4. Legal Basis for Processing</h2>
                <p className="text-muted-foreground mb-4">
                  Under GDPR, we process your personal data based on:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li><strong>Contract performance:</strong> To provide transportation services you've booked</li>
                  <li><strong>Legitimate interests:</strong> To improve our services and ensure security</li>
                  <li><strong>Consent:</strong> For marketing communications and optional services</li>
                  <li><strong>Legal obligation:</strong> To comply with applicable laws and regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. Data Sharing and Disclosure</h2>
                <h3 className="text-xl font-semibold mb-3">5.1 Service Providers</h3>
                <p className="text-muted-foreground mb-4">
                  We share necessary information with:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Our drivers and partner transportation providers</li>
                  <li>Payment processors for transaction handling</li>
                  <li>Technology service providers for website and app functionality</li>
                  <li>Customer support and communication platforms</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">5.2 Legal Requirements</h3>
                <p className="text-muted-foreground mb-4">
                  We may disclose information when required by law, legal process, or to protect our rights and safety or that of others.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
                <p className="text-muted-foreground mb-4">
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Limited access to personal data on a need-to-know basis</li>
                  <li>Staff training on data protection and security</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
                <p className="text-muted-foreground mb-4">
                  We retain your personal data only as long as necessary for the purposes outlined in this policy or as required by law. Typically:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Booking and payment data: 7 years for tax and accounting purposes</li>
                  <li>Communication records: 3 years for customer service purposes</li>
                  <li>Website usage data: 2 years for analytics purposes</li>
                  <li>Marketing data: Until you withdraw consent</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">8. Your Rights Under GDPR</h2>
                <p className="text-muted-foreground mb-4">
                  You have the following rights regarding your personal data:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li><strong>Access:</strong> Request copies of your personal data</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Restriction:</strong> Request limitation of processing</li>
                  <li><strong>Objection:</strong> Object to processing for marketing purposes</li>
                  <li><strong>Withdrawal of consent:</strong> Withdraw consent for data processing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">9. Cookies and Tracking</h2>
                <p className="text-muted-foreground mb-4">
                  Our website uses cookies and similar technologies to enhance your experience. We use:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li><strong>Essential cookies:</strong> Required for website functionality</li>
                  <li><strong>Analytics cookies:</strong> To understand website usage</li>
                  <li><strong>Preference cookies:</strong> To remember your settings</li>
                  <li><strong>Marketing cookies:</strong> To provide relevant advertisements (with consent)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
                <p className="text-muted-foreground mb-4">
                  Your data may be transferred to and processed in countries outside the European Economic Area (EEA). We ensure appropriate safeguards are in place, including adequacy decisions and standard contractual clauses.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">11. Updates to This Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update this Privacy Policy periodically. We will notify you of significant changes via email or through our website. The "Last updated" date at the top of this policy indicates when it was last revised.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  For questions about this Privacy Policy or to exercise your data protection rights, contact us:
                </p>
                <ul className="list-none text-muted-foreground mb-4">
                  <li><strong>Data Protection Officer:</strong> privacy@pickmehop.com</li>
                  <li><strong>Phone:</strong> +33 1 23 45 67 89</li>
                  <li><strong>Address:</strong> Paris, France</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  You also have the right to lodge a complaint with your local data protection authority if you believe your data protection rights have been violated.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;