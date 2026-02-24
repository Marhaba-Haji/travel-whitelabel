

## Plan: Fix GST Calculation, Plan-Level Coupons, and Messaging Updates

This plan addresses 4 distinct issues:

---

### 1. Fix GST Not Applied in Payment Calculation

**Root Cause:** The `create-payment` edge function reads GST from `site_settings` key `"pricing"` (the old single-plan row), but the admin CMS saves GST under the key `"plans_pricing"`. Both rows exist in the database, but the edge function looks at the wrong one.

**Fix:**
- Update `supabase/functions/create-payment/index.ts` to read GST from `plans_pricing` instead of `pricing`
- Also update `src/components/landing/StickyCTA.tsx` which still uses the old `usePricing` hook -- switch it to `usePlans`

---

### 2. Plan-Level Coupons

Currently coupons apply globally to any plan. The request is to restrict a coupon to specific plans (e.g., a bigger discount only for the Growth plan).

**Database Change:**
- Add an `applicable_plans` column (type `text[]`, nullable, default `NULL`) to the `coupons` table
- `NULL` means the coupon works for all plans (backward compatible)
- A value like `{"growth", "authority"}` restricts it to those plans only

**Code Changes:**
- **Admin CouponsTab** -- add a multi-select for applicable plans (Launch, Growth, Authority) when creating a coupon; show the selected plans in the table
- **`validate-coupon` edge function** -- accept `planKey` in the request body and check the coupon's `applicable_plans` against it; reject if the plan isn't eligible
- **`create-payment` edge function** -- pass `planName` when validating the coupon internally, and check `applicable_plans`
- **`SignupForm.tsx`** -- send the selected `planKey` when calling `validate-coupon` so the backend can verify eligibility
- **`OrderSummary`** -- no changes needed (already receives discount data)

---

### 3. Update "Earn 50,000+ Monthly" Messaging

The phrase "Earn 50,000+ Monthly" sounds like a guaranteed income. Update to potential-focused language.

**Files to update:**
- `src/components/landing/Hero.tsx`:
  - `rotatingBenefits` array: Change `"Earn ₹50,000+ Monthly"` to `"Earning Potential: ₹50,000+/mo"`
  - Floating metric card: Change "Avg. Monthly Earning" / "₹50,000+" to "Earning Potential" / "₹50,000+/mo"
- `src/pages/Login.tsx`:
  - Trust indicator: Change `"Earn 50,000 per month on average"` to `"Earning potential of ₹50,000+/month"`

---

### 4. Update "Travel the World for Free" Messaging

This implies free travel which is misleading. The actual benefit is discounted travel rates and more travel opportunities.

**File to update:**
- `src/components/landing/Hero.tsx`:
  - `rotatingBenefits` array: Change `"Travel the World for Free"` to `"Travel at Insider Rates"`
  - Benefit card for "Travel the World": Update description from "Top agents get sponsored trips" to "Access exclusive rates and more travel opportunities"

---

### Technical Summary of All Changes

| File | Change |
|------|--------|
| `supabase/functions/create-payment/index.ts` | Read GST from `plans_pricing` key instead of `pricing` |
| `supabase/functions/validate-coupon/index.ts` | Accept `planKey`, check `applicable_plans` column |
| `src/components/admin/CouponsTab.tsx` | Add plan-selection UI for coupon creation and display |
| `src/components/auth/SignupForm.tsx` | Pass `planKey` to validate-coupon call |
| `src/components/landing/Hero.tsx` | Update rotating benefits and benefit card text |
| `src/components/landing/StickyCTA.tsx` | Switch from `usePricing` to `usePlans` hook |
| `src/pages/Login.tsx` | Update trust indicator text |
| Database migration | Add `applicable_plans text[]` column to `coupons` table |

