import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { session_id, itinerary_state } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Fetch session to get visitor email and conversation summary
    const { data: session } = await sb
      .from("voice_ai_sessions")
      .select("visitor_name, visitor_email, conversation_summary")
      .eq("session_id", session_id)
      .maybeSingle();

    if (!session?.visitor_email) {
      return new Response(JSON.stringify({ skipped: true, reason: "No visitor email captured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const visitorName = session.visitor_name || "Traveler";
    const summary = session.conversation_summary || "No conversation summary available.";

    // Build itinerary HTML
    let itineraryHtml = "";
    if (itinerary_state?.tripInfo || (itinerary_state?.days?.length > 0)) {
      const trip = itinerary_state.tripInfo;
      itineraryHtml += `<div style="margin-top:24px;padding:20px;background:#f8f9fa;border-radius:12px;">`;
      itineraryHtml += `<h2 style="color:#1a1a2e;margin:0 0 4px;">📋 Your Itinerary</h2>`;
      if (trip) {
        itineraryHtml += `<p style="color:#555;margin:4px 0;font-size:14px;"><strong>${trip.title || "Trip"}</strong>${trip.destination ? ` — ${trip.destination}` : ""}</p>`;
        if (trip.startDate || trip.endDate) {
          itineraryHtml += `<p style="color:#888;margin:2px 0;font-size:13px;">${trip.startDate || ""}${trip.endDate ? ` to ${trip.endDate}` : ""}</p>`;
        }
      }

      const days = itinerary_state.days || [];
      const currency = trip?.currency || "INR";
      let totalPrice = 0;

      for (const day of days) {
        itineraryHtml += `<div style="margin-top:16px;">`;
        itineraryHtml += `<h3 style="color:#1a1a2e;margin:0 0 8px;font-size:15px;">Day ${day.day}${day.date ? ` — ${day.date}` : ""}</h3>`;
        for (const item of day.items || []) {
          const price = item.price || 0;
          totalPrice += price;
          itineraryHtml += `<div style="padding:10px 12px;margin-bottom:6px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;">`;
          itineraryHtml += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
          itineraryHtml += `<div><strong style="font-size:14px;">${item.title}</strong>`;
          if (item.subtitle) itineraryHtml += `<br><span style="color:#888;font-size:12px;">${item.subtitle}</span>`;
          itineraryHtml += `</div>`;
          if (price > 0) itineraryHtml += `<span style="font-weight:600;color:#0d6efd;font-size:14px;">${currency} ${price.toLocaleString()}</span>`;
          itineraryHtml += `</div>`;
          if (item.time) itineraryHtml += `<p style="margin:4px 0 0;color:#888;font-size:12px;">🕐 ${item.time}</p>`;
          if (item.location) itineraryHtml += `<p style="margin:2px 0 0;color:#888;font-size:12px;">📍 ${item.location}</p>`;
          if (item.details) itineraryHtml += `<p style="margin:4px 0 0;color:#666;font-size:12px;">${item.details}</p>`;
          itineraryHtml += `</div>`;
        }
        itineraryHtml += `</div>`;
      }

      if (totalPrice > 0) {
        itineraryHtml += `<div style="margin-top:16px;padding:12px;background:#0d6efd;color:#fff;border-radius:8px;text-align:center;">`;
        itineraryHtml += `<strong>Estimated Total: ${currency} ${totalPrice.toLocaleString()}</strong>`;
        itineraryHtml += `</div>`;
      }
      itineraryHtml += `</div>`;
    }

    // Build guests HTML
    let guestsHtml = "";
    if (itinerary_state?.guests?.length > 0) {
      guestsHtml = `<div style="margin-top:16px;"><h3 style="color:#1a1a2e;font-size:14px;">👥 Travelers</h3><ul style="padding-left:20px;color:#555;font-size:13px;">`;
      for (const g of itinerary_state.guests) {
        guestsHtml += `<li>${g.name}${g.age ? ` (${g.age})` : ""}${g.relation ? ` — ${g.relation}` : ""}</li>`;
      }
      guestsHtml += `</ul></div>`;
    }

    // Format summary sections
    const summaryParts = summary.split(" | ").filter(Boolean);
    let summaryHtml = "";
    for (const part of summaryParts) {
      summaryHtml += `<li style="margin-bottom:4px;">${part}</li>`;
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#1a1a2e;margin:0;font-size:22px;">Your Conversation Summary</h1>
      <p style="color:#888;font-size:14px;margin:8px 0;">with Nyra — Marhaba DMC AI Travel Agent</p>
    </div>

    <p style="color:#333;font-size:15px;">Hi ${visitorName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Thank you for chatting with Nyra! Here's a summary of your conversation and any itinerary we discussed:</p>

    <div style="margin-top:20px;padding:16px;background:#f0f4ff;border-radius:10px;border-left:4px solid #0d6efd;">
      <h3 style="margin:0 0 8px;color:#1a1a2e;font-size:15px;">💬 Conversation Summary</h3>
      <ul style="padding-left:18px;color:#555;font-size:13px;line-height:1.7;margin:0;">${summaryHtml}</ul>
    </div>

    ${guestsHtml}
    ${itineraryHtml}

    <div style="margin-top:32px;padding:16px;background:#f8f9fa;border-radius:8px;text-align:center;">
      <p style="color:#555;font-size:13px;margin:0;">Need to continue your trip planning? Visit <a href="https://marhabadmc.com" style="color:#0d6efd;">marhabadmc.com</a> and talk to Nyra anytime!</p>
    </div>

    <div style="margin-top:24px;text-align:center;color:#aaa;font-size:11px;">
      <p>Marhaba DMC — Your Trusted Travel Partner</p>
    </div>
  </div>
</body>
</html>`;

    // Send via send-email function
    const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        to: session.visitor_email,
        subject: `Your Trip Summary with Marhaba DMC — ${itinerary_state?.tripInfo?.destination || "Travel Plans"}`,
        body: emailHtml,
      }),
    });

    const emailResult = await emailRes.json();

    return new Response(
      JSON.stringify({ success: emailRes.ok, email_sent_to: session.visitor_email, ...emailResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("post-call-summary error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
