
-- Blog clusters table
CREATE TABLE public.blog_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  target_keyword text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read clusters" ON public.blog_clusters FOR SELECT USING (true);
CREATE POLICY "Superadmins can manage clusters" ON public.blog_clusters FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin')) WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- Add cluster columns to blog_posts
ALTER TABLE public.blog_posts
  ADD COLUMN cluster_id uuid REFERENCES public.blog_clusters(id) ON DELETE SET NULL,
  ADD COLUMN post_type text NOT NULL DEFAULT 'standard',
  ADD COLUMN pillar_post_id uuid REFERENCES public.blog_posts(id) ON DELETE SET NULL;

-- Create blog-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Allow public read access to blog images
CREATE POLICY "Public read blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');

-- Allow authenticated uploads to blog images
CREATE POLICY "Authenticated upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images');

-- Allow authenticated delete blog images
CREATE POLICY "Authenticated delete blog images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images');
