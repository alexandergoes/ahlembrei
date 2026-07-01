-- ============================================================
-- BLOCO 1: RPC simplificado para listar users com email
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
-- BLOCO 2: admin_toggle_user_active com proteção último admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_toggle_user_active(target_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID; _new_status BOOLEAN; _admin_count INTEGER;
BEGIN
  _admin_id := auth.uid();
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can toggle user status';
  END IF;
  SELECT NOT COALESCE(active, true) INTO _new_status FROM public.profiles WHERE id = target_user_id;
  -- Proteger último admin ativo
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
-- BLOCO 3: admin_update_user_role com proteção último admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id UUID, new_role TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID; _admin_count INTEGER;
BEGIN
  _admin_id := auth.uid();
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can update roles';
  END IF;
  IF new_role NOT IN ('user', 'admin') THEN RAISE EXCEPTION 'Invalid role: %', new_role; END IF;
  -- Proteger último admin ao se auto-rebaixar
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
-- BLOCO 4: admin_delete_user (soft delete)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID; _admin_count INTEGER;
BEGIN
  _admin_id := auth.uid();
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  -- Proteger último admin
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
