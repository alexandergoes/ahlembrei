-- ============================================================
-- Remover contas órfãs (sem perfil em public.profiles)
-- ============================================================

-- Primeiro verificar quais auth.users NÃO têm perfil
-- (apenas para conferência antes de deletar)
SELECT u.id, u.email, u.created_at
FROM auth.users u
WHERE u.id NOT IN (SELECT p.id FROM public.profiles p);

-- Deletar contas órfãs
-- NOTA: a deleção em auth.users cascateia via trigger para public.profiles,
-- mas como estas contas não têm perfil, só precisamos remover de auth.users
DELETE FROM auth.users
WHERE id IN (
  'ea6a595b-a1bd-4ca0-a1f3-c7806253f70b',
  'c1c52b40-0827-4eec-b1e2-ce7ff53f19a5'
);
