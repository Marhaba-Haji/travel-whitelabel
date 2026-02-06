import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Settings, Users, Globe } from "lucide-react";

const TechPlatform = () => {
  const { ref, isVisible } = useScrollAnimation();

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
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              WhiteLabel Technology Built for Agencies
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              At the core of Nomadore is a WhiteLabel technology platform designed specifically for travel agencies.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {portals.map((portal, index) => (
              <Card
                key={portal.title}
                className={`border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden opacity-0 ${
                  isVisible ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${portal.color} p-6`}>
                    <div className="w-12 h-12 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center mb-4">
                      <portal.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
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
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-foreground text-lg max-w-3xl mx-auto">
              Each agency operates on its own <span className="font-semibold text-primary">branded ecosystem</span> while 
              Nomadore powers the backend infrastructure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechPlatform;
