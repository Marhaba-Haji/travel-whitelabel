-- Allow updates to payments (for PayU callback handlers)
CREATE POLICY "Service can update payment status"
  ON public.payments FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow updates to registrations (for payment_completed status)
CREATE POLICY "Service can update registration status"
  ON public.registrations FOR UPDATE
  USING (true)
  WITH CHECK (true);
