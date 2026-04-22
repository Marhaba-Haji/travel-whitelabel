import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, X, Search, ChevronLeft, ChevronRight, Rss, Eye, TrendingUp, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { breadcrumbSchema, SITE_URL } from "@/lib/seo-schemas";
import { getSessionId } from "@/hooks/useSessionTracking";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  meta_keywords: string[] | null;
  category: string | null;
  tags: string[] | null;
  views_count?: number;
  post_type?: string;
  cluster_id?: string | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const activeCategory = searchParams.get("category") || "";
  const activeTag = searchParams.get("tag") || "";
  const activeSearch = searchParams.get("q") || "";
  const activeSort = searchParams.get("sort") || "latest";

  useEffect(() => {
    // Add RSS link
    let rssLink = document.querySelector('link[type="application/rss+xml"]');
    if (!rssLink) {
      rssLink = document.createElement("link");
      rssLink.setAttribute("rel", "alternate");
      rssLink.setAttribute("type", "application/rss+xml");
      rssLink.setAttribute("title", "Marhaba DMC Blog RSS");
      rssLink.setAttribute("href", `${(import.meta.env.VITE_SUPABASE_URL || "https://kofijegdzeshitunwddn.supabase.co")}/functions/v1/blog-rss`);
      document.head.appendChild(rssLink);
    }

    const fetchData = async () => {
      const [postsRes, catsRes] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image_url, author_name, reading_time_minutes, published_at, meta_keywords, category, tags, views_count")
          .eq("status", "published")
          .order("published_at", { ascending: false }),
        supabase.from("blog_categories").select("id, name, slug").order("name"),
      ]);
      setPosts((postsRes.data as unknown as BlogPost[]) || []);
      setCategories((catsRes.data as unknown as BlogCategory[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    const filtered = posts.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeTag && !(p.tags || []).includes(activeTag)) return false;
      if (activeSearch) {
        const q = activeSearch.toLowerCase();
        const titleMatch = p.title.toLowerCase().includes(q);
        const excerptMatch = p.excerpt?.toLowerCase().includes(q);
        const tagMatch = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !excerptMatch && !tagMatch) return false;
      }
      return true;
    });

    if (activeSort === "popular") {
      return [...filtered].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    }
    return filtered;
  }, [posts, activeCategory, activeTag, activeSearch, activeSort]);

  // Log search queries for content-gap analysis (debounced via useEffect)
  useEffect(() => {
    if (!activeSearch || posts.length === 0) return;
    const t = setTimeout(() => {
      supabase.from("search_queries").insert([{
        query: activeSearch,
        results_count: filteredPosts.length,
        page_path: "/blog",
        session_id: getSessionId(),
        source: "blog_search",
      }] as any).then(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [activeSearch, filteredPosts.length, posts.length]);

  const POSTS_PER_PAGE = 9;
  const activePage = parseInt(searchParams.get("page") || "1", 10);
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (activePage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, activePage]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when changing filters
    if (key !== "page") params.delete("page");
    setSearchParams(params, { replace: true });
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    setSearchParams(params, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const hasFilters = activeCategory || activeTag || activeSearch;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("q", searchQuery.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Blog — Halal Travel Insights & Industry Trends"
        description="Expert insights on halal-friendly travel, destination guides, travel technology, and hospitality trends from Marhaba DMC."
        path="/blog"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
        ])}
      />
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              <BookOpen className="h-3 w-3 mr-1" /> Our Blog
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Insights & Inspiration
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Expert articles on halal travel, destination guides, travel technology, and hospitality industry trends.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href={`${(import.meta.env.VITE_SUPABASE_URL || "https://kofijegdzeshitunwddn.supabase.co")}/functions/v1/blog-rss`} target="_blank" rel="noreferrer">
                <Rss className="h-4 w-4 mr-1" /> RSS Feed
              </a>
            </Button>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles…"
                className="pl-10 pr-20"
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8">
                Search
              </Button>
            </form>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground mr-1"><ArrowUpDown className="h-3 w-3 inline mr-1" />Sort:</span>
              <Badge
                variant={activeSort === "latest" ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setFilter("sort", "")}
              >
                Latest
              </Badge>
              <Badge
                variant={activeSort === "popular" ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setFilter("sort", "popular")}
              >
                <TrendingUp className="h-3 w-3 mr-1" /> Most Popular
              </Badge>
            </div>
          </div>

          {/* Filters */}
          {categories.length > 0 && (
            <div className="mb-8 space-y-4">
              {/* Categories */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-1">Categories:</span>
                <Badge
                  variant={!activeCategory ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilter("category", "")}
                >
                  All
                </Badge>
                {categories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={activeCategory === cat.slug ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilter("category", activeCategory === cat.slug ? "" : cat.slug)}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>

              {/* Active filter indicator */}
              {hasFilters && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredPosts.length} of {posts.length} posts
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
                    <X className="h-3 w-3 mr-1" /> Clear filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {hasFilters ? "No posts match the selected filters." : "No blog posts published yet. Check back soon!"}
              </p>
              {hasFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                    <Card className="overflow-hidden h-full hover:border-primary/30 transition-all duration-300 hover:shadow-lg relative">
                      {post.post_type === "pillar" && (
                        <Badge variant="default" className="absolute top-3 right-3 z-10 text-xs">📌 Pillar</Badge>
                      )}
                      {post.cover_image_url ? (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <CardContent className="p-5 space-y-3">
                        {post.category && (
                          <Badge variant="secondary" className="text-xs">
                            {categories.find((c) => c.slug === post.category)?.name || post.category}
                          </Badge>
                        )}
                        <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                        )}
                        {(post.tags?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags!.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                          <div className="flex items-center gap-3">
                            <span>{post.author_name || "Marhaba DMC"}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {post.reading_time_minutes || 1} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {(post.views_count || 0).toLocaleString()}
                            </span>
                          </div>
                          <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={activePage <= 1}
                    onClick={() => goToPage(activePage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === activePage ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="min-w-[36px]"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={activePage >= totalPages}
                    onClick={() => goToPage(activePage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
