## Goal

Introduce a Monthly billing option alongside the existing Annual plans, re-price everything, and wire the new pricing through every surface — pricing section, signup, order summary, payment, and the admin Pricing tab — without breaking the design system.

## New Pricing

| Plan      | Monthly   | Annual (new) | Annual (old) |
|-----------|-----------|--------------|--------------|
| Launch    | ₹2,999/mo | ₹19,999/yr   | ₹24,999      |
| Growth    | ₹3,999/mo | ₹29,999/yr   | ₹29,999      |
| Authority | ₹4,999/mo | ₹39,999/yr   | ₹34,999      |

GST (18%) continues to apply on top of base price.

## UX Approach

- A single segmented **Monthly / Annual** toggle at the top of the pricing grid (and a smaller version at the top of the Signup plan selector). Annual is the default and shows a "Save ~XX%" chip computed automatically from the two prices.
- Plan cards smoothly swap price + suffix (`/month` vs `/year`) on toggle. Layout, typography, colors, spacing stay identical — only the price node animates (subtle fade).
- Signup carries the chosen cycle via `?plan=growth&cycle=monthly` URL param, and the OrderSummary, registration row, and PayU payload all reflect the cycle + amount.
- Admin **Pricing tab** gets a second column of inputs (Monthly base) next to the existing Annual base, plus an updated live preview showing both.

## Plan

### 1. Data layer — `site_settings.plans_pricing`

Extend the JSON shape (backwards-compatible, defaults fill missing keys):
```json
{
  "launch": 19999, "growth": 29999, "authority": 39999,
  "launch_monthly": 2999, "growth_monthly": 3999, "authority_monthly": 4999,
  "gst_percent": 18, "currency": "INR"
}
```
Update the existing `plans_pricing` row via an insert tool call (data update, no schema migration needed). Defaults in `usePlans.ts` and `PricingTab.tsx` updated to match.

### 2. `src/hooks/usePlans.ts`

- Add `BillingCycle = "monthly" | "annual"` type and `monthly` price on each plan in the returned `plans` array.
- Helpers: `priceFor(planKey, cycle)`, `formatted(planKey, cycle)`, `annualSavingsPercent(planKey)` (computed from monthly*12 vs annual).

### 3. Pricing section — `src/components/landing/Pricing.tsx`

- Add a `billingCycle` state + segmented toggle (reuse existing rounded-pill styling, `bg-[#FAFAFC]` track, `#412A86` active pill). Annual pill shows the "Save XX%" micro-chip.
- `PlanCard` receives `cycle` and renders `/month` or `/year` suffix; price swaps with a 150ms fade.
- CTA link becomes `/signup?plan=<key>&cycle=<cycle>`.
- "Why Growth / Why Authority" persuasion blocks recompute deltas from the active cycle.

### 4. Signup page + form

- `src/pages/Signup.tsx`: read `cycle` from URL params (default `annual`), pass to `SignupForm` + plan selector. Add a small Monthly/Annual segmented toggle above the plan list.
- `src/components/auth/SignupForm.tsx`: accept `billingCycle` + `planMonthlyPrice`. Use the cycle's base price for `planBasePrice` and pass `billingCycle` + `planName` (e.g. "Growth Plan — Monthly") to the edge function and to `OrderSummary`.
- `src/components/auth/OrderSummary.tsx`: show "Billing: Monthly" / "Annual" row and adjust the footer copy ("Monthly Subscription" vs "Annual Subscription").

### 5. Admin Pricing tab — `src/components/admin/PricingTab.tsx`

- Add three new inputs for monthly base prices. Save payload includes both yearly and monthly fields. Preview card shows both totals side by side with GST.

### 6. Edge function — `supabase/functions/create-payment/index.ts`

- Accept `billingCycle` in the body, persist it on the `registrations` row (`plan_name` already carries the label, so append "— Monthly"/"— Annual"). No schema change needed; PayU `productInfo` reflects the cycle.

### 7. QA pass

- Toggle on `/#pricing` swaps prices and CTA hrefs.
- Direct link `/signup?plan=launch&cycle=monthly` pre-selects correctly, OrderSummary shows ₹2,999 + 18% GST, PayU receives the right amount.
- Admin tab edits live-update the public pricing.

## Out of scope

- Recurring billing automation (PayU mandate/UPI autopay). Monthly plans will still be charged via PayU as a one-time charge with the monthly amount; recurring renewal automation is a separate effort. I will flag this with a small note in the admin tab.
