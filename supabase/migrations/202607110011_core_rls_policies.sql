-- Hukuk Büro Refactor v2 — Core RLS Policies
-- Scope: grants and table policies for profiles, lookups and the main domain tables.

-- -----------------------------------------------------------------------------
-- Explicit Data API grants
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_active_users" ON public.profiles;
CREATE POLICY "profiles_select_active_users"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    id = auth.uid()
    OR public.current_user_role() IN ('admin', 'assistant', 'finance', 'lawyer')
  )
);

DROP POLICY IF EXISTS "profiles_update_own_limited" ON public.profiles;
CREATE POLICY "profiles_update_own_limited"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.current_user_is_active() AND id = auth.uid())
WITH CHECK (
  public.current_user_is_active()
  AND id = auth.uid()
  AND role = public.current_user_role()
  AND is_active = true
);

DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;
CREATE POLICY "profiles_admin_manage"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- Lookup values
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "lookup_values_select_authenticated" ON public.lookup_values;
CREATE POLICY "lookup_values_select_authenticated"
ON public.lookup_values
FOR SELECT
TO authenticated
USING (public.current_user_is_active());

DROP POLICY IF EXISTS "lookup_values_admin_manage" ON public.lookup_values;
CREATE POLICY "lookup_values_admin_manage"
ON public.lookup_values
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- File counters: service/admin only. Users call next_file_code through SECURITY DEFINER.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "file_counters_admin_select" ON public.file_counters;
CREATE POLICY "file_counters_admin_select"
ON public.file_counters
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "file_counters_admin_manage" ON public.file_counters;
CREATE POLICY "file_counters_admin_manage"
ON public.file_counters
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- Clients
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "clients_select_active_users" ON public.clients;
CREATE POLICY "clients_select_active_users"
ON public.clients
FOR SELECT
TO authenticated
USING (public.current_user_is_active());

DROP POLICY IF EXISTS "clients_insert_operations" ON public.clients;
CREATE POLICY "clients_insert_operations"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_is_active());

DROP POLICY IF EXISTS "clients_update_operations" ON public.clients;
CREATE POLICY "clients_update_operations"
ON public.clients
FOR UPDATE
TO authenticated
USING (public.current_user_is_active())
WITH CHECK (public.current_user_is_active());

-- -----------------------------------------------------------------------------
-- Case files
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "case_files_select_by_role" ON public.case_files;
CREATE POLICY "case_files_select_by_role"
ON public.case_files
FOR SELECT
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    public.current_user_role() IN ('admin', 'assistant')
    OR lawyer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "case_files_insert_operations" ON public.case_files;
CREATE POLICY "case_files_insert_operations"
ON public.case_files
FOR INSERT
TO authenticated
WITH CHECK (
  public.current_user_is_active()
  AND public.current_user_role() IN ('admin', 'assistant', 'lawyer')
);

