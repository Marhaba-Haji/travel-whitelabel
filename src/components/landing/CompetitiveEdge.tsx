import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Handshake, 
  Bot, 
  Check, 
  TrendingUp,
  MessageSquare,
  Languages,
  Clock,
  IndianRupee
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const CompetitiveEdge = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation();

  const contractedRateBenefits = [
    "Pre-negotiated hotel deals",
    "Exclusive flight inventory access",
    "5-10% better margins",
    "Easier sales conversions",
  ];

  const aiBotBenefits = [
    "Speaks Hindi, English, Arabic & more",
    "Handles inquiries 24/7",
    "Converts visitors to buyers",
    "Pay only for what you use",
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background via-accent/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 opacity-0 ${headerVisible ? "animate-fade-in" : ""}`}
        >
          <Badge className="mb-4 bg-gold/10 text-gold hover:bg-gold/20 border-gold/20">
            ★ Your Unfair Advantage
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4">
            What Sets <span className="text-primary">NOMADORE</span> Apart
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            These aren't just features — they're your competitive weapons that help you win more deals and earn higher profits.
          </p>
        </div>

        {/* Two Main Cards */}
        <div
          ref={cardsRef}
          className={`grid md:grid-cols-2 gap-8 max-w-5xl mx-auto opacity-0 ${cardsVisible ? "animate-fade-in" : ""}`}
        >
          {/* Card 1: Exclusive Contracted Rates */}
          <Card className="relative border-2 border-gold/30 bg-gradient-to-br from-card via-card to-gold/5 hover:shadow-xl transition-all duration-300 group overflow-hidden">
            {/* Exclusive Badge */}
            <div className="absolute -top-1 -right-1">
              <Badge className="bg-gradient-to-r from-gold to-gold/80 text-gold-foreground px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-lg">
                Exclusive
              </Badge>
            </div>

            <CardContent className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Handshake className="w-8 h-8 text-gold-foreground" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Exclusive Contracted Rates
              </h3>
              <p className="text-primary font-semibold mb-4">
                Higher Margins, Better Conversions
              </p>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                Access hotels and flights we've negotiated at special rates. Your customers get better prices, you keep more profit — everyone wins.
              </p>

              {/* Visual: Rate Comparison */}
              <div className="bg-background/50 rounded-xl p-4 mb-6 border border-border">
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Example Savings</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Market Rate:</span>
                    <span className="text-sm line-through text-muted-foreground">₹5,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Your Rate:</span>
                    <span className="text-lg font-bold text-gold">₹4,200</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Your Extra Profit:
                    </span>
                    <span className="text-lg font-bold text-primary">₹800/booking</span>
                  </div>
                </div>
              </div>

              {/* Benefits List */}
              <ul className="space-y-3">
                {contractedRateBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-sm text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Card 2: AI Sales Assistant */}
          <Card className="relative border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-xl transition-all duration-300 group overflow-hidden">
            {/* NEW Badge with animation */}
            <div className="absolute -top-1 -right-1">
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-lg animate-pulse">
                Add-on
              </Badge>
            </div>

            <CardContent className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-2xl font-bold text-foreground mb-2">
                AI Sales Executive
              </h3>
              <p className="text-primary font-semibold mb-4">
                24/7 Multilingual Sales Power
              </p>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                Like having a tireless sales executive who speaks multiple languages, never sleeps, and costs less than your morning tea.
              </p>

              {/* Visual: Chat Mockup */}
              <div className="bg-background/50 rounded-xl p-4 mb-6 border border-border">
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Live 24/7</p>
                
                {/* Chat bubbles */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      👤
                    </div>
                    <div className="bg-muted rounded-lg rounded-tl-none px-3 py-2 text-xs max-w-[80%]">
                      Hi, I need a Dubai package for 4 people
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none px-3 py-2 text-xs max-w-[80%]">
                      Great choice! I have 3 options starting from ₹45,000. Would you like to see them? 🌟
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Cost comparison */}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Human sales exec:</span>
                    <span className="line-through text-muted-foreground">₹25,000/month</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">AI Assistant:</span>
                    <span className="font-bold text-primary">From ₹6/minute</span>
                  </div>
                </div>
              </div>

              {/* Benefits List */}
              <ul className="space-y-3">
                {aiBotBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Pricing note */}
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                <IndianRupee className="w-3 h-3" />
                <span>Consumption-based billing • Only pay when customers chat</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom tagline */}
        <div className={`text-center mt-12 opacity-0 ${cardsVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.3s" }}>
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold">Why compete on price</span> when you can{" "}
            <span className="text-primary font-semibold">WIN on price?</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CompetitiveEdge;
