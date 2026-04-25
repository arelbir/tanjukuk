'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, FileText, Calendar, Clock, DollarSign, Info } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { NOTIFICATION_COLORS, NOTIFICATION_LABELS, NotificationType } from '@/types/notification'

const TYPE_ICONS: Record<NotificationType, typeof FileText> = {
  file_assignment: FileText,
  case_status: FileText,
  hearing: Calendar,
  deadline: Clock,
  payment: DollarSign,
  system: Info,
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Şimdi'
  if (diffMins < 60) return `${diffMins} dk`
  if (diffHours < 24) return `${diffHours} sa`
  if (diffDays < 7) return `${diffDays} gün`
  return date.toLocaleDateString('tr-TR')
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
    // Here you could add navigation logic
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-background border rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Bildirimler</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Yükleniyor...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Bildirim yok</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.type as NotificationType] || FileText
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 border-b hover:bg-muted/50 transition-colors ${
                      !notification.is_read ? 'bg-muted/20' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 p-2 rounded-lg ${
                        NOTIFICATION_COLORS[notification.type as NotificationType]?.split(' ')[0] || 'bg-muted'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-medium text-sm truncate ${
                            !notification.is_read ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        {notification.message && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                        )}
                        <span className={`inline-block mt-1 text-xs ${
                          NOTIFICATION_COLORS[notification.type as NotificationType]?.split(' ')[2] || 'text-muted-foreground'
                        }`}>
                          {NOTIFICATION_LABELS[notification.type as NotificationType]}
                        </span>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}