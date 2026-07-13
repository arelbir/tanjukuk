import { AppShell } from '@/components/layout/app-shell'
import { CalendarView } from '@/components/domain/calendar-view'
import { requirePageContext } from '@/lib/auth/page'
import { listCalendarEvents } from '@/features/calendar/repository'
import type { AgendaOperationItem } from '@/components/domain/agenda-operation-section'
import type { CalendarEventListItem } from '@/features/calendar/types'

function dateLabel(startsAt: string | null) {
  if (!startsAt) return 'Tarihsiz'
  const date = new Date(startsAt)
  if (Number.isNaN(date.getTime())) return 'Tarihsiz'

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000)

  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Yarın'
  if (diffDays === -1) return 'Dün'
  if (diffDays < 0) return 'Gecikmiş'
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
}

function timeLabel(startsAt: string | null) {
  if (!startsAt) return '--:--'
  const date = new Date(startsAt)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function eventTypeLabel(type: string | null) {
  if (type === 'hearing') return 'Duruşma'
  if (type === 'deadline') return 'Son tarih'
  if (type === 'appointment') return 'Randevu'
  return 'Görev'
}

function fileLabel(event: CalendarEventListItem) {
  if (event.case_file?.file_code) return event.case_file.file_code
  if (event.enforcement_file?.file_code) return event.enforcement_file.file_code
  if (event.client?.name) return event.client.name
  return 'Genel'
}

function toAgendaItem(event: CalendarEventListItem): AgendaOperationItem {
  const startsAt = event.starts_at
  const date = startsAt ? new Date(startsAt) : null
  const overdue = Boolean(date && date.getTime() < Date.now() && !event.is_completed)

  return {
    id: event.id,
    date: overdue ? 'Gecikmiş' : dateLabel(startsAt),
    time: timeLabel(startsAt),
    type: eventTypeLabel(event.event_type),
    title: event.title,
    file: fileLabel(event),
    responsible: event.assigned_profile?.full_name || event.assigned_profile?.email || 'Atanmamış',
    overdue,
  }
}

export default async function CalendarPage({ searchParams }: { searchParams?: Promise<{ tab?: string }> }) {
  const params = searchParams ? await searchParams : {}
  const initialSegment = ['today', 'week', 'overdue', 'all'].includes(params.tab || '') ? params.tab || 'today' : 'today'
  const { supabase, user, unreadCount } = await requirePageContext()
  const events = await listCalendarEvents(supabase, { completed: 'open' })
  const items = events.map(toAgendaItem)

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Tüm Ajanda</h2>
            <p className="text-sm text-muted-foreground">Görev, duruşma ve son tarih kayıtları.</p>
          </div>
        </div>
        <CalendarView user={user} items={items} initialSegment={initialSegment} />
      </div>
    </AppShell>
  )
}
