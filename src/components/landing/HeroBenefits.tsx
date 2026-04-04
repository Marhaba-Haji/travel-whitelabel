import { Crown, TrendingUp, Plane, Globe, Zap, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const BENEFITS = [
  { text: "Be Your Own Boss", icon: Crown, gradient: "from-aurora-blue to-aurora-teal" },
  { text: "Earning Potential: ₹50,000+/mo", icon: TrendingUp, gradient: "from-aurora-purple to-aurora-blue" },
  { text: "Travel at Insider Rates", icon: Plane, gradient: "from-aurora-teal to-emerald-500" },
  { text: "Work From Anywhere", icon: Globe, gradient: "from-aurora-purple to-aurora-blue" },
  { text: "Launch-Ready in 24 Hours", icon: Zap, gradient: "from-aurora-blue to-aurora-teal" },
  { text: "Build Your Dream Business", icon: Sparkles, gradient: "from-aurora-purple to-aurora-blue" },
];

const HeroBenefits = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-14 relative overflow-hidden border-y-surface-muted">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div ref={ref} className="container mx-auto px-4 relative z-10">
        <p className="text-center text-xs font-semibold text-aurora-teal/80 mb-6 uppercase tracking-[0.2em]">
          Why Start with Marhaba
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {BENEFITS.map((benefit, index) => (
            <div
              key={benefit.text}
              className={`group glass-card rounded-xl px-4 py-4 md:px-5 md:py-5 flex flex-col items-center text-center hover-surface-card hover:shadow-lg transition-all duration-300 opacity-0 ${
                isVisible ? "animate-scale-in" : ""
              }`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div
                className={`w-10 h-10 md:w-11 md:h-11 rounded-lg bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-300`}
              >
                <benefit.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground leading-tight">
                {benefit.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBenefits;
