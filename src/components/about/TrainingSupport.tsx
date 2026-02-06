import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { GraduationCap, Briefcase, Monitor, TrendingUp, Megaphone } from "lucide-react";

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
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Training, Enablement & Growth Support
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nomadore believes technology alone does not build successful businesses. 
              We support our partners through comprehensive training.
            </p>
          </div>

          {/* Timeline/Steps */}
          <div className="relative">
            {/* Connection Line - Desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent transform -translate-y-1/2" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {trainingTypes.map((training, index) => (
                <div
                  key={training.title}
                  className={`relative opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                    {/* Step Number */}
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center mx-auto mb-4">
                      {training.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
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

          {/* Goal Statement */}
          <div
            className={`mt-12 text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
            style={{ animationDelay: "600ms" }}
          >
            <p className="text-foreground text-lg font-medium max-w-2xl mx-auto bg-accent/30 rounded-lg p-6 border border-border">
              Our goal is not just to provide tools—but to ensure partners can 
              <span className="text-primary font-semibold"> use them effectively</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainingSupport;
