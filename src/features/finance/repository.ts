import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'
import type {
  ExpenseFormValues,
  ExpenseListItem,
  FinanceFormOptions,
  FinanceListFilters,
  FinanceSummary,
  PaymentFormValues,
  PaymentListItem,
  ReceivableFormValues,
  ReceivableListItem,
} from './types'

export type TypedSupabaseClient = SupabaseClient<Database>

function applyFinanceFilters<T extends { ilike: (column: string, pattern: string) => T; eq: (column: string, value: string) => T; gte: (column: string, value: string) => T; lte: (column: string, value: string) => T }>(query: T, filters: FinanceListFilters) {
  let next = query
  if (filters.clientId && filters.clientId !== 'all') next = next.eq('client_id', filters.clientId)
  if (filters.categoryId && filters.categoryId !== 'all') next = next.eq('category_id', filters.categoryId)
  if (filters.dateFrom) next = next.gte('due_date', filters.dateFrom)
  if (filters.dateTo) next = next.lte('due_date', filters.dateTo)
  return next
}

export async function listReceivables(supabase: TypedSupabaseClient, filters: FinanceListFilters = {}) {
  let query = supabase
    .from('receivables')
    .select(
      `*,
      client:clients(id, name),
      category:lookup_values!receivables_category_id_fkey(id, label),
      case_file:case_files(id, file_code, opposing_party),
      enforcement_file:enforcement_files(id, file_code, debtor_party),
      payments(*)`
    )
    .is('cancelled_at', null)
    .order('due_date', { ascending: true, nullsFirst: false })

  query = applyFinanceFilters(query, filters)
  if (filters.search) query = query.or(`description.ilike.%${filters.search}%`)
  if (filters.status && !['all', 'overdue', 'cancelled'].includes(filters.status)) query = query.eq('status', filters.status)
  if (filters.status === 'cancelled') query = query.not('cancelled_at', 'is', null)
  if (filters.scope === 'case_file') query = query.not('case_file_id', 'is', null)
  if (filters.scope === 'enforcement_file') query = query.not('enforcement_file_id', 'is', null)
  if (filters.scope === 'standalone') query = query.is('case_file_id', null).is('enforcement_file_id', null)

  const { data, error } = await query
  if (error) throw error

  const rows = (data || []) as ReceivableListItem[]
  if (filters.status === 'overdue') {
    const today = new Date().toISOString().split('T')[0]
    return rows.filter((item) => item.status !== 'paid' && !!item.due_date && item.due_date < today)
  }

  return rows
}

export async function listPayments(supabase: TypedSupabaseClient, filters: FinanceListFilters = {}) {
  let query = supabase
    .from('payments')
    .select(
      `*,
      client:clients(id, name),
      category:lookup_values!payments_category_id_fkey(id, label),
      payment_method:lookup_values!payments_payment_method_id_fkey(id, label),
      receivable:receivables(id, expected_amount, status),
      case_file:case_files(id, file_code, opposing_party),
      enforcement_file:enforcement_files(id, file_code, debtor_party)`
    )
    .is('cancelled_at', null)
    .order('payment_date', { ascending: false })

  if (filters.clientId && filters.clientId !== 'all') query = query.eq('client_id', filters.clientId)
  if (filters.categoryId && filters.categoryId !== 'all') query = query.eq('category_id', filters.categoryId)
  if (filters.dateFrom) query = query.gte('payment_date', filters.dateFrom)
  if (filters.dateTo) query = query.lte('payment_date', filters.dateTo)
  if (filters.search) query = query.or(`description.ilike.%${filters.search}%`)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as PaymentListItem[]
}

export async function listExpenses(supabase: TypedSupabaseClient, filters: FinanceListFilters = {}) {
  let query = supabase
    .from('expenses')
    .select(
      `*,
      category:lookup_values!expenses_category_id_fkey(id, label),
      sub_category:lookup_values!expenses_sub_category_id_fkey(id, label),
      payment_method:lookup_values!expenses_payment_method_id_fkey(id, label),
      case_file:case_files(id, file_code, opposing_party),
      enforcement_file:enforcement_files(id, file_code, debtor_party),
      created_by_profile:profiles!expenses_created_by_fkey(id, full_name, email)`
    )
    .is('cancelled_at', null)
    .order('expense_date', { ascending: false })

  if (filters.categoryId && filters.categoryId !== 'all') query = query.eq('category_id', filters.categoryId)
  if (filters.dateFrom) query = query.gte('expense_date', filters.dateFrom)
  if (filters.dateTo) query = query.lte('expense_date', filters.dateTo)
  if (filters.search) query = query.or(`description.ilike.%${filters.search}%,document_ref.ilike.%${filters.search}%`)
  if (filters.scope && filters.scope !== 'all') query = query.eq('scope', filters.scope)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as ExpenseListItem[]
}

