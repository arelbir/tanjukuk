-- Hukuk Büro Refactor v2 — Seed Lookup Values
-- Controlled initial values for a Turkish law office.

INSERT INTO public.lookup_values (group_key, label, code, sort_order) VALUES
  -- Case types
  ('case_type', 'Boşanma (Çekişmeli)', 'divorce_contested', 10),
  ('case_type', 'Boşanma (Anlaşmalı)', 'divorce_uncontested', 20),
  ('case_type', 'Nafaka', 'alimony', 30),
  ('case_type', 'Velayet', 'custody', 40),
  ('case_type', 'Mal Rejimi', 'property_regime', 50),
  ('case_type', 'İş Davası', 'labor', 60),
  ('case_type', 'Tazminat', 'compensation', 70),
  ('case_type', 'Ceza Davası', 'criminal', 80),
  ('case_type', 'Ticari Dava', 'commercial', 90),
  ('case_type', 'İdari Dava', 'administrative', 100),
  ('case_type', 'Diğer', 'other', 990),

  -- Case statuses
  ('case_status', 'Hazırlık', 'preparation', 10),
  ('case_status', 'Yerel Mahkeme', 'local_court', 20),
  ('case_status', 'İstinaf', 'appeal_regional', 30),
  ('case_status', 'Temyiz', 'appeal_supreme', 40),
  ('case_status', 'Kesinleşti', 'finalized', 50),
  ('case_status', 'Kapandı', 'closed', 60),
  ('case_status', 'Arşivlendi', 'archived', 70),

  -- Enforcement types
  ('enforcement_type', 'İlamsız Takip', 'ordinary', 10),
  ('enforcement_type', 'İlamlı Takip', 'judgment_based', 20),
  ('enforcement_type', 'Kambiyo Senetlerine Özgü Takip', 'negotiable_instrument', 30),
  ('enforcement_type', 'Rehnin Paraya Çevrilmesi', 'pledge_foreclosure', 40),
  ('enforcement_type', 'Tahliye Takibi', 'eviction', 50),
  ('enforcement_type', 'Diğer', 'other', 990),

  -- Enforcement statuses
  ('enforcement_status', 'Hazırlık', 'preparation', 10),
  ('enforcement_status', 'Takip Açıldı', 'opened', 20),
  ('enforcement_status', 'Tebligat Aşamasında', 'notification', 30),
  ('enforcement_status', 'Kesinleşti', 'finalized', 40),
  ('enforcement_status', 'Haciz Aşamasında', 'seizure', 50),
  ('enforcement_status', 'Tahsilat Aşamasında', 'collection', 60),
  ('enforcement_status', 'Kapandı', 'closed', 70),
  ('enforcement_status', 'Arşivlendi', 'archived', 80),

  -- Court types
  ('court_type', 'Aile Mahkemesi', 'family', 10),
  ('court_type', 'Asliye Hukuk Mahkemesi', 'civil_first_instance', 20),
  ('court_type', 'Sulh Hukuk Mahkemesi', 'civil_peace', 30),
  ('court_type', 'Asliye Ceza Mahkemesi', 'criminal_first_instance', 40),
  ('court_type', 'Ağır Ceza Mahkemesi', 'high_criminal', 50),
  ('court_type', 'İş Mahkemesi', 'labor', 60),
  ('court_type', 'İcra Hukuk Mahkemesi', 'enforcement_civil', 70),
  ('court_type', 'Ticaret Mahkemesi', 'commercial', 80),
  ('court_type', 'İdare Mahkemesi', 'administrative', 90),
  ('court_type', 'Bölge Adliye Mahkemesi', 'regional_court', 100),
  ('court_type', 'Yargıtay', 'supreme_court', 110),
  ('court_type', 'Diğer', 'other', 990),

  -- Client roles in case files
  ('client_role', 'Davacı', 'plaintiff', 10),
  ('client_role', 'Davalı', 'defendant', 20),
  ('client_role', 'Müdahil', 'intervenor', 30),
  ('client_role', 'Şikayetçi', 'complainant', 40),
  ('client_role', 'Şüpheli', 'suspect', 50),
  ('client_role', 'Sanık', 'accused', 60),
  ('client_role', 'Katılan', 'participant', 70),

  -- Receivable/payment categories
  ('payment_category', 'Vekâlet Ücreti', 'attorney_fee', 10),
  ('payment_category', 'Danışmanlık Ücreti', 'consulting_fee', 20),
  ('payment_category', 'Avans', 'advance', 30),
  ('payment_category', 'Masraf Avansı', 'expense_advance', 40),
  ('payment_category', 'Masraf İadesi', 'expense_reimbursement', 50),
  ('payment_category', 'İcra Tahsilatı', 'enforcement_collection', 60),
  ('payment_category', 'Diğer', 'other', 990),

  -- Payment methods
  ('payment_method', 'Nakit', 'cash', 10),
  ('payment_method', 'Banka Havalesi/EFT', 'bank_transfer', 20),
  ('payment_method', 'Kredi Kartı', 'card', 30),
  ('payment_method', 'Çek/Senet', 'instrument', 40),
  ('payment_method', 'Diğer', 'other', 990),

  -- Expense categories
  ('expense_category', 'Yargılama Giderleri', 'litigation_expenses', 10),
  ('expense_category', 'İcra Giderleri', 'enforcement_expenses', 20),
  ('expense_category', 'Ofis Giderleri', 'office_expenses', 30),
  ('expense_category', 'Personel', 'personnel', 40),
  ('expense_category', 'Ulaşım', 'transportation', 50),
  ('expense_category', 'Yemek/Temsil', 'representation', 60),
  ('expense_category', 'Kişisel', 'personal', 70),
  ('expense_category', 'Diğer', 'other', 990),

  -- Agenda event display labels
  ('calendar_event_type', 'Duruşma', 'hearing', 10),
  ('calendar_event_type', 'Randevu', 'appointment', 20),
  ('calendar_event_type', 'Görev', 'task', 30),
  ('calendar_event_type', 'Son Tarih', 'deadline', 40),
  ('calendar_event_type', 'Telefon Görüşmesi', 'phone_call', 50),
  ('calendar_event_type', 'Toplantı', 'meeting', 60),
  ('calendar_event_type', 'Evrak İşlemi', 'document_work', 70),
  ('calendar_event_type', 'Tahsilat Hatırlatması', 'payment_reminder', 80),
  ('calendar_event_type', 'Diğer', 'other', 990)
