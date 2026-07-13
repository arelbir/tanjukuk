# Design System — Hukuk Büro Mobil Yönetim

Kaynak yaklaşım: `ui-ux-pro-max-skill` çıktısı + mobil-first shadcn uygulama ihtiyaçları.

## Ürün tipi

Hukuk bürosu iç operasyon uygulaması:

- Müvekkil yönetimi
- Dava/icra dosyası yönetimi
- Ajanda/duruşma/görev takibi
- Finans/alacak/gider yönetimi
- Belge yönetimi
- Bildirim ve audit

Bu bir landing page değil; bu yüzden skill’in “Trust & Authority” önerisini uygulama UI diline uyarlıyoruz.

## Stil yönü

**Trust & Authority / Enterprise Mobile App**

Karakter:

- Güvenilir
- Sade
- Hızlı
- Resmi ama hantal değil
- Mobil saha kullanımına uygun

Kaçınılacaklar:

- AI purple/pink gradient
- Cam/glassmorphism
- Aşırı gölge
- Emojiler
- Dekoratif hero alanları
- Masaüstü-first tablo UI
- Rastgele renk kullanımı

## Renk tokenları

Skill önerisi:

- Primary: `#1E3A8A`
- Secondary: `#1E40AF`
- Accent/CTA: `#B45309`
- Background: `#F8FAFC`
- Foreground: `#0F172A`
- Muted: `#E9EEF5`
- Border: `#CBD5E1`
- Destructive: `#DC2626`
- Ring: `#1E3A8A`

Uygulama token eşlemesi:

- `--background`: `#F8FAFC`
- `--foreground`: `#0F172A`
- `--card`: `#FFFFFF`
- `--primary`: `#1E3A8A`
- `--primary-foreground`: `#FFFFFF`
- `--secondary`: `#E9EEF5`
- `--secondary-foreground`: `#0F172A`
- `--accent`: `#FEF3C7`
- `--accent-foreground`: `#92400E`
- `--muted`: `#E9EEF5`
- `--muted-foreground`: `#475569`
- `--border`: `#CBD5E1`
- `--destructive`: `#DC2626`
- `--ring`: `#1E3A8A`

## Tipografi

Skill önerisi EB Garamond + Lato. Ancak mobil operasyon uygulamasında okunabilirlik ve yoğun veri öncelikli olduğundan:

- Uygulama body: tek sans font
- Başlıklar: aynı sans font, 600–700 ağırlık
- Uzun içerik ve belgelerde ileride serif opsiyonel kullanılabilir

Mobil tipografi:

- Page title: 22–24px / 600
- Section title: 16–18px / 600
- Card title: 15–16px / 600
- Body: 14–15px / 400–500
- Meta: 12–13px / 400

## Mobil layout sistemi

### Safe layout

- Sayfa padding: 16px
- Kart padding: 14–16px
- Liste item minimum yüksekliği: 64px
- Dokunma hedefi: minimum 44px
- Sticky bottom action alanı: 72–88px

### Shell

Mobil ana navigasyon:

1. Ana Sayfa
2. Dosyalar
3. Ajanda
4. Finans
5. Daha Fazla

Desktop:

- Sidebar kullanılabilir ama mobil akış ana kaynak kabul edilir.

## Ekran bileşen standartları

### Page header

- Büyük hero yok.
- Başlık + kısa açıklama + gerektiğinde tek primary aksiyon.
- Mobilde aksiyon sticky bottom’a taşınabilir.

### List item

Mobilde tablo yerine kart/liste item.

Standart yapı:

- Sol: ikon veya durum çizgisi
- Orta: başlık, meta, ikinci satır
- Sağ: durum badge veya chevron
- Alt: isteğe bağlı hızlı aksiyonlar

### Filter

- Mobilde filter sheet.
- Desktop’ta yatay filter bar.
- Arama her zaman ilk kontrol.

### Form

- Mobilde full-height sheet.
- Sticky footer: İptal + Kaydet.
- Validation alan altında.
- Çok adımlı formlar yalnız belge yükleme gibi gerekli yerlerde.

### Detail

Detay ekranı sırası:

1. Özet kartı
2. Kritik uyarılar
3. Segment/bölüm navigasyonu
4. İlişkili kayıt listeleri
5. Audit/geçmiş en altta

## shadcn component kullanımı

Kullanılacak primitives:

- Button
- Card
- Badge
- Input
- Textarea
- Select/Combobox
- Sheet/Drawer
- Dialog
- Tabs veya segmented control
- Command
- Dropdown Menu
- Alert
- Skeleton
- Toast

Kural:

- Custom component yazılabilir ama primitive davranışları shadcn üzerine kurulmalı.
- Component API’leri küçük tutulmalı.
- Her component mobile state düşünülerek yazılmalı.

## Anti-slop checklist

Her ekran için kontrol:

- [ ] 375px genişlikte yatay scroll yok.
- [ ] En önemli aksiyon tek ve net.
- [ ] Mobilde tablo yok.
- [ ] Boş/loading/error durumu var.
- [ ] Renkler tokenlardan geliyor.
- [ ] En fazla bir primary CTA var.
- [ ] Hover kadar focus state de var.
- [ ] Gereksiz ikon yok.
- [ ] Metinler gerçek kullanıcı diliyle yazıldı.
- [ ] Kayıt kartlarında gereksiz bilgi kalabalığı yok.

## Öncelikli ekran sırası

1. Login
2. App shell + mobil bottom nav
3. Ana Sayfa
4. Dosyalar birleşik liste
5. Dosya detay
6. Ajanda liste
7. Finans
8. Belgeler
9. Müvekkiller
10. Yönetim
