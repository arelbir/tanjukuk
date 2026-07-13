import webpush from 'web-push'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Configure VAPID lazily so the app can boot without push envs
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateVapidKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:no-reply@example.com'

function ensurePushConfigured() {
  if (!publicVapidKey || !privateVapidKey) {
    return false
  }

  webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey)
  return true
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, unknown>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  if (!ensurePushConfigured()) {
    return { success: false, error: 'Push is not configured' }
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)

    // Check if subscription is invalid/expired
    if (error instanceof Error && error.message.includes('410')) {
      return { success: false, error: 'Subscription expired' }
    }

    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Send push notification to all subscriptions for a user
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number; expired: number }> {
  const supabase = await createServerSupabaseClient()

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching subscriptions:', error)
    return { sent: 0, failed: 0, expired: 0 }
  }

  let sent = 0
  let failed = 0
  let expired = 0

  for (const sub of subscriptions || []) {
    const subscription: PushSubscription = {
      endpoint: sub.endpoint,
      keys: sub.keys,
    }

    const result = await sendPushNotification(subscription, payload)

    if (result.success) {
      sent++
    } else if (result.error === 'Subscription expired') {
      expired++
      // Delete expired subscription
      await supabase.from('push_subscriptions').delete().eq('id', sub.id)
    } else {
      failed++
    }
  }

  return { sent, failed, expired }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToUsers(
  userIds: string[],
  payload: PushPayload
): Promise<{ sent: number; failed: number; expired: number }> {
  let totalSent = 0
  let totalFailed = 0
  let totalExpired = 0

  for (const userId of userIds) {
    const result = await sendPushNotificationToUser(userId, payload)
    totalSent += result.sent
    totalFailed += result.failed
    totalExpired += result.expired
  }

  return { sent: totalSent, failed: totalFailed, expired: totalExpired }
}
