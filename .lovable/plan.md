

# Plan: Supercharge the AI Blog Writer for Maximum Search Visibility

## Current State Assessment

Your blog engine is already strong — it has Perplexity-powered research, cluster strategy, cannibalization checks, image generation, internal linking, and structured data (Article, FAQ, Breadcrumb, Speakable). Here's what's missing to dominate across Google, ChatGPT, Gemini, Claude, and featured snippets.

---

## Changes Overview

### 1. Upgrade the Article Generation Prompt (blog-ai edge function)

The `generate_article` action prompt will be enhanced with:

- **Snippet-first writing instructions**: Require a direct, concise answer (40-60 words) immediately after each H2 — this is the paragraph Google pulls for featured snippets.
- **PAA-optimized FAQ**: Instead of generic FAQs, require questions derived from the research's PAA data (`research.serp_analysis`) and format answers in the exact snippet-winning length (40-50 words).
- **Entity-rich writing**: Instruct the AI to explicitly mention named entities (brands, destinations, standards like "UNWTO", "Saudi Tourism Authority") so AI search engines can ground citations.
- **Comparison tables**: Require at least one markdown table per article (e.g., destination comparison, package comparison) — tables win table snippets and are heavily cited by AI engines.
- **Definition boxes**: For key terms, use a "What is X?" H2 pattern with a 1-2 sentence answer — this wins definition snippets.
- **"TL;DR" / Key Takeaways**: Make this mandatory (not optional), formatted as a bullet list right after intro — AI engines extract these as summaries.
- **Increase word count target**: 2500-4000 words for pillar posts (longer content ranks better for competitive queries).
- **Cite research sources inline**: Instruct AI to use the Perplexity citations as inline references `[Source](url)` for E-E-A-T signals.

### 2. Upgrade the `improve_content` / "Improve for SEO" Action

Currently it's a generic "improve SEO" prompt. Enhance it to:

- **Audit and fix snippet structure**: Check every H2 has a direct answer paragraph beneath it.
- **Audit entity density**: Ensure named entities (destinations, organizations, standards) appear frequently.
- **Add missing comparison tables** if none exist.
- **Strengthen FAQ answers** to be snippet-length (40-60 words per answer).
- **Add "Related:" cross-references** between sections for better topical coverage signals.
- **Inject schema-hint patterns**: Ensure content has "What is...", "How to...", "Best..." patterns that trigger snippet selection.

### 3. Upgrade Metadata Generation (`generate_meta` action)

Enhance the tool call schema and prompt:

- **Add `snippet_type`** field: AI assigns which snippet format this post should target (definition, list, table, paragraph, video).
- **Add `paa_target`** field: The primary PAA question this post answers.
- **Add `primary_keyword`** and **`secondary_keywords`** (separate from tags).
- **Add `search_intent`** classification: informational, commercial, navigational, transactional.
- **Generate `canonical_url`** suggestion.
- **Generate Twitter Card meta** fields (twitter:title, twitter:description).

### 4. Upgrade Dynamic Structured Data (BlogPost.tsx)

Currently you have Article, BreadcrumbList, FAQPage, and Speakable. Add:

- **HowTo schema**: Auto-detect "How to..." content sections and generate HowTo JSON-LD with steps.
- **ItemList schema**: For listicle posts (detect numbered lists), generate ItemList JSON-LD.
- **Table schema**: For comparison tables, wrap in structured data.
- **VideoObject schema**: If embedded video URLs are detected.
- **WebPage schema** with `speakable` for the intro paragraph (AI engines use this).
- **`dateModified`** from `updated_at` instead of `published_at` (currently both use `published_at`).
- **`inLanguage`** field on Article schema.
- **`isPartOf`** linking to the blog cluster pillar page (for cluster posts).
- **`about`** and **`mentions`** entity arrays extracted from meta_keywords/tags.
- **Twitter Card meta tags** (twitter:card, twitter:title, twitter:description, twitter:image).
- **`robots` meta** with `max-snippet:-1, max-image-preview:large, max-video-preview:-1` to allow Google maximum snippet extraction.

### 5. Upgrade Research Pipeline (blog-research edge function)

Add two new research queries:

- **PAA & Featured Snippet extraction**: A dedicated Perplexity query that returns the exact PAA questions and current featured snippet holders for the topic, so the article can directly answer them.
- **AI Engine citation analysis**: A query asking "What do ChatGPT/Gemini/Perplexity cite when answering about [topic]?" to understand what content structure gets cited.

Feed these back into the article generation prompt.

### 6. Add `snippet_type` and `paa_target` to Blog Posts Table

Add two new columns to `blog_posts`:
- `search_intent` (text, default 'informational')
- `primary_keyword` (text, nullable)

These are already partially present (`snippet_type`, `paa_target` columns exist). Add `search_intent` and `primary_keyword` via migration.

### 7. Sitemap Enhancement

Update `sitemap/index.ts` to:
- Add `<lastmod>` using `updated_at` instead of `now()` for static pages.
- Add `<news:news>` entries for posts published in the last 48 hours (Google News sitemap).

---

## Technical Details

### Files to modify:
1. **`supabase/functions/blog-ai/index.ts`** — Enhanced prompts for `generate_article`, `improve_content`, `generate_meta` actions
2. **`supabase/functions/blog-research/index.ts`** — Add PAA/snippet and AI citation research queries
3. **`src/pages/BlogPost.tsx`** — Enhanced structured data (HowTo, ItemList, twitter cards, robots meta, dateModified fix, entity mentions)
4. **`src/components/admin/BlogTab.tsx`** — Surface new meta fields (search_intent, primary_keyword) in the editor UI
5. **`supabase/functions/sitemap/index.ts`** — Use `updated_at` for lastmod, news sitemap entries
6. **New migration** — Add `search_intent` and `primary_keyword` columns to `blog_posts`

### Estimated scope: ~6 files, focused on prompt engineering + schema enrichment

