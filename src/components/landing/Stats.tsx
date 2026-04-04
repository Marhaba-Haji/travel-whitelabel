import { Users, Globe, Briefcase, Clock } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import AnimatedCounter from "@/components/AnimatedCounter";
import { getAuroraGradient } from "@/lib/design-tokens";

const Stats = () => {
  const { ref, isVisible } = useScrollAnimation();

  const stats = [
    { icon: Users, value: 500, suffix: "+", label: "Travel Agencies", description: "Trust our platform" },
    { icon: Globe, value: 50, suffix: "+", label: "Countries", description: "Global coverage" },
    { icon: Briefcase, value: 1, suffix: "M+", label: "Hotels", description: "Available worldwide" },
    { icon: Clock, value: 24, suffix: "/7", label: "Support", description: "Always available" },
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-muted/25">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background" />

      <div ref={ref} className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group glass-card rounded-2xl p-6 md:p-8 text-center hover-surface-card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 opacity-0 ${
                isVisible ? "animate-scale-in" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${getAuroraGradient(index)} flex items-center justify-center mx-auto mb-4 md:mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
              </div>
              <div className="text-3xl md:text-4xl font-bold aurora-gradient-text-static mb-1">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm md:text-base font-semibold text-foreground mb-0.5">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
