const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://prooslgiozmnmrwtxczp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb29zbGdpb3ptbm1yd3R4Y3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDQ5MDcsImV4cCI6MjA5MTM4MDkwN30.Db7XvQUQDtRr0BqCNbWRPGmIdTD6LIItVMpzvNVxZ8o'
)

async function seed() {
  console.log('\n🔄 Seeding database...\n')

  // Wait a bit for triggers
  await new Promise(r => setTimeout(r, 2000))

  // Check users
  const users = await supabase.from('users').select('id, email')
  console.log('Users in DB:', users.data?.length || 0)

  const lawyer = users.data?.find(u => u.email?.includes('avukat'))
  
  if (!lawyer) {
    // Try to manually create user profile
    const authUsers = await supabase.auth.admin.listUsers()
    const lawAuth = authUsers.data.users?.find(u => u.email === 'avukat@hukukburo.com')
    if (lawAuth) {
      console.log('Creating lawyer profile manually...')
      await supabase.from('users').insert({
        id: lawAuth.id,
        full_name: 'Av. Ahmet Yılmaz',
        email: 'avukat@hukukburo.com',
        role: 'lawyer',
        is_active: true
      })
    }
  }

  // Get lawyer again
  const { data: lawyerData } = await supabase.from('users').select('id').eq('email', 'avukat@hukukburo.com').single()
  
  if (!lawyerData) {
    console.log('❌ No lawyer found, aborting')
    return
  }

  console.log('Creating clients...')
  await supabase.from('clients').insert({ name: 'Ayşe Demir', type: 'individual', phone: '05321234567' })
  await supabase.from('clients').insert({ name: 'ABC Holding A.Ş.', type: 'company', phone: '02124567890' })
  await supabase.from('clients').insert({ name: 'Mehmet Kaya', type: 'individual', phone: '05339876543' })

  // Get lookups
  const { data: caseTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_type').limit(3)
  const { data: statuses } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_status').limit(2)
  const { data: courtTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'court_type').limit(2)
  const { data: clients } = await supabase.from('clients').select('id').limit(3)

  console.log('Creating cases...')
  await supabase.from('cases').insert({
    lawyer_id: lawyerData.id,
    client_id: clients[0]?.id,
    opposing_party: 'Ahmet Demir',
    client_role: 'Davacı',
    entity_type: 'M',
    court_city: 'İstanbul',
    court_district: 'Kadıköy',
    court_type_id: courtTypes[0]?.id,
    case_type_id: caseTypes[0]?.id,
    status_id: statuses[0]?.id,
    opened_at: '2024-01-15',
    case_value: 50000,
    description: 'Boşanma davası'
  })

  await supabase.from('cases').insert({
    lawyer_id: lawyerData.id,
    client_id: clients[1]?.id,
    opposing_party: 'XYZ Ltd. Şti.',
    client_role: 'Davacı',
    entity_type: 'company',
    court_city: 'İstanbul',
    case_type_id: caseTypes[1]?.id,
    status_id: statuses[1]?.id,
    opened_at: '2024-02-20',
    case_value: 150000,
    lean_against: 'L'
  })

  await supabase.from('cases').insert({
    lawyer_id: lawyerData.id,
    client_id: clients[2]?.id,
    opposing_party: 'Veli Duran',
    client_role: 'Davalı',
    entity_type: 'M',
    court_city: 'Ankara',
    case_type_id: caseTypes[0]?.id,
    status_id: statuses[0]?.id,
    opened_at: '2024-03-10',
    lean_against: 'K'
  })

  console.log('\n✅ SEED COMPLETE!')
  console.log('\n=== TEST LOGIN ===')
  console.log('Admin:  admin@hukukburo.com / admin123')
  console.log('Avukat: avukat@hukukburo.com / avukat123')
  console.log('=================')
}

seed().catch(e => console.log('Error:', e.message))