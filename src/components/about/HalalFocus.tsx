import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Globe, Map, Heart, CheckCircle2, TrendingUp, Shield, ArrowRight } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

import { getAuroraGradient } from "@/lib/design-tokens";

const HalalFocus = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: whyRef, isVisible: whyVisible } = useScrollAnimation();

  const focusAreas = [
    { icon: Globe, title: "Global Destinations", description: "Halal tourism-focused destinations globally, curated for Muslim travellers", metric: "200+", metricLabel: "Destinations" },
    { icon: Map, title: "Itinerary Curation", description: "Domestic and international itinerary curation aligned with halal travel expectations", metric: "1000+", metricLabel: "Itineraries" },
    { icon: Heart, title: "Ethical Selection", description: "Supplier and service selection that respects religious, cultural, and ethical considerations", metric: "100%", metricLabel: "Compliant" },
  ];

  const complianceChecklist = [
    "Halal-certified dining options",
    "Prayer facilities availability",
    "Gender-segregated amenities",
    "Alcohol-free accommodations",
    "Cultural sensitivity training",
    "Religious site access",
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(270_70%_58%_/_0.05),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`text-center mb-12 opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] bg-white border border-gray-100 shadow-sm px-4 py-1.5 rounded-full mb-5">
            End-to-End Halal Tourism
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Our Focus:{" "}
            <span className="aurora-gradient-text-static">
              Halal Tourism
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Halal tourism is not simply about destinations—it is about criteria, confidence, and consistency.
          </p>
        </div>

        {/* Market Size Stat */}
        <div className="max-w-2xl mx-auto mb-14">
          <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-6">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-teal to-emerald-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold aurora-gradient-text-static mb-1">
                  $238<span className="text-xl">B</span>
                </div>
                <div className="text-sm text-muted-foreground">Global Halal Tourism Market Size</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold aurora-gradient-text-static mb-1">
                  <AnimatedCounter end={25} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">Annual Growth Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {focusAreas.map((area, index) => (
            <div
              key={area.title}
              className={`group rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-6 text-center hover-surface-card transition-all duration-300 opacity-0 ${
                isVisible ? "animate-scale-in" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAuroraGradient(index)} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <area.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-2xl font-bold aurora-gradient-text-static mb-1">{area.metric}</div>
              <div className="text-xs text-muted-foreground mb-3">{area.metricLabel}</div>
              <h3 className="text-lg font-bold text-foreground mb-3">{area.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{area.description}</p>
            </div>
          ))}
        </div>

        {/* Why Halal Matters */}
        <div
          ref={whyRef}
          className={`grid lg:grid-cols-2 gap-5 mb-14 opacity-0 ${whyVisible ? "animate-fade-in" : ""}`}
        >
          <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-aurora-purple to-aurora-blue flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              Why Halal Matters
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Halal tourism represents more than dietary requirements—it's about creating travel experiences
              that respect religious values, cultural sensitivities, and ethical considerations. For millions
              of Muslim travelers worldwide, halal compliance ensures peace of mind and authentic experiences.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              marhabaDMC ensures every destination, itinerary, and service provider meets rigorous halal
              standards, giving travel agents confidence to sell and travelers confidence to book.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-aurora-teal to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              Halal Compliance Checklist
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {complianceChecklist.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-teal flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Description Box */}
        <div
          className={`text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "500ms" }}
        >
          <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-8 max-w-4xl mx-auto">
            <p className="text-foreground text-lg font-medium mb-4">
              Every itinerary, product, and content asset is designed to meet the expectations of
              halal-conscious travellers—while remaining commercially viable for agents.
            </p>
            <p className="text-muted-foreground">
              We bridge the gap between religious compliance and business success, ensuring your
              offerings resonate with Muslim travelers while driving profitability.
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Button
            size="lg"
            asChild
            className="rounded-full px-8 bg-gradient-to-r from-aurora-blue via-primary to-aurora-blue shadow-[0_0_20px_hsl(210_100%_50%_/_0.2)] hover:shadow-[0_0_30px_hsl(210_100%_50%_/_0.3)] transition-shadow"
          >
            <a href="/contact">
              Learn More About Our Halal Standards
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HalalFocus;
