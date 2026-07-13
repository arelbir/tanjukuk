-- Harden file code generation against counters that were not seeded from existing files.
-- The API now generates file_code explicitly, but triggers and direct inserts should also
-- continue from the highest existing code instead of only trusting file_counters.

CREATE OR REPLACE FUNCTION public.next_file_code(file_prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year int := EXTRACT(YEAR FROM now())::int;
  existing_max int := 0;
  next_number int;
BEGIN
  IF file_prefix NOT IN ('DVA', 'ICR') THEN
    RAISE EXCEPTION 'Unsupported file prefix: %', file_prefix;
  END IF;

  IF file_prefix = 'DVA' THEN
    SELECT COALESCE(max((regexp_match(file_code, '^DVA-' || current_year::text || '-([0-9]{4})$'))[1]::int), 0)
    INTO existing_max
    FROM public.case_files
    WHERE file_code ~ ('^DVA-' || current_year::text || '-[0-9]{4}$');
  ELSE
    SELECT COALESCE(max((regexp_match(file_code, '^ICR-' || current_year::text || '-([0-9]{4})$'))[1]::int), 0)
    INTO existing_max
    FROM public.enforcement_files
    WHERE file_code ~ ('^ICR-' || current_year::text || '-[0-9]{4}$');
  END IF;

  INSERT INTO public.file_counters(prefix, year, last_number)
  VALUES (file_prefix, current_year, existing_max + 1)
  ON CONFLICT (prefix, year)
  DO UPDATE SET last_number = greatest(public.file_counters.last_number + 1, excluded.last_number)
  RETURNING last_number INTO next_number;

  RETURN file_prefix || '-' || current_year::text || '-' || lpad(next_number::text, 4, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.next_file_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_file_code(text) TO authenticated, service_role;

INSERT INTO public.file_counters(prefix, year, last_number)
VALUES
  (
    'DVA',
    EXTRACT(YEAR FROM now())::int,
    COALESCE((
      SELECT max((regexp_match(file_code, '^DVA-' || EXTRACT(YEAR FROM now())::int::text || '-([0-9]{4})$'))[1]::int)
      FROM public.case_files
      WHERE file_code ~ ('^DVA-' || EXTRACT(YEAR FROM now())::int::text || '-[0-9]{4}$')
    ), 0)
  ),
  (
    'ICR',
    EXTRACT(YEAR FROM now())::int,
    COALESCE((
      SELECT max((regexp_match(file_code, '^ICR-' || EXTRACT(YEAR FROM now())::int::text || '-([0-9]{4})$'))[1]::int)
      FROM public.enforcement_files
      WHERE file_code ~ ('^ICR-' || EXTRACT(YEAR FROM now())::int::text || '-[0-9]{4}$')
    ), 0)
  )
ON CONFLICT (prefix, year)
DO UPDATE SET last_number = greatest(public.file_counters.last_number, excluded.last_number);
