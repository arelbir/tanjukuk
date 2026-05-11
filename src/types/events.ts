export type EventType = 'hearing' | 'activity'

export interface Event {
  id: string
  case_id: string
  event_type: EventType
  title: string | null
  description: string | null
  event_type_id: string | null
  scheduled_at: string
  duration_minutes: number
  location: string | null
  lawyer_id: string | null
  is_completed: boolean
  completed_at: string | null
  created_by: string | null
  custom_fields: Record<string, unknown>
  created_at: string
  updated_at: string
  case?: {
    file_year: number | null
    file_no: number | null
    client: {
      name: string | null
    } | null
  } | null
  lawyer?: {
    id: string
    full_name: string
  } | null
  event_type_lookup?: {
    label: string
  } | null
}
