import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'
import type {
  EnforcementFileDetailResult,
  EnforcementFileFormValues,
  EnforcementFileListFilters,
  EnforcementFileListItem,
  EnforcementFileListResult,
  EnforcementFileRow,
} from './types'

export type TypedSupabaseClient = SupabaseClient<Database>

export interface EnforcementFileFormOptions {
  clients: Array<{ id: string; label: string }>
  lawyers: Array<{ id: string; label: string }>
}

function normalizePage(value?: number) {
  return Math.max(1, Number(value) || 1)
}

function normalizePageSize(value?: number) {
  return Math.min(100, Math.max(5, Number(value) || 20))
}

export async function listEnforcementFiles(
  supabase: TypedSupabaseClient,
  filters: EnforcementFileListFilters = {}
): Promise<EnforcementFileListResult> {
  const page = normalizePage(filters.page)
  const pageSize = normalizePageSize(filters.pageSize)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('enforcement_files')
    .select(`
      *,
      client:clients(id, name, client_code),
      lawyer:profiles!enforcement_files_lawyer_id_fkey(id, full_name, email),
      status:lookup_values!enforcement_files_status_id_fkey(id, label),
      enforcement_type:lookup_values!enforcement_files_enforcement_type_id_fkey(id, label)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const search = filters.search?.trim()
  if (search) {
    query = query.or(`file_code.ilike.%${search}%,debtor_party.ilike.%${search}%,file_no.ilike.%${search}%,enforcement_office.ilike.%${search}%`)
  }
  if (filters.lawyerId && filters.lawyerId !== 'all') query = query.eq('lawyer_id', filters.lawyerId)
  if (filters.statusId && filters.statusId !== 'all') query = query.eq('status_id', filters.statusId)
  if (filters.enforcementTypeId && filters.enforcementTypeId !== 'all') query = query.eq('enforcement_type_id', filters.enforcementTypeId)
  if (filters.dateFrom) query = query.gte('opened_at', filters.dateFrom)
  if (filters.dateTo) query = query.lte('opened_at', filters.dateTo)
  if (filters.archive === 'active') query = query.eq('is_archived', false)
  if (filters.archive === 'archived') query = query.eq('is_archived', true)

  const { data, count, error } = await query
  if (error) throw error

  return {
    items: (data || []) as EnforcementFileListItem[],
    total: count || 0,
    page,
    pageSize,
  }
}

export async function getEnforcementFileById(supabase: TypedSupabaseClient, id: string): Promise<EnforcementFileRow | null> {
  const { data, error } = await supabase.from('enforcement_files').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getEnforcementFileDetail(supabase: TypedSupabaseClient, id: string): Promise<EnforcementFileDetailResult | null> {
  const fileQuery = supabase
    .from('enforcement_files')
    .select(`
      *,
      client:clients(id, name, client_code),
      lawyer:profiles!enforcement_files_lawyer_id_fkey(id, full_name, email),
      status:lookup_values!enforcement_files_status_id_fkey(id, label),
      enforcement_type:lookup_values!enforcement_files_enforcement_type_id_fkey(id, label)
    `)
    .eq('id', id)
    .maybeSingle()

  const [fileResult, statusHistoryResult, eventsResult, paymentsResult, expensesResult, documentsResult, auditResult] = await Promise.all([
    fileQuery,
    supabase
      .from('enforcement_status_history')
      .select(`
        *,
        old_status:lookup_values!enforcement_status_history_old_status_id_fkey(id, label),
        new_status:lookup_values!enforcement_status_history_new_status_id_fkey(id, label),
        changed_by_profile:profiles!enforcement_status_history_changed_by_fkey(id, full_name, email)
      `)
      .eq('enforcement_file_id', id)
      .order('changed_at', { ascending: false }),
    supabase.from('calendar_events').select('*').eq('enforcement_file_id', id).order('starts_at', { ascending: true }),
    supabase.from('payments').select('*').eq('enforcement_file_id', id).is('cancelled_at', null).order('payment_date', { ascending: false }),
    supabase.from('expenses').select('*').eq('enforcement_file_id', id).is('cancelled_at', null).order('expense_date', { ascending: false }),
    supabase.from('documents').select('*').eq('entity_type', 'enforcement_file').eq('entity_id', id).is('archived_at', null).order('created_at', { ascending: false }),
    supabase.from('audit_logs').select('*').eq('entity_type', 'enforcement_file').eq('entity_id', id).order('created_at', { ascending: false }).limit(50),
  ])

  if (fileResult.error) throw fileResult.error
  if (!fileResult.data) return null
  if (statusHistoryResult.error) throw statusHistoryResult.error
  if (eventsResult.error) throw eventsResult.error
  if (paymentsResult.error) throw paymentsResult.error
  if (expensesResult.error) throw expensesResult.error
  if (documentsResult.error) throw documentsResult.error
  if (auditResult.error) throw auditResult.error

  const payments = paymentsResult.data || []
  const expenses = expensesResult.data || []
  const currency = fileResult.data.currency || payments[0]?.currency || expenses[0]?.currency || 'TRY'

  return {
    enforcementFile: fileResult.data as EnforcementFileListItem,
    statusHistory: statusHistoryResult.data || [],
    events: eventsResult.data || [],
    payments,
    expenses,
    documents: documentsResult.data || [],
    auditLogs: auditResult.data || [],
    finance: {
      collectedTotal: payments.reduce((total, payment) => total + Number(payment.amount || 0), 0),
      expenseTotal: expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0),
      remainingAmount: Number(fileResult.data.remaining_amount || 0),
      currency,
    },
  }
}

export async function getEnforcementFileFormOptions(supabase: TypedSupabaseClient): Promise<EnforcementFileFormOptions> {
  const [clientsResult, lawyersResult] = await Promise.all([
    supabase.from('clients').select('id, name, client_code').eq('is_active', true).order('name'),
    supabase.from('profiles').select('id, full_name, email').eq('role', 'lawyer').eq('is_active', true).order('full_name'),
  ])

  if (clientsResult.error) throw clientsResult.error
  if (lawyersResult.error) throw lawyersResult.error

  return {
    clients: (clientsResult.data || []).map((client) => ({ id: client.id, label: client.client_code ? `${client.name} (${client.client_code})` : client.name })),
    lawyers: (lawyersResult.data || []).map((lawyer) => ({ id: lawyer.id, label: lawyer.full_name || lawyer.email || lawyer.id })),
  }
}

export function toEnforcementFilePayload(values: EnforcementFileFormValues) {
  const principal = values.principal_amount ? Number(values.principal_amount) : 0
  const interest = values.interest_amount ? Number(values.interest_amount) : 0
  const expense = values.expense_amount ? Number(values.expense_amount) : 0
  const collected = values.collected_amount ? Number(values.collected_amount) : 0
  const total = principal + interest + expense

  return {
    client_id: values.client_id,
    lawyer_id: values.lawyer_id || null,
    debtor_party: values.debtor_party.trim() || null,
    client_position: values.client_position || 'creditor',
    enforcement_type_id: values.enforcement_type_id || null,
    status_id: values.status_id || null,
    office_city: values.office_city.trim() || null,
    enforcement_office: values.enforcement_office.trim() || null,
    file_year: values.file_year ? Number(values.file_year) : null,
    file_no: values.file_no.trim() || null,
    uyap_file_kind: values.uyap_file_kind || 'E',
    opened_at: values.opened_at || null,
    principal_amount: principal,
    interest_amount: interest,
    expense_amount: expense,
    collected_amount: collected,
    total_amount: total,
    remaining_amount: Math.max(total - collected, 0),
    currency: values.currency || 'TRY',
    description: values.description.trim() || null,
    notes: values.notes.trim() || null,
  }
}
