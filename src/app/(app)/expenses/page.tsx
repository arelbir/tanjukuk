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
import { FormFieldSelect, FormFieldSelectWithId } from '@/components/form-field-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'
import { PAYMENT_METHOD_MAPPING, getFieldLabel } from '@/types/mappings'

interface Expense {
  id: string
  record_date: string
  amount: number
  currency: string
  payment_method: string | null
  category?: { label: string }
  sub_category?: { label: string }
}

interface FormData {
  category_id: string
  sub_category_id: string
  record_date: string
  amount: string
  payment_method: string
  description: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<{id: string, label: string}[]>([])
  const [subCategories, setSubCategories] = useState<{id: string, label: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const drawer = useFormDrawer<FormData>({
    category_id: '', sub_category_id: '', record_date: new Date().toISOString().split('T')[0],
    amount: '', payment_method: 'cash', description: ''
  })

  useEffect(() => {
    async function loadData() {
      let query = supabase.from('expense_records')
        .select(`*, category:lookup_values!expense_records_category_id_fkey(label), sub_category:lookup_values!expense_records_sub_category_id_fkey(label)`)
        .order('record_date', { ascending: false })
      if (search) query = query.or(`description.ilike.%${search}%,document_ref.ilike.%${search}%`)
      
      const [expensesRes, catsRes] = await Promise.all([
        query,
        supabase.from('lookup_values').select('id, label').eq('group_key', 'expense_category').eq('is_active', true).order('sort_order')
      ])
      
      setExpenses(expensesRes.data || [])
      setCategories(catsRes.data || [])
      setLoading(false)
    }
    loadData()
  }, [supabase, search])

  useEffect(() => {
    if (drawer.values.category_id) {
      const cat = categories.find(c => c.id === drawer.values.category_id)
      if (cat) {
        const key = cat.label.toLowerCase().replace(/[^a-z]/g, '')
        supabase.from('lookup_values').select('id, label').like('group_key', `expense_sub_${key}`).eq('is_active', true).order('sort_order')
          .then(res => setSubCategories(res.data || []))
      }
    }
  }, [drawer.values.category_id, supabase, categories])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('expense_records').insert({
        recorded_by: user?.id,
        category_id: drawer.values.category_id,
        sub_category_id: drawer.values.sub_category_id || null,
        record_date: drawer.values.record_date,
        amount: parseFloat(drawer.values.amount),
        payment_method: drawer.values.payment_method,
        description: drawer.values.description || null
      })
      if (error) throw error
      toast.success('Gider eklendi!')
      drawer.close()
      const { data } = await supabase.from('expense_records').select(`*, category:lookup_values!expense_records_category_id_fkey(label), sub_category:lookup_values!expense_records_sub_category_id_fkey(label)`).order('record_date', { ascending: false })
      setExpenses(data || [])
    } catch (error: unknown) {
      const err = error as { message: string }
      toast.error('Hata: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-display">Giderler</h1>
        <Button onClick={drawer.openForCreate}>
          <Plus className="h-4 w-4 mr-2" /> Yeni Gider
        </Button>
      </div>

      <FormDrawer
        open={drawer.open}
        onOpenChange={drawer.close}
        title="Yeni Gider Ekle"
        description="Yeni bir gider kaydı ekleyin"
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
            label="Kategori"
            value={drawer.values.category_id}
            onValueChange={(v) => drawer.updateValues({ category_id: v || '', sub_category_id: '' })}
            items={categories}
            placeholder="Seçin"
          />
          {subCategories.length > 0 && (
            <FormFieldSelectWithId
              label="Alt Kategori"
              value={drawer.values.sub_category_id}
              onValueChange={(v) => drawer.updateValues({ sub_category_id: v || '' })}
              items={subCategories}
              placeholder="Seçin"
            />
          )}
          <FormFieldSelect
            label="Ödeme Yöntemi"
            value={drawer.values.payment_method}
            onValueChange={(v) => drawer.updateValues({ payment_method: v || 'cash' })}
            items={PAYMENT_METHOD_MAPPING}
            getValue={(item) => (item as { value: string }).value}
            getLabel={(item) => (item as { label: string }).label}
          />
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              placeholder="Gider açıklaması..."
              value={drawer.values.description}
              onChange={(e) => drawer.updateValues({ description: e.target.value })}
            />
          </div>
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
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold text-red-600">{totalAmount.toLocaleString('tr-TR')} TRY</div>
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
              <TableHead>Kategori</TableHead>
              <TableHead>Alt Kategori</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead>Ödeme</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Yükleniyor...</TableCell></TableRow>
            ) : expenses.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Kayıt bulunamadı</TableCell></TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.record_date).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>{expense.category?.label || '-'}</TableCell>
                  <TableCell>{expense.sub_category?.label || '-'}</TableCell>
                  <TableCell className="text-right font-medium">{expense.amount.toLocaleString('tr-TR')} {expense.currency}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getFieldLabel(PAYMENT_METHOD_MAPPING, expense.payment_method || '')}
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