DROP POLICY IF EXISTS "case_files_update_by_role" ON public.case_files;
CREATE POLICY "case_files_update_by_role"
ON public.case_files
FOR UPDATE
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    public.current_user_role() IN ('admin', 'assistant')
    OR lawyer_id = auth.uid()
  )
)
WITH CHECK (
  public.current_user_is_active()
  AND (
    public.current_user_role() IN ('admin', 'assistant')
    OR lawyer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "case_status_history_select_by_case" ON public.case_status_history;
CREATE POLICY "case_status_history_select_by_case"
ON public.case_status_history
FOR SELECT
TO authenticated
USING (public.can_view_case_file(case_file_id));

DROP POLICY IF EXISTS "case_status_history_insert_by_case" ON public.case_status_history;
CREATE POLICY "case_status_history_insert_by_case"
ON public.case_status_history
FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_case_file(case_file_id));

-- -----------------------------------------------------------------------------
-- Enforcement files
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "enforcement_files_select_by_role" ON public.enforcement_files;
CREATE POLICY "enforcement_files_select_by_role"
ON public.enforcement_files
FOR SELECT
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    public.current_user_role() IN ('admin', 'assistant')
    OR lawyer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "enforcement_files_insert_operations" ON public.enforcement_files;
CREATE POLICY "enforcement_files_insert_operations"
ON public.enforcement_files
FOR INSERT
TO authenticated
WITH CHECK (
  public.current_user_is_active()
  AND public.current_user_role() IN ('admin', 'assistant', 'lawyer')
);

DROP POLICY IF EXISTS "enforcement_files_update_by_role" ON public.enforcement_files;
CREATE POLICY "enforcement_files_update_by_role"
ON public.enforcement_files
FOR UPDATE
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    public.current_user_role() IN ('admin', 'assistant')
    OR lawyer_id = auth.uid()
  )
)
WITH CHECK (
  public.current_user_is_active()
  AND (
    public.current_user_role() IN ('admin', 'assistant')
    OR lawyer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "enforcement_status_history_select_by_file" ON public.enforcement_status_history;
CREATE POLICY "enforcement_status_history_select_by_file"
ON public.enforcement_status_history
FOR SELECT
TO authenticated
USING (public.can_view_enforcement_file(enforcement_file_id));

DROP POLICY IF EXISTS "enforcement_status_history_insert_by_file" ON public.enforcement_status_history;
CREATE POLICY "enforcement_status_history_insert_by_file"
ON public.enforcement_status_history
FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_enforcement_file(enforcement_file_id));

-- -----------------------------------------------------------------------------
-- Calendar events and hearing details
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "calendar_events_select_by_role" ON public.calendar_events;
CREATE POLICY "calendar_events_select_by_role"
ON public.calendar_events
FOR SELECT
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    public.current_user_role() IN ('admin', 'assistant')
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR (case_file_id IS NOT NULL AND public.can_view_case_file(case_file_id))
    OR (enforcement_file_id IS NOT NULL AND public.can_view_enforcement_file(enforcement_file_id))
  )
);

DROP POLICY IF EXISTS "calendar_events_insert_active_users" ON public.calendar_events;
CREATE POLICY "calendar_events_insert_active_users"
ON public.calendar_events
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_is_active());

DROP POLICY IF EXISTS "calendar_events_update_by_role" ON public.calendar_events;
CREATE POLICY "calendar_events_update_by_role"
ON public.calendar_events
FOR UPDATE
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    public.current_user_role() IN ('admin', 'assistant')
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR (case_file_id IS NOT NULL AND public.can_manage_case_file(case_file_id))
    OR (enforcement_file_id IS NOT NULL AND public.can_manage_enforcement_file(enforcement_file_id))
  )
)
WITH CHECK (public.current_user_is_active());

DROP POLICY IF EXISTS "hearing_details_select_by_event" ON public.hearing_details;
CREATE POLICY "hearing_details_select_by_event"
ON public.hearing_details
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events ce
    WHERE ce.id = event_id
  )
);

DROP POLICY IF EXISTS "hearing_details_manage_by_event" ON public.hearing_details;
CREATE POLICY "hearing_details_manage_by_event"
ON public.hearing_details
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events ce
    WHERE ce.id = event_id
      AND (
        public.current_user_role() IN ('admin', 'assistant')
        OR ce.assigned_to = auth.uid()
        OR ce.created_by = auth.uid()
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.calendar_events ce
    WHERE ce.id = event_id
      AND (
        public.current_user_role() IN ('admin', 'assistant')
        OR ce.assigned_to = auth.uid()
        OR ce.created_by = auth.uid()
      )
  )
);

-- -----------------------------------------------------------------------------
-- Finance
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "receivables_select_by_role" ON public.receivables;
CREATE POLICY "receivables_select_by_role"
ON public.receivables
FOR SELECT
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    public.can_view_finance()
    OR (case_file_id IS NOT NULL AND public.can_view_case_file(case_file_id))
    OR (enforcement_file_id IS NOT NULL AND public.can_view_enforcement_file(enforcement_file_id))
  )
);

