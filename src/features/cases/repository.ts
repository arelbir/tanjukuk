import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'
import type {
  CaseFileDetailResult,
  CaseFileFormValues,
  CaseFileListFilters,
  CaseFileListItem,
  CaseFileListResult,
  CaseFileRow,
} from './types'

export interface CaseFileFormOptions {
  clients: Array<{ id: string; label: string }>
  lawyers: Array<{ id: string; label: string }>
}

export type TypedSupabaseClient = SupabaseClient<Database>

function normalizePage(value?: number) {
  return Math.max(1, Number(value) || 1)
}

function normalizePageSize(value?: number) {
  return Math.min(100, Math.max(5, Number(value) || 20))
}

export async function listCaseFiles(
  supabase: TypedSupabaseClient,
  filters: CaseFileListFilters = {}
): Promise<CaseFileListResult> {
  const page = normalizePage(filters.page)
  const pageSize = normalizePageSize(filters.pageSize)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('case_files')
    .select(`
      *,
      client:clients(id, name, client_code),
      lawyer:profiles!case_files_lawyer_id_fkey(id, full_name, email),
      status:lookup_values!case_files_status_id_fkey(id, label),
      case_type:lookup_values!case_files_case_type_id_fkey(id, label),
      court_type:lookup_values!case_files_court_type_id_fkey(id, label),
      client_role:lookup_values!case_files_client_role_id_fkey(id, label)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const search = filters.search?.trim()
  if (search) {
    query = query.or(`file_code.ilike.%${search}%,opposing_party.ilike.%${search}%,file_no.ilike.%${search}%`)
  }

  if (filters.lawyerId && filters.lawyerId !== 'all') {
    query = query.eq('lawyer_id', filters.lawyerId)
  }

  if (filters.statusId && filters.statusId !== 'all') {
    query = query.eq('status_id', filters.statusId)
  }

  if (filters.caseTypeId && filters.caseTypeId !== 'all') {
    query = query.eq('case_type_id', filters.caseTypeId)
  }

  if (filters.dateFrom) {
    query = query.gte('opened_at', filters.dateFrom)
  }

  if (filters.dateTo) {
    query = query.lte('opened_at', filters.dateTo)
  }

  if (filters.archive === 'active') {
    query = query.eq('is_archived', false)
  }

  if (filters.archive === 'archived') {
    query = query.eq('is_archived', true)
  }

  const { data, count, error } = await query
  if (error) throw error

  return {
    items: (data || []) as CaseFileListItem[],
    total: count || 0,
    page,
    pageSize,
  }
}

export async function getCaseFileById(supabase: TypedSupabaseClient, id: string): Promise<CaseFileRow | null> {
  const { data, error } = await supabase.from('case_files').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getCaseFileDetail(supabase: TypedSupabaseClient, id: string): Promise<CaseFileDetailResult | null> {
  const caseQuery = supabase
    .from('case_files')
    .select(`
      *,
      client:clients(id, name, client_code),
      lawyer:profiles!case_files_lawyer_id_fkey(id, full_name, email),
      status:lookup_values!case_files_status_id_fkey(id, label),
      case_type:lookup_values!case_files_case_type_id_fkey(id, label),
      court_type:lookup_values!case_files_court_type_id_fkey(id, label),
      client_role:lookup_values!case_files_client_role_id_fkey(id, label)
    `)
    .eq('id', id)
    .maybeSingle()

  const [caseResult, statusHistoryResult, eventsResult, paymentsResult, expensesResult, documentsResult, auditResult] = await Promise.all([
    caseQuery,
    supabase
      .from('case_status_history')
      .select(`
        *,
        old_status:lookup_values!case_status_history_old_status_id_fkey(id, label),
        new_status:lookup_values!case_status_history_new_status_id_fkey(id, label),
        changed_by_profile:profiles!case_status_history_changed_by_fkey(id, full_name, email)
      `)
      .eq('case_file_id', id)
      .order('changed_at', { ascending: false }),
    supabase.from('calendar_events').select('*').eq('case_file_id', id).order('starts_at', { ascending: true }),
    supabase.from('payments').select('*').eq('case_file_id', id).is('cancelled_at', null).order('payment_date', { ascending: false }),
    supabase.from('expenses').select('*').eq('case_file_id', id).is('cancelled_at', null).order('expense_date', { ascending: false }),
    supabase.from('documents').select('*').eq('entity_type', 'case_file').eq('entity_id', id).is('archived_at', null).order('created_at', { ascending: false }),
    supabase.from('audit_logs').select('*').eq('entity_type', 'case_file').eq('entity_id', id).order('created_at', { ascending: false }).limit(50),
  ])

  if (caseResult.error) throw caseResult.error
  if (!caseResult.data) return null
  if (statusHistoryResult.error) throw statusHistoryResult.error
  if (eventsResult.error) throw eventsResult.error
  if (paymentsResult.error) throw paymentsResult.error
  if (expensesResult.error) throw expensesResult.error
  if (documentsResult.error) throw documentsResult.error
  if (auditResult.error) throw auditResult.error

  const payments = paymentsResult.data || []
  const expenses = expensesResult.data || []
  const currency = caseResult.data.currency || payments[0]?.currency || expenses[0]?.currency || 'TRY'

  return {
    caseFile: caseResult.data as CaseFileListItem,
    statusHistory: statusHistoryResult.data || [],
    events: eventsResult.data || [],
    payments,
    expenses,
    documents: documentsResult.data || [],
    auditLogs: auditResult.data || [],
    finance: {
      paymentTotal: payments.reduce((total, payment) => total + Number(payment.amount || 0), 0),
      expenseTotal: expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0),
      billableExpenseTotal: expenses.reduce((total, expense) => total + (expense.is_billable_to_client ? Number(expense.amount || 0) : 0), 0),
      currency,
    },
  }
}

export async function getCaseFileFormOptions(supabase: TypedSupabaseClient): Promise<CaseFileFormOptions> {
  const [clientsResult, lawyersResult] = await Promise.all([
    supabase.from('clients').select('id, name, client_code').eq('is_active', true).order('name'),
    supabase.from('profiles').select('id, full_name, email').eq('role', 'lawyer').eq('is_active', true).order('full_name'),
  ])

  if (clientsResult.error) throw clientsResult.error
  if (lawyersResult.error) throw lawyersResult.error

  return {
    clients: (clientsResult.data || []).map((client) => ({
      id: client.id,
      label: client.client_code ? `${client.name} (${client.client_code})` : client.name,
    })),
    lawyers: (lawyersResult.data || []).map((lawyer) => ({
      id: lawyer.id,
      label: lawyer.full_name || lawyer.email || lawyer.id,
    })),
  }
}

export async function updateCaseFileRecord(
  supabase: TypedSupabaseClient,
  id: string,
  values: CaseFileFormValues
): Promise<CaseFileRow> {
  const { data, error } = await supabase.from('case_files').update(toCaseFilePayload(values)).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

export async function archiveCaseFileRecord(
  supabase: TypedSupabaseClient,
  id: string,
  userId: string,
  isArchived: boolean
): Promise<CaseFileRow> {
  const { data, error } = await supabase
    .from('case_files')
    .update({
      is_archived: isArchived,
      archived_at: isArchived ? new Date().toISOString() : null,
      archived_by: isArchived ? userId : null,
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export function toCaseFilePayload(values: CaseFileFormValues) {
  return {
    client_id: values.client_id,
    lawyer_id: values.lawyer_id || null,
    opposing_party: values.opposing_party.trim() || null,
    client_role_id: values.client_role_id || null,
    court_city: values.court_city.trim() || null,
    court_district: values.court_district.trim() || null,
    court_type_id: values.court_type_id || null,
    court_no: values.court_no.trim() || null,
    file_year: values.file_year ? Number(values.file_year) : null,
    file_no: values.file_no.trim() || null,
    uyap_file_kind: values.uyap_file_kind || 'E',
    case_type_id: values.case_type_id || null,
    status_id: values.status_id || null,
    opened_at: values.opened_at || null,
    case_value: values.case_value ? Number(values.case_value) : null,
    currency: values.currency || 'TRY',
    description: values.description.trim() || null,
    notes: values.notes.trim() || null,
  }
}
