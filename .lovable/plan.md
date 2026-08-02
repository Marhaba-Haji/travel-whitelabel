# Track Meta "Lead" events on the 3 conversion points

Goal: fire Meta's `Lead` event when a visitor completes any of the three actions that count as a lead, so Meta can attribute them back to ad campaigns.

## What counts as a Lead

1. Contact page — message successfully saved (form submit succeeds).
2. Book a demo — booking confirmed and the confirmation step is shown.
3. Signup — the signup form is filled and "Review order" is clicked.

## Approach

Instead of pasting a raw `<script>fbq('track','Lead')</script>` tag into the HTML (which would fire on every page load, not on the action), the same call is triggered from the app code at the exact moment each action succeeds. This is the correct way to do it in a React site and gives accurate campaign attribution.

### Base code (from the Meta email)

The email asks for the pixel base code (pixel ID **1349063087083648**) in the `<head>` of every page. That pixel is already loading through the Google Tag Manager container (live requests on the site carry `fb.pixel_id: 1349063087083648`), so the base code must **not** be pasted again — a second `fbq('init')` would double-count PageViews. The one missing piece from the email is the `<noscript>` fallback image, which will be added through the Scripts & Tracking admin section as a `body_start` snippet so non-JS visitors are still counted.

Because the base code is already present, `fbq` is available globally. A tiny helper will fire the event code. It will:

- check that `fbq` exists before calling it (no crash if the pixel is blocked or GTM is still loading),
- fire `fbq('track', 'Lead', {...})` with a content name so the three sources are distinguishable in Meta (e.g. `contact_form`, `demo_booking`, `signup_review_order`),
- generate a unique `eventID` per fire, so if Conversions API is added later the browser and server events de-duplicate correctly,
- also push the same event to `dataLayer`, so a GTM trigger can be used later without code changes.

## Technical details

New file: `src/lib/meta-pixel.ts`
- exports `trackLead(source: string, params?)`
- guards `typeof window !== "undefined" && typeof window.fbq === "function"` (reuses the GTM-loaded pixel 1349063087083648, never calls `fbq('init')` again)
- generates `eventID` via `crypto.randomUUID()`
- pushes `{ event: "lead", lead_source, event_id }` to `window.dataLayer`

Call sites:
- `src/pages/Contact.tsx` — after the `contact_enquiries` insert returns without error (right before the success toast).
- `src/pages/BookDemo.tsx` — after the `demo_bookings` insert succeeds and the flow advances to the confirmation step (step 4), fired once.
- `src/components/auth/SignupForm.tsx` — at the start of a successful `onSubmit` (validation passed, "Review order" clicked).

Admin (no code): add the `<noscript>` pixel fallback from the Meta email as a `body_start` entry in Scripts & Tracking.

No changes to pricing, payment, or database logic. No new dependencies.

## Pixel base code check

Before wiring the events, confirm in the browser that exactly one `fbq` init exists for 1349063087083648 — GTM stays the single source. If a duplicate hardcoded base code turns up, it gets removed.

## Verification

After the change, use Meta Pixel Helper (or Events Manager → Test Events) and run each of the three flows; each should produce exactly one `Lead` event on pixel 1349063087083648 with the matching `lead_source`.
