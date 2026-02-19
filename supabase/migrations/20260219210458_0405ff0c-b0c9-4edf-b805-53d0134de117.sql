ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS plan_name TEXT NULL;

COMMENT ON COLUMN public.registrations.plan_name IS 'Subscription plan selected at registration (e.g. Launch Plan, Growth Plan, Authority Plan)';