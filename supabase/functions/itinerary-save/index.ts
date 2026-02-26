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

    const url = new URL(req.url);

    // GET: load itinerary by share_id
    if (req.method === "GET") {
      const shareId = url.searchParams.get("id");
      if (!shareId || !shareId.trim()) {
        return new Response(
          JSON.stringify({ error: "Share ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("saved_itineraries")
        .select("*")
        .eq("share_id", shareId.trim())
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Itinerary not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, itinerary: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST: save itinerary
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const {
        title, destination, currency, startDate, endDate,
        guests, days, totalPrice, customerName, customerEmail, customerPhone,
        shareId, // if provided, update existing
      } = body || {};

      if (!days || !Array.isArray(days) || days.length === 0) {
        return new Response(
          JSON.stringify({ error: "Itinerary must have at least one day" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update existing
      if (shareId && typeof shareId === "string" && shareId.trim()) {
        const { data: existing } = await supabase
          .from("saved_itineraries")
          .select("id")
          .eq("share_id", shareId.trim())
          .single();

        if (existing) {
          const { error: updateErr } = await supabase
            .from("saved_itineraries")
            .update({
              title: title ? String(title).trim().slice(0, 200) : null,
              destination: destination ? String(destination).trim().slice(0, 200) : null,
              currency: currency || "INR",
              start_date: startDate || null,
              end_date: endDate || null,
              guests: guests || [],
              days: days,
              total_price: typeof totalPrice === "number" ? totalPrice : 0,
              customer_name: customerName ? String(customerName).trim().slice(0, 100) : null,
              customer_email: customerEmail ? String(customerEmail).trim().slice(0, 255) : null,
              customer_phone: customerPhone ? String(customerPhone).trim().slice(0, 20) : null,
            })
            .eq("id", existing.id);

          if (updateErr) {
            console.error("Itinerary update error:", updateErr);
            return new Response(
              JSON.stringify({ error: "Failed to update itinerary" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({ success: true, shareId: shareId.trim() }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Insert new
      const { data: inserted, error: insertErr } = await supabase
        .from("saved_itineraries")
        .insert({
          title: title ? String(title).trim().slice(0, 200) : null,
          destination: destination ? String(destination).trim().slice(0, 200) : null,
          currency: currency || "INR",
          start_date: startDate || null,
          end_date: endDate || null,
          guests: guests || [],
          days: days,
          total_price: typeof totalPrice === "number" ? totalPrice : 0,
          customer_name: customerName ? String(customerName).trim().slice(0, 100) : null,
          customer_email: customerEmail ? String(customerEmail).trim().slice(0, 255) : null,
          customer_phone: customerPhone ? String(customerPhone).trim().slice(0, 20) : null,
        })
        .select("share_id")
        .single();

      if (insertErr || !inserted) {
        console.error("Itinerary insert error:", insertErr);
        return new Response(
          JSON.stringify({ error: "Failed to save itinerary" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, shareId: inserted.share_id }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("itinerary-save error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
