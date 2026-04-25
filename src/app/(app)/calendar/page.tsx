'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { EventClickArg, EventDropArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Card, CardContent } from '@/components/ui/card'
import { FormFieldSelectWithId } from '@/components/form-field-select'

interface User {
  id: string
  full_name: string
}

interface CalendarRelation {
  name?: string
}

interface HearingRow {
  id: string
  hearing_at: string
  location: string | null
  case_id: string
  lawyer_id?: string | null
  lawyer?: { id?: string; full_name?: string } | null
  case?: { case_code?: string; client?: CalendarRelation | CalendarRelation[] | null } | null
}

interface ActivityRow {
  id: string
  title: string
  scheduled_at: string
  location: string | null
  case_id: string
  duration_minutes?: number | null
  activity_type_id?: string | null
  activity_type?: { label?: string } | null
  case?: { case_code?: string; client?: CalendarRelation | CalendarRelation[] | null } | null
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
    caseCode?: string
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

function getClientName(client: CalendarRelation | CalendarRelation[] | null | undefined) {
  if (!client) return ''
  return Array.isArray(client) ? client[0]?.name || '' : client.name || ''
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [lawyers, setLawyers] = useState<User[]>([])
  const [selectedLawyers, setSelectedLawyers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const [hearingsRes, activitiesRes, lawyersRes] = await Promise.all([
        supabase.from('hearings')
          .select(`
            id, hearing_at, location, case_id, lawyer_id,
            case:cases(case_code, client:clients(name)),
            lawyer:users!hearings_lawyer_id_fkey(id, full_name)
          `)
          .order('hearing_at', { ascending: true })
          .limit(200),
        supabase.from('case_activities')
          .select(`
            id, title, scheduled_at, location, case_id, duration_minutes, activity_type_id,
            case:cases(case_code, client:clients(name)),
            activity_type:lookup_values!case_activities_activity_type_id_fkey(label)
          `)
          .order('scheduled_at', { ascending: true })
          .limit(200),
        supabase.from('users').select('id, full_name').eq('role', 'lawyer')
      ])

      setLawyers(lawyersRes.data || [])

      const now = new Date()

      const hearingEvents: CalendarEvent[] = ((hearingsRes.data as HearingRow[] | null) || []).map((h) => {
        const hearingDate = new Date(h.hearing_at)
        const isPast = hearingDate < now
        const lawyerId = h.lawyer?.id || h.lawyer_id || null
        const clientName = getClientName(h.case?.client)

        return {
          id: h.id,
          type: 'hearing',
          title: `${h.case?.case_code || ''} - ${clientName}`,
          start: h.hearing_at,
          end: new Date(hearingDate.getTime() + 60 * 60 * 1000).toISOString(),
          location: h.location,
          extendedProps: {
            caseId: h.case_id,
            caseCode: h.case?.case_code,
            clientName,
            lawyerId,
            lawyerName: h.lawyer?.full_name,
            type: 'hearing',
          },
          backgroundColor: getLawyerColor(lawyerId),
          borderColor: 'transparent',
          opacity: isPast ? 0.5 : 1,
          textColor: isPast ? '#6b7280' : '#ffffff',
        }
      })

      const activityEvents: CalendarEvent[] = ((activitiesRes.data as ActivityRow[] | null) || []).map((a) => {
        const activityDate = new Date(a.scheduled_at)
        const isPast = activityDate < now
        const duration = (a.duration_minutes || 60) * 60 * 1000
        const clientName = getClientName(a.case?.client)

        return {
          id: a.id,
          type: 'activity',
          title: `${a.case?.case_code || ''} - ${a.title}`,
          start: a.scheduled_at,
          end: new Date(activityDate.getTime() + duration).toISOString(),
          location: a.location,
          extendedProps: {
            caseId: a.case_id,
            caseCode: a.case?.case_code,
            clientName,
            activityType: a.activity_type?.label,
            type: 'activity',
          },
          backgroundColor: getActivityColor(a.activity_type_id || null),
          borderColor: 'transparent',
          opacity: isPast ? 0.5 : 1,
          textColor: isPast ? '#6b7280' : '#ffffff',
        }
      })

      setEvents([...hearingEvents, ...activityEvents])
      setLoading(false)
    }
    void loadData()
  }, [supabase])

  const filteredEvents = selectedLawyers.length > 0
    ? events.filter((e) => selectedLawyers.includes(e.extendedProps.lawyerId || ''))
    : events

  const handleEventClick = (info: EventClickArg) => {
    const caseId = String(info.event.extendedProps.caseId || '')
    if (!caseId) return
    window.location.href = `/cases/${caseId}`
  }

  const handleEventDrop = async (info: EventDropArg) => {
    const { id } = info.event
    const newDate = info.event.startStr
    const eventType = String(info.event.extendedProps.type || '')
    
    const table = eventType === 'hearing' ? 'hearings' : 'case_activities'
    const field = eventType === 'hearing' ? 'hearing_at' : 'scheduled_at'
    
    const { error } = await supabase
      .from(table)
      .update({ [field]: newDate })
      .eq('id', id)

    if (error) {
      info.revert()
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Takvim</h1>
        <FormFieldSelectWithId
          value={selectedLawyers[0] || 'all'}
          onValueChange={(v) => setSelectedLawyers(v === 'all' ? [] : [v || ''])}
          items={[{ id: 'all', label: 'Tüm Avukatlar' }, ...lawyers.map((l) => ({ id: l.id, label: l.full_name }))]}
          placeholder="Avukat seç"
          triggerClassName="w-48"
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
