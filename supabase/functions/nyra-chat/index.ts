import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Tool definitions (OpenAI format, matching voice mode tools) ────────────────

const tools = [
  {
    type: "function",
    function: {
      name: "save_lead",
      description: "Save the visitor's contact details. Call IMMEDIATELY when you have name + email + phone.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Visitor's full name" },
          email: { type: "string", description: "Visitor's email address" },
          phone: { type: "string", description: "Visitor's phone number" },
          notes: { type: "string", description: "Brief notes about their interest" },
        },
        required: ["name", "email"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_lead",
      description: "Update the lead record with caller requirements. Call AFTER save_lead whenever they share travel needs.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", description: "Caller email (used to find their record)" },
          requirements: { type: "string", description: "Summary of requirements shared" },
        },
        required: ["email", "requirements"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_itinerary",
      description: `Manage the live travel itinerary. Actions: set_trip_info, set_guests, add_item, update_item, remove_item. Call proactively as you discuss the trip.`,
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", description: "One of: set_trip_info, set_guests, add_item, update_item, remove_item" },
          title: { type: "string" },
          destination: { type: "string" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          currency: { type: "string" },
          guests: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" }, age: { type: "number" }, relation: { type: "string" } },
              required: ["name"],
            },
          },
          item_id: { type: "string" },
          item_type: { type: "string" },
          day: { type: "number" },
          date: { type: "string" },
          item_title: { type: "string" },
          subtitle: { type: "string" },
          price: { type: "number" },
          details: { type: "string" },
          time: { type: "string" },
          location: { type: "string" },
          duration: { type: "string" },
        },
        required: ["action"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_session_context",
      description: "Save structured conversation summary. Call every 3-4 exchanges.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string" },
          visitor_name: { type: "string" },
          visitor_email: { type: "string" },
          destinations_discussed: { type: "string" },
          budget_range: { type: "string" },
          travel_dates: { type: "string" },
          decisions_made: { type: "string" },
          pending_questions: { type: "string" },
        },
        required: ["summary"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_email",
      description: "Send an email to the caller with travel details. Format body as clean HTML.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string" },
          subject: { type: "string" },
          body: { type: "string", description: "Email body in HTML format" },
        },
        required: ["to", "subject", "body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_whatsapp",
      description: "Send a WhatsApp message to the caller.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string", description: "Phone with country code, e.g. +919008447887" },
          message: { type: "string" },
        },
        required: ["phone", "message"],
      },
    },
  },
];

// ── Execute tool calls server-side ─────────────────────────────────────────────

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function executeTool(name: string, args: Record<string, any>, sessionId?: string): Promise<Record<string, unknown>> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  switch (name) {
    case "save_lead": {
      const leadName = (args.name || "").trim();
      const leadEmail = (args.email || "").trim();
      if (!leadName || !leadEmail || !leadEmail.includes("@")) {
        return { success: false, error: "Name and valid email required." };
      }
      try {
        const { error } = await supabase.from("voice_ai_leads").upsert(
          { name: leadName, email: leadEmail, phone: args.phone || null, notes: args.notes || null, source: "chat" },
          { onConflict: "email" }
        );
        return { success: !error, saved_name: leadName, saved_email: leadEmail };
      } catch { return { success: false }; }
    }

    case "update_lead": {
      const email = (args.email || "").trim();
      const requirements = (args.requirements || "").trim();
      if (!email || !requirements) return { success: false, error: "Email and requirements needed." };
      try {
        const { data: existing } = await supabase.from("voice_ai_leads").select("notes").eq("email", email).maybeSingle();
        const currentNotes = existing?.notes || "";
        const updatedNotes = currentNotes ? `${currentNotes}\n\nRequirements: ${requirements}` : `Requirements: ${requirements}`;
        const { error } = await supabase.from("voice_ai_leads").update({ notes: updatedNotes, updated_at: new Date().toISOString() }).eq("email", email);
        return { success: !error, updated_requirements: requirements };
      } catch { return { success: false }; }
    }

    case "update_itinerary": {
      // This is handled client-side; return a marker for the client to process
      return { _client_action: true, action: args.action, args };
    }

    case "save_session_context": {
      if (!sessionId) return { success: false, error: "No session ID" };
      const parts: string[] = [args.summary || ""];
      if (args.destinations_discussed) parts.push(`Destinations: ${args.destinations_discussed}`);
      if (args.budget_range) parts.push(`Budget: ${args.budget_range}`);
      if (args.travel_dates) parts.push(`Dates: ${args.travel_dates}`);
      if (args.decisions_made) parts.push(`Decisions: ${args.decisions_made}`);
      if (args.pending_questions) parts.push(`Pending: ${args.pending_questions}`);
      try {
        const { error } = await supabase.from("voice_ai_sessions").upsert(
          { session_id: sessionId, conversation_summary: parts.filter(Boolean).join(" | "), visitor_name: args.visitor_name || null, visitor_email: args.visitor_email || null, last_active_at: new Date().toISOString() },
          { onConflict: "session_id" }
        );
        return { success: !error };
      } catch { return { success: false }; }
    }

    case "send_email": {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseServiceKey}` },
          body: JSON.stringify({ to: args.to, subject: args.subject, body: args.body }),
        });
        return { success: res.ok, message: res.ok ? `Email sent to ${args.to}` : "Failed to send email" };
      } catch { return { success: false, error: "Email service error" }; }
    }

    case "send_whatsapp": {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseServiceKey}` },
          body: JSON.stringify({ to: args.phone, message: args.message }),
        });
        return { success: res.ok, message: res.ok ? `WhatsApp sent to ${args.phone}` : "Failed to send" };
      } catch { return { success: false, error: "WhatsApp service error" }; }
    }

    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

