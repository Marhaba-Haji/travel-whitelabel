import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import AnimatedCounter from "@/components/AnimatedCounter";
import {
  Users,
  Globe,
  FileText,
  Briefcase,
  MapPin,
  GraduationCap,
  Bot,
  Server,
  Award,
  CheckCircle,
} from "lucide-react";

import { getAuroraGradient } from "@/lib/design-tokens";

const AboutStats = () => {
  const { ref: row1Ref, isVisible: row1Visible } = useScrollAnimation();
  const { ref: row2Ref, isVisible: row2Visible } = useScrollAnimation();

  const statsRow1 = [
    {
      icon: Users,
      value: 100,
      suffix: "+",
      label: "Travel Partners",
      description: "Onboarded and growing",
    },
    {
      icon: MapPin,
      value: 200,
      suffix: "+",
      label: "Destinations",
      description: "Curated globally",
    },
    {
      icon: FileText,
      value: 500,
      suffix: "+",
      label: "Itineraries",
      description: "Ready to sell",
    },
    {
      icon: Briefcase,
      value: 1000,
      suffix: "+",
      label: "Content Assets",
      description: "Created and maintained",
    },
  ];

  const statsRow2 = [
    {
      icon: Globe,
      value: 30,
      suffix: "+",
      label: "Countries",
      description: "With inventory access",
    },
    {
      icon: GraduationCap,
      value: 50,
      suffix: "+",
      label: "Training Sessions",
      description: "Planned each year",
    },
    {
      icon: Bot,
      value: 50000,
      suffix: "+",
      label: "AI TEST Interactions",
      description: "Handled monthly",
    },
    {
      icon: Server,
      value: 99.9,
      suffix: "%",
      label: "Platform Uptime",
      description: "Reliable infrastructure",
    },
  ];

  const renderStatCard = (
    stat: (typeof statsRow1)[number],
    index: number,
    isVisible: boolean,
  ) => (
    <div
      key={stat.label}
      className={`group glass-card rounded-2xl p-6 text-center hover-surface-card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 opacity-0 ${
        isVisible ? "animate-scale-in" : ""
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAuroraGradient(index)} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
      >
        <stat.icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-3xl md:text-4xl font-bold aurora-gradient-text-static mb-2">
        <AnimatedCounter end={stat.value} suffix={stat.suffix} />
      </div>
      <div className="text-base font-bold text-foreground mb-1">{stat.label}</div>
      <div className="text-sm text-muted-foreground">{stat.description}</div>
    </div>
  );

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(270_70%_58%_/_0.08),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div
          ref={row1Ref}
          className={`mb-12 opacity-0 ${row1Visible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-14">
            <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] glass px-4 py-1.5 rounded-full mb-5">
              Our Impact
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Building the Future of{" "}
              <span className="aurora-gradient-text-static">
                Halal Tourism
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Numbers that reflect our commitment to empowering travel businesses worldwide
            </p>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statsRow1.map((stat, index) => renderStatCard(stat, index, row1Visible))}
          </div>
        </div>

        {/* Row 2 */}
        <div
          ref={row2Ref}
          className={`opacity-0 ${row2Visible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.15s" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statsRow2.map((stat, index) => renderStatCard(stat, index, row2Visible))}
          </div>
        </div>

        {/* Achievement Badge */}
        <div
          className={`mt-14 text-center opacity-0 ${row2Visible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.5s" }}
        >
          <div className="inline-flex items-center gap-4 glass-card rounded-2xl px-8 py-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-purple to-aurora-blue flex items-center justify-center shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Industry Recognition</div>
              <div className="text-base font-bold text-foreground">
                Trusted by leading halal tourism businesses worldwide
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-aurora-teal" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStats;
