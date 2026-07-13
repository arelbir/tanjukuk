# Frontend UX Plan — Mobil Öncelikli Hukuk Bürosu Uygulaması

## Durum

Mevcut frontend purge edildi. Backend/API, Supabase, RLS, repository, schema ve type katmanları korunuyor. Yeni frontend sıfırdan, shadcn/ui + Tailwind ile mobil öncelikli tasarlanacak.

## Tasarım ilkeleri

- Mobil ilk: ana kullanım 375–430px telefon ekranı kabul edilecek.
- Tek elle kullanım: ana aksiyonlar alt bölgede veya kolay erişilebilir sticky alanlarda olacak.
- Az ekran, güçlü akış: kullanıcıyı her modülde tabloya boğmak yerine görev odaklı kart/liste deneyimi sunulacak.
- Tutarlı hiyerarşi: her ekranda başlık, özet, arama/filtre, liste, ana aksiyon sırası aynı olacak.
- Kurumsal ama sade: neon, gradient, cam efekti, aşırı gölge, gereksiz animasyon yok.
- Veri yoğun ekranlarda progressive disclosure: detaylar accordion/drawer/detail screen ile açılacak.
- Dokunmatik hedefler: minimum 44px yükseklik.
- Kontrast: WCAG AA hedeflenecek.
- Hareket: yalnız 150–220ms küçük geçişler; `prefers-reduced-motion` saygılı.

## Stack kararı

- Next.js App Router
- shadcn/ui primitives
- Tailwind CSS
- lucide-react ikonları
- TanStack Query sadece client veri ekranlarında
- Server component mümkün olduğu yerlerde kullanılacak

## Görsel sistem

### Renk

- Arka plan: slate tabanlı açık nötr `#f8fafc`
- Kart: beyaz
- Ana aksiyon: mavi `#1d4ed8`
- Uyarı: amber
- Hata: kırmızı
- Başarı: emerald
- Border: slate-300/200

Kaçınılacaklar:

- Mor/pembe AI gradient
- Bej/lüks hukuk teması
- Bir ekranda birden fazla farklı primary tonu
- Ağır drop shadow

### Tipografi

- Tek sans font.
- Sayfa başlığı mobilde 22–24px.
- Kart başlığı 15–16px.
- Meta bilgi 12–13px.
- Çok uzun satırlarda 65–75 karakter sınırı.

### Spacing

- Mobil yatay padding: 16px
- Desktop yatay padding: 24–32px
- Kart iç padding: 14–16px
- Liste item min yüksekliği: 64px
- Sticky bottom action alanı: 72–88px

## Uygulama bilgi mimarisi

### Alt navigasyon — mobil ana yapı

Mobilde 5 ana hedef:

1. Ana Sayfa
2. Dosyalar
3. Ajanda
4. Finans
5. Daha Fazla

“Daha Fazla” içinde:

- Müvekkiller
- Belgeler
- Bildirimler
- Yönetim
- Ayarlar
- Çıkış

### Desktop yapı

Desktop yan menü kullanılabilir ama mobil deneyim ana kaynak olacak. Desktop sadece daha geniş liste ve çok kolonlu detay avantajı sağlar.

## Ana ekranlar

### 1. Giriş

Amaç: hızlı, net oturum açma.

İçerik:

- Logo/ürün adı küçük
- E-posta
- Şifre
- Giriş butonu
- Hata mesajı

Kaçınılacak:

- Büyük hero alanı
- Gereksiz açıklama
- Büyük boşluklar

### 2. Ana Sayfa

Amaç: kullanıcının bugün ne yapacağını görmesi.

Mobil sıra:

1. Günaydın / kullanıcı adı
2. Bugün yapılacaklar
3. Gecikmiş kritik işler
4. Yaklaşan duruşmalar
5. Finans uyarıları
6. Hızlı aksiyonlar

Hızlı aksiyonlar:

- Görev ekle
- Duruşma ekle
- Müvekkil ekle
- Belge yükle

### 3. Dosyalar birleşik ekranı

Davalar ve icralar ayrı üst modül olarak değil, mobilde tek “Dosyalar” deneyimi olarak ele alınacak.

