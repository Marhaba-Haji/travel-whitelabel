# Demo Bookings: Overview Stats + Google Meet Auto-Provisioning + Notifications

## 1. Admin Overview — Demo Bookings summary

Add Demo Bookings cards to `src/components/admin/OverviewTab.tsx`:
- **Total demo bookings**
- **Upcoming** (booking_date >= today, status != cancelled)
- **Completed**
- **Cancelled**

Single query against `demo_bookings`, computed client-side. Uses existing `CalendarCheck` icon style.

## 2. Google Calendar + Meet integration

**Connector:** Use the Lovable `google_calendar` connector (gateway-based). This connects **your** Google account (harab.business@gmail.com) — not the customer's. Events are created on your calendar with the customer added as an attendee, which:
- Auto-generates a Google Meet link (via `conferenceData.createRequest`)
- Sends the calendar invite to the customer through Google
- Puts the event on your Google Calendar automatically (this is the "sync")

You'll need to click a Connect button when prompted to authorize Google Calendar.

### New Edge Function: `demo-booking-confirm`
Triggered after a booking is inserted. Steps:
1. Fetch booking row by id (service role).
2. Build start/end datetimes from `booking_date + booking_time + timezone` (30 min slots).
3. POST to `https://connector-gateway.lovable.dev/google_calendar/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all` with:
   - summary: "Marhaba DMC Demo — {full_name}"
   - description: notes + contact details
   - start/end with timezone
   - attendees: `[{ email: customer.email }, { email: "harab.business@gmail.com" }]`
   - `conferenceData.createRequest` with random `requestId` → returns `hangoutLink`
4. Persist `google_event_id` and `meet_link` back to `demo_bookings`.
5. Trigger transactional email (template `demo-booking-confirmation`) to customer **and** to `harab.business@gmail.com`.
6. Trigger WhatsApp (existing `send-whatsapp` function) to customer **and** to admin (+919008447887).

### DB migration
Add columns to `demo_bookings`:
- `google_event_id text`
- `meet_link text`
- `notifications_sent_at timestamptz`

## 3. Email template

Create React Email template `demo-booking-confirmation.tsx` under `supabase/functions/_shared/transactional-email-templates/`. Includes: greeting, date/time/timezone, Meet link button, reschedule contact info, brand styling matching existing emails. One template, sent to both customer and admin (admin version uses same content + "New booking" preview).

Requires Lovable Email infrastructure (`setup_email_infra` + `scaffold_transactional_email`) if not already in place. I'll detect and run the prerequisite step automatically.

## 4. WhatsApp message

Reuse `supabase/functions/send-whatsapp` (Twilio). New helper builds a plain-text template:
> "Hi {name}, your Marhaba DMC demo is confirmed for {date} at {time} ({tz}). Join here: {meet_link}"

Sent to `+{country_code}{whatsapp_number}` and to admin number `+919008447887`.

## 5. Trigger wiring

In `BookDemo.tsx` (the public booking page), after the existing `insert` succeeds, call:
```ts
supabase.functions.invoke('demo-booking-confirm', { body: { bookingId } })
```
Fail-soft: booking is still confirmed in UI even if notifications fail (errors logged).

## 6. Admin manual resend

Add a "Resend invite" action in `DemoBookingsTab` row menu that re-invokes `demo-booking-confirm` with `{ bookingId, resend: true }`.

## Files

**New**
- `supabase/functions/demo-booking-confirm/index.ts`
- `supabase/functions/_shared/transactional-email-templates/demo-booking-confirmation.tsx`
- Migration: add 3 columns to `demo_bookings`

**Edited**
- `src/components/admin/OverviewTab.tsx` — 4 new cards
- `src/pages/BookDemo.tsx` — invoke confirm function after insert
- `src/components/admin/DemoBookingsTab.tsx` — Resend action
- `_shared/transactional-email-templates/registry.ts` — register new template
- `supabase/config.toml` — `verify_jwt = false` for new function

## Prerequisites you'll be prompted to approve
1. Connect **Google Calendar** (one-click OAuth) — uses your account
2. Set up Lovable Email infrastructure (if not already done) for the demo confirmation email template
3. Approve the DB migration adding 3 columns
