-- Hearings tablosu
CREATE TABLE IF NOT EXISTS hearings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES users(id),
  hearing_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_hearings_case ON hearings(case_id);
CREATE INDEX IF NOT EXISTS idx_hearings_lawyer ON hearings(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_hearings_date ON hearings(hearing_at);

-- RLS
ALTER TABLE hearings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can see hearings" ON hearings
  FOR SELECT USING (true);

CREATE POLICY "lawyers can insert hearings" ON hearings
  FOR INSERT WITH CHECK (auth.uid() = lawyer_id);

CREATE POLICY "lawyers can update own hearings" ON hearings
  FOR UPDATE USING (auth.uid() = lawyer_id);