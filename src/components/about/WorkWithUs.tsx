import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Globe, Cpu, Building } from "lucide-react";

const WorkWithUs = () => {
  const { ref, isVisible } = useScrollAnimation();

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

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          {/* Who We Work With */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Who We Work With
            </h2>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {partnerTypes.map((partner) => (
                <div
                  key={partner}
                  className="bg-primary/10 border border-primary/20 rounded-full px-4 py-2"
                >
                  <span className="text-foreground text-sm font-medium">{partner}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We focus on <span className="font-semibold">long-term collaboration</span> rather than short-term transactions.
            </p>
          </div>

          {/* Looking Ahead */}
          <div className="bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 rounded-3xl p-8 md:p-12 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Looking Ahead
              </span>
            </h3>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
              Nomadore is building the foundational operating layer for halal tourism across:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visionAreas.map((area, index) => (
                <div
                  key={area.text}
                  className={`bg-card border border-border rounded-xl p-4 text-center hover:shadow-lg transition-all opacity-0 ${
                    isVisible ? "animate-fade-in" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <area.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <span className="text-foreground font-medium text-sm">{area.text}</span>
                </div>
              ))}
            </div>
            <p className="text-foreground text-center mt-8 font-medium">
              Our vision is to enable a more organised, scalable, and professional 
              halal tourism industry worldwide.
            </p>
          </div>

          {/* CTAs */}
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              Work With Nomadore
            </h3>
            <p className="text-muted-foreground mb-8">
              If you are building a halal travel business and want access to structured itineraries, 
              global inventory, intelligent technology, and long-term support, Nomadore is designed for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/signup">
                  Apply for Partner Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">
                  Request a Platform Overview
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkWithUs;
