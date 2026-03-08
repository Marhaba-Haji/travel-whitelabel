
CREATE TABLE public.indexing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  service text NOT NULL,
  status_code integer,
  response jsonb,
  error text,
  action text NOT NULL DEFAULT 'updated',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.indexing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can view indexing logs"
  ON public.indexing_logs FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Service can insert indexing logs"
  ON public.indexing_logs FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_indexing_logs_created_at ON public.indexing_logs (created_at DESC);
CREATE INDEX idx_indexing_logs_url ON public.indexing_logs (url);
