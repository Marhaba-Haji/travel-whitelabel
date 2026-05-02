
-- Fix 1: voice_ai_sessions — remove public SELECT (PII exposure)
DROP POLICY IF EXISTS "Anyone can read voice AI sessions by session_id" ON public.voice_ai_sessions;

-- Fix 2: visitor_sessions — remove unrestricted public UPDATE
DROP POLICY IF EXISTS "Anyone can update own session" ON public.visitor_sessions;

-- Fix 3: voice_ai_leads — restrict SELECT to superadmins only
DROP POLICY IF EXISTS "Authenticated can read voice AI leads" ON public.voice_ai_leads;
CREATE POLICY "Superadmins can read voice AI leads"
ON public.voice_ai_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Fix 4: blog-images storage — restrict INSERT/DELETE to authenticated superadmins
DROP POLICY IF EXISTS "Authenticated upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete blog images" ON storage.objects;

CREATE POLICY "Superadmins upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Superadmins delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND has_role(auth.uid(), 'superadmin'::app_role)
);

-- Fix 5: voice-ai-documents bucket — make private (signed URLs already used)
UPDATE storage.buckets SET public = false WHERE id = 'voice-ai-documents';
