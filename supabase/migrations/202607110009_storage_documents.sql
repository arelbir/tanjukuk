-- Hukuk Büro Refactor v2 — Storage Documents Bucket
-- Scope: private Supabase Storage bucket for documents.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage object policies are intentionally conservative.
-- App/API routes will perform entity-level authorization and create signed URLs.
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authenticated users can view document objects" ON storage.objects;
CREATE POLICY "Authenticated users can view document objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authenticated users can update document objects" ON storage.objects;
CREATE POLICY "Authenticated users can update document objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authenticated users can delete document objects" ON storage.objects;
CREATE POLICY "Authenticated users can delete document objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
