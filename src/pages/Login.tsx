import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Shield, Users, TrendingUp } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect } from "react";

const Login = () => {
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const { ref: visualRef, isVisible: visualVisible } = useScrollAnimation();
  const location = useLocation();

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
      // Also scroll documentElement and body for cross-browser compatibility
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [location.pathname]);

  const trustIndicators = [
    { icon: Users, text: "5000+ travelers looking for travel agents online every hour", color: "text-primary" },
    { icon: TrendingUp, text: "Earn 50,000 per month on average", color: "text-gold" },
    { icon: Shield, text: "Secure & Trusted", color: "text-primary" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-slow" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* Left Side - Login Form */}
          <div
            ref={formRef}
            className={`w-full opacity-0 ${formVisible ? "animate-fade-in" : ""}`}
          >
            {/* Back to Home Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            {/* Logo - matches header */}
            <div className="mb-8">
              <Link to="/" className="flex items-center gap-2.5">
                <img
                  src="/assets/marhaba-dmc-logo.png"
                  alt="marhabaDMC"
                  className="h-10 w-auto object-contain flex-shrink-0"
                />
                <span className="text-2xl leading-none">
                  <span className="font-marhaba text-foreground">marhaba</span>
                  <span className="font-dmc font-semibold text-primary">DMC</span>
                </span>
              </Link>
            </div>

            {/* Form Card */}
            <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back
                </h1>
                <p className="text-muted-foreground">
                  Sign in to access your travel agency portal
                </p>
              </div>

              <LoginForm />
            </div>

            {/* Trust Indicators - Mobile */}
            <div className="mt-8 lg:hidden">
              <div className="flex flex-wrap items-center justify-center gap-6">
                {trustIndicators.map((indicator, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <indicator.icon className={`h-4 w-4 ${indicator.color}`} />
                    <span>{indicator.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Visual/Decorative (Desktop only) */}
          <div
            ref={visualRef}
            className={`hidden lg:block opacity-0 ${visualVisible ? "animate-fade-in-right" : ""}`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative">
              {/* Decorative Card */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-12 border border-primary/20 backdrop-blur-sm">
                <div className="space-y-8">
                  {/* Main Visual Element */}
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl animate-glow-pulse">
                        <Shield className="h-16 w-16 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gold rounded-full flex items-center justify-center animate-bounce-subtle">
                        <Shield className="h-4 w-4 text-gold-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="space-y-6">
                    {trustIndicators.map((indicator, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
                        style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                      >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ${indicator.color}`}>
                          <indicator.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{indicator.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="text-center pt-4">
                    <p className="text-lg font-medium text-foreground mb-2">
                      "Join thousands of successful travel entrepreneurs"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Start your journey today
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float-slow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
