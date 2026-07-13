# Eski Migration Arşivi

Bu klasördeki eski `000_*`–`012_*` SQL dosyaları çalışma zamanında kullanılmayan, önceki prototip döneminden kalmış referans migration dosyalarıdır.

Geçerli Supabase migration zinciri `supabase/migrations/202607110001_initial_foundation.sql` ile başlayıp ardışık `2026071100xx_*` dosyaları üzerinden ilerler.

Kurallar:

- Yeni veritabanı değişiklikleri yalnızca `supabase/migrations/` altına timestamp sıralı yeni dosya olarak eklenmelidir.
- `src/lib/migrations/` altındaki eski dosyalar uygulama kodu tarafından çalıştırılmamalıdır.
- Eski dosyalar yalnızca tarihsel referans için tutulur.
- Çakışma durumunda canonical kaynak `supabase/migrations/` dizinidir.
