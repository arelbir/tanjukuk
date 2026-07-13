# Veri Modeli

Bu doküman uygulamanın canonical Supabase veri modelini özetler.

## Kimlik ve kullanıcılar

- `profiles`
  - Supabase Auth kullanıcılarıyla birebir eşleşir.
  - Temel alanlar: `id`, `email`, `full_name`, `role`, `is_active`.
  - Roller: `admin`, `lawyer`, `assistant`, `finance`.
  - Yeni kullanıcı varsayılan rolü `assistant` olarak kabul edilir.

## Müvekkiller

- `clients`
  - Müvekkil ana kaydıdır.
  - Dava ve icra dosyaları `client_id` ile bağlanır.
  - Aktif/pasif yönetimi `is_active` ile yapılır.

## Dava dosyaları

- `case_files`
  - Canonical dava tablosudur; eski `cases` kullanılmaz.
  - `file_code` DB trigger ile üretilebilir.
  - Müvekkil bağlantısı `client_id` alanıdır.
  - Arşivleme `is_archived`, `archived_at`, `archived_by` alanlarıyla yapılır.

## İcra dosyaları

- `enforcement_files`
  - Canonical icra tablosudur.
  - Müvekkil bağlantısı `client_id` alanıdır.
  - Borçlu, ofis, dosya no, toplam ve kalan tutar gibi icra alanlarını taşır.

## Ajanda ve duruşmalar

- `calendar_events`
  - Canonical ajanda tablosudur; eski `events` kullanılmaz.
  - Türler: `hearing`, `appointment`, `task`, `deadline`, `phone_call`, `meeting`.
  - Dosya bağlantıları: `case_file_id`, `enforcement_file_id`.
  - Kullanıcı bağlantısı: `assigned_to`.
  - Tamamlama: `is_completed`, `completed_at`.

- `hearing_details`
  - Duruşma türündeki ajanda kayıtlarına ek bilgi sağlar.
  - `event_id` üzerinden `calendar_events` kaydına bağlıdır.

## Finans

- `receivables`
  - Beklenen ödeme/alacak kayıtlarıdır.
  - Alanlar: `expected_amount`, `paid_amount`, `remaining_amount`, `currency`, `status`, `due_date`.
  - Müvekkil zorunlu, dava/icra bağlantısı opsiyoneldir.

- `payments`
  - Tahsilat kayıtlarıdır.
  - Beklenen ödeme bağlantısı `receivable_id` ile yapılabilir.
  - Dava/icra bağlantısı opsiyoneldir.

- `expenses`
  - Gider kayıtlarıdır.
  - Kapsam: `office`, `case_file`, `enforcement_file`, `personal`.
  - Müvekkile yansıtılabilir giderler `is_billable_to_client` ile işaretlenir.

## Belgeler

- `documents`
  - Dosya metadata kaydıdır.
  - Fiziksel dosya Supabase Storage `documents` bucket’ında saklanır.
  - Bağlantı alanları: `entity_type`, `entity_id`.
  - Desteklenen entity türleri: `client`, `case_file`, `enforcement_file`, `calendar_event`, `receivable`, `payment`, `expense`.
  - Arşivleme: `archived_at`, `archived_by`.

## Bildirimler

- `notifications`
  - Uygulama içi bildirim kayıtlarıdır.
  - Alanlar: `user_id`, `title`, `message`, `type`, `entity_type`, `entity_id`, `link_url`, `is_read`, `read_at`.
  - Hatırlatma cron’u yaklaşan/gecikmiş olaylar için tekrar üretimi engelleyerek kayıt oluşturur.

## Audit log

- `audit_logs`
  - Kritik create/update/archive/role/status işlemlerini kaydeder.
  - Alanlar: `actor_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `metadata`.
  - Okuma yalnız admin rolüne açıktır.
  - Update/delete engellenmelidir.

## Lookup değerleri

- `lookup_values`
  - Sistem ayarlarında yönetilebilir sınıflandırma değerleridir.
  - Alanlar: `group_key`, `label`, `code`, `sort_order`, `is_active`, `parent_id`.
  - Pasife alma tercih edilir; fiziksel silme yapılmaz.

## Güvenlik notları

- Service role key yalnız server-side route handler’larda kullanılmalıdır.
- Browser tarafı erişimler RLS politikalarına tabidir.
- API route’ları aktif profil ve rol kontrolünü ayrıca yapmalıdır.
- Belgeler private bucket’ta tutulur; indirme signed URL ile yapılır.
