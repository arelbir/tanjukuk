export type EntityType = 'Gerçek Kişi' | 'Tüzel Kişi'
export type Currency = 'TRY' | 'USD' | 'EUR'

export interface Case {
  id: string
  case_code: string
  lawyer_id: string
  client_id: string
  opposing_party: string
  client_role_id: string | null
  entity_type: EntityType | string
  court_city: string | null
  court_district: string | null
  court_no: number | null
  court_type_id: string | null
  file_year: number | null
  file_no: string | null
  file_type_id: string | null
  case_type_id: string | null
  status_id: string | null
  opened_at: string
  closed_at: string | null
  next_hearing_at: string | null
  case_value: number
  currency: Currency | string
  lean_against: string | null
  verdict_result: string | null
  verdict_for: number | null
  verdict_against: number | null
  old_court_info: string | null
  description: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
  lawyer?: { full_name: string }
  client?: { name: string; type: string }
  case_type?: { label: string }
  status?: { label: string }
  court_type?: { label: string }
  file_type?: { label: string }
  client_role?: { label: string }
}

export interface CaseFilters {
  search: string
  statusFilter: string | null
  lawyerFilter: string | null
  page: number
}

export const DEFAULT_FILTERS: CaseFilters = {
  search: '',
  statusFilter: 'all',
  lawyerFilter: 'all',
  page: 1,
}

export const LEAN_COLORS: Record<string, string> = {
  L: 'bg-green-100 border-l-green-500',
  A: 'bg-red-100 border-l-red-500',
  K: 'bg-yellow-100 border-l-yellow-500',
}

export const LEAN_LABELS: Record<string, string> = {
  L: 'Lehe',
  A: 'Aleyhe',
  K: 'Kısmen',
}