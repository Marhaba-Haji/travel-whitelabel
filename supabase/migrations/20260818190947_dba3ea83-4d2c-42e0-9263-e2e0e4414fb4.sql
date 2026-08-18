CREATE TABLE public.umrah_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  phone_e164 text NOT NULL,
  email text,
  city text,
  travellers integer NOT NULL DEFAULT 1,
  room_preference text,
  message text,
  package_slug text NOT NULL DEFAULT 'bangalore-umrah-sep-2026',
  lead_type text NOT NULL DEFAULT 'enquiry',
  status text NOT NULL DEFAULT 'new',
  amount_inr numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  txnid text,
  payu_mihpayid text,
  utm jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text,
  landing_page text,
  confirmation_sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.umrah_leads TO anon;
GRANT SELECT, INSERT, UPDATE ON public.umrah_leads TO authenticated;
GRANT ALL ON public.umrah_leads TO service_role;

ALTER TABLE public.umrah_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit umrah enquiries"
ON public.umrah_leads FOR INSERT
TO anon, authenticated
WITH CHECK (
  lead_type = 'enquiry'
  AND status = 'new'
  AND amount_inr = 0
  AND txnid IS NULL
  AND payu_mihpayid IS NULL
  AND confirmation_sent_at IS NULL
);

CREATE POLICY "Admins can view umrah leads"
ON public.umrah_leads FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update umrah leads"
ON public.umrah_leads FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_umrah_leads_updated_at
BEFORE UPDATE ON public.umrah_leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_umrah_leads_created_at ON public.umrah_leads (created_at DESC);
CREATE INDEX idx_umrah_leads_txnid ON public.umrah_leads (txnid);