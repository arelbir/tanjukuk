import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats } from '@/types/dashboard-v3'
import {
  Calendar as CalendarIcon,
  FolderKanban,
  Users,
  Plus,
  FileText,
  UserPlus,
  CalendarPlus,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { QuickActionDrawer } from '@/components/quick-action-drawer'
import { QuickActionType } from '@/types/quick-actions'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { createClient } from '@/lib/supabase/client'

interface TodayLensProps {
  stats: DashboardStats
}

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
}

export function TodayLens({ stats }: TodayLensProps) {
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [actionType, setActionType] = useState<QuickActionType | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadEvents() {
      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() + 1)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const { data } = await supabase
        .from('events')
        .select('id, scheduled_at, duration_minutes, case:cases(case_code, client:clients(name))')
        .gte('scheduled_at', weekStart.toISOString())
        .lte('scheduled_at', weekEnd.toISOString())
        .order('scheduled_at', { ascending: true })

      const calendarEvents: CalendarEvent[] = (data || []).map((e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const eventDate = new Date(e.scheduled_at)
        const caseData = Array.isArray(e.case) ? e.case[0] : e.case
        const clientData = Array.isArray(caseData?.client) ? caseData.client[0] : caseData?.client
        return {
          id: e.id,
          title: `${caseData?.case_code || ''} - ${clientData?.name || ''}`,
          start: e.scheduled_at,
          end: new Date(eventDate.getTime() + (e.duration_minutes || 60) * 60 * 1000).toISOString(),
          backgroundColor: '#3b82f6',
          borderColor: 'transparent',
        }
      })

      setEvents(calendarEvents)
    }

    loadEvents()
  }, [supabase])

  const handleQuickAction = (type: QuickActionType) => {
    setActionType(type)
    setQuickActionOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats + Quick Actions - Combined 4 columns */}
      <div className="grid gap-3 md:grid-cols-4">
        <Link href="/cases">
          <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FolderKanban className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeCases}</p>
                  <p className="text-xs text-muted-foreground">Aktif Dosya</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/calendar">
          <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayHearings}</p>
                  <p className="text-xs text-muted-foreground">Bugünkü Etkinlik</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clients">
          <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalClients}</p>
                  <p className="text-xs text-muted-foreground">Müvekkil</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card
          className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleQuickAction('new-case')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Hızlı Aksiyon</p>
                <p className="text-xs text-muted-foreground">Yeni ekle</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <Card className="border-border/50 bg-card/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Bu Haftalık Takvim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            locale="tr"
            firstDay={1}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            height="500px"
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
          />
        </CardContent>
      </Card>

      {/* Quick Actions - Compact */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Hızlı Aksiyonlar</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => handleQuickAction('new-case')}
            className="flex-shrink-0 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Yeni Dosya</span>
          </button>

          <button
            onClick={() => handleQuickAction('new-client')}
            className="flex-shrink-0 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Yeni Müvekkil</span>
          </button>

          <button
            onClick={() => handleQuickAction('new-hearing')}
            className="flex-shrink-0 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <CalendarPlus className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Yeni Duruşma</span>
          </button>

          <button
            onClick={() => handleQuickAction('new-income')}
            className="flex-shrink-0 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Gelir/Gider</span>
          </button>
        </div>
      </div>

      {/* Quick Action Drawer */}
      {actionType && (
        <QuickActionDrawer
          isOpen={quickActionOpen}
          onClose={() => setQuickActionOpen(false)}
          actionType={actionType}
        />
      )}
    </div>
  )
}
