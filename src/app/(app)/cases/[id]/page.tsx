'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LeanBadge } from '@/components/lean-badge'
import { ArrowLeft, Plus } from 'lucide-react'
import { Case } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { HearingFormDrawer } from '@/components/hearing-form-drawer'
import { ActivityFormDrawer } from '@/components/activity-form-drawer'

interface Hearing {
  id: string
  hearing_at: string
  location: string | null
  result: string | null
  next_step: string | null
  is_completed: boolean | null
}

interface CaseActivity {
  id: string
  case_id: string
  title: string
  description: string | null
  activity_type_id: string | null
  activity_type?: { label: string }
  scheduled_at: string
  duration_minutes: number | null
  location: string | null
  is_completed: boolean
  completed_at: string | null
}

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
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [activities, setActivities] = useState<CaseActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [isHearingDrawerOpen, setIsHearingDrawerOpen] = useState(false)
  const [editingHearing, setEditingHearing] = useState<Hearing | null>(null)
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<CaseActivity | null>(null)
  const supabase = createClient()

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

      const { data: hearingsRes } = await supabase
        .from('hearings')
        .select('*')
        .eq('case_id', caseId)
        .order('hearing_at', { ascending: true })

      const { data: activitiesRes } = await supabase
        .from('case_activities')
        .select(`
          id, title, scheduled_at, location, is_completed,
          activity_type:lookup_values!case_activities_activity_type_id_fkey(label)
        `)
        .eq('case_id', caseId)
        .order('scheduled_at', { ascending: true })

      setCaseData((caseRes as CaseDetail | null) || null)
      setHearings((hearingsRes as Hearing[] | null) || [])
      setActivities((activitiesRes as CaseActivity[] | null) || [])
      setLoading(false)
    }

    void loadCase()
  }, [authLoading, caseId, supabase])

  const isPastHearing = (hearing: Hearing) => new Date(hearing.hearing_at) < new Date()
  const canEditHearing = (hearing: Hearing) => isAdmin || !isPastHearing(hearing)

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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between bg-background/50 backdrop-blur-sm p-5 rounded-2xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/cases">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display">{caseData.case_code}</h1>
            <p className="text-sm text-muted-foreground">
              {caseData.client?.name} vs {caseData.opposing_party}
            </p>
          </div>
        </div>
        <LeanBadge value={caseData.lean_against} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Dosya Özeti</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Dava Türü:</span> {caseData.case_type?.label || '-'}</div>
              <div><span className="font-medium">Durum:</span> {caseData.status?.label || '-'}</div>
              <div><span className="font-medium">Mahkeme:</span> {caseData.court_type?.label || '-'}</div>
              <div><span className="font-medium">Açılış Tarihi:</span> {caseData.opened_at ? new Date(caseData.opened_at).toLocaleDateString('tr-TR') : '-'}</div>
              <div><span className="font-medium">Avukat:</span> {caseData.lawyer?.full_name || '-'}</div>
              <div><span className="font-medium">Müvekkil:</span> {caseData.client?.name || '-'}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Duruşmalar</CardTitle>
              {isAdmin && (
                <Button size="sm" onClick={() => setIsHearingDrawerOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Duruşma
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Yer</TableHead>
                    <TableHead>Sonuç</TableHead>
                    <TableHead>Sonraki Adım</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hearings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Duruşma bulunamadı
                      </TableCell>
                    </TableRow>
                  ) : (
                    hearings.map((hearing) => (
                      <TableRow
                        key={hearing.id}
                        className={canEditHearing(hearing) ? 'cursor-pointer hover:bg-muted/50' : ''}
                        onClick={() => {
                          if (!canEditHearing(hearing)) return
                          setEditingHearing(hearing)
                          setIsHearingDrawerOpen(true)
                        }}
                      >
                        <TableCell>{new Date(hearing.hearing_at).toLocaleString('tr-TR')}</TableCell>
                        <TableCell>{hearing.location || '-'}</TableCell>
                        <TableCell>{hearing.result || '-'}</TableCell>
                        <TableCell>{hearing.next_step || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Aktiviteler</CardTitle>
              <Button size="sm" onClick={() => setIsActivityDrawerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Aktivite
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Yer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Aktivite bulunamadı
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity) => (
                      <TableRow
                        key={activity.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setEditingActivity(activity)
                          setIsActivityDrawerOpen(true)
                        }}
                      >
                        <TableCell>{new Date(activity.scheduled_at).toLocaleString('tr-TR')}</TableCell>
                        <TableCell>{activity.title}</TableCell>
                        <TableCell>{activity.activity_type?.label || '-'}</TableCell>
                        <TableCell>{activity.location || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Notlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="font-medium">Açıklama:</span> {caseData.description || '-'}</div>
              <div><span className="font-medium">Not:</span> {caseData.notes || '-'}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <HearingFormDrawer
        open={isHearingDrawerOpen}
        onOpenChange={(open) => {
          setIsHearingDrawerOpen(open)
          if (!open) setEditingHearing(null)
        }}
        caseId={caseId}
        hearing={editingHearing}
        isAdmin={isAdmin}
        onSuccess={(savedHearing) => {
          if (editingHearing) {
            setHearings((prev) => prev.map((item) => (item.id === savedHearing.id ? savedHearing : item)))
          } else {
            setHearings((prev) => [...prev, savedHearing].sort((a, b) => new Date(a.hearing_at).getTime() - new Date(b.hearing_at).getTime()))
          }
        }}
      />

      <ActivityFormDrawer
        open={isActivityDrawerOpen}
        onOpenChange={(open) => {
          setIsActivityDrawerOpen(open)
          if (!open) setEditingActivity(null)
        }}
        caseId={caseId}
        activity={editingActivity}
        isAdmin={isAdmin}
        onSuccess={(savedActivity) => {
          if (editingActivity) {
            setActivities((prev) => prev.map((item) => (item.id === savedActivity.id ? savedActivity : item)))
          } else {
            setActivities((prev) => [...prev, savedActivity].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()))
          }
        }}
      />
    </div>
  )
}
