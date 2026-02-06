import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Building, BedDouble, TrendingUp, Settings } from "lucide-react";

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

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
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
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nomadore is expanding into hospitality operations with a dedicated room 
                and lodge management SaaS platform.
              </p>
            </div>

            {/* Target Audience */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {audiences.map((audience) => (
                <div
                  key={audience.name}
                  className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2"
                >
                  <audience.icon className="w-4 h-4 text-primary" />
                  <span className="text-foreground text-sm font-medium">{audience.name}</span>
                </div>
              ))}
            </div>

            {/* Capabilities Preview */}
            <Card className="border border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="font-semibold text-foreground text-center mb-6">
                  Platform Capabilities
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {capabilities.map((cap, index) => (
                    <div
                      key={cap.text}
                      className={`flex items-center gap-3 p-4 bg-muted/50 rounded-lg opacity-0 ${
                        isVisible ? "animate-fade-in" : ""
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <cap.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-foreground text-sm">{cap.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vision Note */}
            <p className="text-center text-muted-foreground mt-8 text-sm">
              This product is being built to complement the halal tourism ecosystem 
              by strengthening the supply side.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalityTech;
