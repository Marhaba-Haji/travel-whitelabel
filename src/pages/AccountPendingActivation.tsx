import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Clock, Shield, Headphones, Leaf } from "lucide-react";
import LogoAnimated from "@/components/landing/LogoAnimated";
import { useEffect } from "react";
import { useContactSettings } from "@/hooks/useContactSettings";
import SEOHead from "@/components/seo/SEOHead";

const AccountPendingActivation = () => {
  const { email } = useContactSettings();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const steps = [
    {
      icon: Shield,
      text: "Our team is verifying your payment and reviewing your documents with care.",
    },
    {
      icon: Clock,
      text: "Full whitelabel access will be granted once verification is complete.",
    },
    {
      icon: Headphones,
      text: "A dedicated Partner Success specialist will reach out to welcome you aboard.",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-background">
      <SEOHead
        title="Account Pending Activation"
        description="Your marhabaDMC account is being verified. Start your travel business with a white-label portal, flight/hotel/visa APIs, AI sales assistant, training, and ongoing support. Our Partner Success team will reach out shortly."
        path="/account-pending"
        noIndex
      />
      {/* Refined ambient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.07] via-transparent to-transparent" />

      {/* Ambient blob - single orb kept */}
      <div className="absolute bottom-32 left-16 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-3xl p-10 sm:p-12 shadow-2xl shadow-primary/5 animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to home
          </Link>

          <div className="mb-8">
            <LogoAnimated size="lg" />
          </div>

          {/* Icon with gentle glow */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/10">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground text-center mb-4 tracking-tight">
            You&apos;re In — We&apos;re Preparing Your Journey
          </h1>

          <p className="text-muted-foreground text-center text-lg leading-relaxed mb-2 max-w-xl mx-auto">
            Thank you for signing in. Your account has been successfully authenticated, and we&apos;re now completing the final steps to give you full access to the whitelabel platform.
          </p>

          <p className="text-muted-foreground text-center text-base leading-relaxed mb-10 max-w-xl mx-auto">
            There&apos;s nothing to worry about — everything is in order. Take a moment to relax; our team is working behind the scenes to make your experience seamless.
          </p>

          {/* Steps */}
          <div className="space-y-5 mb-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
              <div
                key={index}
                className="flex gap-4 items-start p-4 rounded-xl bg-muted/40 border border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-foreground/90 text-sm sm:text-base leading-relaxed pt-1.5">
                  {step.text}
                </p>
              </div>
            );
            })}
          </div>

          {/* Reassuring closing message */}
          <div className="flex items-start gap-3 p-5 rounded-2xl bg-accent/30 border border-primary/10 mb-10">
            <Leaf className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground font-medium mb-1">
                Worth the wait
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your Partner Success contact will reach out soon. In the meantime, we invite you to explore our website and get excited about what&apos;s ahead. The best experiences begin with a little anticipation.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Explore our website
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Questions?{" "}
              <a
                href={`mailto:${email}`}
                className="text-primary hover:underline font-medium"
              >
                {email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPendingActivation;
