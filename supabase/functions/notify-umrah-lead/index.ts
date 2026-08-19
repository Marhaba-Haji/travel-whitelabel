const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NOTIFY_TO = "harab.business@gmail.com";

const esc = (v: unknown) =>
  String(v ?? "—").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string)).slice(0, 1000);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const b = await req.json().catch(() => ({}));
    const name = esc(b.full_name).slice(0, 100);
    const phone = esc(b.phone_e164).slice(0, 20);
    if (!name || name === "—" || !phone || phone === "—") {
      return new Response(JSON.stringify({ error: "full_name and phone_e164 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const leadType = esc(b.lead_type).slice(0, 20);
    const isBooking = leadType === "booking";
    const subject = `🕋 New Umrah Lead (${isBooking ? "Booking" : "Enquiry"}) — ${name} · ${phone}`;

    const rows: [string, unknown][] = [
      ["Lead type", `Umrah ${leadType}`],
      ["Name", name],
      ["Phone", phone],
      ["Email", b.email],
      ["City", b.city],
      ["Travellers", b.travellers],
      ["Room preference", b.room_preference],
      ["Package", b.package_slug],
      ["Status", b.status],
      ["Amount (INR)", b.amount_inr],
      ["Order / txn id", b.txnid],
      ["Message", b.message],
      ["Landing page", b.landing_page],
      ["UTM", b.utm ? JSON.stringify(b.utm) : null],
      ["Received at", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })],
    ];

    const body = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#0f172a">
        <h2 style="margin:0 0 4px">New Umrah Lead — please call</h2>
        <p style="margin:0 0 16px;color:#475569">This is an <strong>Umrah lead</strong> from the Bangalore Umrah package page.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${rows
            .map(
              ([k, v]) =>
                `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;width:180px">${k}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>${esc(v)}</strong></td></tr>`,
            )
            .join("")}
        </table>
        <p style="margin:20px 0 0">
          <a href="tel:${phone}" style="background:#0f766e;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;margin-right:8px">Call now</a>
          <a href="https://wa.me/${phone.replace(/\D/g, "")}" style="background:#25D366;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">WhatsApp</a>
        </p>
      </div>`;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ to: NOTIFY_TO, subject, body, ...(b.email ? { reply_to: String(b.email) } : {}) }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) console.error("notify-umrah-lead send-email failed:", out);

    return new Response(JSON.stringify({ success: res.ok }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-umrah-lead error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
