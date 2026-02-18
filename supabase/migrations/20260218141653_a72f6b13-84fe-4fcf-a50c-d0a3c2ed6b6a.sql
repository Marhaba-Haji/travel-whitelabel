
-- Fix 1: Remove permissive UPDATE policy on registrations (edge functions use service_role_key, bypass RLS)
DROP POLICY IF EXISTS "Service can update registration status" ON public.registrations;

-- Fix 2: Remove permissive INSERT and UPDATE policies on payments
DROP POLICY IF EXISTS "Anyone can create payment" ON public.payments;
DROP POLICY IF EXISTS "Service can update payment status" ON public.payments;

-- Fix 3: Remove permissive INSERT policy on payment_gateway_responses
DROP POLICY IF EXISTS "Anyone can insert gateway response" ON public.payment_gateway_responses;

-- Fix 4: Restrict coupons SELECT to superadmins only (validate-coupon edge function uses service_role_key)
DROP POLICY IF EXISTS "Anyone can validate coupons" ON public.coupons;

-- Fix 5: Harden has_role() to only allow checking own roles (or superadmin checking others)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow checking own roles, or if caller is superadmin
  IF auth.uid() IS NOT NULL AND auth.uid() != _user_id THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    ) THEN
      RETURN false;
    END IF;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;
