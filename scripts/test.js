const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://prooslgiozmnmrwtxczp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb29zbGdpb3ptbm1yd3R4Y3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDQ5MDcsImV4cCI6MjA5MTM4MDkwN30.Db7XvQUQDtRr0BqCNbWRPGmIdTD6LIItVMpzvNVxZ8o'
)

async function run() {
  console.log('Testing connection...\n')
  
  // 1. List auth users
  console.log('1. Checking auth.users...')
  const authUsers = await supabase.auth.admin.listUsers()
  console.log('   Auth users:', authUsers.data?.users?.length || 0)
  authUsers.data?.users?.forEach(u => console.log('   -', u.email))

  // 2. Check lookup_values
  console.log('\n2. Checking lookup_values...')
  const lookup = await supabase.from('lookup_values').select('id, group_key, label').limit(5)
  console.log('   Lookup count:', lookup.data?.length || 0)
  
  // 3. Try to create auth user
  console.log('\n3. Creating auth users...')
  try {
    const admin = await supabase.auth.admin.createUser({
      email: 'admin@hukukburo.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: { full_name: 'Admin', role: 'admin' }
    })
    console.log('   Admin created:', admin.data?.user?.id || 'OK')
  } catch(e) {
    console.log('   Admin:', e.message)
  }

  try {
    const lawyer = await supabase.auth.admin.createUser({
      email: 'avukat@hukukburo.com', 
      password: 'avukat123',
      email_confirm: true,
      user_metadata: { full_name: 'Av. Ahmet Yılmaz', role: 'lawyer' }
    })
    console.log('   Lawyer created:', lawyer.data?.user?.id || 'OK')
  } catch(e) {
    console.log('   Lawyer:', e.message)
  }
  
  console.log('\nDone!')
}

run().catch(e => console.log('Error:', e.message))