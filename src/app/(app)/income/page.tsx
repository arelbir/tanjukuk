'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { FormDrawer, useFormDrawer } from '@/components/form-drawer'
import { FormFieldSelectWithId } from '@/components/form-field-select'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'
import { PAYMENT_STATUS_MAPPING, getFieldLabel } from '@/types/mappings'
import { ImportExportToolbar } from '@/components/import-export-toolbar'
import { executeResolvedImport, exportRows, downloadTemplate, incomeImportDefinition, buildClientNameResolverMap, buildLookupResolverMap } from '@/lib/import-export'

interface IncomeRelation {
  label?: string
  name?: string
}

interface IncomeRecordRow {
  id: string
  client_id: string | null
  category_id: string
  record_date: string
  amount: number
  currency: string
  payment_status: string
  client?: IncomeRelation | IncomeRelation[] | null
  category?: IncomeRelation | IncomeRelation[] | null
}

interface Income {
  id: string
  client_id: string | null
  category_id: string
  record_date: string
  amount: number
  currency: string
  payment_status: string
  client?: { name: string }
  category?: { label: string }
}

interface FormData {
  client_id: string
  category_id: string
  record_date: string
  amount: string
  payment_status: string
  description: string
}

function normalizeIncomeClient(relation?: IncomeRelation | IncomeRelation[] | null) {
  if (!relation) return undefined
  const value = Array.isArray(relation) ? relation[0] : relation
  return value?.name ? { name: value.name } : undefined
}

