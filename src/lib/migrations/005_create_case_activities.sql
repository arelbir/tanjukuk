-- Case Activities table for tracking non-hearing actions
CREATE TABLE IF NOT EXISTS case_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_type_id UUID REFERENCES lookup_values(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 60,
    location VARCHAR(255),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_activities_case_id ON case_activities(case_id);
CREATE INDEX idx_case_activities_scheduled_at ON case_activities(scheduled_at);

-- Add activity_type lookup values (ignore if exists)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) 
SELECT 'activity_type', 'Toplantı', 1, true
WHERE NOT EXISTS (SELECT 1 FROM lookup_values WHERE group_key = 'activity_type' AND label = 'Toplantı');

INSERT INTO lookup_values (group_key, label, sort_order, is_active) 
SELECT 'activity_type', 'Araştırma', 2, true
WHERE NOT EXISTS (SELECT 1 FROM lookup_values WHERE group_key = 'activity_type' AND label = 'Araştırma');

INSERT INTO lookup_values (group_key, label, sort_order, is_active) 
SELECT 'activity_type', 'Başvuru', 3, true
WHERE NOT EXISTS (SELECT 1 FROM lookup_values WHERE group_key = 'activity_type' AND label = 'Başvuru');

INSERT INTO lookup_values (group_key, label, sort_order, is_active) 
SELECT 'activity_type', 'Belge Hazırlama', 4, true
WHERE NOT EXISTS (SELECT 1 FROM lookup_values WHERE group_key = 'activity_type' AND label = 'Belge Hazırlama');

INSERT INTO lookup_values (group_key, label, sort_order, is_active) 
SELECT 'activity_type', 'Müzakere', 5, true
WHERE NOT EXISTS (SELECT 1 FROM lookup_values WHERE group_key = 'activity_type' AND label = 'Müzakere');

INSERT INTO lookup_values (group_key, label, sort_order, is_active) 
SELECT 'activity_type', 'Mahkeme Ziyareti', 6, true
WHERE NOT EXISTS (SELECT 1 FROM lookup_values WHERE group_key = 'activity_type' AND label = 'Mahkeme Ziyareti');

INSERT INTO lookup_values (group_key, label, sort_order, is_active) 
SELECT 'activity_type', 'Müvekkil Görüşmesi', 7, true
WHERE NOT EXISTS (SELECT 1 FROM lookup_values WHERE group_key = 'activity_type' AND label = 'Müvekkil Görüşmesi');

INSERT INTO lookup_values (group_key, label, sort_order, is_active) 
SELECT 'activity_type', 'Diğer', 8, true
WHERE NOT EXISTS (SELECT 1 FROM lookup_values WHERE group_key = 'activity_type' AND label = 'Diğer');

-- Row Level Security
ALTER TABLE case_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can see case_activities" ON case_activities
  FOR SELECT USING (true);

CREATE POLICY "lawyers can insert case_activities" ON case_activities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "lawyers can update own case_activities" ON case_activities
  FOR UPDATE USING (true);
