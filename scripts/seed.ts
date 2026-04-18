import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
const envContent = readFileSync(resolve('.env.local'), 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function seed() {
  console.log('Creating test users...')

  // Create admin user
  try {
    const { data: adminUser } = await supabase.auth.admin.createUser({
      email: 'admin@hukukburo.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: { full_name: 'Admin Kullanıcı', role: 'admin' }
    })
    console.log('Admin user created')
  } catch (e: any) {
    console.log('Admin might exist:', e.message)
  }

  // Create lawyer user  
  try {
    const { data: lawyerUser } = await supabase.auth.admin.createUser({
      email: 'avukat@hukukburo.com',
      password: 'avukat123',
      email_confirm: true,
      user_metadata: { full_name: 'Av. Ahmet Yılmaz', role: 'lawyer' }
    })
    console.log('Lawyer user created')
  } catch (e: any) {
    console.log('Lawyer might exist:', e.message)
  }

  // Wait for triggers
  await new Promise(r => setTimeout(r, 3000))

  // Get lawyer ID
  const { data: lawyer } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'avukat@hukukburo.com')
    .single()

  if (!lawyer) {
    console.log('Creating lawyer profile manually...')
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const lawAuth = authUsers.users.find(u => u.email === 'avukat@hukukburo.com')
    if (lawAuth) {
      await supabase.from('users').insert({
        id: lawAuth.id,
        full_name: 'Av. Ahmet Yılmaz',
        email: 'avukat@hukukburo.com',
        role: 'lawyer',
        is_active: true
      })
    }
  }

  // Get lawyer ID again
  const { data: lawyerData } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'avukat@hukukburo.com')
    .single()

  console.log('Creating sample clients...')

  // Create clients
  const { data: client1 } = await supabase.from('clients').insert({
    name: 'Ayşe Demir',
    type: 'individual',
    phone: '0532 123 4567',
    email: 'ayse.demir@email.com'
  }).select().single() || {}

  const { data: client2 } = await supabase.from('clients').insert({
    name: 'ABC Holding A.Ş.',
    type: 'company',
    phone: '0212 456 7890',
    email: 'info@abcholding.com',
    tax_no: '1234567890'
  }).select().single() || {}

  const { data: client3 } = await supabase.from('clients').insert({
    name: 'Mehmet Kaya',
    type: 'individual',
    phone: '0533 987 6543',
    email: 'mehmet.kaya@email.com'
  }).select().single() || {}

  // Get lookup values
  const { data: caseTypes } = await supabase.from('lookup_values').select('id, label').eq('group_key', 'case_type')
  const { data: statuses } = await supabase.from('lookup_values').select('id, label').eq('group_key', 'case_status')
  const { data: courtTypes } = await supabase.from('lookup_values').select('id, label').eq('group_key', 'court_type')

  const boşanma = caseTypes?.find(c => c.label.includes('Boşanma'))
  const işDavası = caseTypes?.find(c => c.label.includes('İş Davası'))
  const yerel = statuses?.find(s => s.label === 'Yerel Mahkeme')
  const istinaf = statuses?.find(s => s.label === 'İstinaf')
  const aile = courtTypes?.find(c => c.label === 'Aile Mahkemesi')
  const asliye = courtTypes?.find(c => c.label === 'Asliye Hukuk Mahkemesi')

  console.log('Creating sample cases...')

  // Case 1
  await supabase.from('cases').insert({
    lawyer_id: lawyerData?.id,
    client_id: client1?.id,
    opposing_party: 'Ahmet Demir',
    client_role: 'Davacı',
    entity_type: 'M',
    court_city: 'İstanbul',
    court_district: 'Kadıköy',
    court_type_id: aile?.id,
    court_no: 1,
    file_year: 2024,
    file_no: '1234',
    case_type_id: boşanma?.id,
    status_id: yerel?.id,
    opened_at: '2024-01-15',
    case_value: 50000,
    currency: 'TRY',
    description: 'Boşanma davası - Mal paylaşımı ve velayet',
    notes: 'İlk duruşma 15 Mart 2024'
  })

  // Case 2
  await supabase.from('cases').insert({
    lawyer_id: lawyerData?.id,
    client_id: client2?.id,
    opposing_party: 'XYZ Ltd. Şti.',
    client_role: 'Davacı',
    entity_type: 'company',
    court_city: 'İstanbul',
    court_district: 'Çağlayan',
    court_type_id: asliye?.id,
    court_no: 3,
    file_year: 2024,
    file_no: '5678',
    case_type_id: işDavası?.id,
    status_id: istinaf?.id,
    opened_at: '2024-02-20',
    case_value: 150000,
    currency: 'TRY',
    lean_against: 'L',
    description: 'İş hukuku - Alacak davası'
  })

  // Case 3
  await supabase.from('cases').insert({
    lawyer_id: lawyerData?.id,
    client_id: client3?.id,
    opposing_party: 'Veli Duran',
    client_role: 'Davalı',
    entity_type: 'M',
    court_city: 'Ankara',
    court_district: 'Çankaya',
    court_type_id: aile?.id,
    court_no: 2,
    file_year: 2024,
    file_no: '9012',
    case_type_id: boşanma?.id,
    status_id: yerel?.id,
    opened_at: '2024-03-10',
    case_value: 0,
    currency: 'TRY',
    lean_against: 'K',
    description: 'Boşanma davası - Karşı dava'
  })

  // Create sample hearings
  const { data: cases } = await supabase.from('cases').select('id').limit(3)
  
  if (cases && cases[0]) {
    await supabase.from('hearings').insert({
      case_id: cases[0].id,
      lawyer_id: lawyerData?.id,
      hearing_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      location: 'Kadıköy Aile Mahkemesi Salon 3',
      result: null,
      next_step: 'Mal paylaşımı görüşmesi',
      is_completed: false
    })
  }

  // Create sample income
  if (client1?.id) {
    await supabase.from('income_records').insert({
      client_id: client1.id,
      recorded_by: lawyerData?.id,
      category_id: caseTypes?.find(c => c.label.includes('Vekâlet'))?.id,
      record_date: '2024-01-20',
      amount: 15000,
      payment_status: 'paid'
    })
  }

  // Create sample expense
  await supabase.from('expense_records').insert({
    recorded_by: lawyerData?.id,
    category_id: courtTypes ? courtTypes[0]?.id : null,
    record_date: '2024-02-01',
    amount: 250,
    payment_method: 'cash',
    description: 'Dava başvuru harcı'
  })

  console.log('')
  console.log('✅ Seed completed!')
  console.log('')
  console.log('=== Test Giriş Bilgileri ===')
  console.log('Admin: admin@hukukburo.com / admin123')
  console.log('Avukat: avukat@hukukburo.com / avukat123')
  console.log('=============================')
}

seed().catch(console.error)