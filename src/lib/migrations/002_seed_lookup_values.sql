-- Complete seed for all lookup values
-- This is a clean seed without any legacy data

-- 1. Kişi Türleri (entity_type)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('entity_type', 'Gerçek Kişi', 1, true),
('entity_type', 'Tüzel Kişi', 2, true)
ON CONFLICT DO NOTHING;

-- 2. Müvekkil Sıfatları (client_role)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('client_role', 'Davacı', 1, true),
('client_role', 'Davalı', 2, true),
('client_role', 'Müdahil', 3, true),
('client_role', 'Şikayetçi', 4, true),
('client_role', 'Şüpheli', 5, true)
ON CONFLICT DO NOTHING;

-- 3. Müvekkil Türleri (client_type)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('client_type', 'Bireysel', 1, true),
('client_type', 'Şirket', 2, true)
ON CONFLICT DO NOTHING;

-- 4. Ödeme Durumları (payment_status)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('payment_status', 'Ödendi', 1, true),
('payment_status', 'Bekliyor', 2, true),
('payment_status', 'Kısmi', 3, true)
ON CONFLICT DO NOTHING;

-- 5. Ödeme Yöntemleri (payment_method)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('payment_method', 'Nakit', 1, true),
('payment_method', 'Havale', 2, true),
('payment_method', 'Kart', 3, true)
ON CONFLICT DO NOTHING;

-- 6. Para Birimleri (currency)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('currency', 'TRY', 1, true),
('currency', 'USD', 2, true),
('currency', 'EUR', 3, true)
ON CONFLICT DO NOTHING;

-- 7. Mahkeme Instance (court_instance)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('court_instance', 'Yerel Mahkeme', 1, true),
('court_instance', 'İstinaf', 2, true),
('court_instance', 'Temyiz', 3, true),
('court_instance', 'Kesinleşti', 4, true),
('court_instance', 'Kapandı', 5, true)
ON CONFLICT DO NOTHING;

-- 8. Kullanıcı Rolleri (user_role)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('user_role', 'Admin', 1, true),
('user_role', 'Avukat', 2, true),
('user_role', 'Asistan', 3, true)
ON CONFLICT DO NOTHING;

-- 9. Dava Durumları (case_status)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('case_status', 'Devam Ediyor', 1, true),
('case_status', 'Beklemede', 2, true),
('case_status', 'Sonuçlandı', 3, true),
('case_status', 'İptal', 4, true)
ON CONFLICT DO NOTHING;

-- 10. Dava Türleri (case_type)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('case_type', 'Boşanma', 1, true),
('case_type', 'Tazminat', 2, true),
('case_type', 'Ceza', 3, true),
('case_type', 'İş', 4, true),
('case_type', 'Ticaret', 5, true)
ON CONFLICT DO NOTHING;

-- 11. Mahkeme Türleri (court_type)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('court_type', 'Aile Mahkemesi', 1, true),
('court_type', 'Asliye Hukuk Mahkemesi', 2, true),
('court_type', 'İş Mahkemesi', 3, true),
('court_type', 'Ceza Mahkemesi', 4, true)
ON CONFLICT DO NOTHING;

-- 12. Dosya Türleri (file_type)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('file_type', 'Ana Dosya', 1, true),
('file_type', 'İstem Dosyası', 2, true),
('file_type', 'Dava Dosyası', 3, true)
ON CONFLICT DO NOTHING;

-- 13. Gelir Kategorileri (income_category)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('income_category', 'Avukatlık Ücreti', 1, true),
('income_category', 'Danışmanlık', 2, true),
('income_category', 'Dava Masrafı', 3, true),
('income_category', 'Diğer', 4, true)
ON CONFLICT DO NOTHING;

