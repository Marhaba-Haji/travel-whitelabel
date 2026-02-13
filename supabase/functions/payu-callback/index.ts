import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// PayU posts form-urlencoded data to surl/furl
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // PayU sends application/x-www-form-urlencoded
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = String(value);
    });

    const txnid = data.txnid || data.txnId || "";
    const status = data.status || "";
    const isSuccess = status === "success";
    const frontendUrl = data.udf5 || "https://marhabadmc.lovable.app";

    if (txnid) {
      const { data: payment } = await supabase
        .from("payments")
        .select("id, registration_id")
        .eq("txn_id", txnid)
        .single();

      if (payment) {
        await supabase
          .from("payments")
          .update({
            status: isSuccess ? "success" : (status || "failed"),
            payu_mihpayid: data.mihpayid || null,
            bank_ref_num: data.bank_ref_num || null,
            payment_mode: data.mode || null,
            error_code: data.error_code || null,
            error_message: data.error_Message || data.error_message || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        await supabase.from("payment_gateway_responses").insert({
          payment_id: payment.id,
          txn_id: txnid,
          gateway: "payu",
          response_type: isSuccess ? "success_callback" : "failure_callback",
          raw_response: data,
          status: isSuccess ? "success" : (status || "failed"),
        });

        if (isSuccess && payment.registration_id) {
          await supabase
            .from("registrations")
            .update({ status: "payment_completed", updated_at: new Date().toISOString() })
            .eq("id", payment.registration_id);
        }
      } else {
        await supabase.from("payment_gateway_responses").insert({
          txn_id: txnid,
          gateway: "payu",
          response_type: isSuccess ? "success_callback" : "failure_callback",
          raw_response: data,
          status: isSuccess ? "success" : (status || "failed"),
        });
      }
    }

    const redirectUrl = isSuccess
      ? `${frontendUrl.replace(/\/$/, "")}/signup-success`
      : `${frontendUrl.replace(/\/$/, "")}/signup?payment=failed`;

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  } catch (err) {
    console.error("PayU callback error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
