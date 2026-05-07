import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock, MessageCircle, Heart, ArrowRight as ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface InspirationPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  og_image_url: string | null;
  author_name: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  category: string | null;
  views_count: number;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

const Inspiration = () => {
  const [posts, setPosts] = useState<InspirationPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPosts = async () => {
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          supabase
            .from("blog_posts")
            .select("id, title, slug, excerpt, cover_image_url, og_image_url, author_name, reading_time_minutes, published_at, category, views_count")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(1000),
          supabase.from("blog_categories").select("id, name, slug").order("name"),
        ]);

        if (!mounted) return;

        setPosts((postsRes.data as unknown as InspirationPost[]) || []);
        setCategories((categoriesRes.data as unknown as BlogCategory[]) || []);
      } catch {
        if (!mounted) return;
        setPosts([]);
        setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.slug, category.name])), [categories]);

  const formatDate = (value: string | null) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getAvatarUrl = (post: InspirationPost) => {
    const seed = post.author_name || post.id;
    return `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;
  };

  const getImageUrl = (post: InspirationPost) => {
    if (post.cover_image_url) return post.cover_image_url;
    if (post.og_image_url) return post.og_image_url;

    const imageText = encodeURIComponent((post.title || post.category || "Blog Post").slice(0, 24)).replace(/%20/g, "+");
    return `https://placehold.co/600x400/e2e8f0/64748b?text=${imageText}`;
  };

  const getCategoryLabel = (post: InspirationPost) => {
    if (!post.category) return "Travel";
    return categoryMap.get(post.category) || post.category;
  };

  const scrollCarousel = (direction: "left" | "right") => {
    const container = carouselRef.current;
    if (!container) return;

    const cardWidth = 380;
    const gap = 24;
    const delta = (cardWidth + gap) * (direction === "left" ? -1 : 1);

    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="py-24 relative w-full overflow-hidden bg-[#FAFAFC]">
      {/* Topographic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("/assets/map-pattern.png")', backgroundSize: '800px' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="font-poppins text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get inspiration for your next trip
            </h2>
            <p className="text-lg text-gray-500">
              Latest travel insights from our published blog posts
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <button type="button" onClick={() => scrollCarousel("left")} aria-label="Scroll blog cards left" className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button type="button" onClick={() => scrollCarousel("right")} aria-label="Scroll blog cards right" className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Carousel / Grid */}
        {/* Using a flex container with overflow-x-auto for the carousel effect */}
          <div ref={carouselRef} className="flex overflow-x-auto gap-6 pb-8 -mx-0 md:-mx-4 px-4 snap-x hide-scrollbar scroll-smooth">
          {loading ? (
            [1, 2, 3, 4].map((item) => (
              <div key={item} className="min-w-[320px] md:min-w-[380px] w-[320px] md:w-[380px] shrink-0 snap-start bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col animate-pulse">
                <div className="relative h-56 w-full bg-gray-100" />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="h-3 w-20 bg-gray-100 rounded-full" />
                    <div className="h-3 w-16 bg-gray-100 rounded-full" />
                    <div className="h-3 w-24 bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full mb-6 w-11/12" />
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="h-8 w-32 bg-gray-100 rounded-full" />
                    <div className="h-8 w-28 bg-gray-100 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="min-w-full rounded-3xl border border-dashed border-gray-200 bg-white/70 p-10 text-center text-gray-500">
              No blog posts published yet.
            </div>
          ) : (
            posts.map((post) => {
              const imageUrl = getImageUrl(post);
              const categoryLabel = getCategoryLabel(post);
              const authorName = post.author_name || "Marhaba DMC";

              return (
            <div key={post.id} className="min-w-[320px] md:min-w-[380px] w-[320px] md:w-[380px] shrink-0 snap-start bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
              
              {/* Image Section */}
              <div className="relative h-56 w-full">
                <img src={imageUrl} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-4 left-4 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-gray-900">
                  {categoryLabel}
                </div>
                <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-1">
                
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.reading_time_minutes || 1} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>0 comments</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 leading-snug mb-6 flex-1">
                  {post.title}
                </h3>

                {/* Footer (Author & Button) */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <img src={getAvatarUrl(post)} alt={authorName} className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                    <span className="text-sm font-semibold text-gray-900">{authorName}</span>
                  </div>
                  <Button asChild className="bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold px-4 py-2 rounded-full transition-colors h-auto shadow-none">
                    <Link to={`/blog/${post.slug}`}>Keep Reading</Link>
                  </Button>
                </div>

              </div>
            </div>
              );
            })
          )}
        </div>

        {/* View More Button */}
        <div className="mt-4">
          <Button asChild className="rounded-full px-6 py-6 bg-[#412A86] hover:bg-[#412A86]/90 text-white font-medium group">
            <Link to="/blog">
              View More
              <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

      </div>
      
      {/* Add a style tag for hiding scrollbar but allowing scroll */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default Inspiration;
