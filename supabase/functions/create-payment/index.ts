import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// udf5 is echoed back by PayU and used as the redirect target in payu-callback,
// so only known frontend origins may be embedded in it.
const ALLOWED_FRONTEND_HOSTS = new Set([
  "marhabadmc.com",
  "www.marhabadmc.com",
  "localhost",
  "127.0.0.1",
]);
const DEFAULT_FRONTEND = "https://marhabadmc.com";

function resolveFrontendUrl(req: Request): string {
  const raw = req.headers.get("origin") || req.headers.get("referer") || "";
  try {
    const u = new URL(raw);
    if ((u.protocol === "https:" || u.protocol === "http:") && ALLOWED_FRONTEND_HOSTS.has(u.hostname)) {
      return u.origin;
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_FRONTEND;
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

type PlanKey = "launch" | "growth" | "authority";

function normalizePlanKey(planKey: unknown, planName: unknown): PlanKey {
  const candidate = String(planKey || "")
    .trim()
    .toLowerCase() ||
    String(planName || "")
      .replace(/\s*plan\s*/i, "")
      .trim()
      .toLowerCase();
  if (candidate === "launch" || candidate === "growth" || candidate === "authority") {
    return candidate;
  }
  return "launch";
}

// Server-side add-on price allowlist. Source of truth mirrored from
// src/lib/pricing.ts (ADDONS). Client-supplied prices are ignored so the
// browser can never choose what it pays.
const ADDON_PRICES: Record<string, { name: string; price: number }> = {
  "brand-setup": { name: "Brand Setup Pack", price: 14999 },
  "social-media-management": { name: "Social Media Management", price: 5000 },
};

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

    const FRONTEND_URL = resolveFrontendUrl(req);

    // Backend URL for PayU callbacks (edge function URL)
    const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { fullName, email, phone, city, password, termsAccepted, couponCode, planName, planKey, billingCycle, addOns } = body;
    const resolvedPlanKeyEarly = normalizePlanKey(planKey, planName);
    // Authority is annual-only — force annual cycle regardless of client input.
    const cycle: "monthly" | "annual" =
      resolvedPlanKeyEarly === "authority"
        ? "annual"
        : billingCycle === "monthly"
        ? "monthly"
        : "annual";
    const cycleLabel = cycle === "monthly" ? "Monthly" : "Annual";
    const planLabel = planName ? `${String(planName).trim().slice(0, 80)} — ${cycleLabel}` : `Subscription — ${cycleLabel}`;

    if (!email || !fullName || !phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: fullName, email, phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedEmail = String(email).trim().slice(0, 255);
    const passwordHash = password ? await hashPassword(String(password)) : null;
    const registrationFields = {
      full_name: String(fullName).trim().slice(0, 100),
      email: trimmedEmail,
      phone: String(phone).replace(/\D/g, "").slice(-10) || String(phone).trim(),
      city: city ? String(city).trim().slice(0, 100) : null,
      password_hash: passwordHash,
      terms_accepted: Boolean(termsAccepted),
      plan_name: planLabel.slice(0, 100),
    };

    // A registration may already exist for this email (pre-payment lead capture
    // or an earlier failed/abandoned attempt). Reuse it so retries work; only a
    // completed payment blocks re-registration.
    let registrationId: string | null = null;
    const { data: existingReg } = await supabase
      .from("registrations")
      .select("id, status")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (existingReg) {
      if (existingReg.status === "payment_completed") {
        return new Response(
          JSON.stringify({ error: "Registration failed", message: "An account with this email already exists." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { error: updErr } = await supabase
        .from("registrations")
        .update({ ...registrationFields, updated_at: new Date().toISOString() })
        .eq("id", existingReg.id);
      if (updErr) {
        console.error("Registration update error:", updErr);
        return new Response(
          JSON.stringify({ error: "Registration failed", message: "Registration failed. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      registrationId = existingReg.id;
    } else {
      const { data: reg, error: regErr } = await supabase
        .from("registrations")
        .insert(registrationFields)
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
      registrationId = reg?.id ?? null;
    }

    // If PayU not configured, return error in production
    if (!PAYU_KEY || !PAYU_SALT) {
      console.error("PAYU_KEY or PAYU_SALT not configured");
      return new Response(
        JSON.stringify({ error: "Payment system unavailable", message: "Service temporarily unavailable. Please try again later." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Price is resolved server-side from site_settings; any client-sent amount
    // is ignored so the browser can never choose what it pays.
    const { data: plansPricing } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "plans_pricing")
      .single();
    const pv = (plansPricing?.value as Record<string, unknown>) || {};
    const gstPercent = Number(pv.gst_percent) || 18;

    const resolvedPlanKey = resolvedPlanKeyEarly;
    const priceField = cycle === "monthly" ? `${resolvedPlanKey}_monthly` : resolvedPlanKey;
    const fallbackPrices: Record<string, number> = {
      launch: 19999, growth: 29999, authority: 39999,
      launch_monthly: 2999, growth_monthly: 3999,
    };
    const basePrice = Number(pv[priceField]) > 0 ? Number(pv[priceField]) : fallbackPrices[priceField];

    // Add-ons: validate every incoming id against the allowlist. Brand Setup
    // Pack is bundled free with Authority annual, so charge ₹0 there.
    let addOnsBase = 0;
    const validatedAddOnLabels: string[] = [];
    if (Array.isArray(addOns)) {
      for (const raw of addOns) {
        const id = String((raw && raw.id) || "").trim();
        const entry = ADDON_PRICES[id];
        if (!entry) continue;
        const isFree = id === "brand-setup" && resolvedPlanKey === "authority" && cycle === "annual";
        addOnsBase += isFree ? 0 : entry.price;
        validatedAddOnLabels.push(isFree ? `${entry.name} (free)` : entry.name);
      }
    }

    let total = (basePrice + addOnsBase) * (1 + gstPercent / 100);

    let appliedCouponCode: string | null = null;

    // Apply coupon discount. NOTE: times_used is only incremented in
    // payu-callback after the payment is verified successful.
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

        const applicablePlans = (coupon as Record<string, unknown>).applicable_plans as string[] | null;
        const planAllowed = !applicablePlans || applicablePlans.includes(resolvedPlanKey);

        if ((!validUntil || validUntil >= now) && underMaxUses && planAllowed) {
          if (coupon.discount_type === "percentage") {
            total = total * (1 - Number(coupon.discount_value) / 100);
          } else {
            total = Math.max(0, total - Number(coupon.discount_value));
          }
          appliedCouponCode = coupon.code;
        }
      }
    }

    const amount = Math.max(0.01, total).toFixed(2);
    const txnid = `TXN${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const addOnSuffix = validatedAddOnLabels.length > 0 ? ` + ${validatedAddOnLabels.join(", ")}` : "";
    const productinfo = (planName
      ? `MarhabaDMC ${planName} - ${cycleLabel} Subscription${addOnSuffix}`
      : `MarhabaDMC Travel Agency Platform - ${cycleLabel} Subscription${addOnSuffix}`
    ).slice(0, 100);
    const firstname = (fullName || "").split(" ")[0] || fullName;

    const surl = `${EDGE_BASE}/payu-callback`;
    const furl = `${EDGE_BASE}/payu-callback`;

    const params: Record<string, string> = {
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email: trimmedEmail,
      phone: (phone || "").replace(/\D/g, "").slice(-10),
      surl,
      furl,
      udf1: city || "",
      udf2: fullName || "",
      udf3: registrationId || "",
      udf4: appliedCouponCode || "",
      udf5: FRONTEND_URL, // store frontend URL for redirect (whitelisted above)
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
