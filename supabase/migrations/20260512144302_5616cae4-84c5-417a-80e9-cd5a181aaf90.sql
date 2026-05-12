-- 1) Block anonymous setting of password_hash on registrations.
--    Edge function (service role) bypasses RLS and can still set password_hash.
DROP POLICY IF EXISTS "Anyone can register" ON public.registrations;
CREATE POLICY "Anyone can register"
ON public.registrations
FOR INSERT
TO public
WITH CHECK (password_hash IS NULL);

-- 2) Helper: granular module access for admin sub-users
CREATE OR REPLACE FUNCTION public.has_admin_edit(_user_id uuid, _module text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    JOIN public.admin_user_permissions p ON p.admin_user_id = au.id
    WHERE au.user_id = _user_id
      AND au.is_active = true
      AND p.module = _module
      AND p.access_level = 'edit'
  );
$$;

-- 3) Tighten admin_users-based content write policies (drop privilege escalation paths)

-- partners
DROP POLICY IF EXISTS "Admins can read all partners" ON public.partners;
DROP POLICY IF EXISTS "Superadmins can delete partners" ON public.partners;
DROP POLICY IF EXISTS "Superadmins can insert partners" ON public.partners;
DROP POLICY IF EXISTS "Superadmins can update partners" ON public.partners;
CREATE POLICY "Admins can read all partners" ON public.partners FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'partners'));
CREATE POLICY "Admins can delete partners" ON public.partners FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'partners'));
CREATE POLICY "Admins can insert partners" ON public.partners FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'partners'));
CREATE POLICY "Admins can update partners" ON public.partners FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'partners'))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'partners'));

-- hero_images
DROP POLICY IF EXISTS "Admins can create hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Admins can delete hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Admins can read all hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Admins can update hero images" ON public.hero_images;
CREATE POLICY "Admins can create hero images" ON public.hero_images FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'hero-images'));
CREATE POLICY "Admins can delete hero images" ON public.hero_images FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'hero-images'));
CREATE POLICY "Admins can read all hero images" ON public.hero_images FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'hero-images'));
CREATE POLICY "Admins can update hero images" ON public.hero_images FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'hero-images'))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'hero-images'));

-- hero_content
DROP POLICY IF EXISTS "Admins can create hero content" ON public.hero_content;
DROP POLICY IF EXISTS "Admins can delete hero content" ON public.hero_content;
DROP POLICY IF EXISTS "Admins can read all hero content" ON public.hero_content;
DROP POLICY IF EXISTS "Admins can update hero content" ON public.hero_content;
CREATE POLICY "Admins can create hero content" ON public.hero_content FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'hero-content'));
CREATE POLICY "Admins can delete hero content" ON public.hero_content FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'hero-content'));
CREATE POLICY "Admins can read all hero content" ON public.hero_content FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'hero-content'));
CREATE POLICY "Admins can update hero content" ON public.hero_content FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'hero-content'))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'hero-content'));

-- testimonials
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'testimonials'))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'testimonials'));

-- home_faqs
DROP POLICY IF EXISTS "Admins can manage home FAQs" ON public.home_faqs;
CREATE POLICY "Admins can manage home FAQs" ON public.home_faqs FOR ALL TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'faqs'))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role) OR has_admin_edit(auth.uid(), 'faqs'));

-- 4) Storage object policies — restrict to superadmin or scoped admin edit
DROP POLICY IF EXISTS "Admins can delete partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload partner logos" ON storage.objects;
CREATE POLICY "Admins can delete partner logos" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'partner-logos' AND (has_role(auth.uid(),'superadmin'::app_role) OR has_admin_edit(auth.uid(),'partners')));
CREATE POLICY "Admins can update partner logos" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'partner-logos' AND (has_role(auth.uid(),'superadmin'::app_role) OR has_admin_edit(auth.uid(),'partners')));
CREATE POLICY "Admins can upload partner logos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'partner-logos' AND (has_role(auth.uid(),'superadmin'::app_role) OR has_admin_edit(auth.uid(),'partners')));

DROP POLICY IF EXISTS "Hero images delete access" ON storage.objects;
DROP POLICY IF EXISTS "Hero images update access" ON storage.objects;
DROP POLICY IF EXISTS "Hero images upload access" ON storage.objects;
CREATE POLICY "Hero images delete access" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'hero-images' AND (has_role(auth.uid(),'superadmin'::app_role) OR has_admin_edit(auth.uid(),'hero-images')));
CREATE POLICY "Hero images update access" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'hero-images' AND (has_role(auth.uid(),'superadmin'::app_role) OR has_admin_edit(auth.uid(),'hero-images')));
CREATE POLICY "Hero images upload access" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'hero-images' AND (has_role(auth.uid(),'superadmin'::app_role) OR has_admin_edit(auth.uid(),'hero-images')));

-- 5) Restrict public read on site_settings to a whitelist of public-facing keys.
--    Sensitive keys (e.g. blog_ai_config) are no longer publicly readable.
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Public can read whitelisted site settings"
ON public.site_settings
FOR SELECT
TO public
USING (key IN ('contact','social','plans_pricing','pricing','nyra_config'));