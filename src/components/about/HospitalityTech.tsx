import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, BedDouble, TrendingUp, Settings, Calendar, ArrowRight, Clock, CheckCircle2 } from "lucide-react";

const HospitalityTech = () => {
  const { ref, isVisible } = useScrollAnimation();

  const audiences = [
    { name: "Hotels", icon: Building },
    { name: "Lodges", icon: BedDouble },
    { name: "Small & Mid-sized Operators", icon: Settings },
  ];

  const capabilities = [
    { icon: BedDouble, text: "Manage room inventory and bookings" },
    { icon: TrendingUp, text: "Improve occupancy rates" },
    { icon: Settings, text: "Optimise pricing and revenue" },
    { icon: Building, text: "Streamline operational workflows" },
  ];

  const features = [
    "Real-time inventory management",
    "Automated booking system",
    "Revenue optimization tools",
    "Guest communication platform",
    "Halal compliance tracking",
    "Multi-property management",
  ];

  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              {/* Coming Soon Badge with Animation */}
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 mb-6 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-gold animate-ping" />
                <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Hospitality Technology
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Nomadore is expanding into hospitality operations with a dedicated room 
                and lodge management SaaS platform.
              </p>
            </div>

            {/* Launch Timeline */}
            <div className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-6 mb-12 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-gold" />
                <h3 className="text-lg font-bold text-foreground">Expected Launch: Q4 2026</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Join our waitlist to be among the first to access this revolutionary platform
              </p>
            </div>

            {/* Target Audience */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {audiences.map((audience) => (
                <div
                  key={audience.name}
                  className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 hover:shadow-lg transition-shadow"
                >
                  <audience.icon className="w-4 h-4 text-primary" />
                  <span className="text-foreground text-sm font-medium">{audience.name}</span>
                </div>
              ))}
            </div>

            {/* Capabilities Preview */}
            <Card className="border border-border bg-card/90 backdrop-blur-sm mb-8">
              <CardContent className="p-8">
                <h3 className="font-semibold text-foreground text-center mb-6 text-lg">
                  Platform Capabilities
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {capabilities.map((cap, index) => (
                    <div
                      key={cap.text}
                      className={`flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors opacity-0 ${
                        isVisible ? "animate-fade-in" : ""
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <cap.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-foreground text-sm">{cap.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature List */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">Key Features</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision Note */}
            <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-8">
              <p className="text-foreground text-center font-medium">
                This product is being built to complement the halal tourism ecosystem 
                by strengthening the supply side.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button size="lg" asChild className="bg-gold hover:bg-gold/90">
                <a href="#contact">
                  Request Early Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalityTech;
