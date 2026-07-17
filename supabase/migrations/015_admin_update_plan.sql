CREATE OR REPLACE FUNCTION public.admin_update_plan(user_id UUID, new_plan TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET plan_type = new_plan, updated_at = now()
  WHERE id = user_id;
END;
$$;

