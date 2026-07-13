import { BellRing, ShieldCheck } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { NotificationCard } from '@/components/domain/cards'
import { Button } from '@/components/ui/button'
import { MarkAllNotificationsReadButton } from '@/components/domain/notification-actions'
import { requirePageContext } from '@/lib/auth/page'
import { listNotifications } from '@/features/notifications/repository'
import type { NotificationRow } from '@/features/notifications/types'

function isToday(value: string | null) {
  if (!value) return false
  const date = new Date(value)
  const now = new Date()
  return date.toDateString() === now.toDateString()
}

function groupNotifications(items: NotificationRow[]) {
  const unread = items.filter((item) => !item.is_read)
  const today = items.filter((item) => item.is_read && isToday(item.created_at))
  const previous = items.filter((item) => item.is_read && !isToday(item.created_at))

  return [
    { label: 'Okunmamış', items: unread },
    { label: 'Bugün', items: today },
    { label: 'Önceki', items: previous },
  ].filter((group) => group.items.length > 0)
}

export default async function NotificationsPage() {
  const { supabase, user, unreadCount } = await requirePageContext()
  const result = await listNotifications(supabase, { limit: 50 })
  const groups = groupNotifications(result.items)

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="mx-auto max-w-3xl space-y-4">
        <section className="overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-sky-50/60 to-card shadow-sm">
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-200">
                <BellRing className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-base font-semibold leading-6">Bildirimler kapalı</h2>
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="size-3.5" />
                    Güvenli izin
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Duruşma, görev ve finans uyarılarını cihazınızda alın.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button className="w-full bg-violet-600 hover:bg-violet-700 sm:w-auto">Bildirim iznini iste</Button>
                  <p className="text-xs leading-5 text-muted-foreground">Tarayıcı izni gerekir.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-card p-3.5 shadow-sm sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Özet</p>
              <h2 className="text-xl font-semibold">{unreadCount} okunmamış bildirim</h2>
            </div>
            <MarkAllNotificationsReadButton />
          </div>
        </section>

        {groups.length > 0 ? groups.map((group) => (
          <section key={group.label} className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</h2>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{group.items.length}</span>
            </div>
            <div className="space-y-1.5">
              {group.items.map((item) => <NotificationCard key={item.id} notification={item} />)}
            </div>
          </section>
        )) : (
          <section className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Bildirim yok.
          </section>
        )}
      </div>
    </AppShell>
  )
}
