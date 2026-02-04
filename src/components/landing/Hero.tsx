import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  GraduationCap, 
  Rocket, 
  Globe, 
  Crown,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
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
    "Earn ₹50,000+ Monthly",
    "Travel the World for Free", 
    "Be Your Own Boss",
    "Work From Anywhere",
    "Start Earning in 24 Hours",
    "Build Your Dream Business"
  ];

  const recentActivities = [
    { name: "Amjad", city: "Bangalore", action: "is looking for Turkey Visa" },
    { name: "Fathima", city: "Pune", action: "wants Umrah Package" },
    { name: "Riyaz", city: "Lucknow", action: "is planning a Halal Thailand trip" },
    { name: "Zainab", city: "Hyderabad", action: "is searching for Dubai Holiday Package" },
    { name: "Mohammed", city: "Mumbai", action: "needs Malaysia Visa assistance" },
    { name: "Ayesha", city: "Delhi", action: "wants to book Umrah Group Tour" },
    { name: "Hassan", city: "Chennai", action: "is looking for Singapore Family Package" },
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
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
              Start Your Own
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-gold animate-gradient-shift bg-[length:200%_auto]"> Travel Agency </span>
              in 24 Hours
            </h1>

            {/* Animated Typewriter Subtext */}
            <div className="text-xl md:text-2xl text-muted-foreground mb-6 min-h-[2rem] flex items-center">
              <TypewriterText 
                words={rotatingBenefits}
                className="text-primary font-semibold"
                typingSpeed={80}
                pauseDuration={3000}
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
                  <AnimatedCounter end={2000} suffix="+" className="text-primary font-bold" /> Customers
                </span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-lg">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  ₹<AnimatedCounter end={5} className="text-primary font-bold" /><span className="text-primary font-bold">Cr+</span> Booked
                </span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-lg">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-sm font-medium">
                  <span className="text-primary font-bold">4.7</span> Rating
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
                <AnimatedCounter end={5000} suffix="+" className="font-bold text-primary" /> travelers are looking for travel agents online
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
              <Button 
                size="lg" 
                asChild
                className="shadow-lg group text-lg px-8 animate-glow-pulse relative overflow-hidden"
              >
                <a href="/signup">
                  <span className="relative z-10 flex items-center">
                    Start My Travel Business 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
              </Button>
            </div>

            {/* WhatsApp CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>Have questions?</span>
                <a 
                  href="https://wa.me/919008447887" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline"
                >
                  Talk to a Success Coach
                </a>
              </div>
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
            <div className="absolute -top-6 -right-6 lg:right-0 bg-card border border-primary/30 rounded-xl p-4 shadow-xl animate-float hidden lg:block">
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
