import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Plane, Building2, Car } from "lucide-react";

const ContractedInventory = () => {
  const { ref, isVisible } = useScrollAnimation();

  const pillars = [
    {
      icon: Plane,
      title: "Airline Partnerships",
      description: "Seat allocations and negotiated fares with major carriers",
    },
    {
      icon: Building2,
      title: "Hotel Partnerships",
      description: "Aligned with halal travel needs and expectations",
    },
    {
      icon: Car,
      title: "Ground Services",
      description: "Destination support and local service providers",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Contracted Global Inventory Access
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nomadore works to secure contracted and negotiated rates across key halal tourism destinations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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

          {/* Competitive Pricing Emphasis */}
          <div
            className={`mt-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 text-center opacity-0 ${
              isVisible ? "animate-fade-in" : ""
            }`}
            style={{ animationDelay: "500ms" }}
          >
            <p className="text-foreground text-lg font-medium max-w-3xl mx-auto">
              These rates enable agents to <span className="text-primary font-semibold">price competitively</span> while 
              maintaining margin discipline and predictability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContractedInventory;
