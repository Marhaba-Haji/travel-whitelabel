import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PLANS_QUERY_KEY = ["plans_pricing"];

export interface PlanPricingData {
  launch: number;
  growth: number;
  authority: number;
  gst_percent: number;
  currency: string;
}

const DEFAULTS: PlanPricingData = {
  launch: 24999,
  growth: 29999,
  authority: 34999,
  gst_percent: 18,
  currency: "INR",
};

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

  return {
    pricing,
    gstPercent: gst_percent,
    currency,
    symbol,
    isLoading,
    error,
    priceWithGst,
    formatted,
    plans: [
      {
        key: "launch" as const,
        name: "Launch Plan",
        basePrice: pricing.launch,
        badge: null as string | null,
        highlight: false,
        extras: [] as string[],
      },
      {
        key: "growth" as const,
        name: "Growth Plan",
        basePrice: pricing.growth,
        badge: "Most Popular",
        highlight: true,
        extras: [
          "AI Sales Enquiry Handling Agent",
          "Supplier Portal",
          "B2B Sub-Agent Portal",
          "Free .in Domain (1 Year)",
        ],
      },
      {
        key: "authority" as const,
        name: "Authority Plan",
        basePrice: pricing.authority,
        badge: "Complete Brand Setup",
        highlight: false,
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

export type PlanKey = "launch" | "growth" | "authority";
