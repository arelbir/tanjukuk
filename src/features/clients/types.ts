import type { Database } from '@/types/database.generated'

export type ClientRow = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

export type ClientType = 'individual' | 'company'
export type ClientStatusFilter = 'all' | 'active' | 'inactive'

export interface ClientListFilters {
  search?: string
  type?: ClientType | 'all'
  status?: ClientStatusFilter
  page?: number
  pageSize?: number
}

export interface ClientListResult {
  items: ClientRow[]
  total: number
  page: number
  pageSize: number
}

export interface ClientCaseSummary {
  id: string
  file_code: string
  opposing_party: string | null
  opened_at: string | null
  is_archived: boolean
  case_value: number | null
  currency: string
}

export interface ClientEnforcementSummary {
  id: string
  file_code: string
  debtor_party: string | null
  opened_at: string | null
  is_archived: boolean
  total_amount: number
  remaining_amount: number
  currency: string
}

export interface ClientFinanceSummary {
  receivableTotal: number
  receivableRemaining: number
  expenseTotal: number
  currency: string
}

export interface ClientDetailResult {
  client: ClientRow | null
  cases: ClientCaseSummary[]
  enforcements: ClientEnforcementSummary[]
  finance: ClientFinanceSummary
}

export interface ClientFormValues {
  name: string
  type: ClientType
  phone: string
  email: string
  tax_number: string
  national_id: string
  company_representative: string
  address: string
  notes: string
  is_active: boolean
}
