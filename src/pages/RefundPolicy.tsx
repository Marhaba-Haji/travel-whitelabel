import Header from "@/components/landing/Header";
import SEOHead from "@/components/seo/SEOHead";
import Footer from "@/components/landing/Footer";
import { useContactSettings } from "@/hooks/useContactSettings";

const RefundPolicy = () => {
  const { email, phone, address } = useContactSettings();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Refund Policy"
        description="Refund terms for Marhaba DMC subscriptions and services, including eligibility, processing timelines, and how to request a refund. Start your travel business with a white-label portal, flight/hotel/visa APIs, AI sales assistant, training, and ongoing support."
        path="/refund-policy"
      />
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                At marhabaDMC, we strive to provide excellent service and customer satisfaction. This Refund Policy outlines the terms and conditions under which refunds may be issued for our services and subscriptions. Please read this policy carefully before making a purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Subscription and Service Fees</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Monthly/Annual Subscriptions</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For monthly or annual subscription plans:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period.</li>
                <li><strong>Refund Eligibility:</strong> Refunds for unused portions of subscriptions are available only if requested within 7 days of the initial purchase or renewal.</li>
                <li><strong>Pro-rated Refunds:</strong> If eligible, refunds will be calculated on a pro-rated basis for the remaining unused period.</li>
                <li><strong>No Refund After Use:</strong> Once you have actively used the service for more than 7 days, no refund will be issued for that billing period.</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 One-Time Setup Fees</h3>
              <p className="text-muted-foreground leading-relaxed">
                One-time setup fees, onboarding fees, or training fees are generally non-refundable once services have been initiated. However, if services have not commenced within 14 days of payment, a full refund may be requested.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Travel Bookings and Reservations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Refunds for travel bookings made through our platform are subject to the cancellation and refund policies of the respective travel service providers (airlines, hotels, tour operators, etc.). marhabaDMC acts as an intermediary and:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>We will process refund requests according to the provider's terms</li>
                <li>Cancellation fees and charges may apply as per the provider's policy</li>
                <li>Refund processing times vary by provider (typically 7-30 business days)</li>
                <li>We are not responsible for provider-specific refund policies or delays</li>
                <li>Service fees charged by marhabaDMC are non-refundable unless the booking is cancelled due to our error</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Refund Request Process</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To request a refund:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Contact our support team at {email} or {phone}</li>
                <li>Provide your account information and order/reference number</li>
                <li>Clearly state the reason for your refund request</li>
                <li>Include any relevant documentation or evidence</li>
                <li>Our team will review your request within 5-7 business days</li>
                <li>You will be notified of the decision via email</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Refund Processing Time</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Once a refund is approved:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Refunds will be processed within 10-15 business days</li>
                <li>Refunds will be issued to the original payment method used</li>
                <li>For bank transfers, processing may take additional 3-5 business days</li>
                <li>You will receive a confirmation email once the refund is processed</li>
                <li>Contact us if you don't receive your refund within the stated timeframe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Non-Refundable Items</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The following are generally non-refundable:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Services already rendered or consumed</li>
                <li>Digital products or downloadable content that has been accessed</li>
                <li>Custom development work that has been completed</li>
                <li>Third-party fees or charges (processing fees, transaction fees)</li>
                <li>Services cancelled due to violation of Terms of Service</li>
                <li>Promotional or discounted items marked as "non-refundable"</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Chargebacks and Disputes</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you initiate a chargeback or dispute with your payment provider, we reserve the right to suspend your account until the matter is resolved. We encourage you to contact us directly first to resolve any issues, as we are committed to finding a fair solution. Unjustified chargebacks may result in account termination and may affect your ability to use our services in the future.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Special Circumstances</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">8.1 Service Interruptions</h3>
              <p className="text-muted-foreground leading-relaxed">
                If our service is unavailable for more than 48 consecutive hours due to our technical issues, we will provide a pro-rated credit or refund for the affected period upon request.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Billing Errors</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you believe you have been charged incorrectly, please contact us immediately. We will investigate and, if an error is confirmed, issue a full refund or credit within 5 business days.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">8.3 Force Majeure</h3>
              <p className="text-muted-foreground leading-relaxed">
                In cases of force majeure events (natural disasters, pandemics, government actions, etc.) affecting travel services, refunds will be subject to the policies of the travel service providers and applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Partial Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                In some cases, we may offer partial refunds based on:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>The extent of services already provided</li>
                <li>Time remaining in the subscription period</li>
                <li>Any applicable cancellation fees</li>
                <li>The specific circumstances of your request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Refund Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting on this page. Your continued use of our services after changes are posted constitutes acceptance of the modified policy. Material changes will be communicated via email or prominent notice on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For refund requests or questions about this policy, please contact us:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> {email}<br />
                  <strong>Phone:</strong> {phone}<br />
                  <strong>Address:</strong> {address}<br />
                  <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Consumer Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                This policy does not affect your statutory rights as a consumer. If you are located in a jurisdiction that provides additional consumer protection rights, those rights remain applicable. If you believe this policy conflicts with your local consumer protection laws, please contact us to discuss your specific situation.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
