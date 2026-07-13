import type { Database } from '@/types/database.generated'

export type CalendarEventRow = Database['public']['Tables']['calendar_events']['Row']
export type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert']
export type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update']
export type HearingDetailRow = Database['public']['Tables']['hearing_details']['Row']

export type CalendarViewMode = 'day' | 'week' | 'month'
export type CalendarEntityFilter = 'all' | 'case_file' | 'enforcement_file' | 'standalone'

export interface CalendarEventFilters {
  from?: string | null
  to?: string | null
  eventType?: string | 'all'
  assignedTo?: string | 'all'
  entity?: CalendarEntityFilter
  completed?: 'all' | 'open' | 'completed'
}

export interface CalendarEventListItem extends CalendarEventRow {
  assigned_profile?: { id: string; full_name: string | null; email: string | null } | null
  client?: { id: string; name: string; client_code: string | null } | null
  case_file?: { id: string; file_code: string; opposing_party: string | null } | null
  enforcement_file?: { id: string; file_code: string; debtor_party: string | null } | null
  creator?: { id: string; full_name: string | null; email: string | null } | null
  hearing_detail?: HearingDetailRow | null
}

export interface CalendarFormOptions {
  users: Array<{ id: string; label: string }>
  clients: Array<{ id: string; label: string }>
  caseFiles: Array<{ id: string; label: string; client_id?: string | null }>
  enforcementFiles: Array<{ id: string; label: string; client_id?: string | null }>
}

export interface CalendarEventFormValues {
  title: string
  description: string
  event_type: string
  starts_at: string
  ends_at: string
  is_all_day: boolean
  location: string
  priority: string
  reminder_at: string
  assigned_to: string
  client_id: string
  case_file_id: string
  enforcement_file_id: string
  court_room: string
  hearing_result: string
  interim_decision: string
  next_step: string
  next_hearing_at: string
}
