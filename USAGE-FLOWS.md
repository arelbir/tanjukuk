# Kullanım Akışları

## 1. İlk kurulum ve admin girişi

1. Yerel Supabase başlatılır.
2. Migration zinciri uygulanır.
3. Yerel admin hesabı oluşturulur.
4. Admin `/login` ekranından giriş yapar.
5. Pasif olmayan profil doğrulanır ve `/dashboard` ekranına yönlendirilir.

## 2. Kullanıcı daveti

1. Admin `/admin/users` ekranına gider.
2. Kullanıcı e-postası, ad soyad ve rol girilir.
3. `/api/admin/invite` route’u admin rolünü doğrular.
4. Supabase Auth invite gönderilir.
5. `profiles` kaydı oluşturulur/güncellenir.
6. Audit log kaydı yazılır.

## 3. Müvekkil oluşturma

1. Kullanıcı `/clients` ekranında yeni müvekkil formunu açar.
2. Zorunlu alanlar doğrulanır.
3. `clients` tablosuna kayıt eklenir.
4. Liste ve dashboard cache’i invalid edilir.
5. Audit log oluşturulur.

## 4. Dava dosyası açma

1. Kullanıcı `/cases/new` ekranından müvekkil seçer.
2. Dava bilgileri girilir.
3. `case_files` kaydı oluşturulur.
4. `file_code` DB trigger tarafından üretilebilir.
5. Dosya detayına yönlendirilir.
6. Audit log oluşturulur.

## 5. İcra dosyası açma

1. Kullanıcı `/enforcements` ekranında yeni icra dosyası formunu açar.
2. Müvekkil, borçlu ve icra bilgileri girilir.
3. `enforcement_files` kaydı oluşturulur.
4. Liste ve dashboard cache’i güncellenir.
5. Audit log oluşturulur.

## 6. Ajanda kaydı oluşturma

1. Kullanıcı `/calendar` ekranında tarih seçer veya belge/dosya bağlantısı kurar.
2. Etkinlik türü seçilir: duruşma, randevu, görev, son tarih vb.
3. Dava veya icra dosyası bağlantısı opsiyonel olarak seçilir.
4. Duruşma türünde ek duruşma detayları girilebilir.
5. `calendar_events` ve gerekirse `hearing_details` kayıtları oluşturulur.
6. Görev/son tarih tamamlandı veya yeniden açıldı olarak işaretlenebilir.

## 7. Finans kaydı oluşturma

1. Kullanıcı `/finance` ekranına gider.
2. Beklenen ödeme, tahsilat veya gider drawer’ı açılır.
3. Müvekkil ve gerekiyorsa dava/icra dosyası seçilir.
4. Tutar ve para birimi girilir.
5. Kayıt ilgili finans tablosuna yazılır.
6. Finans özetleri ve dashboard invalid edilir.

## 8. Belge yükleme

1. Kullanıcı `/documents` ekranında “Belge Yükle” aksiyonunu seçer.
2. Bağlantı türü seçilir: müvekkil, dava dosyası veya icra dosyası.
3. Dosya seçilir ve tür/boyut validasyonu yapılır.
4. API `documents` metadata kaydını oluşturur.
5. Signed upload URL üretilir.
6. Tarayıcı dosyayı private Supabase Storage `documents` bucket’ına yükler.
7. Belge listesi güncellenir.

## 9. Bildirim ve hatırlatma

1. Cron servisi `/api/internal/reminders/run` endpoint’ini secret ile çağırır.
2. Yaklaşan duruşma/randevu/son tarih, gecikmiş görev ve ödeme adayları taranır.
3. Daha önce üretilmiş aynı bildirimler tekrar oluşturulmaz.
4. Yeni kayıtlar `notifications` tablosuna yazılır.
5. Kullanıcı üst bardaki bildirim merkezinden bildirimleri görür ve okundu işaretler.

## 10. Audit inceleme

1. Admin `/admin/audit` ekranına gider.
2. Entity, kullanıcı ve tarih filtreleri uygulanır.
3. Her kayıt için eski/yeni değerler detay olarak görüntülenir.
4. Audit log yalnız izleme amaçlıdır; düzenlenmez veya silinmez.

## 11. Production yayın öncesi kontrol

1. Ortam değişkenleri production değerleriyle tanımlanır.
2. Supabase migration zinciri uygulanır.
3. RLS politikaları doğrulanır.
4. İlk admin hesabı oluşturulur.
5. `npm run lint`, `npm run typecheck`, `npm run build` çalıştırılır.
6. Kritik akışlar tarayıcıda test edilir.
