/**
 * Visa Lookup - Submits the MOFA visa search form via HTTP POST.
 * Uses session cookies from visa-captcha to maintain the same MOFA session.
 * Parses the HTML response to extract visa results.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MOFA_URL = "https://visa.mofa.gov.sa/visaservices/searchvisa";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
const SESSION_MAX_AGE = 10 * 60 * 1000; // 10 minutes

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

/** No-result phrases from MOFA (Arabic + English) */
const NO_RESULT_PHRASES = [
  "لم يتم العثور",
  "لا توجد بيانات",
  "no record",
  "no result",
  "not found",
  "no data",
  "لا توجد نتائج",
  "لا يوجد سجل",
  "لم يتم",
  "there is no any information",
  "no any information for the selected",
  "no information for the selected values",
];

/** Visa-found signals */
const VISA_FOUND_PHRASES = [
  "تاريخ الإصدار",
  "تاريخ الانتهاء",
  "date of issue",
  "date of expiry",
  "visa expiry",
  "صورة التأشيرة",
  "visa copy",
  "تم إصدار",
  "حالة التأشيرة",
  "نوع التأشيرة",
  "رقم الطلب",
  "application no",
  "border number",
  "الرقم الحدودي",
];

const CAPTCHA_ERROR_PHRASES = [
  "خطأ في رمز",
  "رمز الصورة غير",
  "رمز التحقق غير",
  "incorrect captcha",
  "invalid captcha",
  "wrong captcha",
  "عفوا حدث خطأ",
];

/** Strip HTML tags and normalize whitespace */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract text from alert/result divs */
function extractResultText(html: string): string {
  const patterns = [
    /<div[^>]*class="[^"]*alert[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*swal[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*role="dialog"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*role="alert"[^>]*>([\s\S]*?)<\/div>/gi,
    /<table[^>]*>([\s\S]*?)<\/table>/gi,
  ];

  const chunks: string[] = [];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) {
      const text = htmlToText(m[1] || m[0]);
      if (text.length > 15) chunks.push(text);
    }
  }
  return chunks.join("\n").trim();
}

