-- Allow superadmins to update and delete voice AI leads
CREATE POLICY "Superadmins can update voice AI leads"
ON public.voice_ai_leads
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Superadmins can delete voice AI leads"
ON public.voice_ai_leads
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role));