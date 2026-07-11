import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INTENTS = ["demo", "pricing", "support", "partnership", "general"] as const;
type Intent = typeof INTENTS[number];

async function classifyWithGemini(message: string): Promise<Intent> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return "general";
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Classify this B2B travel-platform enquiry into ONE of: demo, pricing, support, partnership, general.\nReply with only the single word.\n\nEnquiry: ${message.slice(0, 800)}`,
            }],
          }],
          generationConfig: { temperature: 0, maxOutputTokens: 8 },
        }),
      },
    );
    const data = await resp.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || "";
    const found = INTENTS.find((i) => raw.startsWith(i));
    return (found as Intent) || "general";
  } catch {
    return "general";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { enquiry_id, message } = await req.json();
    if (!enquiry_id || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const intent = await classifyWithGemini(message);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await supabase.from("contact_enquiries").update({ intent }).eq("id", enquiry_id);

    // High-intent → WhatsApp notification (best-effort)
    if (intent === "demo" || intent === "pricing") {
      try {
        const projectRef = (Deno.env.get("SUPABASE_URL") || "").match(/https:\/\/([^.]+)/)?.[1];
        if (projectRef) {
          await fetch(`https://${projectRef}.supabase.co/functions/v1/send-whatsapp`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              type: "high_intent_lead",
              intent,
              enquiry_id,
              message: message.slice(0, 200),
            }),
          });
        }
      } catch (e) {
        console.warn("notify failed", e);
      }
    }

    return new Response(JSON.stringify({ intent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify-enquiry error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});