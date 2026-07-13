# Hukuk Bürosu Yönetim Sistemi

Hukuk Bürosu Yönetim Sistemi; müvekkil, dava, icra, ajanda, finans, belge, bildirim ve yönetim süreçlerini tek panelde toplayan Next.js + Supabase tabanlı operasyon uygulamasıdır.

## Teknoloji yığını

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- Supabase Auth, PostgreSQL, RLS ve Storage
- ESLint

## Temel modüller

- Dashboard: operasyon ve finans odaklı özet ekranı
- Müvekkiller: liste, oluşturma, detay ve ilişkili dosyalar
- Davalar: dava dosyası oluşturma, detay, arşivleme, finans ve ajanda ilişkileri
- İcralar: icra dosyası oluşturma, detay ve arşivleme
- Ajanda: duruşma, randevu, görev, son tarih ve gecikmiş görev takibi
- Finans: beklenen ödeme, tahsilat, gider ve finans özetleri
- Belgeler: Supabase Storage tabanlı özel bucket’a dosya yükleme, listeleme, indirme ve arşivleme
- Bildirimler: uygulama içi bildirim merkezi ve cron tabanlı hatırlatma üretimi
- Yönetim: kullanıcı, lookup ve audit log yönetimi

## Gereksinimler

- Node.js 20+
- npm 10+
- Docker Desktop (yerel Supabase için)
- Üretim ortamında Supabase projesi

## Ortam değişkenleri

`.env.local` dosyası `.env.example` temel alınarak oluşturulmalıdır.

Gerekli değişkenler:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

Notlar:

- `SUPABASE_SERVICE_ROLE_KEY` yalnızca server-side route handler’larda kullanılır.
- `/api/internal/reminders/run` endpoint’i `Authorization: Bearer <CRON_SECRET>` veya `x-cron-secret` header’ı ister.
- Belgeler özel `documents` bucket’ında saklanır ve indirme signed URL ile yapılır.

## Kurulum

```bash
npm install
npm run db:start
npm run db:setup
npm run dev
```

Yerel erişimler:

- Uygulama: `http://localhost:3000`
- Supabase API: `http://127.0.0.1:54321`
- Supabase Studio: `http://127.0.0.1:54323`
- Mailpit: `http://127.0.0.1:54324`

Yerel admin hesabı:

- E-posta: `admin@hukuk.local`
- Şifre: `LocalAdmin123!`

## Veritabanı modeli özeti

Canonical tablolar:

- `profiles`: kullanıcı profilleri ve roller
- `clients`: müvekkiller
- `case_files`: dava dosyaları
- `enforcement_files`: icra dosyaları
- `calendar_events`: ajanda kayıtları
- `hearing_details`: duruşma ek bilgileri
- `receivables`: beklenen ödemeler
- `payments`: tahsilatlar
- `expenses`: giderler
- `documents`: belge metadata kayıtları
- `notifications`: uygulama içi bildirimler
- `audit_logs`: değişiklik kayıtları
- `lookup_values`: yönetilebilir lookup değerleri

Geçerli migration zinciri `supabase/migrations/` altındadır. `src/lib/migrations/` altındaki eski SQL dosyaları yalnızca tarihsel referans kabul edilir.

## Roller ve erişim

Desteklenen roller:

- `admin`
- `lawyer`
- `assistant`
- `finance`

Özet kurallar:

- Admin tüm yönetim ekranlarına erişir.
- Finans ekranı `admin`, `assistant` ve `finance` rollerine açıktır.
- Pasif kullanıcılar uygulama kabuğuna alınmaz.
- API route’ları oturum, aktif profil ve rol kontrollerini server-side uygular.
- RLS politikaları Supabase tarafında ikinci güvenlik katmanıdır.

## Kullanım akışı

1. Admin kullanıcıları davet eder ve rollerini belirler.
2. Müvekkil kaydı oluşturulur.
3. Müvekkile bağlı dava veya icra dosyası açılır.
4. Dosyaya ajanda kayıtları, duruşmalar, ödeme beklentileri, tahsilatlar, giderler ve belgeler bağlanır.
5. Dashboard operasyonel ve finansal durumu özetler.
6. Hatırlatma cron’u yaklaşan/gecikmiş işleri bildirim olarak üretir.
7. Admin audit log ekranından kritik değişiklikleri takip eder.

## Kalite komutları

```bash
npm run lint
npm run typecheck
npm run build
```

CI workflow `.github/workflows/ci.yml` içinde aynı kontrolleri çalıştırır.

## Production checklist özeti

- Supabase URL, anon key ve service role key production değerleriyle tanımlanmalı.
- `CRON_SECRET` güçlü bir değer olmalı ve cron servisinde aynı şekilde kullanılmalı.
- Supabase Storage `documents` bucket’ı private kalmalı.
- RLS migration’ları production veritabanına uygulanmalı.
- İlk admin kullanıcı güvenli şekilde oluşturulmalı.
- `npm run lint`, `npm run typecheck` ve `npm run build` temiz geçmeli.
