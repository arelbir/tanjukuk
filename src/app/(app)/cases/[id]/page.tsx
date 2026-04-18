'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LeanBadge } from '@/components/lean-badge'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Edit2, Save, X } from 'lucide-react'
import { Case, CaseFilters, LEAN_LABELS } from '@/types'
import { HearingFormDrawer } from '@/components/hearing-form-drawer'
import { EditableField } from '@/components/editable-field'
import { FormFieldSelectWithId } from '@/components/form-field-select'
import { LawyerSelect } from '@/components/lawyer-select'
import { ClientSelect } from '@/components/client-select'

interface Hearing {
  id: string
  hearing_at: string
  location: string | null
  result: string | null
  next_step: string | null
  is_completed: boolean
}

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const caseId = params.id as string
  
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Case>>({})
  const [isHearingDrawerOpen, setIsHearingDrawerOpen] = useState(false)
  const [lookups, setLookups] = useState<Record<string, any[]>>({})
  
  const supabase = createClient()

  useEffect(() => {
    async function loadCase() {
      // 1. Fetch Lookup values for editing dropdowns
      const { data: lookupsRes } = await supabase
        .from('lookup_values')
        .select('*')
        .order('sort_order', { ascending: true })

      if (lookupsRes) {
        const grouped = lookupsRes.reduce((acc: any, curr: any) => {
          if (!acc[curr.group_key]) acc[curr.group_key] = []
          acc[curr.group_key].push(curr)
          return acc
        }, {})
        setLookups(grouped)
      }

      // 2. Fetch the actual case profile
      const { data: caseRes } = await supabase
        .from('cases')
        .select(`
          *,
          lawyer:users!cases_lawyer_id_fkey(full_name),
          client:clients(name, type),
          case_type:lookup_values!cases_case_type_id_fkey(label),
          status:lookup_values!cases_status_id_fkey(label),
          court_type:lookup_values!cases_court_type_id_fkey(label),
          file_type:lookup_values!cases_file_type_id_fkey(label)
        `)
        .eq('id', caseId)
        .single()

      if (caseRes) {
        setCaseData(caseRes)
        setEditData(caseRes)
      }

      // 3. Fetch hearings list
      const { data: hearingsRes } = await supabase
        .from('hearings')
        .select('*')
        .eq('case_id', caseId)
        .order('hearing_at', { ascending: true })

      setHearings(hearingsRes || [])
      setLoading(false)
    }

    loadCase()
  }, [supabase, caseId])

  const handleSave = async () => {
    // Only send the base fields for update, ommiting relations
    const { lawyer, client, case_type, status, court_type, file_type, ...updatePayload } = editData as any;

    const { error } = await supabase
      .from('cases')
      .update(updatePayload)
      .eq('id', caseId)

    if (error) {
      toast.error('Hata: ' + error.message)
      return
    }

    toast.success('Dosya güncellendi!')
    setEditing(false)
    window.location.reload()
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
    <div className="max-w-7xl mx-auto space-y-6">
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
        <div className="flex items-center gap-3">
          <LeanBadge value={caseData.lean_against} />
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
            {editing ? <X className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
            {editing ? 'İptal' : 'Düzenle'}
          </Button>
          {editing && (
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Dosya Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <EditableField 
                  label="Dava Türü" 
                  isEditing={editing} 
                  displayValue={caseData.case_type?.label}
                >
                  <FormFieldSelectWithId
                    label=""
                    value={editData.case_type_id || ''}
                    onValueChange={(v) => setEditData({...editData, case_type_id: v || undefined})}
                    items={lookups['case_type'] || []}
                  />
                </EditableField>

                <EditableField 
                  label="Durum" 
                  isEditing={editing} 
                  displayValue={caseData.status?.label}
                >
                  <FormFieldSelectWithId
                    label=""
                    value={editData.status_id || ''}
                    onValueChange={(v) => setEditData({...editData, status_id: v || undefined})}
                    items={lookups['case_status'] || []} 
                  />
                </EditableField>

                <EditableField 
                  label="Mahkeme" 
                  isEditing={editing} 
                  displayValue={caseData.court_type?.label}
                >
                  <FormFieldSelectWithId
                    label=""
                    value={editData.court_type_id || ''}
                    onValueChange={(v) => setEditData({...editData, court_type_id: v || undefined})}
                    items={lookups['court_type'] || []}
                  />
                </EditableField>

                <EditableField 
                  label="Dosya No" 
                  isEditing={editing} 
                  displayValue={caseData.file_no}
                >
                  <Input 
                    value={editData.file_no || ''} 
                    onChange={(e) => setEditData({...editData, file_no: e.target.value})}
                  />
                </EditableField>

                <EditableField 
                  label="Açılma Tarihi" 
                  isEditing={editing} 
                  displayValue={caseData.opened_at ? new Date(caseData.opened_at).toLocaleDateString('tr-TR') : ''}
                >
                  <Input 
                    type="date"
                    value={editData.opened_at?.substring(0, 10) || ''} 
                    onChange={(e) => setEditData({...editData, opened_at: e.target.value})}
                  />
                </EditableField>

                <EditableField 
                  label="Dava Değeri" 
                  isEditing={editing} 
                  displayValue={caseData.case_value ? `${caseData.case_value.toLocaleString('tr-TR')} ${caseData.currency || ''}` : ''}
                >
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      value={editData.case_value || ''} 
                      onChange={(e) => setEditData({...editData, case_value: parseFloat(e.target.value) || undefined})}
                      className="flex-1"
                    />
                    <Select value={editData.currency || 'TRY'} onValueChange={(v) => setEditData({...editData, currency: v || 'TRY'})}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {lookups['currency']?.map((c) => (
                          <SelectItem key={c.id} value={c.label}>{c.label}</SelectItem>
                        ))}
                        {!lookups['currency'] && (
                          <>
                            <SelectItem value="TRY">TRY</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </EditableField>

              </div>
              
              <EditableField 
                label="Açıklama" 
                isEditing={editing} 
                displayValue={caseData.description}
              >
                <Textarea 
                  value={editData.description || ''} 
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="min-h-[80px]"
                />
              </EditableField>

              <EditableField 
                label="Notlar" 
                isEditing={editing} 
                displayValue={caseData.notes}
              >
                <Textarea 
                  value={editData.notes || ''} 
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  className="min-h-[80px]"
                />
              </EditableField>

            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Duruşmalar</CardTitle>
              <Button size="sm" onClick={() => setIsHearingDrawerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Duruşma
              </Button>
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
                    hearings.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>
                          {new Date(h.hearing_at).toLocaleString('tr-TR')}
                        </TableCell>
                        <TableCell>{h.location || '-'}</TableCell>
                        <TableCell>{h.result || '-'}</TableCell>
                        <TableCell>{h.next_step || '-'}</TableCell>
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
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Taraflar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditableField 
                label="Avukat" 
                isEditing={editing} 
                displayValue={caseData.lawyer?.full_name}
              >
                <LawyerSelect 
                  label=""
                  value={editData.lawyer_id || ''} 
                  onChange={(val) => setEditData({...editData, lawyer_id: val})} 
                />
              </EditableField>

              <EditableField 
                label="Müvekkil" 
                isEditing={editing} 
                displayValue={
                  <div>
                    <p className="font-medium">{caseData.client?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {caseData.client?.type === 'individual' ? 'Bireysel' : 'Şirket'}
                    </p>
                  </div>
                }
              >
                <ClientSelect 
                  label=""
                  value={editData.client_id || ''} 
                  onChange={(id) => setEditData({...editData, client_id: id})} 
                />
              </EditableField>

              <EditableField 
                label="Karşı Taraf" 
                isEditing={editing} 
                displayValue={caseData.opposing_party}
              >
                <Input 
                  value={editData.opposing_party || ''} 
                  onChange={(e) => setEditData({...editData, opposing_party: e.target.value})}
                />
              </EditableField>

              <EditableField 
                label="Sıfat" 
                isEditing={editing} 
                displayValue={caseData.client_role}
              >
                <FormFieldSelectWithId
                  label=""
                  value={editData.client_role || ''}
                  onValueChange={(v) => setEditData({...editData, client_role: v || undefined})}
                  items={lookups['client_role']?.map(r => ({ id: r.label, label: r.label })) || []}
                />
              </EditableField>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Mahkeme Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <EditableField 
                  label="İl" 
                  isEditing={editing} 
                  displayValue={caseData.court_city}
                >
                  <Input 
                    value={editData.court_city || ''} 
                    onChange={(e) => setEditData({...editData, court_city: e.target.value})}
                  />
                </EditableField>
                <EditableField 
                  label="İlçe" 
                  isEditing={editing} 
                  displayValue={caseData.court_district}
                >
                  <Input 
                    value={editData.court_district || ''} 
                    onChange={(e) => setEditData({...editData, court_district: e.target.value})}
                  />
                </EditableField>
              </div>

              <EditableField 
                label="Mahkeme No" 
                isEditing={editing} 
                displayValue={caseData.court_no}
              >
                <Input 
                  value={editData.court_no || ''} 
                  onChange={(e) => setEditData({...editData, court_no: parseInt(e.target.value) || 0})}
                />
              </EditableField>

              <EditableField 
                label="Dosya Yılı" 
                isEditing={editing} 
                displayValue={caseData.file_year}
              >
                <Input 
                  value={editData.file_year || ''} 
                  onChange={(e) => setEditData({...editData, file_year: parseInt(e.target.value) || 0})}
                />
              </EditableField>
            </CardContent>
          </Card>
        </div>
      </div>
      <HearingFormDrawer
        open={isHearingDrawerOpen}
        onOpenChange={setIsHearingDrawerOpen}
        caseId={caseId}
        onSuccess={(newHearing) => {
          setHearings(prev => {
            const updated = [...prev, newHearing]
            return updated.sort((a, b) => new Date(a.hearing_at).getTime() - new Date(b.hearing_at).getTime())
          })
        }}
      />
    </div>
  )
}