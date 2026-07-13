import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

test('RLS helper migration mevcut', () => {
  const content = read('supabase/migrations/202607110010_rls_helpers.sql')
  assert.equal(content.includes('is_admin'), true)
  assert.equal(content.includes('current_profile'), true)
})

test('core RLS policy migration ana tabloları kapsar', () => {
  const content = read('supabase/migrations/202607110011_core_rls_policies.sql')
  for (const table of ['clients', 'case_files', 'enforcement_files', 'calendar_events', 'receivables', 'payments', 'expenses', 'documents', 'notifications', 'audit_logs']) {
    assert.equal(content.includes(table), true, `${table} RLS migration içinde bulunamadı`)
  }
})

test('audit log update/delete koruması dokümante edilmiştir', () => {
  const content = read('DATA-MODEL.md')
  assert.equal(content.includes('Update/delete engellenmelidir'), true)
})
