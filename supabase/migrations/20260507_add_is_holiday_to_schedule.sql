-- Add is_holiday column to mark entire weekday as unavailable
ALTER TABLE demo_schedule_settings
ADD COLUMN IF NOT EXISTS is_holiday boolean DEFAULT false;
