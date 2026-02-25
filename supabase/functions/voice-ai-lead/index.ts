import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const { name, email, phone, notes } = body || {};

    if (!name?.trim() || !email?.trim()) {
      return new Response(
        JSON.stringify({ error: "Name and email are required", saved: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedEmail = String(email).trim();
    if (!trimmedEmail.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid email address", saved: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabase.from("voice_ai_leads").insert({
      name: String(name).trim().slice(0, 100),
      email: trimmedEmail.slice(0, 255),
      phone: phone ? String(phone).trim().slice(0, 20) : null,
      notes: notes ? String(notes).trim().slice(0, 1000) : null,
      source: "nyra",
    });

    if (error) {
      console.error("Voice AI lead insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save lead. Please try again.", saved: false }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, saved: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("voice-ai-lead error:", err);
    return new Response(
      JSON.stringify({ error: "Server error. Please try again.", saved: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
