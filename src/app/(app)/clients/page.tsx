'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { FormDrawer, useFormDrawer } from '@/components/form-drawer'
import { FormFieldSelect } from '@/components/form-field-select'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'
import { CLIENT_TYPE_MAPPING } from '@/types/mappings'
import { ImportExportToolbar } from '@/components/import-export-toolbar'
import {
  clientImportDefinition,
  createTemplateWorkbook,
  createWorkbookFromDefinition,
  downloadWorkbook,
  mapClientForExport,
  parseWorkbook,
} from '@/lib/import-export'

interface Client {
  id: string
  name: string
  type: 'individual' | 'company'
  phone: string | null
  email: string | null
  tax_no: string | null
  address?: string | null
  created_at: string
}

interface FormData {
  name: string
  type: string
  phone: string
  email: string
  tax_no: string
  address: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const drawer = useFormDrawer<FormData>({
    name: '', type: 'individual', phone: '', email: '', tax_no: '', address: ''
  })

  useEffect(() => {
    async function loadClients() {
      let query = supabase.from('clients').select('*').order('created_at', { ascending: false })
      if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      const { data } = await query
      setClients(data || [])
      setLoading(false)
    }
    loadClients()
  }, [supabase, search])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('clients').insert({
        name: drawer.values.name,
        type: drawer.values.type,
        phone: drawer.values.phone || null,
        email: drawer.values.email || null,
        tax_no: drawer.values.tax_no || null,
        address: drawer.values.address || null,
        created_by: user?.id
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
    const workbook = createTemplateWorkbook(clientImportDefinition)
    downloadWorkbook(workbook, clientImportDefinition.fileName)
  }

  const handleExport = () => {
    const workbook = createWorkbookFromDefinition(clientImportDefinition, clients.map((client) => mapClientForExport(client)))
    downloadWorkbook(workbook, `muvvekkiller-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const handleImport = async (file: File) => {
    const parsed = await parseWorkbook(file, clientImportDefinition)

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

    const { error } = await supabase.from('clients').insert(payload)

    if (error) {
      toast.error('Import hatası: ' + error.message)
      return
    }

    toast.success(`${parsed.valid.length} müvekkil içe aktarıldı`)
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients((data as Client[] | null) || [])
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-display">Müvekkiller</h1>
        <div className="flex flex-wrap gap-2">
          <ImportExportToolbar
            onDownloadTemplate={handleDownloadTemplate}
            onExport={handleExport}
            onImport={handleImport}
            importLabel="Şablon Yükle"
            templateLabel="Şablon İndir"
            exportLabel="Müvekkilleri Dışa Aktar"
          />
          <Button onClick={() => drawer.openForCreate()}>
            <Plus className="h-4 w-4 mr-2" /> Yeni Müvekkil
          </Button>
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
              value={drawer.values.name} 
              onChange={(e) => drawer.updateValues({ name: e.target.value })} 
            />
          </div>
          <FormFieldSelect
            label="Tip"
            value={drawer.values.type}
            onValueChange={(v) => drawer.updateValues({ type: (v || 'individual') as 'individual' | 'company' })}
            items={CLIENT_TYPE_MAPPING}
            getValue={(item) => (item as { value: string }).value}
            getLabel={(item) => (item as { label: string }).label}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone"
                value={drawer.values.phone} 
                onChange={(e) => drawer.updateValues({ phone: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input 
                id="email"
                type="email" 
                value={drawer.values.email} 
                onChange={(e) => drawer.updateValues({ email: e.target.value })} 
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSubmit} disabled={saving || !drawer.values.name}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
            <Button variant="outline" onClick={drawer.close}>İptal</Button>
          </div>
        </div>
      </FormDrawer>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Müvekkil ara..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
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
              <TableRow><TableCell colSpan={5} className="text-center py-8">Müvekkil bulunamadı</TableCell></TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50" onClick={() => window.location.href = `/clients/${client.id}`}>
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