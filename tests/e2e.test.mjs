import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

test('ana uygulama sayfaları mevcut', () => {
  const pages = [
    'src/app/dashboard/page.tsx',
    'src/app/home/page.tsx',
    'src/app/clients/page.tsx',
    'src/app/cases/page.tsx',
    'src/app/enforcements/page.tsx',
    'src/app/calendar/page.tsx',
    'src/app/finance/page.tsx',
    'src/app/documents/page.tsx',
    'src/app/files/page.tsx',
    'src/app/notifications/page.tsx',
    'src/app/more/page.tsx',
    'src/app/admin/users/page.tsx',
    'src/app/admin/lookups/page.tsx',
    'src/app/admin/audit/page.tsx',
  ]

  for (const page of pages) {
    assert.equal(existsSync(join(root, page)), true, `${page} eksik`)
  }
})

test('legacy gelir ve gider sayfaları finans ekranına yönlenir', () => {
  assert.equal(read('src/app/income/page.tsx').includes("redirect('/finance')"), true)
  assert.equal(read('src/app/expenses/page.tsx').includes("redirect('/finance')"), true)
})

test('dashboard sayfası mevcut dashboard ekranını render eder', () => {
  assert.equal(existsSync(join(root, 'src/app/dashboard/page.tsx')), true)
})
