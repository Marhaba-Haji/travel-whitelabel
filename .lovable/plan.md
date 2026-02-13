

# Superadmin Dashboard - Complete Implementation Plan

## Overview

Build a secure superadmin dashboard accessible only to `harab.business@gmail.com` that provides full visibility and control over all site data, dynamic pricing, coupon management, and site contact details.

---

## Part 1: Database Schema Changes

### New Tables

**1. `site_settings`** - Stores dynamic site configuration (pricing, GST, contact details)

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| id | uuid | gen_random_uuid() | PK |
| key | text (unique) | - | Setting identifier |
| value | jsonb | - | Setting value |
| updated_at | timestamp | now() | Last modified |
| updated_by | text | null | Email of who changed it |

Pre-seeded keys:
- `pricing` -> `{ "base_price": 18799, "gst_percent": 0, "currency": "INR" }`
- `contact` -> `{ "whatsapp": "+919008447887", "phone": "+919008447887", "email": "hello@marhabadmc.com" }`

**2. `coupons`** - Discount coupon management

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| id | uuid | gen_random_uuid() | PK |
| code | text (unique) | - | Coupon code (uppercase) |
| discount_type | text | 'percentage' | 'percentage' or 'fixed' |
| discount_value | numeric | - | Amount or percent off |
| max_uses | integer | null | null = unlimited |
| times_used | integer | 0 | Current usage count |
| valid_from | timestamp | now() | Start validity |
| valid_until | timestamp | null | null = no expiry |
| is_active | boolean | true | Soft disable |
| created_at | timestamp | now() | - |
| updated_at | timestamp | now() | - |

**3. `app_role` enum + `user_roles` table** - Role-based access control

Following the security-definer pattern to avoid RLS recursion:
- Create `app_role` enum: `('superadmin', 'admin', 'user')`
- Create `user_roles` table with `user_id` (FK to auth.users) and `role`
- Create `has_role()` security definer function
- Assign `superadmin` role to `harab.business@gmail.com` after they sign up via Supabase Auth

### RLS Policies

- `site_settings`: Public SELECT (frontend needs pricing/contact), admin-only UPDATE
- `coupons`: Admin-only for all operations
- `user_roles`: Admin-only SELECT, no public access
- All existing tables (`contact_enquiries`, `newsletter_subscriptions`, `registrations`, `payments`, `payment_gateway_responses`): Add SELECT policy for admin users

---

## Part 2: Authentication Setup

Since there's no auth currently, we need to set up Supabase Auth:

1. **Admin login page** at `/admin/login` - simple email/password login using `supabase.auth.signInWithPassword()`
2. **Auth context provider** to manage session state across the app
3. **Protected route wrapper** that checks if the user has `superadmin` role
4. The superadmin account (`harab.business@gmail.com`) will need to be created via Supabase Auth (the migration will include a note about this)

---

## Part 3: Admin Dashboard UI

### Route: `/admin` (protected)

A sidebar-based dashboard layout with these tabs/sections:

**Tab 1: Overview**
- Summary cards: Total registrations, total payments, pending payments, contact enquiries count, newsletter subscribers count
- Quick stats at a glance

**Tab 2: Contact Enquiries**
- Table showing all entries from `contact_enquiries`
- Columns: Name, Email, Phone, Message (truncated), Status, Date
- Status badge (new/read/responded)
- Click to expand full message

**Tab 3: Newsletter Signups**
- Table of all `newsletter_subscriptions`
- Columns: Email, Subscribed At
- Count display

**Tab 4: Registrations**
- Table of all `registrations`
- Columns: Full Name, Email, Phone, City, Status, Created At
- Status filter (pending_payment, payment_completed, active, etc.)
- Highlight rows where status is still `pending_payment` (abandoned signups)

**Tab 5: Payments**
- Table of all `payments` joined with registration info
- Columns: Txn ID, Name (from registration), Amount, Status, Payment Mode, Date
- Status badges (initiated/success/failed)
- Filter for "Abandoned" = status is `initiated` (started but never completed)

