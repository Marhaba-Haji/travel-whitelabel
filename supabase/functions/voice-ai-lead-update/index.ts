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
    const { email, requirements } = body || {};

    if (!email?.trim()) {
      return new Response(
        JSON.stringify({ error: "Email is required", updated: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedEmail = String(email).trim();
    if (!trimmedEmail.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid email address", updated: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requirementsText = requirements ? String(requirements).trim().slice(0, 2000) : "";
    if (!requirementsText) {
      return new Response(
        JSON.stringify({ error: "Requirements text is required", updated: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: lead } = await supabase
      .from("voice_ai_leads")
      .select("id, notes")
      .eq("email", trimmedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!lead) {
      return new Response(
        JSON.stringify({ error: "No lead found with this email", updated: false }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const updatedNotes = lead.notes
      ? `${lead.notes}\n---\n${requirementsText}`
      : requirementsText;

    const { error } = await supabase
      .from("voice_ai_leads")
      .update({
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    if (error) {
      console.error("Voice AI lead update error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update lead. Please try again.", updated: false }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, updated: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("voice-ai-lead-update error:", err);
    return new Response(
      JSON.stringify({ error: "Server error. Please try again.", updated: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
