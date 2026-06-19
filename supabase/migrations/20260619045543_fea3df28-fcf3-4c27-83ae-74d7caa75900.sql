GRANT INSERT ON public.demo_bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_bookings TO authenticated;
GRANT ALL ON public.demo_bookings TO service_role;