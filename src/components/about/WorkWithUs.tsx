import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Globe, Cpu, Building, CheckCircle2, Star, TrendingUp } from "lucide-react";

const VISION_GRADIENTS = [
  "from-aurora-blue to-aurora-teal",
  "from-aurora-purple to-aurora-blue",
  "from-aurora-teal to-emerald-500",
  "from-aurora-pink to-aurora-purple",
];

const WorkWithUs = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: benefitsRef, isVisible: benefitsVisible } = useScrollAnimation();

  const partnerTypes = [
    "Halal Travel Agents",
    "Umrah & Religious Tour Operators",
    "International Market Agencies",
    "Hospitality Partners",
  ];

  const visionAreas = [
    { icon: Compass, text: "Travel Distribution" },
    { icon: Globe, text: "Content Intelligence" },
    { icon: Cpu, text: "AI-Assisted Sales" },
    { icon: Building, text: "Hospitality Operations" },
  ];

  const partnershipBenefits = [
    "Access to 500+ ready-to-sell itineraries",
    "Global inventory with negotiated rates",
    "WhiteLabel technology platform",
    "Comprehensive training and support",
    "AI-powered sales tools",
    "6 days platform support",
    "Marketing content library",
    "Partner success program",
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(270_70%_58%_/_0.08),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(210_100%_50%_/_0.06),_transparent_50%)]" />

      <div className="absolute top-10 left-10 w-72 h-72 bg-aurora-purple/10 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-aurora-blue/8 rounded-full blur-3xl pointer-events-none animate-pulse-soft" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          {/* Who We Work With */}
          <div className="text-center mb-16">
            <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] glass px-4 py-1.5 rounded-full mb-5">
              Partnership
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Who We{" "}
              <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">
                Work With
              </span>
            </h2>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {partnerTypes.map((partner) => (
                <div
                  key={partner}
                  className="glass rounded-full px-5 py-2.5 hover:border-white/20 transition-all"
                >
                  <span className="text-foreground text-sm font-medium">{partner}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              We focus on{" "}
              <span className="font-semibold aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">long-term collaboration</span>{" "}
              rather than short-term transactions.
            </p>
          </div>

          {/* Why Partner With Us */}
          <div
            ref={benefitsRef}
            className={`glass-card rounded-2xl p-8 md:p-12 mb-14 opacity-0 ${benefitsVisible ? "animate-fade-in" : ""}`}
          >
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-pink to-aurora-purple flex items-center justify-center shadow-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              Why Partner With marhabaDMC?
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {partnershipBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-aurora-teal flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Looking Ahead */}
          <div className="glass-card rounded-2xl p-8 md:p-12 mb-14">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
              <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">
                Looking Ahead
              </span>
            </h3>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8 text-lg">
              marhabaDMC is building the foundational operating layer for halal tourism across:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {visionAreas.map((area, index) => (
                <div
                  key={area.text}
                  className={`group glass rounded-2xl p-5 text-center hover:shadow-2xl hover:border-white/20 transition-all duration-300 opacity-0 ${
                    isVisible ? "animate-scale-in" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${VISION_GRADIENTS[index]} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <area.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-foreground font-medium text-sm">{area.text}</span>
                </div>
              ))}
            </div>
            <p className="text-foreground text-center mt-8 font-medium text-lg">
              Our vision is to enable a more organised, scalable, and professional
              halal tourism industry worldwide.
            </p>
          </div>

          {/* Success Story */}
          <div className="glass-card rounded-2xl p-8 mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-teal to-emerald-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Partner Success</h3>
            </div>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Our partners see an average of{" "}
              <span className="font-bold aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">27% increase in bookings</span>{" "}
              within the first 3 months, with{" "}
              <span className="font-bold aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">15% reduction in operational costs</span>.
            </p>
          </div>

          {/* CTAs */}
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              Work With marhabaDMC
            </h3>
            <p className="text-muted-foreground mb-8 text-lg">
              If you are building a halal travel business and want access to structured itineraries,
              global inventory, intelligent technology, and long-term support, marhabaDMC is designed for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="rounded-full px-8 bg-gradient-to-r from-aurora-blue via-primary to-aurora-blue bg-[length:200%_auto] animate-gradient-shift shadow-[0_0_30px_hsl(210_100%_50%_/_0.3)] hover:shadow-[0_0_40px_hsl(210_100%_50%_/_0.5)] transition-shadow"
              >
                <a href="/signup">
                  Apply for Partner Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full px-8 border-white/20 hover:bg-white/5 hover:border-white/30"
              >
                <a href="#contact">
                  Request a Platform Overview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Join{" "}
              <span className="font-semibold aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">100+</span>{" "}
              travel professionals already partnering with marhabaDMC
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkWithUs;
