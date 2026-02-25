import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useContactSettings } from "@/hooks/useContactSettings";

const STICKY_CTA_THRESHOLD = 600;
const STICKY_CTA_HEIGHT = 64; // approximate height of the StickyCTA bar in px

const FloatingWhatsApp = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stickyCTAVisible, setStickyCTAVisible] = useState(false);
  const { whatsappUrlWithMessage } = useContactSettings();
  const whatsappHref = whatsappUrlWithMessage("Hi, I'm interested in the travel portal");

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setIsVisible(scrolled > 300);
      setStickyCTAVisible(scrolled > STICKY_CTA_THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lift above StickyCTA when visible
  const bottomOffset = stickyCTAVisible ? `${STICKY_CTA_HEIGHT + 16}px` : "24px";

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      style={{ bottom: bottomOffset }}
      className={`fixed left-6 z-[60] flex items-center gap-2 bg-[#25D366] text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
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
