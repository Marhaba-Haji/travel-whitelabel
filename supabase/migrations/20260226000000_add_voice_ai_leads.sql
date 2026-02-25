-- Voice AI leads from Nyra conversations
CREATE TABLE public.voice_ai_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'nyra',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_ai_leads ENABLE ROW LEVEL SECURITY;

-- Public insert (voice AI can submit leads)
CREATE POLICY "Anyone can submit voice AI lead"
  ON public.voice_ai_leads FOR INSERT
  WITH CHECK (true);

-- Authenticated users (admin) can read
CREATE POLICY "Authenticated can read voice AI leads"
  ON public.voice_ai_leads FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX idx_voice_ai_leads_created_at ON public.voice_ai_leads(created_at DESC);
