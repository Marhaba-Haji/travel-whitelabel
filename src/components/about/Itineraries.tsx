import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Compass, Settings, BarChart3 } from "lucide-react";

const Itineraries = () => {
  const { ref, isVisible } = useScrollAnimation();

  const features = [
    {
      icon: Users,
      title: "Group & Individual",
      description: "Designed for both group travel experiences and individual journeys",
    },
    {
      icon: Compass,
      title: "Purpose-Driven",
      description: "Suitable for religious, leisure, and purpose-driven journeys",
    },
    {
      icon: Settings,
      title: "Operational Ready",
      description: "Built with operational feasibility in mind from day one",
    },
    {
      icon: BarChart3,
      title: "Market Adaptable",
      description: "Adaptable to different market segments and price categories",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Curated Itineraries, Built for Scale
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nomadore curates structured travel itineraries that agents can confidently sell and scale.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={`border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 opacity-0 ${
                  isVisible ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Agent Benefits Callout */}
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                Agent Advantage
              </span>
            </div>
            <p className="text-foreground text-lg font-medium max-w-2xl mx-auto">
              Agents gain access to ready-to-sell itineraries while retaining full control 
              over branding and pricing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Itineraries;
