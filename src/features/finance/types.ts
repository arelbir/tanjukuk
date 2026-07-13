import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.generated'

export type ReceivableRow = Tables<'receivables'>
export type ReceivableInsert = TablesInsert<'receivables'>
export type ReceivableUpdate = TablesUpdate<'receivables'>
export type PaymentRow = Tables<'payments'>
export type PaymentInsert = TablesInsert<'payments'>
export type ExpenseRow = Tables<'expenses'>
export type ExpenseInsert = TablesInsert<'expenses'>

export type FinanceStatusFilter = 'all' | 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
export type FinanceScopeFilter = 'all' | 'case_file' | 'enforcement_file' | 'standalone'

export interface FinanceListFilters {
  search?: string
  status?: FinanceStatusFilter
  scope?: FinanceScopeFilter
  clientId?: string
  categoryId?: string
  dateFrom?: string
  dateTo?: string
}

export interface FinanceRelation {
  id: string
  label?: string | null
  name?: string | null
  file_code?: string | null
  opposing_party?: string | null
  debtor_party?: string | null
}

export interface ReceivableListItem extends ReceivableRow {
  client?: FinanceRelation | null
  category?: FinanceRelation | null
  case_file?: FinanceRelation | null
  enforcement_file?: FinanceRelation | null
  payments?: PaymentRow[] | null
}

export interface PaymentListItem extends PaymentRow {
  client?: FinanceRelation | null
  category?: FinanceRelation | null
  payment_method?: FinanceRelation | null
  receivable?: Pick<ReceivableRow, 'id' | 'expected_amount' | 'status'> | null
  case_file?: FinanceRelation | null
  enforcement_file?: FinanceRelation | null
}

export interface ExpenseListItem extends ExpenseRow {
  category?: FinanceRelation | null
  sub_category?: FinanceRelation | null
  payment_method?: FinanceRelation | null
  case_file?: FinanceRelation | null
  enforcement_file?: FinanceRelation | null
  created_by_profile?: FinanceRelation | null
}

export interface FinanceSummary {
  expectedTotal: number
  paidTotal: number
  remainingTotal: number
  overdueTotal: number
  paymentTotal: number
  expenseTotal: number
  reimbursableExpenseTotal: number
}

export interface FinanceFormOptions {
  clients: { id: string; label: string }[]
  caseFiles: { id: string; label: string; client_id: string }[]
  enforcementFiles: { id: string; label: string; client_id: string }[]
  receivables: { id: string; label: string; client_id: string; case_file_id?: string | null; enforcement_file_id?: string | null }[]
  paymentCategories: { id: string; label: string }[]
  expenseCategories: { id: string; label: string; parent_id?: string | null }[]
  paymentMethods: { id: string; label: string }[]
}

export interface ReceivableFormValues {
  client_id: string
  category_id: string
  case_file_id: string
  enforcement_file_id: string
  due_date: string
  expected_amount: string
  currency: string
  description: string
}

export interface PaymentFormValues {
  client_id: string
  receivable_id: string
  category_id: string
  payment_method_id: string
  case_file_id: string
  enforcement_file_id: string
  payment_date: string
  amount: string
  currency: string
  description: string
}

export interface ExpenseFormValues {
  scope: string
  category_id: string
  sub_category_id: string
  payment_method_id: string
  case_file_id: string
  enforcement_file_id: string
  expense_date: string
  amount: string
  currency: string
  is_billable_to_client: boolean
  document_ref: string
  description: string
}
