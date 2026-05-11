-- Create base tables for Hukuk Bürosu system
-- This is a clean, fresh start without any legacy migrations

-- Users table (synced with Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'lawyer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lookup values table for centralized dropdown management
CREATE TABLE IF NOT EXISTS lookup_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES lookup_values(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_key, label)
);

CREATE INDEX IF NOT EXISTS idx_lookup_values_group ON lookup_values(group_key, is_active);
CREATE INDEX IF NOT EXISTS idx_lookup_values_parent ON lookup_values(parent_id);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'individual' | 'company'
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  tax_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  opposing_party VARCHAR(255),
  client_role_id UUID REFERENCES lookup_values(id) ON DELETE SET NULL,
  entity_type VARCHAR(50), -- 'individual' | 'company'
  court_city VARCHAR(100),
  court_district VARCHAR(100),
  court_type_id UUID REFERENCES lookup_values(id) ON DELETE SET NULL,
  court_no VARCHAR(50),
  case_type_id UUID REFERENCES lookup_values(id) ON DELETE SET NULL,
  status_id UUID REFERENCES lookup_values(id) ON DELETE SET NULL,
  opened_at DATE,
  case_value DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'TRY',
  file_year INTEGER,
  file_no INTEGER,
  file_type_id UUID REFERENCES lookup_values(id) ON DELETE SET NULL,
  description TEXT,
  notes TEXT,
  verdict_result TEXT,
  verdict_for DECIMAL(15,2),
  verdict_against DECIMAL(15,2),
  lean_against VARCHAR(1), -- 'L' | 'K' | NULL
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_lawyer ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_client ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status_id);
CREATE INDEX IF NOT EXISTS idx_cases_type ON cases(case_type_id);
CREATE INDEX IF NOT EXISTS idx_cases_file_type ON cases(file_type_id);

-- Income records table
CREATE TABLE IF NOT EXISTS income_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  category_id UUID REFERENCES lookup_values(id) ON DELETE SET NULL,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  record_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TRY',
  payment_status VARCHAR(50) DEFAULT 'paid',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_income_client ON income_records(client_id);
CREATE INDEX IF NOT EXISTS idx_income_category ON income_records(category_id);
CREATE INDEX IF NOT EXISTS idx_income_case ON income_records(case_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON income_records(record_date);

-- Expense records table
CREATE TABLE IF NOT EXISTS expense_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES lookup_values(id) ON DELETE SET NULL,
  sub_category_id UUID REFERENCES lookup_values(id) ON DELETE SET NULL,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  record_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TRY',
  payment_method VARCHAR(50),
  expense_type VARCHAR(20) DEFAULT 'kurum', -- 'kurum' | 'kisisel'
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expense_category ON expense_records(category_id);
CREATE INDEX IF NOT EXISTS idx_expense_sub_category ON expense_records(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_expense_case ON expense_records(case_id);
CREATE INDEX IF NOT EXISTS idx_expense_date ON expense_records(record_date);
CREATE INDEX IF NOT EXISTS idx_expense_type ON expense_records(expense_type);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) NOT NULL,
  entity_id UUID,
  entity_type VARCHAR(50),
  link_url VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at DESC);

-- Notification deliveries table (for multi-channel delivery tracking)
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL, -- 'in_app', 'email', 'push', 'sms'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification ON notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries(status);

-- Push subscriptions table (for web push notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL, -- { p256dh, auth }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);

-- RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can see all users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Lookup values policies
CREATE POLICY "Authenticated users can view lookup values" ON lookup_values FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage lookup values" ON lookup_values
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users admin_user
    WHERE admin_user.id = auth.uid() AND admin_user.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users admin_user
    WHERE admin_user.id = auth.uid() AND admin_user.role = 'admin'
  )
);

-- Clients policies
CREATE POLICY "Authenticated users can view clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create clients" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update clients" ON clients FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Cases policies
CREATE POLICY "Authenticated users can view cases" ON cases FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create cases" ON cases FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update cases" ON cases FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Income records policies
CREATE POLICY "Authenticated users can view income records" ON income_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create income records" ON income_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update income records" ON income_records FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Expense records policies
CREATE POLICY "Authenticated users can view expense records" ON expense_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create expense records" ON expense_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update expense records" ON expense_records FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Notifications policies
CREATE POLICY "Users can see own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Notification deliveries policies
CREATE POLICY "Users can see own notification deliveries" ON notification_deliveries FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM notifications WHERE id = notification_id)
);
CREATE POLICY "System can insert notification deliveries" ON notification_deliveries FOR INSERT WITH CHECK (true);

-- Push subscriptions policies
CREATE POLICY "Users can see own push subscriptions" ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own push subscriptions" ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own push subscriptions" ON push_subscriptions FOR UPDATE WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own push subscriptions" ON push_subscriptions FOR DELETE USING (auth.uid() = user_id);
