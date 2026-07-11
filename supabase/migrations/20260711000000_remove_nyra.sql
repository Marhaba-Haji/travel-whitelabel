-- Remove the Nyra voice/chat AI assistant and its itinerary feature entirely:
-- tables (including collected data), storage bucket, settings, and admin
-- module permissions. The email sender address previously stored under
-- nyra_config is preserved under a new email_sender key, which the send-email
-- edge function now reads.

-- 1) Preserve the configured email sender before deleting nyra_config
INSERT INTO public.site_settings (key, value)
SELECT 'email_sender', jsonb_build_object('sender_email', value->>'sender_email')
FROM public.site_settings
WHERE key = 'nyra_config'
  AND value ? 'sender_email'
  AND NOT EXISTS (SELECT 1 FROM public.site_settings WHERE key = 'email_sender');

DELETE FROM public.site_settings WHERE key = 'nyra_config';

-- 2) Remove nyra_config from the public read whitelist
DROP POLICY IF EXISTS "Public can read whitelisted site settings" ON public.site_settings;
CREATE POLICY "Public can read whitelisted site settings"
ON public.site_settings
FOR SELECT
TO public
USING (key IN ('contact','social','plans_pricing','pricing'));

-- 3) Drop Nyra tables (lead, session, document, and itinerary data are
--    permanently deleted, as confirmed)
DROP TABLE IF EXISTS public.voice_ai_lead_documents CASCADE;
DROP TABLE IF EXISTS public.voice_ai_leads CASCADE;
DROP TABLE IF EXISTS public.voice_ai_sessions CASCADE;
DROP TABLE IF EXISTS public.saved_itineraries CASCADE;

-- 4) Remove the storage policies for the voice-ai-documents bucket.
--    The bucket and its objects themselves cannot be deleted via SQL
--    (storage.protect_delete blocks direct DML) — they are removed through
--    the Storage API instead.
DROP POLICY IF EXISTS "Superadmins can read voice-ai-documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload voice AI documents" ON storage.objects;

-- 5) Remove Nyra-related admin module permissions
DELETE FROM public.admin_user_permissions
WHERE module IN ('voice-ai-leads', 'itineraries', 'ai-agent', 'analytics');
