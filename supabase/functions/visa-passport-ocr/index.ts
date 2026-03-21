import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_PROMPT = `You are a passport OCR system. Extract ONLY the following fields from this passport image:
1. Passport number (the document number, usually alphanumeric like "T4548949")
2. Given name / first name (NOT surname/family name)
3. Last name / surname / family name

Return ONLY valid JSON with no extra text: {"passportNumber":"...","firstName":"...","lastName":"..."}
If you cannot read a field, use an empty string for that field.`;

const GEMINI_MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

// Simple IP rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
    rateLimitMap.set(ip, entry);
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a few minutes." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { fileBase64, mimeType } = body;

    if (!fileBase64) {
      return new Response(
        JSON.stringify({ error: "fileBase64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeMime = mimeType && ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(mimeType)
      ? mimeType
      : "image/jpeg";

    let result: { passportNumber?: string; firstName?: string; lastName?: string } | null = null;
    let lastErr: Error | null = null;

    for (const model of GEMINI_MODELS) {
      try {
        console.log(`[visa-passport-ocr] Trying model: ${model}`);
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { inlineData: { mimeType: safeMime, data: fileBase64 } },
                  { text: GEMINI_PROMPT },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 256,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          if (/429|quota|rate.limit|RESOURCE_EXHAUSTED/i.test(errText)) {
            lastErr = new Error(`Rate limited on ${model}`);
            continue;
          }
          throw new Error(`Gemini API error (${response.status}): ${errText.slice(0, 200)}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.passportNumber || parsed.firstName) {
            result = {
              passportNumber: typeof parsed.passportNumber === "string" ? parsed.passportNumber.trim() : undefined,
              firstName: typeof parsed.firstName === "string" ? parsed.firstName.trim() : undefined,
              lastName: typeof parsed.lastName === "string" ? parsed.lastName.trim() : undefined,
            };
            break;
          }
        }
      } catch (err) {
        lastErr = err instanceof Error ? err : new Error(String(err));
        if (/429|quota|rate/i.test(lastErr.message)) continue;
        break;
      }
    }

    if (result) {
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Could not read passport details. Please enter your passport number and first name manually.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("visa-passport-ocr error:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to process passport. Please enter details manually.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
