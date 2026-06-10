import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const url = new URL(req.url);
    const orderId =
      url.searchParams.get("order_id") ||
      (req.method === "POST" ? ((await req.json().catch(() => ({}))) as any).order_id : null);

    if (!orderId) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Try signup payment first
    const { data: payment } = await supabase
      .from("payments")
      .select(
        "txn_id, amount, currency, product_info, payment_mode, status, payu_mihpayid, bank_ref_num, created_at, registration_id",
      )
      .eq("txn_id", orderId)
      .maybeSingle();

    if (payment && payment.status === "success") {
      const { data: reg } = await supabase
        .from("registrations")
        .select("full_name, email, phone, city, plan_name")
        .eq("id", payment.registration_id)
        .maybeSingle();

      return json({
        type: "signup",
        order_id: payment.txn_id,
        amount: Number(payment.amount),
        currency: payment.currency || "INR",
        product: payment.product_info || reg?.plan_name || "marhabaDMC Subscription",
        plan_name: reg?.plan_name || null,
        payment_mode: payment.payment_mode || "Online",
        payu_mihpayid: payment.payu_mihpayid || null,
        bank_ref_num: payment.bank_ref_num || null,
        date: payment.created_at,
        customer: {
          name: reg?.full_name || "",
          email: reg?.email || "",
          phone: reg?.phone || "",
          city: reg?.city || "",
        },
      });
    }

    // Webinar registration
    const { data: web } = await supabase
      .from("webinar_registrations")
      .select(
        "txnid, amount_inr, currency, payu_mihpayid, status, full_name, email, phone_e164, city, created_at",
      )
      .eq("txnid", orderId)
      .maybeSingle();

    if (web) {
      const amount = Number(web.amount_inr || 0);
      return json({
        type: "webinar",
        order_id: web.txnid,
        amount,
        currency: web.currency || "INR",
        product: "Masterclass Registration",
        plan_name: null,
        payment_mode: amount > 0 ? "Online" : "Free",
        payu_mihpayid: web.payu_mihpayid || null,
        bank_ref_num: null,
        date: web.created_at,
        customer: {
          name: web.full_name || "",
          email: web.email || "",
          phone: web.phone_e164 || "",
          city: web.city || "",
        },
      });
    }

    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
}