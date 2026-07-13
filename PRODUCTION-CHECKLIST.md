# Production Checklist

## Ortam

- [x] Production Supabase projesi hazır: `tanju` (`kiadepioopxitatedgig`).
- [ ] Vercel Environment Variables içinde `NEXT_PUBLIC_SUPABASE_URL=https://kiadepioopxitatedgig.supabase.co` tanımlı.
- [ ] Vercel Environment Variables içinde `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` tanımlı.
- [ ] Vercel Environment Variables içinde `SUPABASE_SERVICE_ROLE_KEY` yalnız server ortamında tanımlı.
- [ ] Vercel Environment Variables içinde `CRON_SECRET` güçlü ve benzersiz.
- [ ] VAPID anahtarları tanımlı veya push devre dışı kabul edildi.

## Veritabanı

- [x] `supabase/migrations/` zinciri production veritabanına uygulandı.
- [x] `profiles` auth trigger’ı aktif.
- [x] RLS tüm canonical tablolarda aktif.
- [x] İlk admin kullanıcı oluşturuldu ve pasif değil.
- [x] `lookup_values` başlangıç verileri yüklendi.

## Storage

- [x] `documents` bucket migration ile oluşturuldu.
- [x] Bucket public değil.
- [x] Dosya boyutu limiti 50 MB.
- [x] İzin verilen MIME türleri migration ile uyumlu.
- [ ] İndirme akışı signed URL üzerinden çalışıyor.

## Uygulama

- [ ] `npm ci` başarılı.
- [x] `npm run lint` başarılı.
- [x] `npm run typecheck` başarılı.
- [x] `npm test` başarılı.
- [x] `npm run build` başarılı.
- [ ] `/login` açılıyor.
- [ ] `/dashboard` oturum korumalı.
- [ ] Admin ekranları admin olmayan kullanıcıya kapalı.

## Cron ve bildirimler

- [ ] Cron servisi `/api/internal/reminders/run` endpoint’ini çağırıyor.
- [ ] Header: `Authorization: Bearer <CRON_SECRET>` veya `x-cron-secret`.
- [ ] Dry-run modu test edildi: `?dryRun=true`.
- [ ] Tekrarlı bildirim engelleme doğrulandı.

## Güvenlik

- [ ] Service role key client bundle içinde yok.
- [ ] `.env.local` ve secret dosyaları git’e dahil değil.
- [ ] Admin API route’ları server-side rol kontrolü yapıyor.
- [ ] Finans route’ları yalnız yetkili rollere açık.
- [ ] Audit log yalnız admin tarafından okunabiliyor.

## Kabul testi

- [ ] Müvekkil oluşturma.
- [ ] Dava dosyası oluşturma.
- [ ] İcra dosyası oluşturma.
- [ ] Ajanda kaydı ve görev tamamlama.
- [ ] Beklenen ödeme, tahsilat ve gider oluşturma.
- [ ] Belge yükleme ve indirme.
- [ ] Bildirim merkezi okundu işaretleme.
- [ ] Audit log filtreleme.
