import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Languages, Clock, Zap, Users, TrendingDown, TrendingUp, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

const AIPowered = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: metricsRef, isVisible: metricsVisible } = useScrollAnimation();

  const capabilities = [
    { icon: Languages, text: "Multilingual chat and voice bots" },
    { icon: Clock, text: "24/7 availability for enquiries" },
    { icon: Zap, text: "Faster response times" },
    { icon: MessageSquare, text: "Conversion-focused interactions" },
  ];

  const benefits = [
    { icon: Users, title: "Reduce Dependency", description: "Less reliance on large sales teams", metric: "40%" },
    { icon: TrendingUp, title: "Improve Efficiency", description: "Better lead handling and follow-ups", metric: "3x" },
    { icon: TrendingDown, title: "Lower Costs", description: "Reduced operational expenses", metric: "60%" },
    { icon: Zap, title: "Increase Conversions", description: "Higher close rates on enquiries", metric: "35%" },
  ];

  const aiMetrics = [
    { label: "Response Time", value: "<2s", suffix: "" },
    { label: "Accuracy Rate", value: 95, suffix: "%" },
    { label: "Languages", value: 5, suffix: "+" },
    { label: "Uptime", value: 99.9, suffix: "%" },
  ];

  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                AI Intelligence
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              AI-Powered Sales & Support Intelligence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Nomadore integrates AI-driven chat and voice technology to support agent sales and customer engagement.
            </p>
          </div>

          {/* AI Performance Metrics */}
          <div
            ref={metricsRef}
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 opacity-0 ${metricsVisible ? "animate-fade-in" : ""}`}
          >
            {aiMetrics.map((metric, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {typeof metric.value === "string" ? (
                    metric.value
                  ) : (
                    <AnimatedCounter end={metric.value} suffix={metric.suffix} />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left: Bot Visual */}
            <div className="order-2 lg:order-1">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
                {/* Chat Mockup */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
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
                <div className="pt-6 border-t border-border">
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
              {/* Benefits Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <Card
                    key={benefit.title}
                    className={`border border-border hover:shadow-lg transition-all hover:-translate-y-1 opacity-0 ${
                      isVisible ? "animate-fade-in" : ""
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-foreground text-sm">{benefit.title}</h4>
                            <span className="text-xs font-bold text-primary">{benefit.metric}</span>
                          </div>
                          <p className="text-muted-foreground text-xs">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tagline */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-foreground font-medium text-center">
                  AI works <span className="text-primary font-semibold">alongside agents</span>—not instead of them.
                </p>
              </div>

              {/* Use Cases */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3 text-sm">Use Cases:</h4>
                <div className="space-y-2">
                  {["Initial customer enquiries", "Package recommendations", "Booking assistance", "24/7 support"].map((useCase, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
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

export default AIPowered;
