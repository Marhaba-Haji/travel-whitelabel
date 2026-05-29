import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function generatePayUHash(params: Record<string, string>, salt: string): Promise<string> {
  const hashString = [
    params.key, params.txnid, params.amount, params.productinfo,
    params.firstname, params.email,
    params.udf1 || "", params.udf2 || "", params.udf3 || "",
    params.udf4 || "", params.udf5 || "",
    "", "", "", "", "", salt,
  ].join("|");
  const data = new TextEncoder().encode(hashString);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const PAYU_KEY = Deno.env.get("PAYU_KEY");
    const PAYU_SALT = Deno.env.get("PAYU_SALT");
    const PAYU_MODE = Deno.env.get("PAYU_MODE") || "test";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const PAYU_ACTION = PAYU_MODE === "production"
      ? "https://secure.payu.in/_payment"
      : "https://test.payu.in/_payment";

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/[^/]*$/, "") || "";
    const FRONTEND_URL = origin || "https://marhabadmc.com";
    const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { fullName, email, phone, dialCode, countryCode, city, utm, sessionId } = body;

    if (!fullName || !email || !phone) {
      return new Response(JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Load settings
    const { data: settings } = await supabase
      .from("webinar_settings")
      .select("title, price_inr, is_free")
      .eq("singleton", true)
      .maybeSingle();

    const title = settings?.title || "Masterclass";
    const price = Number(settings?.price_inr ?? 99);
    const isFree = Boolean(settings?.is_free);
    const finalAmount = isFree ? 0 : Math.round(price * 1.18);

    const phoneClean = String(phone).replace(/\D/g, "");
    const dial = (dialCode || "+91").replace(/[^\d+]/g, "");
    const phoneE164 = phoneClean.startsWith("+") ? phoneClean : `${dial}${phoneClean.replace(/^0+/, "")}`;

    // Insert registration
    const { data: reg, error: regErr } = await supabase
      .from("webinar_registrations")
      .insert({
        full_name: String(fullName).trim().slice(0, 100),
        email: String(email).trim().toLowerCase().slice(0, 255),
        phone_e164: phoneE164.slice(0, 20),
        dial_code: dial,
        country_code: countryCode || null,
        city: city ? String(city).trim().slice(0, 100) : null,
        utm: utm || {},
        session_id: sessionId || null,
        amount_inr: finalAmount,
        status: isFree ? "paid" : "pending",
      })
      .select("id")
      .single();

    if (regErr || !reg) {
      console.error("Webinar registration insert error:", regErr);
      return new Response(JSON.stringify({ error: "Registration failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Free flow — skip PayU, return success
    if (isFree) {
      // Fire-and-forget confirmation
      fetch(`${EDGE_BASE}/webinar-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: reg.id }),
      }).catch(() => {});
      return new Response(JSON.stringify({ free: true, registrationId: reg.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!PAYU_KEY || !PAYU_SALT) {
      return new Response(JSON.stringify({ error: "Payment system unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const amount = finalAmount.toFixed(2);
    const txnid = `WEB${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const productinfo = `Masterclass: ${title}`.slice(0, 100);
    const firstname = String(fullName).split(" ")[0] || fullName;
    const surl = `${EDGE_BASE}/payu-callback`;
    const furl = `${EDGE_BASE}/payu-callback`;

    const params: Record<string, string> = {
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email: String(email).trim(),
      phone: phoneClean.slice(-10),
      surl,
      furl,
      udf1: "webinar",
      udf2: reg.id,
      udf3: "",
      udf4: "",
      udf5: FRONTEND_URL,
    };

    const hash = await generatePayUHash(params, PAYU_SALT);
    params.hash = hash;

    await supabase
      .from("webinar_registrations")
      .update({ txnid })
      .eq("id", reg.id);

    return new Response(JSON.stringify({ action: PAYU_ACTION, params, registrationId: reg.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("create-webinar-payment error:", err);
    return new Response(JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});