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
  console.log('\n🔄 Creating auth users and data...\n')

  // Create admin user
  try {
    const { data: admin } = await supabase.auth.admin.createUser({
      email: 'admin@hukukburo.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: { full_name: 'Admin', role: 'admin' }
    })
    console.log('✅ Admin user created:', admin?.user?.id)
  } catch (e: any) {
    console.log('Admin might exist:', e.message)
  }

  // Create lawyer user
  try {
    const { data: lawyer } = await supabase.auth.admin.createUser({
      email: 'avukat@hukukburo.com',
      password: 'avukat123',
      email_confirm: true,
      user_metadata: { full_name: 'Av. Ahmet Yılmaz', role: 'lawyer' }
    })
    console.log('✅ Lawyer user created:', lawyer?.user?.id)
  } catch (e: any) {
    console.log('Lawyer might exist:', e.message)
  }

  // Wait for triggers
  await new Promise(r => setTimeout(r, 2000))

  // Get users
  const { data: users } = await supabase.from('users').select('id, email')
  console.log('Users in DB:', users?.length)

  const lawyerUser = users?.find(u => u.email?.includes('avukat'))
  if (!lawyerUser) {
    console.log('⚠️ Lawyer profile not created by trigger, creating manually...')
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

  // Get lawyer again
  const { data: lawyer } = await supabase.from('users').select('id').eq('email', 'avukat@hukukburo.com').single()
  if (!lawyer) {
    console.log('❌ Still no lawyer. Stopping.')
    return
  }

  console.log('Creating sample data...')

  // Create clients
  await supabase.from('clients').insert({ name: 'Ayşe Demir', type: 'individual', phone: '05321234567', email: 'ayse@email.com' })
  await supabase.from('clients').insert({ name: 'ABC Holding A.Ş.', type: 'company', phone: '02124567890', email: 'abc@company.com' })
  await supabase.from('clients').insert({ name: 'Mehmet Kaya', type: 'individual', phone: '05339876543', email: 'mehmet@email.com' })

  // Get lookups
  const { data: caseTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_type').limit(3)
  const { data: statuses } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_status').limit(2)
  const { data: courtTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'court_type').limit(2)

  // Get clients
  const { data: clients } = await supabase.from('clients').select('id').limit(3)

  // Create cases
  await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: clients?.[0]?.id,
    opposing_party: 'Ahmet Demir',
    client_role: 'Davacı',
    entity_type: 'M',
    court_city: 'İstanbul',
    court_district: 'Kadıköy',
    court_type_id: courtTypes?.[0]?.id,
    case_type_id: caseTypes?.[0]?.id,
    status_id: statuses?.[0]?.id,
    opened_at: '2024-01-15',
    case_value: 50000,
    currency: 'TRY',
    description: 'Boşanma davası - Mal paylaşımı ve velayet'
  })

  await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: clients?.[1]?.id,
    opposing_party: 'XYZ Ltd. Şti.',
    client_role: 'Davacı',
    entity_type: 'company',
    court_city: 'İstanbul',
    court_district: 'Çağlayan',
    case_type_id: caseTypes?.[1]?.id,
    status_id: statuses?.[1]?.id,
    opened_at: '2024-02-20',
    case_value: 150000,
    currency: 'TRY',
    lean_against: 'L'
  })

  await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: clients?.[2]?.id,
    opposing_party: 'Veli Duran',
    client_role: 'Davalı',
    entity_type: 'M',
    court_city: 'Ankara',
    court_district: 'Çankaya',
    case_type_id: caseTypes?.[0]?.id,
    status_id: statuses?.[0]?.id,
    opened_at: '2024-03-10',
    case_value: 0,
    currency: 'TRY',
    lean_against: 'K'
  })

  console.log('\n✅ SEED COMPLETE!\n')
  console.log('=== LOGIN CREDENTIALS ===')
  console.log('Admin:  admin@hukukburo.com / admin123')
  console.log('Avukat: avukat@hukukburo.com / avukat123')
  console.log('========================')
}

seed().catch(e => console.error('Error:', e.message))