

## Assessment: Current Gaps

| Capability | Current State |
|---|---|
| Schema markup | Basic `BlogPosting` JSON-LD only. No `FAQPage`, `BreadcrumbList`, `HowTo`, or `Article` with `speakable` |
| Featured image generation | Manual URL input only. No auto-generation |
| In-content images | None generated |
| Alt text | Only cover image has alt (set to title). No in-content alt |
| External authority links | Not included in AI prompts |
| Keyword cannibalization | No check against existing posts |
| Content clusters | No pillar/supporting post structure. No cluster concept exists |
| GSO optimization | FAQ section in prompt but no structured data for it |

---

## Proposed Upgrade (6 workstreams)

### 1. Enhanced Schema Markup (BlogPost.tsx)

Add rich structured data to every blog post page:
- **FAQPage** schema extracted from the FAQ section in markdown content
- **BreadcrumbList** schema (Home > Blog > Category > Post)
- **Article** with `speakable`, `mainEntityOfPage`, `isPartOf` (for cluster awareness)
- **HowTo** schema when content contains step-by-step sections
- Open Graph and Twitter Card meta tags already exist but will add `article:section`, `article:tag`

### 2. AI Image Generation (blog-ai edge function)

Add a `generate_images` action to the `blog-ai` edge function using the Lovable AI Gateway image model (`google/gemini-2.5-flash-image`):
- Generate 1 featured image + 3 in-content images per article
- Auto-compress/optimize output (the model returns base64; we'll upload to Supabase storage at optimized sizes)
- Generate descriptive alt text for each image via a separate AI call
- Store images in a new `blog-images` Supabase storage bucket
- Insert image markdown with alt text directly into article content
- Featured image auto-set on the post

**New storage bucket**: `blog-images` (public)

### 3. External Authority Links (blog-ai edge function)

Update the `generate_article` system prompt to:
- Include 5-10 high-authority external links (government tourism boards, UNWTO, industry reports, Wikipedia for factual claims)
- Use `rel="nofollow"` for commercial links, `rel="dofollow"` for authoritative sources
- Research phase (Perplexity) already gathers source citations — feed those as linkable references

### 4. Keyword Cannibalization Prevention (blog-ai edge function)

Before generating an article:
- Fetch all existing posts' `meta_keywords`, `title`, `tags` from the database
- Pass them to the AI prompt as "existing keyword targets — avoid these primary keywords"
- Add a `check_cannibalization` action that compares a draft's target keywords against the existing catalog and flags overlaps
- Surface warnings in the admin editor sidebar

### 5. Content Cluster System (new DB columns + admin UI)

**Database changes** (blog_posts table):
- Add `cluster_id` column (nullable text) — groups posts into clusters
- Add `post_type` column (text, default 'standard') — values: 'pillar', 'supporting', 'standard'
- Add `pillar_post_id` column (nullable UUID, FK to blog_posts.id) — links supporting posts to their pillar

**New table**: `blog_clusters`
- `id` (uuid), `name` (text), `slug` (text), `description` (text), `target_keyword` (text), `created_at`

**Admin UI changes** (BlogTab.tsx):
- New "Clusters" tab showing all clusters with their pillar + supporting posts
- When creating a post, select cluster and post type (pillar/supporting)
- AI topic suggestions will be cluster-aware: suggest a pillar topic + 5-8 supporting topics per cluster
- Internal linking prioritizes same-cluster posts
- Visual cluster map showing relationships

**Blog page changes** (Blog.tsx):
- Filter by cluster
- Pillar posts get a special badge and layout showing their supporting articles

### 6. Upgraded blog-ai Prompt Pipeline

Update the `generate_article` action to include all of the above in a single enhanced flow:

1. **Cannibalization check** — compare target keywords against existing posts
2. **Research** — Perplexity SERP + trends (already exists)
3. **Generate article** with enhanced prompt including:
   - Cluster context (pillar vs supporting, related cluster posts)
   - External authority link requirements
   - Image placement markers (`[IMAGE_1: description]`, etc.)
   - FAQ section formatted for schema extraction
   - Keyword differentiation from existing posts
4. **Generate images** — 4 images via AI image model, upload to storage
5. **Replace image markers** in content with actual image URLs + alt text
6. **Auto-generate meta** — title, description, keywords, excerpt
7. **Auto-interlink** — weave internal links from cluster + catalog

### Files to Create/Modify

| File | Action |
|---|---|
| `supabase/functions/blog-ai/index.ts` | Add `generate_images`, `check_cannibalization` actions; enhance `generate_article` prompt |
| `src/components/admin/BlogTab.tsx` | Add Clusters tab, cluster selector in editor, cannibalization warnings, image generation UI |
| `src/pages/BlogPost.tsx` | Enhanced JSON-LD (FAQPage, BreadcrumbList, speakable), auto-extract FAQ from content |
| `src/pages/Blog.tsx` | Cluster filter, pillar post badges |
| SQL migration | Add `cluster_id`, `post_type`, `pillar_post_id` to `blog_posts`; create `blog_clusters` table |

### Database Migration

```sql
-- Blog clusters table
CREATE TABLE public.blog_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  target_keyword text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read clusters" ON public.blog_clusters FOR SELECT USING (true);
CREATE POLICY "Superadmins can manage clusters" ON public.blog_clusters FOR ALL
  USING (has_role(auth.uid(), 'superadmin')) WITH CHECK (has_role(auth.uid(), 'superadmin'));

-- Add cluster columns to blog_posts
ALTER TABLE public.blog_posts
  ADD COLUMN cluster_id uuid REFERENCES public.blog_clusters(id) ON DELETE SET NULL,
  ADD COLUMN post_type text NOT NULL DEFAULT 'standard',
  ADD COLUMN pillar_post_id uuid REFERENCES public.blog_posts(id) ON DELETE SET NULL;

-- Create blog-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);
```

This is a large upgrade. I recommend implementing it in phases — shall I start with the schema markup + cluster system first, then images + cannibalization?

