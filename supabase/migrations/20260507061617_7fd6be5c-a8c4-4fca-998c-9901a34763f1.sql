
CREATE TABLE public.demo_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  country_code text NOT NULL,
  whatsapp_number text NOT NULL,
  email text,
  booking_date date NOT NULL,
  booking_time text NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  notes text,
  status text NOT NULL DEFAULT 'confirmed',
  utm jsonb DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX demo_bookings_slot_unique
  ON public.demo_bookings (booking_date, booking_time)
  WHERE status <> 'cancelled';

CREATE INDEX demo_bookings_date_idx ON public.demo_bookings (booking_date);

ALTER TABLE public.demo_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create demo booking"
  ON public.demo_bookings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read non-cancelled slots"
  ON public.demo_bookings FOR SELECT
  TO public
  USING (status <> 'cancelled');

CREATE POLICY "Superadmins can manage demo bookings"
  ON public.demo_bookings FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE TRIGGER update_demo_bookings_updated_at
  BEFORE UPDATE ON public.demo_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
