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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  full_name: string
}

interface Case {
  id: string
  file_year: number
  file_no: number
  client: {
    name: string | null
  } | null | { name: string | null }[]
}

interface ActivityType {
  id: string
  label: string
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

// High contrast colors for white text readability
const EVENT_COLORS = [
  '#2563eb', // Blue
  '#059669', // Green
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#be185d', // Pink
  '#4d7c0f', // Olive
]

function getEventColor(eventType: string, eventTypeId: string | null, isPast: boolean): string {
  // Use event type for consistent coloring
  const baseHash = eventType === 'hearing' ? 'hearing' : (eventTypeId || 'activity')
  let hash = 0
  for (let i = 0; i < baseHash.length; i++) {
    hash = ((hash << 5) - hash) + baseHash.charCodeAt(i)
    hash = hash & hash
  }
  const color = EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length]

  // Apply opacity to background color only for past events
  if (isPast) {
    // Convert hex to rgba with 0.4 opacity
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, 0.4)`
  }
  return color
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [cases, setCases] = useState<Case[]>([])
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [formData, setFormData] = useState({
    case_id: '',
    title: '',
    description: '',
    event_type_id: '',
    scheduled_at: '',
    duration_minutes: 60,
    location: '',
    lawyer_id: ''
  })
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const [eventsRes, lawyersRes, casesRes, activityTypesRes] = await Promise.all([
        supabase.from('events')
          .select(`
            id, event_type, title, description, scheduled_at, duration_minutes, location, lawyer_id,
            case:cases(file_year, file_no, client:clients(name)),
            lawyer:users!events_lawyer_id_fkey(id, full_name),
            event_type_lookup:lookup_values!events_event_type_id_fkey(label)
          `)
          .order('scheduled_at', { ascending: true })
          .limit(400),
        supabase.from('users').select('id, full_name').eq('role', 'lawyer'),
        supabase.from('cases').select('id, file_year, file_no, client:clients(name)'),
        supabase.from('lookup_values').select('id, label').eq('group_key', 'activity_type')
      ])

      setLawyers(lawyersRes.data || [])
      setCases(casesRes.data || [])
      setActivityTypes(activityTypesRes.data || [])

      const now = new Date()

      const calendarEvents: CalendarEvent[] = ((eventsRes.data as Event[] | null) || []).map((e) => {
        const eventDate = new Date(e.scheduled_at)
        const isPast = eventDate < now
        const lawyerId = e.lawyer?.id || e.lawyer_id || null
        const clientName = getClientName(e.case?.client)
        const duration = (e.duration_minutes || 60) * 60 * 1000
        const caseCode = e.case?.file_year && e.case?.file_no ? `${e.case.file_year}/${e.case.file_no}` : ''

        return {
          id: e.id,
          type: e.event_type,
          title: e.event_type === 'hearing'
            ? `${caseCode} - ${clientName}`
            : `${caseCode} - ${e.title || ''}`,
          start: e.scheduled_at,
          end: new Date(eventDate.getTime() + duration).toISOString(),
          location: e.location,
          extendedProps: {
            caseId: e.case_id,
            caseCode,
            clientName,
            lawyerId,
            lawyerName: e.lawyer?.full_name,
            activityType: e.event_type_lookup?.label,
            type: e.event_type,
          },
          backgroundColor: getEventColor(e.event_type, e.event_type_id, isPast),
          borderColor: 'transparent',
          opacity: 1,
          textColor: '#ffffff',
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
    const eventData = events.find(e => e.id === info.event.id)
    if (eventData) {
      setSelectedEvent(eventData)
      setIsModalOpen(true)
    }
  }

  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedEvent(null)
    setFormData({
      case_id: '',
      title: '',
      description: '',
      event_type_id: '',
      scheduled_at: info.dateStr + 'T09:00:00',
      duration_minutes: 60,
      location: '',
      lawyer_id: lawyers[0]?.id || ''
    })
    setIsModalOpen(true)
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

  const handleCreateEvent = async () => {
    if (!formData.case_id || !formData.scheduled_at) return

    const { error } = await supabase.from('events').insert({
      case_id: formData.case_id,
      event_type: 'activity',
      title: formData.title,
      description: formData.description,
      event_type_id: formData.event_type_id,
      scheduled_at: formData.scheduled_at,
      duration_minutes: formData.duration_minutes,
      location: formData.location,
      lawyer_id: formData.lawyer_id,
      created_by: formData.lawyer_id
    })

    if (!error) {
      setIsModalOpen(false)
      // Reload events
      loadData()
    }
  }

  const loadData = () => {
    // Reload events - simplified version
    supabase.from('events')
      .select(`
        id, event_type, title, description, scheduled_at, duration_minutes, location, lawyer_id,
        case:cases(file_year, file_no, client:clients(name)),
        lawyer:users!events_lawyer_id_fkey(id, full_name),
        event_type_lookup:lookup_values!events_event_type_id_fkey(label)
      `)
      .order('scheduled_at', { ascending: true })
      .limit(400)
      .then((eventsRes) => {
        const now = new Date()
        const calendarEvents: CalendarEvent[] = ((eventsRes.data as Event[] | null) || []).map((e) => {
          const eventDate = new Date(e.scheduled_at)
          const isPast = eventDate < now
          const lawyerId = e.lawyer?.id || e.lawyer_id || null
          const clientName = getClientName(e.case?.client)
          const duration = (e.duration_minutes || 60) * 60 * 1000
          const caseCode = e.case?.file_year && e.case?.file_no ? `${e.case.file_year}/${e.case.file_no}` : ''

          return {
            id: e.id,
            type: e.event_type,
            title: e.event_type === 'hearing'
              ? `${caseCode} - ${clientName}`
              : `${caseCode} - ${e.title || ''}`,
            start: e.scheduled_at,
            end: new Date(eventDate.getTime() + duration).toISOString(),
            location: e.location,
            extendedProps: {
              caseId: e.case_id,
              caseCode,
              clientName,
              lawyerId,
              lawyerName: e.lawyer?.full_name,
              activityType: e.event_type_lookup?.label,
              type: e.event_type,
            },
            backgroundColor: getEventColor(e.event_type, e.event_type_id, isPast),
            borderColor: 'transparent',
            opacity: 1,
            textColor: '#ffffff',
          }
        })
        setEvents(calendarEvents)
      })
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
              dateClick={handleDateClick}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Oluştur'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEvent ? (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedEvent.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedEvent.start).toLocaleString('tr-TR')}
                </p>
                {selectedEvent.extendedProps.caseCode && (
                  <p className="text-sm font-medium mt-2">
                    Dosya: {selectedEvent.extendedProps.caseCode}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="case">Dava</Label>
                  <UnifiedSelect
                    value={formData.case_id}
                    onChange={(v) => setFormData({ ...formData, case_id: v || '' })}
                    items={[{ id: '', label: 'Dava seçin' }, ...cases.map((c) => ({
                      id: c.id,
                      label: `${c.file_year}/${c.file_no} - ${Array.isArray(c.client) ? c.client[0]?.name || '' : c.client?.name || ''}`
                    }))]}
                    placeholder="Dava ara"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Başlık</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Etkinlik başlığı"
                  />
                </div>
                <div>
                  <Label htmlFor="activityType">Aktivite Tipi</Label>
                  <select
                    id="activityType"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={formData.event_type_id}
                    onChange={(e) => setFormData({ ...formData, event_type_id: e.target.value })}
                  >
                    <option value="">Tip seçin</option>
                    {activityTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="scheduled_at">Tarih ve Saat</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration_minutes">Süre (dakika)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Konum</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Mahkeme, ofis, vb."
                  />
                </div>
                <div>
                  <Label htmlFor="lawyer">Avukat</Label>
                  <select
                    id="lawyer"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={formData.lawyer_id}
                    onChange={(e) => setFormData({ ...formData, lawyer_id: e.target.value })}
                  >
                    {lawyers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            {selectedEvent ? (
              <>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Kapat
                </Button>
                <Button onClick={() => {
                  if (selectedEvent.extendedProps.caseId) {
                    router.push(`/cases/${selectedEvent.extendedProps.caseId}`)
                  }
                  setIsModalOpen(false)
                }}>
                  Davaya Git
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleCreateEvent}>
                  Oluştur
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
