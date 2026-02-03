import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Mail, Phone, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const FAQ = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: accordionRef, isVisible: accordionVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  const faqs = [
    {
      question: "How long does it take to set up my portal?",
      answer: "Most clients have their branded portal live within 2-3 business days. This includes domain setup, branding customization, and API integration. Our team provides full support throughout the process.",
    },
    {
      question: "Can I use my own domain name?",
      answer: "Absolutely! You can use your own custom domain (e.g., book.youragency.com). We'll help you set up the DNS and SSL certificate at no extra cost. Your customers will never see the NOMADORE brand.",
    },
    {
      question: "What APIs are included in the platform?",
      answer: "The platform includes Flight API (GDS integration), Hotel API (1M+ properties), Visa Processing API (100+ countries), and Activities API (tours & experiences). All APIs are included in the annual subscription with no extra charges.",
    },
    {
      question: "How does the supplier portal work?",
      answer: "You can invite unlimited suppliers to your portal. Each supplier gets their own login where they can manage their inventory, rates, and availability. You control their access levels and can track their performance through your admin dashboard.",
    },
    {
      question: "Is there a limit on the number of agents or customers?",
      answer: "No limits! You can add unlimited B2B agents and serve unlimited B2C customers. The platform scales with your business without additional charges based on user count.",
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer 24/7 technical support via email, phone, and WhatsApp. You'll also have a dedicated account manager for the first 30 days to ensure smooth onboarding. Regular training sessions are included.",
    },
    {
      question: "Can I customize the Hajj and Umrah package modules?",
      answer: "Yes! The Hajj and Umrah modules are fully customizable. You can create packages with different hotels in Makkah and Madinah, various transport options, visa processing, and group management features.",
    },
    {
      question: "What payment methods are supported?",
      answer: "We integrate with major payment gateways including Razorpay, PayU, CCAvenue, and PayPal. You can also offer credit terms to your B2B agents with a built-in credit management system.",
    },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-1 rounded-full mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? We've got answers. If you don't find what you're looking for, feel free to contact us.
          </p>
        </div>

        <div
          ref={accordionRef}
          className={`max-w-3xl mx-auto opacity-0 ${accordionVisible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.1s" }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-foreground">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still Have Questions CTA */}
        <div
          ref={ctaRef}
          className={`max-w-3xl mx-auto mt-12 opacity-0 ${ctaVisible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.2s" }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-accent/50 border-primary/20">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Still Have Questions?
                </h3>
                <p className="text-muted-foreground">
                  Our team is here to help. Reach out through any of these channels.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/919999999999?text=Hi,%20I'm%20interested%20in%20the%20NOMADORE%20travel%20portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">WhatsApp</span>
                  <span className="text-xs text-muted-foreground">Chat with us</span>
                </a>

                {/* Email */}
                <a
                  href="mailto:hello@nomadore.com"
                  className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">Email</span>
                  <span className="text-xs text-muted-foreground">hello@nomadore.com</span>
                </a>

                {/* Phone */}
                <a
                  href="tel:+919999999999"
                  className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">Call Us</span>
                  <span className="text-xs text-muted-foreground">+91 99999 99999</span>
                </a>
              </div>

              <div className="text-center">
                <Button size="lg" onClick={() => scrollToSection("#pricing")} className="group">
                  Get Started Today
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
