/**
 * Visa Captcha - Fetches the MOFA visa search page via HTTP, extracts captcha image,
 * and returns session cookies + captcha image for the client.
 * No Playwright needed — MOFA uses server-rendered HTML with standard POST forms.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MOFA_URL = "https://visa.mofa.gov.sa/visaservices/searchvisa";
const MOFA_CAPTCHA_RE = /src="(https:\/\/visa\.mofa\.gov\.sa\/Base\/GetRandomCaptchaImage\/\d+)"/;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;
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

/** Extract Set-Cookie headers into a cookie string for subsequent requests. */
function extractCookies(response: Response): string {
  const cookies: string[] = [];
  // response.headers.getSetCookie() returns all Set-Cookie values
  const setCookieHeaders = response.headers.getSetCookie?.() || [];
  for (const sc of setCookieHeaders) {
    const nameValue = sc.split(";")[0]?.trim();
    if (nameValue) cookies.push(nameValue);
  }
  // Fallback: try raw header
  if (cookies.length === 0) {
    const raw = response.headers.get("set-cookie");
    if (raw) {
      // Multiple cookies may be comma-separated (or not, depending on server)
      for (const part of raw.split(/,(?=[^ ])/)) {
        const nameValue = part.split(";")[0]?.trim();
        if (nameValue) cookies.push(nameValue);
      }
    }
  }
  return cookies.join("; ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many captcha requests. Please wait a few minutes." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Step 1: GET the MOFA search page to obtain session cookies and captcha image URL
    const pageResponse = await fetch(MOFA_URL, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
      },
      redirect: "follow",
    });

    if (!pageResponse.ok) {
      console.error(`MOFA page returned ${pageResponse.status}`);
      return new Response(
        JSON.stringify({ error: `MOFA website returned status ${pageResponse.status}. Please try again.` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cookies = extractCookies(pageResponse);
    const html = await pageResponse.text();

    // Step 2: Extract captcha image URL from HTML
    const captchaMatch = html.match(MOFA_CAPTCHA_RE);
    if (!captchaMatch?.[1]) {
      console.error("[visa-captcha] No captcha image found in MOFA HTML");
      return new Response(
        JSON.stringify({
          error: "MOFA did not return a captcha image. Their site may be temporarily unavailable. Please try again in a moment.",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const captchaUrl = captchaMatch[1];

    // Step 3: Fetch the captcha image using the same cookies (session-bound)
    const captchaResponse = await fetch(captchaUrl, {
      headers: {
        "User-Agent": UA,
        "Cookie": cookies,
        "Referer": MOFA_URL,
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    if (!captchaResponse.ok) {
      console.error(`Captcha image fetch failed: ${captchaResponse.status}`);
      return new Response(
        JSON.stringify({ error: "Failed to load captcha image from MOFA. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Merge any additional cookies from captcha response
    const captchaCookies = extractCookies(captchaResponse);
    const allCookies = captchaCookies
      ? `${cookies}; ${captchaCookies}`
      : cookies;

    const captchaBuffer = await captchaResponse.arrayBuffer();
    const captchaBase64 = btoa(
      String.fromCharCode(...new Uint8Array(captchaBuffer))
    );

    if (!captchaBase64 || captchaBase64.length < 40) {
      return new Response(
        JSON.stringify({ error: "Captcha image was empty. Please retry." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Create a session ID and encode cookies for the client to send back
    const sessionId = `mofa_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    // Encode session data (cookies needed for form submit) as base64 JSON
    const sessionData = btoa(JSON.stringify({
      cookies: allCookies,
      captchaUrl,
      createdAt: Date.now(),
    }));

    return new Response(
      JSON.stringify({
        sessionId,
        sessionData, // client must send this back on lookup
        captchaImageBase64: captchaBase64,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("visa-captcha error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: msg.includes("abort") || msg.includes("timeout")
          ? "Request to MOFA timed out. Please try again."
          : "Failed to load captcha. Please try again.",
      }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
