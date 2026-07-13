-- Hukuk Büro Refactor v2 — Documents and Notifications
-- Scope: private document metadata and in-app notifications.

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('client', 'case_file', 'enforcement_file', 'calendar_event', 'receivable', 'payment', 'expense')),
  entity_id uuid NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  file_size bigint,
  storage_bucket text NOT NULL DEFAULT 'documents',
  storage_path text NOT NULL UNIQUE,
  description text,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archived_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  CHECK (file_size IS NULL OR file_size > 0)
);

CREATE INDEX idx_documents_entity ON public.documents(entity_type, entity_id);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX idx_documents_archived ON public.documents(archived_at) WHERE archived_at IS NOT NULL;

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text NOT NULL,
  entity_type text,
  entity_id uuid,
  link_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  CHECK (read_at IS NULL OR is_read = true)
);

CREATE INDEX idx_notifications_user_unread_created ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_entity ON public.notifications(entity_type, entity_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);

CREATE OR REPLACE FUNCTION public.sync_notification_read_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false AND NEW.read_at IS NULL THEN
    NEW.read_at := now();
  ELSIF NEW.is_read = false THEN
    NEW.read_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_notification_read_at_before_update
BEFORE UPDATE OF is_read ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.sync_notification_read_at();

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
