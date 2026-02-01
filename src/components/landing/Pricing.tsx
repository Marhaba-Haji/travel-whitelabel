import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";

const Pricing = () => {
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
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Simple Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            One Plan, Everything Included
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees, no complicated tiers. Get access to all features at one transparent price.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="relative border-2 border-primary shadow-xl">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm">
                Most Popular
              </Badge>
            </div>

            <CardHeader className="text-center pt-8">
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
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-6">
              <Button size="lg" className="w-full text-lg" onClick={scrollToContact}>
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                No credit card required • 14-day free trial
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Trust Elements */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Trusted by 500+ travel agencies worldwide
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
