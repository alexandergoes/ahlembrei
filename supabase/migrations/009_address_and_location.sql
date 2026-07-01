-- ============================================================
-- BLOCO K: Adicionar campos de endereço à tabela profiles
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address_zipcode TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT,
  ADD COLUMN IF NOT EXISTS address_country TEXT DEFAULT 'Brasil';

-- ============================================================
-- Atualizar RPC admin_list_all_users para incluir address + phone
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_list_all_users()
RETURNS TABLE (
  id UUID, full_name TEXT, email TEXT, phone TEXT,
  plan_type TEXT, role TEXT, active BOOLEAN, created_at TIMESTAMPTZ,
  address_zipcode TEXT, address_street TEXT, address_number TEXT,
  address_complement TEXT, address_neighborhood TEXT,
  address_city TEXT, address_state TEXT, address_country TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p.id, p.full_name, u.email::TEXT, p.phone, p.plan_type,
         p.role, p.active, p.created_at,
         p.address_zipcode, p.address_street, p.address_number,
         p.address_complement, p.address_neighborhood,
         p.address_city, p.address_state, p.address_country
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
$$;

-- ============================================================
-- RPC para o próprio usuário atualizar seu endereço
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_my_address(
  p_zipcode TEXT, p_street TEXT, p_number TEXT,
  p_complement TEXT, p_neighborhood TEXT,
  p_city TEXT, p_state TEXT, p_country TEXT DEFAULT 'Brasil'
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.profiles SET
    address_zipcode = p_zipcode,
    address_street = p_street,
    address_number = p_number,
    address_complement = p_complement,
    address_neighborhood = p_neighborhood,
    address_city = p_city,
    address_state = p_state,
    address_country = p_country
  WHERE id = auth.uid();
$$;

