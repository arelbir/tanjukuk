# Güvenlik Kontrol Listesi

## Kimlik doğrulama

- [x] Oturum olmayan kullanıcılar korumalı uygulama alanlarından çıkarılır.
- [x] Pasif profil uygulama kabuğuna alınmaz.
- [x] Admin route’ları server-side rol kontrolü yapar.
- [x] Finans route’ları rol bazlı kontrol yapar.

## Yetkilendirme

- [x] Canonical tablolar RLS politikalarıyla korunur.
- [x] `profiles` tablosu kullanıcı/rol bilgisinin tek kaynağıdır.
- [x] Admin olmayan kullanıcılar `/admin` alanına yönlendirilmez.
- [x] Audit log yalnız admin tarafından okunur.

## Secret yönetimi

- [x] Service role key yalnız server-side route handler’larda kullanılır.
- [x] Browser tarafı Supabase client anon key ile çalışır.
- [x] Cron endpoint `CRON_SECRET` ister.
- [x] `.env.local` git dışında tutulur.

## Storage

- [x] `documents` bucket private yapıdadır.
- [x] Dosya yükleme için MIME ve boyut validasyonu yapılır.
- [x] İndirme signed URL ile yapılır.
- [x] Arşivli belgeler download route tarafından döndürülmez.

## Audit

- [x] Kullanıcı daveti/rol/durum değişiklikleri audit yazar.
- [x] Client create/update audit yazar.
- [x] Case create/update/archive audit yazar.
- [x] Enforcement create/update/archive audit yazar.
- [x] Calendar create/update/complete audit yazar.
- [x] Finance create işlemleri audit yazar.
- [x] Document create/archive audit yazar.
- [x] Lookup create/update/deactivate audit yazar.

## Veri bütünlüğü

- [x] Dava ve icra dosya kodları DB trigger ile üretilebilir.
- [x] Finans kayıtlarında dava ve icra dosyası aynı anda seçilemez.
- [x] Ajanda kayıtlarında dava ve icra dosyası aynı anda seçilemez.
- [x] Belge kayıtları canonical entity türleriyle bağlanır.

## Production önerileri

- [ ] Production Supabase anon/service role key rotasyonu planı oluştur.
- [ ] Cron secret periyodik değişim planı oluştur.
- [ ] Storage malware taraması gerekiyorsa harici servis ekle.
- [ ] Supabase backup/restore prosedürünü test et.
