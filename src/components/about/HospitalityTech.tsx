import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Building, BedDouble, TrendingUp, Settings, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

import { getAuroraGradient } from "@/lib/design-tokens";

const HospitalityTech = () => {
  const { ref, isVisible } = useScrollAnimation();

  const audiences = [
    { name: "Hotels", icon: Building },
    { name: "Lodges", icon: BedDouble },
    { name: "Small & Mid-sized Operators", icon: Settings },
  ];

  const capabilities = [
    { icon: BedDouble, text: "Manage room inventory and bookings" },
    { icon: TrendingUp, text: "Improve occupancy rates" },
    { icon: Settings, text: "Optimise pricing and revenue" },
    { icon: Building, text: "Streamline operational workflows" },
  ];

  const features = [
    "Real-time inventory management",
    "Automated booking system",
    "Revenue optimization tools",
    "Guest communication platform",
    "Halal compliance tracking",
    "Multi-property management",
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(320_90%_60%_/_0.04),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-full px-4 py-1.5 mb-5">
                <div className="w-2 h-2 rounded-full bg-aurora-pink animate-pulse-soft" />
                <span className="text-xs font-semibold text-aurora-pink uppercase tracking-[0.2em]">
                  Coming Soon
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Hospitality{" "}
                <span className="aurora-gradient-text-static">
                  Technology
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                marhabaDMC is expanding into hospitality operations with a dedicated room
                and lodge management SaaS platform.
              </p>
            </div>

            {/* Launch Timeline */}
            <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-6 mb-14 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-aurora-purple to-aurora-blue flex items-center justify-center shadow-lg">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Expected Launch: Q4 2026</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Join our waitlist to be among the first to access this revolutionary platform
              </p>
            </div>

            {/* Target Audience */}
            <div className="flex flex-wrap justify-center gap-4 mb-14">
              {audiences.map((audience) => (
                <div
                  key={audience.name}
                  className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-full px-5 py-2.5 hover-surface-chip transition-all"
                >
                  <audience.icon className="w-4 h-4 text-aurora-teal" />
                  <span className="text-foreground text-sm font-medium">{audience.name}</span>
                </div>
              ))}
            </div>

            {/* Capabilities Preview */}
            <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-8 mb-8">
              <h3 className="font-bold text-foreground text-center mb-6 text-lg">
                Platform Capabilities
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {capabilities.map((cap, index) => (
                  <div
                    key={cap.text}
                    className={`group flex items-center gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-xl hover-surface-chip transition-all opacity-0 ${
                      isVisible ? "animate-scale-in" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAuroraGradient(index)} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <cap.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-foreground text-sm">{cap.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature List */}
            <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">Key Features</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-aurora-teal flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision Note */}
            <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-6 mb-10">
              <p className="text-foreground text-center font-medium">
                This product is being built to complement the halal tourism ecosystem
                by strengthening the supply side.
              </p>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                asChild
                className="rounded-full px-8 bg-gradient-to-r from-aurora-purple via-aurora-blue to-aurora-purple shadow-[0_0_20px_hsl(270_60%_58%_/_0.2)] hover:shadow-[0_0_30px_hsl(270_60%_58%_/_0.3)] transition-shadow"
              >
                <a href="/contact">
                  Request Early Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalityTech;
