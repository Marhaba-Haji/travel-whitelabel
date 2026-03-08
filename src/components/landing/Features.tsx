import { Badge } from "@/components/ui/badge";
import { Plane, Hotel, FileText, MapPin, Globe, Palette, BadgeCheck, Bot } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const features = [
    {
      icon: Plane,
      title: "Flight API",
      description: "Access real-time flight inventory from global GDS systems. Book domestic and international flights with instant confirmation.",
      iconBg: "from-aurora-blue to-aurora-teal",
      highlight: true,
      badge: "Popular",
    },
    {
      icon: Hotel,
      title: "Hotel API",
      description: "Connect to 1M+ hotels worldwide. From budget stays to luxury resorts, offer your customers the best rates.",
      iconBg: "from-aurora-teal to-emerald-500",
      highlight: true,
      badge: "Popular",
    },
    {
      icon: Bot,
      title: "AI Sales Executive",
      description: "Multilingual chatbot and voicebot that converts visitors 24/7. Like a sales team that never sleeps — at a fraction of the cost.",
      iconBg: "from-aurora-purple to-aurora-pink",
      highlight: true,
      badge: "Add-on",
    },
    {
      icon: FileText,
      title: "Visa API",
      description: "Streamlined visa processing for 100+ countries. Digital applications, document management, and status tracking.",
      iconBg: "from-aurora-blue/80 to-aurora-purple/60",
    },
    {
      icon: MapPin,
      title: "Activities API",
      description: "Tours, experiences, and local activities. Give your customers access to thousands of curated experiences.",
      iconBg: "from-aurora-teal/80 to-aurora-blue/60",
    },
    {
      icon: Globe,
      title: "Own Domain",
      description: "Use your own custom domain. Your brand, your identity. No marhabaDMC branding visible to your customers.",
      iconBg: "from-aurora-purple/70 to-aurora-blue/50",
    },
    {
      icon: Palette,
      title: "White-Label Branding",
      description: "Complete customization with your logo, and available design themes. Make it truly yours with essential branding control.",
      iconBg: "from-aurora-pink/70 to-aurora-purple/50",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(270_70%_58%_/_0.05),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(210_100%_50%_/_0.04),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] glass px-4 py-1.5 rounded-full mb-5">
            Complete API Suite
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
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
                className={`group glass-card rounded-2xl p-6 hover:shadow-xl hover:border-white/20 transition-all duration-300 opacity-0 ${gridVisible ? "animate-scale-in" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
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
                className={`group glass-card rounded-2xl p-5 hover:shadow-2xl hover:border-white/20 transition-all duration-300 opacity-0 ${gridVisible ? "animate-scale-in" : ""}`}
                style={{ animationDelay: `${(index + 3) * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
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
