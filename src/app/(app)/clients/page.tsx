'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { FormDrawer, useFormDrawer } from '@/components/form-drawer'
import { UnifiedSelect } from '@/components/unified-select'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'
import { CLIENT_TYPE_MAPPING } from '@/types/mappings'
import { ImportExportToolbar } from '@/components/import-export-toolbar'
import {
  clientImportDefinition,
  createWorkbookFromDefinition,
  downloadExampleTemplate,
  downloadTemplate,
  downloadWorkbook,
  executeImport,
  mapClientForExport,
} from '@/lib/import-export'

interface Client {
  id: string
  name: string
  type: 'individual' | 'company'
  phone: string | null
  email: string | null
  tax_number: string | null
  address?: string | null
  created_at: string
}

interface FormData {
  name: string
  type: string
  phone: string
  email: string
  tax_number: string
  address: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const drawer = useFormDrawer<FormData>({
    name: '', type: 'individual', phone: '', email: '', tax_number: '', address: ''
  })

  useEffect(() => {
    async function loadClients() {
      let query = supabase.from('clients').select('*').order('created_at', { ascending: false })
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
      }
      
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter)
      }
      
      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }
      
      if (dateTo) {
        query = query.lte('created_at', dateTo)
      }
      
      const { data } = await query
      setClients(data || [])
      setLoading(false)
    }
    loadClients()
  }, [supabase, search, typeFilter, dateFrom, dateTo])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('clients').insert({
        name: drawer.values.name,
        type: drawer.values.type,
        phone: drawer.values.phone || null,
        email: drawer.values.email || null,
        tax_number: drawer.values.tax_number || null,
        address: drawer.values.address || null,
      })
      if (error) throw error
      toast.success('Müvekkil eklendi!')
      drawer.close()
      const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
      setClients(data || [])
    } catch (error: unknown) {
      const err = error as { message: string }
      toast.error('Hata: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadTemplate = () => {
    downloadTemplate(clientImportDefinition)
  }

  const handleDownloadExampleTemplate = () => {
    downloadExampleTemplate(clientImportDefinition, 'muvvekkil-sablon-ornek.xlsx')
  }

  const handleExport = () => {
    const workbook = createWorkbookFromDefinition(clientImportDefinition, clients.map((client) => mapClientForExport(client)))
    downloadWorkbook(workbook, `muvvekkiller-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const handleImport = async (file: File) => {
    const result = await executeImport({
      file,
      definition: clientImportDefinition,
      insertRows: (rows) => supabase.from('clients').insert(rows),
      errorFileName: 'muvvekkil-import-hatalari.xlsx',
    })

    if (result.invalidCount > 0) {
      toast.error(`${result.invalidCount} satır hatalı bulundu ve hata dosyası indirildi`)
    }

    if (result.inserted === 0) {
      return
    }

    toast.success(`${result.inserted} müvekkil içe aktarıldı`)
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients((data as Client[] | null) || [])
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Müvekkiller</h1>
        <div className="flex items-center gap-2">
          <div className="flex">
            <ImportExportToolbar
              onDownloadTemplate={handleDownloadTemplate}
              onDownloadExampleTemplate={handleDownloadExampleTemplate}
              onExport={handleExport}
              onImport={handleImport}
              importLabel="Şablon Yükle"
              templateLabel="Şablon İndir"
              exportLabel="Müvekkilleri Dışa Aktar"
              helperText="Önce örnek doldurulmuş şablonu inceleyin. Zorunlu alanlar ve format açıklamaları dosya içinde yer alır."
            />
            <Button variant="outline" onClick={() => drawer.openForCreate()} className="h-8 rounded-l-none border-l-0">
              <Plus className="h-4 w-4 mr-2" /> Yeni Müvekkil
            </Button>
          </div>
        </div>
      </div>

      <FormDrawer
        open={drawer.open}
        onOpenChange={drawer.close}
        title="Yeni Müvekkil Ekle"
        description="Yeni bir müvekkil kaydı oluşturun"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad/Unvan *</Label>
            <Input 
              id="name"
              className="bg-white border-input"
              value={drawer.values.name} 
              onChange={(e) => drawer.updateValues({ name: e.target.value })} 
            />
          </div>
          <UnifiedSelect
            label="Tip"
            value={drawer.values.type}
            onChange={(v) => drawer.updateValues({ type: (v || 'individual') as 'individual' | 'company' })}
            items={CLIENT_TYPE_MAPPING.map(m => ({ id: m.value, label: m.label }))}
            placeholder="Seçiniz"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone"
                className="bg-white border-input"
                value={drawer.values.phone} 
                onChange={(e) => drawer.updateValues({ phone: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input 
                id="email"
                type="email" 
                className="bg-white border-input"
                value={drawer.values.email} 
                onChange={(e) => drawer.updateValues({ email: e.target.value })} 
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button className="h-8 px-4" onClick={handleSubmit} disabled={saving || !drawer.values.name}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
            <div className="flex-1" />
            <Button variant="outline" className="h-8" onClick={drawer.close}>İptal</Button>
          </div>
        </div>
      </FormDrawer>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Filtreler</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Müvekkil ara..." className="pl-9 h-8" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <UnifiedSelect
              value={typeFilter}
              onChange={(v) => setTypeFilter(v || 'all')}
              items={[
                { id: 'all', label: 'Tümü' },
                { id: 'individual', label: 'Bireysel' },
                { id: 'company', label: 'Şirket' }
              ]}
              placeholder="Seçiniz"
            />
            <div className="flex gap-2 sm:col-span-2 lg:col-span-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 h-8"
                placeholder="Başlangıç"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 h-8"
                placeholder="Bitiş"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad/Unvan</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Yükleniyor...</TableCell></TableRow>
            ) : clients.length === 0 ? (
              <TableRow><TableCell colSpan={5}><EmptyState message="Müvekkil bulunamadı" /></TableCell></TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/clients/${client.id}`)}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell><Badge variant="outline">{client.type === 'individual' ? 'Bireysel' : 'Şirket'}</Badge></TableCell>
                  <TableCell>{client.phone || '-'}</TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell>{new Date(client.created_at).toLocaleDateString('tr-TR')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
