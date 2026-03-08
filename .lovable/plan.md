

## Assessment: Internal Linking in the Blog Writer

**Current state: No internal linking automation exists.** The system prompt mentions "Include internal linking suggestions where relevant" but the AI has no access to your existing blog posts. It cannot generate real internal links because it doesn't know what other articles exist, their slugs, or their topics.

There is no mechanism to retroactively update older posts with links to newer content either.

---

## Proposed: Automated Internal Linking System

### How It Works

1. **Feed existing posts into article generation** — When generating a new article, query `blog_posts` for all published posts (title, slug, category, tags, excerpt) and inject them into the AI prompt as available internal link targets. The AI then weaves real `[anchor text](/blog/slug)` links naturally into the content.

2. **Retroactive cross-linking** — Add a new `interlink_posts` action to the `blog-ai` edge function. Given a post's content and the full catalog of other posts, the AI identifies opportunities to insert internal links in both directions:
   - Add links TO existing posts from the new article
   - Scan existing posts and add links TO the new article where relevant

3. **Admin controls** — Add a "Re-link All Posts" button in the Blog admin tab that triggers a batch job to scan all published posts and insert missing cross-links.

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/blog-ai/index.ts` | Add `interlink_posts` action; inject existing post catalog into `generate_article` prompt |
| `src/components/admin/BlogTab.tsx` | Add "Auto Internal Links" button per post + batch "Re-link All" button; call interlink action after article generation |

### Technical Details

- The `generate_article` and `interlink_posts` actions will receive a `existingPosts` array (title, slug, excerpt, tags) fetched from Supabase before calling the edge function
- For retroactive linking, the edge function returns a list of `{ slug, updatedContent }` objects that the admin UI batch-updates via Supabase
- Links use relative paths: `/blog/post-slug` format
- A safeguard limits internal links to 3-7 per article to avoid over-optimization

