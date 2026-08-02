# Track Meta "Lead" events on the 3 conversion points

Goal: fire Meta's `Lead` event when a visitor completes any of the three actions that count as a lead, so Meta can attribute them back to ad campaigns.

## What counts as a Lead

1. Contact page — message successfully saved (form submit succeeds).
2. Book a demo — booking confirmed and the confirmation step is shown.
3. Signup — the signup form is filled and "Review order" is clicked.

## Approach

Instead of pasting a raw `<script>fbq('track','Lead')</script>` tag into the HTML (which would fire on every page load, not on the action), the same call is triggered from the app code at the exact moment each action succeeds. This is the correct way to do it in a React site and gives accurate campaign attribution.

The Meta Pixel base code already loads on the site through the Google Tag Manager container, so the `fbq` function is available globally. A tiny helper will:

- check that `fbq` exists before calling it (no crash if the pixel is blocked or GTM is still loading),
- fire `fbq('track', 'Lead', {...})` with a content name so the three sources are distinguishable in Meta (e.g. `contact_form`, `demo_booking`, `signup_review_order`),
- generate a unique `eventID` per fire, so if Conversions API is added later the browser and server events de-duplicate correctly,
- also push the same event to `dataLayer`, so a GTM trigger can be used later without code changes.

## Technical details

New file: `src/lib/meta-pixel.ts`
- exports `trackLead(source: string, params?)`
- guards `typeof window !== "undefined" && typeof window.fbq === "function"`
- generates `eventID` via `crypto.randomUUID()`
- pushes `{ event: "lead", lead_source, event_id }` to `window.dataLayer`

Call sites:
- `src/pages/Contact.tsx` — after the `contact_enquiries` insert returns without error (right before the success toast).
- `src/pages/BookDemo.tsx` — after the `demo_bookings` insert succeeds and the flow advances to the confirmation step (step 4), fired once.
- `src/components/auth/SignupForm.tsx` — at the start of a successful `onSubmit` (validation passed, "Review order" clicked).

No changes to pricing, payment, or database logic. No new dependencies.

## Verification

After the change, use Meta Pixel Helper (or Events Manager → Test Events) and run each of the three flows; each should produce exactly one `Lead` event with the matching `lead_source`.
