import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load env manually
const envContent = readFileSync('./.env.local', 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key) env[key.trim()] = vals.join('=').trim()
})

console.log('URL:', env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) + '...')

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function seed() {
  console.log('\n🔄 Creating sample data...\n')

  // Check users
  const { data: users } = await supabase.from('users').select('id, email')
  console.log('Users in DB:', users?.length || 0)

  const lawyer = users?.find(u => u.email?.includes('avukat'))
  if (!lawyer) {
    console.log('❌ No lawyer found. Create auth users first!')
    return
  }

  // Create clients
  console.log('Creating clients...')
  const { data: c1 } = await supabase.from('clients').insert({ name: 'Ayşe Demir', type: 'individual', phone: '05321234567' }).select().single()
  const { data: c2 } = await supabase.from('clients').insert({ name: 'ABC Holding', type: 'company', phone: '02124567890' }).select().single()
  const { data: c3 } = await supabase.from('clients').insert({ name: 'Mehmet Kaya', type: 'individual', phone: '05339876543' }).select().single()

  // Get lookups
  const { data: caseTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_type').limit(1)
  const { data: statuses } = await supabase.from('lookup_values').select('id').eq('group_key', 'case_status').limit(1)
  const { data: courtTypes } = await supabase.from('lookup_values').select('id').eq('group_key', 'court_type').limit(1)

  console.log('Creating cases...')

  // Create 3 cases
  await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: c1?.id,
    opposing_party: 'Ahmet Demir',
    client_role: 'Davacı',
    entity_type: 'M',
    court_city: 'İstanbul',
    opened_at: '2024-01-15',
    case_value: 50000,
    case_type_id: caseTypes?.[0]?.id,
    status_id: statuses?.[0]?.id,
    court_type_id: courtTypes?.[0]?.id
  })

  await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: c2?.id,
    opposing_party: 'XYZ Ltd. Şti.',
    client_role: 'Davacı',
    entity_type: 'company',
    court_city: 'İstanbul',
    opened_at: '2024-02-20',
    case_value: 150000,
    lean_against: 'L'
  })

  await supabase.from('cases').insert({
    lawyer_id: lawyer.id,
    client_id: c3?.id,
    opposing_party: 'Veli Duran',
    client_role: 'Davalı',
    entity_type: 'M',
    court_city: 'Ankara',
    opened_at: '2024-03-10',
    lean_against: 'K'
  })

  console.log('\n✅ Sample data created!')
}

seed().catch(e => console.error('Error:', e.message))