export async function getFinanceSummary(supabase: TypedSupabaseClient): Promise<FinanceSummary> {
  const [receivables, payments, expenses] = await Promise.all([listReceivables(supabase), listPayments(supabase), listExpenses(supabase)])
  const today = new Date().toISOString().split('T')[0]

  return {
    expectedTotal: receivables.reduce((sum, item) => sum + Number(item.expected_amount || 0), 0),
    paidTotal: receivables.reduce((sum, item) => sum + Number(item.paid_amount || 0), 0),
    remainingTotal: receivables.reduce((sum, item) => sum + Number(item.remaining_amount || 0), 0),
    overdueTotal: receivables.filter((item) => item.status !== 'paid' && !!item.due_date && item.due_date < today).reduce((sum, item) => sum + Number(item.remaining_amount || 0), 0),
    paymentTotal: payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    expenseTotal: expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    reimbursableExpenseTotal: expenses.filter((item) => item.is_billable_to_client && !item.is_reimbursed).reduce((sum, item) => sum + Number(item.amount || 0), 0),
  }
}

export async function getFinanceFormOptions(supabase: TypedSupabaseClient): Promise<FinanceFormOptions> {
  const [clientsRes, caseFilesRes, enforcementFilesRes, receivablesRes, paymentCategoriesRes, expenseCategoriesRes, paymentMethodsRes] = await Promise.all([
    supabase.from('clients').select('id, name').eq('is_active', true).order('name'),
    supabase.from('case_files').select('id, file_code, opposing_party, client_id').eq('is_archived', false).order('file_code'),
    supabase.from('enforcement_files').select('id, file_code, debtor_party, client_id').eq('is_archived', false).order('file_code'),
    supabase.from('receivables').select('id, expected_amount, remaining_amount, client_id, case_file_id, enforcement_file_id').is('cancelled_at', null).neq('status', 'paid').order('due_date'),
    supabase.from('lookup_values').select('id, label').eq('group_key', 'payment_category').eq('is_active', true).order('label'),
    supabase.from('lookup_values').select('id, label, parent_id').eq('group_key', 'expense_category').eq('is_active', true).order('label'),
    supabase.from('lookup_values').select('id, label').eq('group_key', 'payment_method').eq('is_active', true).order('label'),
  ])

  return {
    clients: (clientsRes.data || []).map((item) => ({ id: item.id, label: item.name })),
    caseFiles: (caseFilesRes.data || []).map((item) => ({ id: item.id, label: `${item.file_code} - ${item.opposing_party || 'Dava'}`, client_id: item.client_id })),
    enforcementFiles: (enforcementFilesRes.data || []).map((item) => ({ id: item.id, label: `${item.file_code} - ${item.debtor_party || 'İcra'}`, client_id: item.client_id })),
    receivables: (receivablesRes.data || []).map((item) => ({
      id: item.id,
      label: `${Number(item.remaining_amount || item.expected_amount).toLocaleString('tr-TR')} TRY kalan ödeme`,
      client_id: item.client_id,
      case_file_id: item.case_file_id,
      enforcement_file_id: item.enforcement_file_id,
    })),
    paymentCategories: paymentCategoriesRes.data || [],
    expenseCategories: expenseCategoriesRes.data || [],
    paymentMethods: paymentMethodsRes.data || [],
  }
}

export function toReceivablePayload(values: ReceivableFormValues) {
  return {
    client_id: values.client_id,
    category_id: values.category_id || null,
    case_file_id: values.case_file_id || null,
    enforcement_file_id: values.enforcement_file_id || null,
    due_date: values.due_date || null,
    expected_amount: Number(values.expected_amount),
    remaining_amount: Number(values.expected_amount),
    currency: values.currency || 'TRY',
    description: values.description.trim() || null,
  }
}

export function toPaymentPayload(values: PaymentFormValues) {
  return {
    client_id: values.client_id,
    receivable_id: values.receivable_id || null,
    category_id: values.category_id || null,
    payment_method_id: values.payment_method_id || null,
    case_file_id: values.case_file_id || null,
    enforcement_file_id: values.enforcement_file_id || null,
    payment_date: values.payment_date,
    amount: Number(values.amount),
    currency: values.currency || 'TRY',
    description: values.description.trim() || null,
  }
}

export function toExpensePayload(values: ExpenseFormValues) {
  return {
    scope: values.scope,
    category_id: values.category_id || null,
    sub_category_id: values.sub_category_id || null,
    payment_method_id: values.payment_method_id || null,
    case_file_id: values.case_file_id || null,
    enforcement_file_id: values.enforcement_file_id || null,
    expense_date: values.expense_date,
    amount: Number(values.amount),
    currency: values.currency || 'TRY',
    is_billable_to_client: values.is_billable_to_client,
    document_ref: values.document_ref.trim() || null,
    description: values.description.trim() || null,
  }
}
