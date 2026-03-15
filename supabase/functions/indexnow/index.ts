import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://marhabadmc.com";
const SITEMAP_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/sitemap`;

const STATIC_PAGES = [
  "/", "/about", "/blog", "/signup", "/categories-destinations",
  "/privacy-policy", "/terms-of-service", "/refund-policy",
];

function getSupabaseServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function logIndexing(supabase: any, url: string, service: string, action: string, statusCode?: number, response?: any, error?: string) {
  try {
    await supabase.from("indexing_logs").insert({
      url,
      service,
      action,
      status_code: statusCode ?? null,
      response: response ?? null,
      error: error ?? null,
    });
  } catch (e) {
    console.error("Failed to log indexing:", e);
  }
}

// Generate a JWT from a Google Service Account JSON key
async function getGoogleAccessToken(saKey: any): Promise<string> {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const claimSet = btoa(JSON.stringify({
    iss: saKey.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));

  const unsignedToken = `${header}.${claimSet}`;

  const pemContent = saKey.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const jwt = `${header}.${claimSet}.${sig}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const tokenBody = await tokenRes.json();
  return tokenBody.access_token;
}

// Ping search engines with sitemap URL
async function pingSitemap(supabase: any): Promise<Record<string, any>> {
  const pingResults: Record<string, any> = {};
  const targets = [
    { name: "google", url: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}` },
    { name: "bing", url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}` },
    { name: "yandex", url: `https://yandex.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}` },
  ];

  for (const target of targets) {
    try {
      const res = await fetch(target.url);
      pingResults[target.name] = { status: res.status, ok: res.ok };
      await logIndexing(supabase, SITEMAP_URL, `${target.name}_sitemap_ping`, "sitemap_ping", res.status, { ok: res.ok });
    } catch (e: any) {
      pingResults[target.name] = { error: e.message };
      await logIndexing(supabase, SITEMAP_URL, `${target.name}_sitemap_ping`, "sitemap_ping", undefined, undefined, e.message);
    }
  }
  return pingResults;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { urls, action = "updated" } = body;
    const supabase = getSupabaseServiceClient();

    // --- BULK MODE: fetch all published URLs and submit everything ---
    if (action === "bulk") {
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("status", "published");

      const allUrls = [
        ...STATIC_PAGES.map((p) => `${SITE_URL}${p}`),
        ...((posts || []).map((p: any) => `${SITE_URL}/blog/${p.slug}`)),
      ];

      // Submit all to IndexNow + Google + sitemap ping
      const results: any = { total_urls: allUrls.length, indexnow: null, google: null, sitemap_ping: null };

      // IndexNow (supports bulk array natively)
      const indexNowKey = Deno.env.get("INDEXNOW_KEY");
      if (indexNowKey) {
        try {
          const res = await fetch("https://api.indexnow.org/indexnow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              host: new URL(SITE_URL).host,
              key: indexNowKey,
              keyLocation: `${SITE_URL}/${indexNowKey}.txt`,
              urlList: allUrls,
            }),
          });
          results.indexnow = { status: res.status, ok: res.ok, url_count: allUrls.length };
          for (const url of allUrls) {
            await logIndexing(supabase, url, "indexnow", "bulk", res.status, { ok: res.ok });
          }
        } catch (e: any) {
          results.indexnow = { error: e.message };
        }
      }

      // Google Indexing API (one by one, rate limited)
      const googleSaKeyStr = Deno.env.get("GOOGLE_INDEXING_SA_KEY");
      if (googleSaKeyStr) {
        try {
          const saKey = JSON.parse(googleSaKeyStr);
          const accessToken = await getGoogleAccessToken(saKey);
          let submitted = 0;
          let errors = 0;
          for (const url of allUrls) {
            try {
              const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ url, type: "URL_UPDATED" }),
              });
              const respBody = await res.json();
              await logIndexing(supabase, url, "google", "bulk", res.status, respBody, res.ok ? undefined : JSON.stringify(respBody));
              if (res.ok) submitted++; else errors++;
            } catch {
              errors++;
            }
          }
          results.google = { submitted, errors, total: allUrls.length };
        } catch (e: any) {
          results.google = { error: e.message };
        }
      }

      // Sitemap ping
      results.sitemap_ping = await pingSitemap(supabase);

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- SITEMAP PING ONLY MODE ---
    if (action === "sitemap_ping") {
      const pingResults = await pingSitemap(supabase);
      return new Response(JSON.stringify({ success: true, results: { sitemap_ping: pingResults } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- STANDARD MODE: submit specific URLs ---
    if (!urls?.length) {
      return new Response(JSON.stringify({ error: "No URLs provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any = { indexnow: null, google: null, sitemap_ping: null };

    // --- IndexNow (Bing/Yandex) ---
    const indexNowKey = Deno.env.get("INDEXNOW_KEY");
    if (indexNowKey) {
      try {
        const res = await fetch("https://api.indexnow.org/indexnow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            host: new URL(SITE_URL).host,
            key: indexNowKey,
            keyLocation: `${SITE_URL}/${indexNowKey}.txt`,
            urlList: urls,
          }),
        });
        const resBody = await res.text();
        results.indexnow = { status: res.status, ok: res.ok };

        for (const url of urls) {
          await logIndexing(supabase, url, "indexnow", action, res.status, { ok: res.ok, body: resBody }, undefined);
        }
      } catch (e: any) {
        console.error("IndexNow error:", e);
        results.indexnow = { error: e.message };
        for (const url of urls) {
          await logIndexing(supabase, url, "indexnow", action, undefined, undefined, e.message);
        }
      }
    } else {
      results.indexnow = { skipped: "INDEXNOW_KEY not configured" };
    }

    // --- Google Indexing API ---
    const googleSaKeyStr = Deno.env.get("GOOGLE_INDEXING_SA_KEY");
    if (googleSaKeyStr) {
      try {
        const saKey = JSON.parse(googleSaKeyStr);
        const accessToken = await getGoogleAccessToken(saKey);
        const googleResults: any[] = [];

        for (const url of urls) {
          const type = action === "deleted" ? "URL_DELETED" : "URL_UPDATED";
          const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ url, type }),
          });
          const respBody = await res.json();
          googleResults.push({ url, status: res.status, response: respBody });
          await logIndexing(supabase, url, "google", action, res.status, respBody, res.ok ? undefined : JSON.stringify(respBody));
        }
        results.google = googleResults;
      } catch (e: any) {
        console.error("Google Indexing error:", e);
        results.google = { error: e.message };
        for (const url of urls) {
          await logIndexing(supabase, url, "google", action, undefined, undefined, e.message);
        }
      }
    } else {
      results.google = { skipped: "GOOGLE_INDEXING_SA_KEY not configured" };
    }

    // --- Always ping sitemap after URL submissions ---
    results.sitemap_ping = await pingSitemap(supabase);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("IndexNow function error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
