import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Shield,
  CreditCard,
  TrendingUp,
  Star,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useContactSettings } from "@/hooks/useContactSettings";

const coreInfrastructure = [
  "Flight API",
  "Hotel API",
  "Visa API",
  "Activities API",
  "Hajj Packages",
  "Umrah Packages",
  "Holiday Packages",
  "Car Transport at Destination",
  "Guide Module",
  "Group Flights Module",
  "Contracted Rates Access",
  "Admin Portal",
  "B2C Direct Booking Website",
  "Halal Travel Content Library",
  "Add Your Own Content",
];

const growthExtras = [
  "AI Sales Enquiry Handling Agent",
  "Supplier Portal",
  "B2B Sub-Agent Portal",
  "Free .in Domain (1 Year)",
];

const authorityExtras = [
  "Google Business Profile Setup",
  "LinkedIn Business Page Setup",
  "Instagram Business Setup",
  "Facebook Business Setup",
  "X Page Setup",
  "Professional Logo Design",
  "Social Media Banners",
];

const Pricing = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { whatsappUrl } = useContactSettings();

  return (
    <section id="pricing" className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative">

        {/* ── 1. Section Header ── */}
        <div
          ref={ref}
          className={`text-center mb-12 opacity-0 ${isVisible ? "animate-fade-in" : ""}`}
        >
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0">
            Subscription Plans
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4 max-w-3xl mx-auto leading-tight">
            Launch Your Own Travel Business — With Real Infrastructure
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-3">
            MarhabaDMC provides the complete operating layer for halal travel businesses — from global APIs and contracted rates to structured destination management and distribution tools.
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Every plan includes our core travel infrastructure. You simply decide how far you want to scale.
          </p>
        </div>

        {/* ── 2. Core Infrastructure Block ── */}
        <div className={`max-w-4xl mx-auto mb-14 opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.1s" }}>
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
              Core Infrastructure — Included in All Plans
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {coreInfrastructure.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Three-Plan Comparison Grid ── */}
        <div className={`max-w-5xl mx-auto mb-14 opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.2s" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Launch Plan */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full">
              <div className="mb-6">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Launch Plan</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-foreground">₹24,999</span>
                </div>
                <p className="text-xs text-muted-foreground">per year + GST</p>
              </div>

              <div className="border-t border-border pt-5 mb-6 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Includes</p>
                <ul className="space-y-2">
                  {coreInfrastructure.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="/signup">Get Started</a>
              </Button>
            </div>

            {/* Growth Plan — Most Popular */}
            <div className="relative md:scale-[1.03] flex flex-col">
              {/* Badge above card */}
              <div className="flex justify-center mb-3">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm shadow-md">
                  Most Popular
                </Badge>
              </div>

              <div className="bg-card border-2 border-primary rounded-2xl p-6 flex flex-col shadow-2xl shadow-primary/20 flex-1">
                <div className="mb-6">
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">Growth Plan</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-foreground">₹29,999</span>
                  </div>
                  <p className="text-xs text-muted-foreground">per year + GST</p>
                </div>

                <div className="border-t border-border pt-5 mb-6 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Includes All Core Infrastructure</p>
                  <ul className="space-y-2 mb-5">
                    {coreInfrastructure.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Also Includes</p>
                  <ul className="space-y-2">
                    {growthExtras.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full" asChild>
                  <a href="/signup">Get Started</a>
                </Button>
              </div>
            </div>

            {/* Authority Plan */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full">
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Authority Plan</p>
                  <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">
                    Complete Brand Setup
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-foreground">₹34,999</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">per year + GST</p>
              </div>

              <div className="border-t border-border pt-5 mb-6 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Includes All Core Infrastructure</p>
                <ul className="space-y-2 mb-4">
                  {coreInfrastructure.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Growth Additions</p>
                <ul className="space-y-2 mb-4">
                  {growthExtras.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Also Includes</p>
                <ul className="space-y-2">
                  {authorityExtras.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="/signup">Get Started</a>
              </Button>
            </div>
          </div>
        </div>

        {/* ── 4. Persuasion Blocks ── */}
        <div className={`max-w-4xl mx-auto mb-14 opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.3s" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-card border border-border rounded-2xl p-6 border-l-4 border-l-primary">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground">Why Most Choose Growth Plan</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For just ₹5,000 more than Launch, you unlock AI automation, supplier control, agent distribution, and free domain — making it the smart scaling choice.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 border-l-4 border-l-primary">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground">Why Authority Plan Wins Long-Term</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For another ₹5,000, you receive complete brand presence — logo, social media setup, and Google visibility structured from day one.
              </p>
            </div>
          </div>
        </div>

        {/* ── 5. CTA Section ── */}
        <div className={`text-center mb-14 opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.4s" }}>
          <h3 className="text-2xl font-bold text-foreground mb-6">Ready to Build Your Travel Business?</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <a href="/signup">Get Started Now</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Talk to Our Team</a>
            </Button>
          </div>
        </div>

        {/* ── 6. Trust Bar ── */}
        <div className={`opacity-0 ${isVisible ? "animate-fade-in" : ""}`} style={{ animationDelay: "0.5s" }}>
          <div className="border-t border-border pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 flex-wrap mb-4">
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
            <div className="flex items-center justify-center gap-3">
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
        </div>

      </div>
    </section>
  );
};

export default Pricing;
