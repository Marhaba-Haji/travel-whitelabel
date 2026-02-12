import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Compass, Settings, BarChart3, MapPin, Clock, ArrowRight, FileText } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

const Itineraries = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: metricsRef, isVisible: metricsVisible } = useScrollAnimation();

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

  const itineraryTypes = [
    { name: "Umrah Packages", count: 150 },
    { name: "Hajj Tours", count: 50 },
    { name: "Leisure Destinations", count: 400 },
    { name: "Cultural Experiences", count: 300 },
    { name: "Adventure Tours", count: 100 },
  ];

  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Curated Travel Experiences
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Curated Itineraries, Built for Scale
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              marhabaDMC curates structured travel itineraries that agents can confidently sell and scale.
            </p>
          </div>

          {/* Metrics Bar */}
          <div
            ref={metricsRef}
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 opacity-0 ${metricsVisible ? "animate-fade-in" : ""}`}
          >
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                <AnimatedCounter end={1000} suffix="+" />
              </div>
              <div className="text-sm text-muted-foreground">Ready Itineraries</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                <AnimatedCounter end={50} suffix="+" />
              </div>
              <div className="text-sm text-muted-foreground">Destinations</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                <AnimatedCounter end={24} />
              </div>
              <div className="text-sm text-muted-foreground">Hours to Launch</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                <AnimatedCounter end={100} suffix="%" />
              </div>
              <div className="text-sm text-muted-foreground">Halal Compliant</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={`border border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 opacity-0 ${
                  isVisible ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Itinerary Types Breakdown */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Itinerary Categories
            </h3>
            <div className="grid md:grid-cols-5 gap-4">
              {itineraryTypes.map((type, index) => (
                <div
                  key={type.name}
                  className="text-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-2xl font-bold text-primary mb-1">
                    {type.count}+
                  </div>
                  <div className="text-sm text-muted-foreground">{type.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Benefits Callout */}
          <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 border-2 border-gold/20 rounded-2xl p-8 text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                Agent Advantage
              </span>
            </div>
            <p className="text-foreground text-lg font-medium max-w-2xl mx-auto mb-4">
              Agents gain access to ready-to-sell itineraries while retaining full control 
              over branding and pricing.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Instant access to <span className="font-semibold text-foreground">1000+</span> itineraries</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>Launch in <span className="font-semibold text-foreground">24 hours</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings className="w-4 h-4 text-primary" />
                <span>Full <span className="font-semibold text-foreground">customization</span> control</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" asChild>
              <a href="#contact">
                View Sample Itineraries
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Itineraries;
