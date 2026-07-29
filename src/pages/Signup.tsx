import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import SignupForm from "@/components/auth/SignupForm";
import AuroraLogo from "@/components/AuroraLogo";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePlans, PlanKey, BillingCycle } from "@/hooks/usePlans";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import BillingCycleToggle from "@/components/landing/BillingCycleToggle";
import SEOHead from "@/components/seo/SEOHead";
import { ADDONS } from "@/lib/pricing";
import { Checkbox } from "@/components/ui/checkbox";

const Signup = () => {
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const { ref: plansRef, isVisible: plansVisible } = useScrollAnimation();
  const { plans, gstPercent, symbol, isLoading, priceFor, annualSavingsPercent, isPlanCycleUnavailable } = usePlans();
  const [searchParams] = useSearchParams();

  // Pre-select plan from ?plan= URL param, default growth
  const paramPlan = searchParams.get("plan") as PlanKey | null;
  const initialKey: PlanKey =
    paramPlan && ["launch", "growth", "authority"].includes(paramPlan)
      ? paramPlan
      : "growth";
  const [selectedPlanKey, setSelectedPlanKey] = useState<PlanKey>(initialKey);

  const paramCycle = searchParams.get("cycle");
  // Coerce Authority to annual — Authority is annual-only.
  const initialCycle: BillingCycle =
    paramCycle === "monthly" && initialKey !== "authority" ? "monthly" : "annual";
  const [cycle, setCycle] = useState<BillingCycle>(initialCycle);

  // Brand Setup Pack add-on. Pre-checked from ?addon=brand-setup, or forced
  // on (and locked) when Authority annual is selected (included free there).
  const paramAddon = searchParams.get("addon");
  const [brandSetupSelected, setBrandSetupSelected] = useState<boolean>(
    paramAddon === "brand-setup",
  );
  const brandSetupIncludedFree =
    selectedPlanKey === "authority" && cycle === "annual";

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Keep the cycle valid whenever the user picks Authority.
  useEffect(() => {
    if (selectedPlanKey === "authority" && cycle === "monthly") {
      setCycle("annual");
    }
  }, [selectedPlanKey, cycle]);

  const selectedPlan = plans.find((p) => p.key === selectedPlanKey) ?? plans[1];
  const selectedPrice = priceFor(selectedPlan.key, cycle);
  const cycleLabel = cycle === "monthly" ? "month" : "year";
  const growthSavings = annualSavingsPercent("growth");
  const savingsLabel = growthSavings > 0 ? `Save ${growthSavings}%` : null;

  // Add-ons passed to the payment flow. Brand Setup Pack is free with
  // Authority annual — it appears on the summary as a bonus (₹0 charge).
  const addOns = brandSetupSelected || brandSetupIncludedFree
    ? [
        {
          id: ADDONS.brandSetupPack.id,
          name: ADDONS.brandSetupPack.name,
          price: brandSetupIncludedFree ? 0 : ADDONS.brandSetupPack.price,
        },
      ]
    : [];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-white">
      <SEOHead
        title="Sign Up — Launch Your Travel Business"
        description="Create your marhabaDMC account and launch your white-label travel portal in 24 hours. Flight, hotel and visa APIs with AI sales tools."
        path="/signup"
        noIndex
      />
      {/* Soft brand wash */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2D9BFC]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#412A86]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start min-w-0">

          {/* ── Left: Signup Form ── */}
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
                  Create your account
                </h1>
                <p className="text-gray-500 text-sm">
                  Subscribing to{" "}
                  <span className="font-semibold text-[#412A86]">{selectedPlan.name}</span>
                  {" "}— {symbol}{selectedPrice.toLocaleString("en-IN")} + {gstPercent}% GST/{cycleLabel}
                </p>
              </div>

              <SignupForm
                selectedPlanName={selectedPlan.name}
                planBasePrice={selectedPrice}
                planKey={selectedPlan.key}
                billingCycle={cycle}
                symbol={symbol}
                gstPercent={gstPercent}
                addOns={addOns}
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
                <h2 className="font-poppins text-xl font-bold text-gray-900">Choose your plan</h2>
                <p className="text-sm text-gray-500 mt-1">
                  All plans include core travel infrastructure. Select below.
                </p>
              </div>

              <BillingCycleToggle
                value={cycle}
                onChange={setCycle}
                savingsLabel={savingsLabel}
                size="sm"
                className="mb-1"
              />

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                plans.map((plan) => {
                  const isSelected = selectedPlanKey === plan.key;
                  const cycleUnavailable = isPlanCycleUnavailable(plan.key, cycle);
                  // Annual-only plans show their annual price even in monthly view.
                  const displayCycle: BillingCycle = cycleUnavailable ? "annual" : cycle;
                  const planPrice = priceFor(plan.key, displayCycle);
                  const rowCycleLabel = displayCycle === "monthly" ? "month" : "year";
                  return (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => {
                        setSelectedPlanKey(plan.key);
                        if (cycleUnavailable) setCycle("annual");
                      }}
                      className={cn(
                        "w-full text-left rounded-3xl border-2 p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#412A86]",
                        isSelected
                          ? "border-[#412A86] bg-[#412A86]/5 shadow-soft-lg"
                          : "border-gray-100 bg-white hover:border-[#412A86]/40 shadow-soft"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={cn(
                              "font-poppins font-semibold text-base",
                              isSelected ? "text-[#412A86]" : "text-gray-900"
                            )}>
                              {plan.name}
                            </span>
                            {plan.badge && (
                              <Badge
                                className={cn(
                                  "text-xs px-2 py-0.5 border-0",
                                  plan.highlight
                                    ? "bg-[#412A86] text-white"
                                    : "bg-gray-100 text-gray-600"
                                )}
                              >
                                {plan.badge}
                              </Badge>
                            )}
                            {cycleUnavailable && (
                              <Badge className="text-[10px] px-2 py-0.5 border-0 bg-amber-50 text-amber-700">
                                Annual only
                              </Badge>
                            )}
                          </div>
                          {plan.subheadline && (
                            <p className="text-xs text-gray-500 mb-2 leading-snug">{plan.subheadline}</p>
                          )}

                          <div className="flex items-baseline gap-1 mb-3">
                            <span className="font-poppins text-2xl font-bold text-gray-900">
                              {symbol}{planPrice.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-gray-500">/ {rowCycleLabel} + {gstPercent}% GST</span>
                          </div>

                          {plan.extras.length > 0 && (
                            <ul className="space-y-1">
                              {plan.extras.map((extra) => (
                                <li key={extra} className="flex items-center gap-2 text-xs text-gray-600">
                                  <Check className="h-3 w-3 text-[#412A86] flex-shrink-0" />
                                  {extra}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Selection indicator */}
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                          isSelected
                            ? "border-[#412A86] bg-[#412A86]"
                            : "border-gray-200 bg-transparent"
                        )}>
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}

              {/* ── Add-ons ── */}
              <div className="rounded-2xl border border-[#412A86]/15 bg-gradient-to-br from-[#412A86]/[0.04] to-white p-4">
                <p className="text-[11px] font-bold text-[#412A86] uppercase tracking-[0.2em] mb-3">Add-ons</p>
                <label className={cn(
                  "flex items-start gap-3 cursor-pointer",
                  brandSetupIncludedFree && "cursor-default",
                )}>
                  <Checkbox
                    checked={brandSetupSelected || brandSetupIncludedFree}
                    disabled={brandSetupIncludedFree}
                    onCheckedChange={(v) => setBrandSetupSelected(Boolean(v))}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">
                        {ADDONS.brandSetupPack.name}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {brandSetupIncludedFree
                          ? "Included free"
                          : `${symbol}${ADDONS.brandSetupPack.price.toLocaleString("en-IN")} one-time + ${gstPercent}% GST`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">
                      Logo, Google Business Profile and 5 business social profiles — with full credential handover.
                    </p>
                  </div>
                </label>
              </div>

              {/* Shared infrastructure note */}
              <div className="bg-[#FAFAFC] border border-gray-100 rounded-2xl p-4 mt-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  All plans include
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    "Flight API", "Hotel API", "Visa API", "Activities API",
                    "Hajj & Umrah Packages", "Holiday Packages",
                    "Admin Portal", "B2C Booking Website",
                    "Contracted Rates Access", "Halal Content Library",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Check className="h-3 w-3 text-[#412A86] flex-shrink-0" />
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
