UPDATE public.site_settings
SET value = '{"launch": 19999, "growth": 29999, "authority": 39999, "launch_monthly": 2999, "growth_monthly": 3999, "authority_monthly": 4999, "gst_percent": 18, "currency": "INR"}'::jsonb,
    updated_at = now()
WHERE key = 'plans_pricing';