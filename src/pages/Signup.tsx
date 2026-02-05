import { Link } from "react-router-dom";
import { ArrowLeft, Rocket, Users, TrendingUp, CheckCircle, Zap, DollarSign, Calendar, Sparkles } from "lucide-react";
import LogoAnimated from "@/components/landing/LogoAnimated";
import SignupForm from "@/components/auth/SignupForm";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Signup = () => {
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const { ref: visualRef, isVisible: visualVisible } = useScrollAnimation();

  const benefits = [
    { icon: Rocket, text: "Launch in 24 Hours", color: "text-primary" },
    { icon: TrendingUp, text: "Start Earning Immediately", color: "text-gold" },
    { icon: CheckCircle, text: "Complete Training Included", color: "text-primary" },
  ];

  const successStories = [
    {
      name: "Fatima Sheikh",
      city: "Delhi",
      achievement: "Earned ₹2L in first month",
    },
    {
      name: "Hassan Ali",
      city: "Mumbai",
      achievement: "500+ bookings completed",
    },
    {
      name: "Zainab Khan",
      city: "Bangalore",
      achievement: "Full-time travel entrepreneur",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      {/* Floating decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:items-start min-w-0">
          {/* Left Side - Signup Form */}
          <div
            ref={formRef}
            className={`w-full max-w-md mx-auto lg:mx-0 lg:max-w-none min-w-0 opacity-0 ${formVisible ? "animate-fade-in" : ""}`}
          >
            {/* Back to Home Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 lg:mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            {/* Logo */}
            <div className="mb-8 lg:mb-4">
              <LogoAnimated size="lg" />
            </div>

            {/* Form Card */}
            <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Create your account
                </h1>
                <p className="text-muted-foreground">
                  Start your travel agency journey today
                </p>
              </div>

              <SignupForm />
            </div>

            {/* Benefits - Mobile */}
            <div className="mt-8 lg:hidden">
              <div className="flex flex-wrap items-center justify-center gap-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <benefit.icon className={`h-4 w-4 ${benefit.color}`} />
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Pricing Section */}
          <div
            ref={visualRef}
            className={`w-full max-w-md mx-auto lg:mx-0 lg:max-w-none min-w-0 opacity-0 ${visualVisible ? "animate-fade-in-right" : ""}`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative w-full max-w-full">
              {/* Pricing Card */}
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-gold/10 rounded-3xl p-6 sm:p-8 lg:p-12 border-2 border-primary/30 backdrop-blur-sm shadow-2xl relative overflow-hidden w-full">
                {/* Animated Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5 animate-pulse-soft" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                
                <div className="relative z-10 space-y-8">
                  {/* Header */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 px-4 py-2 rounded-full mb-4">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">Special Launch Price</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                      Your Complete Travel Business Platform
                    </h2>
                    <p className="text-muted-foreground">
                      Everything you need to start earning
                    </p>
                  </div>

                  {/* Main Price Display */}
                  <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-2xl p-4 sm:p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary animate-gradient-shift bg-[length:200%_auto]" />
                    
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-baseline justify-center gap-1 sm:gap-2">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">₹</span>
                        <span className="text-4xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-gold to-primary animate-gradient-shift bg-[length:200%_auto]">
                          18,799
                        </span>
                        <span className="text-lg sm:text-xl lg:text-2xl text-muted-foreground">/year</span>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Just ₹1,567/month</span>
                      </div>
                      
                      <div className="pt-4 border-t border-border">
                        <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-gold/20 border border-gold/30 px-3 sm:px-4 py-2 rounded-full max-w-full">
                          <Zap className="h-4 w-4 text-gold flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold text-gold text-center">Save ₹25,00,000+ vs Building Your Own</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Value Breakdown */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-foreground text-center">What's Included:</h3>
                    <div className="grid gap-3">
                      {[
                        { icon: Rocket, text: "Complete White-Label Portal", value: "₹50,000" },
                        { icon: Users, text: "Full Training & Support", value: "₹25,000" },
                        { icon: TrendingUp, text: "Marketing Tools & Templates", value: "₹30,000" },
                        { icon: CheckCircle, text: "6 days Technical Support", value: "₹15,000" },
                        { icon: DollarSign, text: "Payment Gateway Setup", value: "₹10,000" },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-card/60 backdrop-blur-sm border border-border rounded-xl p-4 hover:shadow-lg transition-all hover:border-primary/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <item.icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium text-foreground text-sm lg:text-base">{item.text}</span>
                          </div>
                          <span className="text-sm font-bold text-gold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ROI Calculator */}
                  <div className="bg-gradient-to-br from-primary/10 to-gold/10 border border-primary/20 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-foreground">Potential ROI</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average Monthly Bookings</span>
                        <span className="font-bold text-foreground">50+</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg. Commission per Booking</span>
                        <span className="font-bold text-foreground">₹4,000</span>
                      </div>
                      <div className="pt-3 border-t border-primary/20">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">Monthly Earning Potential</span>
                          <span className="text-xl font-bold text-gold">₹2,00,000+</span>
                        </div>
                      </div>
                      <div className="text-xs text-center text-muted-foreground pt-2">
                        Break even in just <span className="font-bold text-primary">3 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float hidden lg:block pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gold/5 rounded-full blur-3xl animate-float-slow hidden lg:block pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
