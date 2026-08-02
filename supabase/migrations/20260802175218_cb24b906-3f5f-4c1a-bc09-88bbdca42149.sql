-- demo_bookings: restrict what anonymous/public inserts may set
DROP POLICY IF EXISTS "Anyone can create demo booking" ON public.demo_bookings;

CREATE POLICY "Anyone can create demo booking"
ON public.demo_bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'confirmed'
  AND google_event_id IS NULL
  AND meet_link IS NULL
  AND notifications_sent_at IS NULL
);

-- webinar_registrations: block forging payment state on public inserts
DROP POLICY IF EXISTS "Anyone can register for webinar" ON public.webinar_registrations;

CREATE POLICY "Anyone can register for webinar"
ON public.webinar_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND txnid IS NULL
  AND payu_mihpayid IS NULL
  AND amount_inr = 0
  AND confirmation_email_sent_at IS NULL
  AND confirmation_whatsapp_sent_at IS NULL
);