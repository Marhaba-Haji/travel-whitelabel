import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://marhabadmc.com";

interface ReminderStage {
  attempt: number;
  minHoursAfterCreate: number;
  subject: (name: string) => string;
  body: (name: string, recoverUrl: string) => string;
}

const STAGES: ReminderStage[] = [
  {
    attempt: 1,
    minHoursAfterCreate: 1,
    subject: () => "Finish setting up your travel portal",
    body: (name, url) => `
Hi ${name || "there"},

You're one step away from launching your branded travel portal. Your account is reserved and ready — just complete the final step to activate it.

Continue here: ${url}

If you ran into a problem or have questions, just reply to this email and our team will help personally.

— Marhaba DMC Team
`.trim(),
  },
  {
    attempt: 2,
    minHoursAfterCreate: 24,
    subject: () => "Your portal is still reserved",
    body: (name, url) => `
Hi ${name || "there"},

Your Marhaba DMC portal slot is still held for you. Most agents activate within 24 hours and have their first booking live by week one.

Resume your signup: ${url}

Need help choosing a plan or have questions about the APIs? Reply to this email.

— Marhaba DMC Team
`.trim(),
  },
  {
    attempt: 3,
    minHoursAfterCreate: 72,
    subject: () => "Last reminder — your portal slot",
    body: (name, url) => `
Hi ${name || "there"},

This is the final reminder for your reserved portal. After today the slot is released back to general availability.

Activate now: ${url}

If now isn't the right time, no worries — you can always sign up again at ${SITE_URL}/signup.

— Marhaba DMC Team
`.trim(),
  },
];

async function sendEmail(to: string, subject: string, body: string) {
  const projectRef = (Deno.env.get("SUPABASE_URL") || "").match(/https:\/\/([^.]+)/)?.[1];
  if (!projectRef) return false;
  const resp = await fetch(`https://${projectRef}.supabase.co/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
    },
    body: JSON.stringify({ to, subject, text: body, html: `<pre style="font-family:Inter,sans-serif;white-space:pre-wrap;font-size:15px;line-height:1.55;color:#111">${body}</pre>` }),
  });
  return resp.ok;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const { data: rows, error } = await supabase
      .from("registrations")
      .select("id, full_name, email, created_at, recovery_attempts, last_reminder_at, plan_name")
      .eq("status", "pending_payment")
      .is("recovered_at", null)
      .gte("created_at", sevenDaysAgo)
      .lt("recovery_attempts", 3)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    const results: any[] = [];
    for (const r of rows || []) {
      const ageHours = (Date.now() - new Date(r.created_at).getTime()) / 3_600_000;
      const nextStage = STAGES[r.recovery_attempts || 0];
      if (!nextStage) continue;
      if (ageHours < nextStage.minHoursAfterCreate) continue;
      // ensure at least 12h between reminders
      if (r.last_reminder_at) {
        const sinceLast = (Date.now() - new Date(r.last_reminder_at).getTime()) / 3_600_000;
        if (sinceLast < 12) continue;
      }
      const recoverUrl = `${SITE_URL}/signup?recover=${r.id}`;
      const ok = await sendEmail(r.email, nextStage.subject(r.full_name || ""), nextStage.body(r.full_name || "", recoverUrl));
      if (ok) {
        await supabase.from("registrations").update({
          recovery_attempts: (r.recovery_attempts || 0) + 1,
          last_reminder_at: new Date().toISOString(),
        }).eq("id", r.id);
        results.push({ id: r.id, attempt: nextStage.attempt, sent: true });
      } else {
        results.push({ id: r.id, attempt: nextStage.attempt, sent: false });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recover-abandoned-signups error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});