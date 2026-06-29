import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ereamhbtvyhvpoerrtdz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZWFtaGJ0dnlodnBvZXJydGR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjUwMzEzOSwiZXhwIjoyMDk4MDc5MTM5fQ.Aunb2l3pXezIhIzMeabOsqhP2NovzP5CXD9cWQ8Hta0'
);

const sql = `
CREATE TABLE IF NOT EXISTS public.emergency_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);
ALTER TABLE public.emergency_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own logs" ON public.emergency_logs;
CREATE POLICY "Users can view own logs" ON public.emergency_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anyone can insert logs" ON public.emergency_logs;
CREATE POLICY "Anyone can insert logs" ON public.emergency_logs FOR INSERT WITH CHECK (true);
`;

const { data, error } = await supabase.rpc('exec_sql', { query: sql });
if (error) {
  console.error('Error:', error.message);
  // Try direct approach
  const { error: e2 } = await supabase.from('emergency_logs').select('id').limit(1);
  if (e2 && e2.code === 'PGRST116') {
    console.log('Table does not exist - need to create via SQL Editor');
    process.exit(1);
  }
  if (!e2) {
    console.log('Table already exists!');
  }
} else {
  console.log('Table created successfully!');
}
