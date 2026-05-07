import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Languages, Megaphone, TrendingDown, CheckCircle2, ArrowRight, Database } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

const ContentSupplier = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: metricsRef, isVisible: metricsVisible } = useScrollAnimation();

  const contentTypes = [
    {
      icon: FileText,
      title: "Destination Content",
      description: "Comprehensive guides and information for halal-friendly destinations",
      count: "5000+",
    },
    {
      icon: BookOpen,
      title: "Itinerary Narratives",
      description: "Engaging stories and descriptions that sell travel experiences",
      count: "1000+",
    },
    {
      icon: Languages,
      title: "Religious & Cultural Context",
      description: "Authentic information about local customs and halal considerations",
      count: "200+",
    },
    {
      icon: Megaphone,
      title: "Sales-Ready Descriptions",
      description: "Optimised for websites, brochures, and digital marketing",
      count: "10000+",
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
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Content Engine
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              A Global Halal Tourism Content Supplier
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              marhabaDMC operates as a central content engine for halal tourism professionals.
            </p>
          </div>

          {/* Content Volume Metric */}
          <div
            ref={metricsRef}
            className={`max-w-2xl mx-auto mb-12 opacity-0 ${metricsVisible ? "animate-fade-in" : ""}`}
          >
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <Database className="w-10 h-10 text-primary" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-1">
                    <AnimatedCounter end={10000} suffix="+" />
                  </div>
                  <div className="text-sm text-muted-foreground">Content Assets</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-1">
                    <AnimatedCounter end={50} suffix="+" />
                  </div>
                  <div className="text-sm text-muted-foreground">Languages</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contentTypes.map((content, index) => (
              <Card
                key={content.title}
                className={`border border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 opacity-0 ${
                  isVisible ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                    <content.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-xl font-bold text-primary mb-2">{content.count}</div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {content.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {content.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Value Proposition */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-accent/30 to-accent/10 border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-lg">Reduce Costs</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Reduce content creation costs by up to 60% while maintaining quality across all marketing channels. 
                    No need for expensive copywriters or content teams.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent/30 to-accent/10 border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-lg">Maintain Consistency</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Ensure consistency, accuracy, and credibility across all markets and platforms. 
                    Every piece of content is reviewed for halal compliance and quality.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Quality Indicators */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">Content Quality Standards</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                "100% Halal Compliant",
                "SEO Optimized",
                "Multi-language Support",
                "Regularly Updated",
                "Mobile Responsive",
                "Conversion Focused",
              ].map((standard, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{standard}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" asChild>
              <a href="/contact">
                Explore Content Library
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentSupplier;
