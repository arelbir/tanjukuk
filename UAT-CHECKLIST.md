# UAT Test Checklist

## Test Bilgileri
- **Tarih:** 25.04.2026
- **Tester:** Cascade (AI Agent)
- **Versiyon:** 0.1.0
- **Ortam:** http://localhost:3000

---

## 1. Login Testi (Yüksek Öncelik)

- [x] Login sayfasına git
- [x] Geçerli e-posta ve şifre ile giriş yap
- [x] Başarılı giriş sonrası Dashboard'a yönlendirildiğini kontrol et
- [x] Hatalı giriş ile hata mesajı görüntüleniyor mu?

**Sonuç:** ✅ Başarılı
**Notlar:** admin@hukukburo.com / admin123 ile başarılı giriş yapıldı, Dashboard'a yönlendirildi. 

---

## 2. Dashboard Testi (Yüksek Öncelik)

- [x] Dashboard sayfasına git
- [x] İstatistik kartları görüntüleniyor mu? (Aktif Dosyalar, Müvekkiller, Duruşmalar)
- [x] Admin/asistan için pasta grafik (Dosya Durumu Dağılımı) görüntüleniyor mu?
- [x] Admin/asistan için çubuk grafik (Avukata Göre Dosya Sayısı) görüntüleniyor mu?
- [x] Grafikler etkileşimli mi? (hover, tooltip)

**Sonuç:** ✅ Başarılı
**Notlar:** İstatistik kartları ve grafikler doğru görüntüleniyor. 

---

## 3. Dosya Listesi Testi (Yüksek Öncelik)

- [x] Dosyalar sayfasına git
- [x] Tablo doğru görüntüleniyor mu?
- [x] **Filtre testleri:**
  - [x] Avukat filtresini değiştir
  - [x] Durum filtresini değiştir
  - [x] Dava türü filtresini değiştir
  - [x] Tarih aralığı filtresini uygula
- [x] **Arama testi:** Dosya kodu, müvekkil adı veya karşı taraf ile ara
- [x] **Satır renkleri:** Lehe (yeşil), Aleyhe (kırmızı), Kısmen (sarı) kenarlıklar görünüyor mu?
- [x] Sayfalama çalışıyor mu?

**Sonuç:** ✅ Başarılı
**Notlar:** Filtreler ve satır renkleri (Lehe/Aleyhe/Kısmen) doğru çalışıyor. 

---

## 4. Dosya Detay Testi (Yüksek Öncelik)

- [x] Bir dosyaya tıkla
- [x] **Dosya Özeti:**
  - [x] Kapanma tarihi görünüyor mu?
  - [x] Dava değeri görünüyor mu?
- [x] **Karar Bilgileri:**
  - [x] Dava sonucu görünüyor mu?
  - [x] Lehe hükmedilen tutar görünüyor mu?
  - [x] Aleyhe hükmedilen tutar görünüyor mu?
  - [x] Eski mahkeme bilgileri görünüyor mu?
- [x] **Gelir/Gider Özeti:**
  - [x] Gelir kayıtları tabloda görünüyor mu?
  - [x] Gider kayıtları tabloda görünüyor mu?
- [x] Duruşmalar listeleniyor mu?
- [x] Aktiviteler listeleniyor mu?

**Sonuç:** ✅ Başarılı
**Notlar:** Kapanma tarihi, dava değeri, karar bilgileri ve gelir/gider özeti bölümleri görüntüleniyor. 

---

## 5. Müvekkil Listesi ve Detay Testi (Yüksek Öncelik)

- [x] Müvekkiller sayfasına git
- [x] Müvekkil listesi görüntüleniyor mu?
- [x] Bir müvekkile tıkla
- [x] Müvekkil detayları görünüyor mu? (İletişim, Kayıt Bilgisi)
- [x] İlgili dosyalar listeleniyor mu?
- [x] Dosya linkleri çalışıyor mu?

**Sonuç:** ✅ Başarılı
**Notlar:** Müvekkil detayları ve ilgili dosyalar doğru görüntüleniyor. 

---

## 6. Müvekkil Düzenleme Testi (Yüksek Öncelik)

- [x] Müvekkil detay sayfasında "Düzenle" butonuna tıkla
- [x] Dialog açılıyor mu?
- [x] İsim alanını değiştir
- [x] Telefon alanını değiştir
- [x] E-posta alanını değiştir
- [x] Vergi No alanını değiştir
- [x] Adres alanını değiştir
- [x] Tür alanını değiştir (Bireysel/Şirket)
- [x] "Kaydet" butonuna tıkla
- [x] Başarı mesajı görünüyor mu?
- [x] Değişiklikler kaydedildi mi?
- [x] "İptal" butonu çalışıyor mu?

**Sonuç:** ✅ Başarılı
**Notlar:** ABC Holding → ABC Holding Ltd. olarak başarıyla güncellendi. 

---

## 7. Takvim Testi (Orta Öncelik)

- [x] Takvim sayfasına git
- [x] FullCalendar görüntüleniyor mu?
- [x] Duruşmalar takvimde görünüyor mu?
- [x] Aktiviteler takvimde görünüyor mu?
- [x] Bir etkinliğe tıkla
- [x] Dosya detayına yönlendiriliyor mu?
- [x] Avukat filtresi çalışıyor mu?

**Sonuç:** ✅ Başarılı
**Notlar:** FullCalendar doğru görüntüleniyor, duruşmalar takvimde gösteriliyor. 

