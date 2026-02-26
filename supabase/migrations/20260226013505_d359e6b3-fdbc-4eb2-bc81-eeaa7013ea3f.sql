
-- Table to store saved itineraries
CREATE TABLE public.saved_itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT NOT NULL UNIQUE DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  title TEXT,
  destination TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  start_date TEXT,
  end_date TEXT,
  guests JSONB NOT NULL DEFAULT '[]'::jsonb,
  days JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_price NUMERIC NOT NULL DEFAULT 0,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY;

-- Anyone can read a saved itinerary (shared link)
CREATE POLICY "Anyone can view saved itineraries by share_id"
ON public.saved_itineraries
FOR SELECT
USING (true);

-- Superadmins can do everything
CREATE POLICY "Superadmins can manage saved itineraries"
ON public.saved_itineraries
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Index for fast lookup by share_id
CREATE INDEX idx_saved_itineraries_share_id ON public.saved_itineraries (share_id);

-- Trigger for updated_at
CREATE TRIGGER update_saved_itineraries_updated_at
BEFORE UPDATE ON public.saved_itineraries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
