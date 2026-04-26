'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { EventClickArg, EventDropArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Card, CardContent } from '@/components/ui/card'
import { UnifiedSelect } from '@/components/unified-select'
import { Event } from '@/types/events'

interface User {
  id: string
  full_name: string
}

interface CalendarEvent {
  id: string
  type: 'hearing' | 'activity'
  title: string
  start: string
  end: string
  location: string | null
  backgroundColor: string
  borderColor: string
  opacity: number
  textColor: string
  extendedProps: {
    caseId: string
    caseCode?: string | null
    clientName?: string
    lawyerId?: string | null
    lawyerName?: string
    activityType?: string
    type: 'hearing' | 'activity'
  }
}

const LAWYER_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
]

const ACTIVITY_COLORS = ['#6366f1', '#14b8a6', '#f97316', '#84cc16', '#06b6d4']

function getLawyerColor(lawyerId: string | null | undefined): string {
  if (!lawyerId) return LAWYER_COLORS[0]
  let hash = 0
  for (let i = 0; i < lawyerId.length; i++) {
    hash = ((hash << 5) - hash) + lawyerId.charCodeAt(i)
    hash = hash & hash
  }
  return LAWYER_COLORS[Math.abs(hash) % LAWYER_COLORS.length]
}

function getActivityColor(typeId: string | null): string {
  if (!typeId) return ACTIVITY_COLORS[0]
  let hash = 0
  for (let i = 0; i < typeId.length; i++) {
    hash = ((hash << 5) - hash) + typeId.charCodeAt(i)
    hash = hash & hash
  }
  return ACTIVITY_COLORS[Math.abs(hash) % ACTIVITY_COLORS.length]
}

function getClientName(client: { name: string | null } | null | undefined) {
  if (!client) return ''
  return client.name || ''
}

export default function CalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [lawyers, setLawyers] = useState<User[]>([])
  const [selectedLawyers, setSelectedLawyers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const [eventsRes, lawyersRes] = await Promise.all([
        supabase.from('events')
          .select(`
            id, event_type, title, description, scheduled_at, duration_minutes, location, lawyer_id,
            case:cases(case_code, client:clients(name)),
            lawyer:users!events_lawyer_id_fkey(id, full_name),
            event_type_lookup:lookup_values!events_event_type_id_fkey(label)
          `)
          .order('scheduled_at', { ascending: true })
          .limit(400),
        supabase.from('users').select('id, full_name').eq('role', 'lawyer')
      ])

      setLawyers(lawyersRes.data || [])

      const now = new Date()

      const calendarEvents: CalendarEvent[] = ((eventsRes.data as Event[] | null) || []).map((e) => {
        const eventDate = new Date(e.scheduled_at)
        const isPast = eventDate < now
        const lawyerId = e.lawyer?.id || e.lawyer_id || null
        const clientName = getClientName(e.case?.client)
        const duration = (e.duration_minutes || 60) * 60 * 1000

        return {
          id: e.id,
          type: e.event_type,
          title: e.event_type === 'hearing' 
            ? `${e.case?.case_code || ''} - ${clientName}`
            : `${e.case?.case_code || ''} - ${e.title || ''}`,
          start: e.scheduled_at,
          end: new Date(eventDate.getTime() + duration).toISOString(),
          location: e.location,
          extendedProps: {
            caseId: e.case_id,
            caseCode: e.case?.case_code,
            clientName,
            lawyerId,
            lawyerName: e.lawyer?.full_name,
            activityType: e.event_type_lookup?.label,
            type: e.event_type,
          },
          backgroundColor: e.event_type === 'hearing' 
            ? getLawyerColor(lawyerId)
            : getActivityColor(e.event_type_id || null),
          borderColor: 'transparent',
          opacity: isPast ? 0.5 : 1,
          textColor: isPast ? '#6b7280' : '#ffffff',
        }
      })

      setEvents(calendarEvents)
      setLoading(false)
    }
    void loadData()
  }, [supabase])

  const filteredEvents = selectedLawyers.length > 0
    ? events.filter((e) => selectedLawyers.includes(e.extendedProps.lawyerId || ''))
    : events

  const lawyerItems = [{ id: 'all', label: 'Tüm Avukatlar' }, ...lawyers.map((l) => ({ id: l.id, label: l.full_name }))]

  const handleEventClick = (info: EventClickArg) => {
    const caseId = String(info.event.extendedProps.caseId || '')
    if (!caseId) return
    router.push(`/cases/${caseId}`)
  }

  const handleEventDrop = async (info: EventDropArg) => {
    const { id } = info.event
    const newDate = info.event.startStr
    
    const { error } = await supabase
      .from('events')
      .update({ scheduled_at: newDate })
      .eq('id', id)

    if (error) {
      info.revert()
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Takvim</h1>
        <UnifiedSelect
          value={selectedLawyers[0] || 'all'}
          onChange={(v) => setSelectedLawyers(v === 'all' ? [] : [v || ''])}
          items={lawyerItems}
          placeholder="Avukat seç"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex h-64 items-center justify-center">Yükleniyor...</div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={filteredEvents}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              editable={true}
              locale="tr"
              firstDay={1}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
              height="auto"
              eventDisplay="block"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
