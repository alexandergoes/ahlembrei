CREATE TABLE IF NOT EXISTS public.emergency_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE public.emergency_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON public.emergency_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert logs"
  ON public.emergency_logs
  FOR INSERT
  WITH CHECK (true);
