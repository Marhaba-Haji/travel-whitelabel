import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PLAN_DEFAULTS, PLAN_META, AUTHORITY_ANNUAL_ONLY, type PlanPricingData, type PlanKey as _PlanKey } from "@/lib/pricing";

export const PLANS_QUERY_KEY = ["plans_pricing"];

export type BillingCycle = "monthly" | "annual";

export type { PlanPricingData };
const DEFAULTS = PLAN_DEFAULTS;

export const usePlans = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "plans_pricing")
        .single();
      if (error) throw error;
      return { ...DEFAULTS, ...(data?.value as Partial<PlanPricingData>) } as PlanPricingData;
    },
  });

  const pricing = data ?? DEFAULTS;
  const { gst_percent, currency } = pricing;
  const symbol = currency === "USD" ? "$" : "₹";

  const priceWithGst = (base: number) => Math.round(base * (1 + gst_percent / 100));
  const formatted = (base: number) =>
    `${symbol}${priceWithGst(base).toLocaleString("en-IN")}`;

  const priceFor = (key: PlanKey, cycle: BillingCycle): number => {
    if (cycle === "monthly") {
      // Authority is annual-only; never expose a monthly price.
      if (key === "authority" && AUTHORITY_ANNUAL_ONLY) return pricing.authority;
      if (key === "launch") return pricing.launch_monthly;
      if (key === "growth") return pricing.growth_monthly;
      return pricing.authority;
    }
    if (key === "launch") return pricing.launch;
    if (key === "growth") return pricing.growth;
    return pricing.authority;
  };

  // Returns true when the requested (plan, cycle) pair is not offered
  // (currently: Authority + monthly). Components should switch to the
  // annual price + an "Annual only" state when this is true.
  const isPlanCycleUnavailable = (key: PlanKey, cycle: BillingCycle): boolean =>
    AUTHORITY_ANNUAL_ONLY && key === "authority" && cycle === "monthly";

  const annualSavingsPercent = (key: PlanKey): number => {
    if (key === "authority" && AUTHORITY_ANNUAL_ONLY) return 0;
    const m = priceFor(key, "monthly") * 12;
    const a = priceFor(key, "annual");
    if (!m || !a || a >= m) return 0;
    return Math.round(((m - a) / m) * 100);
  };

  return {
    pricing,
    gstPercent: gst_percent,
    currency,
    symbol,
    isLoading,
    error,
    priceWithGst,
    formatted,
    priceFor,
    isPlanCycleUnavailable,
    annualSavingsPercent,
    plans: [
      {
        key: "launch" as const,
        name: PLAN_META.launch.name,
        subheadline: PLAN_META.launch.subheadline,
        basePrice: pricing.launch,
        monthlyPrice: pricing.launch_monthly,
        badge: PLAN_META.launch.badge,
        highlight: PLAN_META.launch.highlight,
        extras: [] as string[],
      },
      {
        key: "growth" as const,
        name: PLAN_META.growth.name,
        subheadline: PLAN_META.growth.subheadline,
        basePrice: pricing.growth,
        monthlyPrice: pricing.growth_monthly,
        badge: PLAN_META.growth.badge,
        highlight: PLAN_META.growth.highlight,
        extras: [
          "AI Sales Enquiry Handling Agent",
          "Supplier Portal",
          "B2B Sub-Agent Portal",
          "Free .in Domain (1 Year)",
        ],
      },
      {
        key: "authority" as const,
        name: PLAN_META.authority.name,
        subheadline: PLAN_META.authority.subheadline,
        basePrice: pricing.authority,
        // Authority has no monthly price — annual-only product.
        monthlyPrice: pricing.authority,
        badge: PLAN_META.authority.badge,
        highlight: PLAN_META.authority.highlight,
        annualOnly: true as const,
        extras: [
          "Everything in Growth",
          "Google & LinkedIn Setup",
          "Instagram & Facebook Setup",
          "Professional Logo Design",
          "Social Media Banners",
        ],
      },
    ],
  };
};

export type PlanKey = _PlanKey;
