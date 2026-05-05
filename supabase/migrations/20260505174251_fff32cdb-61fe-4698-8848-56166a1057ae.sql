-- 1. saved_itineraries: drop public SELECT (use itinerary-save edge function instead)
DROP POLICY IF EXISTS "Anyone can view saved itineraries by share_id" ON public.saved_itineraries;

-- 2. voice_ai_lead_documents: restrict SELECT to superadmins
DROP POLICY IF EXISTS "Authenticated can read voice AI documents" ON public.voice_ai_lead_documents;
CREATE POLICY "Superadmins can read voice AI documents"
ON public.voice_ai_lead_documents
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'::app_role));

-- 3. blog-images bucket: drop broad SELECT policy (public bucket still serves files via CDN URLs)
DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;

-- 4. Revoke EXECUTE on internal SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;