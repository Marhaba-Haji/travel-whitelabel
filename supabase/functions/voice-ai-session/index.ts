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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const sessionId = url.searchParams.get("session_id");
      if (!sessionId) {
        return new Response(JSON.stringify({ error: "session_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("voice_ai_sessions")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (error) throw error;

      return new Response(JSON.stringify({ session: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { session_id, conversation_summary, itinerary_state, visitor_name, visitor_email, analytics } = body;

      if (!session_id) {
        return new Response(JSON.stringify({ error: "session_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("voice_ai_sessions")
        .upsert(
          {
            session_id,
            ...(conversation_summary !== undefined && { conversation_summary }),
            ...(itinerary_state !== undefined && { itinerary_state }),
            ...(visitor_name !== undefined && { visitor_name }),
            ...(visitor_email !== undefined && { visitor_email }),
            ...(analytics?.source !== undefined && { source: analytics.source }),
            ...(analytics?.message_count !== undefined && { message_count: analytics.message_count }),
            ...(analytics?.tool_calls !== undefined && { tool_calls: analytics.tool_calls }),
            ...(analytics?.connected_at !== undefined && { connected_at: analytics.connected_at }),
            last_active_at: new Date().toISOString(),
          },
          { onConflict: "session_id" }
        )
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ session: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("voice-ai-session error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
