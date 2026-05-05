import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Plane,
  Building2,
  MessageSquare,
  CreditCard,
  Map,
  Globe,
  Palette,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  colorTheme: "blue" | "teal" | "purple" | "pink" | "orange";
};

const colorClasses: Record<Feature["colorTheme"], { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-500" },
  teal: { bg: "bg-teal-50", text: "text-teal-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-500" },
  pink: { bg: "bg-pink-50", text: "text-pink-500" },
  orange: { bg: "bg-orange-50", text: "text-orange-400" },
};

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const features: Feature[] = [
    {
      icon: Plane,
      title: "Flight API",
      description: "Access real-time flight inventory from global GDS systems. Book domestic & international flights with instant confirmation.",
      badge: "Popular",
      colorTheme: "blue",
    },
    {
      icon: Building2,
      title: "Hotel API",
      description: "Connect to 1M+ hotels worldwide. From budget stays to luxury resorts, offer your customers the best rates.",
      badge: "Popular",
      colorTheme: "teal",
    },
    {
      icon: MessageSquare,
      title: "AI Sales Executive",
      description: "Multilingual chatbot and voicebot that converts visitors 24/7. Like a sales team that never sleeps — at a fraction of the cost.",
      badge: "Add-on",
      colorTheme: "purple",
    },
    {
      icon: CreditCard,
      title: "Visa API",
      description: "Streamline visa processing for 100+ countries. Digital applications, document management, and status tracking.",
      colorTheme: "blue",
    },
    {
      icon: Map,
      title: "Activities API",
      description: "Tours, experiences, and local activities. Give your customers access to thousands of curated experiences.",
      colorTheme: "purple",
    },
    {
      icon: Globe,
      title: "Own Domain",
      description: "Use your own custom domain. Your brand, your identity. No marhabaDMC branding visible to your customers.",
      colorTheme: "pink",
    },
    {
      icon: Palette,
      title: "White-Label Branding",
      description: "Complete customization with your logo, and available design themes. Make it truly yours with essential branding control.",
      colorTheme: "orange",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#FAFAFC] w-full">
      {/* Decorative Line Art Background at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-48 opacity-[0.04] pointer-events-none bg-[url('https://placehold.co/1920x300/000000/transparent?text=Skyline')] bg-repeat-x bg-bottom z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 relative opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block bg-cyan-50 text-cyan-600 font-bold tracking-wide text-xs px-4 py-1.5 rounded-full mb-4">
            COMPLETE API SUITE
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">
            COMPLETE API Suite
          </h2>
          <p className="text-gray-500 text-lg">
            Your integrated platform for travel business operations.
          </p>

          {/* Decorative Flight Path on Desktop */}
          <div className="hidden lg:block absolute top-0 right-10 w-64 h-32 opacity-40 pointer-events-none bg-[url('https://placehold.co/400x200/transparent/000000?text=Flight+Path')] bg-no-repeat bg-right mix-blend-multiply" style={{ backgroundImage: 'url("/assets/flight-path.svg")' }}></div>
        </div>

        {/* 3 Top / 4 Bottom Grid Layout */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6"
        >
          {features.map((feature, index) => {
            // Indices 0,1,2 (Top 3) span 4 cols each (4x3 = 12)
            // Indices 3,4,5,6 (Bottom 4) span 3 cols each (3x4 = 12)
            const isTopRow = index < 3;
            const colSpanClass = isTopRow ? "lg:col-span-4" : "lg:col-span-3";
            const theme = colorClasses[feature.colorTheme];

            return (
              <article
                key={feature.title}
                className={cn(
                  "group relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
                  "p-8 flex flex-col transition-all duration-300 motion-safe:hover:-translate-y-1 opacity-0",
                  colSpanClass,
                  gridVisible && "animate-scale-in"
                )}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Icon & Badge Row */}
                <div className="flex items-start justify-between mb-6">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3", theme.bg)}>
                    <feature.icon className={cn("w-6 h-6", theme.text)} strokeWidth={2} />
                  </div>
                  {feature.badge && (
                    <Badge className="bg-cyan-50 hover:bg-cyan-50 text-cyan-600 border-0 shadow-none font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      {feature.badge}
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
        
      </div>
    </section>
  );
};

export default Features;
