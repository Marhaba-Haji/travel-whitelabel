import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Plane, Building2, Car, Globe, TrendingDown, ArrowRight, CheckCircle2 } from "lucide-react";

import { getAuroraGradient } from "@/lib/design-tokens";

const ContractedInventory = () => {
  const { ref, isVisible } = useScrollAnimation();

  const pillars = [
    { icon: Plane, title: "Airline Partnerships", description: "Seat allocations and negotiated fares with major carriers", metric: "50+", metricLabel: "Airlines" },
    { icon: Building2, title: "Hotel Partnerships", description: "Aligned with halal travel needs and expectations", metric: "1M+", metricLabel: "Properties" },
    { icon: Car, title: "Ground Services", description: "Destination support and local service providers", metric: "200+", metricLabel: "Destinations" },
  ];

  const partnerTypes = [
    "Major Airlines",
    "Halal-Certified Hotels",
    "Local Tour Operators",
    "Transportation Providers",
    "Restaurant Partners",
    "Activity Providers",
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(210_100%_50%_/_0.05),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-14">
            <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] bg-white border border-gray-100 shadow-sm px-4 py-1.5 rounded-full mb-5">
              Global Inventory
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Contracted Global{" "}
              <span className="aurora-gradient-text-static">
                Inventory Access
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              marhabaDMC works to secure contracted and negotiated rates across key halal tourism destinations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-14">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className={`group rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-8 text-center hover-surface-card transition-all duration-300 opacity-0 ${isVisible ? "animate-scale-in" : ""}`}
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getAuroraGradient(index)} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <pillar.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold aurora-gradient-text animate-text-shimmer bg-[length:200%_auto] mb-1">{pillar.metric}</div>
                <div className="text-sm text-muted-foreground mb-4">{pillar.metricLabel}</div>
                <h3 className="text-xl font-bold text-foreground mb-3">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>

          {/* Partner Types */}
          <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-8 mb-14">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center flex items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-aurora-blue to-aurora-teal flex items-center justify-center shadow-lg">
                <Globe className="w-4 h-4 text-white" />
              </div>
              Partner Network
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {partnerTypes.map((type, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-white border border-gray-100 shadow-sm rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-aurora-teal flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Competitive Pricing Emphasis */}
          <div
            className={`rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-8 text-center mb-10 opacity-0 ${
              isVisible ? "animate-fade-in" : ""
            }`}
            style={{ animationDelay: "600ms" }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-teal to-emerald-500 flex items-center justify-center shadow-lg">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Competitive Pricing Advantage</h3>
            </div>
            <p className="text-foreground text-lg font-medium max-w-3xl mx-auto mb-4">
              These rates enable agents to{" "}
              <span className="aurora-gradient-text-static font-semibold">price competitively</span>{" "}
              while maintaining margin discipline and predictability.
            </p>
            <p className="text-muted-foreground">
              Negotiated rates mean better margins for you and better prices for your customers.
            </p>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              asChild
              className="rounded-full px-8 bg-gradient-to-r from-aurora-blue via-primary to-aurora-blue shadow-[0_0_20px_hsl(210_100%_50%_/_0.2)] hover:shadow-[0_0_30px_hsl(210_100%_50%_/_0.3)] transition-shadow"
            >
              <Link to="/signup">
                Get Partner Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContractedInventory;
