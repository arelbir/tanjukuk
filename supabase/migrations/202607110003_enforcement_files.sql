-- Hukuk Büro Refactor v2 — Enforcement Files
-- Scope: enforcement/collection files, atomic code assignment, totals and status history.

CREATE TABLE public.enforcement_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_code text NOT NULL UNIQUE,
  lawyer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  debtor_party text,
  client_position text NOT NULL CHECK (client_position IN ('creditor', 'debtor')),
  enforcement_type_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  status_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  office_city text,
  enforcement_office text,
  file_year int,
  file_no text,
  opened_at date,
  closed_at date,
  principal_amount numeric(15,2) NOT NULL DEFAULT 0,
  interest_amount numeric(15,2) NOT NULL DEFAULT 0,
  expense_amount numeric(15,2) NOT NULL DEFAULT 0,
  total_amount numeric(15,2) NOT NULL DEFAULT 0,
  collected_amount numeric(15,2) NOT NULL DEFAULT 0,
  remaining_amount numeric(15,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR', 'GBP')),
  description text,
  notes text,
  is_archived boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archived_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  CHECK (file_year IS NULL OR file_year BETWEEN 1900 AND 2100),
  CHECK (principal_amount >= 0),
  CHECK (interest_amount >= 0),
  CHECK (expense_amount >= 0),
  CHECK (total_amount >= 0),
  CHECK (collected_amount >= 0),
  CHECK (remaining_amount >= 0),
  CHECK (closed_at IS NULL OR opened_at IS NULL OR closed_at >= opened_at),
  CHECK (archived_at IS NULL OR is_archived = true)
);

CREATE INDEX idx_enforcement_files_file_code ON public.enforcement_files(file_code);
CREATE INDEX idx_enforcement_files_client ON public.enforcement_files(client_id);
CREATE INDEX idx_enforcement_files_lawyer ON public.enforcement_files(lawyer_id);
CREATE INDEX idx_enforcement_files_status ON public.enforcement_files(status_id);
CREATE INDEX idx_enforcement_files_type ON public.enforcement_files(enforcement_type_id);
CREATE INDEX idx_enforcement_files_opened_at ON public.enforcement_files(opened_at);
CREATE INDEX idx_enforcement_files_archived ON public.enforcement_files(is_archived);
CREATE INDEX idx_enforcement_files_created_at ON public.enforcement_files(created_at DESC);

CREATE OR REPLACE FUNCTION public.sync_enforcement_amounts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.total_amount := COALESCE(NEW.principal_amount, 0) + COALESCE(NEW.interest_amount, 0) + COALESCE(NEW.expense_amount, 0);
  NEW.remaining_amount := GREATEST(NEW.total_amount - COALESCE(NEW.collected_amount, 0), 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_enforcement_amounts_before_insert
BEFORE INSERT ON public.enforcement_files
FOR EACH ROW
EXECUTE FUNCTION public.sync_enforcement_amounts();

CREATE TRIGGER sync_enforcement_amounts_before_update
BEFORE UPDATE OF principal_amount, interest_amount, expense_amount, collected_amount ON public.enforcement_files
FOR EACH ROW
EXECUTE FUNCTION public.sync_enforcement_amounts();

CREATE TRIGGER set_enforcement_files_updated_at
BEFORE UPDATE ON public.enforcement_files
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.assign_enforcement_file_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.file_code IS NULL OR btrim(NEW.file_code) = '' THEN
    NEW.file_code := public.next_file_code('ICR');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_enforcement_file_code_before_insert
BEFORE INSERT ON public.enforcement_files
FOR EACH ROW
EXECUTE FUNCTION public.assign_enforcement_file_code();

CREATE TABLE public.enforcement_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enforcement_file_id uuid NOT NULL REFERENCES public.enforcement_files(id) ON DELETE CASCADE,
  old_status_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  new_status_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  note text
);

CREATE INDEX idx_enforcement_status_history_file ON public.enforcement_status_history(enforcement_file_id, changed_at DESC);
CREATE INDEX idx_enforcement_status_history_changed_by ON public.enforcement_status_history(changed_by);

CREATE OR REPLACE FUNCTION public.record_enforcement_status_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.enforcement_status_history(enforcement_file_id, old_status_id, new_status_id, changed_by, note)
    VALUES (NEW.id, NULL, NEW.status_id, NEW.created_by, 'İcra dosyası oluşturuldu');
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status_id IS DISTINCT FROM OLD.status_id THEN
    INSERT INTO public.enforcement_status_history(enforcement_file_id, old_status_id, new_status_id, changed_by, note)
    VALUES (NEW.id, OLD.status_id, NEW.status_id, auth.uid(), 'Durum değiştirildi');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER record_enforcement_status_history_after_insert
AFTER INSERT ON public.enforcement_files
FOR EACH ROW
EXECUTE FUNCTION public.record_enforcement_status_history();

CREATE TRIGGER record_enforcement_status_history_after_update
AFTER UPDATE OF status_id ON public.enforcement_files
FOR EACH ROW
EXECUTE FUNCTION public.record_enforcement_status_history();

ALTER TABLE public.enforcement_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enforcement_status_history ENABLE ROW LEVEL SECURITY;
