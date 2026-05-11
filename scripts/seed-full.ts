import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('./.env.local', 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key) env[key.trim()] = vals.join('=').trim()
})

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY zorunludur')
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function seed() {
  console.log('\n🔄 Clearing all data and seeding...\n')

  // Clear all data
  console.log('🗑️  Clearing existing data...')
  await supabase.from('files').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('notification_deliveries').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('push_subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('income_records').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('expense_records').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('cases').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('lookup_values').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('✅ Data cleared')

  // Seed lookup values
  console.log('📋 Seeding lookup values...')
  await supabase.from('lookup_values').insert([
    // entity_type
    { group_key: 'entity_type', label: 'Gerçek Kişi', sort_order: 1, is_active: true },
    { group_key: 'entity_type', label: 'Tüzel Kişi', sort_order: 2, is_active: true },
    // client_role
    { group_key: 'client_role', label: 'Davacı', sort_order: 1, is_active: true },
    { group_key: 'client_role', label: 'Davalı', sort_order: 2, is_active: true },
    { group_key: 'client_role', label: 'Müdahil', sort_order: 3, is_active: true },
    { group_key: 'client_role', label: 'Şikayetçi', sort_order: 4, is_active: true },
    { group_key: 'client_role', label: 'Şüpheli', sort_order: 5, is_active: true },
    // client_type
    { group_key: 'client_type', label: 'Bireysel', sort_order: 1, is_active: true },
    { group_key: 'client_type', label: 'Şirket', sort_order: 2, is_active: true },
    // payment_status
    { group_key: 'payment_status', label: 'Ödendi', sort_order: 1, is_active: true },
    { group_key: 'payment_status', label: 'Bekliyor', sort_order: 2, is_active: true },
    { group_key: 'payment_status', label: 'Kısmi', sort_order: 3, is_active: true },
    // payment_method
    { group_key: 'payment_method', label: 'Nakit', sort_order: 1, is_active: true },
    { group_key: 'payment_method', label: 'Havale', sort_order: 2, is_active: true },
    { group_key: 'payment_method', label: 'Kart', sort_order: 3, is_active: true },
    // currency
    { group_key: 'currency', label: 'TRY', sort_order: 1, is_active: true },
    { group_key: 'currency', label: 'USD', sort_order: 2, is_active: true },
    { group_key: 'currency', label: 'EUR', sort_order: 3, is_active: true },
    // court_instance
    { group_key: 'court_instance', label: 'Yerel Mahkeme', sort_order: 1, is_active: true },
    { group_key: 'court_instance', label: 'İstinaf', sort_order: 2, is_active: true },
    { group_key: 'court_instance', label: 'Temyiz', sort_order: 3, is_active: true },
    { group_key: 'court_instance', label: 'Kesinleşti', sort_order: 4, is_active: true },
    { group_key: 'court_instance', label: 'Kapandı', sort_order: 5, is_active: true },
    // user_role
    { group_key: 'user_role', label: 'Admin', sort_order: 1, is_active: true },
    { group_key: 'user_role', label: 'Avukat', sort_order: 2, is_active: true },
    { group_key: 'user_role', label: 'Asistan', sort_order: 3, is_active: true },
    // case_status
    { group_key: 'case_status', label: 'Devam Ediyor', sort_order: 1, is_active: true },
    { group_key: 'case_status', label: 'Beklemede', sort_order: 2, is_active: true },
    { group_key: 'case_status', label: 'Sonuçlandı', sort_order: 3, is_active: true },
    { group_key: 'case_status', label: 'İptal', sort_order: 4, is_active: true },
    // case_type
    { group_key: 'case_type', label: 'Boşanma', sort_order: 1, is_active: true },
    { group_key: 'case_type', label: 'Tazminat', sort_order: 2, is_active: true },
    { group_key: 'case_type', label: 'Ceza', sort_order: 3, is_active: true },
    { group_key: 'case_type', label: 'İş', sort_order: 4, is_active: true },
    { group_key: 'case_type', label: 'Ticaret', sort_order: 5, is_active: true },
    // court_type
    { group_key: 'court_type', label: 'Aile Mahkemesi', sort_order: 1, is_active: true },
    { group_key: 'court_type', label: 'Asliye Hukuk Mahkemesi', sort_order: 2, is_active: true },
    { group_key: 'court_type', label: 'İş Mahkemesi', sort_order: 3, is_active: true },
    { group_key: 'court_type', label: 'Ceza Mahkemesi', sort_order: 4, is_active: true },
    // file_type
    { group_key: 'file_type', label: 'Ana Dosya', sort_order: 1, is_active: true },
    { group_key: 'file_type', label: 'İstem Dosyası', sort_order: 2, is_active: true },
    { group_key: 'file_type', label: 'Dava Dosyası', sort_order: 3, is_active: true },
    // income_category
    { group_key: 'income_category', label: 'Avukatlık Ücreti', sort_order: 1, is_active: true },
    { group_key: 'income_category', label: 'Danışmanlık', sort_order: 2, is_active: true },
    { group_key: 'income_category', label: 'Dava Masrafı', sort_order: 3, is_active: true },
    { group_key: 'income_category', label: 'Diğer', sort_order: 4, is_active: true },
    // expense_category
    { group_key: 'expense_category', label: 'Kira', sort_order: 1, is_active: true },
    { group_key: 'expense_category', label: 'Elektrik', sort_order: 2, is_active: true },
    { group_key: 'expense_category', label: 'Su', sort_order: 3, is_active: true },
    { group_key: 'expense_category', label: 'İnternet', sort_order: 4, is_active: true },
    { group_key: 'expense_category', label: 'Ofis Malzemeleri', sort_order: 5, is_active: true },
    { group_key: 'expense_category', label: 'Yemek', sort_order: 6, is_active: true },
    { group_key: 'expense_category', label: 'Ulaşım', sort_order: 7, is_active: true },
    { group_key: 'expense_category', label: 'Diğer', sort_order: 8, is_active: true },
    // activity_type
    { group_key: 'activity_type', label: 'Duruşma', sort_order: 1, is_active: true },
    { group_key: 'activity_type', label: 'Müvekkil Görüşmesi', sort_order: 2, is_active: true },
    { group_key: 'activity_type', label: 'Dava Dosyası İnceleme', sort_order: 3, is_active: true },
    { group_key: 'activity_type', label: 'Mahkeme Başvurusu', sort_order: 4, is_active: true },
    { group_key: 'activity_type', label: 'Delil Toplama', sort_order: 5, is_active: true },
    // city
    { group_key: 'city', label: 'Adana', sort_order: 1, is_active: true },
    { group_key: 'city', label: 'Adıyaman', sort_order: 2, is_active: true },
    { group_key: 'city', label: 'Afyon', sort_order: 3, is_active: true },
    { group_key: 'city', label: 'Ağrı', sort_order: 4, is_active: true },
    { group_key: 'city', label: 'Aksaray', sort_order: 5, is_active: true },
    { group_key: 'city', label: 'Amasya', sort_order: 6, is_active: true },
    { group_key: 'city', label: 'Ankara', sort_order: 7, is_active: true },
    { group_key: 'city', label: 'Antalya', sort_order: 8, is_active: true },
    { group_key: 'city', label: 'Ardahan', sort_order: 9, is_active: true },
    { group_key: 'city', label: 'Artvin', sort_order: 10, is_active: true },
    { group_key: 'city', label: 'Aydın', sort_order: 11, is_active: true },
    { group_key: 'city', label: 'Balıkesir', sort_order: 12, is_active: true },
    { group_key: 'city', label: 'Bartın', sort_order: 13, is_active: true },
    { group_key: 'city', label: 'Batman', sort_order: 14, is_active: true },
    { group_key: 'city', label: 'Bayburt', sort_order: 15, is_active: true },
    { group_key: 'city', label: 'Bilecik', sort_order: 16, is_active: true },
    { group_key: 'city', label: 'Bingöl', sort_order: 17, is_active: true },
    { group_key: 'city', label: 'Bitlis', sort_order: 18, is_active: true },
    { group_key: 'city', label: 'Bolu', sort_order: 19, is_active: true },
    { group_key: 'city', label: 'Burdur', sort_order: 20, is_active: true },
    { group_key: 'city', label: 'Bursa', sort_order: 21, is_active: true },
    { group_key: 'city', label: 'Çanakkale', sort_order: 22, is_active: true },
    { group_key: 'city', label: 'Çankırı', sort_order: 23, is_active: true },
    { group_key: 'city', label: 'Çorum', sort_order: 24, is_active: true },
    { group_key: 'city', label: 'Denizli', sort_order: 25, is_active: true },
    { group_key: 'city', label: 'Diyarbakır', sort_order: 26, is_active: true },
    { group_key: 'city', label: 'Düzce', sort_order: 27, is_active: true },
    { group_key: 'city', label: 'Edirne', sort_order: 28, is_active: true },
    { group_key: 'city', label: 'Elazığ', sort_order: 29, is_active: true },
    { group_key: 'city', label: 'Erzincan', sort_order: 30, is_active: true },
    { group_key: 'city', label: 'Erzurum', sort_order: 31, is_active: true },
    { group_key: 'city', label: 'Eskişehir', sort_order: 32, is_active: true },
    { group_key: 'city', label: 'Gaziantep', sort_order: 33, is_active: true },
    { group_key: 'city', label: 'Giresun', sort_order: 34, is_active: true },
    { group_key: 'city', label: 'Gümüşhane', sort_order: 35, is_active: true },
    { group_key: 'city', label: 'Hakkari', sort_order: 36, is_active: true },
    { group_key: 'city', label: 'Hatay', sort_order: 37, is_active: true },
    { group_key: 'city', label: 'Isparta', sort_order: 38, is_active: true },
    { group_key: 'city', label: 'Mersin', sort_order: 39, is_active: true },
    { group_key: 'city', label: 'İstanbul', sort_order: 40, is_active: true },
    { group_key: 'city', label: 'İzmir', sort_order: 41, is_active: true },
    { group_key: 'city', label: 'Kars', sort_order: 42, is_active: true },
    { group_key: 'city', label: 'Kastamonu', sort_order: 43, is_active: true },
    { group_key: 'city', label: 'Kayseri', sort_order: 44, is_active: true },
    { group_key: 'city', label: 'Kırklareli', sort_order: 45, is_active: true },
    { group_key: 'city', label: 'Kırşehir', sort_order: 46, is_active: true },
    { group_key: 'city', label: 'Kilis', sort_order: 47, is_active: true },
    { group_key: 'city', label: 'Kocaeli', sort_order: 48, is_active: true },
    { group_key: 'city', label: 'Konya', sort_order: 49, is_active: true },
    { group_key: 'city', label: 'Kütahya', sort_order: 50, is_active: true },
    { group_key: 'city', label: 'Malatya', sort_order: 51, is_active: true },
    { group_key: 'city', label: 'Manisa', sort_order: 52, is_active: true },
    { group_key: 'city', label: 'Kahramanmaraş', sort_order: 53, is_active: true },
    { group_key: 'city', label: 'Mardin', sort_order: 54, is_active: true },
    { group_key: 'city', label: 'Muğla', sort_order: 55, is_active: true },
    { group_key: 'city', label: 'Muş', sort_order: 56, is_active: true },
    { group_key: 'city', label: 'Nevşehir', sort_order: 57, is_active: true },
    { group_key: 'city', label: 'Niğde', sort_order: 58, is_active: true },
    { group_key: 'city', label: 'Ordu', sort_order: 59, is_active: true },
    { group_key: 'city', label: 'Osmaniye', sort_order: 60, is_active: true },
    { group_key: 'city', label: 'Rize', sort_order: 61, is_active: true },
    { group_key: 'city', label: 'Samsun', sort_order: 62, is_active: true },
    { group_key: 'city', label: 'Şanlıurfa', sort_order: 63, is_active: true },
    { group_key: 'city', label: 'Şırnak', sort_order: 64, is_active: true },
    { group_key: 'city', label: 'Tekirdağ', sort_order: 65, is_active: true },
    { group_key: 'city', label: 'Tokat', sort_order: 66, is_active: true },
    { group_key: 'city', label: 'Trabzon', sort_order: 67, is_active: true },
    { group_key: 'city', label: 'Tunceli', sort_order: 68, is_active: true },
    { group_key: 'city', label: 'Uşak', sort_order: 69, is_active: true },
    { group_key: 'city', label: 'Van', sort_order: 70, is_active: true },
    { group_key: 'city', label: 'Yalova', sort_order: 71, is_active: true },
    { group_key: 'city', label: 'Zonguldak', sort_order: 72, is_active: true },
  ])
  console.log('✅ Lookup values seeded')

  console.log('\n🔄 Creating users and data...\n')

  // Create admin user profile (using existing auth user ID)
  const adminId = '1b77fbf3-d2ee-46ee-8837-0ea3919dc3ef'
  const { error: adminError } = await supabase.from('users').insert({
    id: adminId,
    full_name: 'Admin',
    email: 'admin@hukukburo.com',
    role: 'admin',
    is_active: true
  })
  if (adminError) {
    console.log('Admin might exist:', adminError.message)
  } else {
    console.log('✅ Admin profile created:', adminId)
  }

  // Create lawyer user profile (using existing auth user ID)
  const lawyerId = '99121b4d-d89a-4440-8bb1-d54a738cceea'
  const { error: lawyerError } = await supabase.from('users').insert({
    id: lawyerId,
    full_name: 'Av. Ahmet Yılmaz',
    email: 'avukat@hukukburo.com',
    role: 'lawyer',
    is_active: true
  })
  if (lawyerError) {
    console.log('Lawyer might exist:', lawyerError.message)
  } else {
    console.log('✅ Lawyer profile created:', lawyerId)
  }

  const lawyer = { id: lawyerId }

  console.log('Creating sample data...')

  // Create clients (15 clients)
  const clientData = [
    { name: 'Ayşe Demir', type: 'individual', phone: '05321234567', email: 'ayse@email.com', address: 'İstanbul, Kadıköy, Caferağa Mah.' },
    { name: 'ABC Holding A.Ş.', type: 'company', phone: '02124567890', email: 'abc@company.com', address: 'İstanbul, Levent, Büyükdere Cad.' },
    { name: 'Mehmet Kaya', type: 'individual', phone: '05339876543', email: 'mehmet@email.com', address: 'Ankara, Çankaya, Bahçelievler' },
    { name: 'Fatma Yılmaz', type: 'individual', phone: '05551112233', email: 'fatma@email.com', address: 'İzmir, Karşıyaka, Bostanlı' },
    { name: 'XYZ Teknoloji Ltd. Şti.', type: 'company', phone: '02165556677', email: 'xyz@tech.com', address: 'İstanbul, Ümraniye, Dudullu OSB' },
    { name: 'Ali Veli', type: 'individual', phone: '05443334455', email: 'ali@email.com', address: 'Bursa, Nilüfer, Odunluk' },
    { name: 'Gıda Sanayi A.Ş.', type: 'company', phone: '03225554433', email: 'gida@sanayi.com', address: 'Kocaeli, Gebze, OSB' },
    { name: 'Zeynep Öztürk', type: 'individual', phone: '05326667788', email: 'zeynep@email.com', address: 'Antalya, Muratpaşa, Konyaaltı' },
    { name: 'Mimarlık Bürosu', type: 'company', phone: '02127778899', email: 'mimarlik@buro.com', address: 'İstanbul, Beşiktaş, Levent' },
    { name: 'Hüseyin Şahin', type: 'individual', phone: '05559998877', email: 'huseyin@email.com', address: 'Adana, Seyhan, Çukurova' },
    { name: 'Lojistik Hizmetleri Ltd.', type: 'company', phone: '03224445566', email: 'lojistik@hizmet.com', address: 'Mersin, Akdeniz, Liman' },
    { name: 'Elif Demir', type: 'individual', phone: '05331112233', email: 'elif@email.com', address: 'Eskişehir, Tepebaşı, Odunpazarı' },
    { name: 'Emlak Danışmanlık A.Ş.', type: 'company', phone: '02123334455', email: 'emlak@danismanlik.com', address: 'İstanbul, Şişli, Mecidiyeköy' },
    { name: 'Can Yıldız', type: 'individual', phone: '05442223344', email: 'can@email.com', address: 'Samsun, İlkadım, Atakum' },
    { name: 'Eğitim Kurumları Ltd.', type: 'company', phone: '03125556677', email: 'egitim@kurum.com', address: 'Ankara, Yenimahalle, Batıkent' }
  ]

  await supabase.from('clients').insert(clientData)

  // Get lookups
  const { data: caseTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_type').limit(3)
  const { data: statuses } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_status').limit(2)
  const { data: courtTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'court_type').limit(2)
  const { data: fileTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'file_type').limit(3)
  const { data: activityTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'activity_type').limit(5)
  const { data: incomeCategories } = await supabase.from('lookup_values').select('id').eq('group_key', 'income_category').limit(4)
  const { data: expenseCategories } = await supabase.from('lookup_values').select('id').eq('group_key', 'expense_category').limit(8)

  // Get clients
  const { data: clients } = await supabase.from('clients').select('id, name').limit(15)

  // Create cases (15 cases)
  const caseData = [
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[0]?.id,
      opposing_party: 'Ahmet Demir',
      client_role_id: null,
      entity_type: 'individual',
      court_city: 'İstanbul',
      court_district: 'Kadıköy',
      court_type_id: courtTypes?.[0]?.id,
      court_no: '2026/100',
      case_type_id: caseTypes?.[0]?.id,
      status_id: statuses?.[0]?.id,
      opened_at: '2026-04-15',
      case_value: 50000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 100,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'L',
      description: 'Boşanma davası - Mal paylaşımı ve velayet'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[1]?.id,
      opposing_party: 'XYZ Ltd. Şti.',
      client_role_id: null,
      entity_type: 'company',
      court_city: 'İstanbul',
      court_district: 'Çağlayan',
      court_type_id: courtTypes?.[1]?.id,
      court_no: '2026/123',
      case_type_id: caseTypes?.[1]?.id,
      status_id: statuses?.[1]?.id,
      opened_at: '2026-02-20',
      case_value: 150000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 123,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'L',
      description: 'Ticari dava - Sözleşme ihlali'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[2]?.id,
      opposing_party: 'Veli Duran',
      client_role_id: null,
      entity_type: 'individual',
      court_city: 'Ankara',
      court_district: 'Çankaya',
      court_type_id: courtTypes?.[0]?.id,
      court_no: '2026/456',
      case_type_id: caseTypes?.[0]?.id,
      status_id: statuses?.[0]?.id,
      opened_at: '2026-03-10',
      case_value: 0,
      currency: 'TRY',
      file_year: 2026,
      file_no: 456,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'K',
      description: 'Velayet davası - Çocuk velayeti'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[3]?.id,
      opposing_party: 'Mehmet Öztürk',
      client_role_id: null,
      entity_type: 'individual',
      court_city: 'İzmir',
      court_district: 'Karşıyaka',
      court_type_id: courtTypes?.[1]?.id,
      court_no: '2026/200',
      case_type_id: caseTypes?.[2]?.id,
      status_id: statuses?.[0]?.id,
      opened_at: '2026-01-20',
      case_value: 75000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 200,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'L',
      description: 'Miras davası - Taşınmaz mal paylaşımı'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[4]?.id,
      opposing_party: 'ABC Yazılım A.Ş.',
      client_role_id: null,
      entity_type: 'company',
      court_city: 'İstanbul',
      court_district: 'Ümraniye',
      court_type_id: courtTypes?.[1]?.id,
      court_no: '2026/300',
      case_type_id: caseTypes?.[1]?.id,
      status_id: statuses?.[1]?.id,
      opened_at: '2026-02-15',
      case_value: 200000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 300,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'L',
      description: 'Fikri mülkiyet - Patent ihlali'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[5]?.id,
      opposing_party: 'Şirket Yönetimi',
      client_role_id: null,
      entity_type: 'individual',
      court_city: 'Bursa',
      court_district: 'Nilüfer',
      court_type_id: courtTypes?.[2]?.id,
      court_no: '2026/400',
      case_type_id: caseTypes?.[2]?.id,
      status_id: statuses?.[0]?.id,
      opened_at: '2026-03-05',
      case_value: 30000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 400,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'K',
      description: 'İş davası - Haksız işten çıkarma'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[6]?.id,
      opposing_party: 'Tedarikçi Firma',
      client_role_id: null,
      entity_type: 'company',
      court_city: 'Kocaeli',
      court_district: 'Gebze',
      court_type_id: courtTypes?.[1]?.id,
      court_no: '2026/500',
      case_type_id: caseTypes?.[1]?.id,
      status_id: statuses?.[1]?.id,
      opened_at: '2026-01-25',
      case_value: 100000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 500,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'L',
      description: 'Ticari dava - Alacak tahsili'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[7]?.id,
      opposing_party: 'Komşu',
      client_role_id: null,
      entity_type: 'individual',
      court_city: 'Antalya',
      court_district: 'Muratpaşa',
      court_type_id: courtTypes?.[1]?.id,
      court_no: '2026/600',
      case_type_id: caseTypes?.[2]?.id,
      status_id: statuses?.[0]?.id,
      opened_at: '2026-02-28',
      case_value: 25000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 600,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'K',
      description: 'Kira davası - Kira tespiti'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[8]?.id,
      opposing_party: 'İnşaat Firması',
      client_role_id: null,
      entity_type: 'company',
      court_city: 'İstanbul',
      court_district: 'Beşiktaş',
      court_type_id: courtTypes?.[1]?.id,
      court_no: '2026/700',
      case_type_id: caseTypes?.[1]?.id,
      status_id: statuses?.[1]?.id,
      opened_at: '2026-03-12',
      case_value: 180000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 700,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'L',
      description: 'İnşaat davası - İmalat ayıbı'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[9]?.id,
      opposing_party: 'Eski İşveren',
      client_role_id: null,
      entity_type: 'individual',
      court_city: 'Adana',
      court_district: 'Seyhan',
      court_type_id: courtTypes?.[2]?.id,
      court_no: '2026/800',
      case_type_id: caseTypes?.[2]?.id,
      status_id: statuses?.[0]?.id,
      opened_at: '2026-01-30',
      case_value: 45000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 800,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'K',
      description: 'İş davası - Kıdem tazminatı'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[10]?.id,
      opposing_party: 'Alıcı Firma',
      client_role_id: null,
      entity_type: 'company',
      court_city: 'Mersin',
      court_district: 'Akdeniz',
      court_type_id: courtTypes?.[1]?.id,
      court_no: '2026/900',
      case_type_id: caseTypes?.[1]?.id,
      status_id: statuses?.[1]?.id,
      opened_at: '2026-02-10',
      case_value: 120000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 900,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'L',
      description: 'Ticari dava - Eski sözleşme feshi'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[11]?.id,
      opposing_party: 'Eski Eş',
      client_role_id: null,
      entity_type: 'individual',
      court_city: 'Eskişehir',
      court_district: 'Tepebaşı',
      court_type_id: courtTypes?.[0]?.id,
      court_no: '2026/1000',
      case_type_id: caseTypes?.[0]?.id,
      status_id: statuses?.[0]?.id,
      opened_at: '2026-03-18',
      case_value: 60000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 1000,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'K',
      description: 'Boşanma davası - Nafaka'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[12]?.id,
      opposing_party: 'Kiralıkçı',
      client_role_id: null,
      entity_type: 'company',
      court_city: 'İstanbul',
      court_district: 'Şişli',
      court_type_id: courtTypes?.[1]?.id,
      court_no: '2026/1100',
      case_type_id: caseTypes?.[2]?.id,
      status_id: statuses?.[0]?.id,
      opened_at: '2026-01-22',
      case_value: 35000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 1100,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'K',
      description: 'Kira davası - Tahliye'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[13]?.id,
      opposing_party: 'Sigorta Şirketi',
      client_role_id: null,
      entity_type: 'individual',
      court_city: 'Samsun',
      court_district: 'İlkadım',
      court_type_id: courtTypes?.[3]?.id,
      court_no: '2026/1200',
      case_type_id: caseTypes?.[0]?.id,
      status_id: statuses?.[1]?.id,
      opened_at: '2026-02-25',
      case_value: 80000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 1200,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'L',
      description: 'Trafik davası - Maddi tazminat'
    },
    {
      lawyer_id: lawyer.id,
      client_id: clients?.[14]?.id,
      opposing_party: 'Eğitim Kurumu',
      client_role_id: null,
      entity_type: 'company',
      court_city: 'Ankara',
      court_district: 'Yenimahalle',
      court_type_id: courtTypes?.[1]?.id,
      court_no: '2026/1300',
      case_type_id: caseTypes?.[1]?.id,
      status_id: statuses?.[1]?.id,
      opened_at: '2026-03-08',
      case_value: 95000,
      currency: 'TRY',
      file_year: 2026,
      file_no: 1300,
      file_type_id: fileTypes?.[0]?.id,
      lean_against: 'L',
      description: 'Ticari dava - Lisans ihlali'
    }
  ]

  const { data: insertedCases } = await supabase.from('cases').insert(caseData).select()

  // Create events (30+ events for all cases)
  const eventData: any[] = []
  
  // Generate events for each case
  insertedCases?.forEach((caseItem: any, index: number) => {
    const baseDate = new Date(2026, 3, 15 + index * 7) // Staggered dates starting from April 2026

    // Add 2-3 events per case
    for (let i = 0; i < 3; i++) {
      const eventDate = new Date(baseDate)
      eventDate.setDate(eventDate.getDate() + (i * 14))
      
      eventData.push({
        case_id: caseItem.id,
        event_type: 'activity',
        title: i === 0 ? 'İlk Duruşma' : i === 1 ? 'Müvekkil Görüşmesi' : 'Duruşma Hazırlığı',
        description: `Dava ${index + 1} - ${['Tanıklar dinlenecek', 'Duruşma öncesi hazırlık', 'Delil sunumu'][i]}`,
        event_type_id: activityTypes?.[i % 5]?.id,
        scheduled_at: eventDate.toISOString(),
        duration_minutes: [60, 30, 45][i],
        location: ['Mahkeme', 'Ofis', 'Mahkeme'][i],
        lawyer_id: lawyer.id,
        is_completed: i === 1,
        completed_at: i === 1 ? new Date(eventDate.getTime() + 30 * 60000).toISOString() : null,
        created_by: lawyer.id
      })
    }
  })
  
  await supabase.from('events').insert(eventData)

  // Create income records (20+ records)
  const incomeData: any[] = []
  
  insertedCases?.forEach((caseItem: any, index: number) => {
    const client = clients?.[index % 15]

    // Add 1-2 income records per case
    for (let i = 0; i < 2; i++) {
      const recordDate = new Date(2026, 3, 20 + index * 10 + i * 5)
      
      incomeData.push({
        client_id: client?.id,
        category_id: incomeCategories?.[i % 4]?.id,
        case_id: caseItem.id,
        record_date: recordDate.toISOString().split('T')[0],
        amount: [15000, 25000, 20000, 18000, 30000][index % 5],
        currency: 'TRY',
        payment_status: i === 0 ? 'paid' : 'pending',
        description: ['Avukatlık ücreti', 'Danışmanlık ücreti', 'Vekalet ücreti', 'Harcırah'][i % 4]
      })
    }
  })
  
  await supabase.from('income_records').insert(incomeData)

  // Create expense records (20+ records)
  const expenseData: any[] = []
  
  // Generate diverse expenses
  for (let i = 0; i < 20; i++) {
    const recordDate = new Date(2024, 0, 5 + i * 5)
    
    expenseData.push({
      category_id: expenseCategories?.[i % 8]?.id,
      record_date: recordDate.toISOString().split('T')[0],
      amount: [5000, 500, 350, 2000, 1500, 800, 1200, 600][i % 8],
      currency: 'TRY',
      payment_method: ['havale', 'nakit', 'kredi_karti', 'havale'][i % 4],
      expense_type: i % 2 === 0 ? 'kurum' : 'kisisel',
      recorded_by: lawyer.id,
      description: ['Kira', 'Su faturası', 'Ofis yemeği', 'Elektrik faturası', 'İnternet', 'Yazılım lisansı', 'Ofis malzeme', 'Kırtasiye'][i % 8]
    })
  }
  
  await supabase.from('expense_records').insert(expenseData)

  // Create file records (15 files for cases)
  const fileData: any[] = []
  
  insertedCases?.forEach((caseItem: any, index: number) => {
    const client = clients?.[index % 15]
    
    // Add 1 file per case
    fileData.push({
      case_id: caseItem.id,
      client_id: client?.id,
      file_name: ['dava_dosyasi.pdf', 'delil_belgesi.docx', 'sozlesme.pdf', 'mahkeme_karari.pdf', 'tanik_ifadesi.pdf'][index % 5],
      file_type: 'document',
      file_size: [1024000, 512000, 2048000, 1536000, 768000][index % 5],
      mime_type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'application/pdf', 'application/pdf'][index % 5],
      storage_path: `/files/cases/${caseItem.id}/${['dava_dosyasi.pdf', 'delil_belgesi.docx', 'sozlesme.pdf', 'mahkeme_karari.pdf', 'tanik_ifadesi.pdf'][index % 5]}`,
      uploaded_by: lawyer.id,
      description: ['Dava dosyası', 'Delil belgesi', 'Sözleşme', 'Mahkeme kararı', 'Tanık ifadesi'][index % 5],
      tags: [['dava', 'önemli'], ['delil', 'belge'], ['sozlesme', 'hukuki'], ['karar', 'mahkeme'], ['tanik', 'ifade']][index % 5]
    })
  })
  
  await supabase.from('files').insert(fileData)

  console.log('\n✅ SEED COMPLETE!\n')
  console.log('=== LOGIN CREDENTIALS ===')
  console.log('Admin:  admin@hukukburo.com / admin123')
  console.log('Avukat: avukat@hukukburo.com / avukat123')
  console.log('========================')
}

seed().catch(e => console.error('Error:', e.message))