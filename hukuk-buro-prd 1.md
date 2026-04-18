# Hukuk Bürosu Yönetim Sistemi — PRD (Product Requirements Document)
Ny-112112312mm
> Bu belge bir AI agent'ına verilmek üzere hazırlanmıştır.
> Tüm kararlar verilmiştir. Soru sormadan, bu belgeyi eksiksiz uygula.

---

## 1. Proje Özeti

Orta/büyük ölçekli hukuk büroları için web tabanlı dava ve ofis yönetim sistemi.
Mevcut Excel tabanlı iş akışının yerini alacak.

**Temel özellikler:** Dava/dosya takibi, duruşma takvimi, müvekkil yönetimi, gelir/gider kaydı, rol bazlı erişim.

---

## 2. Teknoloji Stack'i

| Katman | Teknoloji | Versiyon |
|---|---|---|
| Framework | Next.js (App Router) | 14.x |
| Dil | TypeScript | 5.x |
| Stil | Tailwind CSS | 3.x |
| UI Bileşenleri | shadcn/ui | latest |
| Veri yönetimi | TanStack Query | v5 |
| Backend / DB | Supabase | latest |
| Auth | Supabase Auth | built-in |
| Hosting | Vercel | — |
| Mobil | Responsive + PWA | next-pwa |

**Kurulum komutları:**
```bash
npx create-next-app@latest hukuk-buro --typescript --tailwind --app
cd hukuk-buro
npx shadcn@latest init
npm install @tanstack/react-query @supabase/supabase-js @supabase/ssr
npm install next-pwa
```

---

## 3. Veritabanı Şeması (Supabase / PostgreSQL)

Aşağıdaki SQL'i Supabase SQL Editor'da sırasıyla çalıştır.

### 3.1 Uzantılar

```sql
create extension if not exists "uuid-ossp";
```

### 3.2 Tablo: `users` (profiller)

```sql
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text not null unique,
  role         text not null check (role in ('admin', 'lawyer', 'assistant')),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Auth kaydı oluşunca otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'assistant')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3.3 Tablo: `clients` (müvekkiller)

```sql
create table public.clients (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  type         text not null check (type in ('individual', 'company')),
  phone        text,
  email        text,
  tax_no       text,
  address      text,
  notes        text,
  created_by   uuid references public.users(id),
  created_at   timestamptz not null default now()
);
```

### 3.4 Tablo: `lookup_values` (dropdown yönetimi)

```sql
create table public.lookup_values (
  id           uuid primary key default uuid_generate_v4(),
  group_key    text not null,  -- 'case_type', 'file_type', 'case_status', 'expense_category', 'income_category'
  label        text not null,
  sort_order   int not null default 0,
  is_active    boolean not null default true
);

