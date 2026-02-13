import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PRICING_QUERY_KEY = ["pricing"];

interface PricingData {
  base_price: number;
  gst_percent: number;
  currency: string;
}

export const usePricing = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: PRICING_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "pricing")
        .single();
      if (error) throw error;
      return (data?.value as unknown as PricingData) ?? { base_price: 18799, gst_percent: 0, currency: "INR" };
    },
  });

  const basePrice = data?.base_price ?? 18799;
  const gstPercent = data?.gst_percent ?? 0;
  const totalPrice = basePrice * (1 + gstPercent / 100);
  const currency = data?.currency ?? "INR";
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "₹";

  const formattedPrice = `${symbol}${Math.round(totalPrice).toLocaleString("en-IN")}`;
  const formattedBasePrice = `${symbol}${Math.round(basePrice).toLocaleString("en-IN")}`;
  const pricePerDay = Math.round(totalPrice / 365);
  const pricePerMonth = Math.round(totalPrice / 12);

  return {
    basePrice,
    gstPercent,
    totalPrice,
    currency,
    symbol,
    formattedPrice,
    formattedBasePrice,
    pricePerDay,
    pricePerMonth,
    isLoading,
    error,
  };
};
