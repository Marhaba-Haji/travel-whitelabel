
# Pricing Section Redesign — 3-Tier Subscription Model

## Scope

Full rewrite of `src/components/landing/Pricing.tsx`. No backend changes, no route changes, no other files modified.

---

## New Section Architecture (top to bottom)

```text
1. Section Header
   └── Badge + H2 + description + supporting line

2. Core Infrastructure Block
   └── Icon grid — 15 features shared by all plans

3. Three-Plan Comparison Grid (3 columns)
   ├── Launch Plan    — ₹24,999  (neutral)
   ├── Growth Plan    — ₹29,999  (highlighted, "Most Popular" badge)
   └── Authority Plan — ₹34,999  (subtle "Complete Brand Setup" tag)

4. Persuasion Blocks (2 short text blocks)
   ├── "Why Most Choose Growth Plan"
   └── "Why Authority Plan Wins Long-Term"

5. CTA Section
   └── "Get Started Now" + "Talk to Our Team" buttons

6. Trust Bar
   └── SSL Secured · No Hidden Fees · Secure Payments (retained from current)
```

---

## Detailed Implementation

### 1. Section Header

- Badge text: `"Subscription Plans"`
- H2: `"Launch Your Own Travel Business — With Real Infrastructure"`
- Paragraph: `"MarhabaDMC provides the complete operating layer for halal travel businesses — from global APIs and contracted rates to structured destination management and distribution tools."`
- Supporting line (smaller, muted): `"Every plan includes our core travel infrastructure. You simply decide how far you want to scale."`

---

### 2. Core Infrastructure Block

Title: `"Core Infrastructure — Included in All Plans"`

Displayed as a **responsive 3-column icon grid** (collapses to 2-col on mobile). Each item has a small `Check` icon in primary blue and label text.

15 items:
- Flight API
- Hotel API
- Visa API
- Activities API
- Hajj Packages
- Umrah Packages
- Holiday Packages
- Car Transport at Destination
- Guide Module
- Group Flights Module
- Contracted Rates Access
- Admin Portal
- B2C Direct Booking Website
- Halal Travel Content Library
- Add Your Own Content

Visual treatment: neutral `bg-card` container with a `border-border` border, slightly separated from the plan cards below with a horizontal rule or spacing.

---

### 3. Three-Plan Comparison Grid

**Grid**: `grid-cols-1 md:grid-cols-3` with `gap-6`, `max-w-5xl mx-auto`

#### Plan Cards — shared structure per card:
```
[ Plan Name ]
[ Price + /year ]
[ Divider ]
[ Feature list ]
[ CTA Button ]
```

#### Launch Plan — ₹24,999
- Neutral card: standard `bg-card border-border`
- No badge
- Feature list: "All Core Infrastructure" (listed individually with Check icons)
- Button: outline variant → `/signup`

#### Growth Plan — ₹29,999 (Most Popular)
- Elevated card: `border-2 border-primary shadow-2xl` with a subtle `shadow-primary/20`
- Badge positioned above card: `"Most Popular"` in primary blue
- Scale up slightly: `scale-[1.03]` on desktop so it visually protrudes
- Feature list: Everything in Launch + AI Sales Enquiry Handling Agent, Supplier Portal, B2B Sub-Agent Portal, Free .in Domain (1 Year)
- Button: filled primary variant → `/signup`

#### Authority Plan — ₹34,999
- Neutral-plus card: `bg-card border-border` with a subtle `border-foreground/20`
- Small tag: `"Complete Brand Setup"` as a secondary badge
- Feature list: Everything in Growth + Google Business Profile Setup, LinkedIn Business Page Setup, Instagram Business Setup, Facebook Business Setup, X Page Setup, Professional Logo Design, Social Media Banners
- Button: outline variant → `/signup`

**Feature list rendering**: Each plan shows its exclusive additions in a distinct sub-section ("Also Includes:" heading in small muted text), keeping the list scannable without repeating all core items.

---

### 4. Persuasion Blocks

Two side-by-side cards (stack on mobile) below the comparison grid:

**Block 1 — "Why Most Choose Growth Plan"**
- Icon: `TrendingUp`
- Text: "For just ₹5,000 more than Launch, you unlock AI automation, supplier control, agent distribution, and free domain — making it the smart scaling choice."

**Block 2 — "Why Authority Plan Wins Long-Term"**
- Icon: `Star`
- Text: "For another ₹5,000, you receive complete brand presence — logo, social media setup, and Google visibility structured from day one."

Styled as `bg-card border border-border rounded-2xl p-6` with a left accent border in primary blue.

---

### 5. CTA Section

Centered block below persuasion cards:

- H3: `"Ready to Build Your Travel Business?"`
- Two buttons side by side:
  - Primary filled: `"Get Started Now"` → `/signup`
  - Outline: `"Talk to Our Team"` → links to `whatsappUrl` from `useContactSettings`

---

### 6. Trust Bar

Retained from current design:
- SSL Secured · No Hidden Fees · Secure Payments
- Payment method icons (VISA, Mastercard circles, UPI)

---

## Hooks Retained

- `useScrollAnimation` — for fade-in on scroll
- `useContactSettings` — for WhatsApp URL on "Talk to Our Team" button
- Remove `usePricing` — prices are now hardcoded per plan (₹24,999 / ₹29,999 / ₹34,999) as specified; the dynamic pricing hook is no longer needed in this section
- Remove `CountdownTimer`, `InvestmentCalculator`, `AnimatedCounter` — not part of the new design

---

## Mobile Behavior

- Core infrastructure grid: 2 columns on mobile
- Plan cards: stack vertically (`grid-cols-1` → `md:grid-cols-3`)
- Growth Plan remains visually highlighted in the stacked order (placed second / center)
- Persuasion blocks: stack vertically on mobile
- CTA buttons: stack vertically on mobile

---

## Tone / Style Constraints Applied

- No emojis anywhere in the component
- No hype language ("life-changing", "only 23 spots left", countdown timer removed)
- No coffee/coffee-price comparisons
- Corporate, infrastructure-focused language throughout
- Existing CSS variables respected (`--primary`, `--foreground`, `--muted-foreground`, `--border`, `--card`)
- Global theme colors unchanged

---

## File Changed

| File | Change |
|------|--------|
| `src/components/landing/Pricing.tsx` | Full rewrite with new 3-tier layout |
