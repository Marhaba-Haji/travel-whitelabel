import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Map, Compass, MapPin, Building, Car, Home, Ticket, Plus, X } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const FAQ = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: accordionRef, isVisible: accordionVisible } = useScrollAnimation();

  const faqs = [
    {
      question: "How long does it take to set up my portal?",
      answer: "Most clients have their branded portal live within 2-3 business days. This includes domain setup, branding customization, and API integration. Our team provides full support throughout the process.",
    },
    {
      question: "Can I use my own domain name?",
      answer: "Absolutely! You can use your own custom domain (e.g., book.youragency.com). We'll help you set up the DNS and SSL certificate at no extra cost. Your customers will never see the marhabaDMC brand.",
    },
    {
      question: "What are contracted rates and how do they help me?",
      answer: "Contracted rates are special prices we've pre-negotiated with hotels and airlines. You get access to inventory at 5-10% lower than market rates, which means better prices for your customers and higher profit margins for you. This is a major competitive advantage that helps you win more deals.",
    },
    {
      question: "How does the AI Sales Assistant work?",
      answer: "The AI Sales Assistant is a multilingual chatbot and voicebot that handles customer inquiries 24/7. It speaks Hindi, English and more, answering questions and helping convert visitors into buyers even when you're asleep. It's billed on consumption basis (per conversation), so you only pay when it's actually helping customers — much cheaper than hiring a sales executive.",
    },
    {
      question: "What APIs are included in the platform?",
      answer: "The platform includes Flight API (Aggregators integration), Hotel API (1M+ properties), Visa Processing API (50+ countries), and Activities API (tours & experiences). All APIs are included in the annual subscription with no extra charges.",
    },
  ];

  const categories = [
    { name: "Tours Booking", icon: Map },
    { name: "Activities", icon: Compass },
    { name: "Destinations", icon: MapPin },
    { name: "Hotels Booking", icon: Building },
    { name: "Rental Car", icon: Car },
    { name: "Property", icon: Home },
    { name: "Tickets Booking", icon: Ticket },
  ];

  return (
    <section id="faq" className="py-24 relative bg-white overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 1200px' }}>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-10 right-0 w-96 h-96 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("/assets/map-pattern.png")', backgroundSize: 'cover' }}></div>
      <div className="absolute bottom-0 left-0 w-full h-48 opacity-[0.03] pointer-events-none bg-[url('https://placehold.co/1920x300/000000/transparent?text=Skyline')] bg-repeat-x bg-bottom"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={headerRef}
          className={`text-center mb-10 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <h2 className="font-poppins text-4xl md:text-5xl font-bold text-black mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            You need to come at least once in your life
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 max-w-4xl mx-auto">
          {categories.map((cat, idx) => (
            <button key={idx} className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:border-gray-300 transition-colors">
              <cat.icon className="w-4 h-4 text-gray-500" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* FAQ Accordion Box */}
        <div
          ref={accordionRef}
          className={`max-w-4xl mx-auto bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden opacity-0 ${accordionVisible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.1s" }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="group border-b border-gray-100 last:border-0 data-[state=open]:bg-[#F6F6F6] transition-colors"
              >
                <AccordionTrigger className="hover:no-underline px-6 md:px-10 py-6 [&>svg]:hidden">
                  <div className="flex items-center text-left w-full gap-6">
                    <span className="text-3xl md:text-4xl font-black text-black">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-lg md:text-xl font-bold text-black flex-1">
                      {faq.question}
                    </span>
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-md bg-gray-100 group-data-[state=open]:bg-black text-black group-data-[state=open]:text-white transition-colors">
                      <Plus className="w-5 h-5 group-data-[state=open]:hidden" />
                      <X className="w-5 h-5 hidden group-data-[state=open]:block" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 md:px-10 pb-8 pt-2">
                  <div className="pl-[3.5rem] md:pl-[4.5rem]">
                    <p className="text-gray-500 leading-relaxed text-sm md:text-base pr-8">
                      {faq.answer}
                    </p>
                  </div>
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
