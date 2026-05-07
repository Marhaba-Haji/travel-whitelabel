-- Create table to store demo booking schedule settings per weekday
CREATE TABLE IF NOT EXISTS demo_schedule_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 1 = Monday
  start_time time NOT NULL,
  end_time time NOT NULL,
  unavailable_ranges jsonb DEFAULT '[]'::jsonb, -- array of {"start":"HH:MM","end":"HH:MM"}
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- unique per day
CREATE UNIQUE INDEX IF NOT EXISTS demo_schedule_settings_day_idx ON demo_schedule_settings(day_of_week);

-- trigger to update updated_at
CREATE OR REPLACE FUNCTION demo_schedule_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_demo_schedule_settings_updated_at ON demo_schedule_settings;
CREATE TRIGGER trg_demo_schedule_settings_updated_at
BEFORE UPDATE ON demo_schedule_settings
FOR EACH ROW EXECUTE FUNCTION demo_schedule_settings_updated_at();
