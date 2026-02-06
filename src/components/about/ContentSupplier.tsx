import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, BookOpen, Languages, Megaphone } from "lucide-react";

const ContentSupplier = () => {
  const { ref, isVisible } = useScrollAnimation();

  const contentTypes = [
    {
      icon: FileText,
      title: "Destination Content",
      description: "Comprehensive guides and information for halal-friendly destinations",
    },
    {
      icon: BookOpen,
      title: "Itinerary Narratives",
      description: "Engaging stories and descriptions that sell travel experiences",
    },
    {
      icon: Languages,
      title: "Religious & Cultural Context",
      description: "Authentic information about local customs and halal considerations",
    },
    {
      icon: Megaphone,
      title: "Sales-Ready Descriptions",
      description: "Optimised for websites, brochures, and digital marketing",
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
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Content Engine
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              A Global Halal Tourism Content Supplier
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nomadore operates as a central content engine for halal tourism professionals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contentTypes.map((content, index) => (
              <Card
                key={content.title}
                className={`border border-border hover:shadow-lg transition-all duration-300 opacity-0 ${
                  isVisible ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                    <content.icon className="w-7 h-7 text-primary" />
                  </div>
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
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-accent/30 border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-2">Reduce Costs</h4>
              <p className="text-muted-foreground text-sm">
                Reduce content creation costs while maintaining quality across all marketing channels.
              </p>
            </div>
            <div className="bg-accent/30 border border-border rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-2">Maintain Consistency</h4>
              <p className="text-muted-foreground text-sm">
                Ensure consistency, accuracy, and credibility across all markets and platforms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentSupplier;