Segmentler:

- Tümü
- Davalar
- İcralar
- Arşiv

Liste item:

- Dosya kodu
- Müvekkil
- Karşı taraf / borçlu
- Durum badge
- Sonraki ajanda tarihi
- Kalan/tutar bilgisi küçük meta

Detay ekranı:

- Üst özet kartı
- Sekmeler veya bölümler:
  - Genel
  - Ajanda
  - Finans
  - Belgeler
  - Geçmiş

### 4. Müvekkiller

Amaç: kişi/kurum bulma ve ilgili dosyalara gitme.

Liste item:

- Ad
- Tip
- Telefon/e-posta
- Aktif dosya sayısı

Detay:

- İletişim
- Dosyalar
- Belgeler
- Finans özeti

### 5. Ajanda

Mobilde takvim grid’i ana ekran olmamalı; önce liste odaklı görünüm.

Varsayılan görünüm:

- Bugün
- Yarın
- Bu hafta
- Gecikmiş

Etkinlik item:

- Saat/tarih
- Tür ikonu
- Başlık
- Bağlı dosya
- Sorumlu
- Tamamla aksiyonu

Takvim ay görünümü ikincil mod olarak sunulabilir.

### 6. Finans

Mobilde üç ana segment:

- Alacaklar
- Tahsilatlar
- Giderler

Üstte özet:

- Bekleyen
- Vadesi geçmiş
- Bu ay tahsilat
- Bu ay gider

Liste item:

- Tutar
- Müvekkil
- Dosya bağlantısı
- Vade/tarih
- Durum

Formlar drawer/sheet ile açılır.

### 7. Belgeler

Amaç: hızlı belge bulma/yükleme.

Liste item:

- Dosya adı
- Bağlı kayıt
- Yükleyen
- Tarih
- Boyut

Aksiyonlar:

- İndir
- Arşivle
- Bağlı kayda git

Upload:

- İlk adım: bağlantı seç
- İkinci adım: dosya seç
- Üçüncü adım: açıklama ve yükle

### 8. Bildirimler

Mobilde ayrı sayfa + header badge.

Gruplar:

- Okunmamış
- Bugün
- Önceki

Aksiyon:

- Okundu işaretle
- İlgili kayda git

### 9. Yönetim

Yalnız admin.

Alt ekranlar:

- Kullanıcılar
- Lookup değerleri
- Audit log

Mobilde yönetim çok yoğun olduğundan liste + detail drawer kullanılacak.

## Form UX kuralları

- Drawer/sheet mobilde tam ekran açılacak.
- Kaydet butonu sticky footer’da olacak.
- Zorunlu alanlar minimum tutulacak.
- Select arama destekli olacak.
- Hata mesajı alan altında kısa ve net olacak.
- Başarılı işlem sonrası toast + ilgili liste invalidation.

## Liste UX kuralları

- Mobilde tablo kullanılmayacak.
- Kart/list item kullanılacak.
- Desktop’ta tablo opsiyonel ama aynı bilgi hiyerarşisi korunacak.
- Filter bar mobilde collapsible sheet olacak.

## Öncelikli uygulama sırası

1. Design tokens ve shadcn primitive teması
2. App shell: mobile bottom nav, desktop sidebar, header
3. Login
4. Ana Sayfa
5. Dosyalar birleşik ekranı
6. Ajanda liste ekranı
7. Finans ekranı
8. Belgeler ekranı
9. Müvekkiller
10. Yönetim ekranları
11. Detay ekranları
12. Mobil polish ve gerçek cihaz kontrolü

## Kabul kriterleri

- 375px genişlikte yatay taşma olmayacak.
- Ana aksiyonlar başparmak erişim alanında olacak.
- Tüm dokunulabilir öğeler minimum 44px olacak.
- Tablo mobilde kullanılmayacak.
- Renk/token kullanımı tek kaynak üzerinden olacak.
- Her ekran boş/loading/error durumuna sahip olacak.
- `npm run typecheck`, `npm run lint`, `npm run build` temiz geçecek.
