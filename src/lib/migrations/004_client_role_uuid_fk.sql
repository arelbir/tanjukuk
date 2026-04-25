-- Migration: client_role TEXT → client_role_id UUID FK
-- cases.client_role_id → lookup_values.id (group_key = 'client_role')

-- 1. Yeni FK kolonu ekle
ALTER TABLE cases
  ADD COLUMN client_role_id UUID REFERENCES lookup_values(id) ON DELETE SET NULL;

-- 2. Mevcut Türkçe text değerleri UUID'ye dönüştür
UPDATE cases c
SET client_role_id = lv.id
FROM lookup_values lv
WHERE lv.group_key = 'client_role'
  AND lv.label     = c.client_role
  AND c.client_role IS NOT NULL;

-- 3. Eski kolonu kaldır (veriler taşındıktan sonra)
ALTER TABLE cases DROP COLUMN client_role;
