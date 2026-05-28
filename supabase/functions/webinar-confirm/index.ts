import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatIST(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " IST";
  } catch {
    return iso;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;

    const { registrationId } = await req.json();
    if (!registrationId) {
      return new Response(JSON.stringify({ error: "registrationId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: reg } = await supabase
      .from("webinar_registrations")
      .select("*")
      .eq("id", registrationId)
      .maybeSingle();

    if (!reg || reg.status !== "paid") {
      return new Response(JSON.stringify({ error: "Registration not eligible" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: settings } = await supabase
      .from("webinar_settings")
      .select("title, host_name, scheduled_at, duration_minutes, join_url, whatsapp_group_url")
      .eq("singleton", true)
      .maybeSingle();

    const title = settings?.title || "Masterclass";
    const host = settings?.host_name || "Harab Rasheed";
    const when = settings?.scheduled_at ? formatIST(settings.scheduled_at) : "TBA";
    const duration = settings?.duration_minutes || 120;
    const joinUrl = settings?.join_url || "We will share the join link 1 hour before the session.";
    const wa = settings?.whatsapp_group_url;

    // Email
    if (!reg.confirmation_email_sent_at) {
      const html = `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a;background:#ffffff">
          <div style="background:linear-gradient(135deg,#412A86,#B968C7);padding:24px;border-radius:16px;color:#fff">
            <h1 style="margin:0;font-size:22px;font-weight:700">You're in, ${reg.full_name.split(" ")[0]} 🎉</h1>
            <p style="margin:8px 0 0;opacity:.9">Your seat for the Masterclass is confirmed.</p>
          </div>
          <div style="padding:24px 4px">
            <h2 style="font-size:18px;margin:0 0 12px">${title}</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:8px 0;color:#666">Host</td><td style="padding:8px 0"><strong>${host}</strong></td></tr>
              <tr><td style="padding:8px 0;color:#666">When</td><td style="padding:8px 0"><strong>${when}</strong></td></tr>
              <tr><td style="padding:8px 0;color:#666">Duration</td><td style="padding:8px 0"><strong>${duration} minutes</strong></td></tr>
            </table>
            <div style="margin:24px 0;padding:16px;background:#f7f4ff;border-radius:12px;border-left:3px solid #412A86">
              <strong>Join link:</strong><br/>
              <span style="word-break:break-all">${joinUrl}</span>
            </div>
            ${wa ? `<p><a href="${wa}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600">Join WhatsApp Group</a></p>` : ""}
            <p style="color:#666;font-size:13px;margin-top:24px">A reminder will be sent 1 hour before the session. Bring a notebook — you'll leave with a 90-day action plan.</p>
          </div>
          <div style="border-top:1px solid #eee;padding-top:16px;font-size:12px;color:#888;text-align:center">
            Marhaba DMC · marhabadmc.com
          </div>
        </div>`;

      try {
        await fetch(`${EDGE_BASE}/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
          body: JSON.stringify({
            to: reg.email,
            subject: `You're in — ${title}`,
            body: html,
          }),
        });
        await supabase
          .from("webinar_registrations")
          .update({ confirmation_email_sent_at: new Date().toISOString() })
          .eq("id", reg.id);
      } catch (e) {
        console.error("Email send failed:", e);
      }
    }

    // WhatsApp
    if (!reg.confirmation_whatsapp_sent_at && reg.phone_e164) {
      const msg = `Hi ${reg.full_name.split(" ")[0]}! Your seat for the Masterclass "${title}" with ${host} is confirmed.\n\n📅 ${when}\n⏱ ${duration} minutes\n\nJoin link: ${joinUrl}${wa ? `\n\nJoin the attendee group: ${wa}` : ""}\n\n— Marhaba DMC`;
      try {
        await fetch(`${EDGE_BASE}/send-whatsapp`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
          body: JSON.stringify({ to: reg.phone_e164, message: msg }),
        });
        await supabase
          .from("webinar_registrations")
          .update({ confirmation_whatsapp_sent_at: new Date().toISOString() })
          .eq("id", reg.id);
      } catch (e) {
        console.error("WhatsApp send failed:", e);
      }
    }

    return new Response(JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("webinar-confirm error:", err);
    return new Response(JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});