import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plane, Hotel, FileText, MapPin, Globe, Users, Shield } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Hero = () => {
  const { ref: leftRef, isVisible: leftVisible } = useScrollAnimation();
  const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div
            ref={leftRef}
            className={`text-center lg:text-left opacity-0 ${leftVisible ? "animate-fade-in" : ""}`}
          >
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0">
              Complete Travel Tech Solution
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Complete
              <span className="text-primary"> Whitelabel B2B </span>
              Travel Portal
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-xl mx-auto lg:mx-0">
              Launch your own branded travel agency portal with flights, hotels, visas, activities & more — all integrated, all yours.
            </p>

            {/* Social Proof Badge */}
            <div className="inline-flex items-center gap-2 bg-muted/50 border border-border px-4 py-2 rounded-full mb-6">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                  <Users className="w-3 h-3 text-primary" />
                </div>
                <div className="w-6 h-6 rounded-full bg-primary/30 border-2 border-background" />
                <div className="w-6 h-6 rounded-full bg-primary/40 border-2 border-background" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Join <span className="text-primary font-semibold">500+</span> travel agencies
              </span>
            </div>

            {/* Pricing Badge */}
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full mb-8 shadow-lg">
              <span className="text-sm font-medium">Starting at just</span>
              <span className="text-2xl font-bold">₹18,799</span>
              <span className="text-sm">/year</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" onClick={() => scrollToSection("#pricing")} className="shadow-lg group">
                Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection("#contact")}>
                Request Demo
              </Button>
              <Button size="lg" variant="ghost" onClick={() => scrollToSection("#contact")}>
                Contact Sales
              </Button>
            </div>
          </div>

          {/* Right Content - Enhanced Browser Mockup */}
          <div
            ref={rightRef}
            className={`relative hidden lg:block opacity-0 ${rightVisible ? "animate-fade-in-right" : ""}`}
            style={{ animationDelay: "0.2s" }}
          >
            {/* Floating Travel Icons */}
            <div className="absolute -top-8 -left-8 animate-float" style={{ animationDelay: "0s" }}>
              <div className="w-14 h-14 rounded-2xl bg-card shadow-lg border border-border flex items-center justify-center">
                <Plane className="h-7 w-7 text-primary" />
              </div>
            </div>
            <div className="absolute top-1/4 -right-6 animate-float" style={{ animationDelay: "0.5s" }}>
              <div className="w-12 h-12 rounded-xl bg-card shadow-lg border border-border flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 animate-float-slow" style={{ animationDelay: "1s" }}>
              <div className="w-12 h-12 rounded-xl bg-card shadow-lg border border-border flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>

            {/* Browser Mockup with Glassmorphism */}
            <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-border overflow-hidden">
              {/* Browser Chrome */}
              <div className="bg-muted/50 px-4 py-3 flex items-center gap-3 border-b border-border">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                </div>
                <div className="flex-1 bg-background/50 rounded-lg px-4 py-1.5 text-xs text-muted-foreground">
                  yourbrand.com/dashboard
                </div>
              </div>
              
              {/* Dashboard Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm font-medium text-foreground mb-1">Your Travel Agency Dashboard</div>
                    <div className="text-xs text-muted-foreground">Complete whitelabel solution</div>
                  </div>
                  <div className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                    Live
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-accent/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-foreground">2,450</div>
                    <div className="text-xs text-muted-foreground">Bookings</div>
                  </div>
                  <div className="bg-accent/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-foreground">₹24L</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                  <div className="bg-accent/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-primary">+42%</div>
                    <div className="text-xs text-muted-foreground">Growth</div>
                  </div>
                </div>

                {/* Feature Icons Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-accent/30 rounded-lg p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors">
                    <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-lg shadow-sm">
                      <Plane className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Flights</span>
                  </div>
                  <div className="bg-accent/30 rounded-lg p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors">
                    <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-lg shadow-sm">
                      <Hotel className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Hotels</span>
                  </div>
                  <div className="bg-accent/30 rounded-lg p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors">
                    <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-lg shadow-sm">
                      <FileText className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Visas</span>
                  </div>
                  <div className="bg-accent/30 rounded-lg p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors">
                    <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-lg shadow-sm">
                      <MapPin className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Activities</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Glow Elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
