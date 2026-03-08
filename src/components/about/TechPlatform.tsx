import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Package, Settings, Users, Globe, ArrowRight } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

const PORTAL_GRADIENTS = [
  "from-aurora-blue to-aurora-teal",
  "from-aurora-purple to-aurora-blue",
  "from-aurora-teal to-emerald-500",
  "from-aurora-pink to-aurora-purple",
];

const TechPlatform = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: metricsRef, isVisible: metricsVisible } = useScrollAnimation();

  const portals = [
    { icon: Package, title: "Supplier Portal", description: "Inventory, rates, and service management" },
    { icon: Settings, title: "Admin Portal", description: "Pricing control, user management, reporting" },
    { icon: Users, title: "Agent Portal", description: "Sales, bookings, lead handling" },
    { icon: Globe, title: "B2C Portal", description: "Customer-facing booking under your brand" },
  ];

  const metrics = [
    { value: <AnimatedCounter end={99.9} suffix="%" />, label: "Uptime SLA" },
    { value: <><span>&lt;100</span><span className="text-lg">ms</span></>, label: "Response Time" },
    { value: "6 Days", label: "Support" },
    { value: "SSL", label: "Encrypted" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(210_100%_50%_/_0.05),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(320_90%_60%_/_0.04),_transparent_50%)]" />

      <div className="absolute top-10 right-20 w-60 h-60 bg-aurora-blue/7 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-aurora-purple/5 rounded-full blur-3xl pointer-events-none animate-pulse-soft" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-14">
            <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] glass px-4 py-1.5 rounded-full mb-5">
              Technology Platform
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              WhiteLabel Technology{" "}
              <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">
                Built for Agencies
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              At the core of marhabaDMC is a WhiteLabel technology platform designed specifically for travel agencies.
            </p>
          </div>

          {/* Platform Metrics */}
          <div
            ref={metricsRef}
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 opacity-0 ${metricsVisible ? "animate-fade-in" : ""}`}
          >
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`glass-card rounded-2xl p-4 text-center opacity-0 ${metricsVisible ? "animate-scale-in" : ""}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="text-2xl font-bold aurora-gradient-text animate-text-shimmer bg-[length:200%_auto] mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {portals.map((portal, index) => (
              <div
                key={portal.title}
                className={`group glass-card rounded-2xl p-6 hover:shadow-xl hover:border-white/20 transition-all duration-300 opacity-0 ${
                  isVisible ? "animate-scale-in" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${PORTAL_GRADIENTS[index]} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <portal.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg">{portal.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{portal.description}</p>
              </div>
            ))}
          </div>

          {/* Bottom Highlight */}
          <div className="glass-card rounded-2xl p-8 text-center mb-10">
            <p className="text-foreground text-lg max-w-3xl mx-auto">
              Each agency operates on its own{" "}
              <span className="font-semibold aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">branded ecosystem</span>{" "}
              while marhabaDMC powers the backend infrastructure.
            </p>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              asChild
              className="rounded-full px-8 bg-gradient-to-r from-aurora-blue via-primary to-aurora-blue bg-[length:200%_auto] animate-gradient-shift shadow-[0_0_30px_hsl(210_100%_50%_/_0.3)] hover:shadow-[0_0_40px_hsl(210_100%_50%_/_0.5)] transition-shadow"
            >
              <a href="#contact">
                Schedule Platform Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechPlatform;
