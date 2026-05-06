-- Create hero_content table
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL DEFAULT 'main_hero',
  display_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  subtitle_color TEXT NOT NULL DEFAULT '#B968C7',
  description TEXT,
  cta_text TEXT DEFAULT 'Get Started',
  cta_url TEXT DEFAULT '/signup',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE hero_content DROP CONSTRAINT IF EXISTS hero_content_section_key_key;
ALTER TABLE hero_content ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
UPDATE hero_content SET display_order = 0 WHERE display_order IS NULL;

-- Enable RLS
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access
DROP POLICY IF EXISTS "Hero content is publicly readable" ON hero_content;
CREATE POLICY "Hero content is publicly readable" ON hero_content
  FOR SELECT USING (active = true);

-- Policy 2: Admin create access
DROP POLICY IF EXISTS "Admins can create hero content" ON hero_content;
CREATE POLICY "Admins can create hero content" ON hero_content
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

-- Policy 3: Admin update access
DROP POLICY IF EXISTS "Admins can update hero content" ON hero_content;
CREATE POLICY "Admins can update hero content" ON hero_content
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

-- Policy 4: Admins can read all hero content
DROP POLICY IF EXISTS "Admins can read all hero content" ON hero_content;
CREATE POLICY "Admins can read all hero content" ON hero_content
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

-- Insert default hero content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM hero_content WHERE section_key = 'main_hero' AND display_order = 0
  ) THEN
    INSERT INTO hero_content (section_key, display_order, title, subtitle, subtitle_color, description, cta_text, cta_url)
    VALUES (
      'main_hero',
      0,
      'Travel top destination of the world',
      'top destination',
      '#B968C7',
      'Where adventure meets comfort. We create unforgettable travel experiences',
      'Get Started',
      '/signup'
    );
  END IF;
END $$;
