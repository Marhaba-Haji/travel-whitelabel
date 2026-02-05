
## Goal
Fix the **/signup** page on mobile where the layout is **not centered** and the page has **horizontal overflow** (content cropped on the right).

## What I observed / likely root causes
- The page uses Tailwind’s `container` class, and this project’s Tailwind config sets `container.padding = "2rem"`. On mobile this can create tighter-than-expected inner widths and make “full-width” sections feel misaligned.
- Even when things are centered, **horizontal overflow is usually caused by one of these**:
  1) a child element creating a “too-wide” layout (e.g., a flex row that refuses to wrap),
  2) a translated/animated element contributing to scroll width in some browsers,
  3) a component with implicit `min-width` behavior inside grid/flex (missing `min-w-0`),
  4) combined paddings causing “visual crop” (looks like right side is cut).

## Implementation approach (safe + robust)
We’ll fix this in a way that:
- keeps your current visual design,
- prevents any future “one element breaks the page” mobile overflow,
- ensures the form column is truly centered.

### 1) Make the layout wrapper predictable on mobile (Signup.tsx)
In `src/pages/Signup.tsx`:
- Replace `container ... px-4` usage with a **custom max-width wrapper** instead of Tailwind `container` (so we control padding precisely).
  - Use something like: `w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`
- Ensure the grid items can shrink properly:
  - Add `min-w-0` to the grid container and to each column wrapper.
- Ensure columns are centered on mobile:
  - Add `mx-auto` to the left and right column wrappers on mobile.
  - Keep desktop behavior via `lg:mx-0` / `lg:max-w-none`.

Why: this removes “container padding surprises” and fixes the most common grid/flex shrink issues.

### 2) Prevent any horizontal overflow even if a child is slightly too wide
Still in `src/pages/Signup.tsx`:
- Change the outermost wrapper from `overflow-hidden` to:
  - `overflow-x-hidden overflow-y-hidden` (or `overflow-x-hidden` while keeping the intended vertical behavior)
- Add `w-full` / `max-w-full` where needed on large cards so they cannot exceed viewport width.

Why: `overflow-hidden` is good, but being explicit about `overflow-x-hidden` prevents some browser edge cases where transformed children can still create horizontal scroll.

### 3) Make “wide” rows wrap safely on very small devices
In the right-side pricing card area (still in `Signup.tsx`):
- On the **price row** (`₹ 18,799 /year`) add a mobile-safe wrap rule:
  - `flex-wrap` on base, and `sm:flex-nowrap` at small screens and above (or adjust font sizes slightly for xs).
- For long pill/badge rows (e.g. “Save ₹2,00,000+ vs Building Your Own”):
  - Ensure text can wrap: add `text-center` + allow wrapping (avoid `whitespace-nowrap`), and optionally constrain with `max-w-full`.

Why: even a single non-wrapping flex row can create the exact “cropped to the right” symptom.

### 4) Add a global safeguard (optional but recommended)
In `src/index.css` (base layer):
- Add:
  - `html, body { overflow-x: hidden; }`

Why: this prevents any other page section (current or future) from introducing horizontal scroll on mobile.

## Testing plan (what I will verify after the changes)
1. Open `/signup` at mobile widths: **320×568, 360×800, 375×812, 390×844, 414×896**
2. Confirm:
   - No horizontal scrolling (no “drag sideways” movement)
   - Form card is centered and fully visible (no right cropping)
   - Pricing section (below) also fits without overflow
3. Quick regression check: `/login` (because it shares similar layout patterns)

## Files to change
- `src/pages/Signup.tsx` (primary fix: layout wrapper, min-w-0, centering, wrap safeguards)
- `src/index.css` (optional global overflow-x guard)

## Notes / tradeoffs
- The most “correct” fix is not to hide overflow globally, but to ensure nothing overflows. We’ll do both: fix the specific offenders, then (optionally) add a global guard as insurance.
- If you want the **pricing column hidden on mobile** (like Login page), that’s another clean option, but I’m not assuming you want that unless you ask.
