import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function sha512(input: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = new Uint8Array(64);
  // Use Web Crypto API
  return "";
}

async function generatePayUHash(
  params: Record<string, string>,
  salt: string
): Promise<string> {
  const hashString = [
    params.key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || "",
    params.udf2 || "",
    params.udf3 || "",
    params.udf4 || "",
    params.udf5 || "",
    "",
    "",
    "",
    "",
    "",
    salt,
  ].join("|");

  const encoder = new TextEncoder();
  const data = encoder.encode(hashString);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hashSync(String(password), 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYU_KEY = Deno.env.get("PAYU_KEY");
    const PAYU_SALT = Deno.env.get("PAYU_SALT");
    const PAYU_MODE = Deno.env.get("PAYU_MODE") || "test";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const PAYU_ACTION =
      PAYU_MODE === "production"
        ? "https://secure.payu.in/_payment"
        : "https://test.payu.in/_payment";

    // Frontend URL for redirects - derive from request origin or use a fallback
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || "";
    const FRONTEND_URL = origin || "https://marhabadmc.com";

    // Backend URL for PayU callbacks (edge function URL)
    const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { fullName, email, phone, city, password, termsAccepted, couponCode, planName, planBasePrice, billingCycle } = body;
    const cycle: "monthly" | "annual" = billingCycle === "monthly" ? "monthly" : "annual";
    const cycleLabel = cycle === "monthly" ? "Monthly" : "Annual";
    const planLabel = planName ? `${String(planName).trim().slice(0, 80)} — ${cycleLabel}` : `Subscription — ${cycleLabel}`;

    if (!email || !fullName || !phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: fullName, email, phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create registration
    const passwordHash = password ? await hashPassword(String(password)) : null;
    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .insert({
        full_name: String(fullName).trim().slice(0, 100),
        email: String(email).trim().slice(0, 255),
        phone: String(phone).replace(/\D/g, "").slice(-10) || String(phone).trim(),
        city: city ? String(city).trim().slice(0, 100) : null,
        password_hash: passwordHash,
        terms_accepted: Boolean(termsAccepted),
        plan_name: planLabel.slice(0, 100),
      })
      .select("id")
      .single();

    if (regErr) {
      console.error("Registration insert error:", regErr);
      const userMessage = regErr.code === "23505"
        ? "An account with this email already exists."
        : "Registration failed. Please try again.";
      return new Response(
        JSON.stringify({ error: "Registration failed", message: userMessage }),
        { status: regErr.code === "23505" ? 400 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const registrationId = reg?.id;

    // If PayU not configured, return error in production
    if (!PAYU_KEY || !PAYU_SALT) {
      console.error("PAYU_KEY or PAYU_SALT not configured");
      return new Response(
        JSON.stringify({ error: "Payment system unavailable", message: "Service temporarily unavailable. Please try again later." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate amount — use plan price if provided, else fall back to site_settings
    let basePrice: number;
    let gstPercent: number;

    // Read GST from plans_pricing (the key used by the admin CMS)
    const { data: plansPricing } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "plans_pricing")
      .single();
    const pv = (plansPricing?.value as Record<string, unknown>) || {};
    gstPercent = Number(pv.gst_percent) || 18;

    if (planBasePrice && typeof planBasePrice === "number" && planBasePrice > 0) {
      basePrice = planBasePrice;
    } else {
      // Fallback: use launch price from plans_pricing or legacy pricing
      basePrice = Number(pv.launch) || 24999;
    }

    let total = basePrice * (1 + gstPercent / 100);

    let appliedCouponCode: string | null = null;

    // Apply coupon
    if (couponCode && String(couponCode).trim()) {
      const code = String(couponCode).trim().toUpperCase();
      const { data: coupon, error: couponErr } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, max_uses, times_used, valid_until, is_active")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();

      if (!couponErr && coupon) {
        const now = new Date();
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
        const underMaxUses = coupon.max_uses == null || coupon.times_used < coupon.max_uses;

        // Derive planKey from planName (e.g. "Growth Plan" -> "growth")
        const planKey = planName ? String(planName).replace(/\s*plan\s*/i, "").trim().toLowerCase() : null;
        const applicablePlans = (coupon as Record<string, unknown>).applicable_plans as string[] | null;
        const planAllowed = !applicablePlans || !planKey || applicablePlans.includes(planKey);

        if ((!validUntil || validUntil >= now) && underMaxUses && planAllowed) {
          if (coupon.discount_type === "percentage") {
            total = total * (1 - Number(coupon.discount_value) / 100);
          } else {
            total = Math.max(0, total - Number(coupon.discount_value));
          }
          appliedCouponCode = coupon.code;
          await supabase
            .from("coupons")
            .update({ times_used: coupon.times_used + 1, updated_at: new Date().toISOString() })
            .eq("id", coupon.id);
        }
      }
    }

    const amount = Math.max(0.01, total).toFixed(2);
    const txnid = `TXN${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const productinfo = planName
      ? `MarhabaDMC ${planName} - ${cycleLabel} Subscription`
      : `MarhabaDMC Travel Agency Platform - ${cycleLabel} Subscription`;
    const firstname = (fullName || "").split(" ")[0] || fullName;

    const surl = `${EDGE_BASE}/payu-callback`;
    const furl = `${EDGE_BASE}/payu-callback`;

    const params: Record<string, string> = {
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email: String(email).trim(),
      phone: (phone || "").replace(/\D/g, "").slice(-10),
      surl,
      furl,
      udf1: city || "",
      udf2: fullName || "",
      udf3: registrationId || "",
      udf4: appliedCouponCode || "",
      udf5: FRONTEND_URL, // store frontend URL for redirect
    };

    const hash = await generatePayUHash(params, PAYU_SALT);
    params.hash = hash;

    // Save payment record
    await supabase.from("payments").insert({
      registration_id: registrationId,
      txn_id: txnid,
      amount: parseFloat(amount),
      currency: "INR",
      product_info: productinfo,
      status: "initiated",
      success_url: surl,
      failure_url: furl,
    });

    return new Response(
      JSON.stringify({ action: PAYU_ACTION, params }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-payment error:", err);
    return new Response(
      JSON.stringify({ error: "Server error", message: "Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
