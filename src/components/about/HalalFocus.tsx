import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Map, Heart, CheckCircle2, TrendingUp, Shield, ArrowRight } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

const HalalFocus = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: whyRef, isVisible: whyVisible } = useScrollAnimation();

  const focusAreas = [
    {
      icon: Globe,
      title: "Global Destinations",
      description: "Halal tourism-focused destinations globally, curated for Muslim travellers",
      metric: "200+",
      metricLabel: "Destinations",
    },
    {
      icon: Map,
      title: "Itinerary Curation",
      description: "Domestic and international itinerary curation aligned with halal travel expectations",
      metric: "1000+",
      metricLabel: "Itineraries",
    },
    {
      icon: Heart,
      title: "Ethical Selection",
      description: "Supplier and service selection that respects religious, cultural, and ethical considerations",
      metric: "100%",
      metricLabel: "Compliant",
    },
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
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`text-center mb-12 opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              End-to-End Halal Tourism
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Focus: Halal Tourism
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Halal tourism is not simply about destinations—it is about criteria, confidence, and consistency.
          </p>
        </div>

        {/* Market Size Stat */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  $238<span className="text-xl">B</span>
                </div>
                <div className="text-sm text-muted-foreground">Global Halal Tourism Market Size</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  <AnimatedCounter end={25} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">Annual Growth Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {focusAreas.map((area, index) => (
            <Card
              key={area.title}
              className={`border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 opacity-0 ${
                isVisible ? "animate-fade-in" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <area.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-2">{area.metric}</div>
                <div className="text-xs text-muted-foreground mb-3">{area.metricLabel}</div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {area.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {area.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why Halal Matters */}
        <div
          ref={whyRef}
          className={`grid lg:grid-cols-2 gap-8 mb-12 opacity-0 ${whyVisible ? "animate-fade-in" : ""}`}
        >
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Why Halal Matters
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Halal tourism represents more than dietary requirements—it's about creating travel experiences 
              that respect religious values, cultural sensitivities, and ethical considerations. For millions 
              of Muslim travelers worldwide, halal compliance ensures peace of mind and authentic experiences.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nomadore ensures every destination, itinerary, and service provider meets rigorous halal 
              standards, giving travel agents confidence to sell and travelers confidence to book.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              Halal Compliance Checklist
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {complianceChecklist.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
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
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-8 border border-primary/20 max-w-4xl mx-auto">
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

        {/* CTA */}
        <div className="text-center mt-8">
          <Button size="lg" asChild>
            <a href="#contact">
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
