'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Notification, NotificationFilters, DEFAULT_NOTIFICATION_FILTERS } from '@/types/notification'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filters, setFilters] = useState<NotificationFilters>(DEFAULT_NOTIFICATION_FILTERS)

  useEffect(() => {
    const supabase = createClient()

    async function loadNotifications() {
      setLoading(true)

      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (filters.unreadOnly) {
        query = query.eq('is_read', false)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      const { data, error } = await query

      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.is_read).length)
      }

      setLoading(false)
    }

    void loadNotifications()
  }, [filters])

  useEffect(() => {
    const supabase = createClient()

    async function refreshUnreadCount() {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      setUnreadCount(count || 0)
    }

    void refreshUnreadCount()
    const interval = setInterval(() => {
      void refreshUnreadCount()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  const deleteNotification = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }
  }

  const updateFilters = (newFilters: Partial<NotificationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  return {
    notifications,
    loading,
    unreadCount,
    filters,
    updateFilters,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: () => setFilters((prev) => ({ ...prev })),
  }
}

export async function createNotification(
  supabase: ReturnType<typeof createClient>,
  notification: {
    userId: string
    title: string
    message?: string
    type: string
    entityId?: string
    entityType?: string
    linkUrl?: string
  }
) {
  return supabase.from('notifications').insert({
    user_id: notification.userId,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    entity_id: notification.entityId || null,
    entity_type: notification.entityType || null,
    link_url: notification.linkUrl || null,
  })
}
