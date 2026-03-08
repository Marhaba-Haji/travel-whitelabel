
-- Add views_count column
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0;

-- Create a security definer function to increment views (bypasses RLS)
CREATE OR REPLACE FUNCTION public.increment_blog_views(_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.blog_posts
  SET views_count = views_count + 1
  WHERE slug = _slug AND status = 'published';
$$;
