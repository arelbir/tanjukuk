'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UnifiedSelect, SelectItem as UnifiedSelectItem } from '@/components/unified-select'
import { RadioGroup } from '@/components/radio-group'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useMultipleLookups } from '@/hooks/useLookups'
import { cn } from '@/lib/utils'
import { ImportExportToolbar } from '@/components/import-export-toolbar'
import {
  caseImportDefinition,
  createTemplateWorkbook,
  downloadWorkbook,
  parseWorkbook,
} from '@/lib/import-export'

interface FormData {
  lawyer_id: string
  client_id: string
  client_name: string
  opposing_party: string
  client_role_id: string
  entity_type: string
  court_city: string
  court_district: string
  court_type_id: string
  court_no: string
  file_year: string
  file_no: string
  file_type_id: string
  case_type_id: string
  status_id: string
  opened_at: string
  case_value: string
  currency: string
  description: string
  notes: string
}

export default function NewCasePage() {
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [lawyers, setLawyers] = useState<UnifiedSelectItem[]>([])
  const [clients, setClients] = useState<UnifiedSelectItem[]>([])

  const MAX_QUICK_STATUSES = 4

  const { lookups } = useMultipleLookups(['case_type', 'case_status', 'court_type', 'file_type', 'entity_type', 'client_role', 'currency', 'city'])
  
  const caseTypes = lookups['case_type'] || []
  const statuses = lookups['case_status'] || []
  const courtTypes = lookups['court_type'] || []
  const fileTypes = lookups['file_type'] || []
  
  // Cleanup duplicates from DB if any
  const entityTypeItems = Array.from(new Map((lookups['entity_type'] || []).map(item => [item.label, item])).values())
  const clientRoleItems = Array.from(new Map((lookups['client_role'] || []).map(item => [item.label, item])).values())
  
  const currencyItems = lookups['currency'] || []
  const cityItems = lookups['city'] || []

  // Pre-select defaults when loaded
  const defaultStatus = statuses.length > 0 ? statuses[0].id : ''

  const [formData, setFormData] = useState<FormData>({
    lawyer_id: '',
    client_id: '',
    client_name: '',
    opposing_party: '',
    client_role_id: '',
    entity_type: '',
    court_city: '',
    court_district: '',
    court_type_id: '',
    court_no: '',
    file_year: new Date().getFullYear().toString(),
    file_no: '',
    file_type_id: '',
    case_type_id: '',
    status_id: '',
    opened_at: new Date().toISOString().split('T')[0],
    case_value: '',
    currency: 'TRY',
    description: '',
    notes: ''
  })

  // Helper to ensure first load gets a default status if empty but lookups are loaded
  useEffect(() => {
    if (!formData.status_id && defaultStatus) {
      setFormData(prev => ({ ...prev, status_id: defaultStatus }))
    }
  }, [defaultStatus, formData.status_id])

  // Load lawyers
  useEffect(() => {
    async function loadLawyers() {
      const { data } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'lawyer')
        .eq('is_active', true)
        .order('full_name')
      setLawyers((data || []).map(u => ({ id: u.id, label: u.full_name })))
    }
    void loadLawyers()
  }, [supabase])

  // Load clients
  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from('clients')
        .select('id, name')
        .order('name')
      setClients((data || []).map(c => ({ id: c.id, label: c.name })))
    }
    void loadClients()
  }, [supabase])

  // Unsaved changes guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])


  const update = (field: keyof FormData, value: string | undefined | null) => {
    setFormData(prev => ({ ...prev, [field]: value || '' }))
    setIsDirty(true)
  }

  const handleSubmit = async () => {
    if (!formData.lawyer_id || !formData.client_id || !formData.case_type_id || !formData.opposing_party) {
      toast.error('Lütfen zorunlu alanları doldurun (Avukat, Müvekkil, Karşı Taraf, Dava Türü vb.)')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let mappedEntityType = 'individual'
      const foundEntity = entityTypeItems.find(i => i.id === formData.entity_type)
      if (foundEntity && (foundEntity.label === 'Tüzel Kişi' || foundEntity.label === 'company')) {
        mappedEntityType = 'company'
      }

      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert({
          lawyer_id: formData.lawyer_id,
          client_id: formData.client_id,
          opposing_party: formData.opposing_party,
          client_role_id: formData.client_role_id || null,
          entity_type: mappedEntityType,
          court_city: formData.court_city || null,
          court_district: formData.court_district || null,
          court_type_id: formData.court_type_id || null,
          court_no: formData.court_no ? parseInt(formData.court_no) : null,
          file_year: formData.file_year ? parseInt(formData.file_year) : null,
          file_no: formData.file_no || null,
          file_type_id: formData.file_type_id || null,
          case_type_id: formData.case_type_id || null,
          status_id: formData.status_id || null,
          opened_at: formData.opened_at,
          case_value: formData.case_value ? parseFloat(formData.case_value) : 0,
          currency: formData.currency,
          description: formData.description || null,
          notes: formData.notes || null,
          created_by: user?.id
        })
        .select()
        .single()

      if (caseError) throw caseError

      setIsDirty(false)
      toast.success('Dosya başarıyla kaydedildi.')
      router.push(`/cases/${newCase.id}`)
    } catch (error) {
      toast.error('Kayıt Hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (isDirty && !confirm('Kaydedilmemiş değişiklikler var. Sayfadan ayrılmak istediğinize emin misiniz?')) {
      return
    }
    router.push('/cases')
  }

  const handleDownloadTemplate = () => {
    const workbook = createTemplateWorkbook(caseImportDefinition)
    downloadWorkbook(workbook, caseImportDefinition.fileName)
  }

  const handleImport = async (file: File) => {
    const parsed = await parseWorkbook(file, caseImportDefinition)

    if (parsed.invalid.length > 0) {
      toast.error(`${parsed.invalid.length} satır doğrulamadan geçemedi`)
    }

    if (parsed.valid.length === 0) {
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const payload = parsed.valid.map((item) => ({
      ...item,
      created_by: user?.id,
    }))

    const { error } = await supabase.from('cases').insert(payload)

    if (error) {
      toast.error('Toplu import hatası: ' + error.message)
      return
    }

    toast.success(`${parsed.valid.length} dosya içe aktarıldı`)
    router.push('/cases')
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      
      {/* Ciddi / Basit Üst Bar */}
      <div className="flex-none flex items-center justify-between border-b px-6 py-4 bg-card">
        <div className="flex items-center gap-4">
          <Link href="/cases">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold tracking-tight">Yeni Dosya Kaydı</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ImportExportToolbar
            onDownloadTemplate={handleDownloadTemplate}
            onImport={handleImport}
            importLabel="Şablon Yükle"
            templateLabel="Şablon İndir"
          />
          <div className="w-px h-6 bg-border mx-2" />
          <Button variant="outline" onClick={handleCancel} className="h-8">İptal</Button>
          <Button onClick={handleSubmit} disabled={loading} className="h-8 px-4">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {/* 3 Kolonlu Ekranı Kaplayan Grid (Scroll yok) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 divide-y md:divide-y-0 md:divide-x overflow-y-auto">
        
        {/* KOLON 1: TARAFLAR */}
        <div className="lg:col-span-3 flex flex-col p-6 space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Taraflar</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sorumlu Avukat <span className="text-destructive">*</span></Label>
              <UnifiedSelect
                value={formData.lawyer_id}
                onChange={(v) => update('lawyer_id', v)}
                items={lawyers}
                searchable
                placeholder="Seçiniz"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Müvekkil <span className="text-destructive">*</span></Label>
              <UnifiedSelect
                value={formData.client_id}
                onChange={(v) => setFormData(prev => ({ ...prev, client_id: v || '' }))}
                items={clients}
                searchable
                placeholder="Seçiniz"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Müvekkil Cinsi</Label>
              <RadioGroup 
                items={entityTypeItems} 
                value={formData.entity_type} 
                onChange={(v: string) => update('entity_type', v)}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Karşı Taraf <span className="text-destructive">*</span></Label>
              <Input 
                className="w-full bg-white border-input"
                value={formData.opposing_party}
                onChange={(e) => update('opposing_party', e.target.value)}
                placeholder="Örn: X Sigorta A.Ş."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Müvekkilin Sıfatı</Label>
              <RadioGroup
                items={clientRoleItems}
                value={formData.client_role_id}
                onChange={(v: string) => update('client_role_id', v)}
              />
            </div>
          </div>
        </div>

        {/* KOLON 2: DAVA BİLGİLERİ */}
        <div className="lg:col-span-6 flex flex-col p-6 space-y-4 bg-card/50 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Dava Bilgileri</h2>
            
            {/* Quick Status Bar */}
            {statuses.length > 0 && (
               <div className="flex bg-background border rounded-lg p-1 shadow-sm">
                 {statuses.slice(0, MAX_QUICK_STATUSES).map((st) => (
                   <button 
                     key={st.id} 
                     onClick={() => update('status_id', st.id)}
                     className={cn("text-xs px-3 py-2 h-8 rounded transition-colors", formData.status_id === st.id ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted font-medium")}
                   >
                     {st.label}
                   </button>
                 ))}
               </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Açılma Tarihi <span className="text-destructive">*</span></Label>
              <Input 
                type="date" 
                className="w-full bg-white border-input"
                value={formData.opened_at} 
                onChange={(e) => update('opened_at', e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Dava Değeri</Label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  className="flex-1 bg-white border-input"
                  value={formData.case_value} 
                  onChange={(e) => update('case_value', e.target.value)} 
                />
                <UnifiedSelect
                  value={formData.currency}
                  onChange={(v) => update('currency', v || '')}
                  items={currencyItems.length > 0 ? currencyItems.map(c => ({ id: c.label, label: c.label })) : [
                    { id: 'TRY', label: 'TRY' },
                    { id: 'USD', label: 'USD' },
                    { id: 'EUR', label: 'EUR' }
                  ]}
                  searchable
                  className="w-24"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
             <Label className="text-sm font-medium">Dava Türü <span className="text-destructive">*</span></Label>
             <UnifiedSelect
                value={formData.case_type_id}
                onChange={(v) => update('case_type_id', v || '')}
                items={caseTypes.map(c => ({ id: c.id, label: c.label || c.id }))}
                placeholder="Dava türü seçiniz"
                searchable
              />
          </div>

          <div className="grid grid-cols-1 gap-6 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Açıklama / Konu Özeti</Label>
              <Textarea 
                className="h-28 resize-none bg-white w-full px-3 py-2 border-input" 
                placeholder="Dava detayları..." 
                value={formData.description} 
                onChange={(e) => update('description', e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Dahili Notlar</Label>
              <Textarea 
                className="h-28 resize-none bg-white w-full px-3 py-2 border-input" 
                placeholder="Ofis içi özel notlarınız..." 
                value={formData.notes} 
                onChange={(e) => update('notes', e.target.value)} 
              />
            </div>
          </div>

        </div>

        {/* KOLON 3: MAHKEME BİLGİLERİ */}
        <div className="lg:col-span-3 flex flex-col p-6 space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Mahkeme Bilgileri</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">İl</Label>
                <UnifiedSelect
                  value={formData.court_city}
                  onChange={(v) => update('court_city', v || '')}
                  items={cityItems.map(c => ({ id: c.label, label: c.label }))}
                  placeholder="Seçiniz"
                  searchable
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">İlçe</Label>
                <Input
                  className="w-full bg-white border-input"
                  placeholder="İlçe adı"
                  value={formData.court_district}
                  onChange={(e) => update('court_district', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
               <Label className="text-sm font-medium">Mahkeme Türü</Label>
               <UnifiedSelect
                  value={formData.court_type_id}
                  onChange={(v) => update('court_type_id', v || '')}
                  items={courtTypes.map(c => ({ id: c.id, label: c.label || c.id }))}
                  placeholder="Mahkeme türü seçiniz"
                  searchable
                />
            </div>

            <div className="space-y-2">
               <Label className="text-sm font-medium">Dosya Konumu / Yeri</Label>
               <UnifiedSelect
                  value={formData.file_type_id}
                  onChange={(v) => update('file_type_id', v || '')}
                  items={fileTypes.map(f => ({ id: f.id, label: f.label || f.id }))}
                  placeholder="Dosya konumu seçiniz"
                  searchable
                />
            </div>

            <div className="p-4 border rounded-lg bg-muted/10 space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Yıl</Label>
                  <Input type="number" className="w-full bg-white border-input" placeholder="202X" value={formData.file_year} onChange={(e) => update('file_year', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Esas Numarası</Label>
                  <Input className="w-full bg-white border-input" placeholder="Esas / Dosya No" value={formData.file_no} onChange={(e) => update('file_no', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Karar / Sıra Numarası</Label>
                <Input 
                  className="w-full bg-white border-input"
                  placeholder="Mahkeme karar numarası" 
                  value={formData.court_no} 
                  onChange={(e) => update('court_no', e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}