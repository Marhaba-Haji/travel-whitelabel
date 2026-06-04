CREATE TABLE public.tracking_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL DEFAULT 'custom',
  placement text NOT NULL DEFAULT 'head' CHECK (placement IN ('head','body_start','body_end')),
  code text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  load_strategy text NOT NULL DEFAULT 'exclude_admin' CHECK (load_strategy IN ('all_pages','exclude_admin')),
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tracking_scripts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking_scripts TO authenticated;
GRANT ALL ON public.tracking_scripts TO service_role;

ALTER TABLE public.tracking_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read enabled scripts"
  ON public.tracking_scripts FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Admins can read all scripts"
  ON public.tracking_scripts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_admin_edit(auth.uid(), 'scripts'));

CREATE POLICY "Admins can insert scripts"
  ON public.tracking_scripts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'superadmin') OR public.has_admin_edit(auth.uid(), 'scripts'));

CREATE POLICY "Admins can update scripts"
  ON public.tracking_scripts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_admin_edit(auth.uid(), 'scripts'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin') OR public.has_admin_edit(auth.uid(), 'scripts'));

CREATE POLICY "Admins can delete scripts"
  ON public.tracking_scripts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_admin_edit(auth.uid(), 'scripts'));

CREATE TRIGGER tracking_scripts_updated_at
  BEFORE UPDATE ON public.tracking_scripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_tracking_scripts_enabled_placement ON public.tracking_scripts(is_enabled, placement, sort_order);