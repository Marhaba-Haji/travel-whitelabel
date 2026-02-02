import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Play, 
  GraduationCap, 
  Rocket, 
  Globe, 
  Crown,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  Sparkles,
  MessageCircle
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import TypewriterText from "@/components/TypewriterText";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useState, useEffect } from "react";

const Hero = () => {
  const { ref: leftRef, isVisible: leftVisible } = useScrollAnimation();
  const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation();

  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  const rotatingBenefits = [
    "Earn Money",
    "Travel Free", 
    "Be Your Own Boss",
    "Work From Anywhere"
  ];

  const recentActivities = [
    { name: "Priya", city: "Delhi", action: "started her agency" },
    { name: "Rahul", city: "Mumbai", action: "earned ₹2L this month" },
    { name: "Amit", city: "Bangalore", action: "booked 15 trips today" },
    { name: "Sneha", city: "Pune", action: "just went live" },
    { name: "Vikram", city: "Chennai", action: "completed training" },
  ];

  const benefitCards = [
    {
      icon: GraduationCap,
      title: "Complete Training",
      description: "Industry, Tool & Sales training included",
      color: "from-primary to-primary/70",
    },
    {
      icon: Rocket,
      title: "Ready in 24 Hours",
      description: "Launch instantly, not in months",
      color: "from-primary/90 to-primary/60",
    },
    {
      icon: Globe,
      title: "Travel the World",
      description: "Top agents get sponsored trips",
      color: "from-primary/80 to-primary/50",
    },
    {
      icon: Crown,
      title: "Be Your Own Boss",
      description: "Work from anywhere, anytime",
      color: "from-primary/70 to-primary/40",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % recentActivities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden min-h-screen flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div
            ref={leftRef}
            className={`text-center lg:text-left opacity-0 ${leftVisible ? "animate-fade-in" : ""}`}
          >
            {/* Live Activity Ticker */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6 animate-bounce-subtle">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm text-foreground">
                <span className="font-semibold text-primary">{recentActivities[currentActivityIndex].name}</span> from {recentActivities[currentActivityIndex].city} {recentActivities[currentActivityIndex].action}
              </span>
            </div>

            {/* Urgency Badge */}
            <Badge className="mb-4 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 animate-pulse-soft">
              <Sparkles className="w-3 h-3 mr-1" />
              Limited spots for February training batch!
            </Badge>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
              Start Your Own
              <span className="block text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text"> Travel Agency </span>
              in 24 Hours
            </h1>

            {/* Animated Typewriter Subtext */}
            <div className="text-xl md:text-2xl text-muted-foreground mb-6 h-8">
              <TypewriterText 
                words={rotatingBenefits}
                className="text-primary font-semibold"
                typingSpeed={80}
                pauseDuration={2500}
              />
            </div>
            
            <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto lg:mx-0">
              Complete training, ready-to-use portal, and ongoing support. Become a travel entrepreneur and build your dream business today.
            </p>

            {/* Trust Stats Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-lg">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  <AnimatedCounter end={500} suffix="+" className="text-primary font-bold" /> Entrepreneurs
                </span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-lg">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  ₹<AnimatedCounter end={50} className="text-primary font-bold" />Cr+ Booked
                </span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-lg">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-sm font-medium">
                  <span className="text-primary font-bold">4.9</span> Rating
                </span>
              </div>
            </div>

            {/* Avatar Stack + Live Counter */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-xs font-bold text-primary"
                    style={{ zIndex: 5 - i }}
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-background bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  +
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <AnimatedCounter end={127} className="font-bold text-primary" /> agencies launched this week
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
              <Button 
                size="lg" 
                onClick={() => scrollToSection("#pricing")} 
                className="shadow-lg group text-lg px-8 animate-glow-pulse relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Start My Travel Business 
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => scrollToSection("#testimonials")}
                className="group"
              >
                <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Watch Success Stories
              </Button>
            </div>

            {/* WhatsApp CTA */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>Have questions?</span>
              <a 
                href="https://wa.me/919999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                Talk to a Success Coach
              </a>
            </div>
          </div>

          {/* Right Content - Benefit Cards Grid */}
          <div
            ref={rightRef}
            className={`relative opacity-0 ${rightVisible ? "animate-fade-in-right" : ""}`}
            style={{ animationDelay: "0.2s" }}
          >
            {/* Benefit Cards */}
            <div className="grid grid-cols-2 gap-4">
              {benefitCards.map((card, index) => (
                <div
                  key={card.title}
                  className="group bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up-fade"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <card.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
              ))}
            </div>

            {/* Floating Success Metric Card */}
            <div className="absolute -bottom-6 -right-6 lg:right-0 bg-card border border-primary/30 rounded-xl p-4 shadow-xl animate-float hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Monthly Earning</p>
                  <p className="text-lg font-bold text-primary">₹50,000+</p>
                </div>
              </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
