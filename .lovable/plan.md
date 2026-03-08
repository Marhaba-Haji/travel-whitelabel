

## Plan: AI-Powered Blog Writer/Editor with Public Blog Pages

This is a large feature with three major parts: database schema, admin blog editor with AI writing assistance, and public-facing blog pages with SEO optimization.

---

### 1. Database — New `blog_posts` table

Create a migration with:

```sql
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL DEFAULT '',
  cover_image_url text,
  status text NOT NULL DEFAULT 'draft',  -- draft | published
  meta_title text,
  meta_description text,
  meta_keywords text[],
  og_image_url text,
  author_name text DEFAULT 'Marhaba DMC',
  reading_time_minutes integer DEFAULT 1,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Anyone can read published blogs"
  ON public.blog_posts FOR SELECT
  USING (status = 'published');

-- Superadmins full access
CREATE POLICY "Superadmins can manage blogs"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'))
  WITH CHECK (has_role(auth.uid(), 'superadmin'));

-- Auto-update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for slug lookups and listing
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC);
```

---

### 2. Admin — Blog Management Tab

**New file: `src/components/admin/BlogTab.tsx`**

Features:
- **Blog list view**: Table of all posts (draft + published) with title, status, date, actions (edit/delete)
- **Blog editor form**: Title, slug (auto-generated from title), excerpt, rich content textarea, cover image URL, status toggle (draft/published)
- **AI Writing Assistant panel** — powered by Lovable AI via a new edge function:
  - "Generate Full Article" — given a topic/title, generates SEO-optimized long-form content
  - "Improve/Rewrite" — rewrites selected content for better SEO/readability
  - "Generate Meta Tags" — auto-generates meta title, description, keywords from content
  - "Generate Excerpt" — creates a compelling excerpt
  - "Suggest Topics" — suggests blog topics relevant to halal travel/DMC industry
- Content rendered with markdown preview (react-markdown already installed)
- Reading time auto-calculated from word count

**New edge function: `supabase/functions/blog-ai/index.ts`**

- Uses Lovable AI gateway (`LOVABLE_API_KEY` already available)
- Accepts `action` param: `generate_article`, `improve_content`, `generate_meta`, `generate_excerpt`, `suggest_topics`
- System prompt tailored for travel/hospitality SEO content with GSO (Generative Search Optimization) best practices
- Returns structured output via tool calling for meta tags, plain text for articles

**Add to admin sidebar and tab registry** in `AdminLayout.tsx` and `Admin.tsx`.

---

### 3. Public Frontend — Blog Pages

**New page: `src/pages/Blog.tsx`** — Blog listing page (`/blog`)
- Grid of published blog posts with cover images, titles, excerpts, reading time
- SEO meta tags in document head
- Matches existing Aurora design system (dark theme, glass cards)
- Pagination or infinite scroll

**New page: `src/pages/BlogPost.tsx`** — Individual post (`/blog/:slug`)
- Full article rendered with react-markdown
- SEO: dynamic `<title>`, meta description, keywords, OG image via `document.title` and meta tag injection
- Structured data (JSON-LD Article schema) for GSO
- Reading time, author, published date display
- "Back to Blog" navigation
- Share buttons (copy link)

**Router updates in `App.tsx`**:
- Add `/blog` and `/blog/:slug` routes (lazy loaded)

**Header updates in `Header.tsx`**:
- Add "Blog" nav link pointing to `/blog`

---

### 4. SEO & GSO Optimizations

- JSON-LD structured data (`Article`, `BlogPosting`) injected per post
- Dynamic meta tags (title, description, og:image, og:type, canonical URL)
- Clean URL slugs (`/blog/halal-travel-guide-dubai`)
- Sitemap-friendly structure
- AI prompt engineering for GSO: content structured with clear headings, FAQ sections, concise answers that AI search engines can extract

---

### 5. Config Updates

- `supabase/config.toml`: Add `[functions.blog-ai]` with `verify_jwt = false`

---

### Summary

~8 new/modified files:
1. Database migration (blog_posts table)
2. `supabase/functions/blog-ai/index.ts` — AI edge function
3. `src/components/admin/BlogTab.tsx` — Admin editor with AI tools
4. `src/pages/Blog.tsx` — Public blog listing
5. `src/pages/BlogPost.tsx` — Public blog post page
6. `src/App.tsx` — New routes
7. `src/components/landing/Header.tsx` — Blog nav link
8. `src/components/admin/AdminLayout.tsx` + `Admin.tsx` — Blog tab in admin

