
-- admin_users table
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  must_change_password boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Superadmin full access
CREATE POLICY "Superadmins can manage admin_users"
  ON public.admin_users FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Users can read their own row
CREATE POLICY "Users can read own admin_user row"
  ON public.admin_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- admin_user_permissions table
CREATE TABLE public.admin_user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  module text NOT NULL,
  access_level text NOT NULL DEFAULT 'none',
  UNIQUE (admin_user_id, module)
);

ALTER TABLE public.admin_user_permissions ENABLE ROW LEVEL SECURITY;

-- Superadmin full access
CREATE POLICY "Superadmins can manage admin_user_permissions"
  ON public.admin_user_permissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Users can read their own permissions
CREATE POLICY "Users can read own permissions"
  ON public.admin_user_permissions FOR SELECT TO authenticated
  USING (admin_user_id IN (SELECT id FROM public.admin_users WHERE user_id = auth.uid()));

-- Add update trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allow superadmins to manage user_roles (needed for edge function inserts and deletes)
CREATE POLICY "Superadmins can insert user_roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Superadmins can delete user_roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Allow authenticated users to read their own role
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
