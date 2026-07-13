import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY tanımlı değil.')
  process.exit(1)
}

const service = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const users = [
  { email: 'rls-admin@hukuk.local', password: 'LocalAdmin123!', full_name: 'RLS Admin', role: 'admin', is_active: true },
  { email: 'rls-lawyer@hukuk.local', password: 'LocalAdmin123!', full_name: 'RLS Avukat', role: 'lawyer', is_active: true },
  { email: 'rls-other-lawyer@hukuk.local', password: 'LocalAdmin123!', full_name: 'RLS Diğer Avukat', role: 'lawyer', is_active: true },
  { email: 'rls-assistant@hukuk.local', password: 'LocalAdmin123!', full_name: 'RLS Asistan', role: 'assistant', is_active: true },
  { email: 'rls-finance@hukuk.local', password: 'LocalAdmin123!', full_name: 'RLS Finans', role: 'finance', is_active: true },
  { email: 'rls-passive@hukuk.local', password: 'LocalAdmin123!', full_name: 'RLS Pasif', role: 'lawyer', is_active: false },
]

function fail(message, details) {
  console.error(`RLS doğrulama hatası: ${message}`)
  if (details) console.error(details)
  process.exit(1)
}

async function upsertAuthUser(user) {
  const { data, error } = await service.auth.admin.listUsers()
  if (error) fail('Kullanıcılar listelenemedi', error.message)

  const existing = data.users.find((item) => item.email === user.email)

  if (existing) {
    const { error: updateAuthError } = await service.auth.admin.updateUserById(existing.id, {
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name, role: user.role },
    })
    if (updateAuthError) fail(`${user.email} auth güncellenemedi`, updateAuthError.message)

    const { error: profileError } = await service.from('profiles').upsert({
      id: existing.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    })
    if (profileError) fail(`${user.email} profili güncellenemedi`, profileError.message)
    return existing.id
  }

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.full_name, role: user.role },
  })
  if (createError) fail(`${user.email} auth oluşturulamadı`, createError.message)

  const { error: profileError } = await service.from('profiles').upsert({
    id: created.user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    is_active: user.is_active,
  })
  if (profileError) fail(`${user.email} profili oluşturulamadı`, profileError.message)

  return created.user.id
}

async function login(email, password) {
  const client = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) fail(`${email} giriş yapamadı`, error.message)
  return client
}

async function expectCount(label, queryPromise, expected) {
  const { data, error } = await queryPromise
  if (error) fail(`${label} sorgu hatası`, error.message)
  if ((data?.length ?? 0) !== expected) {
    fail(`${label} beklenen kayıt sayısı ${expected}, gelen ${data?.length ?? 0}`, data)
  }
}

const ids = {}
for (const user of users) {
  ids[user.role + ':' + user.email] = await upsertAuthUser(user)
}

const adminId = ids['admin:rls-admin@hukuk.local']
const lawyerId = ids['lawyer:rls-lawyer@hukuk.local']
const otherLawyerId = ids['lawyer:rls-other-lawyer@hukuk.local']
const assistantId = ids['assistant:rls-assistant@hukuk.local']

const { data: client, error: clientError } = await service
  .from('clients')
  .insert({ name: 'RLS Test Müvekkil', type: 'individual', created_by: adminId })
  .select('id')
  .single()
if (clientError) fail('Test müvekkili oluşturulamadı', clientError.message)

const caseStatus = await service.from('lookup_values').select('id').eq('group_key', 'case_status').limit(1).single()
if (caseStatus.error) fail('Case status lookup okunamadı', caseStatus.error.message)

const { data: assignedCase, error: caseError } = await service
  .from('case_files')
  .insert({ client_id: client.id, lawyer_id: lawyerId, status_id: caseStatus.data.id, opposing_party: 'RLS Karşı Taraf', created_by: adminId })
  .select('id, file_code')
  .single()
if (caseError) fail('Atanmış dava oluşturulamadı', caseError.message)

const { data: otherCase, error: otherCaseError } = await service
  .from('case_files')
  .insert({ client_id: client.id, lawyer_id: otherLawyerId, status_id: caseStatus.data.id, opposing_party: 'RLS Diğer Karşı Taraf', created_by: adminId })
  .select('id, file_code')
  .single()
if (otherCaseError) fail('Diğer dava oluşturulamadı', otherCaseError.message)

const { error: personalExpenseError } = await service
  .from('expenses')
  .insert({ scope: 'personal', expense_date: new Date().toISOString().slice(0, 10), amount: 100, created_by: lawyerId, description: 'RLS kişisel gider' })
if (personalExpenseError) fail('Kişisel gider oluşturulamadı', personalExpenseError.message)

const admin = await login('rls-admin@hukuk.local', 'LocalAdmin123!')
const lawyer = await login('rls-lawyer@hukuk.local', 'LocalAdmin123!')
const assistant = await login('rls-assistant@hukuk.local', 'LocalAdmin123!')
const finance = await login('rls-finance@hukuk.local', 'LocalAdmin123!')
const passive = await login('rls-passive@hukuk.local', 'LocalAdmin123!')

await expectCount('Admin tüm davaları görmeli', admin.from('case_files').select('id'), 2)
await expectCount('Avukat sadece kendi davasını görmeli', lawyer.from('case_files').select('id'), 1)
await expectCount('Asistan tüm davaları görmeli', assistant.from('case_files').select('id'), 2)
await expectCount('Finans rolü dava görmemeli', finance.from('case_files').select('id'), 0)
await expectCount('Pasif kullanıcı lookup görememeli', passive.from('lookup_values').select('id').limit(1), 0)
await expectCount('Avukat kendi kişisel giderini görmeli', lawyer.from('expenses').select('id').eq('scope', 'personal'), 1)
await expectCount('Asistan kişisel gider görmemeli', assistant.from('expenses').select('id').eq('scope', 'personal'), 0)
await expectCount('Admin kişisel gideri görmeli', admin.from('expenses').select('id').eq('scope', 'personal'), 1)

const { error: lawyerUpdateOtherCaseError } = await lawyer
  .from('case_files')
  .update({ notes: 'Bu işlem RLS tarafından engellenmeli' })
  .eq('id', otherCase.id)

if (!lawyerUpdateOtherCaseError) {
  const { data } = await service.from('case_files').select('notes').eq('id', otherCase.id).single()
  if (data?.notes === 'Bu işlem RLS tarafından engellenmeli') {
    fail('Avukat başkasının dosyasını güncelleyebildi')
  }
}

const { error: lawyerUpdateOwnCaseError } = await lawyer
  .from('case_files')
  .update({ notes: 'Avukat kendi dosyasını güncelledi' })
  .eq('id', assignedCase.id)

if (lawyerUpdateOwnCaseError) fail('Avukat kendi dosyasını güncelleyemedi', lawyerUpdateOwnCaseError.message)

console.log('RLS doğrulaması başarılı.')
