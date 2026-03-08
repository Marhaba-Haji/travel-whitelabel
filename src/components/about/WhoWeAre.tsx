import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Layers, Cpu, Shield, Target, Rocket, Heart, CheckCircle2 } from "lucide-react";

const PILLAR_GRADIENTS = [
  "from-aurora-blue to-aurora-teal",
  "from-aurora-purple to-aurora-blue",
  "from-aurora-teal to-emerald-500",
];

const WHY_GRADIENTS = [
  "from-aurora-blue to-aurora-teal",
  "from-aurora-purple to-aurora-blue",
  "from-aurora-teal to-emerald-500",
  "from-aurora-pink to-aurora-purple",
];

const WhoWeAre = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: whyRef, isVisible: whyVisible } = useScrollAnimation();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(210_100%_50%_/_0.05),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(270_70%_58%_/_0.04),_transparent_50%)]" />

      <div className="absolute top-20 right-10 w-60 h-60 bg-aurora-purple/7 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-aurora-blue/5 rounded-full blur-3xl pointer-events-none animate-pulse-soft" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-12 items-center mb-20 opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div>
            <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] glass px-4 py-1.5 rounded-full mb-5">
              Our Story
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Who{" "}
              <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">
                We Are
              </span>
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

            <div className="glass-card rounded-2xl p-6 mb-6 border-l-2 border-l-aurora-teal">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-aurora-teal to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-2">Our Journey</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Founded with a vision to transform halal tourism, marhabaDMC emerged from recognizing
                    the gap between travel businesses' ambitions and their operational capabilities.
                    We've built a comprehensive ecosystem that empowers partners to succeed.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-aurora-pink to-aurora-purple flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <p className="text-foreground font-medium italic text-lg leading-relaxed">
                  "marhabaDMC is not a destination seller. We are the systems, intelligence, and
                  backbone that make halal tourism businesses stronger."
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Layers, title: "Infrastructure", description: "Building the foundational systems that power halal travel businesses", gradient: PILLAR_GRADIENTS[0] },
              { icon: Cpu, title: "Intelligence", description: "AI-powered tools and insights to enhance decision-making", gradient: PILLAR_GRADIENTS[1] },
              { icon: Shield, title: "Backbone", description: "Reliable support systems that keep businesses running smoothly", gradient: PILLAR_GRADIENTS[2] },
            ].map((item, index) => (
              <div
                key={item.title}
                className={`group glass-card rounded-2xl p-6 hover:shadow-xl hover:border-white/20 transition-all duration-300 opacity-0 ${isVisible ? "animate-scale-in" : ""}`}
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={whyRef}
          className={`opacity-0 ${whyVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Why{" "}
              <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">
                marhabaDMC?
              </span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four key differentiators that set us apart in the halal tourism enablement space
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: CheckCircle2, title: "Comprehensive Ecosystem", description: "End-to-end solutions from content to technology to operations" },
              { icon: Target, title: "Halal-First Approach", description: "Every feature designed with halal compliance at its core" },
              { icon: Rocket, title: "Rapid Deployment", description: "Launch your branded platform in days, not months" },
              { icon: Heart, title: "Partner Success Focus", description: "Your growth is our success—we're invested in your journey" },
            ].map((item, index) => (
              <div
                key={item.title}
                className={`group glass-card rounded-2xl p-6 text-center hover:shadow-2xl hover:border-white/20 transition-all duration-300 opacity-0 ${whyVisible ? "animate-scale-in" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${WHY_GRADIENTS[index]} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
