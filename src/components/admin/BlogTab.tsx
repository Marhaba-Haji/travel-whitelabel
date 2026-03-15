import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Edit, Trash2, Eye, Sparkles, FileText, Tags, Lightbulb,
  BookOpen, Wand2, Loader2, ArrowLeft, Copy, Search, Globe, Users,
  Settings, Target, TrendingUp, Link2, Image, AlertTriangle, Layers, Pin, Zap, Send, RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface BlogPost {
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
  created_at: string;
  updated_at: string;
  category: string | null;
  tags: string[] | null;
  views_count: number;
  cluster_id: string | null;
  post_type: string;
  pillar_post_id: string | null;
  snippet_type: string | null;
  paa_target: string | null;
  search_intent: string | null;
  primary_keyword: string | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogCluster {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  target_keyword: string;
  created_at: string;
}

interface BlogAIConfig {
  brand_tone: string;
  target_audience: string[];
  target_regions: string[];
  brand_keywords: string[];
  differentiators: string;
  competitor_urls: string[];
  // New: powerful research configuration
  region_country_codes?: Record<string, string>;
  authority_domains?: string[];
  research_depth?: "quick" | "full";
}

interface CannibalizationOverlap {
  keyword: string;
  competing_post: string;
  severity: string;
  suggestion: string;
}

const DEFAULT_AI_CONFIG: BlogAIConfig = {
  brand_tone: "Professional yet engaging, authoritative yet approachable. Focus on expertise in halal-friendly luxury travel.",
  target_audience: ["B2B travel agents in GCC", "Umrah/Hajj tour operators", "Luxury travel planners in SE Asia"],
  target_regions: ["Middle East", "Turkey", "Southeast Asia", "Maldives"],
  brand_keywords: ["halal travel", "DMC", "Muslim-friendly", "luxury hospitality", "travel technology"],
  differentiators: "AI-powered travel technology, halal-certified experiences, contracted inventory with best rates, white-label B2B platform",
  competitor_urls: [],
  region_country_codes: {
    "Middle East": "AE",
    Turkey: "TR",
    "Southeast Asia": "MY",
    Maldives: "MV",
    GCC: "SA",
  },
  authority_domains: ["unwto.org", "visitdubai.com", "statista.com"],
  research_depth: "full",
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

const calcReadingTime = (text: string) =>
  Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));

