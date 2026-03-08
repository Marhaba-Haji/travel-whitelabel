import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://marhabadmc.com";
const SITE_TITLE = "Marhaba DMC Blog";
const SITE_DESCRIPTION = "Expert insights on halal-friendly travel, destination guides, travel technology, and hospitality trends from Marhaba DMC.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("title, slug, excerpt, meta_description, author_name, published_at, category, tags")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);

    const items = (posts || []).map((post: any) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString();
      const description = post.meta_description || post.excerpt || "";
      const categories = [
        ...(post.category ? [post.category] : []),
        ...(post.tags || []),
      ];
      const categoryTags = categories.map((c: string) => `      <category>${escapeXml(c)}</category>`).join("\n");

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(description)}</description>
      <author>${escapeXml(post.author_name || "Marhaba DMC")}</author>
      <pubDate>${pubDate}</pubDate>
${categoryTags}
    </item>`;
    }).join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/functions/v1/blog-rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("RSS error:", e);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
});
