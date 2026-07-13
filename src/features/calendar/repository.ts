import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'
import type { CalendarEventFilters, CalendarEventFormValues, CalendarEventListItem, CalendarFormOptions } from './types'

export type TypedSupabaseClient = SupabaseClient<Database>

export async function listCalendarEvents(
  supabase: TypedSupabaseClient,
  filters: CalendarEventFilters = {}
): Promise<CalendarEventListItem[]> {
  let query = supabase
    .from('calendar_events')
    .select(`
      *,
      assigned_profile:profiles!calendar_events_assigned_to_fkey(id, full_name, email),
      creator:profiles!calendar_events_created_by_fkey(id, full_name, email),
      client:clients(id, name, client_code),
      case_file:case_files(id, file_code, opposing_party),
      enforcement_file:enforcement_files(id, file_code, debtor_party),
      hearing_detail:hearing_details(*)
    `)
    .order('starts_at', { ascending: true })
    .limit(500)

  if (filters.from) query = query.gte('starts_at', filters.from)
  if (filters.to) query = query.lte('starts_at', filters.to)
  if (filters.eventType && filters.eventType !== 'all') query = query.eq('event_type', filters.eventType)
  if (filters.assignedTo && filters.assignedTo !== 'all') query = query.eq('assigned_to', filters.assignedTo)
  if (filters.completed === 'open') query = query.eq('is_completed', false)
  if (filters.completed === 'completed') query = query.eq('is_completed', true)
  if (filters.entity === 'case_file') query = query.not('case_file_id', 'is', null)
  if (filters.entity === 'enforcement_file') query = query.not('enforcement_file_id', 'is', null)
  if (filters.entity === 'standalone') query = query.is('case_file_id', null).is('enforcement_file_id', null)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as CalendarEventListItem[]
}

export async function getCalendarEventById(supabase: TypedSupabaseClient, id: string): Promise<CalendarEventListItem | null> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select(`
      *,
      assigned_profile:profiles!calendar_events_assigned_to_fkey(id, full_name, email),
      creator:profiles!calendar_events_created_by_fkey(id, full_name, email),
      client:clients(id, name, client_code),
      case_file:case_files(id, file_code, opposing_party),
      enforcement_file:enforcement_files(id, file_code, debtor_party),
      hearing_detail:hearing_details(*)
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as CalendarEventListItem | null
}

export async function getCalendarFormOptions(supabase: TypedSupabaseClient): Promise<CalendarFormOptions> {
  const [usersResult, clientsResult, caseFilesResult, enforcementFilesResult] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email').eq('is_active', true).order('full_name'),
    supabase.from('clients').select('id, name, client_code').eq('is_active', true).order('name'),
    supabase.from('case_files').select('id, file_code, opposing_party, client_id').eq('is_archived', false).order('created_at', { ascending: false }).limit(300),
    supabase.from('enforcement_files').select('id, file_code, debtor_party, client_id').eq('is_archived', false).order('created_at', { ascending: false }).limit(300),
  ])

  if (usersResult.error) throw usersResult.error
  if (clientsResult.error) throw clientsResult.error
  if (caseFilesResult.error) throw caseFilesResult.error
  if (enforcementFilesResult.error) throw enforcementFilesResult.error

  return {
    users: (usersResult.data || []).map((user) => ({ id: user.id, label: user.full_name || user.email || user.id })),
    clients: (clientsResult.data || []).map((client) => ({ id: client.id, label: client.client_code ? `${client.name} (${client.client_code})` : client.name })),
    caseFiles: (caseFilesResult.data || []).map((file) => ({ id: file.id, label: `${file.file_code} - ${file.opposing_party || 'Dava'}`, client_id: file.client_id })),
    enforcementFiles: (enforcementFilesResult.data || []).map((file) => ({ id: file.id, label: `${file.file_code} - ${file.debtor_party || 'İcra'}`, client_id: file.client_id })),
  }
}

export function toCalendarEventPayload(values: CalendarEventFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    event_type: values.event_type,
    starts_at: values.starts_at,
    ends_at: values.ends_at || null,
    is_all_day: values.is_all_day,
    location: values.location.trim() || null,
    priority: values.priority || 'normal',
    reminder_at: values.reminder_at || null,
    assigned_to: values.assigned_to || null,
    client_id: values.client_id || null,
    case_file_id: values.case_file_id || null,
    enforcement_file_id: values.enforcement_file_id || null,
  }
}

export function toHearingDetailPayload(values: CalendarEventFormValues, eventId: string) {
  return {
    event_id: eventId,
    court_room: values.court_room.trim() || null,
    hearing_result: values.hearing_result.trim() || null,
    interim_decision: values.interim_decision.trim() || null,
    next_step: values.next_step.trim() || null,
    next_hearing_at: values.next_hearing_at || null,
  }
}
