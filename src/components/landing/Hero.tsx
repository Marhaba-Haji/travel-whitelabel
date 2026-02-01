import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plane, Hotel, FileText, MapPin } from "lucide-react";

const Hero = () => {
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
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0">
              Complete Travel Tech Solution
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Complete
              <span className="text-primary"> Whitelabel B2B </span>
              Travel Portal
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Launch your own branded travel agency portal with flights, hotels, visas, activities & more — all integrated, all yours.
            </p>

            {/* Pricing Badge */}
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full mb-8 shadow-lg">
              <span className="text-sm font-medium">Starting at just</span>
              <span className="text-2xl font-bold">₹18,799</span>
              <span className="text-sm">/year</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" onClick={() => scrollToSection("#pricing")} className="shadow-lg">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection("#contact")}>
                Request Demo
              </Button>
              <Button size="lg" variant="ghost" onClick={() => scrollToSection("#contact")}>
                Contact Sales
              </Button>
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative hidden lg:block">
            <div className="relative bg-card rounded-2xl shadow-2xl border border-border p-6">
              {/* Mock Dashboard */}
              <div className="bg-primary/5 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/60" />
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                </div>
                <div className="text-sm font-medium text-foreground mb-2">Your Travel Agency Dashboard</div>
                <div className="h-2 bg-primary/20 rounded w-3/4 mb-2" />
                <div className="h-2 bg-primary/10 rounded w-1/2" />
              </div>

              {/* Feature Icons Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-accent rounded-lg p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Plane className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Flights</span>
                </div>
                <div className="bg-accent rounded-lg p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Hotel className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Hotels</span>
                </div>
                <div className="bg-accent rounded-lg p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Visas</span>
                </div>
                <div className="bg-accent rounded-lg p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Activities</span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