-- Varsayılan değerler
insert into public.lookup_values (group_key, label, sort_order) values
  -- Dava türleri
  ('case_type', 'Boşanma (Çekişmeli)', 1),
  ('case_type', 'Boşanma (Anlaşmalı)', 2),
  ('case_type', 'Nafaka', 3),
  ('case_type', 'Velayet', 4),
  ('case_type', 'Mal Rejimi', 5),
  ('case_type', 'İcra Takibi', 6),
  ('case_type', 'İş Davası', 7),
  ('case_type', 'Tazminat', 8),
  ('case_type', 'Ceza Davası', 9),
  ('case_type', '6284 Sayılı Kanun', 10),
  ('case_type', 'Diğer', 99),
  -- Dosya türleri
  ('file_type', 'ESAS', 1),
  ('file_type', 'DEĞİŞİK İŞ', 2),
  ('file_type', 'TALİMAT', 3),
  ('file_type', 'Diğer', 99),
  -- Dosya durumları
  ('case_status', 'Yerel Mahkeme', 1),
  ('case_status', 'İstinaf', 2),
  ('case_status', 'Temyiz', 3),
  ('case_status', 'Kesinleşti', 4),
  ('case_status', 'Kapandı', 5),
  ('case_status', 'İcra', 6),
  ('case_status', 'Diğer', 99),
  -- Mahkeme türleri
  ('court_type', 'Aile Mahkemesi', 1),
  ('court_type', 'Asliye Hukuk Mahkemesi', 2),
  ('court_type', 'Asliye Ceza Mahkemesi', 3),
  ('court_type', 'İş Mahkemesi', 4),
  ('court_type', 'İcra Hukuk Mahkemesi', 5),
  ('court_type', 'İdare Mahkemesi', 6),
  ('court_type', 'Ticaret Mahkemesi', 7),
  ('court_type', 'Bölge Adliye Mahkemesi', 8),
  ('court_type', 'Yargıtay', 9),
  ('court_type', 'Diğer', 99),
  -- Gelir kategorileri
  ('income_category', 'Vekâlet Ücreti', 1),
  ('income_category', 'Avans', 2),
  ('income_category', 'Danışmanlık', 3),
  ('income_category', 'Masraf İadesi', 4),
  ('income_category', 'Diğer', 99),
  -- Gider ana kategorileri
  ('expense_category', 'Yargılama Giderleri', 1),
  ('expense_category', 'Ofis Giderleri', 2),
  ('expense_category', 'Personel', 3),
  ('expense_category', 'Ulaşım', 4),
  ('expense_category', 'Temsil & Diğer', 5),
  -- Gider alt kategorileri
  ('expense_sub_yargilama', 'Harç', 1),
  ('expense_sub_yargilama', 'Tebligat', 2),
  ('expense_sub_yargilama', 'Bilirkişi', 3),
  ('expense_sub_yargilama', 'Keşif', 4),
  ('expense_sub_yargilama', 'Posta', 5),
  ('expense_sub_yargilama', 'Diğer', 99),
  ('expense_sub_ofis', 'Kira', 1),
  ('expense_sub_ofis', 'Elektrik / Su / Doğalgaz', 2),
  ('expense_sub_ofis', 'İnternet / Telefon', 3),
  ('expense_sub_ofis', 'Kırtasiye', 4),
  ('expense_sub_ofis', 'Yazıcı / Sarf', 5),
  ('expense_sub_ofis', 'Diğer', 99),
  ('expense_sub_personel', 'Maaş', 1),
  ('expense_sub_personel', 'SGK', 2),
  ('expense_sub_personel', 'Avans', 3),
  ('expense_sub_personel', 'Diğer', 99),
  ('expense_sub_ulasim', 'Taksi / Uber', 1),
  ('expense_sub_ulasim', 'Toplu Taşıma', 2),
  ('expense_sub_ulasim', 'Araç Yakıt', 3),
  ('expense_sub_ulasim', 'Otopark', 4),
  ('expense_sub_ulasim', 'Diğer', 99);
