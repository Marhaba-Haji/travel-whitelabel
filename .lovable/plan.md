
## 1. Current Design System (post-upgrade) — what the homepage now uses

The homepage (`Hero`, `Features`, etc.) introduced a distinct "modern travel marketing" aesthetic that diverges from the old Aurora glassmorphism. This is the new system to standardize on.

### Color palette
- **Page background**: pure white `#FFFFFF` (sections may use very light off-white `#FAFAFC`)
- **Primary brand (deep indigo)**: `#412A86` — used for primary CTAs, headings accents, badges
- **Secondary accent (violet/magenta)**: `#B968C7` — used for highlighted words inside headlines
- **Tertiary accent (sky blue)**: `#2D9BFC` — used for hero shape, illustrations
- **Soft pink line accent**: `#F472B6` — used for decorative dashed paths/planes
- **Yellow accent**: Tailwind `yellow-400` — used inside floating chips
- **Text**: `text-gray-900` (headings), `text-gray-500` (body), `text-gray-600` (small)
- **Borders**: `border-gray-100` (very soft hairlines)
- **Pastel chip backgrounds**: `bg-blue-50 / teal-50 / purple-50 / pink-50 / orange-50 / cyan-50` paired with matching `text-{color}-500/600`

### Typography
- **Display / headings**: Poppins (`font-poppins`), `font-bold`, large sizes (e.g. `text-5xl md:text-6xl lg:text-[72px]` for H1, `text-4xl md:text-5xl` for section H2)
- **Body**: Inter (default `font-sans`), `text-gray-500`, `leading-relaxed`
- **Eyebrow chips**: `text-xs`, `font-bold`, `tracking-wide`, ALL CAPS, pill-shaped (`rounded-full`), pastel bg

Note: Poppins must be present in `tailwind.config.ts` or loaded from Google Fonts (currently the homepage uses `font-poppins` though only Inter/Sora are configured — to be added).

### Surfaces & shapes
- **Cards**: `rounded-3xl` (large radius), `bg-white`, `border border-gray-100`, soft shadow `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`, hover lift `hover:-translate-y-1` + slightly stronger shadow
- **Pills / chips / floating cards**: `rounded-full`, `bg-white`, `shadow-xl`, hairline border
- **Primary button**: `h-14 rounded-full px-8 bg-[#412A86] hover:bg-[#412A86]/90 text-white shadow-lg`
- **Secondary button**: `rounded-full bg-white border border-gray-100 shadow-sm` with dark text
- **Icon tile inside cards**: `w-12 h-12 rounded-xl` pastel bg + matching colored icon

### Motion
- `animate-float`, `animate-float-slow` for hovering chips
- `animate-fade-in`, `animate-scale-in` (already configured) for scroll reveals via `useScrollAnimation`
- Hover micro-interactions: `group-hover:scale-110 group-hover:-rotate-3` on icons; card lift on hover

### Decorative layer
- SVG dashed paths (`stroke-dasharray="4 6"`) in pink with mini "plane" tip and dot markers
- Optional faint world-map pattern inside large blue circle (hero)
- Subtle grid/skyline overlays at very low opacity (~4%)

### Section structure pattern
```text
<section class="py-20 lg:py-24 bg-white | bg-[#FAFAFC] relative overflow-hidden">
  <decorative SVG/blobs absolute inset-0 pointer-events-none />
  <div class="container mx-auto px-4 relative z-10">
    <eyebrow chip />
    <h2 class="text-4xl md:text-5xl font-bold font-poppins text-gray-900" />
    <p class="text-gray-500 text-lg" />
    <grid of rounded-3xl white cards />
  </div>
</section>
```

### What is being retired on these pages
- `glass`, `glass-card`, `aurora-gradient*`, `bg-aurora-*/10` blurred orbs
- `font-display` (Sora) usage on marketing pages → replaced by `font-poppins`
- HSL token-driven dark surfaces with luminous edges (kept only inside Admin / authenticated portals)
- Heavy `radial-gradient` purple wash backgrounds

---

## 2. Foundational changes (one-time)

1. **Add Poppins to the system**
   - Inject Poppins (400/500/600/700/800) Google Fonts link in `index.html`
   - Add `poppins: ["Poppins", "Inter", "system-ui", "sans-serif"]` to `tailwind.config.ts` `fontFamily`
2. **Document tokens** in `src/lib/design-tokens.ts`:
   - Export `BRAND = { indigo: "#412A86", violet: "#B968C7", sky: "#2D9BFC", pink: "#F472B6" }`
   - Export `CARD_BASE`, `CARD_HOVER`, `PRIMARY_BTN`, `EYEBROW_CHIP`, `SECTION_BG_WHITE`, `SECTION_BG_OFFWHITE` class strings so all migrated pages stay consistent
