

## Plan: Reimagine "Complete API Suite" Section

Transform the current uniform 3+4 card grid into a premium, story-driven showcase with a featured hero card, gradient-accented cards, ambient motion, and tactile micro-interactions — while keeping all existing icons, copy, and brand tokens.

### New Layout — "Spotlight + Bento" Grid

```text
┌────────────────────────────────────────────────────────────┐
│  Section header (centered, animated gradient eyebrow)      │
├──────────────────────────────────┬─────────────────────────┤
│                                  │  [Hotel API]            │
│  [Flight API — FEATURED]         │  Popular  ↗             │
│  Large hero card                 ├─────────────────────────┤
│  Animated globe / orbit visual   │  [AI Sales Executive]   │
│  Live "real-time inventory" pill │  Add-on   ↗             │
│                                  │                         │
├──────────┬───────────┬───────────┴──────┬──────────────────┤
│ Visa API │Activities │  Own Domain      │ White-Label      │
│  ↗       │  ↗        │  ↗               │  ↗               │
└──────────┴───────────┴──────────────────┴──────────────────┘
            (4-column footer row, equal cards)
```

Desktop: `grid-cols-3` for top zone (Flight spans `col-span-2 row-span-2`), then 4-col bottom row.
Tablet: stacked 2-col, hero spans 2.
Mobile: single column, hero first, then 1-col stack.

### Visual System

**Per-card gradient identity** — each card gets a signature aurora gradient (cycled via `getAuroraGradient`):
- Soft gradient blob inside top-right corner (`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30`)
- Gradient hairline border on hover (`bg-gradient-to-br p-[1px]` wrapper)
- Icon sits in a glass-frosted "tile" (`w-16 h-16 rounded-2xl glass + gradient ring`)

**Micro-interactions**
- Card lifts 4px on hover with shadow-md → shadow-xl
- Icon tile rotates 6deg + scales 110% on hover
- Top-right arrow icon (`ArrowUpRight`) slides on hover
- Subtle radial mouse-follow glow (CSS variable updated on `onMouseMove`)
- Featured Flight card: orbit animation (3 small dots circling icon)

**Hero (Featured) Flight Card**
- 2× height & width of standard card
- Background: layered aurora gradient (purple→blue→teal) at 8% opacity
- Animated grid pattern overlay (faint)
- "Live inventory" status pill with pulsing green dot
- Bigger icon (96px), larger title, plus a 3-bullet feature list:
  - Global GDS coverage
  - Instant ticketing
  - Domestic + international
- "Explore Flight API →" inline CTA

**Section header upgrade**
- Replace duplicate "COMPLETE API Suite" h2 (currently identical to eyebrow) with a richer h2: "Everything you need to run a modern travel business"
- Eyebrow: animated shimmer gradient text
- Add a centered stats strip below subheading: "7 APIs · 100+ countries · 1M+ hotels · 24/7 AI"

**Ambient background**
- Existing radial gradient kept
- Add 2 floating aurora blobs (top-left purple, bottom-right teal) with `animate-float-slow`
- Faint grid pattern (`bg-grid-slate-100/[0.04]`) behind cards

### Card Anatomy (standard)

```text
┌───────────────────────────────────────┐
│ [gradient blob top-right, blurred]    │
│                                       │
│ ┌────┐                          ↗     │
│ │icon│  ←  glass tile, gradient ring  │
│ └────┘                                │
│                                       │
│ Title                          Badge  │
│ Description (2-3 lines)               │
│                                       │
│ ─────────────────────────────         │
│ Learn more →   (appears on hover)     │
└───────────────────────────────────────┘
```

### Files to Change

| File | Change |
|---|---|
| `src/components/landing/Features.tsx` | Full rewrite to bento layout, add featured card, gradient blobs, hover interactions, ArrowUpRight from lucide |
| `src/index.css` | Add `.feature-card-glow` utility (mouse-follow radial), `.bg-grid-faint` pattern; small keyframe `orbit` for hero card dots |
| `tailwind.config.ts` | Add `orbit` keyframe + animation |

No new dependencies. No copy changes to existing feature descriptions. Icons reused as-is.

### Responsive Behavior

- `≥1024px`: bento with hero spanning 2×2, side stack 1×2 each, 4-col footer row
- `768–1023px`: hero full-width, then 2-col grid for the rest
- `<768px`: single column, hero first; cards keep gradient identity but compact padding

### Accessibility & Performance

- All cards remain semantic `<article>` with proper headings
- Icons keep `loading="lazy"`; gradient blobs are pure CSS (no extra requests)
- Hover effects gated by `motion-safe:` so reduced-motion users get static cards
- No layout shift — fixed min-heights per breakpoint
- Animations use `transform` + `opacity` only (GPU-friendly)

### Out of Scope

- Not changing icon assets
- Not adding new APIs to the list
- Not touching other landing sections

