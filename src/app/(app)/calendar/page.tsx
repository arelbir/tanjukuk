'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Hearing {
  id: string
  hearing_at: string
  location: string | null
  case_id: string
  case_code?: string
  client_name?: string
  lawyer_id: string
  lawyer_name?: string
}

interface User {
  id: string
  full_name: string
}

const LAWYER_COLORS: Record<string, string> = {
  '3b82f6': '#3b82f6',
  '10b981': '#10b981',
  'f59e0b': '#f59e0b',
  'ef4444': '#ef4444',
  '8b5cf6': '#8b5cf6',
  'ec4899': '#ec4899',
}

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [lawyers, setLawyers] = useState<User[]>([])
  const [selectedLawyers, setSelectedLawyers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const [hearingsRes, lawyersRes] = await Promise.all([
        supabase.from('hearings')
          .select(`
            id, hearing_at, location, case_id,
            case:cases(case_code, client:clients(name)),
            lawyer:users!hearings_lawyer_id_fkey(full_name)
          `)
          .gte('hearing_at', new Date().toISOString()),
        supabase.from('users').select('id, full_name').eq('role', 'lawyer')
      ])

      setLawyers(lawyersRes.data || [])

      const mappedEvents = (hearingsRes.data || []).map((h: any) => ({
        id: h.id,
        title: `${h.case?.case_code || ''} - ${h.case?.client?.name || ''}`,
        start: h.hearing_at,
        end: new Date(new Date(h.hearing_at).getTime() + 60 * 60 * 1000).toISOString(),
        location: h.location,
        extendedProps: {
          caseId: h.case_id,
          caseCode: h.case?.case_code,
          clientName: h.case?.client?.name,
          lawyerId: h.lawyer_id,
          lawyerName: h.lawyer?.full_name
        },
        backgroundColor: LAWYER_COLORS[Object.keys(LAWYER_COLORS)[Math.floor(Math.random() * 6)]],
        borderColor: 'transparent'
      }))

      setEvents(mappedEvents)
      setLoading(false)
    }
    loadData()
  }, [supabase])

  const filteredEvents = selectedLawyers.length > 0
    ? events.filter(e => selectedLawyers.includes(e.extendedProps.lawyerId))
    : events

  const handleEventClick = (info: any) => {
    window.location.href = `/cases/${info.event.extendedProps.caseId}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Takvim</h1>
        <Select value={selectedLawyers[0] || 'all'} onValueChange={(v) => setSelectedLawyers(v === 'all' ? [] : [v || ''])}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Avukat seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Avukatlar</SelectItem>
            {lawyers.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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