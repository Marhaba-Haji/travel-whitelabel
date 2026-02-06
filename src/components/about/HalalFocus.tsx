import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Map, Heart } from "lucide-react";

const HalalFocus = () => {
  const { ref, isVisible } = useScrollAnimation();

  const focusAreas = [
    {
      icon: Globe,
      title: "Global Destinations",
      description: "Halal tourism-focused destinations globally, curated for Muslim travellers",
    },
    {
      icon: Map,
      title: "Itinerary Curation",
      description: "Domestic and international itinerary curation aligned with halal travel expectations",
    },
    {
      icon: Heart,
      title: "Ethical Selection",
      description: "Supplier and service selection that respects religious, cultural, and ethical considerations",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
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
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Halal tourism is not simply about destinations—it is about criteria, confidence, and consistency.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {focusAreas.map((area, index) => (
            <Card
              key={area.title}
              className={`border border-border hover:shadow-xl transition-all duration-300 opacity-0 ${
                isVisible ? "animate-fade-in" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <area.icon className="w-8 h-8 text-primary" />
                </div>
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

        <div
          className={`mt-12 text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "400ms" }}
        >
          <p className="text-muted-foreground max-w-3xl mx-auto bg-accent/30 rounded-lg p-6 border border-border">
            Every itinerary, product, and content asset is designed to meet the expectations of 
            halal-conscious travellers—while remaining commercially viable for agents.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HalalFocus;
