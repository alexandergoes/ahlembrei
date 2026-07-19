-- ============================================================
-- Migration 016: Adiciona role super_admin
--
-- super_admin tem os mesmos poderes de admin, mas não pode
-- ser rebaixado ou desativado por outro admin.
-- ============================================================

-- 1. Atualizar is_admin() para reconhecer super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

-- 2. Atualizar admin_update_user_role para aceitar super_admin
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id UUID, new_role TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID; _admin_count INTEGER; _target_role TEXT;
BEGIN
  _admin_id := auth.uid();
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can update roles';
  END IF;
  IF new_role NOT IN ('user', 'admin', 'super_admin') THEN RAISE EXCEPTION 'Invalid role: %', new_role; END IF;
  -- Apenas super_admin pode promover/rebaixar super_admin
  IF new_role = 'super_admin' AND (SELECT role FROM public.profiles WHERE id = _admin_id) != 'super_admin' THEN
    RAISE EXCEPTION 'Only super_admin can promote to super_admin';
  END IF;
  -- Não permitir rebaixar super_admin a menos que o próprio super_admin esteja agindo
  SELECT role INTO _target_role FROM public.profiles WHERE id = target_user_id;
  IF _target_role = 'super_admin' AND (SELECT role FROM public.profiles WHERE id = _admin_id) != 'super_admin' THEN
    RAISE EXCEPTION 'Cannot modify a super_admin user';
  END IF;
  IF target_user_id = _admin_id AND new_role != 'admin' THEN
    SELECT COUNT(*) INTO _admin_count FROM public.profiles WHERE role IN ('admin', 'super_admin') AND active = true;
    IF _admin_count <= 1 THEN RAISE EXCEPTION 'Não é possível remover o último administrador do sistema'; END IF;
  END IF;
  UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (_admin_id, 'update_role', target_user_id, jsonb_build_object('new_role', new_role));
END;
$$;

-- 3. Proteger super_admin em admin_toggle_user_active
CREATE OR REPLACE FUNCTION public.admin_toggle_user_active(target_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID; _new_status BOOLEAN; _admin_count INTEGER; _target_role TEXT;
BEGIN
  _admin_id := auth.uid();
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can toggle user status';
  END IF;
  SELECT role INTO _target_role FROM public.profiles WHERE id = target_user_id;
  IF _target_role = 'super_admin' THEN
    RAISE EXCEPTION 'Cannot deactivate a super_admin user';
  END IF;
  SELECT NOT COALESCE(active, true) INTO _new_status FROM public.profiles WHERE id = target_user_id;
  IF _new_status = false AND _target_role IN ('admin', 'super_admin') THEN
    SELECT COUNT(*) INTO _admin_count FROM public.profiles WHERE role IN ('admin', 'super_admin') AND active = true AND id != target_user_id;
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

-- 4. Proteger super_admin em admin_delete_user
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _admin_id UUID; _admin_count INTEGER; _target_role TEXT;
BEGIN
  _admin_id := auth.uid();
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  SELECT role INTO _target_role FROM public.profiles WHERE id = target_user_id;
  IF _target_role = 'super_admin' THEN
    RAISE EXCEPTION 'Cannot delete a super_admin user';
  END IF;
  IF _target_role IN ('admin', 'super_admin') THEN
    SELECT COUNT(*) INTO _admin_count FROM public.profiles WHERE role IN ('admin', 'super_admin') AND active = true AND id != target_user_id;
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
