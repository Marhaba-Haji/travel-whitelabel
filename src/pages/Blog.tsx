import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, BookOpen } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

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
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Blog | Marhaba DMC — Halal Travel Insights & Industry Trends";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Explore expert insights on halal-friendly travel, destination guides, travel technology, and hospitality trends from Marhaba DMC.");

    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, author_name, reading_time_minutes, published_at, meta_keywords")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setPosts((data as unknown as BlogPost[]) || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              <BookOpen className="h-3 w-3 mr-1" /> Our Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Insights & Inspiration
            </h1>
            <p className="text-lg text-muted-foreground">
              Expert articles on halal travel, destination guides, travel technology, and hospitality industry trends.
            </p>
          </div>

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
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No blog posts published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                  <Card className="overflow-hidden h-full hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
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
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <div className="flex items-center gap-3">
                          <span>{post.author_name || "Marhaba DMC"}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {post.reading_time_minutes || 1} min
                          </span>
                        </div>
                        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
