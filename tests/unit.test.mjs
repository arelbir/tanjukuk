import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

test('canonical feature klasörleri mevcut', () => {
  for (const folder of ['clients', 'cases', 'enforcements', 'calendar', 'finance', 'documents', 'notifications', 'dashboard']) {
    assert.equal(existsSync(join(root, 'src', 'features', folder)), true, `${folder} feature klasörü eksik`)
  }
})

test('eski tablo adları yeni feature repositorylerinde kullanılmıyor', () => {
  const files = [
    'src/features/cases/repository.ts',
    'src/features/enforcements/repository.ts',
    'src/features/calendar/repository.ts',
    'src/features/finance/repository.ts',
  ]

  for (const file of files) {
    const content = read(file)
    assert.equal(content.includes("from('cases')"), false, `${file} eski cases tablosunu kullanıyor`)
    assert.equal(content.includes("from('events')"), false, `${file} eski events tablosunu kullanıyor`)
    assert.equal(content.includes("from('users')"), false, `${file} eski users tablosunu kullanıyor`)
  }
})

test('dokümantasyon dosyaları mevcut', () => {
  for (const file of ['README.md', 'DATA-MODEL.md', 'USAGE-FLOWS.md']) {
    assert.equal(existsSync(join(root, file)), true, `${file} eksik`)
  }
})

test('mobil-first route yapısı mevcut', () => {
  for (const route of ['home', 'files', 'calendar', 'finance', 'documents', 'more', 'notifications', 'login']) {
    assert.equal(existsSync(join(root, 'src', 'app', route)), true, `${route} route klasörü eksik`)
  }
})

test('eski route redirectleri korunuyor', () => {
  const redirects = {
    dashboard: '/home',
    cases: '/files?type=case',
    enforcements: '/files?type=enforcement',
    income: '/finance',
    expenses: '/finance',
  }

  for (const [route, target] of Object.entries(redirects)) {
    const content = read(`src/app/${route}/page.tsx`)
    assert.equal(content.includes(`redirect('${target}')`), true, `${route} redirect hedefi hatalı`)
  }
})

test('service worker next asset cachelemiyor', () => {
  const content = read('public/sw.js')
  const appShellLine = content.split('\n').find((line) => line.startsWith('const APP_SHELL')) || ''
  assert.equal(content.includes('/\\/_next\\//'), true, 'service worker _next assetlerini cache dışı bırakmalı')
  assert.equal(appShellLine.includes("'/'"), false, 'service worker root sayfayı app shell cache içine almamalı')
})
