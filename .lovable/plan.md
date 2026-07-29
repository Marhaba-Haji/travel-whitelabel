## Overview

Restructure pricing: Authority becomes annual-only, add a one-time **Brand Setup Pack** (₹14,999) and surface the existing **Social Media Management** (₹5,000/mo) add-on, reword plan sub-headlines, and consolidate every hardcoded price into one source of truth.

Prices stay the same on Launch and Growth; only the Authority-monthly slot and the add-ons are new. Base plan prices already flow through the admin-editable `site_settings.plans_pricing` row — that stays. Add-ons live in a new shared constants file that every component reads from.

## New source of truth

Create `src/lib/pricing.ts` exporting:

- `PLAN_DEFAULTS` — the fallback plan base prices (replaces the two duplicate `DEFAULTS` blocks in `usePlans.ts` and `admin/PricingTab.tsx`).
- `PLAN_META` — plan positioning: name, sub-headline (the new copy), badge, extras list, key.
- `AUTHORITY_ANNUAL_ONLY = true`.
- `ADDONS.brandSetupPack` — `{ price: 14999, name, tagline, includes: string[], eligibility copy }`.
- `ADDONS.socialMediaManagement` — `{ price: 5000, cycle: "monthly", eligibility copy }`.
- `BRAND_SETUP_INCLUDES` — the 7-item list (Logo w/ 2 revisions, GBP, LinkedIn, Instagram, Facebook, X, Social Banners).
- Helper `authorityBundleSavings(pricing)` = `pricing.growth + 14999 − pricing.authority` (renders as `₹4,999`).

`usePlans.ts` and `admin/PricingTab.tsx` both import `PLAN_DEFAULTS` from this file instead of redefining it.

## Change 1 — Authority annual-only

`src/hooks/usePlans.ts`:
- `priceFor("authority", "monthly")` returns `null` (typed `number | null`).
- `annualSavingsPercent("authority")` returns `0`.
- Remove `authority_monthly` from the `PlanPricingData` interface's required set (keep it optional for backwards compat with existing DB row, but stop reading/writing it).

`src/components/landing/Pricing.tsx` — the Authority card gets a monthly-mode branch:
- When `cycle === "monthly"`: render an "Annual plan only" pill, price `₹39,999/year`, sub-line "Billed annually + 18% GST", and the primary button becomes "Switch to annual" (calls `setCycle("annual")`). Card stays visually equivalent — same size, same border, same feature list — so the grid stays balanced on mobile.
- When `cycle === "annual"`: unchanged, plus the new savings line (Change 3).
- Remove `authorityPrice` from the monthly-mode "Why Authority Plan Wins Long-Term" delta text; render that block only in annual mode (or reword to reference the bundle savings instead of a per-cycle delta).

`src/pages/Signup.tsx` — the plan-picker column:
- If user URL-lands on `?plan=authority&cycle=monthly`, coerce `cycle` to `annual`.
- If user has Authority selected and toggles to Monthly, keep Authority visible but disabled (grayed radio, "Annual only" chip), and if they click it, snap the cycle back to annual with a subtle inline note.
- The `plans.map(...)` render checks `priceFor(plan.key, cycle)`; when `null`, show the annual price with the "Annual only" chip instead.

`src/components/admin/PricingTab.tsx` — remove the Authority Monthly input; leave a locked read-only "Annual only" cell so admins don't wonder where it went.

`supabase/functions/create-payment/index.ts` — server-side guardrail: if `planKey === "authority"` and `billingCycle === "monthly"`, force cycle to `annual` before pricing. The existing `fallbackPrices.authority_monthly` entry is deleted; monthly Authority never gets a price.

`src/pages/Index.tsx` structured-data — Authority `productOfferSchema` stays (annual price), unchanged.

## Change 2 — Brand Setup Pack (new add-on)

New component `src/components/landing/BrandSetupPack.tsx`:
- Renders directly below the three plan cards in `Pricing.tsx`.
- Visually distinct: full-width band on a subtle indigo tint, rounded-3xl, "Add-on" eyebrow badge, `₹14,999 one-time + 18% GST`.
- 7-item includes list from `BRAND_SETUP_INCLUDES`.
- Three-line justification block (given the ₹14,999 vs freelancer-₹5,000 gap):
  1. Google Business Profile verification handled end-to-end.
  2. Five business profiles (GBP, LinkedIn, Instagram, Facebook, X) created, configured and cross-linked.
  3. **Full credential handover — every account is yours, in your name, with your passwords.** (bold, own line.)
- Eligibility line: "Available to Launch and Growth on any billing cycle. Included free with Authority annual."
- CTA: **Add to any plan** → `/signup?addon=brand-setup`.

`src/pages/Signup.tsx` — add an "Add-ons" section below the plan picker:
- Brand Setup Pack card with a checkbox (auto-checked and locked when selectedPlanKey === "authority" && cycle === "annual", with label "Included free").
- Read `?addon=brand-setup` from the URL to pre-check it.
- `OrderSummary` gets a new optional `addOns: { name, price }[]` prop; each add-on is shown as its own line item and rolled into subtotal + GST.
- Send `addOns` in the create-payment call.

