import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { usePlans } from "@/hooks/usePlans";

const StickyCTA = () => {
  const { plans, formatted, isLoading } = usePlans();
  const launchPlan = plans[0];
  const formattedBasePrice = formatted(launchPlan.basePrice);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (roughly 600px)
      const shouldShow = window.scrollY > 600;
      setIsVisible(shouldShow && !isDismissed);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 glass border-t border-white/10 shadow-lg animate-fade-in">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left - Message */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              Ready to launch your travel portal?
            </p>
            <p className="text-xs text-muted-foreground">
              Starting at just {isLoading ? "..." : `${formattedBasePrice}/year`}
            </p>
          </div>

          {/* Mobile Message */}
          <p className="sm:hidden text-sm font-medium text-foreground">
            Launch your portal today!
          </p>

          {/* Right - CTAs */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              asChild
              className="group"
            >
              <a href="/signup">
                Get Started
                <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyCTA;
