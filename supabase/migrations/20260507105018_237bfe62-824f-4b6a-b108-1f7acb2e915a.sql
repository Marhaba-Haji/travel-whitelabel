
-- 1. Remove permissive public UPDATE policy on voice_ai_sessions.
-- All updates now go through the voice-ai-session edge function (service role).
DROP POLICY IF EXISTS "Anyone can update voice AI sessions" ON public.voice_ai_sessions;

-- 2. Storage: explicit public SELECT for blog-images bucket
DROP POLICY IF EXISTS "Public can read blog-images" ON storage.objects;
CREATE POLICY "Public can read blog-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- 3. Storage: superadmin SELECT for private voice-ai-documents bucket
DROP POLICY IF EXISTS "Superadmins can read voice-ai-documents" ON storage.objects;
CREATE POLICY "Superadmins can read voice-ai-documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-ai-documents'
  AND public.has_role(auth.uid(), 'superadmin')
);
