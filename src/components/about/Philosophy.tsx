import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Lightbulb, TrendingUp, Shield, Heart, Target, Users } from "lucide-react";

const Philosophy = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();

  const pillars = [
    {
      icon: Lightbulb,
      quote: "Infrastructure should empower, not overshadow",
    },
    {
      icon: TrendingUp,
      quote: "Growth should be structured, not chaotic",
    },
    {
      icon: Shield,
      quote: "Trust should be embedded, not explained",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Partnership First",
      description: "We succeed when our partners succeed",
    },
    {
      icon: Target,
      title: "Halal Integrity",
      description: "Uncompromising commitment to halal compliance",
    },
    {
      icon: Users,
      title: "Empowerment",
      description: "Enabling businesses to reach their full potential",
    },
  ];

  return (
    <section className="py-20 bg-foreground text-background relative overflow-hidden">
      {/* Enhanced Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-soft" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-background/10 border border-background/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-background/80 uppercase tracking-wider">
                Our Foundation
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Philosophy
            </h2>
            <p className="text-background/70 max-w-xl mx-auto text-lg">
              Nomadore is built on a simple philosophy that guides everything we do
            </p>
          </div>

          {/* Three Pillars */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.quote}
                className={`text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-20 h-20 rounded-full bg-background/10 flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform">
                  <pillar.icon className="w-10 h-10 text-background" />
                </div>
                <p className="text-xl md:text-2xl font-medium italic text-background/90 leading-relaxed">
                  "{pillar.quote}"
                </p>
              </div>
            ))}
          </div>

          {/* Company Values */}
          <div
            ref={valuesRef}
            className={`mb-12 opacity-0 ${valuesVisible ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "0.5s" }}
          >
            <h3 className="text-2xl font-bold text-center mb-8">Our Core Values</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="bg-background/5 border border-background/10 rounded-xl p-6 text-center hover:bg-background/10 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-full bg-background/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-background" />
                  </div>
                  <h4 className="font-semibold text-background mb-2">{value.title}</h4>
                  <p className="text-background/70 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Statement */}
          <div
            className={`text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "800ms" }}
          >
            <div className="bg-background/5 border border-background/10 rounded-2xl p-8 max-w-3xl mx-auto">
              <p className="text-xl text-background/90 max-w-2xl mx-auto mb-4 font-medium">
                We design systems that allow travel businesses to grow with 
                <span className="text-background font-semibold"> confidence</span>, 
                <span className="text-background font-semibold"> clarity</span>, and 
                <span className="text-background font-semibold"> control</span>.
              </p>
              <p className="text-background/70 text-sm">
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
