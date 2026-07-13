-- Hukuk Büro Refactor v2 — Initial Foundation
-- Scope: shared extensions, helper functions, profiles, lookup values, clients and file counters.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Shared timestamp trigger
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- Profiles synced with Supabase Auth
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'assistant' CHECK (role IN ('admin', 'lawyer', 'assistant', 'finance')),
  is_active boolean NOT NULL DEFAULT true,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role_active ON public.profiles(role, is_active);
CREATE INDEX idx_profiles_email ON public.profiles(email);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
BEGIN
  requested_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'assistant');

  IF requested_role NOT IN ('admin', 'lawyer', 'assistant', 'finance') THEN
    requested_role := 'assistant';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NULLIF(NEW.raw_user_meta_data->>'name', ''), NEW.email, ''),
    COALESCE(NEW.email, ''),
    requested_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- Central lookup values
-- -----------------------------------------------------------------------------
CREATE TABLE public.lookup_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key text NOT NULL,
  label text NOT NULL,
  code text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  parent_id uuid REFERENCES public.lookup_values(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_key, label)
);

CREATE INDEX idx_lookup_values_group_active ON public.lookup_values(group_key, is_active, sort_order);
CREATE INDEX idx_lookup_values_parent ON public.lookup_values(parent_id);
CREATE INDEX idx_lookup_values_code ON public.lookup_values(group_key, code) WHERE code IS NOT NULL;

CREATE TRIGGER set_lookup_values_updated_at
BEFORE UPDATE ON public.lookup_values
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Clients
-- -----------------------------------------------------------------------------
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code text UNIQUE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('individual', 'company')),
  phone text,
  email text,
  address text,
  tax_number text,
  national_id text,
  company_representative text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archived_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  CHECK (archived_at IS NULL OR is_active = false)
);

CREATE INDEX idx_clients_name ON public.clients USING btree (name);
CREATE INDEX idx_clients_type ON public.clients(type);
CREATE INDEX idx_clients_active ON public.clients(is_active);
CREATE INDEX idx_clients_created_by ON public.clients(created_by);

CREATE TRIGGER set_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- File counters and atomic code generation
-- -----------------------------------------------------------------------------
CREATE TABLE public.file_counters (
  prefix text NOT NULL,
  year int NOT NULL,
  last_number int NOT NULL DEFAULT 0,
  PRIMARY KEY (prefix, year),
  CHECK (prefix IN ('DVA', 'ICR')),
  CHECK (year BETWEEN 2000 AND 2100),
  CHECK (last_number >= 0)
);

CREATE OR REPLACE FUNCTION public.next_file_code(file_prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year int := EXTRACT(YEAR FROM now())::int;
  next_number int;
BEGIN
  IF file_prefix NOT IN ('DVA', 'ICR') THEN
    RAISE EXCEPTION 'Unsupported file prefix: %', file_prefix;
  END IF;

  INSERT INTO public.file_counters(prefix, year, last_number)
  VALUES (file_prefix, current_year, 1)
  ON CONFLICT (prefix, year)
  DO UPDATE SET last_number = public.file_counters.last_number + 1
  RETURNING last_number INTO next_number;

  RETURN file_prefix || '-' || current_year::text || '-' || lpad(next_number::text, 4, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.next_file_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_file_code(text) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Enable RLS early; policies are added in a later migration.
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_counters ENABLE ROW LEVEL SECURITY;
