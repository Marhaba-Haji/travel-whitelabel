-- 1. Restrict testimonials and home_faqs to admins
DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'superadmin'::app_role)
  OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
)
WITH CHECK (
  has_role(auth.uid(), 'superadmin'::app_role)
  OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);

DROP POLICY IF EXISTS "Authenticated users can manage home FAQs" ON public.home_faqs;
CREATE POLICY "Admins can manage home FAQs"
ON public.home_faqs
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'superadmin'::app_role)
  OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
)
WITH CHECK (
  has_role(auth.uid(), 'superadmin'::app_role)
  OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- 2. Remove public SELECT on demo_bookings (PII exposure)
DROP POLICY IF EXISTS "Anyone can read non-cancelled slots" ON public.demo_bookings;

-- 3. Fix function search_path
CREATE OR REPLACE FUNCTION public.update_testimonials_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_home_faqs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.demo_schedule_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;