```

### 3.5 Tablo: `cases` (davalar / dosyalar)

```sql
create table public.cases (
  id                    uuid primary key default uuid_generate_v4(),
  case_code             text unique,           -- Otomatik: YIL-XXXX (ör: 2024-0001)
  lawyer_id             uuid not null references public.users(id),
  client_id             uuid not null references public.clients(id),
  entity_type           text check (entity_type in ('M', 'TM', 'company')), -- Şahıs/Şirket tipi

  -- Taraf bilgileri
  opposing_party        text not null,
  client_role           text not null check (client_role in ('Davacı', 'Davalı', 'Müdahil', 'Şikayetçi', 'Şüpheli')),

  -- Dava sınıflandırma
  case_type_id          uuid references public.lookup_values(id),
  file_type_id          uuid references public.lookup_values(id),
  status_id             uuid references public.lookup_values(id),

  -- Mahkeme bilgileri
  court_city            text,
  court_district        text,
  court_type_id         uuid references public.lookup_values(id),
  court_no              int,
  file_year             int,
  file_no               text,

  -- Tarihler
  opened_at             date not null,
  closed_at             date,
  next_hearing_at       timestamptz,          -- Cache: hearings tablosundan güncellenir

  -- Dava değeri
  case_value            numeric(15,2) default 0,
  currency              text not null default 'TRY',

  -- Sonuç
  lean_against          text check (lean_against in ('L', 'A', 'K', null)), -- Lehe/Aleyhe/Kısmen
  verdict_result        text,
  verdict_for           numeric(15,2),
  verdict_against       numeric(15,2),

  -- Ek bilgiler
  old_court_info        text,
  description           text,
  notes                 text,

  -- Meta
  created_by            uuid references public.users(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- case_code otomatik üret
create or replace function generate_case_code()
returns trigger language plpgsql as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq int;
begin
  select count(*) + 1 into seq
  from public.cases
  where extract(year from created_at) = extract(year from now());
  new.case_code := yr || '-' || lpad(seq::text, 4, '0');
  return new;
end;
$$;

create trigger set_case_code
  before insert on public.cases
  for each row when (new.case_code is null)
  execute procedure generate_case_code();

-- updated_at otomatik güncelle
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger cases_updated_at
  before update on public.cases
  for each row execute procedure update_updated_at();
```

### 3.6 Tablo: `hearings` (duruşmalar)

```sql
create table public.hearings (
  id              uuid primary key default uuid_generate_v4(),
  case_id         uuid not null references public.cases(id) on delete cascade,
  lawyer_id       uuid references public.users(id),
  hearing_at      timestamptz not null,
  location        text,                        -- Mahkeme adı / salonu
  result          text,                        -- O günkü sonuç
  next_step       text,                        -- Bir sonraki adım notu
  is_completed    boolean not null default false,
  created_by      uuid references public.users(id),
  created_at      timestamptz not null default now()
);

-- Duruşma eklenince/güncellenince cases.next_hearing_at güncelle
create or replace function sync_next_hearing()
returns trigger language plpgsql as $$
begin
  update public.cases
  set next_hearing_at = (
    select min(hearing_at)
    from public.hearings
    where case_id = coalesce(new.case_id, old.case_id)
      and hearing_at > now()
      and is_completed = false
  )
  where id = coalesce(new.case_id, old.case_id);
  return coalesce(new, old);
end;
$$;

create trigger sync_hearing_insert
  after insert or update or delete on public.hearings
  for each row execute procedure sync_next_hearing();
```

### 3.7 Tablo: `income_records` (gelirler)

```sql
create table public.income_records (
  id              uuid primary key default uuid_generate_v4(),
  case_id         uuid references public.cases(id) on delete set null,
  client_id       uuid references public.clients(id) on delete set null,
  recorded_by     uuid references public.users(id),
  category_id     uuid references public.lookup_values(id),
  record_date     date not null,
  amount          numeric(15,2) not null,
  currency        text not null default 'TRY',
  payment_status  text not null default 'paid' check (payment_status in ('paid', 'pending', 'partial')),
  description     text,
  created_at      timestamptz not null default now()
);
```

### 3.8 Tablo: `expense_records` (giderler)

```sql
create table public.expense_records (
  id              uuid primary key default uuid_generate_v4(),
  case_id         uuid references public.cases(id) on delete set null,
  recorded_by     uuid references public.users(id),
  category_id     uuid references public.lookup_values(id),     -- Ana kategori
  sub_category_id uuid references public.lookup_values(id),     -- Alt kategori
  record_date     date not null,
  amount          numeric(15,2) not null,
  currency        text not null default 'TRY',
  payment_method  text check (payment_method in ('cash', 'transfer', 'card')),
  document_ref    text,                                          -- Fiş / dekont no
  description     text,
  created_at      timestamptz not null default now()
);
```

### 3.9 Row Level Security (RLS)

```sql
-- RLS'i tüm tablolarda etkinleştir
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.cases enable row level security;
alter table public.hearings enable row level security;
alter table public.income_records enable row level security;
alter table public.expense_records enable row level security;
alter table public.lookup_values enable row level security;

-- Helper: mevcut kullanıcının rolünü al
create or replace function public.current_user_role()
returns text language sql security definer stable as $$
  select role from public.users where id = auth.uid();
$$;

-- lookup_values: herkes okuyabilir
create policy "lookup_read_all" on public.lookup_values
  for select using (true);

-- lookup_values: sadece admin yazabilir
create policy "lookup_write_admin" on public.lookup_values
  for all using (public.current_user_role() = 'admin');

-- users: herkes kendi profilini okur, admin hepsini görür
create policy "users_read" on public.users
  for select using (
    id = auth.uid() or public.current_user_role() = 'admin'
  );

create policy "users_write_admin" on public.users
  for all using (public.current_user_role() = 'admin');

-- clients: herkes okur/yazar (avukat da girebilmeli)
create policy "clients_read" on public.clients
  for select using (auth.uid() is not null);

create policy "clients_write" on public.clients
  for insert with check (auth.uid() is not null);

create policy "clients_update" on public.clients
  for update using (auth.uid() is not null);

-- cases: avukat sadece kendi dosyalarını, admin/asistan hepsini görür
create policy "cases_read" on public.cases
  for select using (
    public.current_user_role() in ('admin', 'assistant')
    or lawyer_id = auth.uid()
  );

create policy "cases_insert" on public.cases
  for insert with check (auth.uid() is not null);

create policy "cases_update" on public.cases
  for update using (
    public.current_user_role() in ('admin', 'assistant')
    or lawyer_id = auth.uid()
  );

-- hearings: cases ile aynı kural
create policy "hearings_read" on public.hearings
  for select using (
    public.current_user_role() in ('admin', 'assistant')
    or lawyer_id = auth.uid()
    or exists (
      select 1 from public.cases c
      where c.id = case_id and c.lawyer_id = auth.uid()
    )
  );

create policy "hearings_write" on public.hearings
  for all using (auth.uid() is not null);

-- income/expense: admin ve asistan tam erişim, avukat sadece kendi dosyasına bağlılar
create policy "income_read" on public.income_records
  for select using (
    public.current_user_role() in ('admin', 'assistant')
    or recorded_by = auth.uid()
  );

create policy "income_write" on public.income_records
  for all using (
    public.current_user_role() in ('admin', 'assistant')
    or recorded_by = auth.uid()
  );

create policy "expense_read" on public.expense_records
  for select using (
    public.current_user_role() in ('admin', 'assistant')
    or recorded_by = auth.uid()
  );

create policy "expense_write" on public.expense_records
  for all using (
    public.current_user_role() in ('admin', 'assistant')
    or recorded_by = auth.uid()
  );
```

### 3.10 İndeksler

```sql
create index idx_cases_lawyer on public.cases(lawyer_id);
create index idx_cases_client on public.cases(client_id);
create index idx_cases_status on public.cases(status_id);
create index idx_cases_next_hearing on public.cases(next_hearing_at);
create index idx_hearings_case on public.hearings(case_id);
create index idx_hearings_at on public.hearings(hearing_at);
create index idx_income_case on public.income_records(case_id);
create index idx_expense_case on public.expense_records(case_id);
create index idx_lookup_group on public.lookup_values(group_key);
```

---

## 4. Proje Klasör Yapısı

```
hukuk-buro/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              # Sidebar + header shell
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── cases/
│   │   │   ├── page.tsx            # Dosya listesi
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Yeni dosya formu
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Dosya detayı
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── income/
│   │   │   └── page.tsx
│   │   ├── expenses/
│   │   │   └── page.tsx
│   │   └── admin/
│   │       ├── users/
│   │       │   └── page.tsx
│   │       └── settings/
│   │           └── page.tsx        # Dropdown yönetimi
│   └── api/
│       └── export/
│           └── route.ts            # Excel export endpoint
├── components/
│   ├── ui/                         # shadcn/ui bileşenleri (otomatik)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── mobile-nav.tsx
│   ├── cases/
│   │   ├── case-table.tsx
│   │   ├── case-form.tsx
│   │   ├── case-detail-card.tsx
│   │   ├── hearing-list.tsx
│   │   └── hearing-form.tsx
│   ├── calendar/
│   │   └── hearing-calendar.tsx
│   ├── finance/
│   │   ├── income-form.tsx
│   │   ├── expense-form.tsx
│   │   └── finance-table.tsx
│   └── shared/
│       ├── data-table.tsx          # Genel filtrelenebilir tablo
│       ├── confirm-dialog.tsx
│       └── page-header.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server component client
│   │   └── middleware.ts
│   ├── queries/                    # TanStack Query hooks
│   │   ├── cases.ts
│   │   ├── hearings.ts
│   │   ├── clients.ts
│   │   ├── finance.ts
│   │   └── lookups.ts
│   ├── utils.ts
│   └── export.ts                   # Excel export mantığı
├── types/
│   └── database.ts                 # Supabase'den generate edilen tipler
├── middleware.ts                   # Auth koruması
└── public/
    ├── manifest.json               # PWA
    └── icons/
```

---

## 5. Sayfa Spesifikasyonları

### 5.1 Login Sayfası (`/login`)

- Supabase Auth email + şifre ile giriş
- "Beni hatırla" seçeneği
- Hatalı giriş mesajı göster
- Başarılı girişte `/dashboard`'a yönlendir
- Tasarım: ortalanmış kart, büro logosu üstte

### 5.2 Dashboard (`/dashboard`)

**Avukat görünümü:**
- Bugün ve bu haftaki duruşmaları listele (hearings tablosu, lawyer_id = current user)
- Aktif dosya sayısı (cases, status kapalı değil)
- Son 5 güncellenen dosya
- Mini takvim: gelecek 7 günün duruşmaları

**Admin / Asistan görünümü (yukarıdakilere ek):**
- Tüm avukatların bu haftaki duruşmaları
- Toplam aktif dosya sayısı
- Bu ay gelir toplamı / gider toplamı
- Dosya durumu dağılımı (pasta grafik — Recharts)
- Avukata göre aktif dosya sayısı (çubuk grafik — Recharts)

### 5.3 Dosya Listesi (`/cases`)

**Tablo kolonları (sırasıyla):**
Dosya Kodu | Avukat | Müvekkil | Karşı Taraf | Dava Türü | Durum | Sonraki Duruşma | Lehe/Aleyhe

**Filtreler (üst bar):**
- Avukat (admin/asistan için — dropdown, çoklu seçim)
- Dosya Durumu (dropdown, çoklu seçim)
- Dava Türü (dropdown, çoklu seçim)
- Tarih aralığı (açılma tarihi)
- Arama kutusu (dosya kodu, müvekkil, karşı taraf, açıklama full-text)

**Satır rengi:**
- Lehe (L): yeşil sol kenarlık
- Aleyhe (A): kırmızı sol kenarlık
- Kısmen (K): sarı sol kenarlık
- Açık: renksiz

**İşlemler:**
- Satıra tıkla → dosya detayına git
- "Yeni Dosya" butonu (sağ üst)
- "Excel Export" butonu (filtrelenmiş veriyi indir)
- "Excel Import" butonu (mevcut excel formatını içe al)

**Sayfalama:** 50 kayıt/sayfa, toplam kayıt sayısı göster

### 5.4 Yeni Dosya Formu (`/cases/new`)

Wizard tarzı — 4 adım, her adımda "İleri" / "Geri":

**Adım 1 — Taraflar:**
- Avukat seç (dropdown — users tablosu, role=lawyer)
- Müvekkil: mevcut ara veya "Yeni müvekkil ekle" (inline mini form açılır)
  - Yeni müvekkil: Ad/Unvan (zorunlu), Tip (Bireysel/Şirket), Telefon, E-posta, Vergi No
- Karşı Taraf (zorunlu, serbest metin)
- Müvekkil Taraf Sıfatı (dropdown: Davacı/Davalı/Müdahil/Şikayetçi/Şüpheli)
- Şahıs/Şirket tipi (M / TM / Şirket)

**Adım 2 — Mahkeme Bilgileri:**
- Mahkeme İl (dropdown — Türkiye illeri)
- Mahkeme İlçe (serbest metin)
- Mahkeme Türü (lookup: court_type)
- Mahkeme Numarası (sayı)
- Dosya Yılı (sayı, varsayılan: mevcut yıl)
- Dosya No (serbest metin)
- Dosya Türü (lookup: file_type — ESAS / DEĞİŞİK İŞ / TALİMAT / Diğer)

**Adım 3 — Dava Bilgileri:**
- Dava Türü (lookup: case_type, zorunlu)
- Dosya Durumu (lookup: case_status, zorunlu)
- Dava Açılma Tarihi (date picker, zorunlu)
- Dava Değeri (sayı) + Para Birimi (TRY/USD/EUR/GBP)
- Açıklama (textarea)
- Notlar (textarea)

**Adım 4 — İlk Duruşma (opsiyonel):**
- "İlk duruşma tarihi ekle" toggle
- Duruşma Tarihi + Saati (datetime picker)
- Yer / Salon
- Notlar

Son adımda "Kaydet ve Dosyayı Aç" → dosya detay sayfasına yönlendir.

**Dosya kodu:** Kayıt esnasında otomatik atanır (DB trigger), kullanıcı görmez.

### 5.5 Dosya Detayı (`/cases/[id]`)

Masaüstü: tek sayfa scroll. Mobil: accordion bölümler.

**Bölüm 1 — Temel Bilgiler** (düzenle butonu ile inline edit):
Avukat | Müvekkil | Karşı Taraf | Sıfat | Şahıs/Şirket tipi

**Bölüm 2 — Mahkeme:**
İl | İlçe | Mahkeme Türü | Mah. No | Dosya Yılı | Dosya No | Dosya Türü

**Bölüm 3 — Dava:**
Dava Türü | Durum | Açılma Tarihi | Kapanma Tarihi | Dava Değeri | Lehe/Aleyhe

**Bölüm 4 — Duruşmalar** (alt tablo):
- Kolonlar: Tarih | Saat | Yer | Sonuç | Sonraki Adım | Tamamlandı mı
- Tarih sıralı (en yakın önce)
- "Duruşma Ekle" butonu → modal form
- Satıra tıkla → satır içi düzenleme (inline edit)
- Geçmiş duruşmalar gri, gelecekler normal

**Bölüm 5 — Karar Bilgileri:**
Dava Sonucu | Lehe Hükmedilen Tutar | Aleyhe Hükmedilen Tutar | Eski Mahkeme Bilgileri

**Bölüm 6 — Gelir / Gider:**
- Bu dosyaya bağlı income_records listesi (özet tablo)
- Bu dosyaya bağlı expense_records listesi (özet tablo)
- "Gelir Ekle" ve "Gider Ekle" butonları → modal form

**Bölüm 7 — Notlar:**
Açıklama | Notlar (textarea, otomatik kayıt)

### 5.6 Takvim (`/calendar`)

- Kütüphane: `@fullcalendar/react` (dayGrid + timeGrid görünümleri)
- Varsayılan görünüm: haftalık (timeGridWeek)
- Görünüm seçici: Aylık / Haftalık / Günlük
- Her duruşma bir kart: Dosya Kodu + Müvekkil + Saat
- Renk: avukata göre otomatik renk atama (her avukata bir renk)
- Filtre: Avukat seç (admin/asistan için çoklu seçim)
- Karta tıkla → dosya detayına git
- "Duruşma Ekle" butonu → hangi dosyaya bağlanacağını sor (dosya ara)

### 5.7 Müvekkiller (`/clients`)

- Liste: Ad | Tip | Telefon | Aktif Dosya Sayısı
- Müvekkil detayı: bilgiler + bu müvekkile ait tüm dosyalar
- Düzenleme: inline veya modal

### 5.8 Gelir Kaydı (`/income`)

**Tablo görünümü:**
Tarih | Müvekkil | İlgili Dosya | Kategori | Tutar | Para Birimi | Durum

**Filtreler:** Tarih aralığı | Avukat | Müvekkil | Kategori | Tahsilat durumu

**Form alanları (modal):**
- Kayıt Tarihi (date, zorunlu)
- Müvekkil (arama, zorunlu)
- İlgili Dosya (müvekkil seçince filtreler, opsiyonel)
- Kategori (lookup: income_category, zorunlu)
- Tutar (zorunlu) + Para Birimi
- Tahsilat Durumu: Ödendi / Bekliyor / Kısmi
- Açıklama (opsiyonel)

**Excel export:** Filtrelenmiş veriyi .xlsx olarak indir

### 5.9 Gider Kaydı (`/expenses`)

**Tablo görünümü:**
Tarih | Kategori | Alt Kategori | İlgili Dosya | Tutar | Ödeme Yöntemi | Belge No

**Filtreler:** Tarih aralığı | Kategori | İlgili dosya | Ödeme yöntemi

**Form alanları (modal):**
- Kayıt Tarihi (date, zorunlu)
- Ana Kategori (lookup: expense_category, zorunlu)
- Alt Kategori (kategoriye göre dinamik — lookup: expense_sub_*, zorunlu)
- İlgili Dosya (opsiyonel, dosya arama)
- Tutar (zorunlu) + Para Birimi
- Ödeme Yöntemi: Nakit / Havale / Kart
- Belge No (opsiyonel — fiş/dekont referansı)
- Açıklama (opsiyonel)

**Excel export:** Filtrelenmiş veriyi .xlsx olarak indir

### 5.10 Admin — Kullanıcı Yönetimi (`/admin/users`)

- Kullanıcı listesi: Ad | E-posta | Rol | Aktif mi | Kayıt Tarihi
- "Kullanıcı Davet Et" → e-posta + rol seç → Supabase Auth davet maili gönderir
- Kullanıcı düzenle: rol değiştir, pasife al (silme yok — veri bütünlüğü)
- Sadece admin erişebilir (middleware koruması)

### 5.11 Admin — Liste Yönetimi (`/admin/settings`)

- Her `group_key` için ayrı bölüm (accordion)
- Değer ekle, sırasını değiştir (drag), pasife al
- Pasife alınan değer mevcut kayıtlarda görünmeye devam eder, yeni seçimlerde çıkmaz
- Sadece admin erişebilir

---

## 6. Ortak Bileşenler

### Sidebar (masaüstü)

```
[Logo / Büro Adı]
─────────────────
Dashboard
Dosyalar
Takvim
Müvekkiller
Gelir
Gider
─────────────────
[sadece admin]
Kullanıcılar
Ayarlar
─────────────────
[Profil] [Çıkış]
```

### Header (mobil)

- Hamburger menü (sol) → drawer açılır
- Sayfa başlığı (orta)
- Bildirim ikonu (sağ, şimdilik placeholder)

### Mobil navigasyon (alt tab bar, mobilde görünür)

Dashboard | Dosyalar | Takvim | Gelir/Gider | Menü

### DataTable bileşeni

- Tüm listeler bu tek bileşeni kullanır
- Props: `columns`, `data`, `filters`, `onRowClick`, `exportable`
- Sıralama: kolon başlığına tıkla
- Sayfalama: 50/sayfa, önceki/sonraki
- Arama: debounced, 300ms

---

## 7. Auth & Middleware

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Korumalı rotalar: /dashboard, /cases, /calendar, /clients, /income, /expenses, /admin
// Halka açık: /login

// Admin koruması: /admin/* → role = 'admin' değilse /dashboard'a yönlendir
```

Supabase client kurulumu (`lib/supabase/server.ts`):
- `@supabase/ssr` paketini kullan (Next.js App Router ile uyumlu)
- Cookie tabanlı session yönetimi

---

## 8. Excel Import / Export

### Export

- Kütüphane: `xlsx` (SheetJS)
- Tüm liste sayfalarında mevcut filtre + sıralamaya göre export
- Dosya listesi export kolonları: Dosya Kodu, Avukat, Müvekkil, Karşı Taraf, Dava Türü, Durum, Açılma Tarihi, Sonraki Duruşma, Dava Değeri

### Import (Dosya Listesi)

- Mevcut Excel formatını (`1-Dava_Dosya_Listesi_REVİZE.xlsx`) referans al
- Kolon eşleme (mapping):
  | Excel Kolonu | DB Alanı |
  |---|---|
  | AVUKAT | users.full_name ile eşle |
  | ŞAHIS/ŞİRKET | cases.entity_type |
  | DOSYA NO | cases.file_no |
  | Müvekkil | clients.name (bulamazsa yeni oluştur) |
  | Karşı Taraflar | cases.opposing_party |
  | Müvekkilin Taraf Sıfatı | cases.client_role |
  | MAHKEMESİ | court_type + court_no + file_year + file_no parse et |
  | DAVA AÇILMA TARİHİ | cases.opened_at |
  | DAVA KAPANMA TARİHİ | cases.closed_at |
  | DOSYA DURUMU | lookup_values (case_status) ile eşle |
  | LEHE ALEYHE | cases.lean_against |
  | DAVA TÜRÜ | lookup_values (case_type) ile eşle |
  | YETKİLİ MAHKEME BULUNDUĞU İL | cases.court_city |
  | YETKİLİ MAHKEME BULUNDUĞU İLÇE | cases.court_district |
  | MAH. NO | cases.court_no |
  | GÖREVLİ MAHKEME / MAH. TÜRÜ | lookup_values (court_type) ile eşle |
  | DOSYA YILI | cases.file_year |
  | DOSYA TÜRÜ | lookup_values (file_type) ile eşle |
  | DAVA DEĞERİ | cases.case_value |
  | DAVA DEĞERİ PARA BİRİMİ | cases.currency |
  | DURUŞMA TARİHİ | hearings tablosuna ekle |
  | AÇIKLAMA | cases.description |
  | NOT | cases.notes |
  | DAVA SONUCU | cases.verdict_result |
  | KARAR LEHE HÜKMEDİLEN TUTAR MİKTARI | cases.verdict_for |
  | KARAR ALEYHE HÜKMEDİLEN TUTAR MİKTARI | cases.verdict_against |
  | ESKİ MAHKEMESİ VE DOSYA BİLGİLERİ | cases.old_court_info |

- Import öncesi preview: "X kayıt bulundu, Y hata var" göster
- Hatalı satırları renklendir, hata mesajı göster
- "Devam et" ile hatasız satırları içe al

---

## 9. PWA Yapılandırması

```json
// public/manifest.json
{
  "name": "Hukuk Bürosu Yönetimi",
  "short_name": "HukukBüro",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```typescript
// next.config.ts
import withPWA from 'next-pwa'
export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})({
  // next config
})
```

---

## 10. Ortam Değişkenleri

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Sadece server-side import için
```

