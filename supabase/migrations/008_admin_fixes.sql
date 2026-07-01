-- ============================================================
-- BLOCO A: Garantir função is_admin() com SECURITY DEFINER
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- ============================================================
-- BLOCO B: RPC para listar users com email (JOIN auth.users)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_list_all_users()
RETURNS TABLE (
  id UUID, full_name TEXT, email TEXT, plan_type TEXT,
  role TEXT, active BOOLEAN, created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p.id, p.full_name, u.email::TEXT, p.plan_type, p.role, p.active, p.created_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
$$;

-- ============================================================
-- BLOCO C: admin_toggle_user_active com proteção último admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_toggle_user_active(target_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID; _new_status BOOLEAN; _admin_count INTEGER;
BEGIN
  _admin_id := auth.uid();
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can toggle user status';
  END IF;
  SELECT NOT COALESCE(active, true) INTO _new_status FROM public.profiles WHERE id = target_user_id;
  IF _new_status = false AND EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND role = 'admin') THEN
    SELECT COUNT(*) INTO _admin_count FROM public.profiles WHERE role = 'admin' AND active = true AND id != target_user_id;
    IF _admin_count = 0 THEN RAISE EXCEPTION 'Não é possível desativar o último administrador do sistema'; END IF;
  END IF;
  UPDATE public.profiles SET active = _new_status,
    deactivated_by = CASE WHEN _new_status THEN NULL ELSE _admin_id END,
    deactivated_at = CASE WHEN _new_status THEN NULL ELSE NOW() END
  WHERE id = target_user_id;
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (_admin_id, CASE WHEN _new_status THEN 'activate' ELSE 'deactivate' END, target_user_id, jsonb_build_object('new_status', _new_status));
END;
$$;

-- ============================================================
-- BLOCO D: admin_update_user_role com proteção último admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id UUID, new_role TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID; _admin_count INTEGER;
BEGIN
  _admin_id := auth.uid();
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update roles';
  END IF;
  IF new_role NOT IN ('user', 'admin') THEN RAISE EXCEPTION 'Invalid role: %', new_role; END IF;
  IF target_user_id = _admin_id AND new_role != 'admin' THEN
    SELECT COUNT(*) INTO _admin_count FROM public.profiles WHERE role = 'admin' AND active = true;
    IF _admin_count <= 1 THEN RAISE EXCEPTION 'Não é possível remover o último administrador do sistema'; END IF;
  END IF;
  UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (_admin_id, 'update_role', target_user_id, jsonb_build_object('new_role', new_role));
END;
$$;

-- ============================================================
-- BLOCO E: admin_delete_user (soft delete) com proteção último admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID; _admin_count INTEGER;
BEGIN
  _admin_id := auth.uid();
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  IF (SELECT role FROM public.profiles WHERE id = target_user_id) = 'admin' THEN
    SELECT COUNT(*) INTO _admin_count FROM public.profiles WHERE role = 'admin' AND active = true AND id != target_user_id;
    IF _admin_count = 0 THEN RAISE EXCEPTION 'Não é possível excluir o último administrador do sistema'; END IF;
  END IF;
  UPDATE public.profiles SET active = false,
    deactivated_by = _admin_id,
    deactivated_at = NOW()
  WHERE id = target_user_id;
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (_admin_id, 'delete_user', target_user_id, '{}'::jsonb);
END;
$$;

-- ============================================================
-- BLOCO F: admin_log_action — registrar ação manualmente
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_log_action(
  p_action_type TEXT, p_target_user_id UUID,
  p_old_value TEXT DEFAULT NULL, p_new_value TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (auth.uid(), p_action_type, p_target_user_id,
    jsonb_build_object('old_value', p_old_value, 'new_value', p_new_value));
$$;

-- ============================================================
-- BLOCO G: RPC para listar TODOS os logs de auditoria admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_list_audit_logs()
RETURNS TABLE (id UUID, admin_id UUID, admin_name TEXT, action TEXT, target_name TEXT, details JSONB, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can view logs';
  END IF;
  RETURN QUERY
  SELECT al.id, al.admin_id, adm.full_name AS admin_name, al.action,
         COALESCE(tgt.full_name, tgt.email::TEXT) AS target_name,
         al.details, al.created_at
  FROM public.admin_audit_log al
  LEFT JOIN public.profiles adm ON adm.id = al.admin_id
  LEFT JOIN public.profiles tgt ON tgt.id = al.target_user_id
  LEFT JOIN auth.users u ON u.id = al.target_user_id
  ORDER BY al.created_at DESC
  LIMIT 200;
END;
$$;

-- ============================================================
-- BLOCO H: Ajustar RLS da emergency_logs para admin ler todos
-- ============================================================
DROP POLICY IF EXISTS "Users can view own logs" ON public.emergency_logs;
CREATE POLICY "Users can view own logs"
  ON public.emergency_logs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- BLOCO I: RPC para listar TODOS os acessos de emergência
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_list_emergency_logs()
RETURNS TABLE (id UUID, user_id UUID, user_name TEXT, accessed_at TIMESTAMPTZ, ip_address TEXT, user_agent TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can view logs';
  END IF;
  RETURN QUERY
  SELECT el.id, el.user_id, COALESCE(p.full_name, u.email::TEXT) AS user_name,
         el.accessed_at, el.ip_address, el.user_agent
  FROM public.emergency_logs el
  LEFT JOIN public.profiles p ON p.id = el.user_id
  LEFT JOIN auth.users u ON u.id = el.user_id
  ORDER BY el.accessed_at DESC
  LIMIT 200;
END;
$$;
