import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, User, Calendar, Share2, Check, BookOpen } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_image_url: string | null;
  author_name: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  category: string | null;
  tags: string[] | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  category: string | null;
  tags: string[] | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      const postData = data as unknown as BlogPostData | null;
      setPost(postData);
      setLoading(false);

      // Fetch related posts
      if (postData) {
        const { data: allPublished } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image_url, reading_time_minutes, published_at, category, tags")
          .eq("status", "published")
          .neq("id", postData.id)
          .order("published_at", { ascending: false })
          .limit(20);

        if (allPublished) {
          const candidates = allPublished as unknown as RelatedPost[];
          // Score by shared category + shared tags
          const scored = candidates.map((c) => {
            let score = 0;
            if (postData.category && c.category === postData.category) score += 3;
            const postTags = postData.tags || [];
            const cTags = c.tags || [];
            postTags.forEach((t) => { if (cTags.includes(t)) score += 1; });
            return { ...c, score };
          });
          scored.sort((a, b) => b.score - a.score);
          setRelatedPosts(scored.filter((s) => s.score > 0).slice(0, 3));
        }
      }
    };
    fetchPost();
  }, [slug]);

  // SEO meta injection
  useEffect(() => {
    if (!post) return;
    document.title = post.meta_title || `${post.title} | Marhaba DMC Blog`;

    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    if (post.meta_description) setMeta("description", post.meta_description);
    if (post.meta_keywords?.length) setMeta("keywords", post.meta_keywords.join(", "));
    setMeta("og:title", post.meta_title || post.title, true);
    if (post.meta_description) setMeta("og:description", post.meta_description, true);
    setMeta("og:type", "article", true);
    setMeta("og:url", window.location.href, true);
    if (post.og_image_url || post.cover_image_url) setMeta("og:image", post.og_image_url || post.cover_image_url!, true);

    // JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.meta_description || post.excerpt || "",
      image: post.og_image_url || post.cover_image_url || "",
      author: { "@type": "Organization", name: post.author_name || "Marhaba DMC" },
      publisher: { "@type": "Organization", name: "Marhaba DMC", url: "https://marhabadmc.lovable.app" },
      datePublished: post.published_at,
      url: window.location.href,
      wordCount: post.content.split(/\s+/).length,
      timeRequired: `PT${post.reading_time_minutes || 1}M`,
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [post]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: "Link copied!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-20 container mx-auto px-4 max-w-3xl animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-64 bg-muted rounded" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-20 container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">This blog post doesn't exist or has been removed.</p>
          <Button asChild><Link to="/blog"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
          </div>

          {/* Header */}
          <header className="mb-8">
            {post.category && (
              <Link to={`/blog?category=${post.category}`}>
                <Badge variant="secondary" className="mb-3">{post.category}</Badge>
              </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author_name || "Marhaba DMC"}</span>
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.reading_time_minutes || 1} min read</span>
              <Button variant="ghost" size="sm" onClick={share} className="ml-auto">
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
                {copied ? "Copied" : "Share"}
              </Button>
            </div>
          </header>

          {/* Cover */}
          {post.cover_image_url && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img src={post.cover_image_url} alt={post.title} className="w-full h-auto max-h-96 object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Tags & Keywords */}
          {((post.tags?.length ?? 0) > 0 || (post.meta_keywords?.length ?? 0) > 0) && (
            <div className="mt-10 pt-6 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {post.tags?.map((tag) => (
                  <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`}>
                    <Badge variant="secondary">{tag}</Badge>
                  </Link>
                ))}
                {post.meta_keywords?.filter((kw) => !(post.tags || []).includes(kw)).map((kw) => (
                  <Badge key={kw} variant="outline">{kw}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rp) => (
                  <Link key={rp.id} to={`/blog/${rp.slug}`} className="group">
                    <Card className="overflow-hidden h-full hover:border-primary/30 transition-all duration-300">
                      {rp.cover_image_url ? (
                        <div className="h-36 overflow-hidden">
                          <img src={rp.cover_image_url} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        </div>
                      ) : (
                        <div className="h-36 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">{rp.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3" /> {rp.reading_time_minutes || 1} min
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back CTA */}
          <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link to="/blog"><ArrowLeft className="h-4 w-4 mr-2" /> More Articles</Link>
            </Button>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default BlogPost;