**Tab 6: Pricing & GST**
- Current base price display with edit field
- GST percentage field
- Live preview: "Base: 18,799 + GST 18% = 22,182.82 (Total charged)"
- Save button updates `site_settings`

**Tab 7: Coupons**
- Table of all coupons with status
- Create new coupon form: code, discount type, value, max uses, valid until
- Toggle active/inactive
- Usage count display

**Tab 8: Site Settings**
- WhatsApp number
- Phone number
- Email address
- Save updates `site_settings`

---

## Part 4: Dynamic Data Integration

### Frontend reads from `site_settings`:

1. **Pricing**: The signup page, pricing section, and SignupForm will fetch the current price from `site_settings` instead of using hardcoded `18799`
2. **Contact details**: Footer, FloatingWhatsApp, and About page will read WhatsApp/phone/email from `site_settings`
3. **Coupon validation**: Add a coupon code field to the SignupForm. An edge function validates the coupon and returns the discounted price

### Edge Function: `validate-coupon`
- Accepts coupon code
- Checks validity (active, not expired, under max uses)
- Returns discount details
- Increments `times_used` on successful payment

### Server-side (server/index.js) changes:
- The `create-payment` endpoint will read the current price from `site_settings` instead of hardcoded `18799.00`
- Apply coupon discount if a valid coupon code is provided
- Calculate GST and pass total to PayU

---

## Part 5: Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Supabase auth session provider |
| `src/components/admin/AdminLayout.tsx` | Sidebar layout for admin |
| `src/components/admin/OverviewTab.tsx` | Dashboard overview with stats |
| `src/components/admin/ContactEnquiriesTab.tsx` | Contact form entries table |
| `src/components/admin/NewsletterTab.tsx` | Newsletter subscribers table |
| `src/components/admin/RegistrationsTab.tsx` | Registrations table |
| `src/components/admin/PaymentsTab.tsx` | Payments table with abandoned filter |
| `src/components/admin/PricingTab.tsx` | Dynamic pricing + GST control |
| `src/components/admin/CouponsTab.tsx` | Coupon CRUD |
| `src/components/admin/SiteSettingsTab.tsx` | Contact details management |
| `src/components/admin/ProtectedRoute.tsx` | Auth + role guard |
| `src/pages/Admin.tsx` | Main admin page |
| `src/pages/AdminLogin.tsx` | Admin login page |
| `src/hooks/useSiteSettings.tsx` | Hook to fetch site_settings |
| `supabase/functions/validate-coupon/index.ts` | Coupon validation edge function |

## Part 6: Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/admin`, `/admin/login` routes, wrap with AuthProvider |
| `src/components/landing/Footer.tsx` | Read contact details from site_settings |
| `src/components/landing/FloatingWhatsApp.tsx` | Read WhatsApp number from site_settings |
| `src/components/landing/Pricing.tsx` | Read price from site_settings |
| `src/pages/Signup.tsx` | Read price from site_settings |
| `src/components/auth/SignupForm.tsx` | Add coupon code field, read dynamic price |
| `server/index.js` | Read price + GST from site_settings, handle coupon in create-payment |
| `supabase/config.toml` | Add validate-coupon function config |

---

## Part 7: Security Considerations

1. **Server-side role check**: The `has_role()` security definer function ensures RLS policies work without recursion
2. **No client-side admin checks**: Admin status is verified via Supabase RLS, not localStorage
3. **Edge function JWT validation**: The validate-coupon function validates auth tokens server-side
4. **Superadmin setup**: After the migration, `harab.business@gmail.com` must sign up via Supabase Auth dashboard, then the role is assigned via a SQL insert into `user_roles`

---

## Implementation Order

1. Database migration (new tables, RLS, seed data)
2. Auth context and protected route components
3. Admin login page
4. Admin dashboard layout + all tabs
5. Site settings hook for frontend
6. Update frontend components to use dynamic settings
7. Coupon validation edge function
8. Update server/index.js for dynamic pricing
9. Testing