---

## 11. MVP Sprint Planı

### Sprint 1 — Temel Altyapı (Hafta 1)

- [ ] Next.js projesi kur, Tailwind + shadcn/ui yapılandır
- [ ] Supabase projesi oluştur, SQL şemasını çalıştır
- [ ] RLS politikalarını uygula ve test et
- [ ] Auth: login sayfası, middleware, session yönetimi
- [ ] Sidebar + header shell layout
- [ ] Supabase tiplerinı generate et (`supabase gen types`)

### Sprint 2 — Dosya Yönetimi (Hafta 2-3)

- [ ] Lookup değerlerini yükle (seed SQL)
- [ ] Dosya listesi sayfası — tablo, filtreler, sayfalama
- [ ] Yeni dosya formu — 4 adımlı wizard
- [ ] Dosya detay sayfası — tüm bölümler
- [ ] Dosya düzenleme
- [ ] Müvekkil arama + hızlı ekleme

### Sprint 3 — Duruşmalar & Takvim (Hafta 4)

- [ ] Duruşma ekleme/düzenleme modal
- [ ] Dosya detayında duruşma listesi
- [ ] FullCalendar entegrasyonu
- [ ] Takvim filtresi (avukata göre)
- [ ] Dashboard widget'ları

### Sprint 4 — Gelir / Gider (Hafta 5)

