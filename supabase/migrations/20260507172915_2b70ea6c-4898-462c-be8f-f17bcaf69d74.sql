
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete partner logos" ON storage.objects;

CREATE POLICY "Public can view partner logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'partner-logos');

CREATE POLICY "Admins can upload partner logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'partner-logos' AND (
    public.has_role(auth.uid(), 'superadmin')
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Admins can update partner logos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'partner-logos' AND (
    public.has_role(auth.uid(), 'superadmin')
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Admins can delete partner logos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'partner-logos' AND (
    public.has_role(auth.uid(), 'superadmin')
    OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
);