---

## 8. Gelir Kayıtları Testi (Orta Öncelik)

- [x] Gelir sayfasına git
- [x] Gelir kayıtları listeleniyor mu?
- [x] Toplam gelir görüntüleniyor mu?
- [x] Yeni gelir kaydı ekleme formu açılıyor mu?
- [x] Arama fonksiyonu çalışıyor mu?

**Sonuç:** ✅ Başarılı
**Notlar:** Gelir kayıtları ve toplam tutar doğru görüntüleniyor. 

---

## 9. Gider Kayıtları Testi (Orta Öncelik)

- [x] Giderler sayfasına git
- [x] Gider kayıtları listeleniyor mu?
- [x] Kurum giderleri ve kişisel giderler ayrı görüntüleniyor mu?
- [x] Toplam giderler görüntüleniyor mu?
- [x] Yeni gider kaydı ekleme formu açılıyor mu?
- [x] Arama fonksiyonu çalışıyor mu?

**Sonuç:** ✅ Başarılı
**Notlar:** Kurum ve kişisel giderler ayrı tablolarda görüntüleniyor. 

---

## 10. Mobil Navigasyon Testi (Orta Öncelik)

- [x] Browser'ı mobil görünümüne al (F12 → Mobil mod)
- [x] Alt tab bar görünüyor mu?
- [x] Dashboard sekmesi çalışıyor mu?
- [x] Dosyalar sekmesi çalışıyor mu?
- [x] Takvim sekmesi çalışıyor mu?
- [x] Gelir/Gider sekmesi çalışıyor mu?
- [x] Aktif sekme vurgulanıyor mu?

**Sonuç:** ✅ Başarılı
**Notlar:** Mobil görünümde alt tab bar doğru görüntüleniyor ve çalışıyor. 

---

## 11. PWA Manifest Testi (Düşük Öncelik)

- [x] Chrome DevTools → Application → Manifest
- [x] Manifest yükleniyor mu?
- [x] İkonlar doğru görünüyor mu?
- [x] Uygulama adı doğru görünüyor mu?
- [x] Theme color doğru mu?

**Sonuç:** ✅ Başarılı
**Notlar:** Manifest.json doğru yükleniyor, ikonlar ve theme color doğru. 

---

## 12. Excel Şablonları Testi (Yüksek Öncelik)

- [x] Dosya şablonu indirildi
- [x] Müvekkil şablonu indirildi
- [x] Gelir şablonu indirildi
- [x] Gider şablonu indirildi
- [x] Duruşma şablonu indirildi
- [x] Aktivite şablonu indirildi
- [x] Tüm başlıklar Türkçe mi?
- [x] Hata mesajları Türkçe mi?

**Sonuç:** ✅ Başarılı
**Notlar:** Tüm Excel şablon başlıkları Türkçe'ye çevrildi (Avukat E-posta, Müvekkil Adı, Karşı Taraf vb.)

---

## 13. Dışa Aktarma Testi (Yüksek Öncelik)

- [x] Dosyaları dışa aktar
- [x] Müvekkilleri dışa aktar
- [x] Gelirleri dışa aktar
- [x] Giderleri dışa aktar
- [x] Excel dosyaları indiriliyor mu?

**Sonuç:** ✅ Başarılı
**Notlar:** Dışa aktarma fonksiyonları çalışıyor, Excel dosyaları indiriliyor.

---

## 14. Form Validasyonları Testi (Yüksek Öncelik)

- [x] Yeni dosya formu aç
- [x] Zorunlu alanları boş bırak
- [x] Kaydet butonuna tıkla
- [x] Hata mesajı görüntüleniyor mu?
- [x] Hata mesajı Türkçe mi?

**Sonuç:** ✅ Başarılı
**Notlar:** "Lütfen zorunlu alanları doldurun (Avukat, Müvekkil, Karşı Taraf, Dava Türü vb.)" mesajı Türkçe.

---

## 15. Boş Durumlar Testi (Orta Öncelik)

- [x] Müvekkil listesinde arama yap (sonuç yok)
- [x] "Veri bulunamadı" mesajı görüntüleniyor mu?
- [x] Mesaj Türkçe mi?

**Sonuç:** ✅ Başarılı
**Notlar:** "Müvekkil bulunamadı" mesajı Türkçe ve kullanıcı dostu.

---

## 16. Mobil Responsive Testi (Orta Öncelik)

- [x] Mobil görünümde tablo görüntüleme
- [x] Tablo scroll gerekiyor mu?
- [x] Tablo düzgün görüntüleniyor mu?

**Sonuç:** ✅ Başarılı
**Notlar:** Mobil görünümde tablo düzgün görüntüleniyor, scroll gerekmiyor.

---

## Genel Değerlendirme

**Toplam Test:** 16
**Başarılı:** 16
**Başarısız:** 0
**Kritik Hatalar:** Yok

**Genel Sonuç:** ✅ Yayına Hazır

**Önemli Notlar:** 
- Tüm temel testler başarıyla tamamlandı
- Excel şablon başlıkları Türkçe'ye çevrildi
- Hata mesajları Türkçe
- Form validasyonları çalışıyor
- Mobil responsive tasarım düzgün
- Boş durum mesajları Türkçe ve kullanıcı dostu 

---

## Test Tamamlama

Testi tamamladıktan sonra bu dosyayı kaydedin ve sonuçları raporlayın.
