import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Shield, Users, TrendingUp } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import AuroraLogo from "@/components/AuroraLogo";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect } from "react";
import SEOHead from "@/components/seo/SEOHead";

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
    { icon: TrendingUp, text: "Earning potential of ₹50,000+/month", color: "text-aurora-pink" },
    { icon: Shield, text: "Secure & Trusted", color: "text-primary" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-white">
      <SEOHead
        title="Sign In"
        description="Sign in to your marhabaDMC partner account to manage bookings, leads, and start your travel business with a white-label portal, flight/hotel/visa APIs, AI sales assistant, training, and ongoing support."
        path="/login"
        noIndex
      />
      {/* Soft brand wash */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2D9BFC]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#412A86]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start min-w-0">

          {/* ── Left: Login Form ── */}
          <div
            ref={formRef}
            className={`w-full max-w-md mx-auto lg:mx-0 lg:max-w-none min-w-0 opacity-0 ${formVisible ? "animate-fade-in" : ""}`}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#412A86] transition-colors mb-8 lg:mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <div className="mb-8 lg:mb-4">
              <AuroraLogo size="lg" />
            </div>

            <div className="rounded-3xl bg-white border border-gray-100 shadow-soft p-8">
              <div className="mb-6">
                <h1 className="font-poppins text-3xl font-bold text-gray-900 mb-2">
                  Welcome back
                </h1>
                <p className="text-gray-500 text-sm">
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
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <indicator.icon className={`h-4 w-4 ${indicator.color}`} />
                    <span>{indicator.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Visual / Trust Panel ── */}
          <div
            ref={visualRef}
            className={`hidden lg:block opacity-0 ${visualVisible ? "animate-fade-in-right" : ""}`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative">
              <div className="rounded-3xl bg-white border border-gray-100 shadow-soft p-12">
                <div className="space-y-8">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#412A86] to-[#412A86]/60 flex items-center justify-center shadow-2xl">
                        <Shield className="h-16 w-16 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#2D9BFC] rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {trustIndicators.map((indicator, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 rounded-xl p-4 hover:shadow-xl transition-shadow bg-white border border-gray-50"
                        style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                      >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-[#412A86]/10 to-[#412A86]/5 flex items-center justify-center ${indicator.color}`}>
                          <indicator.icon className="h-6 w-6 text-[#412A86]" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{indicator.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      "Join thousands of successful travel entrepreneurs"
                    </p>
                    <p className="text-sm text-gray-500">
                      Start your journey today
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
