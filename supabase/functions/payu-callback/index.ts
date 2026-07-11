import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Only ever redirect users to these hosts — udf5 comes back from PayU but
// originates from a request header, so it must never be trusted blindly.
const ALLOWED_REDIRECT_HOSTS = new Set([
  "marhabadmc.com",
  "www.marhabadmc.com",
  "localhost",
  "127.0.0.1",
]);
const DEFAULT_FRONTEND = "https://marhabadmc.com";

function safeFrontendUrl(raw: string): string {
  try {
    const u = new URL(raw);
    if ((u.protocol === "https:" || u.protocol === "http:") && ALLOWED_REDIRECT_HOSTS.has(u.hostname)) {
      return u.origin;
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_FRONTEND;
}

async function sha512Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// PayU reverse hash: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
// When additionalCharges is present it is prepended: sha512(additionalCharges|SALT|status|...)
async function verifyPayUResponseHash(
  data: Record<string, string>,
  key: string,
  salt: string,
): Promise<boolean> {
  const received = (data.hash || "").trim().toLowerCase();
  if (!received) return false;

  const fields = [
    salt,
    data.status || "",
    "", "", "", "", "", // udf10..udf6 (unused)
    data.udf5 || "",
    data.udf4 || "",
    data.udf3 || "",
    data.udf2 || "",
    data.udf1 || "",
    data.email || "",
    data.firstname || "",
    data.productinfo || "",
    data.amount || "",
    data.txnid || "",
    key,
  ];

  const plain = await sha512Hex(fields.join("|"));
  if (plain === received) return true;

  if (data.additionalCharges) {
    const withCharges = await sha512Hex([data.additionalCharges, ...fields].join("|"));
    if (withCharges === received) return true;
  }
  return false;
}

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
    const PAYU_KEY = Deno.env.get("PAYU_KEY") || "";
    const PAYU_SALT = Deno.env.get("PAYU_SALT") || "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // PayU sends application/x-www-form-urlencoded
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = String(value);
    });

    const txnid = data.txnid || data.txnId || "";
    const frontendUrl = safeFrontendUrl(data.udf5 || "");
    const purpose = data.udf1 || "";
    const webinarRegId = purpose === "webinar" ? (data.udf2 || "") : "";

    // Fail closed: without a valid PayU signature we record the callback for
    // auditing but never mutate payment/registration state.
    const hashValid = PAYU_KEY && PAYU_SALT
      ? await verifyPayUResponseHash(data, PAYU_KEY, PAYU_SALT)
      : false;

    if (!hashValid) {
      console.error("PayU callback rejected: invalid or missing hash", { txnid });
      if (txnid) {
        await supabase.from("payment_gateway_responses").insert({
          txn_id: txnid,
          gateway: "payu",
          response_type: "invalid_hash",
          raw_response: data,
          status: "rejected",
        });
      }
      return new Response(null, {
        status: 302,
        headers: { Location: `${DEFAULT_FRONTEND}/signup?payment=failed` },
      });
    }

    const status = data.status || "";
    const isSuccess = status === "success";

    if (txnid) {
      const { data: payment } = await supabase
        .from("payments")
        .select("id, registration_id, status")
        .eq("txn_id", txnid)
        .single();

      // Idempotency: PayU can retry callbacks — never re-process a payment
      // that is already marked success (also prevents double coupon burns).
      const alreadySuccess = payment?.status === "success";

      if (payment && !alreadySuccess) {
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

        // Coupons are only consumed once payment is confirmed (udf4 carries the code)
        if (isSuccess && data.udf4) {
          const { error: couponErr } = await supabase.rpc("increment_coupon_use", {
            coupon_code: data.udf4,
          });
          if (couponErr) console.error("Coupon increment failed:", couponErr);
        }
      } else if (!payment) {
        await supabase.from("payment_gateway_responses").insert({
          txn_id: txnid,
          gateway: "payu",
          response_type: isSuccess ? "success_callback" : "failure_callback",
          raw_response: data,
          status: isSuccess ? "success" : (status || "failed"),
        });
      }
    }

    // Webinar registration handling
    if (webinarRegId) {
      const { data: existingReg } = await supabase
        .from("webinar_registrations")
        .select("status")
        .eq("id", webinarRegId)
        .maybeSingle();
      const alreadyPaid = existingReg?.status === "paid";

      if (!alreadyPaid) {
        const newStatus = isSuccess ? "paid" : "failed";
        await supabase
          .from("webinar_registrations")
          .update({
            status: newStatus,
            payu_mihpayid: data.mihpayid || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", webinarRegId);

        if (isSuccess) {
          // Fire confirmation (email + WhatsApp) — fire-and-forget
          const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;
          fetch(`${EDGE_BASE}/webinar-confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
            body: JSON.stringify({ registrationId: webinarRegId }),
          }).catch((e) => console.error("webinar-confirm dispatch failed:", e));
        }
      }

      const redirectUrl = isSuccess
        ? `${frontendUrl}/masterclass/success?reg=${webinarRegId}&order=${encodeURIComponent(txnid)}`
        : `${frontendUrl}/masterclass/failed?reg=${webinarRegId}&order=${encodeURIComponent(txnid)}`;
      return new Response(null, { status: 302, headers: { Location: redirectUrl } });
    }

    const redirectUrl = isSuccess
      ? `${frontendUrl}/signup-success?order=${encodeURIComponent(txnid)}`
      : `${frontendUrl}/signup?payment=failed&order=${encodeURIComponent(txnid)}`;

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  } catch (err) {
    console.error("PayU callback error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
