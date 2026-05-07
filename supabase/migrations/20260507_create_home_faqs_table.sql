-- Create homepage FAQs table
CREATE TABLE IF NOT EXISTS home_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_home_faqs_active ON home_faqs(active);
CREATE INDEX IF NOT EXISTS idx_home_faqs_display_order ON home_faqs(display_order);

-- Enable RLS
ALTER TABLE home_faqs ENABLE ROW LEVEL SECURITY;

-- Public read policy (only active FAQs)
CREATE POLICY "Anyone can read active home FAQs"
  ON home_faqs FOR SELECT
  USING (active = true);

-- Admin full access policy (gate finer access at app permission layer)
CREATE POLICY "Authenticated users can manage home FAQs"
  ON home_faqs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Keep updated_at current on updates
CREATE OR REPLACE FUNCTION update_home_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_home_faqs_updated_at_trigger ON home_faqs;
CREATE TRIGGER update_home_faqs_updated_at_trigger
  BEFORE UPDATE ON home_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_home_faqs_updated_at();
