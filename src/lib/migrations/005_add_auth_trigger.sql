-- Create trigger to sync auth.users with users table
-- This automatically creates a user profile in the users table when a new auth user is created

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  safe_role text;
BEGIN
  safe_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' IN ('admin', 'lawyer', 'assistant')
      THEN NEW.raw_user_meta_data->>'role'
    ELSE 'lawyer'
  END;

  INSERT INTO public.users (id, full_name, email, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    safe_role,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, NEW.raw_user_meta_data->>'full_name', NEW.email),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync existing auth users to users table (with conflict handling)
INSERT INTO users (id, full_name, email, role, is_active)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  email,
  COALESCE(raw_user_meta_data->>'role', 'lawyer'),
  true
FROM auth.users
WHERE id NOT IN (SELECT id FROM users)
AND email NOT IN (SELECT email FROM users);
