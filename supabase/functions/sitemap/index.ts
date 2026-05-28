import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://marhabadmc.com";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  { path: "/signup", priority: "0.7", changefreq: "monthly" },
  { path: "/categories-destinations", priority: "0.7", changefreq: "weekly" },
  { path: "/umrah-visa-check", priority: "0.7", changefreq: "monthly" },
  { path: "/masterclass", priority: "0.9", changefreq: "weekly" },
  { path: "/login", priority: "0.4", changefreq: "yearly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
  { path: "/refund-policy", priority: "0.3", changefreq: "yearly" },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getPriority(postType: string): string {
  switch (postType) {
    case "pillar": return "0.9";
    case "supporting": return "0.4";
    default: return "0.6";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at, post_type, cover_image_url, title")
      .eq("status", "published")
      .order("updated_at", { ascending: false });

    const now = new Date().toISOString().split("T")[0];

    const staticEntries = STATIC_PAGES.map((p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${p.path}" />
    <xhtml:link rel="alternate" hreflang="en-IN" href="${SITE_URL}${p.path}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${p.path}" />
  </url>`).join("\n");

    const blogEntries = (posts || []).map((post: any) => {
      const lastmod = post.updated_at ? post.updated_at.split("T")[0] : now;
      const priority = getPriority(post.post_type || "standard");
      const imageTag = post.cover_image_url
        ? `\n    <image:image>\n      <image:loc>${escapeXml(post.cover_image_url)}</image:loc>\n      <image:title>${escapeXml(post.title)}</image:title>\n    </image:image>`
        : "";
      return `  <url>
    <loc>${SITE_URL}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${imageTag}
  </url>`;
    }).join("\n");

    // Google News sitemap entries for posts published in last 48 hours
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const recentPosts = (posts || []).filter((post: any) => 
      post.published_at && post.published_at > twoDaysAgo
    );
    
    const newsEntries = recentPosts.map((post: any) => `  <url>
    <loc>${SITE_URL}/blog/${escapeXml(post.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Marhaba DMC</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${post.published_at}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`).join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticEntries}
${blogEntries}
${newsEntries}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    console.error("Sitemap error:", e);
    return new Response("Internal Server Error", { status: 500 });
  }
});
