-- Create trigger to sync auth.users with profiles table
-- This automatically creates a user profile when a new auth user is created.
-- Kept for legacy/manual migration flows; canonical migrations live in supabase/migrations.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_role text;
BEGIN
  safe_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'assistant');

  IF safe_role NOT IN ('admin', 'lawyer', 'assistant', 'finance') THEN
    safe_role := 'assistant';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NEW.email,
      ''
    ),
    COALESCE(NEW.email, ''),
    safe_role,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Sync existing auth users to profiles table.
INSERT INTO public.profiles (id, full_name, email, role, is_active)
SELECT
  id,
  COALESCE(
    NULLIF(raw_user_meta_data->>'full_name', ''),
    NULLIF(raw_user_meta_data->>'name', ''),
    email,
    ''
  ),
  COALESCE(email, ''),
  CASE
    WHEN raw_user_meta_data->>'role' IN ('admin', 'lawyer', 'assistant', 'finance')
      THEN raw_user_meta_data->>'role'
    ELSE 'assistant'
  END,
  true
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email),
  full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
  updated_at = NOW();
