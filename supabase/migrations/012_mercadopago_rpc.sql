-- ============================================================
-- RPC para atualizar plano do próprio usuário (Mercado Pago)
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_my_plan(new_plan TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET plan_type = new_plan, updated_at = now()
  WHERE id = auth.uid();
END;
$$;
