import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Plane, Building2, Car, Globe, TrendingDown, ArrowRight, CheckCircle2 } from "lucide-react";

const ContractedInventory = () => {
  const { ref, isVisible } = useScrollAnimation();

  const pillars = [
    {
      icon: Plane,
      title: "Airline Partnerships",
      description: "Seat allocations and negotiated fares with major carriers",
      metric: "50+",
      metricLabel: "Airlines",
    },
    {
      icon: Building2,
      title: "Hotel Partnerships",
      description: "Aligned with halal travel needs and expectations",
      metric: "1M+",
      metricLabel: "Properties",
    },
    {
      icon: Car,
      title: "Ground Services",
      description: "Destination support and local service providers",
      metric: "200+",
      metricLabel: "Destinations",
    },
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
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Global Inventory
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Contracted Global Inventory Access
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              marhabaDMC works to secure contracted and negotiated rates across key halal tourism destinations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className={`relative group opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
                <div className="relative bg-card border border-border rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                    <pillar.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{pillar.metric}</div>
                  <div className="text-sm text-muted-foreground mb-4">{pillar.metricLabel}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Partner Types */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center flex items-center justify-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Partner Network
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {partnerTypes.map((type, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Competitive Pricing Emphasis */}
          <div
            className={`bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 text-center mb-8 opacity-0 ${
              isVisible ? "animate-fade-in" : ""
            }`}
            style={{ animationDelay: "600ms" }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingDown className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Competitive Pricing Advantage</h3>
            </div>
            <p className="text-foreground text-lg font-medium max-w-3xl mx-auto mb-4">
              These rates enable agents to <span className="text-primary font-semibold">price competitively</span> while 
              maintaining margin discipline and predictability.
            </p>
            <p className="text-muted-foreground">
              Negotiated rates mean better margins for you and better prices for your customers.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" asChild>
              <a href="/signup">
                Get Partner Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContractedInventory;
