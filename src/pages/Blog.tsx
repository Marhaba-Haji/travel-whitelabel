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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

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
      <main className="pt-24 pb-20 bg-white">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-600 font-bold tracking-wide text-xs px-4 py-1.5 rounded-full mb-4 uppercase">
              <BookOpen className="h-3 w-3" /> Our Blog
            </span>
            <h1 className="font-poppins text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Insights & <span className="text-[#B968C7]">Inspiration</span>
            </h1>
            <p className="text-lg text-gray-500 mb-6">
              Expert articles on halal travel, destination guides, travel technology, and hospitality industry trends.
            </p>
            <Button variant="outline" size="sm" asChild className="rounded-full border-gray-200 hover:border-[#412A86]/40 hover:text-[#412A86]">
              <a href={`${(import.meta.env.VITE_SUPABASE_URL || "https://kofijegdzeshitunwddn.supabase.co")}/functions/v1/blog-rss`} target="_blank" rel="noreferrer">
                <Rss className="h-4 w-4 mr-1" /> RSS Feed
              </a>
            </Button>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles…"
                className="pl-11 pr-24 h-12 rounded-full bg-white border-gray-200 shadow-soft focus-visible:ring-[#412A86]/30 focus-visible:border-[#412A86]"
              />
              <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 rounded-full bg-[#412A86] hover:bg-[#412A86]/90 text-white px-4">
                Search
              </Button>
            </form>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-xs text-gray-500 mr-1"><ArrowUpDown className="h-3 w-3 inline mr-1" />Sort:</span>
              <button
                type="button"
                onClick={() => setFilter("sort", "")}
                className={`cursor-pointer text-xs font-bold px-3 py-1 rounded-full transition-colors ${activeSort === "latest" ? "bg-[#412A86] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#412A86]/40"}`}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => setFilter("sort", "popular")}
                className={`cursor-pointer text-xs font-bold px-3 py-1 rounded-full inline-flex items-center transition-colors ${activeSort === "popular" ? "bg-[#412A86] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#412A86]/40"}`}
              >
                <TrendingUp className="h-3 w-3 mr-1" /> Most Popular
              </button>
            </div>
          </div>

          {/* Filters */}
          {categories.length > 0 && (
            <div className="mb-8 space-y-4">
              {/* Categories */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-500 mr-1">Categories:</span>
                <button
                  type="button"
                  onClick={() => setFilter("category", "")}
                  className={`cursor-pointer text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${!activeCategory ? "bg-[#412A86] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#412A86]/40"}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setFilter("category", activeCategory === cat.slug ? "" : cat.slug)}
                    className={`cursor-pointer text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${activeCategory === cat.slug ? "bg-[#412A86] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#412A86]/40"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Active filter indicator */}
              {hasFilters && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Showing {filteredPosts.length} of {posts.length} posts
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs rounded-full">
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
                <div key={i} className="rounded-3xl bg-white border border-gray-100 shadow-soft overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {hasFilters ? "No posts match the selected filters." : "No blog posts published yet. Check back soon!"}
              </p>
              {hasFilters && (
                <Button variant="outline" className="mt-4 rounded-full" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
                    <article className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-soft transition-all duration-300 motion-safe:group-hover:-translate-y-1 group-hover:shadow-soft-lg h-full relative">
                      {post.post_type === "pillar" && (
                        <span className="absolute top-3 right-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#412A86] text-white">Pillar</span>
                      )}
                      {post.cover_image_url ? (
                        <div className="aspect-[16/10] overflow-hidden bg-gray-50">
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-[#FAFAFC] flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      <div className="p-6 space-y-3">
                        {post.category && (
                          <span className="inline-block text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-purple-50 text-purple-600">
                            {categories.find((c) => c.slug === post.category)?.name || post.category}
                          </span>
                        )}
                        <h2 className="font-poppins text-lg font-bold text-gray-900 group-hover:text-[#412A86] transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                        )}
                        {(post.tags?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags!.slice(0, 3).map((tag) => (
                              <span key={tag} className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
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
                      </div>
                    </article>
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
                    className="rounded-full border-gray-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === activePage ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className={`min-w-[36px] rounded-full ${page === activePage ? "bg-[#412A86] hover:bg-[#412A86]/90 text-white" : "border-gray-200"}`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={activePage >= totalPages}
                    onClick={() => goToPage(activePage + 1)}
                    className="rounded-full border-gray-200"
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
