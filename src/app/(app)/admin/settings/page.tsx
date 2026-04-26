'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FormDrawer, useFormDrawer } from '@/components/form-drawer'
import { toast } from 'sonner'
import { Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { useLookupsAdmin } from '@/hooks/useLookups'
import { getLookupLabel, LOOKUP_CONFIG } from '@/config/lookupConfig'
import { Tree } from '@/components/ui/tree'

export default function AdminSettingsPage() {
  const { lookups, loading, loadLookups, addLookup, toggleLookup, deleteLookup, updateLookup, buildTree } = useLookupsAdmin()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Dava']))
  const [editingId, setEditingId] = useState<string | null>(null)

  const drawer = useFormDrawer<{ label: string; groupKey: string; parentId?: string }>({
    label: '',
    groupKey: '',
    parentId: undefined,
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadLookups()
    }, 0)

    return () => clearTimeout(timeout)
  }, [loadLookups])

  const getGroupItems = (groupKey: string) => lookups.filter((l) => l.group_key === groupKey)

  const categories = [...new Set(Object.values(LOOKUP_CONFIG).map(c => c.category).filter((c): c is string => Boolean(c)))]
  const getCategoryGroups = (category: string) => {
    return Object.entries(LOOKUP_CONFIG)
      .filter(([, config]) => config.category === category)
      .map(([key, config]) => ({ key, ...config }))
  }

  const handleAddValue = async () => {
    const groupKey = drawer.values.groupKey
    if (!drawer.values.label.trim() || !groupKey) {
      return
    }

    const maxOrder = Math.max(...lookups.filter((l) => l.group_key === groupKey).map((l) => l.sort_order), 0)

    const { error } = await addLookup({
      group_key: groupKey,
      label: drawer.values.label.trim(),
      sort_order: maxOrder + 1,
      is_active: true,
    })

    if (error) {
      toast.error('Hata: ' + error.message)
      return
    }

    toast.success('Değer başarıyla eklendi!')
    drawer.close()
    setEditingId(null)
  }

  const handleEditValue = async () => {
    if (!editingId || !drawer.values.label.trim()) {
      return
    }

    const { error } = await updateLookup(editingId, {
      label: drawer.values.label.trim(),
    })

    if (error) {
      toast.error('Hata: ' + error.message)
      return
    }

    toast.success('Değer başarıyla güncellendi!')
    drawer.close()
    setEditingId(null)
  }

  const openForAdd = (groupKey: string) => {
    setEditingId(null)
    drawer.openForCreate({ label: '', groupKey })
  }

  const openForEdit = (id: string) => {
    const item = lookups.find(l => l.id === id)
    if (item) {
      setEditingId(id)
      drawer.openForCreate({ label: item.label, groupKey: item.group_key })
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await toggleLookup(id, currentStatus)
    if (error) {
      toast.error('Hata: ' + error.message)
    }
  }

  const deleteValue = async (id: string) => {
    const { error } = await deleteLookup(id)
    if (error) {
      toast.error('Hata: ' + error.message)
    } else {
      toast.success('Değer sistemden silindi')
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center">Sistem Ayarları Yükleniyor...</div>
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-2 p-2 overflow-hidden">
      {/* Sidebar - Tree Navigation */}
      <div className="w-44 flex-shrink-0 flex flex-col">
        <div className="bg-card border rounded flex flex-col h-full overflow-hidden">
          <div className="bg-muted/10 border-b p-1 flex-shrink-0">
            <h2 className="text-xs font-semibold">Ayarlar</h2>
          </div>
          <div className="p-1 overflow-y-auto flex-1">
            <div className="space-y-0.5">
              {categories.map((category) => {
                const groups = getCategoryGroups(category)
                const isExpanded = expandedCategories.has(category)
                
                return (
                  <div key={category}>
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full text-left px-1.5 py-0.5 rounded hover:bg-muted transition-colors flex items-center gap-1 text-xs"
                    >
                      {isExpanded ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                      <span className="font-medium">{category}</span>
                      <Badge variant="outline" className="text-xs ml-auto h-4 px-1">
                        {groups.length}
                      </Badge>
                    </button>
                    
                    {isExpanded && (
                      <div className="ml-2 mt-0.5 space-y-0.5">
                        {groups.map((group) => {
                          const items = getGroupItems(group.key)
                          
                          return (
                            <div key={group.key}>
                              <button
                                onClick={() => {
                                  setSelectedGroup(group.key)
                                }}
                                className={`w-full text-left px-1.5 py-0.5 rounded hover:bg-muted transition-colors flex items-center gap-1 text-xs ${
                                  selectedGroup === group.key ? 'bg-primary/10 text-primary' : ''
                                }`}
                              >
                                <span>{group.label}</span>
                                <Badge variant="outline" className="text-xs ml-auto h-4 px-1">
                                  {items.length}
                                </Badge>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content - Seçili Grup Detayları */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedGroup ? (
          <div className="bg-card border rounded flex flex-col h-full overflow-hidden">
            <div className="bg-muted/10 border-b p-1 flex-shrink-0">
              <h2 className="text-xs font-semibold">{getLookupLabel(selectedGroup)}</h2>
              <p className="text-xs text-muted-foreground">Bu gruba ait lookup değerlerini yönetin.</p>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              <div className="mb-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openForAdd(selectedGroup)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Yeni Değer Ekle
                </Button>
              </div>
              {(() => {
                const treeData = buildTree(selectedGroup)
                return treeData.length > 0 ? (
                  <Tree 
                    data={treeData}
                    renderNode={(node) => (
                      <div className="flex items-center gap-2 flex-1 cursor-pointer hover:bg-muted/50 p-0.5 rounded text-xs" onClick={() => openForEdit(node.id)}>
                        <span className={`${!node.is_active ? 'text-muted-foreground line-through' : ''}`}>
                          {node.label}
                        </span>
                        <div className="ml-auto flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={node.is_active}
                            onCheckedChange={(checked) => toggleActive(node.id, checked)}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteValue(node.id)
                            }}
                            className="h-5 px-1 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-2.5 w-2.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground p-3 text-center bg-muted/20 border rounded">
                    Bu grupta henüz kayıtlı değer bulunmuyor.
                  </div>
                )
              })()}
            </div>
          </div>
        ) : (
          <div className="bg-card border rounded flex flex-col h-full overflow-hidden">
            <div className="p-6 text-center flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Sol menüden bir grup seçin.</p>
            </div>
          </div>
        )}
      </div>

      <FormDrawer
        open={drawer.open}
        onOpenChange={drawer.close}
        title={editingId ? 'Değer Düzenle' : `Yeni ${getLookupLabel(drawer.values.groupKey) || 'Değer'} Ekle`}
        description={editingId ? 'Mevcut değeri güncelleyin.' : 'Sisteme kalıcı olarak eklenecek yeni öğeyi girin.'}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="label">Görünen Değer Adı</Label>
            <Input
              id="label"
              value={drawer.values.label}
              onChange={(e) => drawer.updateValues({ label: e.target.value })}
              placeholder="Örn: Asliye Hukuk"
              className="h-8"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={drawer.close}>
              İptal
            </Button>
            <Button 
              type="button" 
              className="flex-1" 
              onClick={editingId ? handleEditValue : handleAddValue} 
              disabled={!drawer.values.label.trim()}
            >
              {editingId ? 'Güncelle' : 'Ekle & Kaydet'}
            </Button>
          </div>
        </div>
      </FormDrawer>
    </div>
  )
}
