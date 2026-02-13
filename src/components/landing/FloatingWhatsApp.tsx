import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useContactSettings } from "@/hooks/useContactSettings";

const FloatingWhatsApp = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { whatsappUrlWithMessage } = useContactSettings();
  const whatsappHref = whatsappUrlWithMessage("Hi, I'm interested in the travel portal");

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 fill-current" />
      <span className="font-medium hidden sm:inline">Chat with us</span>
    </a>
  );
};

export default FloatingWhatsApp;
