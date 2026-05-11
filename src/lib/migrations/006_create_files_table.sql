-- Files table for document management
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'document', 'image', 'audio', 'video', 'other'
  file_size BIGINT,
  mime_type VARCHAR(100),
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  tags TEXT[], -- Array of tags for better organization
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_case ON files(case_id);
CREATE INDEX IF NOT EXISTS idx_files_client ON files(client_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_tags ON files USING GIN(tags);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view files" ON files FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create files" ON files FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update files" ON files FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete files" ON files FOR DELETE USING (auth.role() = 'authenticated');
