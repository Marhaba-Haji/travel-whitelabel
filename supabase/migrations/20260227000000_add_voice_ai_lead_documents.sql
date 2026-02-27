-- Documents uploaded during Nyra voice conversations
CREATE TABLE public.voice_ai_lead_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_email TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_ai_lead_documents ENABLE ROW LEVEL SECURITY;

-- Allow insert from anyone (voice AI flow)
CREATE POLICY "Anyone can insert voice AI document"
  ON public.voice_ai_lead_documents FOR INSERT
  WITH CHECK (true);

-- Authenticated (admin) can read
CREATE POLICY "Authenticated can read voice AI documents"
  ON public.voice_ai_lead_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX idx_voice_ai_lead_documents_email ON public.voice_ai_lead_documents(lead_email);
CREATE INDEX idx_voice_ai_lead_documents_created ON public.voice_ai_lead_documents(created_at DESC);

-- NOTE: Create storage bucket "voice-ai-documents" in Supabase Dashboard
-- (Storage > New bucket > name: voice-ai-documents, Private)
