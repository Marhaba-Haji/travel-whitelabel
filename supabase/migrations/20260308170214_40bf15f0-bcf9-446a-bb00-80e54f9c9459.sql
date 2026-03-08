
-- Add category and tags columns to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN category text;
ALTER TABLE public.blog_posts ADD COLUMN tags text[] DEFAULT '{}';

-- Create blog_categories for managing available categories
CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blog categories"
  ON public.blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Superadmins can manage blog categories"
  ON public.blog_categories FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'))
  WITH CHECK (has_role(auth.uid(), 'superadmin'));

-- Index for filtering
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_tags ON public.blog_posts USING GIN(tags);

-- Seed some initial categories
INSERT INTO public.blog_categories (name, slug, description) VALUES
  ('Destination Guides', 'destination-guides', 'In-depth guides to popular travel destinations'),
  ('Halal Travel', 'halal-travel', 'Tips and insights for halal-friendly travel'),
  ('Travel Technology', 'travel-technology', 'Latest in travel tech and innovation'),
  ('Industry Trends', 'industry-trends', 'Travel and hospitality industry analysis'),
  ('MICE & Groups', 'mice-groups', 'Meetings, incentives, conferences and group travel'),
  ('Luxury Travel', 'luxury-travel', 'Premium travel experiences and services');
