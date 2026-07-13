import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'
import type { ClientDetailResult, ClientFormValues, ClientListFilters, ClientListResult, ClientRow } from './types'

export type TypedSupabaseClient = SupabaseClient<Database>

function normalizePage(value?: number) {
  return Math.max(1, Number(value) || 1)
}

function normalizePageSize(value?: number) {
  return Math.min(100, Math.max(5, Number(value) || 20))
}

export async function listClients(
  supabase: TypedSupabaseClient,
  filters: ClientListFilters = {}
): Promise<ClientListResult> {
  const page = normalizePage(filters.page)
  const pageSize = normalizePageSize(filters.pageSize)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const search = filters.search?.trim()
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,client_code.ilike.%${search}%`)
  }

  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  if (filters.status === 'active') {
    query = query.eq('is_active', true)
  }

  if (filters.status === 'inactive') {
    query = query.eq('is_active', false)
  }

  const { data, count, error } = await query
  if (error) throw error

  return {
    items: data || [],
    total: count || 0,
    page,
    pageSize,
  }
}

export async function getClientById(supabase: TypedSupabaseClient, id: string): Promise<ClientRow | null> {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getClientDetail(supabase: TypedSupabaseClient, id: string): Promise<ClientDetailResult> {
  const [clientResult, casesResult, enforcementsResult, receivablesResult] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('case_files')
      .select('id, file_code, opposing_party, opened_at, is_archived, case_value, currency')
      .eq('client_id', id)
      .order('opened_at', { ascending: false }),
    supabase
      .from('enforcement_files')
      .select('id, file_code, debtor_party, opened_at, is_archived, total_amount, remaining_amount, currency')
      .eq('client_id', id)
      .order('opened_at', { ascending: false }),
    supabase.from('receivables').select('expected_amount, remaining_amount, currency').eq('client_id', id),
  ])

  if (clientResult.error) throw clientResult.error
  if (casesResult.error) throw casesResult.error
  if (enforcementsResult.error) throw enforcementsResult.error
  if (receivablesResult.error) throw receivablesResult.error

  const receivables = receivablesResult.data || []
  const currency = receivables[0]?.currency || 'TRY'

  return {
    client: clientResult.data,
    cases: casesResult.data || [],
    enforcements: enforcementsResult.data || [],
    finance: {
      receivableTotal: receivables.reduce((sum, item) => sum + Number(item.expected_amount || 0), 0),
      receivableRemaining: receivables.reduce((sum, item) => sum + Number(item.remaining_amount || 0), 0),
      expenseTotal: 0,
      currency,
    },
  }
}

export async function createClientRecord(
  supabase: TypedSupabaseClient,
  values: ClientFormValues
): Promise<ClientRow> {
  const { data, error } = await supabase
    .from('clients')
    .insert(toClientPayload(values))
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateClientRecord(
  supabase: TypedSupabaseClient,
  id: string,
  values: ClientFormValues
): Promise<ClientRow> {
  const { data, error } = await supabase
    .from('clients')
    .update(toClientPayload(values))
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function setClientActiveState(
  supabase: TypedSupabaseClient,
  id: string,
  isActive: boolean
): Promise<ClientRow> {
  const { data, error } = await supabase
    .from('clients')
    .update({ is_active: isActive })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

function toClientPayload(values: ClientFormValues) {
  return {
    name: values.name.trim(),
    type: values.type,
    phone: values.phone.trim() || null,
    email: values.email.trim() || null,
    tax_number: values.type === 'company' ? values.tax_number.trim() || null : null,
    national_id: values.type === 'individual' ? values.national_id.trim() || null : null,
    company_representative: values.type === 'company' ? values.company_representative.trim() || null : null,
    address: values.address.trim() || null,
    notes: values.notes.trim() || null,
    is_active: values.is_active,
  }
}