-- 14. Gider Kategorileri (expense_category)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('expense_category', 'Kira', 1, true),
('expense_category', 'Elektrik', 2, true),
('expense_category', 'Su', 3, true),
('expense_category', 'İnternet', 4, true),
('expense_category', 'Ofis Malzemeleri', 5, true),
('expense_category', 'Yemek', 6, true),
('expense_category', 'Ulaşım', 7, true),
('expense_category', 'Diğer', 8, true)
ON CONFLICT DO NOTHING;

-- 15. Aktivite Türleri (activity_type)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('activity_type', 'Duruşma', 1, true),
('activity_type', 'Müvekkil Görüşmesi', 2, true),
('activity_type', 'Dava Dosyası İnceleme', 3, true),
('activity_type', 'Mahkeme Başvurusu', 4, true),
('activity_type', 'Delil Toplama', 5, true)
ON CONFLICT DO NOTHING;

-- 16. Türkiye İlleri (city)
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('city', 'Adana', 1, true),
('city', 'Adıyaman', 2, true),
('city', 'Afyon', 3, true),
('city', 'Ağrı', 4, true),
('city', 'Aksaray', 5, true),
('city', 'Amasya', 6, true),
('city', 'Ankara', 7, true),
('city', 'Antalya', 8, true),
('city', 'Ardahan', 9, true),
('city', 'Artvin', 10, true),
('city', 'Aydın', 11, true),
('city', 'Balıkesir', 12, true),
('city', 'Bartın', 13, true),
('city', 'Batman', 14, true),
('city', 'Bayburt', 15, true),
('city', 'Bilecik', 16, true),
('city', 'Bingöl', 17, true),
('city', 'Bitlis', 18, true),
('city', 'Bolu', 19, true),
('city', 'Burdur', 20, true),
('city', 'Bursa', 21, true),
('city', 'Çanakkale', 22, true),
('city', 'Çankırı', 23, true),
('city', 'Çorum', 24, true),
('city', 'Denizli', 25, true),
('city', 'Diyarbakır', 26, true),
('city', 'Düzce', 27, true),
('city', 'Edirne', 28, true),
('city', 'Elazığ', 29, true),
('city', 'Erzincan', 30, true),
('city', 'Erzurum', 31, true),
('city', 'Eskişehir', 32, true),
('city', 'Gaziantep', 33, true),
('city', 'Giresun', 34, true),
('city', 'Gümüşhane', 35, true),
('city', 'Hakkari', 36, true),
('city', 'Hatay', 37, true),
('city', 'Isparta', 38, true),
('city', 'Mersin', 39, true),
('city', 'İstanbul', 40, true),
('city', 'İzmir', 41, true),
('city', 'Kars', 42, true),
('city', 'Kastamonu', 43, true),
('city', 'Kayseri', 44, true),
('city', 'Kırklareli', 45, true),
('city', 'Kırşehir', 46, true),
('city', 'Kilis', 47, true),
('city', 'Kocaeli', 48, true),
('city', 'Konya', 49, true),
('city', 'Kütahya', 50, true),
('city', 'Malatya', 51, true),
('city', 'Manisa', 52, true),
('city', 'Kahramanmaraş', 53, true),
('city', 'Mardin', 54, true),
('city', 'Muğla', 55, true),
('city', 'Muş', 56, true),
('city', 'Nevşehir', 57, true),
('city', 'Niğde', 58, true),
('city', 'Ordu', 59, true),
('city', 'Osmaniye', 60, true),
('city', 'Rize', 61, true),
('city', 'Samsun', 62, true),
('city', 'Şanlıurfa', 63, true),
('city', 'Şırnak', 64, true),
('city', 'Tekirdağ', 65, true),
('city', 'Tokat', 66, true),
('city', 'Trabzon', 67, true),
('city', 'Tunceli', 68, true),
('city', 'Uşak', 69, true),
('city', 'Van', 70, true),
('city', 'Yalova', 71, true),
('city', 'Zonguldak', 72, true)
ON CONFLICT DO NOTHING;
