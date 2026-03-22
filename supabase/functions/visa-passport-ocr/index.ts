const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Highly detailed prompt for maximum passport extraction accuracy.
 * Uses chain-of-thought reasoning and MRZ cross-validation.
 */
const GEMINI_PROMPT = `You are an expert passport document analysis system with deep knowledge of Machine Readable Zone (MRZ) formats (TD3 for passports), ICAO 9303 standards, and passport layouts from every country.

## Your Task
Analyze this passport image and extract the following fields with the highest possible accuracy:

1. **Passport Number** (Document Number)
2. **Given Name(s) / First Name(s)** — NOT the surname/family name
3. **Surname / Family Name / Last Name**
4. **Nationality** — The 3-letter ISO 3166-1 alpha-3 country code (e.g., IND, PAK, BGD, EGY, IDN, MYS, GBR, USA)

## Extraction Strategy (follow this step by step)

### Step 1: Locate the MRZ (Machine Readable Zone)
- The MRZ is at the bottom of the passport data page — two lines of 44 characters each for TD3 passports.
- MRZ Line 1 format: P<ISSUING_STATE_CODE<SURNAME<<GIVEN_NAMES<<<<<<<<<<<<<<<<
- MRZ Line 2 format: PASSPORT_NUMBER<CHECK_DIGIT<NATIONALITY<DOB<CHECK_DIGIT<SEX<EXPIRY<CHECK_DIGIT<PERSONAL_NUMBER<CHECK_DIGIT<COMPOSITE_CHECK_DIGIT
- Extract fields from the MRZ first — it is the most reliable source.

### Step 2: Locate the Visual Inspection Zone (VIZ)
- Read the printed text fields above the MRZ: "Surname", "Given Names", "Passport No.", "Nationality", "Date of Birth", etc.
- Different countries use different labels and languages, but the field layout is standardized.

### Step 3: Cross-validate MRZ against VIZ
- The passport number in MRZ Line 2 (positions 1-9) must match the printed passport number.
- The surname in MRZ Line 1 must match the printed surname field.
- The given names in MRZ Line 1 must match the printed given names field.
- The nationality code in MRZ Line 2 (positions 11-13) must match the nationality field.
- If there's a discrepancy, prefer the VIZ (printed text) as MRZ OCR can have character confusion (0/O, 1/I, 8/B, 5/S, 2/Z).

### Step 4: Apply common OCR corrections
- In passport numbers: O is usually 0, I is usually 1, S is usually 5, Z is usually 2
- Names should only contain letters, hyphens, apostrophes, and spaces
- Nationality codes are always 3 uppercase letters

## Critical Rules
- **Given name**: Extract ALL given names (first + middle names), NOT the surname. For example, if the passport shows "Surname: KHAN" and "Given Names: MOHAMMED AHMED", the firstName should be "MOHAMMED AHMED".
- **Passport number**: Include any leading letters. Common formats: A12345678, AB1234567, 123456789.
- **Nationality**: Return the 3-letter country code, NOT the full country name. Common codes: IND (India), PAK (Pakistan), BGD (Bangladesh), EGY (Egypt), IDN (Indonesia), MYS (Malaysia), PHL (Philippines), LKA (Sri Lanka), NPL (Nepal), JOR (Jordan), SAU (Saudi Arabia), ARE (UAE), GBR (UK), USA (US).

## Output Format
Return ONLY a valid JSON object with no markdown formatting, no code blocks, no explanation:
{"passportNumber":"...","firstName":"...","lastName":"...","nationality":"...","confidence":"high|medium|low"}

- Use empty string "" for any field you cannot read.
- Set confidence to "high" if MRZ and VIZ match, "medium" if only one source was readable, "low" if uncertain.`;

// Use the best vision models in order of preference
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
];

// Rate limiting
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

/** Normalize extracted passport number */
function normalizePassportNumber(raw: string): string {
  // Remove spaces, fix common OCR errors
  let num = raw.trim().toUpperCase().replace(/\s+/g, "");
  // Common OCR corrections in passport numbers
  // Only apply to digit positions — letters at start are intentional
  return num;
}

/** Normalize name: title case, trim */
function normalizeName(raw: string): string {
  return raw.trim().toUpperCase();
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

    let result: {
      passportNumber?: string;
      firstName?: string;
      lastName?: string;
      nationality?: string;
      confidence?: string;
    } | null = null;
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
              temperature: 0.0, // Deterministic for maximum accuracy
              maxOutputTokens: 512,
              topP: 0.1, // Very focused output
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[visa-passport-ocr] ${model} error: ${errText.slice(0, 300)}`);
          if (/429|quota|rate.limit|RESOURCE_EXHAUSTED/i.test(errText)) {
            lastErr = new Error(`Rate limited on ${model}`);
            continue;
          }
          throw new Error(`Gemini API error (${response.status}): ${errText.slice(0, 200)}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log(`[visa-passport-ocr] ${model} raw response: ${text.slice(0, 500)}`);

        // Extract JSON from response (handle markdown code blocks too)
        const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.passportNumber || parsed.firstName) {
            result = {
              passportNumber: typeof parsed.passportNumber === "string"
                ? normalizePassportNumber(parsed.passportNumber)
                : undefined,
              firstName: typeof parsed.firstName === "string"
                ? normalizeName(parsed.firstName)
                : undefined,
              lastName: typeof parsed.lastName === "string"
                ? normalizeName(parsed.lastName)
                : undefined,
              nationality: typeof parsed.nationality === "string"
                ? parsed.nationality.trim().toUpperCase().slice(0, 3)
                : undefined,
              confidence: parsed.confidence || "medium",
            };

            console.log(`[visa-passport-ocr] Extracted: passport=${result.passportNumber}, name=${result.firstName} ${result.lastName}, nationality=${result.nationality}, confidence=${result.confidence}`);
            break;
          }
        }

        console.warn(`[visa-passport-ocr] ${model} returned no parseable result`);
      } catch (err) {
        lastErr = err instanceof Error ? err : new Error(String(err));
        console.error(`[visa-passport-ocr] ${model} failed:`, lastErr.message);
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

    console.error("[visa-passport-ocr] All models failed. Last error:", lastErr?.message);
    return new Response(
      JSON.stringify({
        error: "Could not read passport details. Please ensure the image is clear and well-lit, showing the full data page including the MRZ (machine-readable zone) at the bottom. You can also enter your details manually.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[visa-passport-ocr] error:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to process passport. Please enter details manually.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
