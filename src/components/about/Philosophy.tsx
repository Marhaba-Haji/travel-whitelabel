import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Lightbulb, TrendingUp, Shield } from "lucide-react";

const Philosophy = () => {
  const { ref, isVisible } = useScrollAnimation();

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

  return (
    <section className="py-20 bg-foreground text-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Philosophy
            </h2>
            <p className="text-background/70 max-w-xl mx-auto">
              Nomadore is built on a simple philosophy
            </p>
          </div>

          {/* Three Pillars */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.quote}
                className={`text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-background/10 flex items-center justify-center mx-auto mb-6">
                  <pillar.icon className="w-8 h-8 text-background" />
                </div>
                <p className="text-xl md:text-2xl font-medium italic text-background/90">
                  "{pillar.quote}"
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Statement */}
          <div
            className={`text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "500ms" }}
          >
            <p className="text-lg text-background/80 max-w-2xl mx-auto">
              We design systems that allow travel businesses to grow with 
              <span className="text-background font-semibold"> confidence</span>, 
              <span className="text-background font-semibold"> clarity</span>, and 
              <span className="text-background font-semibold"> control</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
