## What's actually happening

When Facebook Events Manager's "Open Website" / Test Browser opens your link, it launches a **narrower-than-desktop popup window**. Tailwind's `lg` breakpoint (1024px) is not met, so the site correctly switches to its mobile layout (hamburger + mobile nav). That part is not a bug — it's responsive design reacting to the smaller window.

The real bug is in `src/components/landing/Header.tsx`: when the hamburger is tapped, the dropdown menu container is rendered with:

```
className="lg:hidden ... absolute left-0 right-0 px-4 shadow-xl animate-fade-in"
```

It has `left-0 right-0` but **no `top` value**, so the browser falls back to "static position" — which, inside a fixed-header / flex row, can land above the viewport or behind the header bar in certain window sizes. That's why:

- Hamburger toggles (state changes) but you see no panel.
- The instant you resize the window, a reflow happens and the panel appears.

## Fix

1. **`src/components/landing/Header.tsx` — give the mobile menu an explicit anchor and a safe max-height with scroll**
   - Add `top-20` (matches the header's `h-20`) so it always docks right under the header.
   - Add `max-h-[calc(100vh-5rem)] overflow-y-auto` so it never gets clipped in short popup windows.
   - Same treatment for both desktop-narrow and tablet/mobile path (single panel — only one exists today).

2. **Defensive: positioning context**
   - Add `relative` to the inner `<div className="container mx-auto px-4 max-w-7xl">` so the absolute menu is anchored to the container rather than the fixed header — eliminating any ambiguity about which ancestor is its positioning parent.

3. **No business-logic changes** — purely CSS/positioning. Hamburger state, links, prefetch behavior, scroll-to-section logic all stay identical.

## Sanity checks after the change

- Open the preview, set viewport to ~820 px and ~600 px, click hamburger — the panel should appear flush under the header, full-width, scrollable if items overflow.
- Re-test from Facebook Events Manager → Open Website → click hamburger. Panel should now appear.

## Out of scope (call out, don't change yet)

- The Meta Pixel / GA scripts (now driven by the new `tracking_scripts` table) are not implicated by this symptom. If after the fix the FB-opened tab still shows other weirdness (white screen, blocked scripts, CSP), we'd investigate the `TrackingScriptsInjector` cleanup logic separately.

## Files touched

- `src/components/landing/Header.tsx` (one className edit on the mobile menu div + add `relative` to the inner container div)

No DB migrations. No new dependencies. After merging you'll need to republish for the live site (marhabadmc.com) to pick up the fix.