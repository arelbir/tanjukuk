'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LeanBadge } from '@/components/lean-badge'
import { UnifiedSelect } from '@/components/unified-select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Calendar, FileText, DollarSign, Edit3 } from 'lucide-react'
import { Case } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useMultipleLookups } from '@/hooks/useLookups'
import { EventFormDrawer } from '@/components/event-form-drawer'
import { Event } from '@/types/events'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface CaseDetail extends Case {
  lawyer?: { full_name: string }
  client?: { name: string; type: string }
  case_type?: { label: string }
  status?: { label: string }
  court_type?: { label: string }
}

export default function CaseDetailPage() {
  const params = useParams()
  const caseId = params.id as string
  const { isAdmin, loading: authLoading } = useAuth()
  const [caseData, setCaseData] = useState<CaseDetail | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [activeTab, setActiveTab] = useState('summary')
  const supabase = createClient()
  const { lookups } = useMultipleLookups(['case_status', 'entity_type', 'client_role', 'city', 'court_type', 'file_type'])

  useEffect(() => {
    async function loadCase() {
      if (authLoading) return

      const { data: caseRes } = await supabase
        .from('cases')
        .select(`
          *,
          lawyer:users!cases_lawyer_id_fkey(full_name),
          client:clients(name, type),
          case_type:lookup_values!cases_case_type_id_fkey(label),
          status:lookup_values!cases_status_id_fkey(label),
          court_type:lookup_values!cases_court_type_id_fkey(label)
        `)
        .eq('id', caseId)
        .single()

      const { data: eventsRes } = await supabase
        .from('events')
        .select('*')
        .eq('case_id', caseId)
        .order('scheduled_at', { ascending: true })

      setCaseData((caseRes as CaseDetail | null) || null)
      setEvents((eventsRes as Event[] | null) || [])
      setLoading(false)
    }
    void loadCase()
  }, [authLoading, caseId, supabase])

  const isPastEvent = (event: Event) => new Date(event.scheduled_at) < new Date()
  const canEditEvent = (event: Event) => isAdmin || !isPastEvent(event)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Dosya bulunamadı</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/cases">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-semibold truncate">{caseData.case_code}</h1>
              <p className="text-sm text-muted-foreground truncate">
                {caseData.client?.name} vs {caseData.opposing_party}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {caseData.status?.label && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  {caseData.status.label}
                </span>
              )}
              <LeanBadge value={caseData.lean_against} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start mb-4 overflow-x-auto">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Özet
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Durum
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Etkinlikler
              {events.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {events.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Finansal
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Dosya Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Dava Türü</p>
                    <p className="font-medium">{caseData.case_type?.label || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Durum</p>
                    <p className="font-medium">{caseData.status?.label || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Mahkeme</p>
                    <p className="font-medium">{caseData.court_type?.label || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Avukat</p>
                    <p className="font-medium">{caseData.lawyer?.full_name || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Açılış Tarihi</p>
                    <p className="font-medium">{caseData.opened_at ? format(new Date(caseData.opened_at), 'dd MMM yyyy', { locale: tr }) : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4">
              
              {/* KOLON 1: Taraflar Bilgileri */}
              <div className="lg:col-span-3">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Taraflar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Müvekkil</Label>
                      <p className="text-sm font-medium">{caseData.client?.name || '-'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Karşı Taraf</Label>
                      <p className="text-sm font-medium">{caseData.opposing_party || '-'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Avukat</Label>
                      <p className="text-sm font-medium">{caseData.lawyer?.full_name || '-'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* KOLON 2: Dava Durumu */}
              <div className="lg:col-span-6">
                <Card className="border-0 shadow-sm bg-card/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Dava Durumu</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Durum</Label>
                      <UnifiedSelect
                        value={caseData.status_id || ''}
                        onChange={(v) => {
                          void supabase.from('cases').update({ status_id: v || null }).eq('id', caseId)
                          setCaseData(prev => prev ? { ...prev, status_id: v || null } : null)
                        }}
                        items={lookups['case_status']?.map(c => ({ id: c.id, label: c.label || c.id })) || []}
                        placeholder="Durum seçiniz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Dava Sonucu</Label>
                      <Input
                        value={caseData.verdict_result || ''}
                        onChange={(e) => {
                          void supabase.from('cases').update({ verdict_result: e.target.value || null }).eq('id', caseId)
                          setCaseData(prev => prev ? { ...prev, verdict_result: e.target.value || null } : null)
                        }}
                        placeholder="Dava sonucunu girin"
                        className="bg-white border-input"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* KOLON 3: Karar Tutarları */}
              <div className="lg:col-span-3">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Karar Tutarları</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Lehe Hükmedilen</Label>
                      <Input
                        type="number"
                        value={caseData.verdict_for || ''}
                        onChange={(e) => {
                          void supabase.from('cases').update({ verdict_for: parseFloat(e.target.value) || null }).eq('id', caseId)
                          setCaseData(prev => prev ? { ...prev, verdict_for: parseFloat(e.target.value) || null } : null)
                        }}
                        placeholder="0"
                        className="bg-white border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Aleyhe Hükmedilen</Label>
                      <Input
                        type="number"
                        value={caseData.verdict_against || ''}
                        onChange={(e) => {
                          void supabase.from('cases').update({ verdict_against: parseFloat(e.target.value) || null }).eq('id', caseId)
                          setCaseData(prev => prev ? { ...prev, verdict_against: parseFloat(e.target.value) || null } : null)
                        }}
                        placeholder="0"
                        className="bg-white border-input"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-end hidden md:flex">
              <Button size="sm" onClick={() => setIsEventDrawerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Etkinlik
              </Button>
            </div>
            
            {events.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Etkinlik bulunamadı</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className={`border-0 shadow-sm ${canEditEvent(event) ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                    onClick={() => {
                      if (!canEditEvent(event)) return
                      setEditingEvent(event)
                      setIsEventDrawerOpen(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {event.event_type_lookup?.label && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                                {event.event_type_lookup.label}
                              </span>
                            )}
                            <p className="font-medium text-sm">{event.title || 'Etkinlik'}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{format(new Date(event.scheduled_at), 'dd MMM yyyy HH:mm', { locale: tr })}</p>
                          {event.location && (
                            <p className="text-xs text-muted-foreground mt-2">{event.location}</p>
                          )}
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                          )}
                        </div>
                        {isPastEvent(event) && (
                          <span className="px-2 py-1 text-xs bg-muted rounded-full">Geçmiş</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Finansal kayıtlar için ilgili sayfaya gidin</p>
                <div className="flex gap-3 justify-center">
                  <Link href={`/income?case=${caseId}`}>
                    <Button variant="outline" size="sm">
                      Gelir Kayıtları
                    </Button>
                  </Link>
                  <Link href={`/expenses?case=${caseId}`}>
                    <Button variant="outline" size="sm">
                      Gider Kayıtları
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        {activeTab === 'events' && (
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsEventDrawerOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </div>

      <EventFormDrawer
        open={isEventDrawerOpen}
        onOpenChange={(open: boolean) => {
          setIsEventDrawerOpen(open)
          if (!open) setEditingEvent(null)
        }}
        caseId={caseId}
        event={editingEvent}
        isAdmin={isAdmin}
        onSuccess={(savedEvent: Event) => {
          if (editingEvent) {
            setEvents((prev) => prev.map((item) => (item.id === savedEvent.id ? savedEvent as Event : item)))
          } else {
            setEvents((prev) => [...prev, savedEvent as Event].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()))
          }
        }}
      />
    </div>
  )
}
