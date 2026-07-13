-- Hukuk Büro Refactor v2 — Case Files
-- Scope: litigation case files, atomic code assignment and status history.

CREATE TABLE public.case_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_code text NOT NULL UNIQUE,
  lawyer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  opposing_party text,
  client_role_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  case_type_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  status_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  court_city text,
  court_district text,
  court_type_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  court_no text,
  file_year int,
  file_no text,
  opened_at date,
  closed_at date,
  case_value numeric(15,2),
  currency text NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR', 'GBP')),
  lean_result text CHECK (lean_result IN ('favorable', 'against', 'partial') OR lean_result IS NULL),
  verdict_result text,
  verdict_for numeric(15,2),
  verdict_against numeric(15,2),
  description text,
  notes text,
  is_archived boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archived_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  CHECK (case_value IS NULL OR case_value >= 0),
  CHECK (verdict_for IS NULL OR verdict_for >= 0),
  CHECK (verdict_against IS NULL OR verdict_against >= 0),
  CHECK (file_year IS NULL OR file_year BETWEEN 1900 AND 2100),
  CHECK (closed_at IS NULL OR opened_at IS NULL OR closed_at >= opened_at),
  CHECK (archived_at IS NULL OR is_archived = true)
);

CREATE INDEX idx_case_files_file_code ON public.case_files(file_code);
CREATE INDEX idx_case_files_client ON public.case_files(client_id);
CREATE INDEX idx_case_files_lawyer ON public.case_files(lawyer_id);
CREATE INDEX idx_case_files_status ON public.case_files(status_id);
CREATE INDEX idx_case_files_case_type ON public.case_files(case_type_id);
CREATE INDEX idx_case_files_opened_at ON public.case_files(opened_at);
CREATE INDEX idx_case_files_archived ON public.case_files(is_archived);
CREATE INDEX idx_case_files_created_at ON public.case_files(created_at DESC);

CREATE TRIGGER set_case_files_updated_at
BEFORE UPDATE ON public.case_files
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.assign_case_file_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.file_code IS NULL OR btrim(NEW.file_code) = '' THEN
    NEW.file_code := public.next_file_code('DVA');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_case_file_code_before_insert
BEFORE INSERT ON public.case_files
FOR EACH ROW
EXECUTE FUNCTION public.assign_case_file_code();

CREATE TABLE public.case_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES public.case_files(id) ON DELETE CASCADE,
  old_status_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  new_status_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  note text
);

CREATE INDEX idx_case_status_history_case ON public.case_status_history(case_file_id, changed_at DESC);
CREATE INDEX idx_case_status_history_changed_by ON public.case_status_history(changed_by);

CREATE OR REPLACE FUNCTION public.record_case_status_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.case_status_history(case_file_id, old_status_id, new_status_id, changed_by, note)
    VALUES (NEW.id, NULL, NEW.status_id, NEW.created_by, 'Dosya oluşturuldu');
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status_id IS DISTINCT FROM OLD.status_id THEN
    INSERT INTO public.case_status_history(case_file_id, old_status_id, new_status_id, changed_by, note)
    VALUES (NEW.id, OLD.status_id, NEW.status_id, auth.uid(), 'Durum değiştirildi');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER record_case_status_history_after_insert
AFTER INSERT ON public.case_files
FOR EACH ROW
EXECUTE FUNCTION public.record_case_status_history();

CREATE TRIGGER record_case_status_history_after_update
AFTER UPDATE OF status_id ON public.case_files
FOR EACH ROW
EXECUTE FUNCTION public.record_case_status_history();

ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_status_history ENABLE ROW LEVEL SECURITY;
