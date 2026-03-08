import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Globe, MapPin, Users, Building } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

const GlobalPresence = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();

  const regions = [
    {
      name: "Middle East",
      countries: 15,
      description: "Core halal tourism destinations",
      color: "from-primary/20 to-primary/5",
    },
    {
      name: "Southeast Asia",
      countries: 12,
      description: "Growing Muslim travel market",
      color: "from-accent/20 to-accent/5",
    },
    {
      name: "Europe",
      countries: 10,
      description: "Halal-friendly destinations",
      color: "from-primary/15 to-primary/5",
    },
    {
      name: "Africa",
      countries: 8,
      description: "Emerging halal tourism",
      color: "from-accent/15 to-accent/5",
    },
    {
      name: "Americas",
      countries: 5,
      description: "Expanding presence",
      color: "from-primary/10 to-primary/5",
    },
  ];

  const globalStats = [
    { icon: Globe, label: "Countries", value: 50, suffix: "+" },
    { icon: MapPin, label: "Destinations", value: 200, suffix: "+" },
    { icon: Users, label: "Partners", value: 500, suffix: "+" },
    { icon: Building, label: "Properties", value: 1000000, suffix: "+", format: "1M+" },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/3 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Global Reach
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Worldwide Presence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              marhabaDMC's global network spans continents, connecting travel businesses with halal tourism opportunities worldwide
            </p>
          </div>

          {/* Global Stats */}
          <div
            ref={statsRef}
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 opacity-0 ${statsVisible ? "animate-fade-in" : ""}`}
          >
            {globalStats.map((stat, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {stat.format || <AnimatedCounter end={stat.value} suffix={stat.suffix} />}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Regional Breakdown */}
          <div className="grid md:grid-cols-5 gap-4 mb-12">
            {regions.map((region, index) => (
              <div
                key={region.name}
                className={`bg-card border border-border rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-2 opacity-0 ${
                  isVisible ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${region.color} flex items-center justify-center mx-auto mb-4`}>
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{region.name}</h3>
                <div className="text-2xl font-bold text-primary mb-1">{region.countries}</div>
                <div className="text-xs text-muted-foreground mb-2">Countries</div>
                <p className="text-xs text-muted-foreground">{region.description}</p>
              </div>
            ))}
          </div>

          {/* Coverage Map Visualization */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Global Coverage</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our network extends across major halal tourism destinations, providing comprehensive 
                coverage for travel businesses serving Muslim travelers worldwide.
              </p>
            </div>

            {/* Visual Representation */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                "Saudi Arabia",
                "UAE",
                "Turkey",
                "Malaysia",
                "Indonesia",
                "Egypt",
                "Morocco",
                "Jordan",
                "Qatar",
                "Oman",
              ].map((country, index) => (
                <div
                  key={country}
                  className="bg-card/80 border border-border rounded-lg p-3 text-center hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <MapPin className="w-4 h-4 text-primary mx-auto mb-1" />
                  <span className="text-xs text-muted-foreground">{country}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Partnership Note */}
          <div
            className={`mt-12 text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "800ms" }}
          >
            <p className="text-muted-foreground">
              We're continuously expanding our global network.{" "}
              <span className="text-primary font-semibold">Join us</span> in building the future of halal tourism.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalPresence;
