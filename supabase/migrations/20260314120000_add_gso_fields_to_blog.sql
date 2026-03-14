-- Add GSO / cluster intelligence fields to clusters and posts

ALTER TABLE public.blog_clusters
  ADD COLUMN IF NOT EXISTS paa_queries text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_searches text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured_snippet_targets text[] DEFAULT '{}';

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS paa_target text,
  ADD COLUMN IF NOT EXISTS snippet_type text;