`supabase/functions/create-payment/index.ts` — accept `addOns` in body, validate against a server-side allowlist (`brand-setup: 14999`, `social-media-management: 5000`), and add them to `total` before hashing.

Note: no DB schema migration in this change — the add-on prices live in `src/lib/pricing.ts` so the server function and the client read the same constants. (Server dupes the allowlist since it can't import from `src/`; both cite the constants file in a comment as the source of truth.)

## Change 3 — Authority value framing

In `Pricing.tsx`, Authority card (annual mode only), inside the summary list, add a highlighted mini-block:

> **Includes Brand Setup Pack (worth ₹14,999)** — Growth + Brand Setup Pack bought separately would cost ₹44,998. You save ₹4,999.

Numbers come from `authorityBundleSavings()` so they stay in sync if base prices change.

Hidden in monthly mode since Authority isn't shown as monthly there anyway.

## Change 4 — Social Media Management add-on

Rendered in `BrandSetupPack.tsx` as a smaller secondary card directly beneath the pack:
- Title: "Social Media Management"
- Price: `₹5,000/month + 18% GST`
- One-line description clarifying it is **ongoing management** (posting, engagement, reporting) — distinct from the one-time Brand Setup Pack.
- Eligibility: "Available to Growth and Authority customers, and to Launch customers who have purchased the Brand Setup Pack."
- CTA: "Talk to us" → WhatsApp (uses `useContactSettings().whatsappUrl`) — no self-serve checkout since it's an ongoing service.

## Change 5 — Plan sub-headlines

New copy piped through `PLAN_META`:

- **Launch** — "For agencies that already have a brand and customers, and need the technology."
- **Growth** — "For established agencies ready to automate enquiries and sell through sub-agents."
- **Authority** — "For new entrants who need the brand, the presence and the platform together."

Rendered as a single line under the plan name on both `Pricing.tsx` (plan cards) and `Signup.tsx` (plan-picker rows). Replaces / augments the existing "15 core modules…" copy — that line moves into the details accordion.

## Structured data + SEO

`src/pages/Index.tsx`:
- Keep the three plan `productOfferSchema` entries with annual prices (authority already annual-only in schema).
- Add a fourth: `productOfferSchema("Brand Setup Pack", "One-time brand setup: logo, GBP, and 5 business profiles.", "14999")`.
- Do NOT emit a monthly Authority offer.

`src/components/seo/SEOHead.tsx` — no change (schemas are page-owned).

## Files that will be modified

| File | Reason |
|---|---|
| `src/lib/pricing.ts` (new) | Single source of truth — defaults, add-ons, includes list, sub-headlines |
| `src/hooks/usePlans.ts` | `priceFor("authority","monthly")` returns null; import defaults from `pricing.ts`; expose add-ons + sub-headlines |
| `src/components/landing/Pricing.tsx` | Authority monthly-only state, savings line, wire sub-headlines |
| `src/components/landing/BrandSetupPack.tsx` (new) | Brand Setup Pack card + Social Media Management sub-card |
| `src/components/landing/BillingCycleToggle.tsx` | No change (already accepts controlled value) |
| `src/pages/Signup.tsx` | Sub-headlines, Authority annual coercion, add-on checkbox, `?addon=` param |
| `src/components/auth/SignupForm.tsx` | Pass `addOns` to create-payment |
| `src/components/auth/OrderSummary.tsx` | Render add-on line items, roll into GST + subtotal |
| `src/components/admin/PricingTab.tsx` | Remove Authority monthly input; import defaults from `pricing.ts` |
| `src/pages/Index.tsx` | Add Brand Setup Pack `productOfferSchema` |
| `supabase/functions/create-payment/index.ts` | Force Authority→annual; validate `addOns` allowlist; add to total |

## Locations where a price will appear after the change

1. `src/components/landing/Pricing.tsx` — three plan cards (Launch/Growth/Authority) + Authority savings line + Brand Setup Pack + Social Media Management + persuasion delta block.
2. `src/pages/Signup.tsx` — plan-picker rows (all three) + add-on rows + `SEOHead` `noIndex` (no price in metadata).
3. `src/components/auth/OrderSummary.tsx` — subtotal + GST + total + per-line add-ons.
4. `src/components/admin/PricingTab.tsx` — editable base prices + live preview cards.
5. `src/pages/Index.tsx` — JSON-LD `productOfferSchema` × 4 (three plans + Brand Setup Pack).
6. `supabase/functions/create-payment/index.ts` — fallback price table + add-on allowlist (with a comment pointing at `src/lib/pricing.ts`).

All numeric prices in components read from `usePlans()` (plans) or `pricing.ts` constants (add-ons). No literal price strings remain in JSX.

## Out of scope / no change

- `home_faqs`, blog posts, meta descriptions — none reference specific plan prices today (verified via grep of `19999|29999|39999`); nothing to update.
- `usePricing.ts` (legacy single-plan hook) — unused by pricing UI; left alone.
- Recurring auto-renewal for monthly plans — still a separate future setup, per the existing admin note.