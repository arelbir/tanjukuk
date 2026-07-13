import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY tanımlı değil')
  process.exit(1)
}

const adminEmail = (process.env.LOCAL_ADMIN_EMAIL ?? 'admin@hukuk.local').trim().toLowerCase()
const adminPassword = process.env.LOCAL_ADMIN_PASSWORD ?? 'LocalAdmin123!'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function lookup(groupKey, label) {
  const { data, error } = await supabase
    .from('lookup_values')
    .select('id')
    .eq('group_key', groupKey)
    .eq('label', label)
    .maybeSingle()
  if (error) throw error
  return data?.id || null
}

async function main() {
  const { data: adminProfile, error: adminError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', adminEmail)
    .single()
  if (adminError) throw adminError

  const adminId = adminProfile.id

  const clients = [
    { name: 'Akdeniz Lojistik A.Ş.', type: 'company', email: 'operasyon@akdeniz.test', phone: '+90 212 000 00 00', created_by: adminId },
    { name: 'Yıldız İnşaat', type: 'company', email: 'info@yildiz.test', phone: '+90 216 000 00 00', created_by: adminId },
    { name: 'Murat Demir', type: 'individual', email: 'murat@example.test', phone: '+90 532 000 00 00', created_by: adminId },
  ]

  for (const client of clients) {
    const { data: existingClient, error: existingClientError } = await supabase
      .from('clients')
      .select('id')
      .eq('name', client.name)
      .maybeSingle()
    if (existingClientError) throw existingClientError
    if (!existingClient) {
      const { error } = await supabase.from('clients').insert(client)
      if (error) throw error
    }
  }

  const { data: clientRows, error: clientError } = await supabase.from('clients').select('id, name').in('name', clients.map((item) => item.name))
  if (clientError) throw clientError

  const clientByName = new Map(clientRows.map((client) => [client.name, client.id]))
  const caseStatusId = await lookup('case_status', 'Yerel Mahkeme') || await lookup('case_status', 'Hazırlık')
  const caseTypeId = await lookup('case_type', 'Ticari Dava') || await lookup('case_type', 'Diğer')
  const enforcementStatusId = await lookup('enforcement_status', 'Takip Açıldı') || await lookup('enforcement_status', 'Hazırlık')
  const enforcementTypeId = await lookup('enforcement_type', 'İlamlı Takip') || await lookup('enforcement_type', 'Diğer')

  const { data: existingCase } = await supabase.from('case_files').select('id').eq('file_code', 'DVA-2026-0001').maybeSingle()
  let caseId = existingCase?.id
  if (!caseId) {
    const { data, error } = await supabase.from('case_files').insert({
      file_code: 'DVA-2026-0001',
      lawyer_id: adminId,
      client_id: clientByName.get('Akdeniz Lojistik A.Ş.'),
      opposing_party: 'Kuzey Tedarik Ltd.',
      case_type_id: caseTypeId,
      status_id: caseStatusId,
      court_city: 'İstanbul',
      court_no: '4. Asliye Ticaret',
      opened_at: '2026-07-01',
      case_value: 420000,
      created_by: adminId,
    }).select('id').single()
    if (error) throw error
    caseId = data.id
  }

  const { data: existingEnforcement } = await supabase.from('enforcement_files').select('id').eq('file_code', 'ICR-2026-0001').maybeSingle()
  let enforcementId = existingEnforcement?.id
  if (!enforcementId) {
    const { data, error } = await supabase.from('enforcement_files').insert({
      file_code: 'ICR-2026-0001',
      lawyer_id: adminId,
      client_id: clientByName.get('Yıldız İnşaat'),
      debtor_party: 'Murat Demir',
      client_position: 'creditor',
      enforcement_type_id: enforcementTypeId,
      status_id: enforcementStatusId,
      enforcement_office: 'Bakırköy 7. İcra Dairesi',
      opened_at: '2026-07-02',
      principal_amount: 186000,
      created_by: adminId,
    }).select('id').single()
    if (error) throw error
    enforcementId = data.id
  }

  const now = new Date()
  const today930 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30).toISOString()
  const today1430 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30).toISOString()
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0).toISOString()

  const events = [
    { title: 'Bilirkişi raporuna itiraz taslağı', event_type: 'task', starts_at: today930, case_file_id: caseId, assigned_to: adminId, created_by: adminId },
    { title: 'Ön inceleme duruşması', event_type: 'hearing', starts_at: today1430, case_file_id: caseId, assigned_to: adminId, created_by: adminId, location: 'İstanbul 4. Asliye Ticaret' },
    { title: 'Tebligat cevabı kontrolü', event_type: 'deadline', starts_at: yesterday, enforcement_file_id: enforcementId, assigned_to: adminId, created_by: adminId },
  ]

  for (const event of events) {
    const { data: existing, error: existingEventError } = await supabase.from('calendar_events').select('id').eq('title', event.title).maybeSingle()
    if (existingEventError) throw existingEventError
    if (!existing) {
      const { error } = await supabase.from('calendar_events').insert(event)
      if (error) throw error
    }
  }

  const paymentCategoryId = await lookup('payment_category', 'Vekâlet Ücreti') || await lookup('payment_category', 'Diğer')
  const expenseCategoryId = await lookup('expense_category', 'Yargılama Giderleri') || await lookup('expense_category', 'Diğer')

  const { data: receivable } = await supabase.from('receivables').select('id').eq('description', 'Vekalet ücreti').maybeSingle()
  if (!receivable) {
    const { error } = await supabase.from('receivables').insert({
      client_id: clientByName.get('Akdeniz Lojistik A.Ş.'),
      case_file_id: caseId,
      category_id: paymentCategoryId,
      due_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString().split('T')[0],
      expected_amount: 42000,
      remaining_amount: 42000,
      description: 'Vekalet ücreti',
      created_by: adminId,
    })
    if (error) throw error
  }

  const { data: expense } = await supabase.from('expenses').select('id').eq('description', 'Başvuru harcı').maybeSingle()
  if (!expense) {
    const { error } = await supabase.from('expenses').insert({
      scope: 'case_file',
      category_id: expenseCategoryId,
      case_file_id: caseId,
      expense_date: new Date().toISOString().split('T')[0],
      amount: 2850,
      description: 'Başvuru harcı',
      created_by: adminId,
    })
    if (error) throw error
  }

  const notifications = [
    { user_id: adminId, title: 'Bugünkü duruşma yaklaşıyor', message: 'DVA-2026-0001 için 14:30 ön inceleme duruşması.', type: 'hearing', entity_type: 'calendar_event', entity_id: caseId },
    { user_id: adminId, title: 'Gecikmiş görev var', message: 'ICR-2026-0001 tebligat cevabı kontrolü gecikti.', type: 'deadline', entity_type: 'calendar_event', entity_id: enforcementId },
  ]

  for (const notification of notifications) {
    const { data: existing, error: existingNotificationError } = await supabase.from('notifications').select('id').eq('title', notification.title).eq('user_id', adminId).maybeSingle()
    if (existingNotificationError) throw existingNotificationError
    if (!existing) {
      const { error } = await supabase.from('notifications').insert(notification)
      if (error) throw error
    }
  }

  console.log('Yerel gerçek test verisi hazır.')
  console.log(`Giriş: ${adminEmail} / ${adminPassword}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
