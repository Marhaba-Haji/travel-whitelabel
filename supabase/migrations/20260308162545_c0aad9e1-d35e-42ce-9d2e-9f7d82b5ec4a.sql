
ALTER TABLE public.voice_ai_sessions
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'voice',
  ADD COLUMN IF NOT EXISTS message_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tool_calls jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS connected_at timestamp with time zone DEFAULT now();
