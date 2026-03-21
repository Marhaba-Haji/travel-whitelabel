/**
 * Passport OCR - Extract passport number and name from passport image or PDF.
 * Strategy: Tesseract MRZ → Tesseract VIZ regex → Gemini Vision fallback.
 * PII: Process in memory only; do not log or persist.
 */
import Tesseract from "tesseract.js";
import { parse } from "mrz";
import { pdf } from "pdf-to-img";
import sharp from "sharp";
import { GoogleGenAI } from "@google/genai";

const MRZ_LINE_REGEX = /^[A-Z0-9<]{30,44}$/;
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]);

let _cachedGeminiKey = null;
let _cachedGeminiKeyAt = 0;
const GEMINI_KEY_TTL = 10 * 60 * 1000;

async function getGeminiApiKey() {
  if (_cachedGeminiKey && Date.now() - _cachedGeminiKeyAt < GEMINI_KEY_TTL) return _cachedGeminiKey;
  if (process.env.GEMINI_API_KEY) {
    _cachedGeminiKey = process.env.GEMINI_API_KEY;
    _cachedGeminiKeyAt = Date.now();
    return _cachedGeminiKey;
  }
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return null;
  try {
    const headers = { "Content-Type": "application/json" };
    const srk = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (srk) headers.Authorization = `Bearer ${srk}`;
    const res = await fetch(`${supabaseUrl}/functions/v1/gemini-token`, { method: "POST", headers, body: "{}" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.apiKey) {
      _cachedGeminiKey = data.apiKey;
      _cachedGeminiKeyAt = Date.now();
      return _cachedGeminiKey;
    }
  } catch {
    /* fallback unavailable */
  }
  return null;
}

function extractMrzLines(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s/g, "").toUpperCase())
    .filter((l) => MRZ_LINE_REGEX.test(l));
}

async function pdfToImage(pdfBuffer) {
  const document = await pdf(pdfBuffer, { scale: 3 });
  for await (const pageBuffer of document) {
    if (pageBuffer?.length > 0) return pageBuffer;
  }
  throw new Error("Could not rasterize PDF");
}

function toDataUrl(buffer, mime = "image/png") {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function preprocessForOcr(imageBuffer) {
  return sharp(imageBuffer)
    .resize(2400, 2400, { fit: "inside", withoutEnlargement: false })
    .grayscale()
    .normalize()
    .sharpen({ sigma: 1.5 })
    .png()
    .toBuffer();
}

async function preprocessHighContrast(imageBuffer) {
  return sharp(imageBuffer)
    .resize(3000, 3000, { fit: "inside", withoutEnlargement: false })
    .grayscale()
    .linear(1.8, -80)
    .threshold(150)
    .png()
    .toBuffer();
}

function parseMrzResult(mrzLines) {
  try {
    const result = parse(mrzLines, { autocorrect: true });
    const documentNumber = result?.documentNumber?.replace(/</g, "").trim() || null;
    const fields = result?.fields || {};
    const lastName = (fields.lastName || fields.primaryIdentifier || fields.surname || "").replace(/</g, " ").trim() || null;
    const givenNames = (fields.firstName || fields.secondaryIdentifier || fields.givenNames || "").replace(/</g, " ").trim() || null;
    const firstName = givenNames ? givenNames.split(/\s+/)[0] : lastName || null;
    const lastNameVal = lastName || (givenNames ? givenNames.split(/\s+/).slice(1).join(" ") : null);
    return {
      passportNumber: documentNumber || undefined,
      firstName: (firstName || givenNames || "").trim() || undefined,
      lastName: (lastNameVal || "").trim() || undefined,
      rawMrz: mrzLines,
    };
  } catch {
    return null;
  }
}

const PASSPORT_NUM_RE = /\b([A-Z]{1,2}\d{6,8})\b/;
const GIVEN_NAME_LABEL_RE = /(?:given\s*name|first\s*name|pr[eé]nom|nombre)[:\s]*([A-Z][A-Za-z\s]{2,30})/i;
const SURNAME_LABEL_RE = /(?:sur\s*name|last\s*name|nom|family\s*name)[:\s]*([A-Z][A-Za-z\s]{2,30})/i;

function extractFromVizText(ocrText) {
  if (!ocrText || ocrText.length < 20) return null;
  const ppMatch = ocrText.match(PASSPORT_NUM_RE);
  const givenMatch = ocrText.match(GIVEN_NAME_LABEL_RE);
  const surnameMatch = ocrText.match(SURNAME_LABEL_RE);
  if (!ppMatch && !givenMatch) return null;
  return {
    passportNumber: ppMatch?.[1]?.trim() || undefined,
    firstName: givenMatch?.[1]?.trim().split(/\s+/)[0] || undefined,
    lastName: surnameMatch?.[1]?.trim() || undefined,
  };
}

const GEMINI_PROMPT = 'Extract from this passport image ONLY the passport number and the given name (first name). Return ONLY valid JSON: {"passportNumber":"...","firstName":"..."}. No extra text.';
const GEMINI_MODELS = ["gemini-2.0-flash-lite", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

async function extractWithGemini(imageBase64, mimeType) {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    let response = null;
    let lastErr = null;

    for (const model of GEMINI_MODELS) {
      try {
        console.log(`[passport-extract] Trying Gemini model: ${model}`);
        response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { mimeType: mimeType || "image/png", data: imageBase64 } },
                { text: GEMINI_PROMPT },
              ],
            },
          ],
        });
        break;
      } catch (err) {
        lastErr = err;
        const msg = String(err?.message || "");
        if (/429|quota|rate.limit|RESOURCE_EXHAUSTED/i.test(msg)) continue;
        throw err;
      }
    }
    if (!response) throw lastErr || new Error("All Gemini models rate-limited");

    const text = (response?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.passportNumber || parsed.firstName) {
      return {
        passportNumber: typeof parsed.passportNumber === "string" ? parsed.passportNumber.trim() : undefined,
        firstName: typeof parsed.firstName === "string" ? parsed.firstName.trim() : undefined,
        lastName: typeof parsed.lastName === "string" ? parsed.lastName.trim() : undefined,
      };
    }
  } catch (err) {
    console.error("[passport-extract] Gemini fallback error:", err?.message || err);
  }
  return null;
}

