import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Mail } from "lucide-react";
import LogoAnimated from "@/components/landing/LogoAnimated";
import { useEffect, useState } from "react";

const SignupSuccess = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    try {
      const pending = sessionStorage.getItem("signup_payment_pending");
      if (pending) {
        const data = JSON.parse(pending);
        setUserEmail(data.email ?? null);
        sessionStorage.removeItem("signup_payment_pending");
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: "1s" }} />

      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl text-center animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to home
          </Link>

          <div className="mb-6">
            <LogoAnimated size="lg" />
          </div>

          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Registration Successful!
          </h1>
          <p className="text-muted-foreground mb-6">
            Welcome to marhabaDMC! Your account has been created and your payment has been processed.
          </p>

          {userEmail && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8 p-4 bg-muted/50 rounded-xl">
              <Mail className="h-4 w-4" />
              <span>Check your inbox at <strong className="text-foreground">{userEmail}</strong> for next steps.</span>
            </div>
          )}

          <div className="space-y-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign in to your account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccess;
