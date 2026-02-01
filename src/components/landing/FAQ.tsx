import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "How long does it take to set up my portal?",
      answer: "Most clients have their branded portal live within 2-3 business days. This includes domain setup, branding customization, and API integration. Our team provides full support throughout the process.",
    },
    {
      question: "Can I use my own domain name?",
      answer: "Absolutely! You can use your own custom domain (e.g., book.youragency.com). We'll help you set up the DNS and SSL certificate at no extra cost. Your customers will never see the Facelyft brand.",
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

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? We've got answers. If you don't find what you're looking for, feel free to contact us.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
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
      </div>
    </section>
  );
};

export default FAQ;
