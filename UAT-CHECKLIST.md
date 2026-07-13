# Kullanıcı Kabul Testi Senaryoları

## Giriş ve rol kontrolü

- [ ] Admin kullanıcı giriş yapar ve `/dashboard` ekranını görür.
- [ ] Pasif kullanıcı giriş sonrası uygulamadan çıkarılır.
- [ ] Admin olmayan kullanıcı `/admin/users` ekranına erişemez.
- [ ] Lawyer rolü finans menüsünü göremez.
- [ ] Finance rolü finans ekranına erişebilir.

## Müvekkiller

- [ ] Yeni müvekkil oluşturulur.
- [ ] Müvekkil listesinde arama yapılır.
- [ ] Müvekkil detayında ilişkili dava/icra kayıtları görünür.
- [ ] Müvekkil bilgileri güncellenir.

## Davalar

- [ ] Yeni dava dosyası oluşturulur.
- [ ] Dava dosyası otomatik dosya kodu alır.
- [ ] Dava listesinde filtreleme yapılır.
- [ ] Dava detayında finans, ajanda, belge ve audit ilişkileri görünür.
- [ ] Dava dosyası arşivlenir ve arşivden çıkarılır.

## İcralar

- [ ] Yeni icra dosyası oluşturulur.
- [ ] İcra listesinde arama/filtreleme yapılır.
- [ ] İcra detayı açılır.
- [ ] İcra dosyası arşivlenir ve arşivden çıkarılır.

## Ajanda

- [ ] Görev oluşturulur.
- [ ] Duruşma oluşturulur ve duruşma detay alanları kaydedilir.
- [ ] Randevu oluşturulur.
- [ ] Son tarih oluşturulur.
- [ ] Gecikmiş görev uyarısı görünür.
- [ ] Görev tamamlandı olarak işaretlenir ve tekrar açılır.

## Finans

- [ ] Beklenen ödeme oluşturulur.
- [ ] Tahsilat oluşturulur.
- [ ] Gider oluşturulur.
- [ ] Finans özet kartları güncellenir.
- [ ] Vadesi geçmiş alacak filtrelenir.
- [ ] Dava/icra dosyası bağlantısı doğru görünür.

## Belgeler

- [ ] Müvekkile belge yüklenir.
- [ ] Dava dosyasına belge yüklenir.
- [ ] İcra dosyasına belge yüklenir.
- [ ] Desteklenmeyen dosya türü reddedilir.
- [ ] Belge indirilir.
- [ ] Belge arşivlenir ve arşivden çıkarılır.

## Bildirimler

- [ ] Reminder cron dry-run çalışır.
- [ ] Yaklaşan duruşma bildirimi üretilir.
- [ ] Vadesi geçmiş ödeme bildirimi üretilir.
- [ ] Bildirim merkezi okunmamış sayısını gösterir.
- [ ] Bildirim okundu işaretlenir.
- [ ] İlgili kayda yönlendirme yapılır.

## Dashboard

- [ ] Dashboard aktif dava/icra sayısını gösterir.
- [ ] Bugünkü ajanda görünür.
- [ ] Haftalık duruşmalar görünür.
- [ ] Finans özetleri görünür.
- [ ] Hızlı aksiyon butonları ilgili ekranlara gider.

## Yönetim

- [ ] Admin kullanıcı davet eder.
- [ ] Kullanıcı rolü değiştirilir.
- [ ] Kullanıcı pasife alınır.
- [ ] Lookup değeri eklenir.
- [ ] Lookup değeri düzenlenir.
- [ ] Lookup değeri pasife alınır.
- [ ] Audit log entity/kullanıcı/tarih filtreleriyle incelenir.

## Final kalite

- [ ] `npm test` başarılı.
- [ ] `npm run lint` başarılı.
- [ ] `npm run typecheck` başarılı.
- [ ] `npm run build` başarılı.
