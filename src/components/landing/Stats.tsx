import { Users, Globe, Briefcase, Clock } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import AnimatedCounter from "@/components/AnimatedCounter";

const Stats = () => {
  const { ref, isVisible } = useScrollAnimation();

  const stats = [
    {
      icon: Users,
      value: 500,
      suffix: "+",
      label: "Travel Agencies",
      description: "Trust our platform",
      gradient: "from-aurora-blue to-aurora-teal",
    },
    {
      icon: Globe,
      value: 50,
      suffix: "+",
      label: "Countries",
      description: "Global coverage",
      gradient: "from-aurora-purple to-aurora-blue",
    },
    {
      icon: Briefcase,
      value: 1,
      suffix: "M+",
      label: "Hotels",
      description: "Available worldwide",
      gradient: "from-aurora-teal to-emerald-500",
    },
    {
      icon: Clock,
      value: 24,
      suffix: "/7",
      label: "Support",
      description: "Always available",
      gradient: "from-aurora-pink to-aurora-purple",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--aurora-purple)_/_0.08),_transparent_70%)]" />

      <div ref={ref} className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group glass-card rounded-2xl p-6 md:p-8 text-center hover:shadow-2xl hover:border-white/20 hover:-translate-y-1 transition-all duration-300 opacity-0 ${
                isVisible ? "animate-scale-in" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-4 md:mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
              </div>
              <div className="text-3xl md:text-4xl font-bold aurora-gradient-text animate-text-shimmer bg-[length:200%_auto] mb-1">
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
