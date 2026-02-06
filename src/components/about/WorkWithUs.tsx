import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Globe, Cpu, Building, CheckCircle2, Star, TrendingUp, Users } from "lucide-react";

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
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          {/* Who We Work With */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Partnership
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Who We Work With
            </h2>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {partnerTypes.map((partner) => (
                <div
                  key={partner}
                  className="bg-card border border-border rounded-full px-4 py-2 hover:shadow-lg transition-shadow"
                >
                  <span className="text-foreground text-sm font-medium">{partner}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              We focus on <span className="font-semibold text-foreground">long-term collaboration</span> rather than short-term transactions.
            </p>
          </div>

          {/* Why Partner With Us */}
          <div
            ref={benefitsRef}
            className={`bg-card border border-border rounded-2xl p-8 md:p-12 mb-12 opacity-0 ${benefitsVisible ? "animate-fade-in" : ""}`}
          >
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-gold" />
              Why Partner With Nomadore?
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {partnershipBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Looking Ahead */}
          <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-8 md:p-12 mb-12 border border-primary/20">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Looking Ahead
              </span>
            </h3>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8 text-lg">
              Nomadore is building the foundational operating layer for halal tourism across:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {visionAreas.map((area, index) => (
                <div
                  key={area.text}
                  className={`bg-card border border-border rounded-xl p-4 text-center hover:shadow-xl transition-all hover:-translate-y-1 opacity-0 ${
                    isVisible ? "animate-fade-in" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <area.icon className="w-8 h-8 text-primary mx-auto mb-3" />
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
          <div className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-8 mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-gold" />
              <h3 className="text-xl font-bold text-foreground">Partner Success</h3>
            </div>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Our partners see an average of <span className="font-bold text-primary">27% increase in bookings</span> within 
              the first 3 months, with <span className="font-bold text-primary">15% reduction in operational costs</span>.
            </p>
          </div>

          {/* CTAs */}
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              Work With Nomadore
            </h3>
            <p className="text-muted-foreground mb-8 text-lg">
              If you are building a halal travel business and want access to structured itineraries, 
              global inventory, intelligent technology, and long-term support, Nomadore is designed for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="shadow-lg">
                <a href="/signup">
                  Apply for Partner Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">
                  Request a Platform Overview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Join <span className="font-semibold text-primary">100+</span> travel professionals already partnering with Nomadore
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkWithUs;