/** Check if the response redirected to a print visa page */
function isPrintVisaUrl(url: string): boolean {
  return /printeventvisa/i.test(url);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Too many visa lookups. Please wait a few minutes and try again.",
      }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { sessionData, passportNumber, firstName, countryCode, captchaText } = body;

    if (!sessionData || !passportNumber || !firstName || !countryCode || !captchaText) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: sessionData, passportNumber, firstName, countryCode, captchaText",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decode session data
    let session: { cookies: string; captchaUrl: string; createdAt: number };
    try {
      session = JSON.parse(atob(sessionData));
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid session. Please get a new captcha and try again.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check session age
    if (Date.now() - session.createdAt > SESSION_MAX_AGE) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Session expired. Please get a new captcha and try again.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build form data for MOFA POST
    const formParams = new URLSearchParams();
    formParams.set("ReaderType", "1"); // Barcode reader
    formParams.set("tbMRZCode", "");
    formParams.set("ddlFirstValue", "PassPortNo");
    formParams.set("tbFirstValue", String(passportNumber).trim());
    formParams.set("ddlSecondValue", "fName");
    formParams.set("tbSecondValue", String(firstName).trim());
    formParams.set("NationalityId", String(countryCode).trim().toUpperCase());
    formParams.set("Captcha", String(captchaText).trim());
    formParams.set("submit", "استعلم");

    console.log(`[visa-lookup] Submitting to MOFA for nationality=${countryCode}`);

    // Submit form
    const response = await fetch(MOFA_URL, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Cookie": session.cookies,
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": MOFA_URL,
        "Origin": "https://visa.mofa.gov.sa",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
      },
      body: formParams.toString(),
      redirect: "follow",
    });

    const responseUrl = response.url || MOFA_URL;
    const responseHtml = await response.text();
    const resultText = extractResultText(responseHtml);
    const fullText = htmlToText(responseHtml);
    const combinedLower = `${resultText}\n${fullText}`.toLowerCase();

    // Check for captcha errors
    const hasCaptchaError = CAPTCHA_ERROR_PHRASES.some((p) =>
      combinedLower.includes(p.toLowerCase())
    );
    if (hasCaptchaError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "The captcha was incorrect or expired. Please get a new captcha and try again.",
          mofaMessage: resultText.slice(0, 500) || undefined,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for no-result
    const hasNoResult = NO_RESULT_PHRASES.some((p) =>
      combinedLower.includes(p.toLowerCase())
    );

    // Check for visa found
    const hasVisaFound =
      isPrintVisaUrl(responseUrl) ||
      VISA_FOUND_PHRASES.some((p) => combinedLower.includes(p.toLowerCase()));

    if (hasNoResult && !hasVisaFound) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No visa found for these details. Double-check the passport number, first name, and nationality, or the visa may not have been issued yet.",
          visaDetails: resultText ? { rawText: resultText } : undefined,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If redirected to print visa page or found visa signals, try to capture visa details
    if (hasVisaFound) {
      // If redirected to print page, fetch it
      let visaHtml = responseHtml;
      if (isPrintVisaUrl(responseUrl)) {
        try {
          const printResponse = await fetch(responseUrl, {
            headers: {
              "User-Agent": UA,
              "Cookie": session.cookies,
              "Referer": MOFA_URL,
            },
          });
          visaHtml = await printResponse.text();
        } catch {
          // Use original response
        }
      }

      // Look for a link to PrintEventVisa in the response
      const printLinkMatch = visaHtml.match(/href="([^"]*PrintEventVisa[^"]*)"/i);
      if (printLinkMatch?.[1]) {
        let printUrl = printLinkMatch[1];
        if (printUrl.startsWith("/")) {
          printUrl = `https://visa.mofa.gov.sa${printUrl}`;
        }
        try {
          const printResponse = await fetch(printUrl, {
            headers: {
              "User-Agent": UA,
              "Cookie": session.cookies,
              "Referer": responseUrl,
            },
          });
          if (printResponse.ok) {
            visaHtml = await printResponse.text();
          }
        } catch {
          // Use what we have
        }
      }

      // Try to extract visa image
      let visaImageBase64: string | undefined;
      const imgMatches = visaHtml.matchAll(/<img[^>]*src="([^"]*)"[^>]*>/gi);
      for (const imgMatch of imgMatches) {
        const src = imgMatch[1];
        if (!src || /captcha|logo|icon|avatar|header|footer|banner|social/i.test(src)) continue;
        if (/visa|qr/i.test(src)) {
          try {
            let imgUrl = src;
            if (imgUrl.startsWith("/")) imgUrl = `https://visa.mofa.gov.sa${imgUrl}`;
            if (imgUrl.startsWith("data:image/")) {
              const b64 = imgUrl.replace(/^data:image\/\w+;base64,/, "");
              if (b64.length > 200) {
                visaImageBase64 = b64;
                break;
              }
            } else if (imgUrl.startsWith("http")) {
              const imgResp = await fetch(imgUrl, {
                headers: { "User-Agent": UA, "Cookie": session.cookies },
              });
              if (imgResp.ok) {
                const imgBuf = await imgResp.arrayBuffer();
                if (imgBuf.byteLength > 200) {
                  visaImageBase64 = btoa(String.fromCharCode(...new Uint8Array(imgBuf)));
                  break;
                }
              }
            }
          } catch {
            // Skip this image
          }
        }
      }

      const visaResultText = extractResultText(visaHtml) || resultText;

      return new Response(
        JSON.stringify({
          success: true,
          visaDetails: {
            rawText: visaResultText || fullText.slice(0, 2000),
            visaImageBase64,
            visaCopyMime: "image/png",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ambiguous result
    return new Response(
      JSON.stringify({
        success: false,
        error: "We could not determine the visa status from MOFA's response. Try again with a new captcha, or check directly at visa.mofa.gov.sa.",
        visaDetails: resultText ? { rawText: resultText.slice(0, 2000) } : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("visa-lookup error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to complete visa lookup. Please try again.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
