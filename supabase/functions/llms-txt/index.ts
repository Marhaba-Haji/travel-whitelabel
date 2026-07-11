import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://marhabadmc.com";
const SITE_NAME = "Marhaba DMC";

const STATIC_PAGES = [
  { path: "/", title: "Home", desc: "White-label travel portal, AI sales assistant, and Halal travel inventory for agents." },
  { path: "/about", title: "About", desc: "Who we are, our philosophy, global presence, and partnerships." },
  { path: "/categories-destinations", title: "Categories & Destinations", desc: "Browse travel categories and supported destinations." },
  { path: "/umrah-visa-check", title: "Umrah Visa Check", desc: "Check your Saudi Umrah visa status using your passport." },
  { path: "/blog", title: "Blog", desc: "Halal travel insights, B2B travel industry trends, and how-to guides." },
  { path: "/signup", title: "Get Started", desc: "Start your travel business with a white-label portal in 24 hours." },
];

const KEY_FACTS = `
## About Marhaba DMC

Marhaba DMC (legal name: marhabaDMC) is a B2B white-label travel-tech platform headquartered in Bangalore, India.
It enables travel agents and entrepreneurs to launch their own branded online travel agency in under 24 hours,
with full access to Flight, Hotel (1M+ properties), Visa (50+ countries), and Activities APIs.

## Subscription Plans

- Launch — INR 24,999/year — Entry tier with white-label portal and core APIs
- Growth — INR 29,999/year — Most popular: includes AI Sales Assistant, supplier portal, B2B/B2C portals
- Authority — INR 34,999/year — Full enterprise feature set, dedicated account manager

All plans are billed annually. No per-user fees. Unlimited agents and customers.

## Key Differentiators

- Halal-friendly inventory and Hajj/Umrah module specialisation
- AI Sales Assistant: multilingual chat agent, billed per conversation
- Built-in voice-driven AI itinerary builder
- Integrated Visa lookup and OCR for Saudi Umrah visas
- Live MOFA scraping for visa status verification
- Indian payment gateways: Razorpay, PayU, CCAvenue

## Contact

- Email: hello@marhabadmc.com
- Phone: +91-9008447887
- Address: Paramount Avenue, 63/1, 3rd floor, Mosque Road Cross, Frazer Town, Bangalore 560005, India
`.trim();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const full = url.searchParams.get("full") === "1" || url.pathname.endsWith("llms-full.txt");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("title, slug, excerpt, ai_summary, published_at, category, content")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(full ? 200 : 100);

    const lines: string[] = [];
    lines.push(`# ${SITE_NAME}`);
    lines.push("");
    lines.push(
      `> ${SITE_NAME} is a B2B white-label travel platform that lets agents and entrepreneurs launch a branded online travel agency in 24 hours, with built-in Flight, Hotel, Visa and Activities APIs and an AI sales assistant.`,
    );
    lines.push("");
    lines.push(KEY_FACTS);
    lines.push("");
    lines.push("## Core Pages");
    for (const p of STATIC_PAGES) {
      lines.push(`- [${p.title}](${SITE_URL}${p.path}): ${p.desc}`);
    }
    lines.push("");
    lines.push("## Blog");
    for (const post of posts || []) {
      const summary = (post as any).ai_summary || (post as any).excerpt || "";
      lines.push(`- [${(post as any).title}](${SITE_URL}/blog/${(post as any).slug}): ${summary}`.trim());
    }

    if (full) {
      lines.push("");
      lines.push("## Full Blog Content");
      for (const post of posts || []) {
        const p = post as any;
        lines.push("");
        lines.push(`### ${p.title}`);
        lines.push(`URL: ${SITE_URL}/blog/${p.slug}`);
        if (p.published_at) lines.push(`Published: ${p.published_at}`);
        if (p.category) lines.push(`Category: ${p.category}`);
        lines.push("");
        // Strip markdown images & frontmatter, keep plain text reasonable
        const body = String(p.content || "")
          .replace(/!\[[^\]]*\]\([^\)]*\)/g, "")
          .replace(/```[\s\S]*?```/g, "")
          .trim();
        lines.push(body.slice(0, 5000));
      }
    }

    return new Response(lines.join("\n"), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("llms-txt error:", e);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
});