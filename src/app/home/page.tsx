import { ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Card } from '@/components/ui/card'
import { AgendaOperationSection, type AgendaOperationItem } from '@/components/domain/agenda-operation-section'
import { TodaySummaryRail } from '@/components/domain/today-summary-rail'
import { requirePageContext } from '@/lib/auth/page'
import { listCalendarEvents } from '@/features/calendar/repository'
import type { CalendarEventListItem } from '@/features/calendar/types'

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

export default async function HomePage({ searchParams }: { searchParams?: Promise<{ action?: string }> }) {
  const params = searchParams ? await searchParams : {}
  const initialAction = params.action === 'hearing' ? 'hearing' : params.action === 'task' ? 'task' : null
  const { supabase, user, unreadCount } = await requirePageContext()
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  const [events, overdueEvents] = await Promise.all([
    listCalendarEvents(supabase, { from: start, to: end, completed: 'open' }),
    listCalendarEvents(supabase, { to: now.toISOString(), completed: 'open' }),
  ])
  const items = events.map(toAgendaItem)
  const nextItem = items.find((item) => !item.overdue) || items[0]

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="space-y-5">
        <TodaySummaryRail overdueCount={overdueEvents.length} />

        {nextItem ? (
          <section>
            <Card className="overflow-hidden border-indigo-100 bg-gradient-to-br from-indigo-50 via-card to-card p-0 shadow-sm">
              <div className="grid md:grid-cols-[8rem_minmax(0,1fr)_auto]">
                <div className="flex items-center justify-between gap-3 border-b border-indigo-100 bg-indigo-600 px-4 py-3 text-primary-foreground md:flex-col md:items-start md:justify-center md:border-b-0 md:border-r md:border-indigo-100">
                  <p className="text-2xl font-semibold leading-none">{nextItem.time}</p>
                  <p className="text-xs font-medium opacity-90">Sıradaki</p>
                </div>
                <div className="min-w-0 px-4 py-4">
                  <h2 className="text-lg font-semibold leading-7">{nextItem.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{nextItem.file} · {nextItem.responsible}</p>
                </div>
                <div className="flex items-center border-t border-border px-4 py-3 md:border-l md:border-t-0">
                  <a href="#ajanda-operasyon" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-indigo-50 px-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                    Aç
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </div>
            </Card>
          </section>
        ) : null}

        <div id="ajanda-operasyon">
          <AgendaOperationSection user={user} mode="home" initialAction={initialAction} showCreateActions={false} initialItems={items} />
        </div>
      </div>
    </AppShell>
  )
}
