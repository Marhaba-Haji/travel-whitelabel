import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Layers, Cpu, Shield, Target, Rocket, Heart, CheckCircle2 } from "lucide-react";

const WhoWeAre = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: whyRef, isVisible: whyVisible } = useScrollAnimation();

  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Main Content */}
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-12 items-center mb-16 opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          {/* Text Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Our Story
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Who We Are
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
              marhabaDMC is a halal tourism enablement company focused on building infrastructure, 
              content, technology, and operational systems for travel agents, tour operators, 
              and hospitality partners.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We work behind the scenes—supporting travel businesses with everything required to 
              design, sell, manage, and scale halal-compliant travel experiences across domestic 
              and international destinations.
            </p>
            
            {/* Founding Story */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary p-6 rounded-r-lg mb-6">
              <div className="flex items-start gap-3">
                <Rocket className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Our Journey</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Founded with a vision to transform halal tourism, marhabaDMC emerged from recognizing 
                    the gap between travel businesses' ambitions and their operational capabilities. 
                    We've built a comprehensive ecosystem that empowers partners to succeed.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Highlighted Quote */}
            <div className="bg-card border-2 border-primary/20 p-6 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <p className="text-foreground font-medium italic text-lg">
                  "marhabaDMC is not a destination seller. We are the systems, intelligence, and 
                  backbone that make halal tourism businesses stronger."
                </p>
              </div>
            </div>
          </div>
          
          {/* Visual Element */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">Infrastructure</h3>
              <p className="text-muted-foreground text-sm">
                Building the foundational systems that power halal travel businesses
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">Intelligence</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered tools and insights to enhance decision-making
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">Backbone</h3>
              <p className="text-muted-foreground text-sm">
                Reliable support systems that keep businesses running smoothly
              </p>
            </div>
          </div>
        </div>

        {/* Why marhabaDMC */}
        <div
          ref={whyRef}
          className={`opacity-0 ${whyVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Why marhabaDMC?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four key differentiators that set us apart in the halal tourism enablement space
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: CheckCircle2,
                title: "Comprehensive Ecosystem",
                description: "End-to-end solutions from content to technology to operations",
              },
              {
                icon: Target,
                title: "Halal-First Approach",
                description: "Every feature designed with halal compliance at its core",
              },
              {
                icon: Rocket,
                title: "Rapid Deployment",
                description: "Launch your branded platform in days, not months",
              },
              {
                icon: Heart,
                title: "Partner Success Focus",
                description: "Your growth is our success—we're invested in your journey",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
