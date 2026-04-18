'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FormDrawer, useFormDrawer } from '@/components/form-drawer'
import { toast } from 'sonner'
import { Plus, Trash2, ListTree } from 'lucide-react'
import { LookupValue, LOOKUP_GROUPS, getLookupLabel } from '@/types/lookup'

export default function AdminSettingsPage() {
  const [lookups, setLookups] = useState<LookupValue[]>([])
  const [loading, setLoading] = useState(true)
  
  // States for Sub-Category Manager
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>('')
  
  const supabase = createClient()

  const drawer = useFormDrawer<{ label: string; groupKey: string }>({
    label: '',
    groupKey: ''
  })

  const loadLookups = async () => {
    const { data } = await supabase
      .from('lookup_values')
      .select('*')
      .order('group_key', { ascending: true })
      .order('sort_order', { ascending: true })
    
    setLookups(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadLookups()
  }, [supabase])

  // Split lookups
  const expenseCategories = lookups.filter(l => l.group_key === 'expense_category')
  const generalGroupKeys = [...new Set(lookups.map(l => l.group_key))].filter(g => !g.startsWith('expense_sub_'))
  
  const getGroupItems = (groupKey: string) => lookups.filter(l => l.group_key === groupKey)

  const getActiveSubCategoryKey = () => {
    if (!selectedExpenseCategory) return null
    const cat = expenseCategories.find(c => c.id === selectedExpenseCategory)
    if (!cat) return null
    // Converts e.g. "Personel" to "expense_sub_personel"
    const key = cat.label.toLowerCase().replace(/[^a-z]/g, '')
    return `expense_sub_${key}`
  }

  const activeSubCategoryKey = getActiveSubCategoryKey()
  const activeSubCategoryItems = activeSubCategoryKey ? getGroupItems(activeSubCategoryKey) : []

  const handleAddValue = async () => {
    const groupKey = drawer.values.groupKey as string
    if (!drawer.values.label.trim() || !groupKey) return

    const maxOrder = Math.max(...lookups.filter(l => l.group_key === groupKey).map(l => l.sort_order), 0)

    const { error } = await supabase.from('lookup_values').insert({
      group_key: groupKey,
      label: drawer.values.label.trim(),
      sort_order: maxOrder + 1,
      is_active: true
    })

    if (error) {
      toast.error('Hata: ' + error.message)
      return
    }

    toast.success('Değer başarıyla eklendi!')
    drawer.close()
    loadLookups() // Refresh lists
  }

  const openForAdd = (groupKey: string) => {
    drawer.setValues({ label: '', groupKey })
    drawer.openForCreate()
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('lookup_values')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      toast.error('Hata: ' + error.message)
      return
    }

    setLookups(lookups.map(l => l.id === id ? { ...l, is_active: !currentStatus } : l))
  }

  const deleteValue = async (id: string) => {
    const { error } = await supabase.from('lookup_values').delete().eq('id', id)

    if (error) {
      toast.error('Hata: ' + error.message)
      return
    }

    setLookups(lookups.filter(l => l.id !== id))
    toast.success('Değer sistemden silindi')
  }

  // Helper renderer for a list of single values
  const renderListItems = (items: LookupValue[], groupKey: string) => {
    if (items.length === 0) return <div className="text-sm text-muted-foreground p-4 text-center bg-muted/20 border rounded-md">Bu grupta henüz kayıtlı değer bulunmuyor.</div>
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-3">
              <Badge variant={item.is_active ? 'default' : 'secondary'} className="w-16 justify-center">
                {item.is_active ? 'Aktif' : 'Pasif'}
              </Badge>
              <span className={`font-medium ${item.is_active ? '' : 'text-muted-foreground line-through'}`}>
                {item.label}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toggleActive(item.id, item.is_active)}>
                {item.is_active ? 'Pasife Al' : 'Aktifleştir'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => deleteValue(item.id)} className="hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full mt-4 border-dashed" onClick={() => openForAdd(groupKey)}>
          <Plus className="h-4 w-4 mr-2" />
          Yenisini Ekle
        </Button>
      </div>
    )
  }

  if (loading) return <div className="flex h-[60vh] items-center justify-center">Sistem Ayarları Yükleniyor...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 pt-4">
      <div className="flex items-center justify-between bg-primary/5 p-5 rounded-2xl border border-primary/10 shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-semibold">Sistem Genel Ayarları</h1>
          <p className="text-sm text-muted-foreground">Formların ve dropdown seçimlerin aktif listelerini buradan yönetin.</p>
        </div>
      </div>

      <FormDrawer
        open={drawer.open}
        onOpenChange={drawer.close}
        title={`Yeni ${getLookupLabel(drawer.values.groupKey) || 'Değer'} Ekle`}
        description="Sisteme kalıcı olarak eklenecek yeni öğeyi girin."
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="label">Görünen Değer Adı</Label>
            <Input 
              id="label"
              value={drawer.values.label} 
              onChange={(e) => drawer.updateValues({ label: e.target.value })} 
              placeholder="Örn: Asliye Hukuk" 
              className="h-11"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={drawer.close}>İptal</Button>
            <Button className="flex-1" onClick={handleAddValue} disabled={!drawer.values.label.trim()}>
              Ekle & Kaydet
            </Button>
          </div>
        </div>
      </FormDrawer>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 bg-muted/50 p-1 mb-6">
          <TabsTrigger value="general" className="text-sm font-medium">Genel Listeler</TabsTrigger>
          <TabsTrigger value="subcategories" className="text-sm font-medium">Gider Alt Kategorileri</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="border-0 shadow-md ring-1 ring-border/50">
            <CardHeader className="bg-muted/10 border-b pb-4">
              <CardTitle>Temel Seçim Listeleri</CardTitle>
              <CardDescription>Dava türleri, mahkemeler, müvekkil sıfatları gibi ana yapısal form öğeleri yönetimi.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {generalGroupKeys.map((groupKey) => {
                  const items = getGroupItems(groupKey)
                  const activeCount = items.filter(i => i.is_active).length
                  
                  return (
                    <AccordionItem key={groupKey} value={groupKey} className="border-b last:border-0 hover:bg-muted/10 transition-colors px-2">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-[15px]">{getLookupLabel(groupKey)}</span>
                          <Badge variant="secondary" className="text-xs font-normal bg-primary/10 text-primary">
                            {activeCount} aktif veri
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 pt-2">
                        {renderListItems(items, groupKey)}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcategories" className="space-y-6">
          <Card className="border-0 shadow-md ring-1 ring-border/50">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <ListTree className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Alt Kategori Hiyerarşisi</CardTitle>
                  <CardDescription>Mali kayıtlarınızın "Kategori &gt; Alt Kategori" bağlarını buradan oluşturabilirsiniz.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="max-w-md space-y-2">
                <Label className="text-sm font-semibold">1. Adım: Ana Gider Kategorisi Seçin</Label>
                <Select value={selectedExpenseCategory} onValueChange={setSelectedExpenseCategory}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Personel, Ofis vs." />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} disabled={!cat.is_active}>
                        {cat.label} {cat.is_active ? '' : '(Pasif)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedExpenseCategory ? (
                <div className="space-y-4 pt-6 border-t animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <Label className="text-sm font-semibold">2. Adım: Alt Kümeleri Yönetin</Label>
                    <p className="text-xs text-muted-foreground mb-4 mt-1">
                      Bu ana kategori altında görüntülenecek masraf tipleri.
                    </p>
                  </div>
                  {activeSubCategoryKey && renderListItems(activeSubCategoryItems, activeSubCategoryKey)}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/10 mt-6 flex flex-col items-center gap-2">
                  <ListTree className="w-8 h-8 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-sm font-medium">Birimleri yönetmek için önce yukarıdan bir ana kategori seçin.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}