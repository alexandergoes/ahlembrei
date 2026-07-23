-- ============================================================
-- Migration 019: Upload de docs liberado apenas para planos pagos
-- ============================================================

-- Remover policy pública anterior (se existir)
DROP POLICY IF EXISTS "Anyone can view documents" ON public.user_documents;

-- Leitura: qualquer pessoa pode ver (para emergência)
CREATE POLICY "Anyone can view documents"
  ON public.user_documents FOR SELECT
  USING (true);

-- Insert: apenas usuários com plano básico ou premium
DROP POLICY IF EXISTS "Users can insert own documents" ON public.user_documents;
CREATE POLICY "Users can insert own documents"
  ON public.user_documents FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND plan_type IN ('basic', 'premium')
    )
  );

-- Update: apenas dono
DROP POLICY IF EXISTS "Users can update own documents" ON public.user_documents;
CREATE POLICY "Users can update own documents"
  ON public.user_documents FOR UPDATE
  USING (auth.uid() = user_id);

-- Delete: apenas dono
DROP POLICY IF EXISTS "Users can delete own documents" ON public.user_documents;
CREATE POLICY "Users can delete own documents"
  ON public.user_documents FOR DELETE
  USING (auth.uid() = user_id);
