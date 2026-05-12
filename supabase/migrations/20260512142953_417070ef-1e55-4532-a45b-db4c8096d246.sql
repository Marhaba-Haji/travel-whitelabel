ALTER TABLE public.demo_bookings 
  ADD COLUMN IF NOT EXISTS google_event_id text,
  ADD COLUMN IF NOT EXISTS meet_link text,
  ADD COLUMN IF NOT EXISTS notifications_sent_at timestamptz;