/**
 * Visa Captcha - Fetches the MOFA visa search page via HTTP, extracts captcha image,
 * and returns session cookies + captcha image for the client.
 * Uses node:https to bypass TLS certificate issues with MOFA's server.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MOFA_URL = "https://visa.mofa.gov.sa/visaservices/searchvisa";
const MOFA_HOST = "visa.mofa.gov.sa";
const MOFA_CAPTCHA_RE = /(?:src|data-src)\s*=\s*["']([^"']*GetRandomCaptchaImage\/\d+)["']/i;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

// Explicit DigiCert chain to avoid UnknownIssuer in edge runtimes with limited trust stores.
const DIGICERT_GLOBAL_G2_TLS_RSA_SHA256_2020_CA1_CERT = `-----BEGIN CERTIFICATE-----
MIIEyDCCA7CgAwIBAgIQDPW9BitWAvR6uFAsI8zwZjANBgkqhkiG9w0BAQsFADBh
MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3
d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBH
MjAeFw0yMTAzMzAwMDAwMDBaFw0zMTAzMjkyMzU5NTlaMFkxCzAJBgNVBAYTAlVT
MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxMzAxBgNVBAMTKkRpZ2lDZXJ0IEdsb2Jh
bCBHMiBUTFMgUlNBIFNIQTI1NiAyMDIwIENBMTCCASIwDQYJKoZIhvcNAQEBBQAD
ggEPADCCAQoCggEBAMz3EGJPprtjb+2QUlbFbSd7ehJWivH0+dbn4Y+9lavyYEEV
cNsSAPonCrVXOFt9slGTcZUOakGUWzUb+nv6u8W+JDD+Vu/E832X4xT1FE3LpxDy
FuqrIvAxIhFhaZAmunjZlx/jfWardUSVc8is/+9dCopZQ+GssjoP80j812s3wWPc
3kbW20X+fSP9kOhRBx5Ro1/tSUZUfyyIxfQTnJcVPAPooTncaQwywa8WV0yUR0J8
osicfebUTVSvQpmowQTCd5zWSOTOEeAqgJnwQ3DPP3Zr0UxJqyRewg2C/Uaoq2yT
zGJSQnWS+Jr6Xl6ysGHlHx+5fwmY6D36g39HaaECAwEAAaOCAYIwggF+MBIGA1Ud
EwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFHSFgMBmx9833s+9KTeqAx2+7c0XMB8G
A1UdIwQYMBaAFE4iVCAYlebjbuYP+vq5Eu0GF485MA4GA1UdDwEB/wQEAwIBhjAd
BgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwdgYIKwYBBQUHAQEEajBoMCQG
CCsGAQUFBzABhhhodHRwOi8vb2NzcC5kaWdpY2VydC5jb20wQAYIKwYBBQUHMAKG
NGh0dHA6Ly9jYWNlcnRzLmRpZ2ljZXJ0LmNvbS9EaWdpQ2VydEdsb2JhbFJvb3RH
Mi5jcnQwQgYDVR0fBDswOTA3oDWgM4YxaHR0cDovL2NybDMuZGlnaWNlcnQuY29t
L0RpZ2lDZXJ0R2xvYmFsUm9vdEcyLmNybDA9BgNVHSAENjA0MAsGCWCGSAGG/WwC
ATAHBgVngQwBATAIBgZngQwBAgEwCAYGZ4EMAQICMAgGBmeBDAECAzANBgkqhkiG
9w0BAQsFAAOCAQEAkPFwyyiXaZd8dP3A+iZ7U6utzWX9upwGnIrXWkOH7U1MVl+t
wcW1BSAuWdH/SvWgKtiwla3JLko716f2b4gp/DA/JIS7w7d7kwcsr4drdjPtAFVS
slme5LnQ89/nD/7d+MS5EHKBCQRfz5eeLjJ1js+aWNJXMX43AYGyZm0pGrFmCW3R
bpD0ufovARTFXFZkAdl9h6g4U5+LXUZtXMYnhIHUfoyMo5tS58aI7Dd8KvvwVVo4
chDYABPPTHPbqjc1qCmBaZx2vN4Ye5DUys/vZwP9BFohFrH/6j/f3IL16/RZkiMN
JCqVJUzKoZHm1Lesh3Sz8W2jmdv51b2EQJ8HmA==
-----END CERTIFICATE-----`;

const DIGICERT_GLOBAL_ROOT_G2_CERT = `-----BEGIN CERTIFICATE-----
MIIDjjCCAnagAwIBAgIQAzrx5qcRqaC7KGSxHQn65TANBgkqhkiG9w0BAQsFADBh
MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3
d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBH
MjAeFw0xMzA4MDExMjAwMDBaFw0zODAxMTUxMjAwMDBaMGExCzAJBgNVBAYTAlVT
MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j
b20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IEcyMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuzfNNNx7a8myaJCtSnX/RrohCgiN9RlUyfuI
2/Ou8jqJkTx65qsGGmvPrC3oXgkkRLpimn7Wo6h+4FR1IAWsULecYxpsMNzaHxmx
1x7e/dfgy5SDN67sH0NO3Xss0r0upS/kqbitOtSZpLYl6ZtrAGCSYP9PIUkY92eQ
q2EGnI/yuum06ZIya7XzV+hdG82MHauVBJVJ8zUtluNJbd134/tJS7SsVQepj5Wz
tCO7TG1F8PapspUwtP1MVYwnSlcUfIKdzXOS0xZKBgyMUNGPHgm+F6HmIcr9g+UQ
vIOlCsRnKPZzFBQ9RnbDhxSJITRNrw9FDKZJobq7nMWxM4MphQIDAQABo0IwQDAP
BgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBhjAdBgNVHQ4EFgQUTiJUIBiV
5uNu5g/6+rkS7QYXjzkwDQYJKoZIhvcNAQELBQADggEBAGBnKJRvDkhj6zHd6mcY
1Yl9PMWLSn/pvtsrF9+wX3N3KjITOYFnQoQj8kVnNeyIv/iPsGEMNKSuIEyExtv4
NeF22d+mQrvHRAiGfzZ0JFrabA0UWTW98kndth/Jsw1HKj2ZL7tcu7XUIOGZX1NG
Fdtom/DzMNU+MeKNhJ7jitralj41E6Vf8PlwUHBHQRFXGU7Aj64GxJUTFy8bJZ91
8rGOmaFvE7FBcf6IKshPECBV1/MUReXgRPTqh5Uykw7+U0b6LJ3/iyK5S9kJRaTe
pLiaWN0bfVKfjllDiIGknibVb63dDcY3fe0Dkhvld1927jyNxF1WW6LZZm6zNTfl
MrY=
-----END CERTIFICATE-----`;

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

let insecureHttpClient: Deno.HttpClient | null = null;

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

function isTlsIssuerError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err || "");
  const normalized = msg.toLowerCase();
  return normalized.includes("unknownissuer") ||
    normalized.includes("invalid peer certificate") ||
    normalized.includes("certificate") && normalized.includes("issuer");
}

function resolveRedirectUrl(location: string, currentUrl: string): string {
  try {
    return new URL(location, currentUrl).toString();
  } catch {
    return location;
  }
}

function resolveCaptchaUrl(captchaPathOrUrl: string): string {
  try {
    return new URL(captchaPathOrUrl, MOFA_URL).toString();
  } catch {
    if (captchaPathOrUrl.startsWith("http")) return captchaPathOrUrl;
    if (captchaPathOrUrl.startsWith("/")) return `https://${MOFA_HOST}${captchaPathOrUrl}`;
    return `https://${MOFA_HOST}/${captchaPathOrUrl.replace(/^\/+/, "")}`;
  }
}

function getInsecureHttpClient(): Deno.HttpClient {
  if (!insecureHttpClient) {
    insecureHttpClient = Deno.createHttpClient({
      caCerts: [
        DIGICERT_GLOBAL_G2_TLS_RSA_SHA256_2020_CA1_CERT,
        DIGICERT_GLOBAL_ROOT_G2_CERT,
      ],
      unsafelyIgnoreCertificateErrors: [MOFA_HOST],
      http2: true,
    });
  }
  return insecureHttpClient;
}

/**
 * Fallback for environments where node:https still enforces TLS chain checks.
 * Uses Deno HTTP client with host-specific cert bypass.
 */
