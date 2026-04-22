import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://marhabadmc.com";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]!));
}

function mdToBasicHtml(md: string): string {
  let h = md;
  // strip code fences (preserve as <pre>)
  h = h.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeHtml(code)}</code></pre>`);
  h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  h = h.replace(/^###### (.*)$/gm, "<h6>$1</h6>");
  h = h.replace(/^##### (.*)$/gm, "<h5>$1</h5>");
  h = h.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
  h = h.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  h = h.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  h = h.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // paragraphs
  return h.split(/\n{2,}/).map((b) => /^<(h\d|pre|ul|ol|img|p|blockquote)/i.test(b.trim()) ? b : `<p>${b.trim()}</p>`).join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    if (!slug) {
      return new Response("Missing ?slug=", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: post } = await supabase
      .from("blog_posts")
      .select("title, slug, excerpt, content, cover_image_url, author_name, published_at, updated_at, meta_title, meta_description, category, tags")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!post) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    const p = post as any;
    const canonical = `${SITE_URL}/blog/${p.slug}`;
    const title = escapeHtml(p.meta_title || p.title);
    const desc = escapeHtml(p.meta_description || p.excerpt || "");
    const image = p.cover_image_url || `${SITE_URL}/og-default.jpg`;
    const article = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: p.title,
      image,
      datePublished: p.published_at,
      dateModified: p.updated_at || p.published_at,
      author: { "@type": "Organization", name: p.author_name || "Marhaba DMC" },
      publisher: { "@type": "Organization", name: "Marhaba DMC", logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/marhaba-dmc-logo.png` } },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      description: p.excerpt || "",
    };

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<script type="application/ld+json">${JSON.stringify(article)}</script>
</head>
<body>
<article>
<h1>${escapeHtml(p.title)}</h1>
${p.cover_image_url ? `<img src="${escapeHtml(p.cover_image_url)}" alt="${escapeHtml(p.title)}" />` : ""}
<p><em>By ${escapeHtml(p.author_name || "Marhaba DMC")} · ${p.published_at ? new Date(p.published_at).toDateString() : ""}</em></p>
${mdToBasicHtml(p.content || "")}
<hr />
<p>Read this article on the live site: <a href="${canonical}">${canonical}</a></p>
</article>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=900, s-maxage=3600",
        "X-Robots-Tag": "index, follow",
      },
    });
  } catch (e) {
    console.error("blog-prerender error", e);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
});