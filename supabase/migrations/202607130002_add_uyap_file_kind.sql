-- Add UYAP sequence kind for formatting official court/enforcement file names.

ALTER TABLE public.case_files
ADD COLUMN IF NOT EXISTS uyap_file_kind text NOT NULL DEFAULT 'E' CHECK (uyap_file_kind IN ('E', 'K', 'D_IS', 'TAL'));

ALTER TABLE public.enforcement_files
ADD COLUMN IF NOT EXISTS uyap_file_kind text NOT NULL DEFAULT 'E' CHECK (uyap_file_kind IN ('E', 'K', 'D_IS', 'TAL'));

CREATE INDEX IF NOT EXISTS idx_case_files_uyap_file_kind ON public.case_files(uyap_file_kind);
CREATE INDEX IF NOT EXISTS idx_enforcement_files_uyap_file_kind ON public.enforcement_files(uyap_file_kind);
