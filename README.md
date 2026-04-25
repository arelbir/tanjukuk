# Hukuk Bürosu Yönetim Sistemi

Bu proje, hukuk büroları için geliştirilen bir operasyon yönetim panelidir. Uygulama; dosya takibi, müvekkil yönetimi, duruşma ve aktivite planlama, gelir/gider takibi, lookup yönetimi ve kullanıcı yönetimi modüllerini içerir.

## Teknoloji yığını

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Database
- ESLint

## Temel modüller

- Dashboard: genel metrikler ve özet görünüm
- Dosyalar: dava/dosya listesi, yeni dosya oluşturma, dosya detayları
- Müvekkiller: listeleme, oluşturma, detay görüntüleme
- Takvim: duruşma ve aktivite görünümü
- Gelir / Gider: finans kayıtları
- Admin / Kullanıcılar: kullanıcı davet etme, rol ve aktiflik yönetimi
- Admin / Ayarlar: lookup ve alt kategori yönetimi

## Gereksinimler

- Node.js 20+
- npm 10+
- Supabase projesi

## Ortam değişkenleri

Uygulamayı çalıştırmadan önce `.env.local` oluşturun. Örnek değerler için `.env.example` dosyasını kullanın.

Gerekli değişkenler:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Notlar:

- `SUPABASE_SERVICE_ROLE_KEY`, yalnızca sunucu tarafındaki admin işlemlerinde kullanılır.
- Admin kullanıcı daveti `/api/admin/invite` route'u üzerinden çalışır ve service role key gerektirir.

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

## Kalite komutları

```bash
npm run lint
npm run typecheck
npm run build
```

## Veritabanı ve migration notları

Migration dosyaları `src/lib/migrations` altında tutulur.

Önemli dosyalar:

- `003_create_notifications.sql`
- `004_create_hearings.sql`
- `005_create_case_activities.sql`
- `007_extend_hearings.sql`

Uygulama tarafında hearing kayıtları `result`, `next_step` ve `is_completed` alanlarını kullanır. Bu nedenle `007_extend_hearings.sql` uygulanmış olmalıdır.

## Kullanıcı davet akışı

Admin panelindeki kullanıcı daveti gerçek auth invite akışına bağlanmıştır.

Akış:

1. Admin, `Admin > Kullanıcılar` ekranından davet başlatır.
2. İstek `POST /api/admin/invite` route'una gider.
3. Route, oturumu ve admin rolünü doğrular.
4. Supabase admin API ile davet e-postası gönderilir.
5. `users` tablosunda kullanıcı profili upsert edilir.

## Erişim ve yetkilendirme

Route düzeyindeki koruma `src/proxy.ts` üzerinden yapılır.

Korunan alanlar:

- `/dashboard`
- `/cases`
- `/calendar`
- `/clients`
- `/income`
- `/expenses`
- `/admin`

Admin-only alanlar:

- `/admin`
- `/api/admin/*`
- `/api/seed`

Not: Proxy yalnızca ilk koruma katmanıdır. Hassas route handler'larda ayrıca rol kontrolü yapılır.

## Excel import / export

Sistem, modül bazlı Excel aktarımını ortak bir import-export katmanı üzerinden yapar.

Desteklenen modüller:

- Müvekkiller
- Dosyalar
- Gelirler
- Giderler
- Duruşmalar
- Aktiviteler

Her modülde şu akış bulunur:

- Şablon indir
- Excel dışa aktar
- Excel yükle / toplu içe aktar

Import sırasında sistem satır bazlı doğrulama yapar. Hatalı satırlar bulunursa otomatik bir hata workbook'u indirilir.

### Resolver tabanlı ikinci faz

Import şablonları artık mümkün olduğunca insan dostu kolonlarla çalışır. İçeride sistem bu alanları gerçek ID değerlerine çözer.

Örnekler:

- `lawyer_email` → `users.id`
- `client_name` → `clients.id`
- `case_type_label` → `lookup_values.id`
- `category_label` → `lookup_values.id`
- `case_code` → `cases.id`

Bu sayede kullanıcıların UUID bilmesi gerekmez.

### Önemli sınırlama

Resolver yaklaşımı eşleşen kayıtların sistemde önceden var olmasını bekler. Örneğin bir case import satırı içindeki `client_name` sistemde karşılık bulmuyorsa satır hata dosyasına düşer.


GitHub Actions workflow dosyası `.github/workflows/ci.yml` altında bulunur.

Pipeline şu kontrolleri çalıştırır:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Bilinen teknik notlar

- Next.js 16 ile `middleware` yerine `proxy` kullanılmalıdır; proje buna geçirilmiştir.
- Seed endpoint admin korumalıdır.
- Client detail route `/clients/[id]` aktif durumdadır.

## Önerilen sonraki işler

- onboarding / şifre oluşturma akışını tamamlamak
- README'ye deployment ve Supabase setup adımlarını daha ayrıntılı eklemek
- kritik kullanıcı akışları için test eklemek
