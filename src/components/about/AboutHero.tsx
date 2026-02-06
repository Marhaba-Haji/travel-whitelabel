import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AboutHero = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`max-w-4xl mx-auto text-center opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Halal Tourism Enablement Company
            </span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            About{" "}
            <span className="text-primary">Nomadore</span>
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We build the infrastructure, content, technology, and operational systems that empower 
            travel agents, tour operators, and hospitality partners to design, sell, manage, and 
            scale halal-compliant travel experiences worldwide.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
