-- Enable RLS on demo_schedule_settings table
ALTER TABLE public.demo_schedule_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public) to READ schedule settings for the BookDemo page
CREATE POLICY "Anyone can read demo schedule settings"
ON public.demo_schedule_settings FOR SELECT USING (true);

-- Allow superadmins to INSERT schedule settings
CREATE POLICY "Superadmins can insert demo schedule settings"
ON public.demo_schedule_settings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- Allow superadmins to UPDATE schedule settings
CREATE POLICY "Superadmins can update demo schedule settings"
ON public.demo_schedule_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- Allow superadmins to DELETE schedule settings
CREATE POLICY "Superadmins can delete demo schedule settings"
ON public.demo_schedule_settings FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));
