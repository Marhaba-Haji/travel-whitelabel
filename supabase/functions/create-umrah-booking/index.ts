import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADVANCE_INR = 25000;
const PACKAGE_SLUG = "bangalore-umrah-sep-2026";

async function generatePayUHash(params: Record<string, string>, salt: string): Promise<string> {
  const hashString = [
    params.key, params.txnid, params.amount, params.productinfo,
    params.firstname, params.email,
    params.udf1 || "", params.udf2 || "", params.udf3 || "",
    params.udf4 || "", params.udf5 || "",
    "", "", "", "", "", salt,
  ].join("|");
  const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(hashString));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
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

    const body = await req.json();
    const { fullName, email, phone, city, travellers, roomPreference, message, utm, sessionId } = body ?? {};

    const phoneClean = String(phone ?? "").replace(/\D/g, "");
    if (!fullName || String(fullName).trim().length < 2 || phoneClean.length < 10) {
      return new Response(JSON.stringify({ error: "Name and a valid phone number are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!PAYU_KEY || !PAYU_SALT) {
      return new Response(JSON.stringify({ error: "Payment system unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const pax = Math.max(1, Math.min(60, Number(travellers) || 1));
    const phoneE164 = phoneClean.startsWith("91") && phoneClean.length > 10
      ? `+${phoneClean}`
      : `+91${phoneClean.slice(-10)}`;
    const amountInr = ADVANCE_INR * pax;

    const { data: lead, error: leadErr } = await supabase
      .from("umrah_leads")
      .insert({
        full_name: String(fullName).trim().slice(0, 100),
        phone_e164: phoneE164.slice(0, 20),
        email: email ? String(email).trim().toLowerCase().slice(0, 255) : null,
        city: city ? String(city).trim().slice(0, 100) : null,
        travellers: pax,
        room_preference: roomPreference ? String(roomPreference).slice(0, 50) : null,
        message: message ? String(message).slice(0, 1000) : null,
        package_slug: PACKAGE_SLUG,
        lead_type: "booking",
        status: "pending",
        amount_inr: amountInr,
        utm: utm || {},
        session_id: sessionId || null,
        landing_page: "/bangalore-umrah-package",
      })
      .select("id")
      .single();

    if (leadErr || !lead) {
      console.error("umrah_leads insert error:", leadErr);
      return new Response(JSON.stringify({ error: "Booking could not be created" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const txnid = `UMR${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const params: Record<string, string> = {
      key: PAYU_KEY,
      txnid,
      amount: amountInr.toFixed(2),
      productinfo: `Umrah booking amount (${pax} pax) — Sep 2026 Bangalore group`.slice(0, 100),
      firstname: String(fullName).trim().split(" ")[0] || String(fullName).trim(),
      email: email ? String(email).trim() : "noreply@marhabadmc.com",
      phone: phoneClean.slice(-10),
      surl: `${EDGE_BASE}/payu-callback`,
      furl: `${EDGE_BASE}/payu-callback`,
      udf1: "umrah",
      udf2: lead.id,
      udf3: "",
      udf4: "",
      udf5: FRONTEND_URL,
    };
    params.hash = await generatePayUHash(params, PAYU_SALT);

    await supabase.from("umrah_leads").update({ txnid }).eq("id", lead.id);

    // Notify the Umrah desk immediately (non-blocking failure)
    try {
      await fetch(`${EDGE_BASE}/notify-umrah-lead`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: String(fullName).trim(),
          phone_e164: phoneE164,
          email: email || null,
          city: city || null,
          travellers: pax,
          room_preference: roomPreference || null,
          message: message || null,
          package_slug: PACKAGE_SLUG,
          lead_type: "booking",
          status: "pending",
          amount_inr: amountInr,
          txnid,
          utm: utm || {},
          landing_page: "/bangalore-umrah-package",
        }),
      });
    } catch (e) {
      console.error("notify-umrah-lead failed:", e);
    }

    return new Response(JSON.stringify({ action: PAYU_ACTION, params, leadId: lead.id, order: txnid }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("create-umrah-booking error:", err);
    return new Response(JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
