-- Add social media links to site_settings
INSERT INTO public.site_settings (key, value) VALUES
  ('social', '{"facebook": "", "instagram": "", "linkedin": "", "x": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Allow superadmins to insert new site_settings (e.g. when adding new setting keys)
CREATE POLICY "Superadmins can insert site settings"
ON public.site_settings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
