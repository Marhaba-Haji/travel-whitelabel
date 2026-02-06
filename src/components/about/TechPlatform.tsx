import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Settings, Users, Globe, ArrowRight } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

const TechPlatform = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: metricsRef, isVisible: metricsVisible } = useScrollAnimation();

  const portals = [
    {
      icon: Package,
      title: "Supplier Portal",
      description: "Inventory, rates, and service management",
      color: "from-blue-500/20 to-blue-600/10",
    },
    {
      icon: Settings,
      title: "Admin Portal",
      description: "Pricing control, user management, reporting",
      color: "from-purple-500/20 to-purple-600/10",
    },
    {
      icon: Users,
      title: "Agent Portal",
      description: "Sales, bookings, lead handling",
      color: "from-green-500/20 to-green-600/10",
    },
    {
      icon: Globe,
      title: "B2C Portal",
      description: "Customer-facing booking under your brand",
      color: "from-orange-500/20 to-orange-600/10",
    },
  ];


  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Technology Platform
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              WhiteLabel Technology Built for Agencies
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              At the core of Nomadore is a WhiteLabel technology platform designed specifically for travel agencies.
            </p>
          </div>

          {/* Platform Metrics */}
          <div
            ref={metricsRef}
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 opacity-0 ${metricsVisible ? "animate-fade-in" : ""}`}
          >
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                <AnimatedCounter end={99.9} suffix="%" />
              </div>
              <div className="text-sm text-muted-foreground">Uptime SLA</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                &lt;100<span className="text-lg">ms</span>
              </div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                6 Days
              </div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                SSL
              </div>
              <div className="text-sm text-muted-foreground">Encrypted</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {portals.map((portal, index) => (
              <Card
                key={portal.title}
                className={`border border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden opacity-0 flex flex-col ${
                  isVisible ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className={`p-0 bg-gradient-to-br ${portal.color} rounded-lg flex-1 flex flex-col`}>
                  <div className="p-6 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center mb-4">
                      <portal.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-lg">
                      {portal.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {portal.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Highlight */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center mb-8">
            <p className="text-foreground text-lg max-w-3xl mx-auto">
              Each agency operates on its own <span className="font-semibold text-primary">branded ecosystem</span> while 
              Nomadore powers the backend infrastructure.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" asChild>
              <a href="#contact">
                Schedule Platform Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechPlatform;
