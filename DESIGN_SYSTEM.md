# Hukuk Bürosu Yönetim Sistemi - Design System

Bu doküman uygulama genelinde kullanılacak tutarlı UX/UI standartlarını belirler.

---

## 1. Form Elementleri

### 1.1 Input Yüksekliği
Tüm input türleri aynı yüksekliğe sahip olmalıdır:

| Element | Yükseklik | Class |
|---------|-----------|-------|
| Text Input | 32px | `h-8` |
| Number Input | 32px | `h-8` |
| Date Input | 32px | `h-8` |
| Select/Dropdown | 32px | `h-8` (32px inline) |
| Textarea | Flexible | `min-h-28` |

### 1.2 Input Arka Plan Rengi
Tüm input elementleri beyaz arka plan kullanır:
- **Varsayılan**: `bg-white`
- **Border**: `border-input` (`#e2e8f0`)
- **Focus**: `border-primary` (`#2563eb`)

### 1.3 Input Padding
- **Horizontal**: `px-2.5` (10px)
- **Vertical**: `py-1` (4px)
- **Textarea**: `px-3 py-2`

### 1.4 Border Radius
- **Tüm inputlar**: `rounded-lg` (8px)
- **Segmented buton grupları**: `rounded-md` (6px)

---

## 2. Butonlar

### 2.1 Buton Yüksekliği
Tüm butonlar aynı yükseklikte olmalıdır:

| Buton Tipi | Yükseklik | Class |
|------------|-----------|-------|
| Standard Button | 32px | `h-8` |
| Icon Button | 32px | `h-8 w-8` |
| Segmented Button | 32px | `h-8` |

### 2.2 Buton Variants

#### Primary (Kaydet, Onayla)
```tsx
<Button className="h-8 px-4">Kaydet</Button>
```
- **Bg**: `bg-primary`
- **Text**: `text-primary-foreground` (beyaz)
- **Icon**: Sol tarafta, `mr-2 h-4 w-4`

#### Outline (İptal, İkincil aksiyonlar)
```tsx
<Button variant="outline" className="h-8">İptal</Button>
```
- **Bg**: `bg-white`
- **Border**: `border-input`
- **Hover**: `hover:bg-muted`

#### Ghost (İkincil/tertiary)
```tsx
<Button variant="ghost" className="h-8">Vazgeç</Button>
```
- **Bg**: `bg-transparent`
- **Hover**: `hover:bg-muted`

### 2.3 Segmented Button Group
Birden fazla ilişkili buton yan yana gösterildiğinde:

```tsx
<div className="flex">
  <Button variant="outline" className="h-8 rounded-l-md rounded-r-none border-r-0">
    <Icon className="h-4 w-4 mr-2" />
    Label 1
  </Button>
  <Button variant="outline" className="h-8 rounded-none border-r-0">
    <Icon className="h-4 w-4 mr-2" />
    Label 2
  </Button>
  <Button variant="outline" className="h-8 rounded-r-md rounded-l-none">
    <Icon className="h-4 w-4 mr-2" />
    Label 3
  </Button>
</div>
```

### 2.4 Buton Grupları Ayırıcı
Farklı aksiyon grupları arasında dikey çizgi:
```tsx
<div className="w-px h-6 bg-border mx-2" />
```

---

## 3. Select/Dropdown

### 3.1 UnifiedSelect Stilleri
```tsx
<UnifiedSelect
  value={value}
  onChange={onChange}
  items={items}
  placeholder="Seçiniz"
  className="w-24" // veya w-full
/>
```

#### Inline Styles (react-select)
- **Control height**: `32px`
- **Border radius**: `0.5rem` (8px)
- **Background**: `white`
- **Border color (default)**: `#e2e8f0`
- **Border color (focus)**: `#2563eb`

### 3.2 Select ile Input Hizalama
Input + Select yan yana olduğunda:
```tsx
<div className="flex gap-2">
  <Input className="flex-1 bg-white" />
  <UnifiedSelect className="w-24" />
</div>
```

---

## 4. Radio/Seçim Butonları

### 4.1 RadioGroup (Segmented Control)
```tsx
<RadioGroup
  items={items}
  value={value}
  onChange={onChange}
/>
```

#### Stil (filled - Quick Status Bar ile aynı)
- **Height**: `h-8`
- **Padding**: `px-3 py-2`
- **Font size**: `text-xs`
- **Border radius**: `rounded`
- **Selected**: `bg-primary text-primary-foreground border-primary`
- **Unselected**: `bg-white text-muted-foreground border-input`
- **Hover (unselected)**: `hover:bg-muted`

---

## 5. Form Layout

### 5.1 Label Stilleri
```tsx
<Label className="text-sm font-medium">
  Label Adı {required && <span className="text-destructive">*</span>}
</Label>
```

#### Label + Input Aralığı
```tsx
<div className="space-y-2">
  <Label>...</Label>
  <Input />
</div>
```

### 5.2 Grid Yapısı
İki sütunlu form elemanları:
```tsx
<div className="grid grid-cols-2 gap-3">
  <div className="space-y-2">...</div>
  <div className="space-y-2">...</div>
</div>
```

### 5.3 Placeholder Standartları
Tüm select/input'larda tutarlı placeholder:
- **Select**: `"Seçiniz"`
- **Input**: Alan içeriğine göre (örn: `"İlçe adı"`, `"Örn: X Sigorta A.Ş."`)

---

## 6. Üst Bar (Header) Standartları

