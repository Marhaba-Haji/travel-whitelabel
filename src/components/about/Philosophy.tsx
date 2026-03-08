import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Lightbulb, TrendingUp, Shield, Heart, Target, Users } from "lucide-react";

const PILLAR_GRADIENTS = [
  "from-aurora-blue to-aurora-teal",
  "from-aurora-purple to-aurora-blue",
  "from-aurora-pink to-aurora-purple",
];

const VALUE_GRADIENTS = [
  "from-aurora-teal to-emerald-500",
  "from-aurora-blue to-aurora-purple",
  "from-aurora-pink to-aurora-purple",
];

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
    <section className="py-24 relative overflow-hidden bg-[hsl(222,47%,8%)]">
      {/* Aurora background on dark */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(270_70%_58%_/_0.1),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(210_100%_50%_/_0.07),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(320_90%_60%_/_0.05),_transparent_40%)]" />

      <div className="absolute top-10 left-10 w-80 h-80 bg-aurora-purple/10 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-aurora-blue/8 rounded-full blur-3xl pointer-events-none animate-pulse-soft" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-14">
            <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full mb-5">
              Our Foundation
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Our{" "}
              <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">
                Philosophy
              </span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto text-lg">
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
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${PILLAR_GRADIENTS[index]} flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300`}>
                  <pillar.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-xl md:text-2xl font-medium italic text-white/85 leading-relaxed">
                  "{pillar.quote}"
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
            <h3 className="text-2xl font-bold text-center text-white mb-8">Our Core Values</h3>
            <div className="grid md:grid-cols-3 gap-5">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className={`group bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 hover:shadow-2xl transition-all duration-300 opacity-0 ${valuesVisible ? "animate-scale-in" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${VALUE_GRADIENTS[index]} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-white mb-2">{value.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Statement */}
          <div
            className={`text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "800ms" }}
          >
            <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto">
              <p className="text-xl text-white/85 max-w-2xl mx-auto mb-4 font-medium">
                We design systems that allow travel businesses to grow with
                <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto] font-semibold"> confidence</span>,
                <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto] font-semibold"> clarity</span>, and
                <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto] font-semibold"> control</span>.
              </p>
              <p className="text-white/50 text-sm">
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
