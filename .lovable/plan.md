
## Goal

A dedicated, high-conversion `/masterclass` landing page modeled after Be10x / Outskill / GrowthSchool style — long, single-column, scroll-driven, sticky CTA, countdown — to collect paid registrations (₹99) for a 2-hour webinar by **Harab Rasheed** on starting or scaling a global tourism business. All webinar details are admin-editable. Reuses the site's existing design tokens (indigo `#412A86`, violet `#B968C7`, Poppins) so it feels native to marhabadmc.com.

---

## Page structure (`/masterclass`)

Long-form, single-column, mobile-first. Each section spaced like the existing landing pages.

```text
[Sticky top bar]  Next session in 02d : 14h : 22m : 09s   [Register for ₹99]
─────────────────────────────────────────────────────────
HERO
  Eyebrow: LIVE MASTERCLASS · 2 HOURS · ENGLISH + HINDI
  H1:  Start or Scale a Global Tourism Business
       in the next 90 days
  Sub: Step-by-step blueprint from someone who runs an
       inbound + outbound DMC serving agents in 14+ countries.
  Date / Time pill · Duration pill · Seats-left pill (dynamic)
  [Register Now — ₹99]  ← opens inline form / scrolls to form
  Below CTA: tiny trust row (agents trained · countries · years)
─────────────────────────────────────────────────────────
WHO THIS IS FOR (two-column "Is this you?")
  Column A — "Absolutely new to the industry"
  Column B — "Already in travel, struggling to scale"
─────────────────────────────────────────────────────────
WHAT YOU WILL LEARN  (5–7 outcome bullets, icon + headline + 1 line)
─────────────────────────────────────────────────────────
WHY NOW  (industry stat block: India outbound projected $410B by 2030, etc.)
─────────────────────────────────────────────────────────
ABOUT YOUR HOST — Harab Rasheed
  Photo · Name · One-liner positioning
  Long bio (auto-pulled marketing copy — see below)
  Credibility chips (Founder MarhabaDMC, 14+ yrs in travel,
    served 1000+ agents, AI-first DMC, etc.)
─────────────────────────────────────────────────────────
AGENDA  (timed breakdown: 0:00–0:20 …, 0:20–0:50 …)
─────────────────────────────────────────────────────────
BONUSES  (3 cards: "Starter Toolkit PDF", "Supplier Contact Sheet",
          "1-on-1 30-min strategy call after webinar")
─────────────────────────────────────────────────────────
FAQ  (accordion — 6–8 Qs)
─────────────────────────────────────────────────────────
FINAL CTA BAND  (gradient indigo/violet, big register button, countdown repeat)
─────────────────────────────────────────────────────────
Footer (reuse existing <Footer />)

[Mobile sticky bottom bar]  ₹99 · Register → (always visible)
```

Design language reuses tokens from `src/lib/design-tokens.ts` (`BRAND`, `CARD_BASE`, `PRIMARY_BTN`), Poppins headings, indigo CTA, soft white cards with hairline borders. Countdown component already exists at `src/components/CountdownTimer.tsx`.

---

## Registration flow

1. User clicks **Register** → in-page modal (`<Dialog>`) with: Full name, Email, Phone (with dial-code picker — reuse `src/lib/dial-codes.ts`), Country (reuse `src/lib/countries.ts`).
2. On submit:
   - Insert row into `webinar_registrations` with `status = 'pending'`, attribution UTM (reuse `getAttribution()` / `getSessionId()` from `useSessionTracking`).
   - Call existing `create-payment` PayU edge function with amount from admin settings, `productinfo = 'Masterclass: <title>'`, success/failure URLs `/masterclass/success?reg=<id>` and `/masterclass/failed?reg=<id>`.
3. PayU redirects to existing `payu-callback` edge function → we extend it to handle `txn_type=webinar` and update the registration row to `status = 'paid'`, then redirect to `/masterclass/success?reg=<id>`.
4. On `payment_status = 'paid'`, the success page fires:
   - `send-transactional-email` (Lovable Email — new template `webinar-confirmation`) with date/time/join link/calendar `.ics` attachment-style link.
   - `send-whatsapp` (existing function) with a templated confirmation + join link.
5. Success page shows: "You're in", calendar buttons (Google/Apple/Outlook — reuse `src/lib/ics.ts`), WhatsApp group invite (optional admin field), and a "Add to home screen" prompt.

Idempotency: webhook updates use `txnid` as natural key; emails/WhatsApp guarded by `confirmation_sent_at` column so duplicates can't be sent on PayU retries.

---

## Admin editability

New tab in `/admin` → **Masterclass** (next to existing Hero Content tab). Edits a single-row settings table `webinar_settings`:

- `title`, `subtitle`, `host_name`, `host_bio_markdown`, `host_photo_url`
- `scheduled_at` (timestamptz), `duration_minutes`, `timezone`
- `price_inr` (default 99), `currency` (default INR), `is_free` (bool)
- `seats_total`, `seats_reserved_buffer` (controls "seats left" display)
- `learning_points` (jsonb array), `agenda` (jsonb array), `bonuses` (jsonb array), `faqs` (jsonb array), `who_for_beginner` (jsonb array of bullets), `who_for_scaler` (jsonb array of bullets)
- `join_url` (sent on confirmation), `whatsapp_group_url` (optional)
- `is_published` (bool — toggles `/masterclass` visibility; off shows a "Next session coming soon" placeholder)

