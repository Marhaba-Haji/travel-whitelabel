import { GoogleGenAI } from "npm:@google/genai@1.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limiter: IP → request timestamps within the window.
// Each request mints one single-use ephemeral token (one Live session),
// so a handful per window is enough for legitimate reconnects.
const rateLimitMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 5 * 60 * 1000;
const MAX_TOKENS_PER_WINDOW = 6;

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, stamps] of rateLimitMap) {
    const recent = stamps.filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, recent);
  }
}, 5 * 60 * 1000);

function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit check
    const clientIP = getClientIP(req);
    const now = Date.now();
    const stamps = (rateLimitMap.get(clientIP) || []).filter((t) => now - t < RATE_WINDOW_MS);

    if (stamps.length >= MAX_TOKENS_PER_WINDOW) {
      const retryAfter = Math.ceil((RATE_WINDOW_MS - (now - stamps[0])) / 1000);
      return new Response(
        JSON.stringify({ error: "Rate limited. Please try again later.", retryAfter }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(retryAfter) } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mint a single-use ephemeral token so the real API key never leaves the
    // server. The token can start one Live session within the next 2 minutes
    // and the session may run for up to 30 minutes.
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY, httpOptions: { apiVersion: "v1alpha" } });
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 2 * 60 * 1000).toISOString(),
        httpOptions: { apiVersion: "v1alpha" },
      },
    });

    if (!token?.name) {
      throw new Error("Ephemeral token creation returned no token name");
    }

    // Record successful request
    stamps.push(now);
    rateLimitMap.set(clientIP, stamps);

    // Field kept as `apiKey` for client compatibility; the value is the
    // ephemeral token name, usable only for Live connections.
    return new Response(
      JSON.stringify({ apiKey: token.name }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("gemini-token error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to provide access token" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
