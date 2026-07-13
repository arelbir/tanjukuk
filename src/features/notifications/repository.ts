import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'
import type { NotificationFilters, NotificationListResult, NotificationRow } from './types'

export type TypedSupabaseClient = SupabaseClient<Database>

export async function listNotifications(
  supabase: TypedSupabaseClient,
  filters: NotificationFilters = {}
): Promise<NotificationListResult> {
  const limit = Math.min(100, Math.max(1, filters.limit || 50))

  let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(limit)

  if (filters.unreadOnly) {
    query = query.eq('is_read', false)
  }

  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  const [{ data, error }, { count, error: countError }] = await Promise.all([
    query,
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false),
  ])

  if (error) throw error
  if (countError) throw countError

  return {
    items: (data || []) as NotificationRow[],
    unreadCount: count || 0,
  }
}

export async function markNotificationRead(supabase: TypedSupabaseClient, id: string): Promise<NotificationRow> {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function markAllNotificationsRead(supabase: TypedSupabaseClient): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('is_read', false)

  if (error) throw error
}

export function notificationLink(notification: Pick<NotificationRow, 'link_url' | 'entity_type' | 'entity_id'>) {
  if (notification.link_url) return notification.link_url
  if (!notification.entity_type || !notification.entity_id) return null

  if (notification.entity_type === 'calendar_event') return '/calendar'
  if (notification.entity_type === 'case_file') return `/cases/${notification.entity_id}`
  if (notification.entity_type === 'enforcement_file') return `/enforcements/${notification.entity_id}`
  if (notification.entity_type === 'client') return `/clients/${notification.entity_id}`
  if (['receivable', 'payment', 'expense'].includes(notification.entity_type)) return '/finance'
  if (notification.entity_type === 'document') return '/documents'

  return null
}
