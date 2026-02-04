import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ArrowRight, 
  Shield, 
  CreditCard, 
  Sparkles, 
  Flame,
  Coffee,
  TrendingUp,
  Users,
  Star,
  Rocket,
  GraduationCap,
  Headphones,
  BadgeCheck,
  Clock,
  Zap
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import AnimatedCounter from "@/components/AnimatedCounter";
import CountdownTimer from "@/components/CountdownTimer";
import InvestmentCalculator from "@/components/InvestmentCalculator";

const Pricing = () => {
  const { ref, isVisible } = useScrollAnimation();

  // Set countdown to 3 days from now
  const countdownDate = new Date();
  countdownDate.setDate(countdownDate.getDate() + 3);

  const techStackFeatures = [
    "Flight API Integration",
    "Hotel API Integration", 
    "Exclusive Contracted Hotel Rates",
    "Special Flight Inventory Access",
    "Visa API Integration",
    "Activities API Integration",
    "4 White-label Portals",
    "Custom Domain & Branding",
  ];

  const trainingFeatures = [
    "Travel Industry Masterclass",
    "Platform Training Videos",
    "Sales & Marketing Training",
    "Weekly Live Q&A Sessions",
  ];

  const supportFeatures = [
    "24/7 Technical Support",
    "Private Community Access",
    "Monthly Success Calls",
    "Top Performer Rewards",
  ];

  const earningTiers = [
    { level: "Beginner (Part-time)", amount: "₹20,000", highlight: false },
    { level: "Active Agent", amount: "₹50,000", highlight: true },
    { level: "Power Seller", amount: "₹2,00,000", highlight: false, badge: "Top Earner" },
  ];

  const testimonials = [
    {
      name: "Ahmed Siddiqui",
      city: "Jaipur",
      earnings: "₹1.5L in 2 months",
      quote: "Best investment I ever made. The training alone is worth 10x the price!",
      avatar: "AS",
    },
    {
      name: "Ayesha Khan",
      city: "Ahmedabad", 
      earnings: "₹80K/month",
      quote: "Started part-time, now it's my full-time business. Life-changing!",
      avatar: "AK",
    },
    {
      name: "Mohammed Ali",
      city: "Delhi",
      earnings: "₹2L+ monthly",
      quote: "The support team is incredible. They helped me close my first 50 bookings.",
      avatar: "MA",
    },
  ];

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="pricing" className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div
          ref={ref}
          className={`text-center mb-12 opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0">
            Your Investment
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4">
            Less Than a Cup of{" "}
            <span className="text-primary">Coffee Per Day</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One small investment. Unlimited earning potential. Your future starts here.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className={`flex justify-center mb-8 opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.1s" }}>
          <div className="bg-destructive/10 border border-destructive/20 rounded-full px-6 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-destructive animate-pulse" />
              <span className="text-sm font-medium text-destructive">Special pricing ends in:</span>
            </div>
            <CountdownTimer targetDate={countdownDate} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Value Stack */}
          <div className={`space-y-6 opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.2s" }}>
            {/* Tech Stack */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Your Tech Stack</h3>
                  <p className="text-xs text-muted-foreground">Worth ₹2,00,000+</p>
                </div>
              </div>
              <ul className="space-y-2">
                {techStackFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Training Academy */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Training Academy</h3>
                  <p className="text-xs text-muted-foreground">Worth ₹50,000+</p>
                </div>
              </div>
              <ul className="space-y-2">
                {trainingFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support System */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Support System</h3>
                  <p className="text-xs text-muted-foreground">Priceless</p>
                </div>
              </div>
              <ul className="space-y-2">
                {supportFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Optional Add-ons Card */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/30 border border-primary/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Power-Up Add-ons</h3>
                  <p className="text-xs text-muted-foreground">Supercharge your sales</p>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">AI Sales Assistant</h4>
                    <p className="text-xs text-muted-foreground mb-2">24/7 multilingual chatbot that converts visitors while you sleep</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">From ₹2/chat</Badge>
                      <span className="text-xs text-muted-foreground">Pay per use</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Main Pricing Card */}
          <div
            className={`opacity-0 ${isVisible ? "animate-scale-in" : ""}`}
            style={{ animationDelay: "0.3s" }}
          >
            <Card className="relative border-2 border-primary shadow-2xl animate-glow-pulse h-full">
              {/* Hot Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground px-4 py-1.5 text-sm shadow-lg">
                  <Flame className="w-3 h-3 mr-1" />
                  Early Bird Offer
                </Badge>
              </div>

              {/* Spots Remaining */}
              <div className="absolute -top-3 -right-3">
                <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full animate-bounce-subtle">
                  Only 23 spots left!
                </div>
              </div>

              <CardHeader className="text-center pt-10 pb-4">
                <div className="mb-4">
                  {/* Strikethrough Original Price */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-lg text-muted-foreground line-through">₹49,999</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      62% OFF
                    </Badge>
                  </div>
                  
                  {/* Main Price */}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-medium text-muted-foreground">₹</span>
                    <span className="text-6xl font-bold text-foreground">18,799</span>
                  </div>
                  <p className="text-muted-foreground mt-1">per year</p>
                </div>

                {/* Daily Breakdown */}
                <div className="bg-accent/50 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coffee className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">Just ₹51/day</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Less than your daily coffee • Less than a movie ticket
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                {/* ROI Highlight */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Your investment pays for itself</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    in just <span className="text-primary font-bold">2-3 bookings!</span>
                  </p>
                </div>

              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-4">
                <Button size="lg" className="w-full text-lg group relative overflow-hidden" asChild>
                  <a href="/signup">
                    <Zap className="mr-2 h-5 w-5" />
                    Start My Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Setup takes 10 minutes. Start earning tomorrow.
                </p>

                {/* Payment Icons */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span>Secure</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <div className="bg-card border border-border rounded px-2 py-1">
                      <span className="text-[10px] font-bold text-primary tracking-wider">VISA</span>
                    </div>
                    <div className="bg-card border border-border rounded px-2 py-1 flex items-center gap-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/60 -ml-1" />
                    </div>
                    <div className="bg-card border border-border rounded px-2 py-1">
                      <span className="text-[10px] font-bold text-foreground">UPI</span>
                    </div>
                  </div>
                </div>

                {/* Trust Elements */}
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-center gap-6 flex-wrap mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-sm">SSL Secured</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm">No Hidden Fees</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <span className="text-sm">Secure Payments</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm text-center">
                    Have questions? <a href="https://wa.me/919008447887" className="text-primary font-medium hover:underline">Talk to a success coach</a>
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column - Calculator & Social Proof */}
          <div className={`space-y-6 opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.4s" }}>
            {/* Investment Calculator Widget */}
            <InvestmentCalculator />

            {/* Mini Testimonials */}
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground text-sm">{testimonial.name}</span>
                        <BadgeCheck className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{testimonial.city} • <span className="text-gold font-semibold">{testimonial.earnings}</span></p>
                      <p className="text-sm text-muted-foreground italic">"{testimonial.quote}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
