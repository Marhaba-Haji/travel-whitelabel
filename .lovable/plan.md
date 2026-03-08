

## Plan: Reduce Design Loudness by ~5% (Excluding Hero)

The goal is a subtle toning-down across all landing page sections (except Hero) and About page sections. This means reducing visual intensity slightly — not a redesign, just dialing things back.

### What "5% less loud" means in practice

These are small, consistent tweaks applied across all affected components:

1. **Reduce background gradient opacity** — e.g., `0.08` → `0.05`, `0.12` → `0.08`, `0.06` → `0.04`
2. **Reduce floating blob opacity** — e.g., `/10` → `/7`, `/15` → `/10`, and reduce `blur-3xl` blob sizes by ~10-15%
3. **Tone down animated shimmer/gradient-shift effects** — slow them down slightly (3s → 4s) so they feel calmer
4. **Reduce hover glow intensity** — `hover:shadow-2xl` → `hover:shadow-xl`
5. **Soften accent color intensity in badges/pills** — e.g., `bg-aurora-teal/15` → `bg-aurora-teal/10`
6. **Remove or slow down `animate-pulse` on badges** — the "Add-on" badge pulse is attention-grabbing; slow it or remove it

### Files to edit

**Landing page sections (all except Hero.tsx):**
- `TrustedBy.tsx` — reduce background gradient opacity
- `Stats.tsx` — already fairly clean; minimal changes
- `Features.tsx` — reduce background radial gradient opacities, reduce hover shadow intensity
- `CompetitiveEdge.tsx` — reduce background blob sizes/opacities, remove badge pulse animation, soften border colors (`border-gold/30` → `border-gold/20`, `border-primary/30` → `border-primary/20`)
- `ProductShowcase.tsx` — reduce decorative glow blob opacities
- `Portals.tsx` — reduce background gradient opacities
- `HowItWorks.tsx` — reduce background gradient opacities, slow down shimmer animation
- `Pricing.tsx` — reduce background blur blob opacity, soften Growth plan shadow (`shadow-primary/20` → `shadow-primary/10`)
- `Testimonials.tsx` — reduce floating blob opacities (`/10` → `/6`, `/8` → `/5`), slow shimmer
- `FAQ.tsx` — reduce CTA card gradient intensity
- `Footer.tsx` — reduce background gradient opacities
- `StickyCTA.tsx` — no changes needed (already minimal)

**About page sections:**
- `AboutHero.tsx` — reduce floating blob opacities (`/15` → `/10`, `/10` → `/7`), reduce blob sizes
- All other About components (`WhoWeAre`, `HalalFocus`, `TechPlatform`, etc.) — apply same pattern of reducing background gradient opacities by ~30-40%

**Global CSS (`src/index.css`):**
- Reduce `glass-card` shadow: `shadow-xl` → `shadow-lg`
- Reduce `aurora-gradient` opacity values slightly
- Reduce `aurora-glow` box-shadow spread

**Tailwind config (`tailwind.config.ts`):**
- Slow `text-shimmer` and `gradient-shift` animations: 3s → 4s
- Reduce `glow-pulse` shadow intensity values

### Summary of changes
~15-18 files with small opacity/size/animation tweaks. No layout changes, no color changes, no structural changes. Just a subtle reduction in visual "energy" — fewer glowing blobs, softer shadows, calmer animations.

