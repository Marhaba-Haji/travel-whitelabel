import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Lightbulb, TrendingUp, Shield, Heart, Target, Users } from "lucide-react";

import { getAuroraGradient } from "@/lib/design-tokens";

const Philosophy = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();

  const pillars = [
    { icon: Lightbulb, quote: "Infrastructure should empower, not overshadow" },
    { icon: TrendingUp, quote: "Growth should be structured, not chaotic" },
    { icon: Shield, quote: "Trust should be embedded, not explained" },
  ];

  const values = [
    { icon: Heart, title: "Partnership First", description: "We succeed when our partners succeed" },
    { icon: Target, title: "Halal Integrity", description: "Uncompromising commitment to halal compliance" },
    { icon: Users, title: "Empowerment", description: "Enabling businesses to reach their full potential" },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-muted/35 dark:bg-[hsl(222,47%,8%)]">
      {/* Aurora wash — subtle in light, stronger on dark slab */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(270_58%_48%_/_0.12),_transparent_52%)] dark:bg-[radial-gradient(ellipse_at_top,_hsl(270_70%_58%_/_0.1),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-14">
            <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] bg-muted/60 backdrop-blur-xl border border-surface px-4 py-1.5 rounded-full mb-5">
              Our Foundation
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Our{" "}
              <span className="aurora-gradient-text-static">
                Philosophy
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              marhabaDMC is built on a simple philosophy that guides everything we do
            </p>
          </div>

          {/* Three Pillars */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.quote}
                className={`text-center opacity-0 ${isVisible ? "animate-scale-in" : ""}`}
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getAuroraGradient(index)} flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300`}>
                  <pillar.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-xl md:text-2xl font-medium italic text-foreground/90 leading-relaxed">
                  &ldquo;{pillar.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>

          {/* Company Values */}
          <div
            ref={valuesRef}
            className={`mb-14 opacity-0 ${valuesVisible ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="text-2xl font-bold text-center text-foreground mb-8">Our Core Values</h3>
            <div className="grid md:grid-cols-3 gap-5">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className={`group bg-surface-frosted border-surface rounded-2xl p-6 text-center hover-surface-card transition-all duration-300 opacity-0 ${valuesVisible ? "animate-scale-in" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAuroraGradient(index)} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{value.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Statement */}
          <div
            className={`text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "800ms" }}
          >
            <div className="bg-surface-frosted border-surface rounded-2xl p-8 max-w-3xl mx-auto">
              <p className="text-xl text-foreground/90 max-w-2xl mx-auto mb-4 font-medium">
                We design systems that allow travel businesses to grow with
                <span className="aurora-gradient-text-static font-semibold"> confidence</span>,
                <span className="aurora-gradient-text-static font-semibold"> clarity</span>, and
                <span className="aurora-gradient-text-static font-semibold"> control</span>.
              </p>
              <p className="text-muted-foreground text-sm">
                Every feature, every partnership, every decision is made with this philosophy at its core.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
