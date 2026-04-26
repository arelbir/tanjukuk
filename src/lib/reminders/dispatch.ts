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
  scheduledFor: string
): Promise<string | null> {
  const supabase = await createClient()

  const dedupeKey = `${eventId}-${userId}-${offsetMinutes}-${channel}`

  const { data, error } = await supabase
    .from('notification_deliveries')
    .insert({
      scheduled_item_id: eventId,
      recipient_user_id: userId,
      channel,
      offset_minutes: offsetMinutes,
      scheduled_for: scheduledFor,
      dedupe_key: dedupeKey,
      status: 'pending',
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
  deliveryId: string,
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
      delivery_id: deliveryId,
      title,
      message,
      type: eventType,
      entity_id: eventId,
      entity_type: 'event',
      channel: 'in_app',
      metadata: {
        event_type: eventType,
      },
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

  // Create delivery record
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
      deliveryId,
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

    // Update delivery status to sent
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
      // Update delivery status to sent
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
      // Update delivery status to failed
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
    success: true,
    deliveryId,
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
