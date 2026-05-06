import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Bot, Languages, Clock, Zap, Users, TrendingDown, TrendingUp, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

import { getAuroraGradient } from "@/lib/design-tokens";

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
    <section className="py-24 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(270_70%_58%_/_0.05),_transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <div className="text-center mb-14">
            <span className="inline-block text-aurora-teal font-semibold text-xs uppercase tracking-[0.2em] bg-white border border-gray-100 shadow-sm px-4 py-1.5 rounded-full mb-5">
              AI Intelligence
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              AI-Powered Sales &{" "}
              <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto]">
                Support Intelligence
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              marhabaDMC integrates AI-driven chat and voice technology to support agent sales and customer engagement.
            </p>
          </div>

          {/* AI Performance Metrics */}
          <div
            ref={metricsRef}
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 opacity-0 ${metricsVisible ? "animate-fade-in" : ""}`}
          >
            {aiMetrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-4 text-center opacity-0 ${metricsVisible ? "animate-scale-in" : ""}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="text-2xl font-bold aurora-gradient-text-static mb-1">
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

          <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
            {/* Left: Bot Visual */}
            <div className="order-2 lg:order-1">
              <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-6 hover:shadow-2xl transition-shadow">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-purple to-aurora-blue flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="glass rounded-xl rounded-tl-none p-3 max-w-[80%]">
                      <p className="text-sm text-foreground">
                        Hello! I'm your AI travel assistant. How can I help you plan your halal-friendly journey today?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-gradient-to-r from-aurora-blue to-aurora-teal text-white rounded-xl rounded-tr-none p-3 max-w-[80%]">
                      <p className="text-sm">
                        I'm looking for Umrah packages for a family of 4
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-purple to-aurora-blue flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="glass rounded-xl rounded-tl-none p-3 max-w-[80%]">
                      <p className="text-sm text-foreground">
                        I'd be happy to help! We have several Umrah packages perfect for families. Let me show you our most popular options...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t-surface">
                  <div className="grid grid-cols-2 gap-3">
                    {capabilities.map((cap) => (
                      <div key={cap.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <cap.icon className="w-4 h-4 text-aurora-teal" />
                        <span>{cap.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div
                    key={benefit.title}
                    className={`group rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-4 hover-surface-card transition-all duration-300 opacity-0 ${
                      isVisible ? "animate-scale-in" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAuroraGradient(index)} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <benefit.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-foreground text-sm">{benefit.title}</h4>
                          <span className="text-xs font-bold text-aurora-teal">{benefit.metric}</span>
                        </div>
                        <p className="text-muted-foreground text-xs">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-4 mb-6">
                <p className="text-foreground font-medium text-center">
                  AI works{" "}
                  <span className="aurora-gradient-text animate-text-shimmer bg-[length:200%_auto] font-semibold">alongside agents</span>
                  —not instead of them.
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-gray-100 shadow-soft rounded-2xl p-4">
                <h4 className="font-bold text-foreground mb-3 text-sm">Use Cases:</h4>
                <div className="space-y-2">
                  {["Initial customer enquiries", "Package recommendations", "Booking assistance", "24/7 support"].map((useCase, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-aurora-teal flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              asChild
              className="rounded-full px-8 bg-gradient-to-r from-aurora-blue via-primary to-aurora-blue shadow-[0_0_20px_hsl(210_100%_50%_/_0.2)] hover:shadow-[0_0_30px_hsl(210_100%_50%_/_0.3)] transition-shadow"
            >
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
