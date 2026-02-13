import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, ".env"), silent: true, override: true });

import express from "express";
import cors from "cors";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;

// Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// PayU
const PAYU_KEY = process.env.PAYU_KEY;
const PAYU_SALT_32 = process.env.PAYU_SALT_32;
const PAYU_SALT_256 = process.env.PAYU_SALT_256;
const PAYU_ACTION = process.env.PAYU_ACTION_URL || "https://secure.payu.in/_payment";

// URLs: BACKEND_URL = where PayU posts callbacks; BASE_URL = frontend redirect
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.BASE_URL || process.env.FRONTEND_URL || "http://localhost:8080";

function generatePayUHash(params, salt) {
  const hashString = [
    params.key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || "",
    params.udf2 || "",
    params.udf3 || "",
    params.udf4 || "",
    params.udf5 || "",
    "",
    "",
    "",
    "",
    "",
    salt,
  ].join("|");
  return crypto.createHash("sha512").update(hashString).digest("hex");
}

// ----- Contact form -----
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Name, email and message are required" });
    }

    if (!supabase) {
      console.warn("Supabase not configured; contact form data not stored");
      return res.status(200).json({ success: true, message: "Thank you for contacting us." });
    }

    const { error } = await supabase.from("contact_enquiries").insert({
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().slice(0, 255),
      phone: phone ? String(phone).trim().slice(0, 20) : null,
      message: String(message).trim().slice(0, 1000),
    });

    if (error) {
      console.error("Contact insert error:", error);
      return res.status(500).json({ error: "Failed to save your message. Please try again." });
    }

    res.status(200).json({ success: true, message: "Thank you for contacting us. We'll get back to you within 24 hours." });
  } catch (err) {
    console.error("Contact API error:", err);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ----- Newsletter -----
app.post("/api/newsletter", async (req, res) => {
  try {
    const { email } = req.body || {};
    const trimmed = email?.trim();
    if (!trimmed || !trimmed.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    if (!supabase) {
      console.warn("Supabase not configured; newsletter data not stored");
      return res.status(200).json({ success: true, message: "Thank you for subscribing!" });
    }

    const { error } = await supabase.from("newsletter_subscriptions").insert({
      email: trimmed.slice(0, 255),
    });

    if (error) {
      if (error.code === "23505") {
        return res.status(200).json({ success: true, message: "You're already subscribed. Thank you!" });
      }
      console.error("Newsletter insert error:", error);
      return res.status(500).json({ error: "Failed to subscribe. Please try again." });
    }

    res.status(200).json({ success: true, message: "Thank you for subscribing to our newsletter!" });
  } catch (err) {
    console.error("Newsletter API error:", err);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ----- Create payment (signup + PayU params) -----
app.post("/api/create-payment", async (req, res) => {
  try {
    const salt = PAYU_SALT_256 || PAYU_SALT_32;
    const isDemo = !PAYU_KEY || !salt;

    const body = req.body || {};
    const { fullName, email, phone, city, password, termsAccepted, couponCode } = body;

    if (!email || !fullName || !phone) {
      return res.status(400).json({ error: "Missing required fields: fullName, email, phone" });
    }

    let registrationId = null;

    if (supabase) {
      const passwordHash = password ? await bcrypt.hash(String(password), 10) : null;
      const { data: reg, error: regErr } = await supabase
        .from("registrations")
        .insert({
          full_name: String(fullName).trim().slice(0, 100),
          email: String(email).trim().slice(0, 255),
          phone: String(phone).replace(/\D/g, "").slice(-10) || String(phone).trim(),
          city: city ? String(city).trim().slice(0, 100) : null,
          password_hash: passwordHash,
          terms_accepted: Boolean(termsAccepted),
        })
        .select("id")
        .single();

      if (regErr) {
        console.error("Registration insert error:", regErr);
        return res.status(500).json({ error: "Registration failed. Please try again.", message: regErr.message });
      }
      registrationId = reg?.id;
    }

    if (isDemo) {
      return res.status(200).json({
        demo: true,
        redirect: "/signup-success",
      });
    }

    let amount = "18799.00";
    let appliedCouponCode = null;

    if (supabase) {
      const { data: pricing } = await supabase.from("site_settings").select("value").eq("key", "pricing").single();
      const v = pricing?.value || {};
      const basePrice = Number(v.base_price) || 18799;
      const gstPercent = Number(v.gst_percent) || 0;
      let total = basePrice * (1 + gstPercent / 100);

      if (couponCode && String(couponCode).trim()) {
        const code = String(couponCode).trim().toUpperCase();
        const { data: coupon, error: couponErr } = await supabase
          .from("coupons")
          .select("id, code, discount_type, discount_value, max_uses, times_used, valid_until, is_active")
          .eq("code", code)
          .eq("is_active", true)
          .maybeSingle();

        if (!couponErr && coupon) {
          const now = new Date();
          const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
          const underMaxUses = coupon.max_uses == null || coupon.times_used < coupon.max_uses;

          if (!validUntil || validUntil >= now) {
            if (underMaxUses) {
              if (coupon.discount_type === "percentage") {
                total = total * (1 - Number(coupon.discount_value) / 100);
              } else {
                total = Math.max(0, total - Number(coupon.discount_value));
              }
              appliedCouponCode = coupon.code;
              await supabase.from("coupons").update({
                times_used: coupon.times_used + 1,
                updated_at: new Date().toISOString(),
              }).eq("id", coupon.id);
            }
          }
        }
      }

      amount = Math.max(0.01, total).toFixed(2);
    }

    const txnid = `TXN${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const productinfo = "Travel Agency White-Label Platform - Annual Subscription";
    const firstname = (fullName || "").split(" ")[0] || fullName;

    const surl = `${BACKEND_URL.replace(/\/$/, "")}/api/payu-success`;
    const furl = `${BACKEND_URL.replace(/\/$/, "")}/api/payu-failure`;

    const params = {
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email: String(email).trim(),
      phone: (phone || "").replace(/\D/g, "").slice(-10),
      surl,
      furl,
      udf1: city || "",
      udf2: fullName || "",
      udf3: registrationId || "",
      udf4: appliedCouponCode || "",
      udf5: "",
    };

    const hash = generatePayUHash(params, salt);
    params.hash = hash;

    if (supabase && registrationId) {
      const { error: payErr } = await supabase.from("payments").insert({
        registration_id: registrationId,
        txn_id: txnid,
        amount: parseFloat(amount),
        currency: "INR",
        product_info: productinfo,
        status: "initiated",
        success_url: surl,
        failure_url: furl,
      });
      if (payErr) console.error("Payment init insert error:", payErr);
    }

    res.json({
      action: PAYU_ACTION,
      params,
    });
  } catch (err) {
    console.error("create-payment error:", err);
    res.status(500).json({
      error: "Server error",
      message: err?.message || "Please try again.",
    });
  }
});

// ----- PayU success callback (PayU POSTs form data here) -----
app.post("/api/payu-success", async (req, res) => {
  const data = { ...req.body };
  const txnid = data.txnid || data.txnId;

  if (supabase && txnid) {
    try {
      const { data: payment } = await supabase
        .from("payments")
        .select("id, registration_id")
        .eq("txn_id", txnid)
        .single();

      if (payment) {
        await supabase.from("payments").update({
          status: data.status || "success",
          payu_mihpayid: data.mihpayid || data.payu_mihpayid || null,
          bank_ref_num: data.bank_ref_num || null,
          payment_mode: data.mode || null,
          error_code: data.error_code || null,
          error_message: data.error_Message || data.error_message || null,
          updated_at: new Date().toISOString(),
        }).eq("id", payment.id);

        await supabase.from("payment_gateway_responses").insert({
          payment_id: payment.id,
          txn_id: txnid,
          gateway: "payu",
          response_type: "success_callback",
          raw_response: data,
          status: data.status || "success",
        });

        if (payment.registration_id) {
          await supabase.from("registrations").update({
            status: "payment_completed",
            updated_at: new Date().toISOString(),
          }).eq("id", payment.registration_id);
        }
      } else {
        await supabase.from("payment_gateway_responses").insert({
          txn_id: txnid,
          gateway: "payu",
          response_type: "success_callback",
          raw_response: data,
          status: data.status || "success",
        });
      }
    } catch (e) {
      console.error("PayU success callback error:", e);
    }
  }

  res.redirect(302, `${FRONTEND_URL.replace(/\/$/, "")}/signup-success`);
});

// ----- PayU failure callback -----
app.post("/api/payu-failure", async (req, res) => {
  const data = { ...req.body };
  const txnid = data.txnid || data.txnId;

  if (supabase && txnid) {
    try {
      const { data: payment } = await supabase
        .from("payments")
        .select("id")
        .eq("txn_id", txnid)
        .single();

      if (payment) {
        await supabase.from("payments").update({
          status: data.status || "failed",
          payu_mihpayid: data.mihpayid || data.payu_mihpayid || null,
          bank_ref_num: data.bank_ref_num || null,
          payment_mode: data.mode || null,
          error_code: data.error_code || null,
          error_message: data.error_Message || data.error_message || null,
          updated_at: new Date().toISOString(),
        }).eq("id", payment.id);
      }

      await supabase.from("payment_gateway_responses").insert({
        payment_id: payment?.id || null,
        txn_id: txnid,
        gateway: "payu",
        response_type: "failure_callback",
        raw_response: data,
        status: data.status || "failed",
      });
    } catch (e) {
      console.error("PayU failure callback error:", e);
    }
  }

  res.redirect(302, `${FRONTEND_URL.replace(/\/$/, "")}/signup?payment=failed`);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`PayU: ${PAYU_ACTION}`);
  console.log(`Supabase: ${supabase ? "connected" : "not configured"}`);
});
