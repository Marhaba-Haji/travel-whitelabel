-- Add updated_at for tracking lead updates
ALTER TABLE public.voice_ai_leads
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