### 6.1 Yapı
```tsx
<div className="flex-none flex items-center justify-between border-b px-6 py-4 bg-card">
  {/* Sol: Geri butonu + Başlık */}
  <div className="flex items-center gap-4">
    <Button variant="outline" size="icon" className="h-8 w-8">
      <ArrowLeft className="h-4 w-4" />
    </Button>
    <h1 className="text-xl font-semibold tracking-tight">Sayfa Başlığı</h1>
  </div>
  
  {/* Sağ: Aksiyon butonları */}
  <div className="flex items-center gap-2">
    {/* Butonlar... */}
  </div>
</div>
```

### 6.2 Buton Sıralaması
1. İkincil aksiyonlar (segmented group)
2. Ayırıcı çizgi (`w-px h-6 bg-border`)
3. İptal (outline)
4. Kaydet (primary)

---

## 7. Renk Paleti

### 7.1 Temel Renkler
| Kullanım | Renk | Tailwind |
|----------|------|----------|
| Primary | Mavi | `bg-primary` / `#2563eb` |
| Background | Beyaz | `bg-white` |
| Border | Gri-200 | `border-input` / `#e2e8f0` |
| Text | Slate-900 | `text-foreground` / `#0f172a` |
| Muted Text | Slate-500 | `text-muted-foreground` / `#64748b` |
| Destructive | Kırmızı | `text-destructive` / `#ef4444` |

### 7.2 Durum Renkleri
| Durum | Kullanım |
|-------|----------|
| Success | Yeşil - Onay, başarılı işlem |
| Warning | Sarı - Uyarı, dikkat gerektiren |
| Error | Kırmızı - Hata, silme işlemi |
| Info | Mavi - Bilgi, notlar |

---

## 8. Tipografi

### 8.1 Font Boyutları
| Element | Boyut | Class |
|---------|-------|-------|
| Page Title | 20px | `text-xl` |
| Section Title | 12px uppercase | `text-sm uppercase` |
| Label | 14px | `text-sm` |
| Input Text | 14px | `text-sm` |
| Button Text | 12px | `text-xs` |
| Helper Text | 12px | `text-xs` |

### 8.2 Font Ağırlıkları
| Kullanım | Ağırlık | Class |
|----------|---------|-------|
| Page Title | 600 | `font-semibold` |
| Section Title | 600 | `font-semibold` |
| Label | 500 | `font-medium` |
| Button | 500 | `font-medium` |
| Normal Text | 400 | `font-normal` |

---

## 9. Boşluk ve Padding Standartları

### 9.1 Form Elementleri Arası
- **Input grupları arası**: `space-y-4` (16px)
- **Label + Input arası**: `space-y-2` (8px)
- **Grid gap**: `gap-3` (12px) veya `gap-6` (24px)

### 9.2 Sayfa Padding
- **Üst bar**: `px-6 py-4`
- **Form alanları**: `p-6`
- **Card içi**: `p-4`

---

## 10. Quick Reference - Kopyala/Yapıştır

### 10.1 Standart Input
```tsx
<div className="space-y-2">
  <Label className="text-sm font-medium">
    Label <span className="text-destructive">*</span>
  </Label>
  <Input 
    className="w-full bg-white border-input h-8"
    placeholder="Placeholder..."
  />
</div>
```

### 10.2 Standart Select
```tsx
<div className="space-y-2">
  <Label className="text-sm font-medium">Label</Label>
  <UnifiedSelect
    value={value}
    onChange={onChange}
    items={items}
    placeholder="Seçiniz"
    className="w-full"
  />
</div>
```

### 10.3 Standart Buton Group
```tsx
<div className="flex items-center gap-2">
  {/* Segmented group */}
  <div className="flex">
    <Button variant="outline" className="h-8 rounded-l-md rounded-r-none border-r-0">
      Buton 1
    </Button>
    <Button variant="outline" className="h-8 rounded-none border-r-0">
      Buton 2
    </Button>
    <Button variant="outline" className="h-8 rounded-r-md rounded-l-none">
      Buton 3
    </Button>
  </div>
  
  {/* Ayırıcı */}
  <div className="w-px h-6 bg-border mx-2" />
  
  {/* Aksiyon butonları */}
  <Button variant="outline" className="h-8">İptal</Button>
  <Button className="h-8 px-4">Kaydet</Button>
</div>
```

### 10.4 RadioGroup
```tsx
<div className="space-y-2">
  <Label className="text-sm font-medium">Label</Label>
  <RadioGroup
    items={items}
    value={value}
    onChange={onChange}
  />
</div>
```

---

## 11. Kontrol Listesi (Code Review)

Yeni sayfa/form geliştirirken kontrol edilecekler:

- [ ] Tüm inputlar `h-8` yüksekliğinde mi?
- [ ] Tüm inputlar `bg-white` arka plana sahip mi?
- [ ] Butonlar `h-8` yüksekliğinde mi?
- [ ] Segmented buton grupları doğru border-radius kullanıyor mu?
- [ ] Label'lar `text-sm font-medium` stilinde mi?
- [ ] Placeholder'lar tutarlı mı ("Seçiniz" vs "Seç")?
- [ ] Zorunlu alanlar `*` işaretçisi ile belirtilmiş mi?
- [ ] Zorunlu alan işaretçileri `text-destructive` renginde mi?
- [ ] Form elementleri arası `space-y-2`/`space-y-4` kullanılıyor mu?
- [ ] Grid yapıları `gap-3` veya `gap-6` kullanıyor mu?

---

**Son Güncelleme:** 26 Nisan 2026
**Versiyon:** 1.0
