-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  color_badge TEXT NOT NULL DEFAULT 'bg-gray-600',
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access for active partners
CREATE POLICY "Partners are publicly readable" ON partners
  FOR SELECT USING (active = true);

-- Policy 2: Admin create access
CREATE POLICY "Admins can create partners" ON partners
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN (SELECT email FROM public.admin_users)
    )
  );

-- Policy 3: Admin update access
CREATE POLICY "Admins can update partners" ON partners
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN (SELECT email FROM public.admin_users)
    )
  );

-- Policy 4: Admin delete access
CREATE POLICY "Admins can delete partners" ON partners
  FOR DELETE 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN (SELECT email FROM public.admin_users)
    )
  );

-- Policy 5: Admins can read all partners (including inactive)
CREATE POLICY "Admins can read all partners" ON partners
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN (SELECT email FROM public.admin_users)
    )
  );

-- Insert default partners
INSERT INTO partners (name, logo_url, color_badge, display_order) VALUES
  ('MakeMyTrip', 'https://www.makemytrip.com/favicon.ico', 'bg-yellow-600', 1),
  ('TBO', NULL, 'bg-blue-700', 2),
  ('TripJack', NULL, 'bg-green-600', 3),
  ('Viator', NULL, 'bg-purple-600', 4),
  ('Dubai Tourism', NULL, 'bg-red-600', 5),
  ('NUSUK Umrah', NULL, 'bg-amber-600', 6),
  ('Turkey Tourism', NULL, 'bg-red-700', 7)
ON CONFLICT (name) DO NOTHING;
