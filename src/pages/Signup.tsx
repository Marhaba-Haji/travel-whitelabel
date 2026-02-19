import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import SignupForm from "@/components/auth/SignupForm";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePlans, PlanKey } from "@/hooks/usePlans";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Signup = () => {
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const { ref: plansRef, isVisible: plansVisible } = useScrollAnimation();
  const { plans, gstPercent, symbol, isLoading } = usePlans();
  const [searchParams] = useSearchParams();

  // Pre-select plan from ?plan= URL param, default growth
  const paramPlan = searchParams.get("plan") as PlanKey | null;
  const initialKey: PlanKey =
    paramPlan && ["launch", "growth", "authority"].includes(paramPlan)
      ? paramPlan
      : "growth";
  const [selectedPlanKey, setSelectedPlanKey] = useState<PlanKey>(initialKey);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const selectedPlan = plans.find((p) => p.key === selectedPlanKey) ?? plans[1];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: "1s" }} />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start min-w-0">

          {/* ── Left: Signup Form ── */}
          <div
            ref={formRef}
            className={`w-full max-w-md mx-auto lg:mx-0 lg:max-w-none min-w-0 opacity-0 ${formVisible ? "animate-fade-in" : ""}`}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 lg:mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <div className="mb-8 lg:mb-4">
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

            <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Create your account
                </h1>
                <p className="text-muted-foreground text-sm">
                  Subscribing to{" "}
                  <span className="font-semibold text-primary">{selectedPlan.name}</span>
                  {" "}— {symbol}{selectedPlan.basePrice.toLocaleString("en-IN")} + {gstPercent}% GST/year
                </p>
              </div>

              <SignupForm
                selectedPlanName={selectedPlan.name}
                planBasePrice={selectedPlan.basePrice}
                symbol={symbol}
                gstPercent={gstPercent}
              />
            </div>
          </div>

          {/* ── Right: Plan Selector ── */}
          <div
            ref={plansRef}
            className={`w-full max-w-md mx-auto lg:mx-0 lg:max-w-none min-w-0 opacity-0 ${plansVisible ? "animate-fade-in-right" : ""}`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="space-y-4">
              <div className="mb-2">
                <h2 className="text-xl font-bold text-foreground">Choose your plan</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  All plans include core travel infrastructure. Select below.
                </p>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                plans.map((plan) => {
                  const isSelected = selectedPlanKey === plan.key;
                  return (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => setSelectedPlanKey(plan.key)}
                      className={cn(
                        "w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={cn(
                              "font-semibold text-base",
                              isSelected ? "text-primary" : "text-foreground"
                            )}>
                              {plan.name}
                            </span>
                            {plan.badge && (
                              <Badge
                                className={cn(
                                  "text-xs px-2 py-0.5 border-0",
                                  plan.highlight
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {plan.badge}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-2xl font-bold text-foreground">
                              {symbol}{plan.basePrice.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-muted-foreground">/ year + {gstPercent}% GST</span>
                          </div>

                          {plan.extras.length > 0 && (
                            <ul className="space-y-1">
                              {plan.extras.map((extra) => (
                                <li key={extra} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Check className="h-3 w-3 text-primary flex-shrink-0" />
                                  {extra}
                                </li>
                              ))}
                            </ul>
                          )}

                          {plan.key === "launch" && (
                            <p className="text-xs text-muted-foreground">
                              Core travel infrastructure — all 15 APIs and portals included.
                            </p>
                          )}
                        </div>

                        {/* Selection indicator */}
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-border bg-transparent"
                        )}>
                          {isSelected && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}

              {/* Shared infrastructure note */}
              <div className="bg-muted/50 border border-border rounded-xl p-4 mt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  All plans include
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    "Flight API", "Hotel API", "Visa API", "Activities API",
                    "Hajj & Umrah Packages", "Holiday Packages",
                    "Admin Portal", "B2C Booking Website",
                    "Contracted Rates Access", "Halal Content Library",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-primary flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;