async function httpsGetWithInsecureClient(
  url: string,
  headers: Record<string, string> = {}
): Promise<{ body: Buffer; headers: Record<string, string | string[]>; statusCode: number; rawHeaders: string[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      redirect: "manual",
      signal: controller.signal,
      client: getInsecureHttpClient(),
    } as RequestInit & { client: Deno.HttpClient });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        const redirectUrl = resolveRedirectUrl(location, url);
        return await httpsGetWithInsecureClient(redirectUrl, headers);
      }
    }

    const { Buffer: NodeBuffer } = await import("node:buffer");
    const body = NodeBuffer.from(await response.arrayBuffer());
    const normalizedHeaders: Record<string, string | string[]> = {};
    const rawHeaders: string[] = [];

    response.headers.forEach((value, key) => {
      rawHeaders.push(key, value);
      if (normalizedHeaders[key] === undefined) {
        normalizedHeaders[key] = value;
        return;
      }
      const existing = normalizedHeaders[key];
      normalizedHeaders[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value];
    });

    return {
      body,
      headers: normalizedHeaders,
      statusCode: response.status,
      rawHeaders,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Make an HTTPS GET request using node:https to bypass Deno's strict TLS verification.
 * Returns { body, headers, statusCode }.
 */
async function httpsGet(
  url: string,
  headers: Record<string, string> = {}
): Promise<{ body: Buffer; headers: Record<string, string | string[]>; statusCode: number; rawHeaders: string[] }> {
  try {
    const https = await import("node:https");
    const { URL } = await import("node:url");

    return await new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "GET",
        headers: {
          ...headers,
        },
        rejectUnauthorized: false, // Skip TLS verification for MOFA's cert
      };

      const req = https.request(options, (res: any) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", async () => {
          try {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              const redirectUrl = resolveRedirectUrl(String(res.headers.location), url);
              const redirected = await httpsGet(redirectUrl, headers);
              resolve(redirected);
              return;
            }
            const { Buffer: NodeBuffer } = await import("node:buffer");
            resolve({
              body: NodeBuffer.concat(chunks),
              headers: res.headers,
              statusCode: res.statusCode,
              rawHeaders: res.rawHeaders || [],
            });
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on("error", reject);
      req.setTimeout(30000, () => {
        req.destroy(new Error("Request timed out"));
      });
      req.end();
    });
  } catch (err) {
    if (isTlsIssuerError(err)) {
      console.warn("[visa-captcha] node:https TLS validation failed, retrying with Deno insecure client");
      return await httpsGetWithInsecureClient(url, headers);
    }
    throw err;
  }
}

