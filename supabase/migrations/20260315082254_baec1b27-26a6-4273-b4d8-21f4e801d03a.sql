ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS search_intent text DEFAULT 'informational',
ADD COLUMN IF NOT EXISTS primary_keyword text;