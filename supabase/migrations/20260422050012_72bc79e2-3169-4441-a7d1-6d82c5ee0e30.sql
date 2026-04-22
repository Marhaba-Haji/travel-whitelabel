-- 1. search_queries: track blog searches and 404s for content-gap analysis
CREATE TABLE public.search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  results_count integer DEFAULT 0,
  page_path text,
  session_id text,
  source text DEFAULT 'blog_search',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_search_queries_query ON public.search_queries (lower(query));
CREATE INDEX idx_search_queries_created_at ON public.search_queries (created_at DESC);
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert search queries" ON public.search_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Superadmins can view search queries" ON public.search_queries FOR SELECT USING (has_role(auth.uid(), 'superadmin'::app_role));

-- 2. lead_magnets: catalog of downloadable resources
CREATE TABLE public.lead_magnets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  file_url text,
  cover_image_url text,
  category text,
  gated boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  downloads_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active lead magnets" ON public.lead_magnets FOR SELECT USING (is_active = true);
CREATE POLICY "Superadmins can manage lead magnets" ON public.lead_magnets FOR ALL USING (has_role(auth.uid(), 'superadmin'::app_role)) WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- 3. lead_magnet_downloads: who downloaded what
CREATE TABLE public.lead_magnet_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  magnet_id uuid REFERENCES public.lead_magnets(id) ON DELETE SET NULL,
  email text NOT NULL,
  name text,
  source text,
  utm jsonb DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_magnet_downloads_email ON public.lead_magnet_downloads (lower(email));
CREATE INDEX idx_lead_magnet_downloads_magnet ON public.lead_magnet_downloads (magnet_id);
ALTER TABLE public.lead_magnet_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record a download" ON public.lead_magnet_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Superadmins can view downloads" ON public.lead_magnet_downloads FOR SELECT USING (has_role(auth.uid(), 'superadmin'::app_role));

-- 4. visitor_sessions: anonymous attribution tracking
CREATE TABLE public.visitor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  landing_page text,
  country text,
  device text,
  user_agent text,
  page_views integer NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_visitor_sessions_session_id ON public.visitor_sessions (session_id);
CREATE INDEX idx_visitor_sessions_utm_source ON public.visitor_sessions (utm_source);
CREATE INDEX idx_visitor_sessions_first_seen ON public.visitor_sessions (first_seen_at DESC);
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert visitor sessions" ON public.visitor_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own session" ON public.visitor_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Superadmins can view visitor sessions" ON public.visitor_sessions FOR SELECT USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE TRIGGER update_lead_magnets_updated_at
  BEFORE UPDATE ON public.lead_magnets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. contact_enquiries: add intent + attribution
ALTER TABLE public.contact_enquiries
  ADD COLUMN IF NOT EXISTS intent text,
  ADD COLUMN IF NOT EXISTS utm jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS landing_page text,
  ADD COLUMN IF NOT EXISTS referrer text;

-- 6. registrations: abandoned-signup recovery tracking
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS recovery_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recovered_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_reminder_at timestamptz,
  ADD COLUMN IF NOT EXISTS utm jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS session_id text;

-- 7. newsletter_subscriptions: source + attribution + preferences
ALTER TABLE public.newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'inline',
  ADD COLUMN IF NOT EXISTS utm jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_email_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS preferred_categories text[] DEFAULT '{}'::text[];

-- 8. blog_posts: AI summary cache + speakable selector
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS speakable_selector text;

-- 9. RPC: increment lead magnet downloads
CREATE OR REPLACE FUNCTION public.increment_lead_magnet_downloads(_magnet_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.lead_magnets SET downloads_count = downloads_count + 1 WHERE id = _magnet_id;
$$;