DROP POLICY IF EXISTS "receivables_manage_finance" ON public.receivables;
CREATE POLICY "receivables_manage_finance"
ON public.receivables
FOR ALL
TO authenticated
USING (public.can_manage_finance())
WITH CHECK (public.can_manage_finance());

DROP POLICY IF EXISTS "payments_select_by_role" ON public.payments;
CREATE POLICY "payments_select_by_role"
ON public.payments
FOR SELECT
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    public.can_view_finance()
    OR (case_file_id IS NOT NULL AND public.can_view_case_file(case_file_id))
    OR (enforcement_file_id IS NOT NULL AND public.can_view_enforcement_file(enforcement_file_id))
  )
);

DROP POLICY IF EXISTS "payments_manage_finance" ON public.payments;
CREATE POLICY "payments_manage_finance"
ON public.payments
FOR ALL
TO authenticated
USING (public.can_manage_finance())
WITH CHECK (public.can_manage_finance());

DROP POLICY IF EXISTS "expenses_select_by_role" ON public.expenses;
CREATE POLICY "expenses_select_by_role"
ON public.expenses
FOR SELECT
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    public.can_view_finance()
    OR (scope = 'personal' AND created_by = auth.uid())
    OR (scope = 'case_file' AND case_file_id IS NOT NULL AND public.can_view_case_file(case_file_id))
    OR (scope = 'enforcement_file' AND enforcement_file_id IS NOT NULL AND public.can_view_enforcement_file(enforcement_file_id))
  )
);

DROP POLICY IF EXISTS "expenses_insert_by_role" ON public.expenses;
CREATE POLICY "expenses_insert_by_role"
ON public.expenses
FOR INSERT
TO authenticated
WITH CHECK (
  public.current_user_is_active()
  AND (
    public.can_manage_finance()
    OR public.current_user_role() IN ('admin', 'assistant', 'lawyer')
  )
);

DROP POLICY IF EXISTS "expenses_update_by_role" ON public.expenses;
CREATE POLICY "expenses_update_by_role"
ON public.expenses
FOR UPDATE
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    public.can_manage_finance()
    OR created_by = auth.uid()
  )
)
WITH CHECK (
  public.current_user_is_active()
  AND (
    public.can_manage_finance()
    OR created_by = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- Documents, notifications, audit logs
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "documents_select_by_role" ON public.documents;
CREATE POLICY "documents_select_by_role"
ON public.documents
FOR SELECT
TO authenticated
USING (
  public.current_user_is_active()
  AND (
    public.is_admin()
    OR uploaded_by = auth.uid()
    OR (entity_type = 'client')
    OR (entity_type = 'case_file' AND public.can_view_case_file(entity_id))
    OR (entity_type = 'enforcement_file' AND public.can_view_enforcement_file(entity_id))
  )
);

DROP POLICY IF EXISTS "documents_insert_active_users" ON public.documents;
CREATE POLICY "documents_insert_active_users"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_is_active());

DROP POLICY IF EXISTS "documents_update_owner_admin" ON public.documents;
CREATE POLICY "documents_update_owner_admin"
ON public.documents
FOR UPDATE
TO authenticated
USING (public.is_admin() OR uploaded_by = auth.uid())
WITH CHECK (public.is_admin() OR uploaded_by = auth.uid());

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
ON public.notifications
FOR SELECT
TO authenticated
USING (public.current_user_is_active() AND user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
ON public.notifications
FOR UPDATE
TO authenticated
USING (public.current_user_is_active() AND user_id = auth.uid())
WITH CHECK (public.current_user_is_active() AND user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_admin_service" ON public.notifications;
CREATE POLICY "notifications_insert_admin_service"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_select_admin"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_insert_active" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_active"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_is_active());
