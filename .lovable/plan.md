# Marhaba Haji — Group Umrah Landing Page (`/bangalore-umrah-package`)

A standalone, campaign-ready sales page for the Sept 2026 group Umrah, built for paid Meta/Google traffic. Scoped visual identity (Marhaba Haji sub-brand: deep green + gold on ivory) so nothing on the existing marhabaDMC B2B site changes.

## Page structure (top to bottom)

1. **Sticky top bar** — "Only 15 seats left" + live countdown to bookings closing **25 Aug 2026** + "Book Now" button.
2. **Hero** — Marhaba Haji brand mark, headline (14-day guided group Umrah, 2–16 Sept 2026), Saudi Airlines direct flight badge, price block: ~~₹1,07,000~~ **₹99,000** (quad/quint sharing, +5% GST, +2% TCS), trust chips (direct flight, 40kg baggage, 1-year multi-entry visa), dual CTA: "Enquire Now" + WhatsApp.
3. **Seats + urgency strip** — 15 seats left progress bar, countdown, and a "Groups of 10+ get an extra special discount" callout.
4. **At a glance** — icon cards: 14 days, 9 nights Makkah, 5 nights Madinah, Saudia direct, 40kg + 7kg, 3+ Umrah opportunities.
5. **Itinerary / stay** — Makkah: Rehab Al Taqwa, ~500m from Masjid al-Haram (9 days). Madinah: Hayah Salam Silver or similar, Markaziya, ~200m from Masjid an-Nabawi (5 days). Departure/return timeline.
6. **Room options & pricing table** — Quad/Quint ₹99,000 (sharing), Triple and Double shown as private rooms (price on request), with the GST/TCS note.
7. **Ziyarat programme** — Makkah, Madinah, Taif, Badr, Jorana, all expert-guided.
8. **Inclusions** — full list from the package (tickets, visa, insurance, accommodation, airport + intercity transfers, 3x buffet meals, ziyarats, Zamzam, laundry, guided experts).
9. **Exclusions** — standard list (Qurbani/Dam, personal expenses, shopping, extra meals outside buffet, passport fees, visa rejection costs, anything not in inclusions, GST 5% & TCS 2%).
10. **Secret bonus teaser** — "This group travels with a surprise guest: a well-known Bengaluru Muslim personality with 1.2M+ followers." Identity revealed to confirmed pilgrims only. No name or photo.
11. **Why Marhaba Haji** — Hajj & Umrah specialist arm of Marhaba Ventures Private Limited, small guided group, Haramain-close hotels.
12. **FAQ** — visa validity, room sharing rules, payment schedule, cancellation, baggage, mahram/ladies queries.
13. **Booking section (main conversion block)** — all three paths in one place:
    - Enquiry form (name, phone, city, travellers, room preference, message) saved to the database
    - WhatsApp button with a pre-filled message
    - "Pay booking amount" button (online advance payment)
14. **Footer** — Marhaba Ventures Private Limited, contact details, policy links.
15. **Floating mobile CTA bar** — Enquire / WhatsApp, visible on scroll.

## Booking amount payment

Reuses the existing PayU flow pattern: a dedicated edge function creates the payment request for a fixed advance (default ₹25,000, editable in code constants), records the lead and order ID, and redirects to a success page showing the order ID. Success/failure pages follow the same pattern already used for the masterclass.

## Data

New table `umrah_leads`: name, phone, email, city, travellers, room preference, message, source, status, order/payment fields, timestamps. Public insert only (field-restricted, no payment fields settable by the visitor), admin read via existing role check. New admin tab "Umrah Leads" listing enquiries and paid bookings.

## SEO

`SEOHead` with a campaign-specific title/description, canonical `https://marhabadmc.com/bangalore-umrah-package`, plus Product/Offer and FAQPage JSON-LD. Page stays indexable.

## Technical notes

- New route `/bangalore-umrah-package`, lazy-loaded in `App.tsx`.
- Package facts, price, seat count, deadline and advance amount live in one constants file (`src/lib/umrah-package.ts`) so nothing is hardcoded across components.
- Styles scoped under a `.mh-scope` class in `src/styles/marhaba-haji.css`, same isolation technique used for the masterclass page — zero impact on existing pages.
- Countdown targets **25 Aug 2026** and degrades gracefully to "Bookings closed" after expiry.
- Meta lead tracking reuses `trackLead()` with a new `umrah_enquiry` source so the campaign attributes conversions.
