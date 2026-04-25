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
import { ImportExportToolbar } from '@/components/import-export-toolbar'
import { activityImportDefinition, buildCaseCodeResolverMap, buildLookupResolverMap, downloadTemplate, executeResolvedImport, exportRows, hearingImportDefinition } from '@/lib/import-export'
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

  const handleDownloadHearingsTemplate = () => {
    downloadTemplate(hearingImportDefinition)
  }

  const handleExportHearings = () => {
    exportRows(
      hearingImportDefinition,
      hearings.map((hearing) => ({
        case_code: caseData?.case_code || caseId,
        hearing_at: hearing.hearing_at,
        location: hearing.location,
        result: hearing.result,
        next_step: hearing.next_step,
      })),
      `durusmalar-${caseData?.case_code || caseId}.xlsx`
    )
  }

  const handleDownloadActivitiesTemplate = () => {
    downloadTemplate(activityImportDefinition)
  }

  const handleExportActivities = () => {
    exportRows(
      activityImportDefinition,
      activities.map((activity) => ({
        case_code: caseData?.case_code || caseId,
        title: activity.title,
        activity_type_label: activity.activity_type?.label || null,
        scheduled_at: activity.scheduled_at,
        duration_minutes: activity.duration_minutes,
        location: activity.location,
        description: activity.description,
      })),
      `aktiviteler-${caseData?.case_code || caseId}.xlsx`
    )
  }

  const handleImportHearings = async (file: File) => {
    const caseMap = await buildCaseCodeResolverMap(supabase)
    const result = await executeResolvedImport({
      file,
      definition: hearingImportDefinition,
      resolveRow: async (row) => {
        const caseIdValue = caseMap.get(row.case_code.trim().toLocaleLowerCase('tr-TR')) || null
        if (!caseIdValue) return { errors: ['case_code eşleşmedi'] }
        return {
          value: {
            case_id: caseIdValue,
            hearing_at: row.hearing_at,
            location: row.location,
            result: row.result,
            next_step: row.next_step,
            is_completed: false,
          },
        }
      },
      insertRows: (rows) => supabase.from('hearings').insert(rows),
      errorFileName: `durusma-import-hatalari-${caseId}.xlsx`,
    })

    if (result.invalidCount > 0) {
      import('sonner').then(({ toast }) => toast.error(`${result.invalidCount} duruşma satırı hatalı bulundu`))
    }

    if (result.inserted > 0) {
      import('sonner').then(({ toast }) => toast.success(`${result.inserted} duruşma içe aktarıldı`))
      const { data } = await supabase.from('hearings').select('*').eq('case_id', caseId).order('hearing_at', { ascending: true })
      setHearings((data as Hearing[] | null) || [])
    }
  }

  const handleImportActivities = async (file: File) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const [caseMap, activityTypeMap] = await Promise.all([
      buildCaseCodeResolverMap(supabase),
      buildLookupResolverMap(supabase, 'activity_type'),
    ])

    const result = await executeResolvedImport({
      file,
      definition: activityImportDefinition,
      resolveRow: async (row) => {
        const errors: string[] = []
        const caseIdValue = caseMap.get(row.case_code.trim().toLocaleLowerCase('tr-TR')) || null
        const activityTypeId = row.activity_type_label ? activityTypeMap.get(row.activity_type_label.trim().toLocaleLowerCase('tr-TR')) || null : null

        if (!caseIdValue) errors.push('case_code eşleşmedi')
        if (row.activity_type_label && !activityTypeId) errors.push('activity_type_label eşleşmedi')
        if (errors.length > 0) return { errors }

        return {
          value: {
            case_id: caseIdValue,
            title: row.title,
            activity_type_id: activityTypeId,
            scheduled_at: row.scheduled_at,
            duration_minutes: row.duration_minutes,
            location: row.location,
            description: row.description,
            created_by: user?.id,
            is_completed: false,
            completed_at: null,
          },
        }
      },
      insertRows: (rows) => supabase.from('case_activities').insert(rows),
      errorFileName: `aktivite-import-hatalari-${caseId}.xlsx`,
    })

    if (result.invalidCount > 0) {
      import('sonner').then(({ toast }) => toast.error(`${result.invalidCount} aktivite satırı hatalı bulundu`))
    }

    if (result.inserted > 0) {
      import('sonner').then(({ toast }) => toast.success(`${result.inserted} aktivite içe aktarıldı`))
      const { data } = await supabase
        .from('case_activities')
        .select(`id, case_id, title, description, activity_type_id, scheduled_at, duration_minutes, location, is_completed, completed_at, activity_type:lookup_values!case_activities_activity_type_id_fkey(label)`)
        .eq('case_id', caseId)
        .order('scheduled_at', { ascending: true })
      setActivities((data as CaseActivity[] | null) || [])
    }
  }

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
              <div className="flex flex-wrap gap-2">
                <ImportExportToolbar
                  onDownloadTemplate={handleDownloadHearingsTemplate}
                  onExport={handleExportHearings}
                  onImport={handleImportHearings}
                  importLabel="Şablon Yükle"
                  templateLabel="Şablon İndir"
                  exportLabel="Duruşmaları Dışa Aktar"
                />
                {isAdmin && (
                  <Button size="sm" onClick={() => setIsHearingDrawerOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Duruşma
                  </Button>
                )}
              </div>
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
              <div className="flex flex-wrap gap-2">
                <ImportExportToolbar
                  onDownloadTemplate={handleDownloadActivitiesTemplate}
                  onExport={handleExportActivities}
                  onImport={handleImportActivities}
                  importLabel="Şablon Yükle"
                  templateLabel="Şablon İndir"
                  exportLabel="Aktiviteleri Dışa Aktar"
                />
                <Button size="sm" onClick={() => setIsActivityDrawerOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Aktivite
                </Button>
              </div>
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
