import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Languages, Clock, Zap, Users, TrendingDown, TrendingUp, MessageSquare } from "lucide-react";

const AIPowered = () => {
  const { ref, isVisible } = useScrollAnimation();

  const capabilities = [
    { icon: Languages, text: "Multilingual chat and voice bots" },
    { icon: Clock, text: "24/7 availability for enquiries" },
    { icon: Zap, text: "Faster response times" },
    { icon: MessageSquare, text: "Conversion-focused interactions" },
  ];

  const benefits = [
    { icon: Users, title: "Reduce Dependency", description: "Less reliance on large sales teams" },
    { icon: TrendingUp, title: "Improve Efficiency", description: "Better lead handling and follow-ups" },
    { icon: TrendingDown, title: "Lower Costs", description: "Reduced operational expenses" },
    { icon: Zap, title: "Increase Conversions", description: "Higher close rates on enquiries" },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Bot Visual */}
            <div className="order-2 lg:order-1">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                {/* Chat Mockup */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg rounded-tl-none p-3 max-w-[80%]">
                      <p className="text-sm text-foreground">
                        Hello! I'm your AI travel assistant. How can I help you plan your halal-friendly journey today?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none p-3 max-w-[80%]">
                      <p className="text-sm">
                        I'm looking for Umrah packages for a family of 4
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg rounded-tl-none p-3 max-w-[80%]">
                      <p className="text-sm text-foreground">
                        I'd be happy to help! We have several Umrah packages perfect for families. Let me show you our most popular options...
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Capabilities */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid grid-cols-2 gap-3">
                    {capabilities.map((cap) => (
                      <div key={cap.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <cap.icon className="w-4 h-4 text-primary" />
                        <span>{cap.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                AI-Powered Sales & Support Intelligence
              </h2>
              <p className="text-muted-foreground mb-8">
                Nomadore integrates AI-driven chat and voice technology to support agent sales and customer engagement.
              </p>

              {/* Benefits Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <Card
                    key={benefit.title}
                    className={`border border-border opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{benefit.title}</h4>
                        <p className="text-muted-foreground text-xs">{benefit.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tagline */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-foreground font-medium text-center">
                  AI works <span className="text-primary">alongside agents</span>—not instead of them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIPowered;
