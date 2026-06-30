-- AhLembrei - Migration 005: Security Questions & Handle
-- Run this in the Supabase SQL Editor

-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add handle column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(handle);

-- 3. Security questions table
CREATE TABLE IF NOT EXISTS public.security_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Emergency access attempts log
ALTER TABLE public.emergency_logs ADD COLUMN IF NOT EXISTS access_method TEXT;
ALTER TABLE public.emergency_logs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'SUCCESS';
ALTER TABLE public.emergency_logs ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage own security questions"
  ON public.security_questions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read security question texts"
  ON public.security_questions FOR SELECT
  USING (true);

-- 5. RPC: Save security question (hashes answer server-side)
CREATE OR REPLACE FUNCTION public.save_security_question(p_user_id UUID, p_question_text TEXT, p_answer TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.security_questions (user_id, question_text, answer_hash)
  VALUES (p_user_id, p_question_text, crypt(p_answer, gen_salt('bf')))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- 6. RPC: Delete all security questions for a user (for re-setup)
CREATE OR REPLACE FUNCTION public.delete_security_questions(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.security_questions WHERE user_id = p_user_id;
END;
$$;

-- 7. RPC: Get random security questions for a user
CREATE OR REPLACE FUNCTION public.get_random_questions(p_user_id UUID, p_count INTEGER DEFAULT 2)
RETURNS TABLE(id UUID, question_text TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT sq.id, sq.question_text
  FROM public.security_questions sq
  WHERE sq.user_id = p_user_id
  ORDER BY RANDOM()
  LIMIT p_count;
END;
$$;

-- 8. RPC: Verify a single answer (compare hash server-side)
CREATE OR REPLACE FUNCTION public.verify_security_answer(p_question_id UUID, p_answer TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT answer_hash INTO stored_hash
  FROM public.security_questions
  WHERE id = p_question_id;

  RETURN stored_hash = crypt(p_answer, stored_hash);
END;
$$;

-- 9. RPC: Search profile by handle (minimal info only)
CREATE OR REPLACE FUNCTION public.search_by_handle(p_handle TEXT)
RETURNS TABLE(id UUID, full_name TEXT, photo_url TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.photo_url
  FROM public.profiles p
  WHERE LOWER(p.handle) = LOWER(p_handle)
  LIMIT 1;
END;
$$;

-- 10. RPC: Log security challenge failure
CREATE OR REPLACE FUNCTION public.log_security_failure(p_user_id UUID, p_attempts INTEGER)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.emergency_logs (user_id, status, attempt_count, access_method)
  VALUES (p_user_id, 'FAILED_CHALLENGE', p_attempts, 'handle_search');
END;
$$;

-- 11. RPC: Update handle (with uniqueness check)
CREATE OR REPLACE FUNCTION public.update_handle(p_user_id UUID, p_new_handle TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET handle = p_new_handle
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$;

-- 12. Update handle_new_user to generate default handle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_handle TEXT;
  final_handle TEXT;
  suffix INT := 0;
BEGIN
  base_handle := LOWER(COALESCE(NEW.raw_user_meta_data->>'full_name', 'user'));
  base_handle := REGEXP_REPLACE(base_handle, '[^a-z0-9]', '', 'g');
  base_handle := LEFT(base_handle, 12);

  LOOP
    IF suffix = 0 THEN
      final_handle := base_handle;
    ELSE
      final_handle := base_handle || suffix::TEXT;
    END IF;

    BEGIN
      INSERT INTO public.profiles (id, full_name, plan_type, handle)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'free',
        final_handle
      );
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      suffix := suffix + 1;
      IF suffix > 999 THEN
        final_handle := 'user' || floor(random() * 100000)::TEXT;
        INSERT INTO public.profiles (id, full_name, plan_type, handle)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
          'free',
          final_handle
        );
        RETURN NEW;
      END IF;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
