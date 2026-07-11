import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, ".env"), silent: true, override: true });

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import visaLookupRouter from "./routes/visaLookup.js";
import { rateLimiter } from "./lib/rateLimit.js";

const app = express();

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.BASE_URL || process.env.FRONTEND_URL || "http://localhost:8080";

// Only the site itself needs to call this API from a browser
const allowedOrigins = new Set([
  FRONTEND_URL.replace(/\/$/, ""),
  "https://marhabadmc.com",
  "https://www.marhabadmc.com",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
]);
app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser clients (no Origin header) and whitelisted origins
    if (!origin || allowedOrigins.has(origin)) return cb(null, true);
    return cb(null, false);
  },
}));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * `website` is a honeypot field: it is hidden in the UI, so any submission
 * that fills it is a bot and gets a fake success response.
 */
function isHoneypotTripped(body) {
  return typeof body?.website === "string" && body.website.trim().length > 0;
}

// ----- Contact form -----
app.post(
  "/api/contact",
  rateLimiter("contact", 5, 10 * 60 * 1000, "Too many messages sent. Please try again in a few minutes."),
  async (req, res) => {
    try {
      const { name, email, phone, message } = req.body || {};
      if (isHoneypotTripped(req.body)) {
        return res.status(200).json({ success: true, message: "Thank you for contacting us." });
      }
      if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return res.status(400).json({ error: "Name, email and message are required" });
      }
      if (!EMAIL_RE.test(String(email).trim())) {
        return res.status(400).json({ error: "Please provide a valid email address" });
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
  },
);

// ----- Newsletter -----
app.post(
  "/api/newsletter",
  rateLimiter("newsletter", 5, 10 * 60 * 1000, "Too many subscription attempts. Please try again in a few minutes."),
  async (req, res) => {
    try {
      const { email } = req.body || {};
      if (isHoneypotTripped(req.body)) {
        return res.status(200).json({ success: true, message: "Thank you for subscribing!" });
      }
      const trimmed = email?.trim();
      if (!trimmed || !EMAIL_RE.test(trimmed)) {
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
  },
);

// NOTE: PayU payment routes used to live here. Payments now go exclusively
// through the Supabase edge functions (create-payment / create-webinar-payment /
// payu-callback), which verify the PayU response hash. Do not re-add payment
// endpoints here without hash verification.

// Chrome DevTools requests this on every origin; without it you get 404 + CSP console noise
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.type("application/json").send("{}");
});

// ----- Visa lookup (passport OCR, MOFA visa check) -----
app.use("/api/visa", visaLookupRouter);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Supabase: ${supabase ? "connected" : "not configured"}`);
});
