import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "harab.business@gmail.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

function pad(n: number) { return String(n).padStart(2, "0"); }

function buildEndTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + 30;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

function isUsableMeetLink(value: string | null | undefined): value is string {
  return typeof value === "string" && /^https:\/\//.test(value);
}

function emailHtml(opts: {
  name: string;
  date: string;
  time: string;
  tz: string;
  meetLink: string;
  isAdmin: boolean;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}) {
  const heading = opts.isAdmin
    ? `New demo booked — ${opts.name}`
    : `Your Marhaba DMC demo is confirmed`;
  const intro = opts.isAdmin
    ? `A new demo has been booked. Details below.`
    : `Hi ${opts.name}, thanks for booking a demo with Marhaba DMC. Your slot is confirmed.`;
  const adminBlock = opts.isAdmin
    ? `<tr><td style="padding:8px 0;color:#374151;font-size:14px;"><strong>Email:</strong> ${opts.email || "—"}<br/><strong>WhatsApp:</strong> ${opts.phone || "—"}<br/><strong>Notes:</strong> ${opts.notes || "—"}</td></tr>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f7fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(20,20,40,0.06);">
        <tr><td style="padding:28px 32px 8px;">
          <div style="font-size:13px;letter-spacing:0.08em;color:#6b7280;text-transform:uppercase;font-weight:600;">Marhaba DMC</div>
          <h1 style="margin:8px 0 0;font-size:22px;color:#111827;line-height:1.3;">${heading}</h1>
        </td></tr>
        <tr><td style="padding:8px 32px 0;color:#374151;font-size:15px;line-height:1.6;">${intro}</td></tr>
        <tr><td style="padding:20px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #eef0f5;border-radius:12px;">
            <tr><td style="padding:16px 18px;color:#111827;font-size:14px;line-height:1.7;">
              <div><strong>Date:</strong> ${opts.date}</div>
              <div><strong>Time:</strong> ${opts.time} (${opts.tz})</div>
              <div><strong>Duration:</strong> 30 minutes</div>
              <div><strong>Where:</strong> Google Meet</div>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px 8px;" align="center">
          <a href="${opts.meetLink}" style="display:inline-block;background:#412A86;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:999px;font-size:15px;">Join Google Meet</a>
          <div style="margin-top:10px;font-size:12px;color:#6b7280;word-break:break-all;">${opts.meetLink}</div>
        </td></tr>
        ${adminBlock ? `<tr><td style="padding:16px 32px 0;"><table width="100%" style="border-top:1px solid #eef0f5;">${adminBlock}</table></td></tr>` : ""}
        <tr><td style="padding:24px 32px;color:#6b7280;font-size:12px;line-height:1.6;">
          A Google Calendar invite has also been sent. To reschedule, reply to this email or contact us at hello@marhabadmc.com.
        </td></tr>
      </table>
      <div style="margin-top:14px;color:#9ca3af;font-size:11px;">© Marhaba DMC · marhabadmc.com</div>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bookingId, resend = false } = await req.json();
    if (!bookingId) {
      return new Response(JSON.stringify({ error: "bookingId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: booking, error: fetchErr } = await supabase
      .from("demo_bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (fetchErr || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!resend && booking.notifications_sent_at) {
      return new Response(JSON.stringify({ ok: true, alreadySent: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tz = booking.timezone || "Asia/Kolkata";
    const startTime = booking.booking_time.split(":").slice(0, 2).join(":");
    const endTime = buildEndTime(startTime);
    const startISO = `${booking.booking_date}T${startTime}:00`;
    const endISO = `${booking.booking_date}T${endTime}:00`;

    let meetLink = isUsableMeetLink(booking.meet_link) ? booking.meet_link : null;
    let googleEventId = booking.google_event_id as string | null;

    // 1) Create or reuse Google Calendar event with Meet link
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_CALENDAR_API_KEY = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
    const calendarErrors: string[] = [];

    if (!meetLink && LOVABLE_API_KEY && GOOGLE_CALENDAR_API_KEY) {
      const attendees: { email: string }[] = [{ email: ADMIN_EMAIL }];
      if (booking.email) attendees.push({ email: booking.email });

      const eventBody = {
        summary: `Marhaba DMC Demo — ${booking.full_name}`,
        description: `30-minute platform walkthrough.\n\nGuest: ${booking.full_name}\nWhatsApp: +${booking.country_code.replace(/^\+/, "")}${booking.whatsapp_number}\nEmail: ${booking.email || "—"}\nNotes: ${booking.notes || "—"}`,
        start: { dateTime: startISO, timeZone: tz },
        end: { dateTime: endISO, timeZone: tz },
        attendees,
        conferenceData: {
          createRequest: {
            requestId: `marhaba-${bookingId}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: { useDefault: true },
      };

      const calRes = await fetch(
        `${GATEWAY_URL}/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": GOOGLE_CALENDAR_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventBody),
        },
      );
      const calJson = await calRes.json().catch(() => ({}));
      if (!calRes.ok) {
        console.error("Google Calendar error:", calRes.status, calJson);
        calendarErrors.push(`calendar ${calRes.status}: ${JSON.stringify(calJson).slice(0, 300)}`);
      } else {
        googleEventId = calJson.id;
        meetLink = calJson.hangoutLink
          || calJson.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === "video")?.uri
          || null;
      }
    }

    const hasRealMeetLink = isUsableMeetLink(meetLink);

    // Persist event id + meet link
    if (googleEventId || hasRealMeetLink) {
      await supabase
        .from("demo_bookings")
        .update({
          google_event_id: googleEventId,
          meet_link: hasRealMeetLink ? meetLink : null,
        })
        .eq("id", bookingId);
    }

    if (!hasRealMeetLink) {
      return new Response(JSON.stringify({
        ok: false,
        error: "Google Meet link could not be created",
        warnings: calendarErrors.length ? calendarErrors : ["No valid Google Meet link returned by Google Calendar"],
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dateLabel = new Date(`${booking.booking_date}T${startTime}:00`).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const phoneFull = `+${booking.country_code.replace(/^\+/, "")}${booking.whatsapp_number}`;

    const sendEmail = async (to: string, isAdmin: boolean) => {
      const subject = isAdmin
        ? `New demo booked — ${booking.full_name} on ${dateLabel}`
        : `Your Marhaba DMC demo is confirmed — ${dateLabel}`;
      const html = emailHtml({
        name: booking.full_name, date: dateLabel, time: startTime, tz,
        meetLink, isAdmin, email: booking.email, phone: phoneFull, notes: booking.notes,
      });
      try {
        const { error } = await supabase.functions.invoke("send-email", {
          body: { to, subject, body: html, reply_to: isAdmin ? booking.email || undefined : undefined },
        });
        if (error) console.error("send-email error", to, error);
      } catch (e) { console.error("send-email exception", to, e); }
    };

    const tasks: Promise<unknown>[] = [];
    if (booking.email) tasks.push(sendEmail(booking.email, false));
    tasks.push(sendEmail(ADMIN_EMAIL, true));
    await Promise.all(tasks);

    await supabase
      .from("demo_bookings")
      .update({ notifications_sent_at: new Date().toISOString() })
      .eq("id", bookingId);

    return new Response(JSON.stringify({
      ok: true, meetLink, googleEventId,
      warnings: calendarErrors.length ? calendarErrors : undefined,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("demo-booking-confirm error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});