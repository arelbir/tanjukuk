const { createClient } = require('@supabase/supabase-js')

// Use service role key directly
const supabase = createClient(
  'https://prooslgiozmnmrwtxczp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb29zbGdpb3ptbm1yd3R4Y3pwIiwicm9sZSI6InNlcnZpY2Utcm9sZSIsImlhdCI6MTc3NTgwNDkwNywiZXhwIjoyMDkxMzgwOTA3fQ.vU3p7W6b2qTt5UzY8KqjKQxYQxT3VxG6z9pZVZJXZ0Gk',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function seed() {
  console.log('🔄 Seeding...\n')

  // Get auth users
  const authUsers = await supabase.auth.admin.listUsers()
  const admin = authUsers.data.users.find(u => u.email === 'admin@hukukburo.com')
  const lawyer = authUsers.data.users.find(u => u.email === 'avukat@hukukburo.com')

  console.log('Auth users:', authUsers.data.users.length)

  // Insert into users (bypass RLS)
  await supabase.from('users').upsert({
    id: admin.id,
    full_name: 'Admin',
    email: 'admin@hukukburo.com',
    role: 'admin',
    is_active: true
  }, { onConflict: 'id' })

  await supabase.from('users').upsert({
    id: lawyer.id,
    full_name: 'Av. Ahmet Yılmaz',
    email: 'avukat@hukukburo.com',
    role: 'lawyer',
    is_active: true
  }, { onConflict: 'id' })

  console.log('✅ Users created')

  // Create clients
  await supabase.from('clients').insert({ name: 'Ayşe Demir', type: 'individual', phone: '05321234567' })
  await supabase.from('clients').insert({ name: 'ABC Holding A.Ş.', type: 'company', phone: '02124567890' })
  await supabase.from('clients').insert({ name: 'Mehmet Kaya', type: 'individual', phone: '05339876543' })
  console.log('✅ Clients created')

  // Get data
  const { data: caseTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_type').limit(3)
  const { data: statuses } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_status').limit(2)
  const { data: courtTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'court_type').limit(2)
  const { data: clients } = await supabase.from('clients').select('id').limit(3)

  // Create cases
  await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: clients[0].id,
    opposing_party: 'Ahmet Demir',
    client_role: 'Davacı',
    entity_type: 'M',
    court_city: 'İstanbul',
    court_district: 'Kadıköy',
    court_type_id: courtTypes[0].id,
    case_type_id: caseTypes[0].id,
    status_id: statuses[0].id,
    opened_at: '2024-01-15',
    case_value: 50000,
    description: 'Boşanma davası'
  })

  await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: clients[1].id,
    opposing_party: 'XYZ Ltd. Şti.',
    client_role: 'Davacı',
    entity_type: 'company',
    court_city: 'İstanbul',
    case_type_id: caseTypes[1].id,
    status_id: statuses[1].id,
    opened_at: '2024-02-20',
    case_value: 150000,
    lean_against: 'L'
  })

  await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: clients[2].id,
    opposing_party: 'Veli Duran',
    client_role: 'Davalı',
    entity_type: 'M',
    court_city: 'Ankara',
    case_type_id: caseTypes[0].id,
    status_id: statuses[0].id,
    opened_at: '2024-03-10',
    lean_against: 'K'
  })

  console.log('✅ Cases created')
  console.log('\n✅ SEED COMPLETE!')
  console.log('\nLogin: admin@hukukburo.com / admin123')
}

seed().catch(e => console.log('Error:', e.message))