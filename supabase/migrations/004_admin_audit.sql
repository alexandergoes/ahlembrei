-- Active/inactive column on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS deactivated_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;

-- Admin audit log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_user_id UUID NOT NULL REFERENCES public.profiles(id),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit log" ON public.admin_audit_log FOR SELECT USING (true);
CREATE POLICY "System can insert audit log" ON public.admin_audit_log FOR INSERT WITH CHECK (true);

DROP FUNCTION IF EXISTS public.admin_list_users();
DROP FUNCTION IF EXISTS public.admin_update_user_role(UUID, TEXT);
DROP FUNCTION IF EXISTS public.admin_soft_delete_user(UUID);
DROP FUNCTION IF EXISTS public.admin_restore_user(UUID);
DROP FUNCTION IF EXISTS public.admin_get_user_audit(UUID);

-- List users with filters
CREATE OR REPLACE FUNCTION public.admin_list_users(
  status_filter TEXT DEFAULT 'all',
  plan_filter TEXT DEFAULT 'all',
  role_filter TEXT DEFAULT 'all',
  sort_by TEXT DEFAULT 'created_at',
  sort_dir TEXT DEFAULT 'desc',
  search_term TEXT DEFAULT ''
)
RETURNS TABLE (id UUID, email TEXT, full_name TEXT, plan_type TEXT, role TEXT, active BOOLEAN, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can list users';
  END IF;

  RETURN QUERY EXECUTE format(
    'SELECT p.id, au.email::TEXT, p.full_name, p.plan_type, p.role, p.active, p.created_at
     FROM public.profiles p
     LEFT JOIN auth.users au ON au.id = p.id
     WHERE (%L = ''all'' OR (%L = ''active'' AND p.active = true) OR (%L = ''inactive'' AND p.active = false))
       AND (%L = ''all'' OR p.plan_type = %L)
       AND (%L = ''all'' OR p.role = %L)
       AND (%L = '''' OR p.full_name ILIKE %L OR au.email ILIKE %L)
     ORDER BY %I %s',
    status_filter, status_filter, status_filter,
    plan_filter, plan_filter,
    role_filter, role_filter,
    search_term, '%' || search_term || '%', '%' || search_term || '%',
    sort_by, sort_dir
  );
END;
$$;

-- Update user role
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id UUID, new_role TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID; BEGIN
  _admin_id := auth.uid();
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can update roles';
  END IF;
  IF new_role NOT IN ('user', 'admin') THEN RAISE EXCEPTION 'Invalid role: %', new_role; END IF;
  UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (_admin_id, 'update_role', target_user_id, jsonb_build_object('new_role', new_role));
END;
$$;

-- Toggle active/inactive
CREATE OR REPLACE FUNCTION public.admin_toggle_user_active(target_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID; _new_status BOOLEAN; BEGIN
  _admin_id := auth.uid();
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can toggle user status';
  END IF;
  SELECT NOT active INTO _new_status FROM public.profiles WHERE id = target_user_id;
  UPDATE public.profiles SET active = _new_status, deactivated_by = CASE WHEN _new_status THEN NULL ELSE _admin_id END, deactivated_at = CASE WHEN _new_status THEN NULL ELSE NOW() END WHERE id = target_user_id;
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (_admin_id, CASE WHEN _new_status THEN 'activate' ELSE 'deactivate' END, target_user_id, jsonb_build_object('new_status', _new_status));
END;
$$;

-- Get user audit log
CREATE OR REPLACE FUNCTION public.admin_get_user_audit(target_user_id UUID)
RETURNS TABLE (id UUID, admin_id UUID, admin_name TEXT, action TEXT, details JSONB, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can view audit logs';
  END IF;
  RETURN QUERY SELECT al.id, al.admin_id, p.full_name AS admin_name, al.action, al.details, al.created_at
  FROM public.admin_audit_log al LEFT JOIN public.profiles p ON p.id = al.admin_id
  WHERE al.target_user_id = target_user_id ORDER BY al.created_at DESC;
END;
$$;
