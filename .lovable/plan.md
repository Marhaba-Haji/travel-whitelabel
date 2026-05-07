## Add "Our Services" section to home page

Add a new section showcasing 8 service offerings, inspired by flyshop.in's Our Services block but rebuilt in our design system. Place it directly after "Embracing Adventure Since 2022" (CompetitiveEdge) and before Stats.

### Section content
- **Heading**: "Our Services"
- **Subheading**: "We offer white-label solutions that let you launch your own branded product quickly and effortlessly. You sell under your name—we manage the technology behind the scenes."
- **8 service cards** (each with icon, title, short description):
  1. **Hajj Packages** — Curated Hajj journeys with vetted operators and end-to-end support. (icon: `Moon`)
  2. **Umrah Packages** — Year-round Umrah departures with visa, transport, and ziyarat. (icon: `Star`)
  3. **Halal Holiday Packages** — Family-friendly halal-certified getaways across the globe. (icon: `Palmtree`)
  4. **Car & Transport** — Private transfers, intercity cabs, and luxury fleet bookings. (icon: `Car`)
  5. **Activities Booking** — Tours, experiences and tickets in 100+ destinations. (icon: `Ticket`)
  6. **Group Packages** — Custom group itineraries with negotiated fares for flights & hotels. (icon: `Users`)
  7. **Independent Packages** — Tailor-made FIT itineraries with full flexibility. (icon: `Compass`)
  8. **Guide Booking** — Certified local guides bookable on-demand in any language. (icon: `MapPinned`)

### Design (matches our system)
- Section: `py-24 bg-white` (or alternating soft tint to break monotony from the prior white section — use `bg-[#F7FAFF]`).
- Heading block: `EyebrowChip` ("Our Services" pill in indigo `#412A86`) + bold poppins H2 with `Our` in `#412A86` highlight. Subheading in `text-gray-500`.
- Cards: built with `SoftCard` (rounded-3xl, white, hairline border, soft shadow, hover lift). Reuse the blob-icon treatment from `Features.tsx`:
  - 16×16 organic-blob shaped tinted background, inner 11×11 white circle holding the lucide icon.
  - Cycle through the 7 surface tones already defined in `Features.tsx` (`featureSurfaces`) so palette stays consistent.
- Layout: responsive grid — 1 col mobile, 2 cols sm, 4 cols lg (8 cards = 2 neat rows on desktop).
- Animations: reuse `useScrollAnimation` for header + staggered `animate-scale-in` per card (delay `index * 0.06s`), matching `Features.tsx`.

### Files
- **Create** `src/components/landing/OurServices.tsx` — new section component.
- **Edit** `src/pages/Index.tsx` — lazy-import `OurServices` and render it in the `<Suspense>` block right after `<CompetitiveEdge />` and before `<Stats />`.

### Notes
- No new dependencies, no DB or API changes.
- Pure presentational; no admin CMS hookup (can be added later if requested).
- Fully mobile responsive with our standard container + spacing tokens.
