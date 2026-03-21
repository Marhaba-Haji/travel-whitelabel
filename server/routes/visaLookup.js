/**
 * Visa Lookup API routes - Passport OCR, Captcha, MOFA visa lookup.
 * Rate limited; PII not logged or persisted.
 */
import { Router } from "express";
import multer from "multer";
import { extractPassportData } from "../lib/passportOcr.js";
import { fetchCaptcha, submitVisaLookup } from "../lib/mofaScraper.js";

const router = Router();

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/** Per-endpoint limits — shared bucket was too tight (OCR + many captcha refreshes + lookup). */
const RATE_BUCKETS = {
  passport: Number(process.env.VISA_RATE_LIMIT_PASSPORT) || 40,
  captcha: Number(process.env.VISA_RATE_LIMIT_CAPTCHA) || 80,
  lookup: Number(process.env.VISA_RATE_LIMIT_LOOKUP) || 40,
};

function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
}

/**
 * @param {string} ip
 * @param {"passport" | "captcha" | "lookup"} bucket
 */
function checkRateLimit(ip, bucket) {
  const max = RATE_BUCKETS[bucket] ?? 40;
  const key = `${ip}:${bucket}`;
  const now = Date.now();
  let entry = rateLimitMap.get(key);
  if (!entry) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(key, entry);
  }
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  entry.count++;
  return entry.count <= max;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    const mime = file.mimetype || "";
    if (allowed.includes(mime) || mime.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP images or PDF are allowed"));
    }
  },
});

router.post("/passport-extract", (req, res, next) => {
  upload.single("passport")(req, res, (multerErr) => {
    if (multerErr) {
      console.error("Passport extract multer error:", multerErr);
      return res.status(400).json({ error: multerErr.message || "Invalid file upload." });
    }
    next();
  });
}, async (req, res) => {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, "passport")) {
    return res.status(429).json({
      error: "Too many passport uploads in a short time. Please wait a few minutes and try again.",
    });
  }

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Missing passport file. Please upload an image or PDF." });
    }
    const buffer = file.buffer;
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return res.status(400).json({ error: "File data missing. Please try again." });
    }

    const result = await Promise.race([
      extractPassportData(buffer, file.mimetype || "image/jpeg"),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Processing timed out")), 90000)
      ),
    ]);
    if (result?.error) {
      console.warn("[passport-extract] Completed with error (see server logs above for PDF pipeline details):", result.error.slice(0, 120));
    }
    return res.json(result);
  } catch (err) {
    console.error("Passport extract error:", err?.message || err);
    if (err?.stack) console.error("Stack:", err.stack);

    return res.status(200).json({
      error: err?.message || "Failed to process passport. Please enter details manually.",
    });
  }
});

router.post("/captcha", async (req, res) => {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, "captcha")) {
    return res.status(429).json({
      error: "Too many captcha requests. Please wait a few minutes and try again.",
    });
  }

  try {
    const { passportNumber, firstName, countryCode } = req.body || {};
    const { sessionId, captchaImageBase64 } = await fetchCaptcha({
      passportNumber: passportNumber != null ? String(passportNumber).trim() : undefined,
      firstName: firstName != null ? String(firstName).trim() : undefined,
      countryCode: countryCode != null ? String(countryCode).trim().toUpperCase() : undefined,
    });
    res.json({ sessionId, captchaImageBase64 });
  } catch (err) {
    console.error("Captcha fetch error:", err);

    const msg =
      err && typeof err.message === "string" && err.message.length > 0
        ? err.message
        : "Failed to load captcha. Please try again in a moment.";
    res.status(502).json({ error: msg });
  }
});

router.post("/lookup", async (req, res) => {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, "lookup")) {
    return res.status(429).json({
      error: "Too many visa lookups in a short time. Please wait up to 10 minutes and try again.",
    });
  }

  try {
    const { sessionId, passportNumber, firstName, countryCode, captchaText } = req.body || {};

    if (!sessionId || !passportNumber || !firstName || !countryCode || !captchaText) {
      return res.status(400).json({
        error: "Missing required fields: sessionId, passportNumber, firstName, countryCode, captchaText",
      });
    }

    const result = await submitVisaLookup({
      sessionId,
      passportNumber: String(passportNumber).trim(),
      firstName: String(firstName).trim(),
      countryCode: String(countryCode).trim().toUpperCase(),
      captchaText: String(captchaText).trim(),
    });

    res.json(result);
  } catch (err) {
    console.error("Visa lookup error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to complete visa lookup. Please try again.",
    });
  }
});

export default router;
