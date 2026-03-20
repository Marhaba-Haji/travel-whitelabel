import { CheckCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getAuroraGradient } from "@/lib/design-tokens";

const HowItWorks = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollAnimation();

  const steps = [
    {
      step: "01",
      title: "Sign Up & Choose Plan",
      description: "Create your account and select the plan that fits your business needs. Get started in minutes.",
    },
    {
      step: "02",
      title: "Connect Your Domain",
      description: "Point your custom domain to our platform. Add your logo, colors, and branding elements.",
    },
    {
      step: "03",
      title: "Add Your Content",
      description: "Upload packages, set rates, configure APIs, and invite your suppliers to add their content.",
    },
    {
      step: "04",
      title: "Start Selling",
      description: "Launch your portal! Start accepting bookings from agents and customers immediately.",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(210_100%_50%_/_0.05),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative">
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] glass px-4 py-1.5 rounded-full mb-5">
            Quick Setup
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Launch Your Portal in{" "}
            <span className="aurora-gradient-text-static">
              4 Simple Steps
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your branded travel portal up and running quickly with our streamlined setup process.
          </p>
        </div>

        <div ref={stepsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-white/10 to-transparent" />
              )}

              <div
                className={`group relative glass-card rounded-2xl p-6 hover:shadow-xl hover:border-white/20 transition-all duration-300 opacity-0 ${stepsVisible ? "animate-scale-in" : ""}`}
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAuroraGradient(index)} flex items-center justify-center text-xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.step}
                  </div>
                  <CheckCircle className="h-5 w-5 text-aurora-teal/40" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
