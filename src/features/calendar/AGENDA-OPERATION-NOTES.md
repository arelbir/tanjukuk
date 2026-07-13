# Ajanda Operasyon Merkezi Entegrasyon Notları

Bu notlar, ana sayfa ajanda operasyon merkezinin demo/local state akışından gerçek API ve repository katmanına geçişi için referans dokümandır.

## Mevcut UI davranışı

- `AgendaOperationSection` ana sayfa ve `/calendar` ekranında ortak kullanılır.
- Demo veri `src/components/domain/demo-data.ts` içinden gelir.
- Tamamla/geri al local state ile temsil edilir.
- Görev/duruşma ekleme local state listesine kayıt ekler.
- Kullanıcıya `sonner` toast ile geri bildirim verilir.

## Nihai veri akışı

- UI doğrudan Supabase çağırmamalıdır.
- Ajanda listeleme için React Query hook kullanılmalıdır.
- Tamamla/geri al mutation olarak uygulanmalıdır.
- Başarılı mutation sonrası ilgili query key invalidate edilmelidir.
- Hata durumunda optimistic update rollback yapılmalıdır.

## Önerilen hooklar

- `useCalendarItems(filters)`
- `useCreateCalendarEvent()`
- `useCompleteCalendarEvent()`
- `useReopenCalendarEvent()`

## API endpoint önerisi

Mevcut endpoint:

- `POST /api/calendar/events/[id]/complete`

Gerekli ek davranış:

- Reopen desteği eklenmeli.

Öneriler:

- `POST /api/calendar/events/[id]/complete`
- `POST /api/calendar/events/[id]/reopen`

Alternatif:

- `PATCH /api/calendar/events/[id]` ile `is_completed` güncellemesi.

## Permission kuralları

UI şu merkezi helperları kullanır:

- `can(user, 'calendar:create', resource)`
- `can(user, 'calendar:complete', resource)`

Backend/API katmanı da aynı iş kuralını server tarafında garanti etmelidir.

## Cache notu

Service worker `_next` assetlerini cachelememelidir. Eski client bundle hydration mismatch ve bozuk click davranışına yol açabilir.