/** Extract cookies from node:https response headers */
function extractCookiesFromHeaders(headers: Record<string, string | string[]>): string {
  const cookies: string[] = [];
  const setCookie = headers["set-cookie"];
  if (Array.isArray(setCookie)) {
    for (const sc of setCookie) {
      const nameValue = sc.split(";")[0]?.trim();
      if (nameValue) cookies.push(nameValue);
    }
  } else if (typeof setCookie === "string") {
    const nameValue = setCookie.split(";")[0]?.trim();
    if (nameValue) cookies.push(nameValue);
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
    console.log("[visa-captcha] Fetching MOFA search page...");
    const pageResult = await httpsGet(MOFA_URL, {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
    });

    if (pageResult.statusCode !== 200) {
      console.error(`[visa-captcha] MOFA page returned ${pageResult.statusCode}`);
      return new Response(
        JSON.stringify({ error: `MOFA website returned status ${pageResult.statusCode}. Please try again.` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cookies = extractCookiesFromHeaders(pageResult.headers);
    const html = pageResult.body.toString("utf-8");
    console.log(`[visa-captcha] Got HTML (${html.length} chars), cookies: ${cookies.substring(0, 100)}...`);

    // Step 2: Extract captcha image URL from HTML
    const captchaMatch = html.match(MOFA_CAPTCHA_RE);
    const fallbackPathMatch = html.match(/GetRandomCaptchaImage\/\d+/i);
    const captchaPath = captchaMatch?.[1] || fallbackPathMatch?.[0] || null;

    if (!captchaPath) {
      console.error("[visa-captcha] No captcha image found in MOFA HTML");
      // Log a snippet of HTML for debugging
      console.error("[visa-captcha] HTML snippet:", html.substring(0, 500));
      return new Response(
        JSON.stringify({
          error: "MOFA did not return a captcha image. Their site may be temporarily unavailable. Please try again in a moment.",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const captchaUrl = resolveCaptchaUrl(captchaPath);
    console.log(`[visa-captcha] Captcha URL: ${captchaUrl}`);

    // Step 3: Fetch the captcha image using the same cookies (session-bound)
    const captchaResult = await httpsGet(captchaUrl, {
      "User-Agent": UA,
      "Cookie": cookies,
      "Referer": MOFA_URL,
      "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
    });

    if (captchaResult.statusCode !== 200) {
      console.error(`[visa-captcha] Captcha image fetch failed: ${captchaResult.statusCode}`);
      return new Response(
        JSON.stringify({ error: "Failed to load captcha image from MOFA. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Merge any additional cookies from captcha response
    const captchaCookies = extractCookiesFromHeaders(captchaResult.headers);
    const allCookies = captchaCookies
      ? `${cookies}; ${captchaCookies}`
      : cookies;

    // Convert captcha image buffer to base64
    const captchaBase64 = captchaResult.body.toString("base64");

    if (!captchaBase64 || captchaBase64.length < 40) {
      return new Response(
        JSON.stringify({ error: "Captcha image was empty. Please retry." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[visa-captcha] Captcha image fetched successfully (${captchaBase64.length} base64 chars)`);

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
    console.error("[visa-captcha] error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: msg.includes("abort") || msg.includes("timeout")
          ? "Request to MOFA timed out. Please try again."
          : `Failed to load captcha: ${msg}`,
      }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
