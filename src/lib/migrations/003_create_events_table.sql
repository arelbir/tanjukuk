-- Unified events table for hearings and activities
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL DEFAULT 'activity',
  title VARCHAR(255),
  description TEXT,
  event_type_id UUID REFERENCES lookup_values(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  location VARCHAR(255),
  lawyer_id UUID REFERENCES users(id),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_case_id ON events(case_id);
CREATE INDEX IF NOT EXISTS idx_events_scheduled_at ON events(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_events_lawyer_id ON events(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Lawyers can create events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Lawyers can update events" ON events FOR UPDATE WITH CHECK (true);
