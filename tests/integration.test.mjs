import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

test('kritik API route dosyaları mevcut', () => {
  const routes = [
    'src/app/api/clients/route.ts',
    'src/app/api/cases/route.ts',
    'src/app/api/enforcements/route.ts',
    'src/app/api/calendar/events/route.ts',
    'src/app/api/finance/receivables/route.ts',
    'src/app/api/finance/payments/route.ts',
    'src/app/api/finance/expenses/route.ts',
    'src/app/api/documents/route.ts',
    'src/app/api/documents/[id]/download/route.ts',
    'src/app/api/internal/reminders/run/route.ts',
  ]

  for (const route of routes) {
    assert.equal(existsSync(join(root, route)), true, `${route} eksik`)
  }
})

test('kritik API route dosyaları aktif kullanıcı kontrolü içerir', () => {
  const routes = [
    'src/app/api/cases/route.ts',
    'src/app/api/enforcements/route.ts',
    'src/app/api/calendar/events/route.ts',
    'src/app/api/finance/receivables/route.ts',
    'src/app/api/documents/route.ts',
  ]

  for (const route of routes) {
    const content = read(route)
    assert.equal(content.includes('Oturum bulunamadı'), true, `${route} oturum kontrolü eksik`)
    assert.equal(content.includes('Aktif kullanıcı bulunamadı'), true, `${route} aktif profil kontrolü eksik`)
  }
})

test('reminder route cron secret kontrolü içerir', () => {
  const content = read('src/app/api/internal/reminders/run/route.ts')
  assert.equal(content.includes('CRON_SECRET'), true)
  assert.equal(content.includes('authorization'), true)
})
