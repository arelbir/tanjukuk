-- Hukuk Büro Refactor v2 — RLS Helper Functions
-- SECURITY DEFINER helpers avoid recursive policy checks on profiles.

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT p.is_active
    FROM public.profiles p
    WHERE p.id = auth.uid()
  ), false);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() = 'admin', false)
    AND public.current_user_is_active();
$$;

CREATE OR REPLACE FUNCTION public.is_assistant()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() = 'assistant', false)
    AND public.current_user_is_active();
$$;

CREATE OR REPLACE FUNCTION public.is_lawyer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() = 'lawyer', false)
    AND public.current_user_is_active();
$$;

CREATE OR REPLACE FUNCTION public.is_finance_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() IN ('admin', 'finance'), false)
    AND public.current_user_is_active();
$$;

CREATE OR REPLACE FUNCTION public.can_view_finance()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() IN ('admin', 'finance'), false)
    AND public.current_user_is_active();
$$;

CREATE OR REPLACE FUNCTION public.can_manage_finance()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() IN ('admin', 'finance'), false)
    AND public.current_user_is_active();
$$;

CREATE OR REPLACE FUNCTION public.can_manage_operations()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() IN ('admin', 'assistant'), false)
    AND public.current_user_is_active();
$$;

CREATE OR REPLACE FUNCTION public.can_view_case_file(target_case_file_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_is_active()
    AND (
      public.current_user_role() IN ('admin', 'assistant')
      OR EXISTS (
        SELECT 1
        FROM public.case_files cf
        WHERE cf.id = target_case_file_id
          AND cf.lawyer_id = auth.uid()
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.can_view_enforcement_file(target_enforcement_file_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_is_active()
    AND (
      public.current_user_role() IN ('admin', 'assistant')
      OR EXISTS (
        SELECT 1
        FROM public.enforcement_files ef
        WHERE ef.id = target_enforcement_file_id
          AND ef.lawyer_id = auth.uid()
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_case_file(target_case_file_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_is_active()
    AND (
      public.current_user_role() IN ('admin', 'assistant')
      OR EXISTS (
        SELECT 1
        FROM public.case_files cf
        WHERE cf.id = target_case_file_id
          AND cf.lawyer_id = auth.uid()
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_enforcement_file(target_enforcement_file_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_is_active()
    AND (
      public.current_user_role() IN ('admin', 'assistant')
      OR EXISTS (
        SELECT 1
        FROM public.enforcement_files ef
        WHERE ef.id = target_enforcement_file_id
          AND ef.lawyer_id = auth.uid()
      )
    );
$$;

REVOKE ALL ON FUNCTION public.current_profile_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_is_active() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_assistant() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_lawyer() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_finance_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_view_finance() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_finance() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_operations() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_view_case_file(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_view_enforcement_file(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_case_file(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_enforcement_file(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_profile_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_is_active() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_assistant() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_lawyer() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_finance_user() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_view_finance() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_finance() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_operations() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_view_case_file(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_view_enforcement_file(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_case_file(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_enforcement_file(uuid) TO authenticated, service_role;
