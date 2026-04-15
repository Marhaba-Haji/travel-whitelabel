

## Plan: Robust AI Blog Builder Overhaul

### Problems Identified

1. **Cannibalization is warn-only**: `checkCannibalization()` shows warnings but the pipeline ignores them and generates the article anyway. No auto-fix.
2. **State sync race conditions**: Pipeline calls `runResearch()` which sets `researchData` via React setState, then immediately calls `callAI("generate_article")` which reads `researchData` from state -- but React hasn't flushed yet, so articles generate without research data.
3. **No retry on failure**: If image generation or any step fails mid-pipeline, everything stops with no recovery.
4. **Pipeline doesn't pass cannibalization context to article generation**: Even when overlaps are found, the article generation prompt doesn't receive specific differentiation instructions.
5. **Duplicate streaming code**: `callAI()` and `interlinkPost()` duplicate the entire SSE streaming logic.
6. **No slug dedup in pipeline save**: Auto-save at end of pipeline doesn't ensure unique slug for new posts.

### Implementation Plan

#### 1. Fix Pipeline Data Flow (BlogTab.tsx)
- Make `runResearch()` return research data instead of only setting state. Pipeline stores it in a local variable and passes it directly to `callAI("generate_article", { research: localResearchData })`.
- Make `checkCannibalization()` return the overlaps array. Pipeline stores it locally.
- Pass cannibalization overlaps as `extra` to `callAI("generate_article")` so the prompt includes specific differentiation instructions.

#### 2. Auto-Fix Cannibalization (blog-ai edge function + BlogTab.tsx)
- Add a new action `resolve_cannibalization` to the edge function that takes the original title, overlaps, and existing posts, and returns a revised title + revised primary keyword angle that avoids the conflicts.
- In the pipeline: if `checkCannibalization` finds medium/high severity overlaps, automatically call `resolve_cannibalization` to get a revised title, update `currentPost.title` and `currentPost.slug`, then proceed.
- Keep the warnings UI but add a "Resolved" state showing the original vs revised title.

#### 3. Add Retry Logic to Pipeline (BlogTab.tsx)
- Wrap each pipeline step in a retry helper: `retryStep(fn, maxRetries=2, delayMs=3000)`.
- On transient failures (500, 502, timeout), retry before failing the pipeline.
- On permanent failures (400, 402), skip retry and fail immediately.

#### 4. Ensure Slug Uniqueness in Pipeline (BlogTab.tsx)
- Before the final `save(true)` in the pipeline, call `ensureUniquePostSlug()` on the current slug if the post is new (no `id`).

#### 5. Extract Shared Streaming Helper (BlogTab.tsx)
- Create a `streamFromEdgeFunction(body, onChunk)` helper to eliminate the duplicated SSE parsing in `callAI()` and `interlinkPost()`.

#### 6. Pass Full Existing Posts Context to Article Generation (blog-ai edge function)
- In the `generate_article` case, when cannibalization overlaps are provided via `reqBody.cannibalizationOverlaps`, append explicit differentiation instructions to the prompt: "You MUST differentiate from these specific overlapping posts: [list]. Use these alternative angles: [from overlaps.suggestion]."

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/BlogTab.tsx` | Fix pipeline data flow, add retry logic, add `resolve_cannibalization` step, extract streaming helper, ensure slug uniqueness |
| `supabase/functions/blog-ai/index.ts` | Add `resolve_cannibalization` action, enhance `generate_article` prompt with cannibalization differentiation context |

### Pipeline Sequence (After Fix)

```text
1. Research Topic (returns data directly)
2. Check Cannibalization (returns overlaps)
3. IF overlaps found → Resolve Cannibalization (auto-revise title/angle)
4. Generate Article (receives research + cannibalization context)
5. Generate Images
6. Generate Meta + Category + Tags
7. Generate Excerpt
8. Add Internal Links
9. Ensure unique slug → Save
```

