
## Book a Demo — Calendly-style Booking System

A modern public booking page at `/book-demo` where prospects can pick a date and time slot, enter their details, and confirm a 30-minute demo. All bookings are stored in Supabase and exposed in the admin dashboard.

### 1. Database (new migration)

Create `demo_bookings` table:

| column | type | notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| full_name | text NOT NULL | |
| country_code | text NOT NULL | e.g. "+91" |
| whatsapp_number | text NOT NULL | digits only |
| email | text NULL | optional |
| booking_date | date NOT NULL | |
| booking_time | text NOT NULL | "HH:mm" 24h |
| timezone | text NOT NULL DEFAULT 'Asia/Kolkata' | |
| notes | text NULL | optional message |
| status | text NOT NULL DEFAULT 'confirmed' | confirmed / cancelled / completed |
| utm | jsonb DEFAULT '{}' | |
| session_id | text NULL | |
| created_at, updated_at | timestamptz | |

Constraints / indexes:
- UNIQUE (booking_date, booking_time) — prevents double booking of the same slot
- index on booking_date
- updated_at trigger using existing `update_updated_at_column()`

RLS:
- Enable RLS
- INSERT for `public` with check `true`
- SELECT for authenticated where `has_role(auth.uid(), 'superadmin')`
- UPDATE for superadmin (status changes)

### 2. Public page `/book-demo`

Route added in `src/App.tsx` (lazy). Linked from Header desktop + mobile nav as a pill CTA "Book a Demo", and from Hero secondary CTA.

Layout (responsive, design-system compliant — white surfaces, indigo `#412A86` accents, violet highlights, Poppins headings, `SoftCard`, `EyebrowChip`, `rounded-3xl`, `shadow-soft`):

```text
[Hero band]
  Eyebrow: "Live Demo"
  H1: "See Marhaba DMC in action"
  Subheading + 4 trust badges (30 min, 1-on-1, free, no card)

[Two-column grid on lg, stacked on mobile]
  LEFT  (≈40%)  — "About this demo" SoftCard
    - Title, description
    - "What's covered" checklist (6 items: Portal walkthrough, Inventory & contracting, AI Sales Assistant, White-label setup, Pricing & GST, Q&A)
    - Host card (avatar, name, role)
    - Decorative travel imagery (skyline.svg / flight-path.svg already in /public/assets)

  RIGHT (≈60%) — Booking wizard SoftCard, 3 steps
    Step 1: Select Date
      - shadcn Calendar (mode="single", disable past + Sundays)
      - Timezone display
    Step 2: Select Time
      - Grid of time-slot pills (09:00 – 18:00, 30-min increments)
      - Greyed-out / disabled if already booked (queried from demo_bookings for that date)
      - Selected slot highlighted indigo
      - Back button
    Step 3: Your Details
      - Full Name (required)
      - Country code Select (reusing/extending COUNTRIES list with dial codes) + WhatsApp number (required, digits 6–15)
      - Email (optional, valid format if provided)
      - Notes (optional textarea)
      - Terms micro-text
      - "Confirm Booking" primary button
    Confirmation state
      - Success card with check icon, summary of date/time, "Add to calendar" .ics download, link back home

Validation: zod schema. Disable confirm button while submitting. Toast on success/error.

[Below grid]
  - Mini FAQ (3 items: rescheduling, recording, who should attend)
  - Footer reuse
```

### 3. Slot availability logic

- On date select, query `demo_bookings` where `booking_date = selected` and `status != 'cancelled'`, then filter the static slot list.
- On submit, rely on UNIQUE constraint as the source of truth; if Postgres returns a unique violation, show "This slot was just taken — please pick another" and bounce back to step 2.

### 4. Admin tab "Demo Bookings"

- New file `src/components/admin/DemoBookingsTab.tsx`
- Register in `tabComponents` in `src/pages/Admin.tsx` and `allTabs` in `AdminLayout.tsx` (icon: `CalendarCheck`)
- Permissions: superadmin always; others if `hasAccess('demo-bookings','view')` — same pattern as other tabs
- Features:
  - Stats strip: Total, Upcoming, This week, Cancelled
  - Filters: status, date range, search (name/email/phone)
  - Table: Date, Time, Name, WhatsApp (with country code), Email, Status badge, Notes, Created
  - Row actions: mark Completed, Cancel (UPDATE status), Open WhatsApp link (`https://wa.me/<code><number>`), Copy email
  - CSV export

### 5. Files

Create:
- `supabase/migrations/<ts>_demo_bookings.sql`
- `src/pages/BookDemo.tsx`
- `src/components/booking/BookingCalendar.tsx`
- `src/components/booking/TimeSlotPicker.tsx`
- `src/components/booking/BookingDetailsForm.tsx`
- `src/components/booking/BookingSuccess.tsx`
- `src/components/booking/DemoOverview.tsx`
- `src/lib/dial-codes.ts` (country + dial code list)
- `src/lib/ics.ts` (tiny ICS generator)
- `src/components/admin/DemoBookingsTab.tsx`

Modify:
- `src/App.tsx` — add lazy route `/book-demo`
- `src/components/landing/Header.tsx` — add "Book a Demo" CTA (desktop + mobile)
- `src/components/landing/Hero.tsx` — add secondary CTA linking to `/book-demo`
- `src/pages/Admin.tsx` — register new tab component
- `src/components/admin/AdminLayout.tsx` — add tab entry

### 6. Out of scope (can be added later if requested)

- Email/WhatsApp confirmation to the prospect (would need Resend/Twilio edge-function trigger)
- Admin-configurable working hours / blackout dates
- Google Calendar sync
