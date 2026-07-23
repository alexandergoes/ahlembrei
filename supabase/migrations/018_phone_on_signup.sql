-- ============================================================
-- Migration 018: Atualizar handle_new_user com phone + handle
-- ============================================================

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
      INSERT INTO public.profiles (id, full_name, phone, plan_type, handle)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'free',
        final_handle
      );
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      suffix := suffix + 1;
      IF suffix > 999 THEN
        final_handle := 'user' || floor(random() * 100000)::TEXT;
        INSERT INTO public.profiles (id, full_name, phone, plan_type, handle)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
          COALESCE(NEW.raw_user_meta_data->>'phone', ''),
          'free',
          final_handle
        );
        RETURN NEW;
      END IF;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
