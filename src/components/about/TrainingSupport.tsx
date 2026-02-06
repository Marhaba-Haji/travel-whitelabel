import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Monitor, TrendingUp, Megaphone, Award, CheckCircle2, ArrowRight } from "lucide-react";

const TrainingSupport = () => {
  const { ref, isVisible } = useScrollAnimation();

  const trainingTypes = [
    {
      icon: GraduationCap,
      title: "Industry Training",
      description: "Deep understanding of halal tourism market dynamics",
      step: 1,
    },
    {
      icon: Briefcase,
      title: "Business & Operations",
      description: "Streamline your agency's day-to-day operations",
      step: 2,
    },
    {
      icon: Monitor,
      title: "Platform Onboarding",
      description: "Complete tool and technology training",
      step: 3,
    },
    {
      icon: TrendingUp,
      title: "Sales Enablement",
      description: "Techniques to close more deals effectively",
      step: 4,
    },
    {
      icon: Megaphone,
      title: "Marketing Guidance",
      description: "Frameworks to grow your customer base",
      step: 5,
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Partner Success
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Training, Enablement & Growth Support
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Nomadore believes technology alone does not build successful businesses. 
              We support our partners through comprehensive training.
            </p>
          </div>

          {/* Timeline/Steps */}
          <div className="relative mb-12">
            {/* Connection Line - Desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent transform -translate-y-1/2" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {trainingTypes.map((training, index) => (
                <div
                  key={training.title}
                  className={`relative opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-2">
                    {/* Step Number */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-bold flex items-center justify-center mx-auto mb-4">
                      {training.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                      <training.icon className="w-7 h-7 text-primary" />
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-2 text-sm">
                      {training.title}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {training.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certification Badge */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-8 h-8 text-gold" />
              <h3 className="text-xl font-bold text-foreground">Certification Program</h3>
            </div>
            <p className="text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
              Complete our comprehensive training program and receive a Nomadore Certified Partner badge, 
              demonstrating your expertise in halal tourism operations.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {["Industry Knowledge", "Platform Mastery", "Sales Excellence"].map((cert, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Statement */}
          <div
            className={`text-center mb-8 opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "700ms" }}
          >
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-8 max-w-3xl mx-auto">
              <p className="text-foreground text-lg font-medium mb-2">
                Our goal is not just to provide tools—but to ensure partners can 
                <span className="text-primary font-semibold"> use them effectively</span>.
              </p>
              <p className="text-muted-foreground text-sm">
                Every partner receives personalized onboarding, ongoing support, and access to our knowledge base.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" asChild>
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