- [ ] Gelir listesi + form
- [ ] Gider listesi + form (dinamik alt kategori)
- [ ] Dosya detayında gelir/gider özeti
- [ ] Excel export (xlsx)

### Sprint 5 — Admin & Polishing (Hafta 6)

- [ ] Kullanıcı yönetimi (davet, rol, pasife al)
- [ ] Dropdown/liste yönetimi
- [ ] Excel import + preview
- [ ] Dashboard grafikleri (Recharts)
- [ ] Responsive/mobil ince ayar
- [ ] PWA yapılandırması
- [ ] Hata yönetimi, loading skeleton'lar, boş durum ekranları

### Sprint 6 — Test & Deploy (Hafta 7)

- [ ] Supabase üretim projesi oluştur
- [ ] Vercel deploy, custom domain
- [ ] Mevcut Excel verilerini import et
- [ ] Kullanıcı kabul testi (UAT)
- [ ] Kritik bug düzeltmeleri

---

## 12. Teknik Notlar & Kararlar

### Supabase client kullanımı

```typescript
// Server Component'lerde: lib/supabase/server.ts
// Client Component'lerde: lib/supabase/client.ts
// Route Handler'larda: lib/supabase/server.ts
// Middleware'de: lib/supabase/middleware.ts
// ASLA service role key'i client'ta kullanma
```

