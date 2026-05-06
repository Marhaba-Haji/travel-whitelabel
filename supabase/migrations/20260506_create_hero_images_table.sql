-- Create hero_images table
CREATE TABLE IF NOT EXISTS hero_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL DEFAULT 'main_hero',
  display_order INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hero images are publicly readable" ON hero_images;
CREATE POLICY "Hero images are publicly readable" ON hero_images
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins can create hero images" ON hero_images;
CREATE POLICY "Admins can create hero images" ON hero_images
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'superadmin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE user_id = auth.uid()
        AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update hero images" ON hero_images;
CREATE POLICY "Admins can update hero images" ON hero_images
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'superadmin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE user_id = auth.uid()
        AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete hero images" ON hero_images;
CREATE POLICY "Admins can delete hero images" ON hero_images
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'superadmin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE user_id = auth.uid()
        AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can read all hero images" ON hero_images;
CREATE POLICY "Admins can read all hero images" ON hero_images
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'superadmin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE user_id = auth.uid()
        AND is_active = true
    )
  );
