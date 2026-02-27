
-- Create voice_ai_sessions table for session persistence
CREATE TABLE public.voice_ai_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  visitor_name TEXT,
  visitor_email TEXT,
  conversation_summary TEXT DEFAULT '',
  itinerary_state JSONB DEFAULT '{}',
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_ai_sessions ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors need to insert/update their own sessions
CREATE POLICY "Anyone can insert voice AI sessions"
  ON public.voice_ai_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update voice AI sessions"
  ON public.voice_ai_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read voice AI sessions by session_id"
  ON public.voice_ai_sessions FOR SELECT
  USING (true);

-- Superadmins can do everything
CREATE POLICY "Superadmins can manage voice AI sessions"
  ON public.voice_ai_sessions FOR ALL
  USING (has_role(auth.uid(), 'superadmin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Index for fast lookup
CREATE INDEX idx_voice_ai_sessions_session_id ON public.voice_ai_sessions (session_id);
