import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  ArrowUpRight,
  Plane,
  Hotel,
  Bot,
  ScrollText,
  MountainSnow,
  Globe,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { getAuroraGradient } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  gradient: string;
  /** Accent color token used for highlight pill + badge */
  accent: "teal" | "purple" | "blue";
};

const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty("--mx", `${x}%`);
  e.currentTarget.style.setProperty("--my", `${y}%`);
};

const accentClasses: Record<
  Feature["accent"],
  { badge: string; chip: string; chipBg: string }
> = {
  teal: {
    badge: "bg-aurora-teal/10 text-aurora-teal border-aurora-teal/25",
    chip: "text-aurora-teal",
    chipBg: "bg-aurora-teal/10 border-aurora-teal/20",
  },
  purple: {
    badge: "bg-aurora-purple/10 text-aurora-purple border-aurora-purple/25",
    chip: "text-aurora-purple",
    chipBg: "bg-aurora-purple/10 border-aurora-purple/20",
  },
  blue: {
    badge: "bg-aurora-blue/10 text-aurora-blue border-aurora-blue/25",
    chip: "text-aurora-blue",
    chipBg: "bg-aurora-blue/10 border-aurora-blue/20",
  },
};

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const features: (Feature & { highlight?: string })[] = [
    {
      icon: Plane,
      title: "Flight API",
      description:
        "Real-time flight inventory from global GDS systems. Book domestic and international with instant confirmation.",
      badge: "Popular",
      gradient: getAuroraGradient(0),
      accent: "teal",
      highlight: "Global GDS",
    },
    {
      icon: Hotel,
      title: "Hotel API",
      description:
        "Connect to over 1M hotels worldwide — from budget stays to luxury resorts at the best negotiated rates.",
      badge: "Popular",
      gradient: getAuroraGradient(1),
      accent: "purple",
      highlight: "1M+ properties",
    },
    {
      icon: Bot,
      title: "AI Sales Executive",
      description:
        "Multilingual chat and voice bot that converts visitors 24/7 — like a sales team that never sleeps.",
      badge: "Add-on",
      gradient: getAuroraGradient(2),
      accent: "teal",
      highlight: "24/7 conversion",
    },
    {
      icon: ScrollText,
      title: "Visa API",
      description:
        "Streamlined visa processing for 100+ countries. Digital applications, document management and live status tracking.",
      gradient: getAuroraGradient(0),
      accent: "blue",
      highlight: "100+ countries",
    },
    {
      icon: MountainSnow,
      title: "Activities API",
      description:
        "Curated tours, experiences and local activities. Give customers access to thousands of bookable adventures.",
      gradient: getAuroraGradient(1),
      accent: "purple",
      highlight: "Tours & experiences",
    },
    {
      icon: Globe,
      title: "Own Domain",
      description:
        "Use your own custom domain. Your brand, your identity — no marhabaDMC branding shown to customers.",
      gradient: getAuroraGradient(2),
      accent: "teal",
      highlight: "Your brand",
    },
    {
      icon: Sparkles,
      title: "White-Label Branding",
      description:
        "Complete customization with your logo and design themes. Essential branding control to make the platform truly yours.",
      gradient: getAuroraGradient(0),
      accent: "blue",
      highlight: "Fully themable",
    },
  ];

  const stats = [
    { value: "7", label: "APIs" },
    { value: "100+", label: "countries" },
    { value: "1M+", label: "hotels" },
    { value: "24/7", label: "AI agent" },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(270_70%_58%_/_0.05),_transparent_50%)]" />
      <div
        aria-hidden
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-aurora-purple/15 blur-3xl motion-safe:animate-float-slow pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-aurora-teal/15 blur-3xl motion-safe:animate-float-slow pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`text-center mb-14 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block aurora-gradient-text font-semibold text-xs uppercase tracking-[0.25em] glass px-4 py-1.5 rounded-full mb-5 motion-safe:animate-text-shimmer">
            Complete API Suite
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 max-w-3xl mx-auto leading-tight">
            Everything you need to run a{" "}
            <span className="aurora-gradient-text motion-safe:animate-text-shimmer">modern travel business</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            One integrated platform — flights, hotels, visas, activities and an AI sales agent that never sleeps.
          </p>

          {/* Stats strip */}
          <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 glass rounded-full px-6 py-2.5">
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="font-display font-bold text-foreground text-base">{s.value}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
                {i < stats.length - 1 && <span className="text-foreground/20 ml-2">•</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Unified grid — 7 equal-weight cards (4 + 3 centered on lg) */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5"
        >
          {features.map((feature, index) => {
            // Bottom 3 cards (indices 4,5,6) span 4 cols each on lg → 4-3 layout
            const isBottomRow = index >= 4;
            const colSpanClass = isBottomRow
              ? "lg:col-span-4"
              : "lg:col-span-3";
            const accent = accentClasses[feature.accent];
            return (
              <article
                key={feature.title}
                onMouseMove={handleMouseMove}
                className={cn(
                  "group relative overflow-hidden rounded-2xl glass-card hover-surface-card feature-card-glow",
                  "p-6 min-h-[230px] flex transition-all duration-500 motion-safe:hover:-translate-y-1 opacity-0",
                  colSpanClass,
                  gridVisible && "animate-scale-in",
                )}
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <div
                  aria-hidden
                  className={cn(
                    "absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-30 bg-gradient-to-br pointer-events-none transition-opacity duration-500 group-hover:opacity-50",
                    feature.gradient,
                  )}
                />

                <div className="relative flex flex-col h-full w-full">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3",
                        feature.gradient,
                      )}
                    >
                      <feature.icon
                        aria-label={feature.title}
                        className="w-7 h-7 text-white"
                        strokeWidth={2}
                      />
                    </div>
                    {feature.badge && (
                      <Badge className={cn("text-[10px] px-2 py-0.5 font-semibold", accent.badge)}>
                        {feature.badge}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  <div className="mt-auto pt-3 flex items-center justify-between border-t-surface">
                    {feature.highlight && (
                      <span
                        className={cn(
                          "inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                          accent.chip,
                          accent.chipBg,
                        )}
                      >
                        {feature.highlight}
                      </span>
                    )}
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
