import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('./.env.local', 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key) env[key.trim()] = vals.join('=').trim()
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb29zbGdpb3ptbm1yd3R4Y3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDQ5MDcsImV4cCI6MjA5MTM4MDkwN30.Db7XvQUQDtRr0BqCNbWRPGmIdTD6LIItVMpzvNVxZ8o')

async function seed() {
  console.log('\n🔄 Creating users and data...\n')

  // Create admin user profile
  const adminId = '00000000-0000-0000-0000-000000000001'
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

  // Create lawyer user profile
  const lawyerId = '00000000-0000-0000-0000-000000000002'
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

  // Create clients
  await supabase.from('clients').insert({ name: 'Ayşe Demir', type: 'individual', phone: '05321234567', email: 'ayse@email.com' })
  await supabase.from('clients').insert({ name: 'ABC Holding A.Ş.', type: 'company', phone: '02124567890', email: 'abc@company.com' })
  await supabase.from('clients').insert({ name: 'Mehmet Kaya', type: 'individual', phone: '05339876543', email: 'mehmet@email.com' })

  // Get lookups
  const { data: caseTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_type').limit(3)
  const { data: statuses } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_status').limit(2)
  const { data: courtTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'court_type').limit(2)
  const { data: activityTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'activity_type').limit(5)
  const { data: incomeCategories } = await supabase.from('lookup_values').select('id').eq('group_key', 'income_category').limit(4)
  const { data: expenseCategories } = await supabase.from('lookup_values').select('id').eq('group_key', 'expense_category').limit(8)

  // Get clients
  const { data: clients } = await supabase.from('clients').select('id').limit(3)

  // Create cases
  const { data: case1 } = await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: clients?.[0]?.id,
    opposing_party: 'Ahmet Demir',
    client_role_id: null,
    entity_type: 'individual',
    court_city: 'İstanbul',
    court_district: 'Kadıköy',
    court_type_id: courtTypes?.[0]?.id,
    case_type_id: caseTypes?.[0]?.id,
    status_id: statuses?.[0]?.id,
    opened_at: '2024-01-15',
    case_value: 50000,
    currency: 'TRY',
    description: 'Boşanma davası - Mal paylaşımı ve velayet'
  }).select().single()

  const { data: case2 } = await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: clients?.[1]?.id,
    opposing_party: 'XYZ Ltd. Şti.',
    client_role_id: null,
    entity_type: 'company',
    court_city: 'İstanbul',
    court_district: 'Çağlayan',
    case_type_id: caseTypes?.[1]?.id,
    status_id: statuses?.[1]?.id,
    opened_at: '2024-02-20',
    case_value: 150000,
    currency: 'TRY',
    lean_against: 'L'
  }).select().single()

  const { data: case3 } = await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: clients?.[2]?.id,
    opposing_party: 'Veli Duran',
    client_role_id: null,
    entity_type: 'individual',
    court_city: 'Ankara',
    court_district: 'Çankaya',
    case_type_id: caseTypes?.[0]?.id,
    status_id: statuses?.[0]?.id,
    opened_at: '2024-03-10',
    case_value: 0,
    currency: 'TRY',
    lean_against: 'K'
  }).select().single()

  // Create events (unified hearings and activities)
  if (case1?.id) {
    await supabase.from('events').insert({
      case_id: case1.id,
      event_type: 'activity',
      title: 'Duruşma',
      description: 'İlk duruşma - Tanıklar dinlenecek',
      event_type_id: activityTypes?.[0]?.id,
      scheduled_at: '2024-04-15T10:00:00',
      duration_minutes: 60,
      location: 'Kadıköy Aile Mahkemesi 3. Kat',
      lawyer_id: lawyer.id,
      is_completed: false,
      created_by: lawyer.id
    })

    await supabase.from('events').insert({
      case_id: case1.id,
      event_type: 'activity',
      title: 'Müvekkil Görüşmesi',
      description: 'Duruşma öncesi hazırlık toplantısı',
      event_type_id: activityTypes?.[1]?.id,
      scheduled_at: '2024-04-10T14:00:00',
      duration_minutes: 30,
      location: 'Ofis',
      lawyer_id: lawyer.id,
      is_completed: true,
      completed_at: '2024-04-10T15:00:00',
      created_by: lawyer.id
    })
  }

  if (case2?.id) {
    await supabase.from('events').insert({
      case_id: case2.id,
      event_type: 'activity',
      title: 'Duruşma',
      description: 'Delil sunumu',
      event_type_id: activityTypes?.[0]?.id,
      scheduled_at: '2024-05-20T09:30:00',
      duration_minutes: 90,
      location: 'Çağlayan Asliye Hukuk Mahkemesi',
      lawyer_id: lawyer.id,
      is_completed: false,
      created_by: lawyer.id
    })
  }

  if (case3?.id) {
    await supabase.from('events').insert({
      case_id: case3.id,
      event_type: 'activity',
      title: 'Duruşma',
      description: 'Sonuç duruşması',
      event_type_id: activityTypes?.[0]?.id,
      scheduled_at: '2024-03-20T11:00:00',
      duration_minutes: 60,
      location: 'Çankaya 1. Asliye Hukuk Mahkemesi',
      lawyer_id: lawyer.id,
      is_completed: true,
      completed_at: '2024-03-20T12:30:00',
      created_by: lawyer.id
    })
  }

  // Create income records
  await supabase.from('income_records').insert({
    client_id: clients?.[0]?.id,
    category_id: incomeCategories?.[0]?.id,
    case_id: case1?.id,
    record_date: '2024-01-20',
    amount: 15000,
    currency: 'TRY',
    payment_status: 'paid',
    description: 'Boşanma davası avukatlık ücreti'
  })

  await supabase.from('income_records').insert({
    client_id: clients?.[1]?.id,
    category_id: incomeCategories?.[1]?.id,
    case_id: case2?.id,
    record_date: '2024-02-25',
    amount: 25000,
    currency: 'TRY',
    payment_status: 'paid',
    description: 'Ticaret davası danışmanlık ücreti'
  })

  // Create expense records
  await supabase.from('expense_records').insert({
    category_id: expenseCategories?.[0]?.id,
    record_date: '2024-01-05',
    amount: 5000,
    currency: 'TRY',
    payment_method: 'havale',
    expense_type: 'kurum',
    description: 'Ocak ayı kira'
  })

  await supabase.from('expense_records').insert({
    category_id: expenseCategories?.[2]?.id,
    record_date: '2024-01-10',
    amount: 500,
    currency: 'TRY',
    payment_method: 'nakit',
    expense_type: 'kurum',
    description: 'Su faturası'
  })

  await supabase.from('expense_records').insert({
    category_id: expenseCategories?.[5]?.id,
    record_date: '2024-01-15',
    amount: 350,
    currency: 'TRY',
    payment_method: 'nakit',
    expense_type: 'kisisel',
    recorded_by: lawyer.id,
    description: 'Ofis yemeği'
  })

  console.log('\n✅ SEED COMPLETE!\n')
  console.log('=== LOGIN CREDENTIALS ===')
  console.log('Admin:  admin@hukukburo.com / admin123')
  console.log('Avukat: avukat@hukukburo.com / avukat123')
  console.log('========================')
}

seed().catch(e => console.error('Error:', e.message))