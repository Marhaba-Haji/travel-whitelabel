import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, planKey } = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ valid: false, error: "No coupon code provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (error || !coupon) {
      return new Response(JSON.stringify({ valid: false, error: "Invalid coupon code" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return new Response(JSON.stringify({ valid: false, error: "Coupon has expired" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
      return new Response(JSON.stringify({ valid: false, error: "Coupon usage limit reached" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check plan eligibility
    if (coupon.applicable_plans && planKey) {
      const plans = coupon.applicable_plans as string[];
      if (plans.length > 0 && !plans.includes(planKey)) {
        return new Response(JSON.stringify({ valid: false, error: "This coupon is not valid for the selected plan" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({
      valid: true,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      code: coupon.code,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ valid: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