function normalizeIncomeCategory(relation?: IncomeRelation | IncomeRelation[] | null) {
  if (!relation) return undefined
  const value = Array.isArray(relation) ? relation[0] : relation
  return value?.label ? { label: value.label } : undefined
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [clients, setClients] = useState<{id: string, name: string}[]>([])
  const [categories, setCategories] = useState<{id: string, label: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const drawer = useFormDrawer<FormData>({
    client_id: '', category_id: '', record_date: new Date().toISOString().split('T')[0],
    amount: '', payment_status: 'paid', description: ''
  })

  useEffect(() => {
    async function loadData() {
      let query = supabase.from('income_records')
        .select(`id, client_id, category_id, record_date, amount, currency, payment_status, client:clients(name), category:lookup_values!income_records_category_id_fkey(label)`)
        .order('record_date', { ascending: false })
      if (search) query = query.or(`description.ilike.%${search}%,client.name.ilike.%${search}%`)
      
      const [incomesRes, clientsRes, catsRes] = await Promise.all([
        query,
        supabase.from('clients').select('id, name'),
        supabase.from('lookup_values').select('id, label').eq('group_key', 'income_category').eq('is_active', true).order('sort_order')
      ])
      
      const mappedIncomes: Income[] = ((incomesRes.data as IncomeRecordRow[] | null) || []).map((income) => ({
        id: income.id,
        client_id: income.client_id,
        category_id: income.category_id,
        record_date: income.record_date,
        amount: income.amount,
        currency: income.currency,
        payment_status: income.payment_status,
        client: normalizeIncomeClient(income.client),
        category: normalizeIncomeCategory(income.category),
      }))

      setIncomes(mappedIncomes)
      setClients(clientsRes.data || [])
      setCategories(catsRes.data || [])
      setLoading(false)
    }
    loadData()
  }, [supabase, search])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('income_records').insert({
        client_id: drawer.values.client_id || null,
        recorded_by: user?.id,
        category_id: drawer.values.category_id,
        record_date: drawer.values.record_date,
        amount: parseFloat(drawer.values.amount),
        payment_status: drawer.values.payment_status,
        description: drawer.values.description || null
      })
      if (error) throw error
      toast.success('Gelir eklendi!')
      drawer.close()
      const { data } = await supabase.from('income_records').select(`*, client:clients(name), category:lookup_values!income_records_category_id_fkey(label)`).order('record_date', { ascending: false })
      setIncomes(data || [])
    } catch (error: unknown) {
      const err = error as { message: string }
      toast.error('Hata: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadTemplate = () => {
    downloadTemplate(incomeImportDefinition)
  }

  const handleExport = () => {
    exportRows(
      incomeImportDefinition,
      incomes.map((income) => ({
        client_name: income.client?.name || null,
        category_label: income.category?.label || '',
        record_date: income.record_date,
        amount: income.amount,
        payment_status: income.payment_status,
        description: null,
      })),
      `gelirler-${new Date().toISOString().slice(0, 10)}.xlsx`
    )
  }

  const handleImport = async (file: File) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const [clientMap, categoryMap] = await Promise.all([
      buildClientNameResolverMap(supabase),
      buildLookupResolverMap(supabase, 'income_category'),
    ])

    const result = await executeResolvedImport({
      file,
      definition: incomeImportDefinition,
      resolveRow: async (row) => {
        const errors: string[] = []
        const clientId = row.client_name ? clientMap.get(row.client_name.trim().toLocaleLowerCase('tr-TR')) || null : null
        const categoryId = categoryMap.get(row.category_label.trim().toLocaleLowerCase('tr-TR')) || null

        if (row.client_name && !clientId) errors.push('client_name eşleşmedi')
        if (!categoryId) errors.push('category_label eşleşmedi')
        if (errors.length > 0) return { errors }

        return {
          value: {
            client_id: clientId,
            category_id: categoryId,
            record_date: row.record_date,
            amount: row.amount,
            payment_status: row.payment_status,
            description: row.description,
          },
        }
      },
      insertRows: (rows) =>
        supabase.from('income_records').insert(
          rows.map((item) => ({
            ...item,
            recorded_by: user?.id,
          }))
        ),
      errorFileName: 'gelir-import-hatalari.xlsx',
    })

    if (result.invalidCount > 0) {
      toast.error(`${result.invalidCount} satır hatalı bulundu ve hata dosyası indirildi`)
    }

  if (result.inserted > 0) {
      toast.success(`${result.inserted} gelir kaydı içe aktarıldı`)
      const { data } = await supabase.from('income_records').select(`*, client:clients(name), category:lookup_values!income_records_category_id_fkey(label)`).order('record_date', { ascending: false })
      setIncomes(data || [])
    }
  }

  const totalAmount = incomes.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-display">Gelirler</h1>
        <div className="flex flex-wrap gap-2">
          <ImportExportToolbar
            onDownloadTemplate={handleDownloadTemplate}
            onExport={handleExport}
            onImport={handleImport}
            templateLabel="Şablon İndir"
            importLabel="Şablon Yükle"
            exportLabel="Gelirleri Dışa Aktar"
          />
          <Button onClick={() => drawer.openForCreate()}>
            <Plus className="h-4 w-4 mr-2" /> Yeni Gelir
          </Button>
        </div>
      </div>

      <FormDrawer
        open={drawer.open}
        onOpenChange={drawer.close}
        title="Yeni Gelir Ekle"
        description="Yeni bir gelir kaydı ekleyin"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="record_date">Tarih</Label>
              <Input 
                id="record_date"
                type="date" 
                value={drawer.values.record_date} 
                onChange={(e) => drawer.updateValues({ record_date: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Tutar</Label>
              <Input 
                id="amount"
                type="number" 
                value={drawer.values.amount} 
                onChange={(e) => drawer.updateValues({ amount: e.target.value })} 
              />
            </div>
          </div>
          <FormFieldSelectWithId
            label="Müvekkil"
            value={drawer.values.client_id}
            onValueChange={(v) => drawer.updateValues({ client_id: v || '' })}
            items={clients}
            placeholder="Seçin"
          />
          <FormFieldSelectWithId
            label="Kategori"
            value={drawer.values.category_id}
            onValueChange={(v) => drawer.updateValues({ category_id: v || '' })}
            items={categories}
            placeholder="Seçin"
          />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSubmit} disabled={saving || !drawer.values.amount}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
            <Button variant="outline" onClick={drawer.close}>İptal</Button>
          </div>
        </div>
      </FormDrawer>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold text-green-600">{totalAmount.toLocaleString('tr-TR')} TRY</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Ara..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Müvekkil</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead>Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Yükleniyor...</TableCell></TableRow>
            ) : incomes.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Kayıt bulunamadı</TableCell></TableRow>
            ) : (
              incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>{new Date(income.record_date).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>{income.client?.name || '-'}</TableCell>
                  <TableCell>{income.category?.label || '-'}</TableCell>
                  <TableCell className="text-right font-medium">{income.amount.toLocaleString('tr-TR')} {income.currency}</TableCell>
                  <TableCell>
                    <Badge variant={income.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {getFieldLabel(PAYMENT_STATUS_MAPPING, income.payment_status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}