// ── Main handler ───────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, systemInstruction, sessionId, enabledTools } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Filter tools based on what's enabled
    const activeTools = tools.filter((t) => {
      const name = t.function.name;
      if (name === "send_whatsapp" && !enabledTools?.whatsapp) return false;
      if (name === "send_email" && !enabledTools?.email) return false;
      return true;
    });

    // Adapt system instruction for text mode
    const textSystemInstruction = (systemInstruction || "").replace(
      /You use a natural Indian accent\./g,
      ""
    ) + "\n\nIMPORTANT: You are now in TEXT CHAT mode, not voice. Keep responses concise and well-formatted using markdown. Use bullet points, bold text, and headers where appropriate. Do not reference speaking, listening, or voice. Instead of asking one thing at a time slowly (as in voice), you can be slightly more efficient in text—but still be warm and conversational.";

    const aiMessages = [
      { role: "system", content: textSystemInstruction },
      ...messages,
    ];

    // Call Lovable AI gateway — may need multiple rounds for tool calls
    let maxRounds = 5;
    let toolCallResults: { role: string; tool_call_id: string; content: string }[] = [];
    let clientActions: Record<string, unknown>[] = [];

    while (maxRounds-- > 0) {
      const allMessages = [...aiMessages, ...toolCallResults];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: allMessages,
          tools: activeTools,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await response.text();
        console.error("AI gateway error:", status, t);
        return new Response(JSON.stringify({ error: "AI service error" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await response.json();
      const choice = result.choices?.[0];
      const message = choice?.message;

      if (!message) break;

      // If no tool calls, we have the final response
      if (!message.tool_calls || message.tool_calls.length === 0) {
        return new Response(
          JSON.stringify({ reply: message.content || "", clientActions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Execute tool calls
      // Add assistant message with tool_calls to conversation
      toolCallResults.push({ role: "assistant", tool_call_id: "", content: JSON.stringify(message) } as any);
      // Actually, OpenAI format requires the assistant message, then tool responses
      // Let's rebuild properly
      toolCallResults = [];
      aiMessages.push(message); // assistant message with tool_calls

      for (const tc of message.tool_calls) {
        const fnName = tc.function.name;
        let fnArgs: Record<string, any> = {};
        try { fnArgs = JSON.parse(tc.function.arguments); } catch {}
        
        const toolResult = await executeTool(fnName, fnArgs, sessionId);
        
        // Track client-side actions (itinerary updates)
        if (toolResult._client_action) {
          clientActions.push(toolResult);
        }

        aiMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(toolResult),
        } as any);
      }
    }

    // Fallback if we exhaust rounds
    return new Response(
      JSON.stringify({ reply: "I'm having trouble processing that. Could you try rephrasing?", clientActions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("nyra-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
