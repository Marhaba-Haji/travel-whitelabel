import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  ArrowUpRight,
  Check,
  Plane,
  BedDouble,
  Bot,
  StampIcon,
  Compass,
  Globe2,
  Palette,
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
};

const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty("--mx", `${x}%`);
  e.currentTarget.style.setProperty("--my", `${y}%`);
};

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const hero: Feature & { bullets: string[] } = {
    icon: Plane,
    title: "Flight API",
    description:
      "Access real-time flight inventory from global GDS systems. Book domestic and international flights with instant confirmation.",
    badge: "Popular",
    gradient: getAuroraGradient(0),
    bullets: ["Global GDS coverage", "Instant ticketing", "Domestic + international"],
  };

  const sideFeatures: Feature[] = [
    {
      icon: BedDouble,
      title: "Hotel API",
      description:
        "Connect to 1M+ hotels worldwide. From budget stays to luxury resorts, offer your customers the best rates.",
      badge: "Popular",
      gradient: getAuroraGradient(1),
    },
    {
      icon: Bot,
      title: "AI Sales Executive",
      description:
        "Multilingual chatbot and voicebot that converts visitors 24/7. Like a sales team that never sleeps — at a fraction of the cost.",
      badge: "Add-on",
      gradient: getAuroraGradient(2),
    },
  ];

  const bottomFeatures: Feature[] = [
    {
      icon: StampIcon,
      title: "Visa API",
      description:
        "Streamlined visa processing for 100+ countries. Digital applications, document management, and status tracking.",
      gradient: getAuroraGradient(0),
    },
    {
      icon: Compass,
      title: "Activities API",
      description:
        "Tours, experiences, and local activities. Give your customers access to thousands of curated experiences.",
      gradient: getAuroraGradient(1),
    },
    {
      icon: Globe2,
      title: "Own Domain",
      description:
        "Use your own custom domain. Your brand, your identity. No marhabaDMC branding visible to your customers.",
      gradient: getAuroraGradient(2),
    },
    {
      icon: Palette,
      title: "White-Label Branding",
      description:
        "Complete customization with your logo, and available design themes. Make it truly yours with essential branding control.",
      gradient: getAuroraGradient(0),
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

        {/* Bento grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {/* Featured Flight card — spans 2 cols x 2 rows on lg */}
          <article
            onMouseMove={handleMouseMove}
            className={cn(
              "group relative overflow-hidden rounded-3xl glass-card hover-surface-card feature-card-glow",
              "p-8 lg:p-10 lg:col-span-2 lg:row-span-2 min-h-[340px] lg:min-h-[460px]",
              "transition-all duration-500 motion-safe:hover:-translate-y-1 opacity-0",
              gridVisible && "animate-scale-in",
            )}
            style={{ animationDelay: "0s" }}
          >
            {/* Layered aurora background */}
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 opacity-[0.08] bg-gradient-to-br pointer-events-none",
                hero.gradient,
              )}
            />
            <div aria-hidden className="absolute inset-0 bg-grid-faint opacity-40 pointer-events-none" />
            <div
              aria-hidden
              className={cn(
                "absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-30 bg-gradient-to-br pointer-events-none",
                hero.gradient,
              )}
            />

            <div className="relative flex flex-col h-full">
              {/* Top row: live pill + arrow */}
              <div className="flex items-start justify-between mb-8">
                <div className="inline-flex items-center gap-2 glass rounded-full pl-2.5 pr-3.5 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-medium text-foreground/80">Live inventory</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-foreground" />
              </div>

              {/* Icon with orbiting dots */}
              <div className="relative w-24 h-24 mb-6">
                <div
                  className={cn(
                    "absolute inset-0 rounded-3xl bg-gradient-to-br p-[1.5px]",
                    hero.gradient,
                  )}
                >
                  <div className="w-full h-full rounded-3xl glass flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <img
                      src={hero.icon}
                      alt={hero.title}
                      className="w-16 h-16 object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
                {/* Orbiting dots */}
                <span
                  aria-hidden
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-aurora-blue motion-safe:animate-orbit-slow"
                />
                <span
                  aria-hidden
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-aurora-teal motion-safe:animate-orbit-medium"
                  style={{ animationDelay: "-2s" }}
                />
                <span
                  aria-hidden
                  className="absolute top-1/2 left-1/2 w-1 h-1 -ml-[2px] -mt-[2px] rounded-full bg-aurora-purple motion-safe:animate-orbit-fast"
                  style={{ animationDelay: "-1s" }}
                />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground">{hero.title}</h3>
                {hero.badge && (
                  <Badge className="text-[10px] bg-aurora-teal/10 text-aurora-teal border-aurora-teal/25 px-2 py-0">
                    {hero.badge}
                  </Badge>
                )}
              </div>
              <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-md">
                {hero.description}
              </p>

              <ul className="space-y-2 mb-6">
                {hero.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className={cn("flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br", hero.gradient)}>
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground group-hover:gap-2.5 transition-all duration-300">
                  Explore Flight API
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </article>

          {/* Side stack — Hotel + AI Sales */}
          {sideFeatures.map((feature, index) => (
            <article
              key={feature.title}
              onMouseMove={handleMouseMove}
              className={cn(
                "group relative overflow-hidden rounded-3xl glass-card hover-surface-card feature-card-glow",
                "p-6 min-h-[220px] transition-all duration-500 motion-safe:hover:-translate-y-1 opacity-0",
                gridVisible && "animate-scale-in",
              )}
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <div
                aria-hidden
                className={cn(
                  "absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 bg-gradient-to-br pointer-events-none",
                  feature.gradient,
                )}
              />

              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("rounded-2xl bg-gradient-to-br p-[1.5px]", feature.gradient)}>
                    <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <img src={feature.icon} alt={feature.title} className="w-9 h-9 object-contain" loading="lazy" />
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-foreground" />
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                  {feature.badge && (
                    <Badge className="text-[10px] bg-aurora-teal/10 text-aurora-teal border-aurora-teal/25 px-2 py-0">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom row — 4 equal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bottomFeatures.map((feature, index) => (
            <article
              key={feature.title}
              onMouseMove={handleMouseMove}
              className={cn(
                "group relative overflow-hidden rounded-2xl glass-card hover-surface-card feature-card-glow",
                "p-5 min-h-[200px] transition-all duration-500 motion-safe:hover:-translate-y-1 opacity-0",
                gridVisible && "animate-scale-in",
              )}
              style={{ animationDelay: `${(index + 3) * 0.08}s` }}
            >
              <div
                aria-hidden
                className={cn(
                  "absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-25 bg-gradient-to-br pointer-events-none",
                  feature.gradient,
                )}
              />

              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("rounded-2xl bg-gradient-to-br p-[1.5px]", feature.gradient)}>
                    <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <img src={feature.icon} alt={feature.title} className="w-7 h-7 object-contain" loading="lazy" />
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-foreground" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
