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
  TrendingUp,
  Award,
  Zap,
  CheckCircle
} from "lucide-react";

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
      color: "from-primary to-primary/70",
    },
    {
      icon: MapPin,
      value: 200,
      suffix: "+",
      label: "Destinations",
      description: "Curated globally",
      color: "from-primary/90 to-primary/60",
    },
    {
      icon: FileText,
      value: 500,
      suffix: "+",
      label: "Itineraries",
      description: "Ready to sell",
      color: "from-primary/80 to-primary/50",
    },
    {
      icon: Briefcase,
      value: 1000,
      suffix: "+",
      label: "Content Assets",
      description: "Created and maintained",
      color: "from-primary/70 to-primary/40",
    },
  ];

  const statsRow2 = [
    {
      icon: Globe,
      value: 30,
      suffix: "+",
      label: "Countries",
      description: "With inventory access",
      color: "from-accent/80 to-accent/50",
    },
    {
      icon: GraduationCap,
      value: 50,
      suffix: "+",
      label: "Training Sessions",
      description: "Planned each year",
      color: "from-accent/70 to-accent/40",
    },
    {
      icon: Bot,
      value: 50000,
      suffix: "+",
      label: "AI Interactions",
      description: "Handled monthly",
      color: "from-accent/60 to-accent/30",
    },
    {
      icon: Server,
      value: 99.9,
      suffix: "%",
      label: "Platform Uptime",
      description: "Reliable infrastructure",
      color: "from-gold/80 to-gold/50",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background for Row 1 */}
      <div className="absolute inset-0 bg-primary/5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Row 1 - Primary Background */}
        <div
          ref={row1Ref}
          className={`mb-8 opacity-0 ${row1Visible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Our Impact
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Building the Future of Halal Tourism
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Numbers that reflect our commitment to empowering travel businesses worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsRow1.map((stat, index) => (
              <div
                key={stat.label}
                className={`bg-card border border-border rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 opacity-0 ${
                  row1Visible ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-lg font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Muted Background */}
        <div
          ref={row2Ref}
          className={`opacity-0 ${row2Visible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.2s" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsRow2.map((stat, index) => (
              <div
                key={stat.label}
                className={`bg-card border border-border rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 opacity-0 ${
                  row2Visible ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value < 100 ? (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  ) : (
                    <>
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </>
                  )}
                </div>
                <div className="text-lg font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Badge */}
        <div
          className={`mt-12 text-center opacity-0 ${row2Visible ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl px-8 py-4">
            <Award className="w-6 h-6 text-gold" />
            <div className="text-left">
              <div className="text-sm text-muted-foreground">Industry Recognition</div>
              <div className="text-lg font-bold text-foreground">
                Trusted by leading halal tourism businesses worldwide
              </div>
            </div>
            <CheckCircle className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStats;
