-- Add missing foreign key constraints (only if they don't exist)
-- Lawyer foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cases_lawyer_id_fkey' 
        AND conrelid = 'cases'::regclass
    ) THEN
        ALTER TABLE cases 
        ADD CONSTRAINT cases_lawyer_id_fkey 
        FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Court type foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cases_court_type_id_fkey' 
        AND conrelid = 'cases'::regclass
    ) THEN
        ALTER TABLE cases 
        ADD CONSTRAINT cases_court_type_id_fkey 
        FOREIGN KEY (court_type_id) REFERENCES lookup_values(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Case type foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cases_case_type_id_fkey' 
        AND conrelid = 'cases'::regclass
    ) THEN
        ALTER TABLE cases 
        ADD CONSTRAINT cases_case_type_id_fkey 
        FOREIGN KEY (case_type_id) REFERENCES lookup_values(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Status foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cases_status_id_fkey' 
        AND conrelid = 'cases'::regclass
    ) THEN
        ALTER TABLE cases 
        ADD CONSTRAINT cases_status_id_fkey 
        FOREIGN KEY (status_id) REFERENCES lookup_values(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Client role foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cases_client_role_id_fkey' 
        AND conrelid = 'cases'::regclass
    ) THEN
        ALTER TABLE cases 
        ADD CONSTRAINT cases_client_role_id_fkey 
        FOREIGN KEY (client_role_id) REFERENCES lookup_values(id) ON DELETE SET NULL;
    END IF;
END $$;

-- File type foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cases_file_type_id_fkey' 
        AND conrelid = 'cases'::regclass
    ) THEN
        ALTER TABLE cases 
        ADD CONSTRAINT cases_file_type_id_fkey 
        FOREIGN KEY (file_type_id) REFERENCES lookup_values(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Created by foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cases_created_by_fkey' 
        AND conrelid = 'cases'::regclass
    ) THEN
        ALTER TABLE cases 
        ADD CONSTRAINT cases_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;