3. **Reusable primitives** (new, small):
   - `src/components/ui/EyebrowChip.tsx` — pastel pill (`color` prop: blue/teal/purple/pink/orange/cyan)
   - `src/components/ui/SectionHeader.tsx` — eyebrow + h2 + subtitle, centered
   - `src/components/ui/SoftCard.tsx` — `rounded-3xl bg-white border border-gray-100 shadow-soft hover-lift`

---

## 3. Page-by-page migration

### A. `/signup` (`src/pages/Signup.tsx`)
- Replace `bg-background` + radial purple wash → `bg-white` with one soft `bg-[#2D9BFC]/5` blob top-right
- Convert form container from `glass-card` → `SoftCard` (`rounded-3xl bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]`)
- Headings: `font-poppins font-bold text-gray-900`; body: `text-gray-500`
- Plan selector cards:
  - Selected: `border-2 border-[#412A86] bg-[#412A86]/5`
  - Unselected: `border border-gray-100 bg-white hover:border-[#412A86]/40`
  - Selected dot: `bg-[#412A86]`
  - "Most popular" badge: `bg-[#412A86] text-white rounded-full`
- Primary submit button inside `SignupForm` → `rounded-full h-12 bg-[#412A86] hover:bg-[#412A86]/90 shadow-lg`
- "All plans include" panel → soft card with `bg-[#FAFAFC]` and `text-[#412A86]` checkmarks

### B. `/about` (`src/pages/About.tsx` and all `src/components/about/*`)
- `AboutHero`: drop `glass`, radial gradients, `aurora-blue/10` blob → use `bg-white` + decorative dashed SVG path (pink `#F472B6`) like the homepage hero. Heading uses `font-poppins`, with the brand word in `text-[#B968C7]`. Replace `glass-card` value-prop card with `SoftCard`.
- `AboutStats`: number cards → `rounded-3xl bg-white border-gray-100 shadow-soft`; numbers in `text-[#412A86] font-poppins font-bold`
- `WhoWeAre`, `HalalFocus`, `TechPlatform`, `ContractedInventory`, `AIPowered`, `TrainingSupport`, `HospitalityTech`, `Philosophy`, `WorkWithUs`, `AboutTestimonials`:
  - Section wrappers → `py-20 lg:py-24 bg-white` (alternate with `bg-[#FAFAFC]` every other section for rhythm)
  - Eyebrow chips → `EyebrowChip` (rotate colors blue→teal→purple→pink→orange across sections)
  - Replace any `glass*` with `SoftCard`
  - Icon tiles → `w-12 h-12 rounded-xl bg-{color}-50 text-{color}-500` pattern
  - CTA in `WorkWithUs` → primary indigo pill button

### C. `/categories-destinations` (`src/pages/CategoriesDestinations.tsx`)
- Page bg → `bg-white`
- Hero: same hero pattern as About (eyebrow chip + Poppins heading + violet highlight word + soft subtitle)
- Filter chips: `rounded-full px-4 py-1.5 text-xs font-bold` — active: `bg-[#412A86] text-white`, inactive: `bg-white border border-gray-100 text-gray-600 hover:border-[#412A86]/40`
- Destination cards → `rounded-3xl overflow-hidden bg-white border-gray-100 shadow-soft hover-lift`; image top, body padding 6, title `font-poppins font-bold text-gray-900`, meta `text-gray-500 text-sm`
- Category badges on cards → pastel chips (color cycled)

### D. `/blog` (`src/pages/Blog.tsx`)
- Page bg → `bg-white`; remove dark/glass wrappers
- Header: eyebrow `BLOG`, h1 in Poppins with violet-highlighted word ("Insights"), subtitle gray-500
- Search input: `h-12 rounded-full bg-white border border-gray-100 shadow-sm pl-12` with leading search icon, `focus-visible:ring-[#412A86]/30`
- Category filter row: pill chips (active indigo, inactive white pastel)
- Sort dropdown: rounded-full ghost button
- Post cards → `rounded-3xl overflow-hidden bg-white border-gray-100 shadow-soft hover-lift`; image `aspect-[16/10]`; title `font-poppins font-bold text-gray-900 group-hover:text-[#412A86]`; meta row with `text-gray-500 text-xs`; category as pastel chip; views/reading time icons in `text-gray-400`
- Pagination buttons → `rounded-full` with indigo active state
- RSS link → small ghost pill button

