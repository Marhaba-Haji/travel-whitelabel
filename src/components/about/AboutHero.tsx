import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AboutHero = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="relative pt-32 pb-20 overflow-hidden min-h-[90vh] flex items-center">
      {/* Enhanced Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Enhanced Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none animate-pulse-soft" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none animate-float-slow" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`max-w-4xl mx-auto text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 animate-bounce-subtle">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Halal Tourism Enablement Company
            </span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-gold animate-gradient-shift bg-[length:200%_auto]">
              Nomadore
            </span>
          </h1>
          
          {/* Enhanced Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            We build the infrastructure, content, technology, and operational systems that empower 
            travel agents, tour operators, and hospitality partners to design, sell, manage, and 
            scale halal-compliant travel experiences worldwide.
          </p>

          {/* Value Proposition */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-foreground font-medium text-lg">
              Empowering travel businesses with{" "}
              <span className="text-primary font-semibold">intelligent infrastructure</span>,{" "}
              <span className="text-primary font-semibold">curated content</span>, and{" "}
              <span className="text-primary font-semibold">cutting-edge technology</span>{" "}
              to scale halal tourism globally.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
