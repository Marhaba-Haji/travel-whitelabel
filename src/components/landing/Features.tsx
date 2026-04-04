import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

import flightIcon from "@/assets/icons/flight-api.png";
import hotelIcon from "@/assets/icons/hotel-api.png";
import aiBotIcon from "@/assets/icons/ai-bot.png";
import visaIcon from "@/assets/icons/visa-api.png";
import activitiesIcon from "@/assets/icons/activities-api.png";
import domainIcon from "@/assets/icons/own-domain.png";
import whiteLabelIcon from "@/assets/icons/white-label.png";

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const features = [
    {
      icon: flightIcon,
      title: "Flight API",
      description: "Access real-time flight inventory from global GDS systems. Book domestic and international flights with instant confirmation.",
      highlight: true,
      badge: "Popular",
    },
    {
      icon: hotelIcon,
      title: "Hotel API",
      description: "Connect to 1M+ hotels worldwide. From budget stays to luxury resorts, offer your customers the best rates.",
      highlight: true,
      badge: "Popular",
    },
    {
      icon: aiBotIcon,
      title: "AI Sales Executive",
      description: "Multilingual chatbot and voicebot that converts visitors 24/7. Like a sales team that never sleeps — at a fraction of the cost.",
      highlight: true,
      badge: "Add-on",
    },
    {
      icon: visaIcon,
      title: "Visa API",
      description: "Streamlined visa processing for 100+ countries. Digital applications, document management, and status tracking.",
    },
    {
      icon: activitiesIcon,
      title: "Activities API",
      description: "Tours, experiences, and local activities. Give your customers access to thousands of curated experiences.",
    },
    {
      icon: domainIcon,
      title: "Own Domain",
      description: "Use your own custom domain. Your brand, your identity. No marhabaDMC branding visible to your customers.",
    },
    {
      icon: whiteLabelIcon,
      title: "White-Label Branding",
      description: "Complete customization with your logo, and available design themes. Make it truly yours with essential branding control.",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(270_70%_58%_/_0.05),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] glass px-4 py-1.5 rounded-full mb-5">
            Complete API Suite
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            COMPLETE API Suite
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your integrated platform for travel business operations.
          </p>
        </div>

        {/* Feature cards — top row: 3 cols, bottom row: 4 cols */}
        <div ref={gridRef}>
          {/* Top row — highlighted cards */}
          <div className="grid md:grid-cols-3 gap-5 mb-5">
            {features.slice(0, 3).map((feature, index) => (
              <div
                key={feature.title}
                className={`group glass-card rounded-2xl p-6 hover-surface-card transition-all duration-300 opacity-0 ${gridVisible ? "animate-scale-in" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <img src={feature.icon} alt={feature.title} className="w-full h-full object-contain" loading="lazy" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                  {feature.badge && (
                    <Badge className="text-[10px] bg-aurora-teal/10 text-aurora-teal border-aurora-teal/25 px-2 py-0">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Bottom row — 4 cols */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {features.slice(3).map((feature, index) => (
              <div
                key={feature.title}
                className={`group glass-card rounded-2xl p-5 hover-surface-card transition-all duration-300 opacity-0 ${gridVisible ? "animate-scale-in" : ""}`}
                style={{ animationDelay: `${(index + 3) * 0.1}s` }}
              >
                <div className="w-14 h-14 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <img src={feature.icon} alt={feature.title} className="w-full h-full object-contain" loading="lazy" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
