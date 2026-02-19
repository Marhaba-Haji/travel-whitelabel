
-- Insert the per-plan pricing row into site_settings (upsert by key)
INSERT INTO public.site_settings (key, value)
VALUES (
  'plans_pricing',
  '{"gst_percent": 18, "currency": "INR", "launch": 24999, "growth": 29999, "authority": 34999}'::jsonb
)
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = now();

-- Ensure a unique constraint on key exists (safe to run if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'site_settings_key_unique'
  ) THEN
    ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_key_unique UNIQUE (key);
  END IF;
END $$;
