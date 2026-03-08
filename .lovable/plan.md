

## Plan: XML Sitemap Generator + Auto-Submit to Google/Bing

### Overview

Build two new Supabase edge functions:
1. **`sitemap`** -- Generates a dynamic XML sitemap with all static pages + published blog posts, including image entries, lastmod, and priority differentiation for pillar vs supporting posts.
2. **`indexnow`** -- Submits URLs to Google Indexing API and Bing IndexNow for immediate crawling whenever a blog post is published or updated.

Plus a client-side trigger in BlogTab.tsx to auto-call the indexing function on publish.

---

### 1. Edge Function: `sitemap` (`supabase/functions/sitemap/index.ts`)

- Queries `blog_posts` where `status = 'published'`, selecting slug, updated_at, post_type, cover_image_url, title, cluster_id, pillar_post_id
- Generates XML sitemap with:
  - **Static pages**: `/`, `/about`, `/blog`, `/signup`, `/categories-destinations`, `/privacy-policy`, `/terms-of-service`, `/refund-policy` with fixed priorities (1.0 for home, 0.8 for about/blog)
  - **Blog posts**: `/blog/{slug}` with `<lastmod>` from updated_at, `<changefreq>weekly</changefreq>`
  - **Priority logic**: `post_type = 'pillar'` gets 0.9, standard gets 0.6, supporting gets 0.4
  - **Image entries**: `<image:image><image:loc>` from cover_image_url, `<image:title>` from post title
- Add to `supabase/config.toml` with `verify_jwt = false`
- Update `public/robots.txt` to include `Sitemap:` directive pointing to the edge function URL

### 2. Edge Function: `indexnow` (`supabase/functions/indexnow/index.ts`)

Handles two indexing services:

**Bing/Yandex via IndexNow protocol:**
- Generate and store an IndexNow API key as a Supabase secret (`INDEXNOW_KEY`)
- POST to `https://api.indexnow.org/indexnow` with the URL list and key
- No OAuth needed -- just the key

**Google Indexing API:**
- Requires a Google Service Account JSON key stored as a secret (`GOOGLE_INDEXING_SA_KEY`)
- Generate a JWT from the service account, exchange for access token
- POST each URL to `https://indexing.googleapis.com/v3/urlNotifications:publish` with type `URL_UPDATED`
- Note: Google Indexing API is officially for job posting and livestream pages, but works for general sites if enabled in Search Console

**Accepts payload:**
```json
{ "urls": ["https://marhabadmc.lovable.app/blog/my-post"], "action": "updated" }
```

### 3. Client-Side Integration (BlogTab.tsx)

- After a blog post is published/updated (status changed to "published" and saved), automatically call `supabase.functions.invoke('indexnow', { body: { urls: [postUrl] } })`
- Also trigger after the full pipeline completes
- Show a toast: "Submitted to search engines for indexing"

### 4. robots.txt Update

Add sitemap directive:
```
Sitemap: https://kofijegdzeshitunwddn.supabase.co/functions/v1/sitemap
```

### 5. Config Updates

Add to `supabase/config.toml`:
```toml
[functions.sitemap]
verify_jwt = false

[functions.indexnow]
verify_jwt = false
```

### 6. Secrets Required

- **INDEXNOW_KEY**: A self-generated UUID-style key for IndexNow (Bing/Yandex). I will generate one and ask you to store it.
- **GOOGLE_INDEXING_SA_KEY**: Google Service Account JSON for Indexing API. This requires setup in Google Cloud Console -- I will walk you through obtaining it after the initial implementation. The function will gracefully skip Google submission if this secret is not set.

### Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/functions/sitemap/index.ts` | Create |
| `supabase/functions/indexnow/index.ts` | Create |
| `supabase/config.toml` | Add 2 function configs |
| `public/robots.txt` | Add Sitemap directive |
| `src/components/admin/BlogTab.tsx` | Add auto-submit on publish |

