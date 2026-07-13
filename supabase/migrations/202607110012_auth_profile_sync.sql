-- Auth profile synchronization
-- -----------------------------------------------------------------------------
-- Keeps public.profiles aligned with auth.users and defines the default role for
-- newly created users that do not provide a valid role in auth metadata.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
  profile_email text;
  profile_full_name text;
BEGIN
  requested_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'assistant');

  IF requested_role NOT IN ('admin', 'lawyer', 'assistant', 'finance') THEN
    requested_role := 'assistant';
  END IF;

  profile_email := COALESCE(NEW.email, '');
  profile_full_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    ''
  );

  INSERT INTO public.profiles (id, full_name, email, role, is_active)
  VALUES (
    NEW.id,
    profile_full_name,
    profile_email,
    requested_role,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    email = COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email),
    role = CASE
      WHEN public.profiles.role = 'admin' THEN public.profiles.role
      ELSE EXCLUDED.role
    END,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();

-- Backfill profiles for existing auth users. Existing profile roles and active
-- status are preserved; missing/invalid metadata roles default to assistant.
INSERT INTO public.profiles (id, full_name, email, role, is_active)
SELECT
  au.id,
  COALESCE(
    NULLIF(au.raw_user_meta_data->>'full_name', ''),
    NULLIF(au.raw_user_meta_data->>'name', ''),
    au.email,
    ''
  ) AS full_name,
  COALESCE(au.email, '') AS email,
  CASE
    WHEN au.raw_user_meta_data->>'role' IN ('admin', 'lawyer', 'assistant', 'finance')
      THEN au.raw_user_meta_data->>'role'
    ELSE 'assistant'
  END AS role,
  true AS is_active
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
  email = COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email),
  updated_at = now();
