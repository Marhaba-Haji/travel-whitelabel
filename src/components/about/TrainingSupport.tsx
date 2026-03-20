import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Monitor, TrendingUp, Megaphone, Award, CheckCircle2, ArrowRight } from "lucide-react";

import { getAuroraGradient } from "@/lib/design-tokens";

const TrainingSupport = () => {
  const { ref, isVisible } = useScrollAnimation();

  const trainingTypes = [
    { icon: GraduationCap, title: "Industry Training", description: "Deep understanding of halal tourism market dynamics", step: 1 },
    { icon: Briefcase, title: "Business & Operations", description: "Streamline your agency's day-to-day operations", step: 2 },
    { icon: Monitor, title: "Platform Onboarding", description: "Complete tool and technology training", step: 3 },
    { icon: TrendingUp, title: "Sales Enablement", description: "Techniques to close more deals effectively", step: 4 },
    { icon: Megaphone, title: "Marketing Guidance", description: "Frameworks to grow your customer base", step: 5 },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(175_70%_45%_/_0.05),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-14">
            <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] glass px-4 py-1.5 rounded-full mb-5">
              Partner Success
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Training, Enablement &{" "}
              <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">
                Growth Support
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              marhabaDMC believes technology alone does not build successful businesses.
              We support our partners through comprehensive training.
            </p>
          </div>

          {/* Timeline/Steps */}
          <div className="relative mb-14">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-y-1/2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {trainingTypes.map((training, index) => (
                <div
                  key={training.title}
                  className={`relative opacity-0 ${isVisible ? "animate-scale-in" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="group glass-card rounded-2xl p-6 text-center hover:shadow-xl hover:border-white/20 transition-all duration-300">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAuroraGradient(index)} text-white text-sm font-bold flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      {training.step}
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAuroraGradient(index)} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <training.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2 text-sm">{training.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{training.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certification Badge */}
          <div className="glass-card rounded-2xl p-8 mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-purple to-aurora-blue flex items-center justify-center shadow-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Certification Program</h3>
            </div>
            <p className="text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
              Complete our comprehensive training program and receive a marhabaDMC Certified Partner badge,
              demonstrating your expertise in halal tourism operations.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {["Industry Knowledge", "Platform Mastery", "Sales Excellence"].map((cert, index) => (
                <div key={index} className="flex items-center gap-2 p-3 glass rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-aurora-teal flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Statement */}
          <div
            className={`text-center mb-10 opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "700ms" }}
          >
            <div className="glass-card rounded-2xl p-8 max-w-3xl mx-auto">
              <p className="text-foreground text-lg font-medium mb-2">
                Our goal is not just to provide tools—but to ensure partners can
                <span className="aurora-gradient-text-static font-semibold"> use them effectively</span>.
              </p>
              <p className="text-muted-foreground text-sm">
                Every partner receives personalized onboarding, ongoing support, and access to our knowledge base.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              asChild
              className="rounded-full px-8 bg-gradient-to-r from-aurora-blue via-primary to-aurora-blue shadow-[0_0_20px_hsl(210_100%_50%_/_0.2)] hover:shadow-[0_0_30px_hsl(210_100%_50%_/_0.3)] transition-shadow"
            >
              <a href="/signup">
                Apply for Partner Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainingSupport;