### E. `/blog/:slug` (`src/pages/BlogPost.tsx`)
- Page bg → `bg-white`
- Hero: cover image with `rounded-3xl shadow-soft`, title above in Poppins, eyebrow chip = category color, author/date row in gray-500
- TOC sidebar: `SoftCard` with sticky position; active link `text-[#412A86] border-l-2 border-[#412A86]`
- Reading-progress bar: keep, recolor to `bg-[#412A86]`
- Update `.blog-prose` (in `index.css`) so headings use `font-poppins`, links use `text-[#412A86]`, blockquote border `border-[#B968C7]/60`, code chip `bg-[#FAFAFC]`
- "Related articles" section → grid of soft cards matching `/blog`
- Newsletter CTA card → `SoftCard` with indigo button

### F. `/umrah-visa-check` (`src/pages/UmrahVisaCheck.tsx` + `src/components/visa/*`)
- Remove the bespoke `[data-visa-page]` token override block in `index.css` (or simplify it to inherit). Use the new system directly.
- Page bg → `bg-white` with a single soft `#2D9BFC/5` blob top-right
- Hero block above the wizard: eyebrow `VISA SERVICE`, Poppins headline, subtitle gray-500
- `VisaStepIndicator`: pill steps; active step `bg-[#412A86] text-white`, completed `bg-[#2D9BFC]/10 text-[#2D9BFC]`, upcoming `bg-gray-100 text-gray-400`; connectors `bg-gray-200`
- Wizard `Card` → replace shadcn `Card` styling with `SoftCard`-equivalent `rounded-3xl bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]`
- Form inputs: `h-12 rounded-xl border-gray-200 focus-visible:ring-[#412A86]/30 focus-visible:border-[#412A86]`
- Primary actions: indigo pill button; Secondary: white pill with border
- Result step success/error banners: pastel chips (`bg-emerald-50 text-emerald-600` / `bg-rose-50 text-rose-600`) inside a soft card

### G. Other independent pages (sweep)
Apply the same primitives (bg-white, Poppins headings, SoftCard, EyebrowChip, indigo pill CTAs) to:
- `/login` (`src/pages/Login.tsx`) and `/admin/login` (`src/pages/AdminLogin.tsx`) — match Signup form styling; admin login keeps its admin chrome
- `/signup-success` (`src/pages/SignupSuccess.tsx`)
- `/account-pending-activation` (`src/pages/AccountPendingActivation.tsx`)
- `/privacy-policy`, `/terms-of-service`, `/refund-policy` — Poppins headings, gray-500 prose, white bg, soft TOC card
- `/resource/:slug` (`src/pages/Resource.tsx`)
- `/itinerary/:shareId` (`src/pages/SharedItinerary.tsx`) — only the marketing chrome (header/footer/hero card); preserve itinerary functional UI
- `/404` (`src/pages/NotFound.tsx`) — bg-white, Poppins heading with violet "404", indigo pill CTA back home

Out of scope (intentionally untouched, since they have their own product UI / portal chrome):
- `/admin/*` (admin dashboard tabs)
- Itinerary builder editor surface and Voice AI surfaces

---

## 4. Technical / shared work

- `src/index.css`:
  - Update `.blog-prose` heading font + accent colors as noted
  - Simplify the `[data-visa-page]` block (remove now that the visa page uses the global system)
- `tailwind.config.ts`: add Poppins to `fontFamily`; add a reusable `boxShadow.soft` token (`0 8px 30px rgb(0 0 0 / 0.04)`) and `boxShadow["soft-lg"]`
- `index.html`: add `<link rel="preconnect">` + Poppins `<link rel="stylesheet">`
- New files:
  - `src/components/ui/EyebrowChip.tsx`
  - `src/components/ui/SectionHeader.tsx`
  - `src/components/ui/SoftCard.tsx`
  - Extend `src/lib/design-tokens.ts` with `BRAND`, class string constants
- Light-mode only for these public pages (the new system is light-first); `.dark` overrides on these pages will not be authored. Admin/portal areas keep their existing dark theme.

---

## 5. QA checklist after migration

- Every migrated page on white background, no purple radial wash
- Headings render in Poppins (verify in DevTools)
- All primary CTAs are indigo `#412A86` rounded-full pills
- All cards are `rounded-3xl` with hairline border + soft shadow + lift on hover
- Eyebrow chips present and color-rotated section to section
- No `glass`, `glass-card`, `aurora-*` classes remain on the listed pages (grep)
- Lighthouse contrast still passes for `text-gray-500` on white (≥ 4.5:1) — verify and bump to `text-gray-600` where needed
- Mobile: hero stacks, cards single-column, pill buttons remain tappable (`h-12+`)
- Blog prose still readable with new heading font; code blocks unaffected
