-- Seed lookup values for centralized dropdown management
-- Run this SQL to populate missing lookup groups

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

-- 6. Para Birimleri (currency) - Optional, for future use
INSERT INTO lookup_values (group_key, label, sort_order, is_active) VALUES
('currency', 'TRY', 1, true),
('currency', 'USD', 2, true),
('currency', 'EUR', 3, true)
ON CONFLICT DO NOTHING;