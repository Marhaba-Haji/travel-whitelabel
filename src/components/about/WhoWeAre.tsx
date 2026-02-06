import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Layers, Cpu, Shield } from "lucide-react";

const WhoWeAre = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-12 items-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          {/* Text Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Who We Are
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Nomadore is a halal tourism enablement company focused on building infrastructure, 
              content, technology, and operational systems for travel agents, tour operators, 
              and hospitality partners.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We work behind the scenes—supporting travel businesses with everything required to 
              design, sell, manage, and scale halal-compliant travel experiences across domestic 
              and international destinations.
            </p>
            
            {/* Highlighted Box */}
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg">
              <p className="text-foreground font-medium italic">
                "Nomadore is not a destination seller. We are the systems, intelligence, and 
                backbone that make halal tourism businesses stronger."
              </p>
            </div>
          </div>
          
          {/* Visual Element */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Infrastructure</h3>
              <p className="text-muted-foreground text-sm">
                Building the foundational systems that power halal travel businesses
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Intelligence</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered tools and insights to enhance decision-making
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Backbone</h3>
              <p className="text-muted-foreground text-sm">
                Reliable support systems that keep businesses running smoothly
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
