import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Hotel, FileText, MapPin, Globe, Palette } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Features = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const features = [
    {
      icon: Plane,
      title: "Flight API",
      description: "Access real-time flight inventory from global GDS systems. Book domestic and international flights with instant confirmation.",
      gradient: "from-primary to-primary/60",
      highlight: true,
    },
    {
      icon: Hotel,
      title: "Hotel API",
      description: "Connect to 1M+ hotels worldwide. From budget stays to luxury resorts, offer your customers the best rates.",
      gradient: "from-primary/90 to-primary/50",
      highlight: true,
    },
    {
      icon: FileText,
      title: "Visa API",
      description: "Streamlined visa processing for 100+ countries. Digital applications, document management, and status tracking.",
      gradient: "from-primary/80 to-primary/40",
      highlight: false,
    },
    {
      icon: MapPin,
      title: "Activities API",
      description: "Tours, experiences, and local activities. Give your customers access to thousands of curated experiences.",
      gradient: "from-primary/80 to-primary/40",
      highlight: false,
    },
    {
      icon: Globe,
      title: "Own Domain",
      description: "Use your own custom domain. Your brand, your identity. No Facelyft branding visible to your customers.",
      gradient: "from-primary/70 to-primary/30",
      highlight: false,
    },
    {
      icon: Palette,
      title: "White-Label Branding",
      description: "Complete customization with your logo, colors, and design. Make it truly yours with full branding control.",
      gradient: "from-primary/70 to-primary/30",
      highlight: false,
    },
  ];

  return (
    <section id="features" className="py-20 bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/30 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-1 rounded-full mb-4">
            Complete API Suite
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Everything You Need to Run a Travel Business
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our integrated platform provides all the APIs and tools you need to launch and scale your travel agency.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={`group hover:shadow-xl transition-all duration-300 border-border hover:border-primary/30 opacity-0 ${gridVisible ? "animate-scale-in" : ""} ${feature.highlight ? "ring-1 ring-primary/20" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  {feature.highlight && (
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
