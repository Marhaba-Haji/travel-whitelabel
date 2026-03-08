
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL DEFAULT '',
  cover_image_url text,
  status text NOT NULL DEFAULT 'draft',
  meta_title text,
  meta_description text,
  meta_keywords text[],
  og_image_url text,
  author_name text DEFAULT 'Marhaba DMC',
  reading_time_minutes integer DEFAULT 1,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blogs"
  ON public.blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Superadmins can manage blogs"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'superadmin'))
  WITH CHECK (has_role(auth.uid(), 'superadmin'));

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC);