### TanStack Query pattern

```typescript
// lib/queries/cases.ts
export function useCases(filters: CaseFilters) {
  const supabase = createClientComponentClient()
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: async () => {
      let query = supabase.from('cases').select(`
        *, 
        lawyer:users(id, full_name),
        client:clients(id, name),
        case_type:lookup_values!case_type_id(label),
        status:lookup_values!status_id(label)
      `)
      // filtreleri uygula
      return query
    }
  })
}
```

### Tarih ve saat

- Tüm tarihler UTC olarak sakla
- Gösterimde `date-fns/tr` locale kullan
- Duruşma saatleri için `timestamptz` (timezone aware)

### Para birimi

- Sayısal değerler `numeric(15,2)` — float kullanma
- Gösterimde `Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })`

### Form yönetimi

- `react-hook-form` + `zod` validation
- shadcn/ui Form bileşeniyle entegre

### Bildirimler

- `sonner` (toast) — shadcn/ui ile uyumlu
- Başarı, hata, yükleme durumları için

---

## 13. Bağımlılıklar (Tam Liste)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.1.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.0.0",
    "@fullcalendar/react": "^6.0.0",
    "@fullcalendar/daygrid": "^6.0.0",
    "@fullcalendar/timegrid": "^6.0.0",
    "@fullcalendar/interaction": "^6.0.0",
    "recharts": "^2.0.0",
    "xlsx": "^0.18.0",
    "date-fns": "^3.0.0",
    "sonner": "^1.0.0",
    "next-pwa": "^5.6.0",
    "tailwindcss": "^3.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.400.0"
  }
}
```

---

## 14. Kapsam Dışı (Bu MVP'de Yok)

Aşağıdakiler bilinçli olarak dışarıda bırakıldı. Sonraki sürüme bırak:

- Belge/dosya ekleri (PDF, dilekçe upload)
- E-posta bildirimleri / push notification
- Çoklu dil desteği
- Offline çalışma (PWA service worker cache)
- Gelişmiş raporlama / BI dashboard
- Müvekkil portalı (müvekkil kendi dosyasını görebilsin)
- API entegrasyonu (UYAP, e-devlet)
- Mobil native uygulama (React Native)
- Zaman takibi (saat bazlı faturalama)

---

*Bu PRD son haldir. Agent bu belgeyi alıp soru sormadan ürünü inşa edebilir.*
*Versiyon: 1.0 — Tüm kararlar onaylanmıştır.*
