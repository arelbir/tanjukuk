const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://prooslgiozmnmrwtxczp.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_eJczlGjOUOq1sgNmfRHE-w_K2YwaW_Z'

const supabase = createClient(supabaseUrl, supabaseKey)

const LOOKUP_VALUES = [
  { group_key: 'entity_type', label: 'Gerçek Kişi', sort_order: 1, is_active: true },
  { group_key: 'entity_type', label: 'Tüzel Kişi', sort_order: 2, is_active: true },
  { group_key: 'client_role', label: 'Davacı', sort_order: 1, is_active: true },
  { group_key: 'client_role', label: 'Davalı', sort_order: 2, is_active: true },
  { group_key: 'client_role', label: 'Müdahil', sort_order: 3, is_active: true },
  { group_key: 'client_role', label: 'Şikayetçi', sort_order: 4, is_active: true },
  { group_key: 'client_role', label: 'Şüpheli', sort_order: 5, is_active: true },
  { group_key: 'client_type', label: 'Bireysel', sort_order: 1, is_active: true },
  { group_key: 'client_type', label: 'Şirket', sort_order: 2, is_active: true },
  { group_key: 'payment_status', label: 'Ödendi', sort_order: 1, is_active: true },
  { group_key: 'payment_status', label: 'Bekliyor', sort_order: 2, is_active: true },
  { group_key: 'payment_status', label: 'Kısmi', sort_order: 3, is_active: true },
  { group_key: 'payment_method', label: 'Nakit', sort_order: 1, is_active: true },
  { group_key: 'payment_method', label: 'Havale', sort_order: 2, is_active: true },
  { group_key: 'payment_method', label: 'Kart', sort_order: 3, is_active: true },
  { group_key: 'currency', label: 'TRY', sort_order: 1, is_active: true },
  { group_key: 'currency', label: 'USD', sort_order: 2, is_active: true },
  { group_key: 'currency', label: 'EUR', sort_order: 3, is_active: true },
  { group_key: 'court_instance', label: 'Yerel Mahkeme', sort_order: 1, is_active: true },
  { group_key: 'court_instance', label: 'İstinaf', sort_order: 2, is_active: true },
  { group_key: 'court_instance', label: 'Temyiz', sort_order: 3, is_active: true },
  { group_key: 'court_instance', label: 'Kesinleşti', sort_order: 4, is_active: true },
  { group_key: 'court_instance', label: 'Kapandı', sort_order: 5, is_active: true },
  { group_key: 'user_role', label: 'Admin', sort_order: 1, is_active: true },
  { group_key: 'user_role', label: 'Avukat', sort_order: 2, is_active: true },
  { group_key: 'user_role', label: 'Asistan', sort_order: 3, is_active: true },
]

const CITIES = [
  'Adana', 'Adıyaman', 'Afyon', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul',
  'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya',
  'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye',
  'Rize', 'Samsun', 'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van',
  'Yalova', 'Zonguldak'
]

async function seed() {
  console.log('🔄 Seed başlıyor...')
  
  // Mevcut değerleri kontrol et
  const { data: existing } = await supabase
    .from('lookup_values')
    .select('group_key, label')
    .in('group_key', ['entity_type', 'client_role', 'client_type', 'payment_status', 'payment_method', 'currency', 'court_instance', 'user_role', 'city'])

  const existingKeys = new Set(existing?.map(e => `${e.group_key}:${e.label}`) || [])
  console.log(`📊 ${existingKeys.size} mevcut değer bulundu`)

  // Cities ekle
  const cityLookups = CITIES.map((label, i) => ({
    group_key: 'city',
    label,
    sort_order: i + 1,
    is_active: true
  }))

  // Tüm değerleri birleştir
  const allValues = [...LOOKUP_VALUES, ...cityLookups]
  const toInsert = allValues.filter(v => !existingKeys.has(`${v.group_key}:${v.label}`))

  console.log(`➕ ${toInsert.length} yeni değer eklenecek`)

  if (toInsert.length > 0) {
    const { data, error } = await supabase
      .from('lookup_values')
      .upsert(toInsert, { onConflict: 'group_key, label', skip: true })
      .select()

    if (error) {
      console.error('❌ Hata:', error.message)
      process.exit(1)
    }

    console.log(`✅ ${data?.length || toInsert.length} değer eklendi/güncellendi`)
  } else {
    console.log('ℹ️ Tüm değerler zaten mevcut')
  }

  // Son durumu kontrol et
  const { data: final } = await supabase
    .from('lookup_values')
    .select('group_key')
    .in('group_key', ['entity_type', 'client_role', 'client_type', 'payment_status', 'payment_method', 'currency', 'court_instance', 'user_role', 'city'])

  const grouped = final?.reduce((acc, curr) => {
    acc[curr.group_key] = (acc[curr.group_key] || 0) + 1
    return acc
  }, {})

  console.log('📦 Son durum:', grouped)
  
  process.exit(0)
}

seed().catch(console.error)