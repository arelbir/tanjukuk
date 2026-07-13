import type { Database } from '@/types/database.generated'

export type EnforcementFileRow = Database['public']['Tables']['enforcement_files']['Row']
export type EnforcementFileInsert = Database['public']['Tables']['enforcement_files']['Insert']
export type EnforcementFileUpdate = Database['public']['Tables']['enforcement_files']['Update']
export type EnforcementStatusHistoryRow = Database['public']['Tables']['enforcement_status_history']['Row']
export type CalendarEventRow = Database['public']['Tables']['calendar_events']['Row']
export type PaymentRow = Database['public']['Tables']['payments']['Row']
export type ExpenseRow = Database['public']['Tables']['expenses']['Row']
export type DocumentRow = Database['public']['Tables']['documents']['Row']
export type AuditLogRow = Database['public']['Tables']['audit_logs']['Row']

export type EnforcementArchiveFilter = 'all' | 'active' | 'archived'

export interface EnforcementFileListFilters {
  search?: string
  lawyerId?: string | 'all'
  statusId?: string | 'all'
  enforcementTypeId?: string | 'all'
  dateFrom?: string | null
  dateTo?: string | null
  archive?: EnforcementArchiveFilter
  page?: number
  pageSize?: number
}

export interface EnforcementFileListItem extends EnforcementFileRow {
  client?: { id: string; name: string; client_code: string | null } | null
  lawyer?: { id: string; full_name: string | null; email: string | null } | null
  status?: { id: string; label: string } | null
  enforcement_type?: { id: string; label: string } | null
}

export interface EnforcementFileListResult {
  items: EnforcementFileListItem[]
  total: number
  page: number
  pageSize: number
}

export interface EnforcementStatusHistoryItem extends EnforcementStatusHistoryRow {
  old_status?: { id: string; label: string } | null
  new_status?: { id: string; label: string } | null
  changed_by_profile?: { id: string; full_name: string | null; email: string | null } | null
}

export interface EnforcementFinanceSummary {
  collectedTotal: number
  expenseTotal: number
  remainingAmount: number
  currency: string
}

export interface EnforcementFileDetailResult {
  enforcementFile: EnforcementFileListItem
  statusHistory: EnforcementStatusHistoryItem[]
  events: CalendarEventRow[]
  payments: PaymentRow[]
  expenses: ExpenseRow[]
  documents: DocumentRow[]
  auditLogs: AuditLogRow[]
  finance: EnforcementFinanceSummary
}

export interface EnforcementFileFormValues {
  client_id: string
  lawyer_id: string
  debtor_party: string
  client_position: string
  enforcement_type_id: string
  status_id: string
  office_city: string
  enforcement_office: string
  file_year: string
  file_no: string
  opened_at: string
  principal_amount: string
  interest_amount: string
  expense_amount: string
  collected_amount: string
  currency: string
  description: string
  notes: string
}
