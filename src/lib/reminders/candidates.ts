// Reminder candidates - finds events that need reminders to be scheduled
import { createClient } from '@/lib/supabase/server'
import { getEffectiveReminderPolicies, EventWithReminders, ReminderOffset } from './policies'

export interface ReminderCandidate {
  eventId: string
  eventTitle: string
  eventType: string
  scheduledAt: string
  assignedUserId: string | null
  policies: Array<{
    offsetMinutes: number
    channel: string
    scheduledFor: string
  }>
}

/**
 * Find events that need reminders to be scheduled
 * @param lookbackMinutes - How many minutes back to look for events that entered reminder window
 * @param lookforwardMinutes - How many minutes forward to look for upcoming events
 */
export async function findReminderCandidates(
  lookbackMinutes: number = 15,
  lookforwardMinutes: number = 1440 * 7 // 7 days
): Promise<ReminderCandidate[]> {
  const supabase = await createClient()

  const now = new Date()
  const lookbackDate = new Date(now.getTime() - lookbackMinutes * 60 * 1000)
  const lookforwardDate = new Date(now.getTime() + lookforwardMinutes * 60 * 1000)

  // Find events that:
  // 1. Are in the reminder window (scheduled between lookback and lookforward)
  // 2. Are not completed
  // 3. Are not cancelled
  const { data: events, error } = await supabase
    .from('events')
    .select('id, event_type, title, scheduled_at, assigned_user_id, reminder_offsets')
    .gte('scheduled_at', lookbackDate.toISOString())
    .lte('scheduled_at', lookforwardDate.toISOString())
    .eq('is_completed', false)
    .is('cancelled_at', null)
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('Error finding reminder candidates:', error)
    return []
  }

  const candidates: ReminderCandidate[] = []

  for (const event of events || []) {
    const eventWithReminders: EventWithReminders = {
      event_type: event.event_type,
      reminder_offsets: event.reminder_offsets as ReminderOffset[] | undefined,
    }

    const policies = getEffectiveReminderPolicies(eventWithReminders)

    // Filter policies that are in the reminder window
    const activePolicies = policies
      .map((policy) => {
        const scheduledFor = new Date(
          new Date(event.scheduled_at).getTime() - policy.offsetMinutes * 60 * 1000
        )
        return {
          ...policy,
          scheduledFor: scheduledFor.toISOString(),
        }
      })
      .filter((policy) => {
        const scheduledFor = new Date(policy.scheduledFor)
        // Check if this reminder time is in the lookback window
        return scheduledFor >= lookbackDate && scheduledFor <= now
      })

    if (activePolicies.length > 0) {
      candidates.push({
        eventId: event.id,
        eventTitle: event.title || event.event_type,
        eventType: event.event_type,
        scheduledAt: event.scheduled_at,
        assignedUserId: event.assigned_user_id,
        policies: activePolicies,
      })
    }
  }

  return candidates
}

/**
 * Check if a reminder delivery already exists for a specific event, user, and offset
 */
export async function checkDeliveryExists(
  eventId: string,
  userId: string,
  offsetMinutes: number,
  channel: string
): Promise<boolean> {
  const supabase = await createClient()

  const dedupeKey = `${eventId}-${userId}-${offsetMinutes}-${channel}`

  const { data, error } = await supabase
    .from('notification_deliveries')
    .select('id')
    .eq('dedupe_key', dedupeKey)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error, which is expected
    console.error('Error checking delivery existence:', error)
  }

  return !!data
}
