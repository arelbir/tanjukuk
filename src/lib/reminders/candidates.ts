import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime, formatMoney } from '@/lib/format'
import type { ReminderCandidate } from '@/features/notifications/types'

interface CandidateScanOptions {
  lookbackMinutes?: number
  lookforwardMinutes?: number
}

const upcomingTypes = ['hearing', 'appointment', 'deadline']

export async function findReminderCandidates(options: CandidateScanOptions = {}): Promise<ReminderCandidate[]> {
  const service = createServiceRoleSupabaseClient()
  const lookbackMinutes = options.lookbackMinutes ?? 60
  const lookforwardMinutes = options.lookforwardMinutes ?? 1440 * 7
  const now = new Date()
  const lookbackDate = new Date(now.getTime() - lookbackMinutes * 60 * 1000)
  const lookforwardDate = new Date(now.getTime() + lookforwardMinutes * 60 * 1000)
  const today = now.toISOString().split('T')[0]
  const nextWeek = lookforwardDate.toISOString().split('T')[0]

  const [eventsResult, overdueTasksResult, dueReceivablesResult, overdueReceivablesResult] = await Promise.all([
    service
      .from('calendar_events')
      .select('id, title, event_type, starts_at, assigned_to, created_by, case_file_id, enforcement_file_id')
      .in('event_type', upcomingTypes)
      .eq('is_completed', false)
      .gte('starts_at', lookbackDate.toISOString())
      .lte('starts_at', lookforwardDate.toISOString())
      .order('starts_at', { ascending: true }),
    service
      .from('calendar_events')
      .select('id, title, event_type, starts_at, assigned_to, created_by, case_file_id, enforcement_file_id')
      .eq('event_type', 'task')
      .eq('is_completed', false)
      .lt('starts_at', now.toISOString())
      .order('starts_at', { ascending: true })
      .limit(100),
    service
      .from('receivables')
      .select('id, client_id, due_date, expected_amount, remaining_amount, currency, description, created_by, case_file_id, enforcement_file_id')
      .in('status', ['pending', 'partial'])
      .gte('due_date', today)
      .lte('due_date', nextWeek)
      .is('cancelled_at', null)
      .order('due_date', { ascending: true }),
    service
      .from('receivables')
      .select('id, client_id, due_date, expected_amount, remaining_amount, currency, description, created_by, case_file_id, enforcement_file_id')
      .in('status', ['pending', 'partial'])
      .lt('due_date', today)
      .is('cancelled_at', null)
      .order('due_date', { ascending: true })
      .limit(100),
  ])

  if (eventsResult.error) throw eventsResult.error
  if (overdueTasksResult.error) throw overdueTasksResult.error
  if (dueReceivablesResult.error) throw dueReceivablesResult.error
  if (overdueReceivablesResult.error) throw overdueReceivablesResult.error

  const candidates: ReminderCandidate[] = []

  for (const event of eventsResult.data || []) {
    const userId = event.assigned_to || event.created_by
    if (!userId) continue

    const kind = event.event_type === 'hearing' ? 'hearing' : event.event_type === 'appointment' ? 'appointment' : 'deadline'
    const title = kind === 'hearing' ? 'Yaklaşan duruşma' : kind === 'appointment' ? 'Yaklaşan randevu' : 'Yaklaşan son tarih'

    candidates.push({
      key: `calendar:${event.id}:${kind}:upcoming`,
      userId,
      title,
      message: `${event.title} • ${formatDateTime(event.starts_at)}`,
      type: kind,
      entityType: 'calendar_event',
      entityId: event.id,
      linkUrl: '/calendar',
    })
  }

  for (const event of overdueTasksResult.data || []) {
    const userId = event.assigned_to || event.created_by
    if (!userId) continue

    candidates.push({
      key: `calendar:${event.id}:task:overdue`,
      userId,
      title: 'Gecikmiş görev',
      message: `${event.title} • Son tarih: ${formatDateTime(event.starts_at)}`,
      type: 'task',
      entityType: 'calendar_event',
      entityId: event.id,
      linkUrl: '/calendar',
    })
  }

  for (const receivable of dueReceivablesResult.data || []) {
    if (!receivable.created_by) continue

    candidates.push({
      key: `receivable:${receivable.id}:due`,
      userId: receivable.created_by,
      title: 'Vadesi gelen ödeme',
      message: `${receivable.description || 'Beklenen ödeme'} • ${formatDate(receivable.due_date)} • ${formatMoney(receivable.remaining_amount, { currency: receivable.currency })}`,
      type: 'payment',
      entityType: 'receivable',
      entityId: receivable.id,
      linkUrl: '/finance',
    })
  }

  for (const receivable of overdueReceivablesResult.data || []) {
    if (!receivable.created_by) continue

    candidates.push({
      key: `receivable:${receivable.id}:overdue`,
      userId: receivable.created_by,
      title: 'Vadesi geçmiş ödeme',
      message: `${receivable.description || 'Beklenen ödeme'} • Vade: ${formatDate(receivable.due_date)} • ${formatMoney(receivable.remaining_amount, { currency: receivable.currency })}`,
      type: 'payment',
      entityType: 'receivable',
      entityId: receivable.id,
      linkUrl: '/finance',
    })
  }

  return candidates
}

export async function checkNotificationExists(candidate: ReminderCandidate): Promise<boolean> {
  const service = createServiceRoleSupabaseClient()
  const { data, error } = await service
    .from('notifications')
    .select('id')
    .eq('user_id', candidate.userId)
    .eq('entity_type', candidate.entityType)
    .eq('entity_id', candidate.entityId)
    .eq('type', candidate.type)
    .eq('title', candidate.title)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}
