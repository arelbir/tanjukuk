-- Hukuk Büro Refactor v2 — Finance
-- Scope: receivables, payments and expenses.

CREATE TABLE public.receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  case_file_id uuid REFERENCES public.case_files(id) ON DELETE SET NULL,
  enforcement_file_id uuid REFERENCES public.enforcement_files(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  expected_amount numeric(15,2) NOT NULL,
  paid_amount numeric(15,2) NOT NULL DEFAULT 0,
  remaining_amount numeric(15,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR', 'GBP')),
  due_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
  description text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  CHECK (expected_amount > 0),
  CHECK (paid_amount >= 0),
  CHECK (remaining_amount >= 0),
  CHECK (cancelled_at IS NULL OR status = 'cancelled'),
  CHECK (NOT (case_file_id IS NOT NULL AND enforcement_file_id IS NOT NULL))
);

CREATE INDEX idx_receivables_client ON public.receivables(client_id);
CREATE INDEX idx_receivables_case_file ON public.receivables(case_file_id);
CREATE INDEX idx_receivables_enforcement_file ON public.receivables(enforcement_file_id);
CREATE INDEX idx_receivables_status_due_date ON public.receivables(status, due_date);
CREATE INDEX idx_receivables_currency ON public.receivables(currency);
CREATE INDEX idx_receivables_created_at ON public.receivables(created_at DESC);

CREATE TRIGGER set_receivables_updated_at
BEFORE UPDATE ON public.receivables
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  receivable_id uuid REFERENCES public.receivables(id) ON DELETE SET NULL,
  case_file_id uuid REFERENCES public.case_files(id) ON DELETE SET NULL,
  enforcement_file_id uuid REFERENCES public.enforcement_files(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  payment_date date NOT NULL,
  amount numeric(15,2) NOT NULL,
  currency text NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR', 'GBP')),
  payment_method_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  description text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  CHECK (amount > 0),
  CHECK (NOT (case_file_id IS NOT NULL AND enforcement_file_id IS NOT NULL))
);

CREATE INDEX idx_payments_client ON public.payments(client_id);
CREATE INDEX idx_payments_receivable ON public.payments(receivable_id);
CREATE INDEX idx_payments_case_file ON public.payments(case_file_id);
CREATE INDEX idx_payments_enforcement_file ON public.payments(enforcement_file_id);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date DESC);
CREATE INDEX idx_payments_currency ON public.payments(currency);
CREATE INDEX idx_payments_cancelled ON public.payments(cancelled_at) WHERE cancelled_at IS NOT NULL;

CREATE TRIGGER set_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.sync_receivable_payment_totals(target_receivable_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expected numeric(15,2);
  paid numeric(15,2);
  next_status text;
BEGIN
  IF target_receivable_id IS NULL THEN
    RETURN;
  END IF;

  SELECT expected_amount INTO expected
  FROM public.receivables
  WHERE id = target_receivable_id;

  IF expected IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(amount), 0)::numeric(15,2)
  INTO paid
  FROM public.payments
  WHERE receivable_id = target_receivable_id
    AND cancelled_at IS NULL;

  IF paid <= 0 THEN
    next_status := 'pending';
  ELSIF paid < expected THEN
    next_status := 'partial';
  ELSE
    next_status := 'paid';
  END IF;

  UPDATE public.receivables
  SET paid_amount = paid,
      remaining_amount = GREATEST(expected - paid, 0),
      status = CASE WHEN status = 'cancelled' THEN status ELSE next_status END,
      updated_at = now()
  WHERE id = target_receivable_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_receivable_after_payment_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM public.sync_receivable_payment_totals(NEW.receivable_id);
  END IF;

  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM public.sync_receivable_payment_totals(OLD.receivable_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER sync_receivable_after_payment_insert
AFTER INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.sync_receivable_after_payment_change();

CREATE TRIGGER sync_receivable_after_payment_update
AFTER UPDATE OF receivable_id, amount, cancelled_at ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.sync_receivable_after_payment_change();

CREATE TRIGGER sync_receivable_after_payment_delete
AFTER DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.sync_receivable_after_payment_change();

CREATE OR REPLACE FUNCTION public.initialize_receivable_remaining_amount()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.paid_amount := COALESCE(NEW.paid_amount, 0);
    NEW.remaining_amount := GREATEST(NEW.expected_amount - NEW.paid_amount, 0);
    IF NEW.status <> 'cancelled' THEN
      IF NEW.paid_amount <= 0 THEN
        NEW.status := 'pending';
      ELSIF NEW.paid_amount < NEW.expected_amount THEN
        NEW.status := 'partial';
      ELSE
        NEW.status := 'paid';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER initialize_receivable_remaining_amount_before_insert
BEFORE INSERT ON public.receivables
FOR EACH ROW
EXECUTE FUNCTION public.initialize_receivable_remaining_amount();

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('case_file', 'enforcement_file', 'office', 'personal')),
  case_file_id uuid REFERENCES public.case_files(id) ON DELETE SET NULL,
  enforcement_file_id uuid REFERENCES public.enforcement_files(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  sub_category_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  expense_date date NOT NULL,
  amount numeric(15,2) NOT NULL,
  currency text NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR', 'GBP')),
  payment_method_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  document_ref text,
  description text,
  is_billable_to_client boolean NOT NULL DEFAULT false,
  is_reimbursed boolean NOT NULL DEFAULT false,
  reimbursed_amount numeric(15,2) NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  CHECK (amount > 0),
  CHECK (reimbursed_amount >= 0),
  CHECK (reimbursed_amount <= amount),
  CHECK (
    (scope = 'case_file' AND case_file_id IS NOT NULL AND enforcement_file_id IS NULL)
    OR (scope = 'enforcement_file' AND enforcement_file_id IS NOT NULL AND case_file_id IS NULL)
    OR (scope IN ('office', 'personal') AND case_file_id IS NULL AND enforcement_file_id IS NULL)
  )
);

CREATE INDEX idx_expenses_scope ON public.expenses(scope);
CREATE INDEX idx_expenses_case_file ON public.expenses(case_file_id);
CREATE INDEX idx_expenses_enforcement_file ON public.expenses(enforcement_file_id);
CREATE INDEX idx_expenses_category ON public.expenses(category_id);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date DESC);
CREATE INDEX idx_expenses_created_by ON public.expenses(created_by);
CREATE INDEX idx_expenses_currency ON public.expenses(currency);
CREATE INDEX idx_expenses_cancelled ON public.expenses(cancelled_at) WHERE cancelled_at IS NOT NULL;

CREATE TRIGGER set_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
