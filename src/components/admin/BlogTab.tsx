import { useState, useEffect, useCallback } from "react";
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
import {
  Plus, Edit, Trash2, Eye, Sparkles, FileText, Tags, Lightbulb,
  BookOpen, Wand2, Loader2, ArrowLeft, Copy,
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
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

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
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [topicsDialog, setTopicsDialog] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();

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

  useEffect(() => { fetchPosts(); fetchCategories(); }, [fetchPosts, fetchCategories]);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const { error } = await supabase.from("blog_categories").insert({ name: newCategory.trim(), slug: slugify(newCategory.trim()) });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setNewCategory(""); fetchCategories(); toast({ title: "Category added!" }); }
  };

  const openNew = () => {
    setCurrentPost({ title: "", slug: "", content: "", excerpt: "", status: "draft", cover_image_url: "", meta_title: "", meta_description: "", meta_keywords: [], og_image_url: "", author_name: "Marhaba DMC", category: "", tags: [] });
    setEditing(true);
  };

  const openEdit = (post: BlogPost) => {
    setCurrentPost({ ...post });
    setEditing(true);
  };

  const handleTitleChange = (title: string) => {
    setCurrentPost((prev) => prev ? { ...prev, title, slug: prev.id ? prev.slug : slugify(title) } : prev);
  };

  const save = async () => {
    if (!currentPost?.title || !currentPost.slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    const reading_time_minutes = calcReadingTime(currentPost.content || "");
    const payload: any = {
      title: currentPost.title,
      slug: currentPost.slug,
      excerpt: currentPost.excerpt || null,
      content: currentPost.content || "",
      cover_image_url: currentPost.cover_image_url || null,
      status: currentPost.status || "draft",
      meta_title: currentPost.meta_title || null,
      meta_description: currentPost.meta_description || null,
      meta_keywords: currentPost.meta_keywords?.length ? currentPost.meta_keywords : null,
      og_image_url: currentPost.og_image_url || null,
      author_name: currentPost.author_name || "Marhaba DMC",
      reading_time_minutes,
      published_at: currentPost.status === "published" && !currentPost.published_at ? new Date().toISOString() : currentPost.published_at,
      category: currentPost.category || null,
      tags: currentPost.tags?.length ? currentPost.tags : [],
    };

    let error;
    if (currentPost.id) {
      ({ error } = await supabase.from("blog_posts").update(payload).eq("id", currentPost.id));
    } else {
      ({ error } = await supabase.from("blog_posts").insert(payload));
    }
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Blog post saved!" });
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

  // AI helpers
  const callAI = async (action: string, extra: Record<string, string> = {}) => {
    setAiLoading(action);
    try {
      const body = { action, title: currentPost?.title, content: currentPost?.content, ...extra };

      if (action === "generate_article" || action === "improve_content") {
        // Streaming
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blog-ai`;
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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

        toast({ title: action === "generate_article" ? "Article generated!" : "Content improved!" });
      } else {
        // Non-streaming
        const { data, error } = await supabase.functions.invoke("blog-ai", { body });
        if (error) throw error;

        if (action === "generate_meta" && data.result) {
          setCurrentPost((prev) => prev ? {
            ...prev,
            meta_title: data.result.meta_title,
            meta_description: data.result.meta_description,
            meta_keywords: data.result.meta_keywords,
          } : prev);
          toast({ title: "Meta tags generated!" });
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

  // ─── List View ───
  if (!editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Blog Posts</h2>
            <p className="text-sm text-muted-foreground">{posts.length} posts total</p>
          </div>
          <div className="flex gap-2">
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
                  <TableHead>Reading Time</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{post.reading_time_minutes} min</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(post.published_at || post.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {post.status === "published" && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer"><Eye className="h-4 w-4" /></a>
                        </Button>
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

        {/* Topics Dialog */}
        <Dialog open={topicsDialog} onOpenChange={setTopicsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>AI-Suggested Blog Topics</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {suggestedTopics.map((t, i) => (
                <Card key={i} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => {
                  setCurrentPost({ title: t.title, slug: slugify(t.title), content: "", excerpt: "", status: "draft", meta_keywords: t.keywords, author_name: "Marhaba DMC" });
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
                {/* Reading stats */}
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
                  onCheckedChange={(checked) =>
                    setCurrentPost((p) => p ? {
                      ...p,
                      status: checked ? "published" : "draft",
                      published_at: checked && !p.published_at ? new Date().toISOString() : p.published_at,
                    } : p)
                  }
                />
              </div>
              <div>
                <Label>Cover Image URL</Label>
                <Input
                  value={currentPost?.cover_image_url || ""}
                  onChange={(e) => setCurrentPost((p) => p ? { ...p, cover_image_url: e.target.value } : p)}
                  placeholder="https://…"
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
              <Button className="w-full" onClick={save}>Save Post</Button>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Assistant</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading} onClick={() => callAI("generate_article")}>
                {aiLoading === "generate_article" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                Generate Full Article
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading || !currentPost?.content} onClick={() => callAI("improve_content")}>
                {aiLoading === "improve_content" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
                Improve for SEO
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading || !currentPost?.content} onClick={() => callAI("generate_meta")}>
                {aiLoading === "generate_meta" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Tags className="h-4 w-4 mr-2" />}
                Generate Meta Tags
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled={!!aiLoading || !currentPost?.content} onClick={() => callAI("generate_excerpt")}>
                {aiLoading === "generate_excerpt" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Generate Excerpt
              </Button>
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
