-- ============================================================
-- Limpeza de registros órfãos
-- ============================================================

-- 1. Lista orphans (auth.users sem profiles)
SELECT id, email, created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ORDER BY created_at;

-- 2. Deleta orphans do auth.users (cascade para identity, sessions, etc)
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 3. Deleta profiles sem auth (não deve existir, mas segurança)
DELETE FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);

-- 4. Deleta emergency_contacts órfãos
DELETE FROM public.emergency_contacts ec
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = ec.user_id);

-- 5. Deleta security_questions órfãos
DELETE FROM public.security_questions sq
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = sq.user_id);

-- 6. Deleta emergency_logs órfãos
DELETE FROM public.emergency_logs el
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = el.user_id);