const BlogTab = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [clusters, setClusters] = useState<BlogCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [topicsDialog, setTopicsDialog] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<any[]>([]);
  const [clusterDialog, setClusterDialog] = useState(false);
  const [suggestedCluster, setSuggestedCluster] = useState<any>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newClusterName, setNewClusterName] = useState("");
  const [newClusterKeyword, setNewClusterKeyword] = useState("");
  const [clusterNiche, setClusterNiche] = useState("halal travel");
  const [fullStrategy, setFullStrategy] = useState<any>(null);
  const [fullStrategyDialog, setFullStrategyDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [aiConfig, setAiConfig] = useState<BlogAIConfig>(DEFAULT_AI_CONFIG);
  const [configLoading, setConfigLoading] = useState(false);
  const [researchData, setResearchData] = useState<any>(null);
  const [useResearch, setUseResearch] = useState(true);
  const [interlinkLoading, setInterlinkLoading] = useState<string | null>(null);
  const [cannibalizationWarnings, setCannibalizationWarnings] = useState<CannibalizationOverlap[]>([]);
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<string | null>(null);
  const [reindexLoading, setReindexLoading] = useState(false);
  const [submitIndexLoading, setSubmitIndexLoading] = useState<string | null>(null);
  const pipelineCancelledRef = useRef(false);
  const currentPostRef = useRef(currentPost);
  currentPostRef.current = currentPost;
  const { toast } = useToast();

  const getExistingPostsCatalog = useCallback(() => {
    return posts
      .filter((p) => p.status === "published")
      .map((p) => ({ title: p.title, slug: p.slug, excerpt: p.excerpt, tags: p.tags, category: p.category, meta_keywords: p.meta_keywords }));
  }, [posts]);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading posts", description: error.message, variant: "destructive" });
    } else {
      setPosts((data as unknown as BlogPost[]) || []);
    }
    setLoading(false);
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from("blog_categories").select("id, name, slug").order("name");
    setCategories((data as unknown as BlogCategory[]) || []);
  }, []);

  const fetchClusters = useCallback(async () => {
    const { data } = await supabase.from("blog_clusters").select("*").order("created_at", { ascending: false });
    setClusters((data as unknown as BlogCluster[]) || []);
  }, []);

  const fetchAIConfig = useCallback(async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "blog_ai_config")
      .maybeSingle();
    if (data?.value) {
      setAiConfig({ ...DEFAULT_AI_CONFIG, ...(data.value as any) });
    }
  }, []);

  useEffect(() => { fetchPosts(); fetchCategories(); fetchClusters(); fetchAIConfig(); }, [fetchPosts, fetchCategories, fetchClusters, fetchAIConfig]);

  const getExistingClustersCatalog = useCallback(() => {
    return clusters.map((cluster) => {
      const clusterPosts = posts.filter((p) => p.cluster_id === cluster.id);
      return {
        id: cluster.id,
        name: cluster.name,
        target_keyword: cluster.target_keyword,
        description: cluster.description,
        posts: clusterPosts.map((p) => ({
          title: p.title,
          slug: p.slug,
          post_type: p.post_type,
          meta_keywords: p.meta_keywords,
          tags: p.tags,
        })),
      };
    });
  }, [clusters, posts]);

  const saveAIConfig = async () => {
    setConfigLoading(true);
    try {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", "blog_ai_config")
        .maybeSingle();

      if (existing) {
        await supabase.from("site_settings").update({ value: aiConfig as any }).eq("key", "blog_ai_config");
      } else {
        await supabase.from("site_settings").insert({ key: "blog_ai_config", value: aiConfig as any });
      }
      toast({ title: "Blog AI config saved!" });
    } catch (e: any) {
      toast({ title: "Error saving config", description: e.message, variant: "destructive" });
    } finally {
      setConfigLoading(false);
    }
  };

  const autoFetchCompetitors = async () => {
    try {
      setConfigLoading(true);
      const { data, error } = await supabase.functions.invoke("blog-ai", {
        body: {
          action: "suggest_competitors",
          brandConfig: aiConfig,
        },
      });
      if (error) throw error;
      const urls: string[] = data?.result?.urls || [];
      if (!urls.length) {
        toast({ title: "No competitors found", description: "AI did not return any URLs. Try again with broader regions or keywords.", variant: "destructive" });
        return;
      }
      setAiConfig((c) => ({ ...c, competitor_urls: urls.filter(Boolean) }));
      toast({ title: "Competitors fetched", description: `Added ${urls.length} competitor blog URLs.` });
    } catch (e: any) {
      toast({ title: "Auto-fetch failed", description: e.message, variant: "destructive" });
    } finally {
      setConfigLoading(false);
    }
  };

  const runResearch = async () => {
    if (!currentPost?.title) {
      toast({ title: "Enter a title first", variant: "destructive" });
      return;
    }
    setAiLoading("research");
    try {
      const { data, error } = await supabase.functions.invoke("blog-research", {
        body: {
          topic: currentPost.title,
          competitors: aiConfig.competitor_urls.filter(Boolean),
          targetRegion: aiConfig.target_regions.join(", "),
          targetAudience: aiConfig.target_audience.join("; "),
          brandConfig: aiConfig,
          targetRegions: aiConfig.target_regions,
        },
      });
      if (error) throw error;
      if (data?.research) {
        setResearchData(data.research);
        toast({ title: "Research complete!", description: "Real-time data gathered. Now generate your article." });
      }
    } catch (e: any) {
      toast({ title: "Research failed", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  const checkCannibalization = async () => {
    if (!currentPost?.title) return;
    setAiLoading("cannibalization");
    try {
      const { data, error } = await supabase.functions.invoke("blog-ai", {
        body: {
          action: "check_cannibalization",
          title: currentPost.title,
          existingPosts: getExistingPostsCatalog().filter((p) => p.slug !== currentPost?.slug),
          brandConfig: aiConfig,
        },
      });
      if (error) throw error;
      if (data?.result) {
        setCannibalizationWarnings(data.result.overlaps || []);
        if (data.result.safe) {
          toast({ title: "✅ No cannibalization detected", description: "This topic is safe to target." });
        } else {
          toast({ title: "⚠️ Keyword overlaps found", description: `${data.result.overlaps.length} potential conflicts detected.`, variant: "destructive" });
        }
      }
    } catch (e: any) {
      toast({ title: "Check failed", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  const ensureImageMarkersInContent = (content: string): string => {
    const existingMarkers = content.match(/\[IMAGE_\d+:\s*[^\]]+\]/g) || [];
    const needed = Math.max(0, 3 - existingMarkers.length);
    if (needed === 0) return content;
    let h2Count = 0;
    return content.replace(/^(##\s+.+)$/gm, (match) => {
      h2Count++;
      if (h2Count >= 2 && h2Count <= 1 + needed) {
        const markerNum = existingMarkers.length + (h2Count - 1);
        return `\n\n[IMAGE_${markerNum}: Section image]\n\n${match}`;
      }
      return match;
    });
  };

  const generateImages = async () => {
    if (!currentPost?.content || !currentPost?.title) {
      toast({ title: "Generate article content first", variant: "destructive" });
      return;
    }
    setImageGenLoading(true);
    try {
      const contentWithMarkers = ensureImageMarkersInContent(currentPost.content);
      if (contentWithMarkers !== currentPost.content) {
        setCurrentPost((prev) => prev ? { ...prev, content: contentWithMarkers } : prev);
      }
      // Step 1: Extract image prompts from content
      const { data: promptData, error: promptErr } = await supabase.functions.invoke("blog-ai", {
        body: {
          action: "generate_image_prompts",
          title: currentPost.title,
          content: contentWithMarkers,
          brandConfig: aiConfig,
        },
      });
      if (promptErr) throw promptErr;

      const imagePrompts = promptData?.result;
      if (!imagePrompts) throw new Error("No image prompts generated");

      // Step 2: Generate actual images
      const allPrompts = [
        { ...imagePrompts.featured, type: "featured" },
        ...(imagePrompts.content_images || []).map((img: any) => ({ ...img, type: "content" })),
      ];

      toast({ title: "Generating images...", description: `Creating ${allPrompts.length} images. This may take a minute.` });

      const { data: imgData, error: imgErr } = await supabase.functions.invoke("blog-ai", {
        body: {
          action: "generate_images",
          prompts: allPrompts,
        },
      });
      if (imgErr) throw imgErr;

      const generatedImages = imgData?.result || [];
      if (generatedImages.length === 0) {
        toast({ title: "No images generated", variant: "destructive" });
        return;
      }

      // Step 3: Upload to Supabase storage with multi-size optimization
      let updatedContent = contentWithMarkers;
      let featuredUrl = currentPost.cover_image_url || "";

      const resizeImage = (base64Url: string, maxWidth: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
            const scale = Math.min(1, maxWidth / img.width);
            const w = Math.round(img.width * scale);
            const h = Math.round(img.height * scale);
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")), "image/webp", 0.82);
          };
          img.onerror = reject;
          img.src = base64Url;
        });
      };

      const SIZES = [
        { suffix: "-1200w", width: 1200 },
        { suffix: "-800w", width: 800 },
        { suffix: "-400w", width: 400 },
      ];

      for (const img of generatedImages) {
        if (!img.image_base64) continue;

        const baseName = `${currentPost.slug || "post"}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const uploadedUrls: Record<string, string> = {};

        for (const size of SIZES) {
          try {
            const resizedBlob = await resizeImage(img.image_base64, size.width);
            const fileName = `${baseName}${size.suffix}.webp`;
            const { error: uploadErr } = await supabase.storage
              .from("blog-images")
              .upload(fileName, resizedBlob, { contentType: "image/webp", cacheControl: "31536000" });
            if (uploadErr) { console.error(`Upload error (${size.suffix}):`, uploadErr); continue; }
            const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(fileName);
            uploadedUrls[size.suffix] = urlData.publicUrl;
          } catch (e) {
            console.error(`Resize error (${size.suffix}):`, e);
          }
        }

        const fullUrl = uploadedUrls["-1200w"] || uploadedUrls["-800w"] || uploadedUrls["-400w"];
        if (!fullUrl) continue;

        if (img.type === "featured") {
          featuredUrl = fullUrl;
        } else if (img.marker) {
          const altText = img.alt_text || "Blog image";
          const markerRegex = new RegExp(img.marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
          updatedContent = updatedContent.replace(markerRegex, `![${altText}](${fullUrl})`);
        }
      }

      // Also replace any remaining [IMAGE_N: ...] markers that weren't matched
      updatedContent = updatedContent.replace(/\[IMAGE_\d+:\s*[^\]]+\]/g, "");

      setCurrentPost((prev) => prev ? {
        ...prev,
        content: updatedContent,
        cover_image_url: featuredUrl || prev.cover_image_url,
        og_image_url: featuredUrl || prev.og_image_url,
      } : prev);

      toast({ title: "Images generated!", description: `${generatedImages.length} images created and uploaded.` });
    } catch (e: any) {
      toast({ title: "Image generation failed", description: e.message, variant: "destructive" });
    } finally {
      setImageGenLoading(false);
    }
  };

  const PIPELINE_STEPS = [
    { key: "research", label: "Researching topic..." },
    { key: "cannibalization", label: "Checking cannibalization..." },
    { key: "generate_article", label: "Generating article..." },
    { key: "generate_images", label: "Generating images..." },
    { key: "generate_meta", label: "Generating meta, category, tags..." },
    { key: "generate_excerpt", label: "Generating excerpt..." },
    { key: "interlink_posts", label: "Adding internal links..." },
    { key: "saving", label: "Saving post..." },
  ];

  const runFullPipeline = async () => {
    if (!currentPost?.title) {
      toast({ title: "Enter a title first", variant: "destructive" });
      return;
    }
    pipelineCancelledRef.current = false;
    const check = () => { if (pipelineCancelledRef.current) throw new Error("Pipeline cancelled"); };
    try {
      if (useResearch) {
        setPipelineStep("research");
        await runResearch();
        check();
      }

      setPipelineStep("cannibalization");
      await checkCannibalization();
      check();

      setPipelineStep("generate_article");
      await callAI("generate_article");
      check();

      setPipelineStep("generate_images");
      await generateImages();
      check();

      setPipelineStep("generate_meta");
      await callAI("generate_meta");
      check();

      setPipelineStep("generate_excerpt");
      await callAI("generate_excerpt");
      check();

      setPipelineStep("interlink_posts");
      await callAI("interlink_posts");

      // Auto-save so all generated fields (cover image, category, cluster, tags, og image, meta) are persisted
      setPipelineStep("saving");
      await new Promise((r) => setTimeout(r, 100)); // Allow React to flush state updates
      await save(true);

      toast({ title: "🚀 Full pipeline complete!", description: "Article generated, saved with images, meta, category, tags, and internal links." });
      // Auto-submit to search engines after pipeline
      if (currentPost?.slug && currentPost?.status === "published") {
        const postUrl = `https://marhabadmc.com/blog/${currentPost.slug}`;
        supabase.functions.invoke("indexnow", { body: { urls: [postUrl] } })
          .then(() => toast({ title: "📡 Submitted to search engines for indexing" }))
          .catch(() => {});
      }
    } catch (e: any) {
      if (pipelineCancelledRef.current) {
        toast({ title: "Pipeline cancelled", description: "Stopped after completing the current step. Progress is preserved." });
      } else {
        toast({ title: "Pipeline error", description: e.message, variant: "destructive" });
      }
    } finally {
      setPipelineStep(null);
      pipelineCancelledRef.current = false;
    }
  };

  const cancelPipeline = () => {
    pipelineCancelledRef.current = true;
    toast({ title: "Cancelling...", description: "Will stop after the current step finishes." });
  };


  const ensureUniqueClusterSlug = async (baseSlug: string): Promise<string> => {
    const { data: existing } = await supabase.from("blog_clusters").select("slug").ilike("slug", `${baseSlug}%`);
    const slugs = new Set((existing || []).map((r) => r.slug));
    if (!slugs.has(baseSlug)) return baseSlug;
    let i = 2;
    while (slugs.has(`${baseSlug}-${i}`)) i++;
    return `${baseSlug}-${i}`;
  };

  const ensureUniquePostSlug = async (baseSlug: string): Promise<string> => {
    const { data: existing } = await supabase.from("blog_posts").select("slug").ilike("slug", `${baseSlug}%`);
    const slugs = new Set((existing || []).map((r) => r.slug));
    if (!slugs.has(baseSlug)) return baseSlug;
    let i = 2;
    while (slugs.has(`${baseSlug}-${i}`)) i++;
    return `${baseSlug}-${i}`;
  };

  const addCluster = async () => {
    if (!newClusterName.trim() || !newClusterKeyword.trim()) return;
    const baseSlug = slugify(newClusterName.trim());
    const slug = await ensureUniqueClusterSlug(baseSlug);
    const { error } = await supabase.from("blog_clusters").insert({
      name: newClusterName.trim(),
      slug,
      target_keyword: newClusterKeyword.trim(),
    } as any);
    if (error) {
      const msg = error.code === "23505" ? "A cluster with this name already exists." : error.message;
      toast({ title: "Error", description: msg, variant: "destructive" });
    } else {
      setNewClusterName("");
      setNewClusterKeyword("");
      fetchClusters();
      toast({ title: "Cluster created!" });
    }
  };

  const deleteCluster = async (id: string) => {
    if (!confirm("Delete this cluster? Posts won't be deleted.")) return;
    const { error } = await supabase.from("blog_clusters").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { fetchClusters(); toast({ title: "Cluster deleted" }); }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const { error } = await supabase.from("blog_categories").insert({ name: newCategory.trim(), slug: slugify(newCategory.trim()) });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setNewCategory(""); fetchCategories(); toast({ title: "Category added!" }); }
  };

  const openNew = () => {
    setCurrentPost({ title: "", slug: "", content: "", excerpt: "", status: "draft", cover_image_url: "", meta_title: "", meta_description: "", meta_keywords: [], og_image_url: "", author_name: "Marhaba DMC", category: "", tags: [], cluster_id: null, post_type: "standard", pillar_post_id: null, snippet_type: null, paa_target: null, search_intent: null, primary_keyword: null });
    setCannibalizationWarnings([]);
    setEditing(true);
  };

  const openEdit = (post: BlogPost) => {
    setCurrentPost({ ...post });
    setCannibalizationWarnings([]);
    setEditing(true);
  };

  const handleTitleChange = (title: string) => {
    setCurrentPost((prev) => prev ? { ...prev, title, slug: prev.id ? prev.slug : slugify(title) } : prev);
  };

  const save = async (useLatestRef = false) => {
    const post = useLatestRef ? currentPostRef.current : currentPost;
    if (!post?.title || !post.slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    const reading_time_minutes = calcReadingTime(post.content || "");
    const payload: any = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || null,
      content: post.content || "",
      cover_image_url: post.cover_image_url || null,
      status: post.status || "draft",
      meta_title: post.meta_title || null,
      meta_description: post.meta_description || null,
      meta_keywords: post.meta_keywords?.length ? post.meta_keywords : null,
      og_image_url: post.og_image_url || null,
      author_name: post.author_name || "Marhaba DMC",
      reading_time_minutes,
      published_at: post.status === "published" && !post.published_at ? new Date().toISOString() : post.published_at,
      category: post.category || null,
      tags: post.tags?.length ? post.tags : [],
      cluster_id: post.cluster_id || null,
      post_type: post.post_type || "standard",
      pillar_post_id: post.pillar_post_id || null,
      snippet_type: post.snippet_type || null,
      paa_target: post.paa_target || null,
      search_intent: post.search_intent || "informational",
      primary_keyword: post.primary_keyword || null,
    };

    let error;
    if (post.id) {
      ({ error } = await supabase.from("blog_posts").update(payload).eq("id", post.id));
    } else {
      ({ error } = await supabase.from("blog_posts").insert(payload));
    }
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Blog post saved!" });
      // Auto-submit to search engines if published
      if (post.status === "published") {
        const postUrl = `https://marhabadmc.com/blog/${post.slug}`;
        supabase.functions.invoke("indexnow", { body: { urls: [postUrl] } })
          .then(() => toast({ title: "📡 Submitted to search engines for indexing" }))
          .catch(() => {}); // silent fail
      }
      setEditing(false);
      setCurrentPost(null);
      fetchPosts();
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Post deleted" }); fetchPosts(); }
  };

  const reindexEntireSite = async () => {
    setReindexLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("indexnow", {
        body: { action: "bulk" },
      });
      if (error) throw error;
      const r = data?.results;
      toast({
        title: "🌐 Full site re-index submitted!",
        description: `${r?.total_urls || 0} URLs sent to Google, Bing, Yandex + sitemap pinged.`,
      });
    } catch (e: any) {
      toast({ title: "Re-index failed", description: e.message, variant: "destructive" });
    } finally {
      setReindexLoading(false);
    }
  };

  const submitPostToSearchEngines = async (post: BlogPost) => {
    setSubmitIndexLoading(post.id);
    try {
      const postUrl = `https://marhabadmc.com/blog/${post.slug}`;
      const { data, error } = await supabase.functions.invoke("indexnow", {
        body: { urls: [postUrl] },
      });
      if (error) throw error;
      toast({ title: "📡 Submitted to search engines", description: `${post.title} sent to Google + Bing for indexing.` });
    } catch (e: any) {
      toast({ title: "Submit failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitIndexLoading(null);
    }
  };

  // Build cluster context for AI
  const getClusterContext = useCallback(() => {
    if (!currentPost?.cluster_id) return undefined;
    const cluster = clusters.find((c) => c.id === currentPost.cluster_id);
    if (!cluster) return undefined;
    const clusterPosts = posts
      .filter((p) => p.cluster_id === cluster.id && p.id !== currentPost.id)
      .map((p) => ({ title: p.title, slug: p.slug, post_type: p.post_type }));
    const pillar = posts.find((p) => p.id === currentPost.pillar_post_id);
    return {
      cluster_name: cluster.name,
      target_keyword: cluster.target_keyword,
      post_type: currentPost.post_type,
      pillar_title: pillar?.title,
      pillar_slug: pillar?.slug,
      cluster_posts: clusterPosts,
    };
  }, [currentPost, clusters, posts]);

  // AI helpers
  const callAI = async (action: string, extra: Record<string, any> = {}) => {
    setAiLoading(action);
    try {
      const needsExistingPosts = ["generate_article", "interlink_posts", "suggest_cluster", "suggest_topics", "full_cluster_strategy"].includes(action);
      const existingPosts = needsExistingPosts
        ? getExistingPostsCatalog().filter((p) => p.slug !== currentPost?.slug)
        : undefined;
      const existingClusters = (action === "suggest_cluster" || action === "suggest_topics" || action === "full_cluster_strategy")
        ? getExistingClustersCatalog()
        : undefined;
      const clusterInfo = action === "generate_article" ? getClusterContext() : undefined;
      const body: any = {
        action,
        title: currentPost?.title,
        content: currentPost?.content,
        brandConfig: aiConfig,
        ...(useResearch && researchData ? { research: researchData } : {}),
        ...(existingPosts?.length ? { existingPosts } : {}),
        ...(existingClusters?.length ? { existingClusters } : {}),
        ...(clusterInfo ? { clusterInfo } : {}),
        ...(action === "generate_meta" ? { categories: categories.map((c) => ({ name: c.name, slug: c.slug })), clusters: clusters.map((c) => ({ id: c.id, name: c.name })) } : {}),
        ...extra,
      };

      if (action === "generate_article" || action === "improve_content" || action === "interlink_posts") {
        // Streaming (use proxy in dev to avoid CORS)
        const baseUrl =
          import.meta.env.DEV && typeof window !== "undefined"
            ? `${window.location.origin}/supabase-proxy`
            : (import.meta.env.VITE_SUPABASE_URL || "https://kofijegdzeshitunwddn.supabase.co");
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZmlqZWdkemVzaGl0dW53ZGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjQxNTIsImV4cCI6MjA4NjUwMDE1Mn0.knr8JAjauZWGl-3Wd4BbaMCEZLujxHR7veJs4rQEwVw";
        const url = `${baseUrl}/functions/v1/blog-ai`;
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify(body),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "AI request failed" }));
          throw new Error(err.error || "AI request failed");
        }

        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let fullContent = "";

        const processBuffer = () => {
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") return;
            try {
              const parsed = JSON.parse(jsonStr);
              const c = parsed.choices?.[0]?.delta?.content;
              if (c) {
                fullContent += c;
                setCurrentPost((prev) => prev ? { ...prev, content: fullContent } : prev);
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });
          processBuffer();
        }
        if (textBuffer.trim()) processBuffer();

        toast({ title: action === "generate_article" ? "Article generated!" : action === "interlink_posts" ? "Internal links added!" : "Content improved!" });
      } else if (action === "suggest_cluster") {
        const { data, error } = await supabase.functions.invoke("blog-ai", { body });
        if (error) throw error;
        if (data?.result) {
          setSuggestedCluster(data.result);
          setClusterDialog(true);
        }
      } else if (action === "full_cluster_strategy") {
        const { data, error } = await supabase.functions.invoke("blog-ai", { body });
        if (error) throw error;
        const clusters = data?.result?.clusters;
        if (Array.isArray(clusters) && clusters.length > 0) {
          setFullStrategy(data.result);
          setFullStrategyDialog(true);
          toast({ title: "Full cluster strategy ready", description: `${clusters.length} clusters generated.` });
        } else {
          toast({ title: "No clusters returned", description: "The AI did not return any clusters. Try again or use Quick AI Cluster.", variant: "destructive" });
        }
      } else {
        // Non-streaming
        const { data, error } = await supabase.functions.invoke("blog-ai", { body });
        if (error) throw error;

        if (action === "generate_meta" && data.result) {
          const r = data.result;
          const clusterMatch = r.suggested_cluster_name && clusters.find((c) => c.name.toLowerCase() === (r.suggested_cluster_name || "").toLowerCase());
          setCurrentPost((prev) => prev ? {
            ...prev,
            meta_title: r.meta_title,
            meta_description: r.meta_description,
            meta_keywords: r.meta_keywords ?? prev.meta_keywords,
            category: r.category_slug ?? prev.category,
            tags: (r.tags && r.tags.length) ? r.tags : (prev.tags ?? []),
            cluster_id: clusterMatch?.id ?? prev.cluster_id,
            snippet_type: r.snippet_type || prev.snippet_type || null,
            paa_target: r.paa_target || prev.paa_target || null,
            search_intent: r.search_intent || prev.search_intent || null,
            primary_keyword: r.primary_keyword || prev.primary_keyword || null,
          } : prev);
          toast({ title: "Meta tags generated!", description: "Category, tags, snippet type, search intent, and primary keyword applied." });
        } else if (action === "generate_excerpt" && data.result) {
          setCurrentPost((prev) => prev ? { ...prev, excerpt: data.result } : prev);
          toast({ title: "Excerpt generated!" });
        } else if (action === "suggest_topics" && data.result?.topics) {
          setSuggestedTopics(data.result.topics);
          setTopicsDialog(true);
        }
      }
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  const interlinkPost = async (post: BlogPost) => {
    setInterlinkLoading(post.id);
    try {
      const otherPosts = getExistingPostsCatalog().filter((p) => p.slug !== post.slug);
      if (!otherPosts.length) {
        toast({ title: "Need at least 2 published posts for interlinking", variant: "destructive" });
        return;
      }
      const baseUrl =
        import.meta.env.DEV && typeof window !== "undefined"
          ? `${window.location.origin}/supabase-proxy`
          : (import.meta.env.VITE_SUPABASE_URL || "https://kofijegdzeshitunwddn.supabase.co");
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZmlqZWdkemVzaGl0dW53ZGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjQxNTIsImV4cCI6MjA4NjUwMDE1Mn0.knr8JAjauZWGl-3Wd4BbaMCEZLujxHR7veJs4rQEwVw";
      const url = `${baseUrl}/functions/v1/blog-ai`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          action: "interlink_posts",
          title: post.title,
          content: post.content,
          existingPosts: otherPosts,
          brandConfig: aiConfig,
        }),
      });
      if (!resp.ok) throw new Error("Interlinking failed");

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullContent = "";
      const processBuffer = () => {
        let idx: number;
        while ((idx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ") || line.trim() === "") continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") return;
          try {
            const parsed = JSON.parse(jsonStr);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) fullContent += c;
          } catch { break; }
        }
      };
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        processBuffer();
      }
      if (textBuffer.trim()) processBuffer();

      if (fullContent.trim()) {
        const { error } = await supabase.from("blog_posts").update({ content: fullContent }).eq("id", post.id);
        if (error) throw error;
        toast({ title: `Internal links added to "${post.title}"` });
        fetchPosts();
      }
    } catch (e: any) {
      toast({ title: "Interlink failed", description: e.message, variant: "destructive" });
    } finally {
      setInterlinkLoading(null);
    }
  };

  const relinkAllPosts = async () => {
    const published = posts.filter((p) => p.status === "published");
    if (published.length < 2) {
      toast({ title: "Need at least 2 published posts", variant: "destructive" });
      return;
    }
    if (!confirm(`This will add internal links to all ${published.length} published posts. Continue?`)) return;
    for (const post of published) {
      await interlinkPost(post);
    }
    toast({ title: "All posts re-linked!" });
  };

  const createClusterFromSuggestion = async () => {
    if (!suggestedCluster) return;
    const baseSlug = slugify(suggestedCluster.cluster_name);
    const slug = await ensureUniqueClusterSlug(baseSlug);
    const { data: newCluster, error: clusterError } = await supabase
      .from("blog_clusters")
      .insert({
        name: suggestedCluster.cluster_name,
        slug,
        target_keyword: suggestedCluster.target_keyword,
        description: `Pillar: ${suggestedCluster.pillar?.title || ""}`,
      } as any)
      .select("id")
      .single();
    if (clusterError) {
      const msg = clusterError.code === "23505" ? "A cluster with this name already exists." : clusterError.message;
      toast({ title: "Error creating cluster", description: msg, variant: "destructive" });
      return;
    }
    const clusterId = newCluster?.id;
    if (!clusterId) {
      toast({ title: "Error", description: "Cluster created but ID not returned.", variant: "destructive" });
      return;
    }

    // Create pillar post (draft)
    let pillarPostId: string | null = null;
    if (suggestedCluster.pillar?.title) {
      const pillarSlug = await ensureUniquePostSlug(slugify(suggestedCluster.pillar.title));
      const { data: pillarPost } = await supabase
        .from("blog_posts")
        .insert({
          title: suggestedCluster.pillar.title,
          slug: pillarSlug,
          excerpt: suggestedCluster.pillar.description || null,
          content: "",
          status: "draft",
          author_name: "Marhaba DMC",
          cluster_id: clusterId,
          post_type: "pillar",
          meta_keywords: suggestedCluster.pillar.keywords || [],
          tags: suggestedCluster.pillar.keywords || [],
        } as any)
        .select("id")
        .single();
      pillarPostId = pillarPost?.id || null;
    }

    // Create supporting posts (drafts)
    const supportingPosts = suggestedCluster.supporting_posts || [];
    for (const sp of supportingPosts) {
      if (!sp?.title) continue;
      const spSlug = await ensureUniquePostSlug(slugify(sp.title));
      await supabase.from("blog_posts").insert({
        title: sp.title,
        slug: spSlug,
        excerpt: sp.description || null,
        content: "",
        status: "draft",
        author_name: "Marhaba DMC",
        cluster_id: clusterId,
        post_type: "supporting",
        pillar_post_id: pillarPostId,
        meta_keywords: sp.keywords || [],
        tags: sp.keywords || [],
      } as any);
    }

    toast({
      title: "Cluster created!",
      description: `1 pillar + ${supportingPosts.length} supporting posts created as drafts.`,
    });
    fetchClusters();
    fetchPosts();
    setClusterDialog(false);
    setSuggestedCluster(null);
  };

  // ─── Posts List View ───
  if (!editing) {
    return (
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts"><FileText className="h-4 w-4 mr-1" />Posts</TabsTrigger>
            <TabsTrigger value="clusters"><Layers className="h-4 w-4 mr-1" />Clusters</TabsTrigger>
            <TabsTrigger value="config"><Settings className="h-4 w-4 mr-1" />AI Config</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Blog Posts</h2>
                <p className="text-sm text-muted-foreground">{posts.length} posts total</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reindexEntireSite} disabled={reindexLoading}>
                  {reindexLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                  Re-index Entire Site
                </Button>
                <Button variant="outline" size="sm" onClick={relinkAllPosts} disabled={!!interlinkLoading || posts.filter(p => p.status === "published").length < 2}>
                  {interlinkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Link2 className="h-4 w-4 mr-1" />}
                  Re-link All
                </Button>
                <Button variant="outline" size="sm" onClick={() => callAI("suggest_topics")} disabled={!!aiLoading}>
                  {aiLoading === "suggest_topics" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Lightbulb className="h-4 w-4 mr-1" />}
                  Suggest Topics
                </Button>
                <Button size="sm" onClick={openNew}>
                  <Plus className="h-4 w-4 mr-1" /> New Post
                </Button>
              </div>
            </div>

            {loading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : posts.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No blog posts yet. Create your first one!</CardContent></Card>
            ) : (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {post.title}
                          {post.cluster_id && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {clusters.find((c) => c.id === post.cluster_id)?.name || "Cluster"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.status === "published" ? "default" : "secondary"}>
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {post.post_type === "pillar" && <Badge variant="default" className="text-xs">📌 Pillar</Badge>}
                          {post.post_type === "supporting" && <Badge variant="secondary" className="text-xs">📎 Support</Badge>}
                          {post.post_type === "standard" && <span className="text-xs text-muted-foreground">Standard</span>}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-3.5 w-3.5" /> {(post.views_count || 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(post.published_at || post.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {post.status === "published" && (
                            <>
                              <Button variant="ghost" size="icon" asChild>
                                <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer"><Eye className="h-4 w-4" /></a>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => interlinkPost(post)} disabled={!!interlinkLoading} title="Add internal links">
                                {interlinkLoading === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Clusters Tab */}
          <TabsContent value="clusters" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Content Clusters</h2>
                <p className="text-sm text-muted-foreground">Organize posts into pillar + supporting article clusters for SEO and GSO.</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={clusterNiche}
                  onChange={(e) => setClusterNiche(e.target.value)}
                  placeholder="Cluster niche, e.g. halal travel"
                  className="h-8 w-56 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => callAI("suggest_cluster", { topic: clusterNiche })}
                  disabled={!!aiLoading}
                >
                  {aiLoading === "suggest_cluster" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  Quick AI Cluster
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setAiLoading("full_cluster_strategy");
                    try {
                      let clusterResearch: any = null;
                      try {
                        const { data, error } = await supabase.functions.invoke("blog-cluster-research", {
                          body: {
                            niche: clusterNiche,
                            brandConfig: aiConfig,
                            targetRegions: aiConfig.target_regions,
                          },
                        });
                        if (error) throw error;
                        clusterResearch = data?.research;
                      } catch (researchErr: any) {
                        toast({ title: "Research skipped", description: "Proceeding without web research.", variant: "default" });
                      }
                      await callAI("full_cluster_strategy", {
                        topic: clusterNiche,
                        research: clusterResearch,
                      });
                    } catch (e: any) {
                      toast({ title: "Full strategy failed", description: e.message, variant: "destructive" });
                    } finally {
                      setAiLoading(null);
                    }
                  }}
                  disabled={!!aiLoading}
                >
                  {aiLoading === "full_cluster_strategy" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Globe className="h-4 w-4 mr-1" />}
                  Full Cluster Strategy
                </Button>
              </div>
            </div>

            {/* Create Cluster */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Create Cluster</CardTitle></CardHeader>
              <CardContent className="flex gap-2">
                <Input value={newClusterName} onChange={(e) => setNewClusterName(e.target.value)} placeholder="Cluster name" className="flex-1" />
                <Input value={newClusterKeyword} onChange={(e) => setNewClusterKeyword(e.target.value)} placeholder="Target keyword" className="flex-1" />
                <Button onClick={addCluster} disabled={!newClusterName.trim() || !newClusterKeyword.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </CardContent>
            </Card>

            {/* Cluster List */}
            {clusters.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No clusters yet. Create one above or use AI to suggest a cluster strategy.</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {clusters.map((cluster) => {
                  const clusterPosts = posts.filter((p) => p.cluster_id === cluster.id);
                  const pillarPost = clusterPosts.find((p) => p.post_type === "pillar");
                  const supportPosts = clusterPosts.filter((p) => p.post_type === "supporting");
                  return (
                    <Card key={cluster.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Layers className="h-4 w-4" /> {cluster.name}
                            <Badge variant="outline" className="text-xs font-normal">{cluster.target_keyword}</Badge>
                          </CardTitle>
                          <Button variant="ghost" size="icon" onClick={() => deleteCluster(cluster.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {pillarPost ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Pin className="h-3.5 w-3.5 text-primary" />
                              <span className="font-medium text-foreground">{pillarPost.title}</span>
                              <Badge variant={pillarPost.status === "published" ? "default" : "secondary"} className="text-xs">{pillarPost.status}</Badge>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No pillar post assigned</p>
                          )}
                          {supportPosts.length > 0 && (
                            <div className="pl-6 space-y-1">
                              {supportPosts.map((sp) => (
                                <div key={sp.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>↳</span> {sp.title}
                                  <Badge variant={sp.status === "published" ? "default" : "secondary"} className="text-xs">{sp.status}</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">{clusterPosts.length} posts in cluster</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Blog AI Configuration</h2>
              <p className="text-sm text-muted-foreground">Configure brand voice, target audience, and competitor analysis for research-powered content generation.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Brand Voice</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Brand Tone & Writing Style</Label>
                    <Textarea
                      value={aiConfig.brand_tone}
                      onChange={(e) => setAiConfig((c) => ({ ...c, brand_tone: e.target.value }))}
                      placeholder="Describe your brand's writing tone..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Key Differentiators</Label>
                    <Textarea
                      value={aiConfig.differentiators}
                      onChange={(e) => setAiConfig((c) => ({ ...c, differentiators: e.target.value }))}
                      placeholder="What makes your brand unique..."
                      className="min-h-[60px]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Brand Keywords (comma-separated)</Label>
                    <Input
                      value={aiConfig.brand_keywords.join(", ")}
                      onChange={(e) => setAiConfig((c) => ({ ...c, brand_keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                      placeholder="halal travel, DMC, luxury..."
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {aiConfig.brand_keywords.map((k) => (
                        <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Target Audience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Audience Personas (one per line)</Label>
                    <Textarea
                      value={aiConfig.target_audience.join("\n")}
                      onChange={(e) =>
                        setAiConfig((c) => ({
                          ...c,
                          // Preserve empty trailing lines so pressing Enter creates a visible new line
                          target_audience: e.target.value.split("\n"),
                        }))
                      }
                      placeholder="B2B travel agents in GCC&#10;Umrah tour operators&#10;Luxury travel planners"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Target Regions (comma-separated)</Label>
                    <Input
                      value={aiConfig.target_regions.join(", ")}
                      onChange={(e) => setAiConfig((c) => ({ ...c, target_regions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                      placeholder="Middle East, Turkey, SE Asia..."
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {aiConfig.target_regions.map((r) => (
                        <Badge key={r} variant="outline" className="text-xs"><Globe className="h-3 w-3 mr-1" />{r}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Competitor URLs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Add competitor blog URLs. The AI will analyze their content when generating articles to help you differentiate.
                    You can also auto-fetch a starting list based on your brand info and regions.
                  </p>
                  <Textarea
                    value={aiConfig.competitor_urls.join("\n")}
                    onChange={(e) => setAiConfig((c) => ({ ...c, competitor_urls: e.target.value.split("\n").filter(Boolean) }))}
                    placeholder="https://competitor1.com/blog&#10;https://competitor2.com/blog"
                    className="min-h-[80px] font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={autoFetchCompetitors}
                    disabled={configLoading}
                  >
                    {configLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                    Auto-fetch competitor URLs
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" /> Research Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Region → Country Codes</Label>
                      <Textarea
                        value={Object.entries(aiConfig.region_country_codes || {})
                          .map(([region, code]) => `${region}=${code}`)
                          .join("\n")}
                        onChange={(e) =>
                          setAiConfig((c) => ({
                            ...c,
                            region_country_codes: e.target.value
                              .split("\n")
                              .map((line) => line.trim())
                              .filter(Boolean)
                              .reduce<Record<string, string>>((acc, line) => {
                                const [region, code] = line.split("=").map((s) => s.trim());
                                if (region && code) acc[region] = code.toUpperCase();
                                return acc;
                              }, {}),
                          }))
                        }
                        placeholder={"Middle East=AE\nTurkey=TR\nSoutheast Asia=MY\nMaldives=MV\nGCC=SA"}
                        className="min-h-[96px] font-mono text-xs"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Used for regional research via Perplexity&apos;s <code>user_location</code> filter.
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">Authority Domains (one per line)</Label>
                      <Textarea
                        value={(aiConfig.authority_domains || []).join("\n")}
                        onChange={(e) =>
                          setAiConfig((c) => ({
                            ...c,
                            authority_domains: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                        placeholder={"unwto.org\nvisitdubai.com\nstatista.com"}
                        className="min-h-[96px] font-mono text-xs"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        These domains are prioritized for industry trends and statistics.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-border/60 mt-2">
                    <div className="flex-1">
                      <Label className="text-xs">Research Depth</Label>
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-medium">Quick</span>: global SERP + trends + competitors.{" "}
                        <span className="font-medium">Full</span>: adds regional and brand research.
                      </p>
                    </div>
                    <select
                      value={aiConfig.research_depth || "full"}
                      onChange={(e) =>
                        setAiConfig((c) => ({
                          ...c,
                          research_depth: e.target.value as "quick" | "full",
                        }))
                      }
                      className="flex h-9 rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="quick">Quick</option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button onClick={saveAIConfig} disabled={configLoading}>
              {configLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
              Save AI Configuration
            </Button>
          </TabsContent>
        </Tabs>

        {/* Topics Dialog */}
        <Dialog open={topicsDialog} onOpenChange={setTopicsDialog}>
          <DialogContent className="max-w-lg" aria-describedby={undefined}>
            <DialogHeader><DialogTitle>AI-Suggested Blog Topics</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {suggestedTopics.map((t, i) => (
                <Card key={i} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => {
                  setCurrentPost({ title: t.title, slug: slugify(t.title), content: "", excerpt: "", status: "draft", meta_keywords: t.keywords, author_name: "Marhaba DMC", post_type: "standard", cluster_id: null, pillar_post_id: null });
                  setTopicsDialog(false);
                  setEditing(true);
                }}>
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">{t.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.keywords?.map((k: string) => (
                        <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Cluster Suggestion Dialog */}
        <Dialog open={clusterDialog} onOpenChange={setClusterDialog}>
          <DialogContent className="max-w-lg" aria-describedby={undefined}>
            <DialogHeader><DialogTitle>AI-Suggested Content Cluster</DialogTitle></DialogHeader>
            {suggestedCluster && (
              <div className="space-y-4 max-h-[60vh] overflow-auto">
                <div>
                  <p className="font-semibold text-foreground">{suggestedCluster.cluster_name}</p>
                  <Badge variant="outline" className="text-xs mt-1">{suggestedCluster.target_keyword}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1"><Pin className="h-3.5 w-3.5" /> Pillar Post</p>
                  <p className="text-sm text-muted-foreground">{suggestedCluster.pillar?.title}</p>
                  <p className="text-xs text-muted-foreground">{suggestedCluster.pillar?.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Supporting Posts ({suggestedCluster.supporting_posts?.length})</p>
                  <div className="space-y-2 mt-1">
                    {suggestedCluster.supporting_posts?.map((sp: any, i: number) => (
                      <div key={i} className="text-sm">
                        <p className="text-foreground">{sp.title}</p>
                        <p className="text-xs text-muted-foreground">{sp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={createClusterFromSuggestion} className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Create Cluster & Draft Posts
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Creates the cluster and {1 + (suggestedCluster.supporting_posts?.length || 0)} draft posts (1 pillar + {suggestedCluster.supporting_posts?.length || 0} supporting) ready for you to generate content.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Full Cluster Strategy Dialog */}
        <Dialog open={fullStrategyDialog} onOpenChange={setFullStrategyDialog}>
          <DialogContent className="max-w-3xl" aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Full Cluster Strategy</DialogTitle></DialogHeader>
            {fullStrategy?.clusters && (
              <div className="space-y-4 max-h-[70vh] overflow-auto text-sm">
                {fullStrategy.clusters.map((cluster: any, idx: number) => (
                  <Card key={idx} className="border-border/70">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Layers className="h-4 w-4" /> {cluster.cluster_name}
                          <Badge variant="outline" className="text-xs font-normal">{cluster.target_keyword}</Badge>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {cluster.description && (
                        <p className="text-xs text-muted-foreground">{cluster.description}</p>
                      )}
                      {Array.isArray(cluster.paa_queries) && cluster.paa_queries.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold mb-1">People Also Ask Targets</p>
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                            {cluster.paa_queries.map((q: string, i: number) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(cluster.related_searches) && cluster.related_searches.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold mb-1">Related Searches</p>
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                            {cluster.related_searches.map((q: string, i: number) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(cluster.featured_snippet_targets) && cluster.featured_snippet_targets.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold mb-1">Featured Snippet Targets</p>
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                            {cluster.featured_snippet_targets.map((q: string, i: number) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="pt-1">
                        <p className="text-xs font-semibold flex items-center gap-1">
                          <Pin className="h-3 w-3" /> Pillar Post
                        </p>
                        <p className="text-sm text-foreground">{cluster.pillar?.title}</p>
                        <p className="text-xs text-muted-foreground">{cluster.pillar?.description}</p>
                      </div>
                      {Array.isArray(cluster.supporting_posts) && cluster.supporting_posts.length > 0 && (
                        <div className="pt-1">
                          <p className="text-xs font-semibold">
                            Supporting Posts ({cluster.supporting_posts.length})
                          </p>
                          <div className="space-y-1 mt-1">
                            {cluster.supporting_posts.map((sp: any, i: number) => (
                              <div key={i} className="border border-border/40 rounded px-2 py-1.5">
                                <p className="text-sm text-foreground">{sp.title}</p>
                                {sp.description && (
                                  <p className="text-xs text-muted-foreground">{sp.description}</p>
                                )}
                                {(sp.paa_target || sp.snippet_type) && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {sp.paa_target && (
                                      <Badge variant="outline" className="text-[10px]">PAA: {sp.paa_target}</Badge>
                                    )}
                                    {sp.snippet_type && (
                                      <Badge variant="outline" className="text-[10px]">Snippet: {sp.snippet_type}</Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                <Button
                  className="w-full"
                  onClick={async () => {
                    if (!fullStrategy?.clusters) return;
                    try {
                      for (const cluster of fullStrategy.clusters) {
                        const baseSlug = slugify(cluster.cluster_name);
                        const slug = await ensureUniqueClusterSlug(baseSlug);
                        const { data: newCluster, error: clusterError } = await supabase
                          .from("blog_clusters")
                          .insert({
                            name: cluster.cluster_name,
                            slug,
                            target_keyword: cluster.target_keyword,
                            description: cluster.description || null,
                            paa_queries: cluster.paa_queries || [],
                            related_searches: cluster.related_searches || [],
                            featured_snippet_targets: cluster.featured_snippet_targets || [],
                          } as any)
                          .select("id")
                          .single();
                        if (clusterError) {
                          console.error("Cluster create error", clusterError);
                          continue;
                        }
                        const clusterId = newCluster?.id;
                        if (!clusterId) continue;

                        // Pillar
                        let pillarPostId: string | null = null;
                        if (cluster.pillar?.title) {
                          const pillarSlug = await ensureUniquePostSlug(slugify(cluster.pillar.title));
                          const { data: pillarPost } = await supabase
                            .from("blog_posts")
                            .insert({
                              title: cluster.pillar.title,
                              slug: pillarSlug,
                              excerpt: cluster.pillar.description || null,
                              content: "",
                              status: "draft",
                              author_name: "Marhaba DMC",
                              cluster_id: clusterId,
                              post_type: "pillar",
                              meta_keywords: cluster.pillar.keywords || [],
                              tags: cluster.pillar.keywords || [],
                            } as any)
                            .select("id")
                            .single();
                          pillarPostId = pillarPost?.id || null;
                        }

                        // Supporting
                        const supporting = cluster.supporting_posts || [];
                        for (const sp of supporting) {
                          if (!sp?.title) continue;
                          const spSlug = await ensureUniquePostSlug(slugify(sp.title));
                          await supabase.from("blog_posts").insert({
                            title: sp.title,
                            slug: spSlug,
                            excerpt: sp.description || null,
                            content: "",
                            status: "draft",
                            author_name: "Marhaba DMC",
                            cluster_id: clusterId,
                            post_type: "supporting",
                            pillar_post_id: pillarPostId,
                            meta_keywords: sp.keywords || [],
                            tags: sp.keywords || [],
                            paa_target: sp.paa_target || null,
                            snippet_type: sp.snippet_type || null,
                          } as any);
                        }
                      }
                      toast({
                        title: "Clusters created!",
                        description: "All clusters and draft posts from the strategy have been created.",
                      });
                      setFullStrategyDialog(false);
                      setFullStrategy(null);
                      fetchClusters();
                      fetchPosts();
                    } catch (e: any) {
                      toast({ title: "Create failed", description: e.message, variant: "destructive" });
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Create All Clusters & Draft Posts
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── Editor View ───
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setCurrentPost(null); }}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h2 className="text-xl font-semibold text-foreground">
          {currentPost?.id ? "Edit Post" : "New Post"}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={currentPost?.title || ""} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Blog post title" />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={currentPost?.slug || ""} onChange={(e) => setCurrentPost((p) => p ? { ...p, slug: e.target.value } : p)} placeholder="url-friendly-slug" />
          </div>

          {/* Cannibalization Warnings */}
          {cannibalizationWarnings.length > 0 && (
            <Card className="border-destructive/50">
              <CardContent className="py-3 space-y-2">
                <p className="text-sm font-medium text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Keyword Cannibalization Detected</p>
                {cannibalizationWarnings.map((w, i) => (
                  <div key={i} className="text-xs text-muted-foreground pl-5">
                    <span className={`font-medium ${w.severity === "high" ? "text-destructive" : w.severity === "medium" ? "text-yellow-500" : "text-muted-foreground"}`}>
                      [{w.severity.toUpperCase()}]
                    </span>{" "}
                    "{w.keyword}" conflicts with "{w.competing_post}" — {w.suggestion}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Content (Markdown)</Label>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPreviewing(!previewing)}>
                  {previewing ? <FileText className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {previewing ? "Edit" : "Preview"}
                </Button>
              </div>
            </div>
            {previewing ? (
              <Card className="min-h-[400px] p-6 overflow-auto">
                {currentPost?.content && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-3 border-b border-border">
                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {currentPost.content.split(/\s+/).filter(Boolean).length} words</span>
                    <span className="flex items-center gap-1">~{Math.max(1, Math.ceil(currentPost.content.split(/\s+/).filter(Boolean).length / 200))} min read</span>
                  </div>
                )}
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{currentPost?.content || ""}</ReactMarkdown>
                </div>
              </Card>
            ) : (
              <Textarea
                value={currentPost?.content || ""}
                onChange={(e) => setCurrentPost((p) => p ? { ...p, content: e.target.value } : p)}
                placeholder="Write your blog content in markdown…"
                className="min-h-[400px] font-mono text-sm"
              />
            )}
          </div>
          <div>
            <Label>Excerpt</Label>
            <Textarea
              value={currentPost?.excerpt || ""}
              onChange={(e) => setCurrentPost((p) => p ? { ...p, excerpt: e.target.value } : p)}
              placeholder="Short summary for listings"
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publish Settings */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Publish</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Published</Label>
                <Switch
                  checked={currentPost?.status === "published"}
                  onCheckedChange={async (checked) => {
                    const updated = currentPost ? {
                      ...currentPost,
                      status: checked ? "published" : "draft",
                      published_at: checked && !currentPost.published_at ? new Date().toISOString() : currentPost.published_at,
                    } : null;
                    if (!updated) return;
                    setCurrentPost(updated);
                    if (updated.id && updated.title && updated.slug) {
                      const { error } = await supabase.from("blog_posts").update({
                        status: updated.status,
                        published_at: updated.status === "published" ? updated.published_at : null,
                      }).eq("id", updated.id);
                      if (error) {
                        toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
                        setCurrentPost((p) => p ? { ...p, status: checked ? "draft" : "published" } : p);
                      } else {
                        toast({ title: checked ? "Post published!" : "Post set to draft." });
                        fetchPosts();
                      }
                    }
                  }}
                />
              </div>
              <div>
                <Label>Cover Image URL</Label>
                <Input
                  value={currentPost?.cover_image_url || ""}
                  onChange={(e) => setCurrentPost((p) => p ? { ...p, cover_image_url: e.target.value } : p)}
                  placeholder="https://… (or auto-generate below)"
                />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  value={currentPost?.category || ""}
                  onChange={(e) => setCurrentPost((p) => p ? { ...p, category: e.target.value } : p)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
                <div className="flex gap-1 mt-2">
                  <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category" className="h-8 text-xs" />
                  <Button variant="outline" size="sm" onClick={addCategory} className="h-8 px-2 text-xs">Add</Button>
                </div>
              </div>

              {/* Cluster & Post Type */}
              <div>
                <Label>Content Cluster</Label>
                <select
                  value={currentPost?.cluster_id || ""}
                  onChange={(e) => setCurrentPost((p) => p ? { ...p, cluster_id: e.target.value || null } : p)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">No cluster</option>
                  {clusters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.target_keyword})</option>
                  ))}
                </select>
              </div>
              {currentPost?.cluster_id && (
                <>
                  <div>
                    <Label>Post Type</Label>
                    <select
                      value={currentPost?.post_type || "standard"}
                      onChange={(e) => setCurrentPost((p) => p ? { ...p, post_type: e.target.value } : p)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="standard">Standard</option>
                      <option value="pillar">📌 Pillar Post</option>
                      <option value="supporting">📎 Supporting Post</option>
                    </select>
                  </div>
                  {currentPost?.post_type === "supporting" && (
                    <div>
                      <Label>Pillar Post</Label>
                      <select
                        value={currentPost?.pillar_post_id || ""}
                        onChange={(e) => setCurrentPost((p) => p ? { ...p, pillar_post_id: e.target.value || null } : p)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select pillar post</option>
                        {posts.filter((p) => p.cluster_id === currentPost?.cluster_id && p.post_type === "pillar").map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={(currentPost?.tags || []).join(", ")}
                  onChange={(e) => setCurrentPost((p) => p ? { ...p, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) } : p)}
                  placeholder="halal, dubai, luxury…"
                />
                {(currentPost?.tags?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {currentPost?.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* SEO Optimization Fields */}
              <div className="border-t border-border pt-3 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SEO Optimization</p>
                <div>
                  <Label className="text-xs">Primary Keyword</Label>
                  <Input
                    value={currentPost?.primary_keyword || ""}
                    onChange={(e) => setCurrentPost((p) => p ? { ...p, primary_keyword: e.target.value } : p)}
                    placeholder="e.g. halal travel guide"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Search Intent</Label>
                  <select
                    value={currentPost?.search_intent || "informational"}
                    onChange={(e) => setCurrentPost((p) => p ? { ...p, search_intent: e.target.value } : p)}
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="informational">Informational</option>
                    <option value="commercial">Commercial</option>
                    <option value="navigational">Navigational</option>
                    <option value="transactional">Transactional</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Snippet Type Target</Label>
                  <select
                    value={currentPost?.snippet_type || ""}
                    onChange={(e) => setCurrentPost((p) => p ? { ...p, snippet_type: e.target.value || null } : p)}
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Auto-detect</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="list">List</option>
                    <option value="table">Table</option>
                    <option value="definition">Definition</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">PAA Target Question</Label>
                  <Input
                    value={currentPost?.paa_target || ""}
                    onChange={(e) => setCurrentPost((p) => p ? { ...p, paa_target: e.target.value } : p)}
                    placeholder="What is halal travel?"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label>Author</Label>
                <Input
                  value={currentPost?.author_name || ""}
                  onChange={(e) => setCurrentPost((p) => p ? { ...p, author_name: e.target.value } : p)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Reading time: ~{calcReadingTime(currentPost?.content || "")} min
              </p>
              <Button className="w-full" onClick={() => save()}>Save Post</Button>
            </CardContent>
          </Card>

          {/* AI Research & Assistant */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" /> Research & Generate</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Use Web Research</Label>
                <Switch checked={useResearch} onCheckedChange={setUseResearch} />
              </div>
              {useResearch && (
                <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading || !currentPost?.title} onClick={runResearch}>
                  {aiLoading === "research" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                  Research Topic
                </Button>
              )}
              {researchData && (
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Research ready — {new Date(researchData.researched_at).toLocaleTimeString()}
                  </p>
                </div>
              )}
              <div className="border-t border-border pt-2 space-y-2">
                {/* Full Pipeline Button */}
                <Button
                  size="sm"
                  className="w-full justify-start font-semibold"
                  disabled={!!aiLoading || !!pipelineStep || !currentPost?.title || imageGenLoading}
                  onClick={runFullPipeline}
                >
                  {pipelineStep ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {PIPELINE_STEPS.find((s) => s.key === pipelineStep)?.label || "Processing..."}
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Full Pipeline (One-Click)
                    </>
                  )}
                </Button>
                {pipelineStep && (
                  <div className="space-y-1 px-1">
                    {PIPELINE_STEPS.map((step) => {
                      const stepIdx = PIPELINE_STEPS.findIndex((s) => s.key === step.key);
                      const currentIdx = PIPELINE_STEPS.findIndex((s) => s.key === pipelineStep);
                      const isDone = stepIdx < currentIdx;
                      const isCurrent = step.key === pipelineStep;
                      return (
                        <div key={step.key} className={`text-xs flex items-center gap-1.5 ${isDone ? "text-primary" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground/50"}`}>
                          {isDone ? "✓" : isCurrent ? <Loader2 className="h-3 w-3 animate-spin" /> : "○"} {step.label.replace("...", "")}
                        </div>
                      );
                    })}
                    <Button variant="destructive" size="sm" className="w-full mt-1" onClick={cancelPipeline}>
                      Cancel Pipeline
                    </Button>
                  </div>
                )}
                <div className="border-t border-border pt-2 space-y-2"></div>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading || !currentPost?.title} onClick={checkCannibalization}>
                  {aiLoading === "cannibalization" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                  Check Cannibalization
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading} onClick={() => callAI("generate_article")}>
                  {aiLoading === "generate_article" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                  Generate Full Article{researchData && useResearch ? " (with research)" : ""}
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading || !currentPost?.content} onClick={() => callAI("improve_content")}>
                  {aiLoading === "improve_content" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
                  Improve for SEO
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading || !currentPost?.content || imageGenLoading} onClick={generateImages}>
                  {imageGenLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Image className="h-4 w-4 mr-2" />}
                  Generate Images (4)
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading || !currentPost?.content} onClick={() => callAI("generate_meta")}>
                  {aiLoading === "generate_meta" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Tags className="h-4 w-4 mr-2" />}
                  Generate Meta Tags
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading || !currentPost?.content} onClick={() => callAI("generate_excerpt")}>
                  {aiLoading === "generate_excerpt" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Generate Excerpt
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading || !currentPost?.content} onClick={() => callAI("interlink_posts")}>
                  {aiLoading === "interlink_posts" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                  Add Internal Links
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SEO Meta */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">SEO Meta</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Meta Title</Label>
                <Input
                  value={currentPost?.meta_title || ""}
                  onChange={(e) => setCurrentPost((p) => p ? { ...p, meta_title: e.target.value } : p)}
                  placeholder="SEO title (max 60 chars)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">{(currentPost?.meta_title || "").length}/60</p>
              </div>
              <div>
                <Label className="text-xs">Meta Description</Label>
                <Textarea
                  value={currentPost?.meta_description || ""}
                  onChange={(e) => setCurrentPost((p) => p ? { ...p, meta_description: e.target.value } : p)}
                  placeholder="SEO description (max 160 chars)"
                  maxLength={160}
                  className="min-h-[60px]"
                />
                <p className="text-xs text-muted-foreground mt-1">{(currentPost?.meta_description || "").length}/160</p>
              </div>
              <div>
                <Label className="text-xs">Keywords (comma-separated)</Label>
                <Input
                  value={(currentPost?.meta_keywords || []).join(", ")}
                  onChange={(e) => setCurrentPost((p) => p ? { ...p, meta_keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) } : p)}
                  placeholder="halal travel, DMC, …"
                />
              </div>
              <div>
                <Label className="text-xs">OG Image URL</Label>
                <Input
                  value={currentPost?.og_image_url || ""}
                  onChange={(e) => setCurrentPost((p) => p ? { ...p, og_image_url: e.target.value } : p)}
                  placeholder="https://…"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogTab;