/**
 * @param {Buffer} fileBuffer
 * @param {string} mimetype
 */
export async function extractPassportData(fileBuffer, mimetype = "image/jpeg") {
  let imageBuffer = fileBuffer;
  let imageMime = mimetype;

  if (mimetype === "application/pdf" || (fileBuffer.length >= 4 && fileBuffer.subarray(0, 4).equals(PDF_MAGIC))) {
    try {
      imageBuffer = await pdfToImage(fileBuffer);
      imageMime = "image/png";
    } catch (pdfErr) {
      const msg = pdfErr?.message || String(pdfErr);
      console.error("[passport-extract] PDF conversion failed:", msg);
      const hint =
        /password|encrypted/i.test(msg)
          ? " The PDF may be password-protected."
          : /Invalid|corrupt|Malformed/i.test(msg)
            ? " The PDF may be corrupted or invalid."
            : /@napi-rs\/canvas|canvas|Cannot find module/i.test(msg)
              ? " PDF rendering libraries may be missing — reinstall server dependencies or use a JPEG/PNG photo."
              : "";
      return {
        error: `Could not convert PDF to image.${hint} Please upload a clear JPEG or PNG photo of your passport instead.`,
      };
    }
  }

  let cleanBuffer;
  try {
    cleanBuffer = await preprocessForOcr(imageBuffer);
  } catch {
    return { error: "Invalid or corrupted image. Please upload a clear JPEG or PNG photo." };
  }

  // --- Strategy 1: Tesseract MRZ ---
  try {
    const { data } = await Tesseract.recognize(toDataUrl(cleanBuffer), "eng", {
      logger: () => {},
      errorHandler: () => {},
    });

    const mrzLines = extractMrzLines(data?.text);
    if (mrzLines.length >= 2) {
      const parsed = parseMrzResult(mrzLines);
      if (parsed?.passportNumber) return { ...parsed, source: "mrz" };
    }

    // Strategy 2: regex on full OCR text (VIZ zone — labels like "Given Name", passport numbers)
    const vizResult = extractFromVizText(data?.text);
    if (vizResult?.passportNumber) return { ...vizResult, rawMrz: mrzLines, source: "viz" };
  } catch {
    /* continue to next strategy */
  }

  // --- Strategy 3: high-contrast threshold + OCR ---
  try {
    const hcBuffer = await preprocessHighContrast(imageBuffer);
    const { data } = await Tesseract.recognize(toDataUrl(hcBuffer), "eng", {
      logger: () => {},
      errorHandler: () => {},
    });
    const mrzLines = extractMrzLines(data?.text);
    if (mrzLines.length >= 2) {
      const parsed = parseMrzResult(mrzLines);
      if (parsed?.passportNumber) return { ...parsed, source: "mrz-hc" };
    }
    const vizResult = extractFromVizText(data?.text);
    if (vizResult?.passportNumber) return { ...vizResult, rawMrz: mrzLines, source: "viz-hc" };
  } catch {
    /* continue */
  }

  // --- Strategy 4: Gemini Vision (most reliable for scanned passports) ---
  try {
    console.log("[passport-extract] Tesseract strategies failed, trying Gemini Vision...");
    const compactBuffer = await sharp(imageBuffer)
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    const geminiResult = await extractWithGemini(compactBuffer.toString("base64"), "image/jpeg");
    if (geminiResult?.passportNumber || geminiResult?.firstName) {
      console.log("[passport-extract] Gemini extracted:", geminiResult.passportNumber, geminiResult.firstName);
      return { ...geminiResult, source: "gemini" };
    }
    console.log("[passport-extract] Gemini returned no data");
  } catch (err) {
    console.error("[passport-extract] Gemini strategy failed:", err?.message);
  }

  return {
    error: "Could not read passport details. Please enter your passport number and first name manually.",
    rawMrz: [],
  };
}
