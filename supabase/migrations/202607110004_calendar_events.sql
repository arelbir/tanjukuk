-- Hukuk Büro Refactor v2 — Calendar Events
-- Scope: agenda events, hearings, appointments, tasks, deadlines and reminders.

CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('hearing', 'appointment', 'task', 'deadline', 'phone_call', 'meeting', 'document_work', 'payment_reminder', 'other')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  is_all_day boolean NOT NULL DEFAULT false,
  location text,
  description text,
  case_file_id uuid REFERENCES public.case_files(id) ON DELETE CASCADE,
  enforcement_file_id uuid REFERENCES public.enforcement_files(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  reminder_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at >= starts_at),
  CHECK (completed_at IS NULL OR is_completed = true),
  CHECK (NOT (case_file_id IS NOT NULL AND enforcement_file_id IS NOT NULL))
);

CREATE INDEX idx_calendar_events_starts_at ON public.calendar_events(starts_at);
CREATE INDEX idx_calendar_events_assigned_to_starts_at ON public.calendar_events(assigned_to, starts_at);
CREATE INDEX idx_calendar_events_type ON public.calendar_events(event_type);
CREATE INDEX idx_calendar_events_case_file ON public.calendar_events(case_file_id);
CREATE INDEX idx_calendar_events_enforcement_file ON public.calendar_events(enforcement_file_id);
CREATE INDEX idx_calendar_events_client ON public.calendar_events(client_id);
CREATE INDEX idx_calendar_events_completed ON public.calendar_events(is_completed);
CREATE INDEX idx_calendar_events_reminder_at ON public.calendar_events(reminder_at) WHERE reminder_at IS NOT NULL;

CREATE TRIGGER set_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.sync_calendar_event_completed_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false AND NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  ELSIF NEW.is_completed = false THEN
    NEW.completed_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_calendar_event_completed_at_before_update
BEFORE UPDATE OF is_completed ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.sync_calendar_event_completed_at();

CREATE TABLE public.hearing_details (
  event_id uuid PRIMARY KEY REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  court_room text,
  hearing_result text,
  interim_decision text,
  next_step text,
  next_hearing_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_hearing_details_next_hearing_at ON public.hearing_details(next_hearing_at) WHERE next_hearing_at IS NOT NULL;

CREATE TRIGGER set_hearing_details_updated_at
BEFORE UPDATE ON public.hearing_details
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.ensure_hearing_event_type()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  parent_type text;
BEGIN
  SELECT event_type INTO parent_type
  FROM public.calendar_events
  WHERE id = NEW.event_id;

  IF parent_type IS DISTINCT FROM 'hearing' THEN
    RAISE EXCEPTION 'hearing_details can only be attached to hearing calendar events';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_hearing_event_type_before_insert_or_update
BEFORE INSERT OR UPDATE ON public.hearing_details
FOR EACH ROW
EXECUTE FUNCTION public.ensure_hearing_event_type();

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearing_details ENABLE ROW LEVEL SECURITY;
