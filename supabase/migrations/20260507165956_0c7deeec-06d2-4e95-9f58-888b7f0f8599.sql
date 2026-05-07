-- Add missing RLS policies for partners table so admins can manage them
CREATE POLICY "Superadmins can insert partners"
ON public.partners FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role) OR EXISTS (
  SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true
));

CREATE POLICY "Superadmins can update partners"
ON public.partners FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR EXISTS (
  SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true
))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role) OR EXISTS (
  SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true
));

CREATE POLICY "Superadmins can delete partners"
ON public.partners FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR EXISTS (
  SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true
));

CREATE POLICY "Admins can read all partners"
ON public.partners FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role) OR EXISTS (
  SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true
));