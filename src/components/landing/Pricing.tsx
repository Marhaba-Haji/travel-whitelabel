import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Shield, CreditCard, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Pricing = () => {
  const { ref, isVisible } = useScrollAnimation();

  const features = [
    "Flight API Integration",
    "Hotel API Integration",
    "Visa API Integration",
    "Activities API Integration",
    "Custom Domain Setup",
    "White-Label Branding",
    "Admin Portal Access",
    "Supplier Portal Access",
    "B2B Agent Portal",
    "B2C Customer Portal",
    "Hajj & Umrah Packages",
    "Holiday Package Builder",
    "24/7 Technical Support",
    "Regular Updates & Maintenance",
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div
          ref={ref}
          className={`text-center mb-16 opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-1 rounded-full mb-4">
            Simple Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            One Plan, Everything Included
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees, no complicated tiers. Get access to all features at one transparent price.
          </p>
        </div>

        <div
          className={`max-w-lg mx-auto opacity-0 ${isVisible ? "animate-scale-in" : ""}`}
          style={{ animationDelay: "0.2s" }}
        >
          <Card className="relative border-2 border-primary shadow-2xl">
            {/* Animated Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1.5 text-sm shadow-lg animate-pulse-soft">
                <Sparkles className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>

            <CardHeader className="text-center pt-10">
              <CardTitle className="text-2xl">Complete Travel Portal</CardTitle>
              <CardDescription className="text-base">
                Everything you need to run your travel business
              </CardDescription>
              <div className="mt-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-medium text-muted-foreground">₹</span>
                  <span className="text-6xl font-bold text-foreground">18,799</span>
                </div>
                <p className="text-muted-foreground mt-2">per year</p>
                <p className="text-sm text-primary font-medium mt-1">
                  That's just ₹1,567/month!
                </p>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Money-Back Guarantee Badge */}
              <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">30-Day Money-Back Guarantee</p>
                    <p className="text-xs text-muted-foreground">Not satisfied? Get a full refund, no questions asked.</p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-6">
              <Button size="lg" className="w-full text-lg group" onClick={scrollToContact}>
                Get Started Now <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                No credit card required • 14-day free trial
              </p>

              {/* Payment Method Icons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="h-4 w-px bg-border" />
                {/* Payment Icons */}
                <div className="flex items-center gap-2">
                  {/* Visa */}
                  <div className="bg-card border border-border rounded px-2 py-1">
                    <span className="text-[10px] font-bold text-primary tracking-wider">VISA</span>
                  </div>
                  {/* Mastercard */}
                  <div className="bg-card border border-border rounded px-2 py-1 flex items-center gap-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/60 -ml-1" />
                  </div>
                  {/* UPI */}
                  <div className="bg-card border border-border rounded px-2 py-1">
                    <span className="text-[10px] font-bold text-foreground">UPI</span>
                  </div>
                  {/* RuPay */}
                  <div className="bg-card border border-border rounded px-2 py-1">
                    <span className="text-[10px] font-bold text-muted-foreground">RuPay</span>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Trust Elements */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-6 flex-wrap">
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
          <p className="text-muted-foreground text-sm">
            Trusted by <span className="font-semibold text-primary">500+</span> travel agencies worldwide
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
