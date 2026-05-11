-- Add all missing foreign key constraints for all tables
-- This ensures all tables have proper foreign key relationships

-- Income records foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'income_records_client_id_fkey' 
        AND conrelid = 'income_records'::regclass
    ) THEN
        ALTER TABLE income_records 
        ADD CONSTRAINT income_records_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'income_records_category_id_fkey' 
        AND conrelid = 'income_records'::regclass
    ) THEN
        ALTER TABLE income_records 
        ADD CONSTRAINT income_records_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES lookup_values(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'income_records_case_id_fkey' 
        AND conrelid = 'income_records'::regclass
    ) THEN
        ALTER TABLE income_records 
        ADD CONSTRAINT income_records_case_id_fkey 
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Expense records foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'expense_records_category_id_fkey' 
        AND conrelid = 'expense_records'::regclass
    ) THEN
        ALTER TABLE expense_records 
        ADD CONSTRAINT expense_records_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES lookup_values(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'expense_records_sub_category_id_fkey' 
        AND conrelid = 'expense_records'::regclass
    ) THEN
        ALTER TABLE expense_records 
        ADD CONSTRAINT expense_records_sub_category_id_fkey 
        FOREIGN KEY (sub_category_id) REFERENCES lookup_values(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'expense_records_case_id_fkey' 
        AND conrelid = 'expense_records'::regclass
    ) THEN
        ALTER TABLE expense_records 
        ADD CONSTRAINT expense_records_case_id_fkey 
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'expense_records_recorded_by_fkey' 
        AND conrelid = 'expense_records'::regclass
    ) THEN
        ALTER TABLE expense_records 
        ADD CONSTRAINT expense_records_recorded_by_fkey 
        FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Events foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'events_case_id_fkey' 
        AND conrelid = 'events'::regclass
    ) THEN
        ALTER TABLE events 
        ADD CONSTRAINT events_case_id_fkey 
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'events_lawyer_id_fkey' 
        AND conrelid = 'events'::regclass
    ) THEN
        ALTER TABLE events 
        ADD CONSTRAINT events_lawyer_id_fkey 
        FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'events_event_type_id_fkey' 
        AND conrelid = 'events'::regclass
    ) THEN
        ALTER TABLE events 
        ADD CONSTRAINT events_event_type_id_fkey 
        FOREIGN KEY (event_type_id) REFERENCES lookup_values(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'events_created_by_fkey' 
        AND conrelid = 'events'::regclass
    ) THEN
        ALTER TABLE events 
        ADD CONSTRAINT events_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Files foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'files_case_id_fkey' 
        AND conrelid = 'files'::regclass
    ) THEN
        ALTER TABLE files 
        ADD CONSTRAINT files_case_id_fkey 
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'files_client_id_fkey' 
        AND conrelid = 'files'::regclass
    ) THEN
        ALTER TABLE files 
        ADD CONSTRAINT files_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'files_uploaded_by_fkey' 
        AND conrelid = 'files'::regclass
    ) THEN
        ALTER TABLE files 
        ADD CONSTRAINT files_uploaded_by_fkey 
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Notifications foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notifications_user_id_fkey' 
        AND conrelid = 'notifications'::regclass
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Notification deliveries foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notification_deliveries_notification_id_fkey' 
        AND conrelid = 'notification_deliveries'::regclass
    ) THEN
        ALTER TABLE notification_deliveries 
        ADD CONSTRAINT notification_deliveries_notification_id_fkey 
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Push subscriptions foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'push_subscriptions_user_id_fkey' 
        AND conrelid = 'push_subscriptions'::regclass
    ) THEN
        ALTER TABLE push_subscriptions 
        ADD CONSTRAINT push_subscriptions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;