Plus a sub-tab **Registrations** that lists `webinar_registrations` with filters (paid / pending / all), CSV export, and a manual "Resend confirmation" button per row.

---

## Email + WhatsApp

- Lovable Emails infrastructure: domain `notify.marhabadmc.com` is already configured for the project (existing email-using flows). We will scaffold the transactional email pipeline if not already present, then add a `webinar-confirmation` React Email template branded with indigo / violet / Poppins, including date in IST, join link, add-to-calendar link, host name, and "what to bring".
- WhatsApp: reuse existing `send-whatsapp` edge function (Twilio) with a short formatted message + join link. Validates E.164 phone before sending.

---

## Files / migrations (technical section)

**New migration**
- `public.webinar_settings` (single-row enforced via unique partial index `where singleton = true`), fields per above. GRANTs: `anon SELECT`, `authenticated SELECT/INSERT/UPDATE`, `service_role ALL`. RLS: public read when `is_published = true`; superadmin/edit-permission write via `has_admin_edit(auth.uid(), 'masterclass')`.
- `public.webinar_registrations` (`id`, `full_name`, `email`, `phone_e164`, `country_code`, `dial_code`, `utm` jsonb, `session_id`, `amount_inr`, `txnid`, `payu_mihpayid`, `status` enum `pending|paid|failed|refunded`, `confirmation_email_sent_at`, `confirmation_whatsapp_sent_at`, `created_at`, `updated_at`). GRANTs: `anon INSERT` (anonymous signups), `authenticated SELECT/INSERT`, `service_role ALL`. RLS: anyone can insert their own row; only admins can read; service role writes status updates.
- New `app_permission_module` value `'masterclass'` (or use existing pattern) for the admin tab gate.

**New routes** (`src/App.tsx`)
- `/masterclass` → `pages/Masterclass.tsx`
- `/masterclass/success` → `pages/MasterclassSuccess.tsx`
- `/masterclass/failed` → `pages/MasterclassFailed.tsx`

**New components** (under `src/components/masterclass/`)
- `MasterclassHero.tsx`, `WhoThisIsFor.tsx`, `LearningPoints.tsx`, `WhyNow.tsx`, `HostBio.tsx`, `Agenda.tsx`, `Bonuses.tsx`, `MasterclassFAQ.tsx`, `FinalCTA.tsx`, `RegisterDialog.tsx`, `StickyRegisterBar.tsx`, `TopCountdownBar.tsx`.

**New hooks**
- `useWebinarSettings.ts` (public read), `useManageWebinarSettings.ts` (admin write), `useWebinarRegistrations.ts` (admin list).

**Admin**
- `src/components/admin/MasterclassTab.tsx` (settings form + registrations subview), added to `src/pages/Admin.tsx` tab list and to `AdminLayout` sidebar.

**Edge functions**
- Extend `supabase/functions/payu-callback/index.ts` to branch on `txn_type=webinar` (encoded in `udf1`) and update `webinar_registrations` instead of subscriptions, then call `send-transactional-email` + `send-whatsapp`.
- Extend `supabase/functions/create-payment/index.ts` to accept a `purpose: 'webinar'` payload that pulls amount from `webinar_settings.price_inr` and passes `udf1='webinar'`, `udf2=<registration_id>`.
- New transactional template `supabase/functions/_shared/transactional-email-templates/webinar-confirmation.tsx` + register in `registry.ts`.

**SEO**
- `<SEOHead>` on `/masterclass` with India-localized OG, Event JSON-LD (`@type: Event`, `eventStatus`, `eventAttendanceMode: OnlineEventAttendanceMode`, `organizer`, `offers` with INR price and availability, `performer: Harab Rasheed`). Sitemap entry added.

**Sitemap & robots**
- Add `/masterclass` to `supabase/functions/sitemap/index.ts` static routes.

---

## Host marketing copy (seeded into `webinar_settings.host_bio_markdown`)

Pre-filled, admin-editable, drawn from existing About page + brand memory. Headline: *"Harab Rasheed — Founder, MarhabaDMC."* Bio bullets: 14+ years in inbound/outbound travel; built an AI-first DMC serving agents in 14+ countries; trained 1000+ travel agents; specializes in Hajj/Umrah, halal travel, and B2B portals; product builder behind voice AI, itinerary builder, and visa automation tools used by Indian travel businesses.

---

## Out of scope (will not build now)

- Recurring/weekly session scheduling UI (single upcoming session at a time; admin updates `scheduled_at` for the next one).
- Free webinar variant — `is_free` toggle is wired, but the free flow skips PayU and is a thin branch in `RegisterDialog`.
- Affiliate tracking, coupon codes (can add later via existing `coupons` infrastructure).
- Post-webinar replay gating.

---

## Open questions before build

1. **Email sender**: use Lovable Emails (recommended, already on `notify.marhabadmc.com`) or your existing Resend secret? I will default to Lovable Emails unless you say Resend.
2. **PayU mode**: keep `PAYU_MODE` as currently set (test vs production)? ₹99 needs production.
3. **Confirm permission module name**: add `'masterclass'` as a new RBAC module, or fold into an existing one like `'marketing'`?

If those are fine as defaulted (Lovable Emails, current PayU mode, new `'masterclass'` module), I'll proceed exactly as above.
