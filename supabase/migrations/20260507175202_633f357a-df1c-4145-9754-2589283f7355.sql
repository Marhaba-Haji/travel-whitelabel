CREATE POLICY "Admins can delete hero content"
ON public.hero_content
FOR DELETE
TO public
USING (
  has_role(auth.uid(), 'superadmin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
  )
);