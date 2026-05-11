// Reminder dispatch - creates notification deliveries and sends notifications
import { createClient } from '@/lib/supabase/server'
import { ReminderCandidate } from './candidates'
import { checkDeliveryExists } from './candidates'
import { sendPushNotificationToUser, PushPayload } from '@/lib/push/send'

export interface DispatchResult {
  success: boolean
  deliveryId?: string
  notificationId?: string
  error?: string
}

export interface BatchDispatchResult {
  total: number
  created: number
  duplicates: number
  failed: number
  errors: Array<{ eventId: string; error: string }>
}

/**
 * Create a notification delivery record
 */
async function createDelivery(
  eventId: string,
  userId: string,
  offsetMinutes: number,
  channel: string,
  scheduledFor: string,
  notificationId?: string
): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notification_deliveries')
    .insert({
      notification_id: notificationId || null,
      channel,
      status: 'pending',
      metadata: {
        event_id: eventId,
        user_id: userId,
        offset_minutes: offsetMinutes,
        scheduled_for: scheduledFor,
      },
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating delivery:', error)
    return null
  }

  return data.id
}

/**
 * Create an in-app notification linked to a delivery
 */
async function createInAppNotification(
  userId: string,
  title: string,
  message: string,
  eventType: string,
  eventId: string
): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type: eventType,
      entity_id: eventId,
      entity_type: 'event',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    return null
  }

  return data.id
}

/**
 * Dispatch a single reminder
 */
export async function dispatchReminder(
  candidate: ReminderCandidate,
  policy: { offsetMinutes: number; channel: string; scheduledFor: string }
): Promise<DispatchResult> {
  if (!candidate.assignedUserId) {
    return {
      success: false,
      error: 'No assigned user for this event',
    }
  }

  // Check if delivery already exists (dedupe)
  const exists = await checkDeliveryExists(
    candidate.eventId,
    candidate.assignedUserId,
    policy.offsetMinutes,
    policy.channel
  )

  if (exists) {
    return {
      success: false,
      error: 'Delivery already exists',
    }
  }

  // Generate notification content
  const eventDate = new Date(candidate.scheduledAt)
  const timeUntilEvent = policy.offsetMinutes

  let timeText = ''
  if (timeUntilEvent >= 1440) {
    timeText = `${Math.floor(timeUntilEvent / 1440)} gün sonra`
  } else if (timeUntilEvent >= 60) {
    timeText = `${Math.floor(timeUntilEvent / 60)} saat sonra`
  } else {
    timeText = `${timeUntilEvent} dakika sonra`
  }

  const title = `${candidate.eventType === 'hearing' ? 'Duruşma' : 'Etkinlik'} Hatırlatması`
  const message = `${candidate.eventTitle} - ${eventDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })} (${timeText})`

  // Create in-app notification
  if (policy.channel === 'in_app') {
    const notificationId = await createInAppNotification(
      candidate.assignedUserId,
      title,
      message,
      candidate.eventType,
      candidate.eventId
    )

    if (!notificationId) {
      return {
        success: false,
        error: 'Failed to create notification',
      }
    }

    const deliveryId = await createDelivery(
      candidate.eventId,
      candidate.assignedUserId,
      policy.offsetMinutes,
      policy.channel,
      policy.scheduledFor,
      notificationId
    )

    if (!deliveryId) {
      return {
        success: false,
        error: 'Failed to create delivery',
      }
    }

    const supabase = await createClient()
    await supabase
      .from('notification_deliveries')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', deliveryId)

    return {
      success: true,
      deliveryId,
      notificationId,
    }
  }

  // Send push notification
  if (policy.channel === 'push') {
    const deliveryId = await createDelivery(
      candidate.eventId,
      candidate.assignedUserId,
      policy.offsetMinutes,
      policy.channel,
      policy.scheduledFor
    )

    if (!deliveryId) {
      return {
        success: false,
        error: 'Failed to create delivery',
      }
    }

    const pushPayload: PushPayload = {
      title,
      body: message,
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      data: {
        eventId: candidate.eventId,
        eventType: candidate.eventType,
        scheduledAt: candidate.scheduledAt,
      },
      actions: [
        {
          action: 'view',
          title: 'Görüntüle',
          icon: '/icon-192.png',
        },
      ],
    }

    const pushResult = await sendPushNotificationToUser(candidate.assignedUserId, pushPayload)

    if (pushResult.sent > 0) {
      const supabase = await createClient()
      await supabase
        .from('notification_deliveries')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', deliveryId)

      return {
        success: true,
        deliveryId,
      }
    } else {
      const supabase = await createClient()
      await supabase
        .from('notification_deliveries')
        .update({ status: 'failed', error_message: 'Push notification failed' })
        .eq('id', deliveryId)

      return {
        success: false,
        error: 'Push notification failed',
      }
    }
  }

  // TODO: Add email, SMS dispatch here
  return {
    success: false,
    error: `${policy.channel} channel is not implemented`,
  }
}

/**
 * Batch dispatch reminders for multiple candidates
 */
export async function batchDispatchReminders(
  candidates: ReminderCandidate[]
): Promise<BatchDispatchResult> {
  const result: BatchDispatchResult = {
    total: 0,
    created: 0,
    duplicates: 0,
    failed: 0,
    errors: [],
  }

  for (const candidate of candidates) {
    for (const policy of candidate.policies) {
      result.total++

      const dispatchResult = await dispatchReminder(candidate, policy)

      if (dispatchResult.success) {
        result.created++
      } else if (dispatchResult.error === 'Delivery already exists') {
        result.duplicates++
      } else {
        result.failed++
        result.errors.push({
          eventId: candidate.eventId,
          error: dispatchResult.error || 'Unknown error',
        })
      }
    }
  }

  return result
}
