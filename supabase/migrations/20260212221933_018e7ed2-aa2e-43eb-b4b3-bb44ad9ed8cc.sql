
-- 1. Contact / Get in Touch enquiries
CREATE TABLE public.contact_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

-- Public insert (anyone can submit the form)
CREATE POLICY "Anyone can submit contact enquiry"
  ON public.contact_enquiries FOR INSERT
  WITH CHECK (true);

-- 2. Newsletter subscriptions
CREATE TABLE public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscriptions FOR INSERT
  WITH CHECK (true);

-- 3. Registrations (signup form entries)
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  password_hash TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Public insert (signup is open)
CREATE POLICY "Anyone can register"
  ON public.registrations FOR INSERT
  WITH CHECK (true);

-- 4. Payments (PayU transactions)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
  txn_id TEXT NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  product_info TEXT,
  payment_mode TEXT,
  status TEXT NOT NULL DEFAULT 'initiated',
  payu_mihpayid TEXT,
  bank_ref_num TEXT,
  error_code TEXT,
  error_message TEXT,
  success_url TEXT,
  failure_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Public insert for creating payment records from the server
CREATE POLICY "Anyone can create payment"
  ON public.payments FOR INSERT
  WITH CHECK (true);

-- 5. Payment gateway responses (raw PayU callbacks)
CREATE TABLE public.payment_gateway_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  txn_id TEXT,
  gateway TEXT NOT NULL DEFAULT 'payu',
  response_type TEXT NOT NULL DEFAULT 'callback',
  raw_response JSONB NOT NULL,
  status TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_gateway_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert gateway response"
  ON public.payment_gateway_responses FOR INSERT
  WITH CHECK (true);

-- Indexes for common lookups
CREATE INDEX idx_registrations_email ON public.registrations(email);
CREATE INDEX idx_payments_txn_id ON public.payments(txn_id);
CREATE INDEX idx_payments_registration_id ON public.payments(registration_id);
CREATE INDEX idx_payment_responses_payment_id ON public.payment_gateway_responses(payment_id);
CREATE INDEX idx_payment_responses_txn_id ON public.payment_gateway_responses(txn_id);
CREATE INDEX idx_contact_enquiries_status ON public.contact_enquiries(status);

-- Updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_contact_enquiries_updated_at
  BEFORE UPDATE ON public.contact_enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
