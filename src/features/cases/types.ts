import type { Database } from '@/types/database.generated'

export type CaseFileRow = Database['public']['Tables']['case_files']['Row']
export type CaseFileInsert = Database['public']['Tables']['case_files']['Insert']
export type CaseFileUpdate = Database['public']['Tables']['case_files']['Update']

export type CaseArchiveFilter = 'all' | 'active' | 'archived'

export interface CaseFileListFilters {
  search?: string
  lawyerId?: string | 'all'
  statusId?: string | 'all'
  caseTypeId?: string | 'all'
  dateFrom?: string | null
  dateTo?: string | null
  archive?: CaseArchiveFilter
  page?: number
  pageSize?: number
}

export interface CaseFileListItem extends CaseFileRow {
  client?: { id: string; name: string; client_code: string | null } | null
  lawyer?: { id: string; full_name: string | null; email: string | null } | null
  status?: { id: string; label: string } | null
  case_type?: { id: string; label: string } | null
  court_type?: { id: string; label: string } | null
  client_role?: { id: string; label: string } | null
}

export interface CaseFileListResult {
  items: CaseFileListItem[]
  total: number
  page: number
  pageSize: number
}

export type CaseStatusHistoryRow = Database['public']['Tables']['case_status_history']['Row']
export type CalendarEventRow = Database['public']['Tables']['calendar_events']['Row']
export type PaymentRow = Database['public']['Tables']['payments']['Row']
export type ExpenseRow = Database['public']['Tables']['expenses']['Row']
export type DocumentRow = Database['public']['Tables']['documents']['Row']
export type AuditLogRow = Database['public']['Tables']['audit_logs']['Row']

export interface CaseStatusHistoryItem extends CaseStatusHistoryRow {
  old_status?: { id: string; label: string } | null
  new_status?: { id: string; label: string } | null
  changed_by_profile?: { id: string; full_name: string | null; email: string | null } | null
}

export interface CaseFinanceSummary {
  paymentTotal: number
  expenseTotal: number
  billableExpenseTotal: number
  currency: string
}

export interface CaseFileDetailResult {
  caseFile: CaseFileListItem
  statusHistory: CaseStatusHistoryItem[]
  events: CalendarEventRow[]
  payments: PaymentRow[]
  expenses: ExpenseRow[]
  documents: DocumentRow[]
  auditLogs: AuditLogRow[]
  finance: CaseFinanceSummary
}

export interface CaseFileFormValues {
  client_id: string
  lawyer_id: string
  opposing_party: string
  client_role_id: string
  court_city: string
  court_district: string
  court_type_id: string
  court_no: string
  file_year: string
  file_no: string
  uyap_file_kind: string
  case_type_id: string
  status_id: string
  opened_at: string
  case_value: string
  currency: string
  description: string
  notes: string
}
