-- ============================================================
-- Migration 017: Garantir policies públicas para página de emergência
-- ============================================================

-- Emergency contacts: leitura pública (socorrista pode ver)
DROP POLICY IF EXISTS "Anyone can view emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Anyone can view emergency contacts"
  ON public.emergency_contacts FOR SELECT
  USING (true);

-- User documents: leitura pública (se o usuário permitir)
DROP POLICY IF EXISTS "Anyone can view documents" ON public.user_documents;
CREATE POLICY "Anyone can view documents"
  ON public.user_documents FOR SELECT
  USING (true);

-- Emergency logs: inserção pública (socorrista sem login pode registrar acesso)
DROP POLICY IF EXISTS "Anyone can insert logs" ON public.emergency_logs;
CREATE POLICY "Anyone can insert logs"
  ON public.emergency_logs FOR INSERT
  WITH CHECK (true);