ON CONFLICT (group_key, label) DO UPDATE SET
  code = EXCLUDED.code,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  updated_at = now();

-- Parent-linked expense subcategories.
WITH parent AS (
  SELECT id, code FROM public.lookup_values WHERE group_key = 'expense_category'
)
INSERT INTO public.lookup_values (group_key, label, code, sort_order, parent_id)
SELECT item.group_key, item.label, item.code, item.sort_order, parent.id
FROM (
  VALUES
    ('expense_subcategory', 'Harç', 'fee', 10, 'litigation_expenses'),
    ('expense_subcategory', 'Tebligat', 'notification', 20, 'litigation_expenses'),
    ('expense_subcategory', 'Bilirkişi', 'expert', 30, 'litigation_expenses'),
    ('expense_subcategory', 'Keşif', 'discovery', 40, 'litigation_expenses'),
    ('expense_subcategory', 'Posta/Kargo', 'postage', 50, 'litigation_expenses'),
    ('expense_subcategory', 'Başvuru Harcı', 'application_fee', 10, 'enforcement_expenses'),
    ('expense_subcategory', 'İcra Tebligatı', 'enforcement_notification', 20, 'enforcement_expenses'),
    ('expense_subcategory', 'Haciz Masrafı', 'seizure_expense', 30, 'enforcement_expenses'),
    ('expense_subcategory', 'Kira', 'rent', 10, 'office_expenses'),
    ('expense_subcategory', 'Elektrik/Su/Doğalgaz', 'utilities', 20, 'office_expenses'),
    ('expense_subcategory', 'İnternet/Telefon', 'telecom', 30, 'office_expenses'),
    ('expense_subcategory', 'Kırtasiye', 'stationery', 40, 'office_expenses'),
    ('expense_subcategory', 'Yazılım/Abonelik', 'software', 50, 'office_expenses'),
    ('expense_subcategory', 'Maaş', 'salary', 10, 'personnel'),
    ('expense_subcategory', 'SGK', 'social_security', 20, 'personnel'),
    ('expense_subcategory', 'Avans', 'personnel_advance', 30, 'personnel'),
    ('expense_subcategory', 'Taksi', 'taxi', 10, 'transportation'),
    ('expense_subcategory', 'Toplu Taşıma', 'public_transport', 20, 'transportation'),
    ('expense_subcategory', 'Yakıt', 'fuel', 30, 'transportation'),
    ('expense_subcategory', 'Otopark', 'parking', 40, 'transportation'),
    ('expense_subcategory', 'Yemek', 'meal', 10, 'representation'),
    ('expense_subcategory', 'Müvekkil Temsili', 'client_representation', 20, 'representation'),
    ('expense_subcategory', 'Kişisel Harcama', 'personal_expense', 10, 'personal'),
    ('expense_subcategory', 'Diğer', 'other', 990, 'other')
) AS item(group_key, label, code, sort_order, parent_code)
JOIN parent ON parent.code = item.parent_code
ON CONFLICT (group_key, label) DO UPDATE SET
  code = EXCLUDED.code,
  sort_order = EXCLUDED.sort_order,
  parent_id = EXCLUDED.parent_id,
  is_active = true,
  updated_at = now();
