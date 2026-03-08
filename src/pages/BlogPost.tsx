import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, User, Calendar, Share2, Check, BookOpen, List, Mail, Loader2, Sun, Moon, Eye } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ReactMarkdown from "react-markdown";
import BlurImage from "@/components/BlurImage";
import { useToast } from "@/hooks/use-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

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
  views_count?: number;
  cluster_id?: string | null;
  post_type?: string;
  pillar_post_id?: string | null;
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

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

// Extract FAQ items from markdown content for structured data
function extractFAQs(content: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  // Look for ## Frequently Asked Questions section, then ### questions
  const faqSectionMatch = content.match(/##\s*Frequently Asked Questions\s*\n([\s\S]*?)(?=\n## [^#]|$)/i);
  if (!faqSectionMatch) return faqs;

  const faqSection = faqSectionMatch[1];
  const questionRegex = /###\s*(.+?)\??\s*\n([\s\S]*?)(?=\n### |$)/g;
  let match;
  while ((match = questionRegex.exec(faqSection)) !== null) {
    const question = match[1].trim().replace(/\?$/, "") + "?";
    const answer = match[2].trim();
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }
  return faqs;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [activeTocId, setActiveTocId] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [codeDark, setCodeDark] = useState(true);
  const articleRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  // Extract TOC from markdown content
  const toc = useMemo<TocItem[]>(() => {
    if (!post?.content) return [];
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;
    while ((match = headingRegex.exec(post.content)) !== null) {
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      items.push({ id, text, level: match[1].length });
    }
    return items;
  }, [post?.content]);

  // Extract FAQs for schema
  const faqs = useMemo(() => {
    if (!post?.content) return [];
    return extractFAQs(post.content);
  }, [post?.content]);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const article = articleRef.current;
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const scrolled = window.scrollY - articleTop;
      const viewportHeight = window.innerHeight;
      const progress = Math.min(100, Math.max(0, (scrolled / (articleHeight - viewportHeight)) * 100));
      setReadProgress(progress);

      // Active TOC heading
      if (toc.length > 0) {
        const headings = toc.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
        let current = "";
        for (const h of headings) {
          if (h.getBoundingClientRect().top <= 100) current = h.id;
        }
        setActiveTocId(current);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [toc]);

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

      if (postData) {
        // Increment view count
        supabase.rpc("increment_blog_views", { _slug: slug }).then();

        const { data: allPublished } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image_url, reading_time_minutes, published_at, category, tags")
          .eq("status", "published")
          .neq("id", postData.id)
          .order("published_at", { ascending: false })
          .limit(20);

        if (allPublished) {
          const candidates = allPublished as unknown as RelatedPost[];
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

  // SEO meta + structured data injection
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
    // Additional article meta
    if (post.category) setMeta("article:section", post.category, true);
    if (post.tags?.length) post.tags.forEach((tag) => setMeta("article:tag", tag, true));
    if (post.published_at) setMeta("article:published_time", post.published_at, true);

    const scripts: HTMLScriptElement[] = [];

    // 1. Article + speakable JSON-LD
    const articleSchema: any = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.meta_description || post.excerpt || "",
      image: post.og_image_url || post.cover_image_url || "",
      author: { "@type": "Organization", name: post.author_name || "Marhaba DMC", url: "https://marhabadmc.com" },
      publisher: {
        "@type": "Organization",
        name: "Marhaba DMC",
        url: "https://marhabadmc.com",
        logo: { "@type": "ImageObject", url: "https://marhabadmc.com/assets/marhaba-dmc-logo.png" },
      },
      datePublished: post.published_at,
      dateModified: post.published_at,
      url: window.location.href,
      mainEntityOfPage: { "@type": "WebPage", "@id": window.location.href },
      wordCount: post.content.split(/\s+/).length,
      timeRequired: `PT${post.reading_time_minutes || 1}M`,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["article h1", "article .prose p:first-of-type"],
      },
      keywords: post.meta_keywords?.join(", ") || "",
    };
    if (post.category) {
      articleSchema.articleSection = post.category;
    }

    const articleScript = document.createElement("script");
    articleScript.type = "application/ld+json";
    articleScript.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(articleScript);
    scripts.push(articleScript);

    // 2. BreadcrumbList JSON-LD
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://marhabadmc.lovable.app" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://marhabadmc.lovable.app/blog" },
        ...(post.category ? [{
          "@type": "ListItem",
          position: 3,
          name: post.category,
          item: `https://marhabadmc.lovable.app/blog?category=${post.category}`,
        }] : []),
        {
          "@type": "ListItem",
          position: post.category ? 4 : 3,
          name: post.title,
          item: window.location.href,
        },
      ],
    };
    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);
    scripts.push(breadcrumbScript);

    // 3. FAQPage JSON-LD (if FAQ section exists)
    const faqItems = extractFAQs(post.content);
    if (faqItems.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      };
      const faqScript = document.createElement("script");
      faqScript.type = "application/ld+json";
      faqScript.textContent = JSON.stringify(faqSchema);
      document.head.appendChild(faqScript);
      scripts.push(faqScript);
    }

    return () => {
      scripts.forEach((s) => {
        try { document.head.removeChild(s); } catch {}
      });
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

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTocOpen(false);
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
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-muted/30">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-[width] duration-150 ease-out"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <Header />
      <article className="pt-24 pb-20" ref={articleRef}>
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              {post.category && (
                <>
                  <li>/</li>
                  <li><Link to={`/blog?category=${post.category}`} className="hover:text-foreground transition-colors">{post.category}</Link></li>
                </>
              )}
              <li>/</li>
              <li className="text-foreground font-medium truncate max-w-[200px]">{post.title}</li>
            </ol>
          </nav>

          {/* Pillar/Supporting badge */}
          {post.post_type && post.post_type !== "standard" && (
            <Badge variant={post.post_type === "pillar" ? "default" : "secondary"} className="mb-3">
              {post.post_type === "pillar" ? "📌 Pillar Guide" : "📎 Deep Dive"}
            </Badge>
          )}

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
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {(post.views_count || 0).toLocaleString()} views</span>
              <div className="flex items-center gap-1 ml-auto">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors"
                  aria-label="Share on Twitter"
                >
                  <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors"
                  aria-label="Share on WhatsApp"
                >
                  <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <Button variant="ghost" size="sm" onClick={share}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </header>

          {/* Cover */}
          {post.cover_image_url && (
            <div className="mb-8 rounded-lg overflow-hidden">
              {(() => {
                const src = post.cover_image_url!;
                const isBlogImage = src.includes("/blog-images/");
                const base = src.replace(/-\d+w\.webp$/, "");
                const hasSizes = isBlogImage && base !== src;
                return (
                  <BlurImage
                    src={src}
                    alt={post.meta_description || post.title}
                    className="rounded-lg max-h-96"
                    loading="eager"
                    width={1200}
                    height={630}
                    sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, 720px"
                    {...(hasSizes ? { srcSet: `${base}-400w.webp 400w, ${base}-800w.webp 800w, ${base}-1200w.webp 1200w` } : {})}
                  />
                );
              })()}
            </div>
          )}

          {/* Table of Contents */}
          {toc.length > 2 && (
            <div className="mb-8 border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className="w-full flex items-center justify-between px-5 py-3 bg-card hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <List className="h-4 w-4" /> Table of Contents
                </span>
                <span className="text-xs text-muted-foreground">{tocOpen ? "Hide" : "Show"}</span>
              </button>
              {tocOpen && (
                <nav className="px-5 py-3 bg-card/50 border-t border-border">
                  <ul className="space-y-1">
                    {toc.map((item) => (
                      <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 16}px` }}>
                        <button
                          onClick={() => scrollToHeading(item.id)}
                          className={`text-sm py-1 text-left transition-colors hover:text-foreground w-full truncate ${
                            activeTocId === item.id ? "text-primary font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {item.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground">
            <ReactMarkdown
              components={{
                h2: ({ node, children, ...props }) => {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
                  return <h2 id={id} className="scroll-mt-24" {...props}>{children}</h2>;
                },
                h3: ({ node, children, ...props }) => {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
                  return <h3 id={id} className="scroll-mt-24" {...props}>{children}</h3>;
                },
                img: ({ node, ...props }) => {
                  const src = props.src || "";
                  const isBlogImage = src.includes("/blog-images/");
                  let srcSet: string | undefined;
                  if (isBlogImage) {
                    const base = src.replace(/-\d+w\.webp$/, "");
                    if (base !== src) {
                      srcSet = [
                        `${base}-400w.webp 400w`,
                        `${base}-800w.webp 800w`,
                        `${base}-1200w.webp 1200w`,
                      ].join(", ");
                    }
                  }
                  return (
                    <BlurImage
                      src={src}
                      alt={props.alt || "Blog image"}
                      loading="lazy"
                      className="rounded-lg my-6"
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, 720px"
                      {...(srcSet ? { srcSet } : {})}
                    />
                  );
                },
                pre: ({ children }) => {
                  return <div className="relative group not-prose">{children}</div>;
                },
                code: ({ node, className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground" {...props}>{children}</code>;
                  }
                  const codeStr = String(children).replace(/\n$/, "");
                  const lang = className?.replace("language-", "") || "";
                  return (
                    <div className="relative">
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => setCodeDark((d) => !d)}
                          className="bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded px-1.5 py-1 text-xs"
                          aria-label="Toggle code theme"
                        >
                          {codeDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(codeStr);
                            toast({ title: "Code copied!" });
                          }}
                          className="bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded px-2 py-1 text-xs"
                        >
                          Copy
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={codeDark ? oneDark : oneLight}
                        language={lang}
                        PreTag="div"
                        customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "0.875rem" }}
                      >
                        {codeStr}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
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

          {/* Newsletter */}
          <div className="mt-16 pt-8 border-t border-border">
            <Card className="bg-card border-border">
              <CardContent className="p-6 md:p-8 text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">Enjoyed this article?</h3>
                <p className="text-sm text-muted-foreground mb-4">Get the latest travel insights delivered to your inbox.</p>
                {newsletterDone ? (
                  <p className="text-sm text-primary font-medium flex items-center justify-center gap-1"><Check className="h-4 w-4" /> You're subscribed!</p>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newsletterEmail.trim()) return;
                      setNewsletterLoading(true);
                      const { error } = await supabase.from("newsletter_subscriptions").insert({ email: newsletterEmail.trim() });
                      setNewsletterLoading(false);
                      if (error) {
                        toast({ title: error.code === "23505" ? "Already subscribed!" : "Something went wrong", variant: error.code === "23505" ? "default" : "destructive" });
                        if (error.code === "23505") setNewsletterDone(true);
                      } else {
                        setNewsletterDone(true);
                        toast({ title: "Subscribed!" });
                      }
                    }}
                    className="flex gap-2 max-w-sm mx-auto"
                  >
                    <Input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={newsletterLoading} size="sm">
                      {newsletterLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

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
