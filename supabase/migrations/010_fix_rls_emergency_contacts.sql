-- ============================================================
-- BLOCO L: Garantir RLS público para emergency_contacts e medical_records
-- ============================================================

-- Emergency contacts: garantir política pública de leitura
DROP POLICY IF EXISTS "Anyone can view emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Anyone can view emergency contacts"
  ON public.emergency_contacts FOR SELECT
  USING (true);

-- Medical records: garantir política pública de leitura
DROP POLICY IF EXISTS "Anyone can view medical records" ON public.medical_records;
CREATE POLICY "Anyone can view medical records"
  ON public.medical_records FOR SELECT
  USING (true);

-- User documents: garantir política pública de leitura
DROP POLICY IF EXISTS "Anyone can view documents" ON public.user_documents;
CREATE POLICY "Anyone can view documents"
  ON public.user_documents FOR SELECT
  USING (true);
