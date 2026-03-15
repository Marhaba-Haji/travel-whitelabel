

# Plan: Automated Maximum-Coverage Indexing Pipeline

## Current State

You already have:
- **IndexNow** edge function submitting to Bing/Yandex on publish
- **Google Indexing API** via service account on publish
- Auto-trigger on save/pipeline in BlogTab
- Indexing logs dashboard
- Dynamic XML sitemap with news entries

## What's Missing

1. **No sitemap ping** — Google and Bing accept sitemap ping URLs that trigger a re-crawl; you're not calling them
2. **No Bing Webmaster API** — IndexNow covers Bing, but the Webmaster API provides direct URL submission with higher priority
3. **No bulk re-index** — No way to submit all published posts or all site pages at once from admin
4. **robots.txt sitemap URL** points to the Supabase function URL, not a production-domain URL (less SEO-friendly)
5. **No automatic static page submission** — Only blog posts are submitted; homepage, about, signup etc. are never indexed
6. **No "Submit All" or "Re-index Site" button** in admin

## Changes

### 1. Enhance `indexnow` Edge Function

Add three new submission targets alongside existing Google + IndexNow:

- **Google Sitemap Ping**: `GET https://www.google.com/ping?sitemap=URL` after any URL submission
- **Bing Sitemap Ping**: `GET https://www.bing.com/ping?sitemap=URL` 
- **Yandex Sitemap Ping**: `GET https://yandex.com/ping?sitemap=URL`

Add a new `action: "sitemap_ping"` mode that just pings all search engines with the sitemap URL.

Add a `bulk` mode that accepts `{ action: "bulk" }` — fetches all published blog URLs + static pages and submits them all.

### 2. Update `BlogTab.tsx` — Auto-Index on Every Publish

Currently auto-submits on save. Enhance to:
- Also ping sitemap after each blog publish/update
- Add a "Re-index Entire Site" button in the blog toolbar that submits all published posts + static pages
- Add a "Submit to Search Engines" button per post row
- Show toast with submission results

### 3. Update `robots.txt`

Change sitemap URL to production domain with a redirect, or keep Supabase URL but add a second entry. Best practice: use `https://marhabadmc.com/sitemap.xml` and set up a redirect. Since we can't do server-side redirects on Lovable, keep the Supabase function URL but add it cleanly.

### 4. Add IndexNow Key Verification File

Create `public/{INDEXNOW_KEY}.txt` containing the key value — required by IndexNow protocol for domain verification. We'll need the actual key value to do this properly, or generate a static placeholder.

### 5. Enhance Sitemap Function

- Add `<xhtml:link>` alternate tags for international SEO readiness
- Submit sitemap ping to Google/Bing/Yandex automatically when sitemap is regenerated

## Files to Modify

1. **`supabase/functions/indexnow/index.ts`** — Add sitemap pinging, bulk mode, Yandex ping
2. **`src/components/admin/BlogTab.tsx`** — Add "Re-index Site" button, per-post submit button, sitemap ping on publish
3. **`public/robots.txt`** — Clean up sitemap URL
4. **`supabase/functions/sitemap/index.ts`** — Minor: ensure all static pages are listed

Estimated scope: 4 files, focused on expanding the indexing edge function and wiring it into the admin UI.

