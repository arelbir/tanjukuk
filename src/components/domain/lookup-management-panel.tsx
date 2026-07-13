'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronRight, Edit2, Eye, EyeOff, Info, Plus, Search, X } from 'lucide-react'
import { LOOKUP_CONFIG, getLookupLabel } from '@/config/lookupConfig'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogCloseButton, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database.generated'

type LookupValue = Database['public']['Tables']['lookup_values']['Row']

interface LookupManagementPanelProps {
  initialLookups: LookupValue[]
}

type SettingsSectionKey = 'files' | 'courts' | 'clients' | 'finance' | 'system'

interface SettingsGroupDefinition {
  key: string
  title: string
  usedIn: string
  note: string
  important?: boolean
}

interface SettingsSectionDefinition {
  key: SettingsSectionKey
  title: string
  description: string
  groups: SettingsGroupDefinition[]
}

const settingsSections: SettingsSectionDefinition[] = [
  {
    key: 'files',
    title: 'Dosya ayarları',
    description: 'Dava ve icra dosyası açarken kullanılan seçim listeleri.',
    groups: [
      {
        key: 'case_type',
        title: 'Dava türleri',
        usedIn: 'Yeni dava dosyası oluştururken “Dava türü” alanında görünür.',
        note: 'Pasife alınan değerler yeni dosyalarda seçilemez; eski dosyalardaki kayıt korunur.',
      },
      {
        key: 'status',
        title: 'Dosya durumları',
        usedIn: 'Dava ve icra dosyalarının durum bilgisinde kullanılır.',
        note: 'Bu liste raporları ve filtreleri etkileyebilir. Değişiklik yaparken dikkatli olun.',
        important: true,
      },
      {
        key: 'client_role',
        title: 'Müvekkil sıfatları',
        usedIn: 'Dosyada müvekkilin davacı, davalı, alacaklı veya borçlu gibi sıfatını belirler.',
        note: 'Mevcut dosyalarda seçilmiş değerler korunur.',
      },
    ],
  },
  {
    key: 'courts',
    title: 'Mahkeme ve konum ayarları',
    description: 'Mahkeme türleri, şehir/ilçe listeleri ve yargı bilgileri.',
    groups: [
      {
        key: 'court_type',
        title: 'Mahkeme türleri',
        usedIn: 'Dava dosyası açarken mahkeme türü alanında görünür.',
        note: 'Örnek: Asliye Hukuk, İş Mahkemesi, Sulh Hukuk.',
      },
      {
        key: 'court_instance',
        title: 'Mahkeme dereceleri',
        usedIn: 'Mahkeme derece veya aşama bilgisinde kullanılır.',
        note: 'İlk derece, istinaf, temyiz gibi değerleri yönetebilirsiniz.',
      },
      {
        key: 'court_city',
        title: 'Mahkeme şehirleri',
        usedIn: 'Mahkeme yeri seçerken şehir listesinde görünür.',
        note: 'Sık kullanılan şehirleri aktif tutmak form kullanımını hızlandırır.',
      },
      {
        key: 'court_district',
        title: 'Mahkeme ilçeleri',
        usedIn: 'Mahkeme yeri seçerken ilçe listesinde görünür.',
        note: 'İlçe değerleri gerektiğinde şehirlerle eşleştirilebilir.',
      },
      {
        key: 'city',
        title: 'Genel şehir listesi',
        usedIn: 'Müvekkil adresleri ve genel konum alanlarında kullanılır.',
        note: 'Bu liste mahkeme şehirlerinden bağımsız genel adres alanları içindir.',
      },
    ],
  },
  {
    key: 'clients',
    title: 'Müvekkil ayarları',
    description: 'Müvekkil kartlarında ve kişi/kurum kayıtlarında kullanılan değerler.',
    groups: [
      {
        key: 'client_type',
        title: 'Müvekkil türleri',
        usedIn: 'Müvekkil oluştururken “Müvekkil türü” alanında görünür.',
        note: 'Örnek: Bireysel, şirket, kamu kurumu.',
      },
      {
        key: 'entity_type',
        title: 'Kişi türleri',
        usedIn: 'Gerçek kişi / tüzel kişi gibi sınıflandırmalarda kullanılır.',
        note: 'Bu değerler kimlik/vergi alanlarının gösterimini etkileyebilir.',
      },
    ],
  },
  {
    key: 'finance',
    title: 'Finans ayarları',
    description: 'Tahsilat, gider, ödeme yöntemi ve para birimi listeleri.',
    groups: [
      {
        key: 'income_category',
        title: 'Gelir kategorileri',
        usedIn: 'Tahsilat veya gelir kaydı girerken kategori alanında görünür.',
        note: 'Raporlarda gelirlerin hangi başlık altında toplandığını belirler.',
      },
      {
        key: 'expense_category',
        title: 'Gider kategorileri',
        usedIn: 'Gider kaydı girerken kategori alanında görünür.',
        note: 'Rapor ve gider analizlerinde kullanılır.',
      },
      {
        key: 'payment_method',
        title: 'Ödeme yöntemleri',
        usedIn: 'Tahsilat ve ödeme formlarında yöntem seçimi olarak görünür.',
        note: 'Örnek: Nakit, banka havalesi, kredi kartı.',
      },
      {
        key: 'payment_status',
        title: 'Ödeme durumları',
        usedIn: 'Ödeme/tahsilat kayıtlarının durum bilgisinde kullanılır.',
        note: 'Bekliyor, ödendi, iptal gibi değerler raporları etkileyebilir.',
        important: true,
      },
      {
        key: 'currency',
        title: 'Para birimleri',
        usedIn: 'Finans alanlarında para birimi seçimi olarak görünür.',
        note: 'Varsayılan para birimi dışındaki değerleri pasife almadan önce mevcut kayıtları kontrol edin.',
        important: true,
      },
    ],
  },
  {
    key: 'system',
    title: 'Sistem ayarları',
    description: 'Yetki ve sistem davranışını etkileyebilecek seçim listeleri.',
    groups: [
      {
        key: 'user_role',
        title: 'Kullanıcı rolleri',
        usedIn: 'Kullanıcı yönetiminde rol seçimi ve yetki kontrolünde kullanılır.',
        note: 'Bu liste sistem yetkilerini etkileyebilir. Değişiklikler dikkatli yapılmalıdır.',
        important: true,
      },
    ],
  },
]

const allDefinedGroups = settingsSections.flatMap((section) => section.groups)

function findGroupDefinition(groupKey: string) {
  return allDefinedGroups.find((group) => group.key === groupKey)
}

function findSectionForGroup(groupKey: string) {
  return settingsSections.find((section) => section.groups.some((group) => group.key === groupKey))
}

function isLikelySystemValue(item: LookupValue) {
  return item.group_key === 'user_role' || ['task', 'hearing', 'deadline', 'payment', 'expense'].includes(item.code || '')
}

export function LookupManagementPanel({ initialLookups }: LookupManagementPanelProps) {
  const firstGroup = allDefinedGroups.find((group) => initialLookups.some((lookup) => lookup.group_key === group.key))?.key || allDefinedGroups[0]?.key || ''
  const [lookups, setLookups] = useState(initialLookups)
  const [selectedSection, setSelectedSection] = useState<SettingsSectionKey>(findSectionForGroup(firstGroup)?.key || 'files')
  const [selectedGroup, setSelectedGroup] = useState(firstGroup)
  const [query, setQuery] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [expandedTechnicalId, setExpandedTechnicalId] = useState<string | null>(null)
  const [pendingVisibilityChange, setPendingVisibilityChange] = useState<LookupValue | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeSection = settingsSections.find((section) => section.key === selectedSection) || settingsSections[0]
  const selectedDefinition = findGroupDefinition(selectedGroup)

  const sectionStats = useMemo(() => {
    return settingsSections.map((section) => {
      const keys = section.groups.map((group) => group.key)
      const values = lookups.filter((lookup) => keys.includes(lookup.group_key))
      return {
        ...section,
        total: values.length,
        active: values.filter((lookup) => lookup.is_active).length,
      }
    })
  }, [lookups])

  const visibleGroups = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR')
    const groups = activeSection.groups
    if (!normalized) return groups
    return groups.filter((group) => group.title.toLocaleLowerCase('tr-TR').includes(normalized) || group.usedIn.toLocaleLowerCase('tr-TR').includes(normalized))
  }, [activeSection.groups, query])

  const selectedItems = useMemo(() => {
    return lookups
      .filter((lookup) => lookup.group_key === selectedGroup)
      .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label, 'tr'))
  }, [lookups, selectedGroup])

  const selectedActiveCount = selectedItems.filter((item) => item.is_active).length

  function chooseSection(sectionKey: SettingsSectionKey) {
    const section = settingsSections.find((item) => item.key === sectionKey)
    if (!section) return
    setSelectedSection(sectionKey)
    setSelectedGroup(section.groups[0]?.key || '')
    setQuery('')
    setError(null)
  }

  async function createLookup() {
    if (!selectedGroup || !newLabel.trim()) return
    setBusy(true)
    setError(null)

    const response = await fetch('/api/admin/lookups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_key: selectedGroup,
        label: newLabel,
        code: null,
        sort_order: selectedItems.length + 1,
        is_active: true,
      }),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(payload.error || 'Liste değeri eklenemedi')
      setBusy(false)
      return
    }

    setLookups((current) => [...current, payload.lookup])
    setNewLabel('')
    setBusy(false)
  }

  async function updateLookup(id: string, updates: Partial<Pick<LookupValue, 'label' | 'is_active' | 'sort_order'>>) {
    setBusy(true)
    setError(null)

    const response = await fetch('/api/admin/lookups', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(payload.error || 'Liste değeri güncellenemedi')
      setBusy(false)
      return
    }

    setLookups((current) => current.map((lookup) => (lookup.id === id ? payload.lookup : lookup)))
    setEditingId(null)
    setEditingLabel('')
    setPendingVisibilityChange(null)
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:pb-0">
        {sectionStats.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => chooseSection(section.key)}
            className={cn(
              'min-w-[13.5rem] rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm md:min-w-0 md:p-4',
              selectedSection === section.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted'
            )}
          >
            <span className="block text-sm font-semibold">{section.title}</span>
            <span className={cn('mt-1 line-clamp-2 block text-xs leading-5', selectedSection === section.key ? 'text-primary-foreground/75' : 'text-muted-foreground')}>{section.description}</span>
            <span className="mt-3 inline-flex rounded-full bg-background/80 px-2 py-1 text-xs font-medium text-foreground">
              {section.active}/{section.total} aktif
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <Card className="space-y-3 p-4">
            <div>
              <h2 className="font-semibold">{activeSection.title}</h2>
              <p className="text-sm text-muted-foreground">{activeSection.description}</p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ayar ara" className="pl-9" />
            </div>
          </Card>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0">
            {visibleGroups.map((group) => {
              const groupItems = lookups.filter((lookup) => lookup.group_key === group.key)
              const activeCount = groupItems.filter((lookup) => lookup.is_active).length
              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setSelectedGroup(group.key)}
                  className={cn(
                    'flex min-w-[16rem] items-start justify-between gap-3 rounded-2xl border p-3 text-left transition-colors lg:w-full lg:min-w-0 lg:p-4',
                    selectedGroup === group.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted'
                  )}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-semibold">
                      {group.title}
                      {group.important ? <Info className="size-4" /> : null}
                    </span>
                    <span className={cn('mt-1 line-clamp-2 block text-xs leading-5', selectedGroup === group.key ? 'text-primary-foreground/75' : 'text-muted-foreground')}>{group.usedIn}</span>
                  </span>
                  <span className={cn('rounded-full px-2 py-1 text-xs font-medium', selectedGroup === group.key ? 'bg-white/15 text-white' : 'bg-muted text-muted-foreground')}>
                    {activeCount}/{groupItems.length}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border bg-gradient-to-r from-primary to-indigo-600 p-5 text-primary-foreground">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-80">Seçim listesi</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight">{selectedDefinition?.title || getLookupLabel(selectedGroup)}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 opacity-85">{selectedDefinition?.usedIn || LOOKUP_CONFIG[selectedGroup]?.description || 'Bu değerler ilgili form alanlarında görünür.'}</p>
                </div>
                <Badge variant="secondary">{selectedActiveCount} aktif değer</Badge>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 text-blue-700" />
                  <p>{selectedDefinition?.note || 'Pasif değerler yeni kayıtlarda gösterilmez; mevcut kayıtlardaki eski seçimler korunur.'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
                <p className="mb-2 text-sm font-semibold sm:mb-3">Yeni liste değeri ekle</p>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} placeholder="Örn. İşe iade davası" />
                  <Button onClick={createLookup} disabled={busy || !newLabel.trim()} size="icon" aria-label="Ekle" title="Ekle" className="sm:w-auto sm:px-4">
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">Ekle</span>
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Eklediğiniz değer yeni kayıtlar için görünür.</p>
              </div>

              {error ? <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

              <div className="space-y-2">
                {selectedItems.map((item) => {
                  const editing = editingId === item.id
                  const systemValue = isLikelySystemValue(item)
                  return (
                    <div key={item.id} className={cn('rounded-2xl border border-border bg-card p-3 sm:p-4', !item.is_active && 'bg-muted/40')}>
                      {editing ? (
                        <div className="space-y-3">
                          <Input value={editingLabel} onChange={(event) => setEditingLabel(event.target.value)} autoFocus aria-label="Liste değeri adı" />
                          <div className="flex justify-end gap-2">
                            <Button size="icon-sm" aria-label="Kaydet" title="Kaydet" onClick={() => updateLookup(item.id, { label: editingLabel })} disabled={busy || !editingLabel.trim()} className="sm:w-auto sm:px-3">
                              <Check className="size-4" />
                              <span className="hidden sm:inline">Kaydet</span>
                            </Button>
                            <Button size="icon-sm" variant="outline" aria-label="Vazgeç" title="Vazgeç" onClick={() => setEditingId(null)} disabled={busy} className="sm:w-auto sm:px-3">
                              <X className="size-4" />
                              <span className="hidden sm:inline">Vazgeç</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <p className={cn('min-w-0 truncate text-base font-semibold leading-6', !item.is_active && 'text-muted-foreground')}>{item.label}</p>
                              <Badge variant={item.is_active ? 'default' : 'secondary'} className="max-w-full truncate text-[11px] sm:text-xs">
                                <span className="sm:hidden">{item.is_active ? 'Görünür' : 'Gizli'}</span>
                                <span className="hidden sm:inline">{item.is_active ? 'Yeni kayıtlarda görünür' : 'Yeni kayıtlarda gizli'}</span>
                              </Badge>
                              {systemValue ? <Badge variant="outline" className="text-[11px] sm:text-xs">Sistem</Badge> : null}
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground sm:line-clamp-none">
                              {item.is_active ? 'Kullanıcılar bu değeri yeni kayıtlarda seçebilir.' : 'Bu değer eski kayıtlarda korunur, ancak yeni kayıtlarda seçilemez.'}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <Button size="icon-sm" variant="outline" aria-label="Adını değiştir" title="Adını değiştir" onClick={() => { setEditingId(item.id); setEditingLabel(item.label) }} disabled={busy} className="sm:w-auto sm:px-3">
                              <Edit2 className="size-4" />
                              <span className="hidden sm:inline">Adını değiştir</span>
                            </Button>
                            <Button size="icon-sm" variant={item.is_active ? 'outline' : 'default'} aria-label={item.is_active ? 'Yeni kayıtlarda gizle' : 'Yeni kayıtlarda göster'} title={item.is_active ? 'Yeni kayıtlarda gizle' : 'Yeni kayıtlarda göster'} onClick={() => setPendingVisibilityChange(item)} disabled={busy} className="sm:w-auto sm:px-3">
                              {item.is_active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                              <span className="hidden sm:inline">{item.is_active ? 'Yeni kayıtlarda gizle' : 'Yeni kayıtlarda göster'}</span>
                            </Button>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedTechnicalId(expandedTechnicalId === item.id ? null : item.id)}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        <ChevronRight className={cn('size-3 transition-transform', expandedTechnicalId === item.id && 'rotate-90')} />
                        Gelişmiş ayrıntılar
                      </button>
                      {expandedTechnicalId === item.id ? (
                        <div className="mt-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                          <p>Sistem kodu: {item.code || 'Yok'}</p>
                          <p>Sıralama: {item.sort_order}</p>
                          <p>Kayıt no: {item.id}</p>
                        </div>
                      ) : null}
                    </div>
                  )
                })}

                {selectedItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                    <p className="font-medium">Bu listede henüz değer yok.</p>
                    <p className="mt-1 text-sm text-muted-foreground">İlk değeri eklediğinizde ilgili formdaki açılır menüde görünür.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        </section>
      </div>

      <Dialog open={Boolean(pendingVisibilityChange)} onOpenChange={(open) => !open && setPendingVisibilityChange(null)}>
        <DialogContent>
          <DialogCloseButton onClick={() => setPendingVisibilityChange(null)} />
          <DialogHeader>
            <DialogTitle>
              {pendingVisibilityChange?.is_active ? 'Bu değeri yeni kayıtlarda gizleyelim mi?' : 'Bu değeri tekrar kullanıma açalım mı?'}
            </DialogTitle>
            <DialogDescription>
              {pendingVisibilityChange?.is_active
                ? 'Bu işlem mevcut kayıtları silmez veya bozmaz. Sadece kullanıcılar yeni kayıt oluştururken bu değeri seçemez.'
                : 'Bu işlemden sonra kullanıcılar yeni kayıt oluştururken bu değeri tekrar seçebilir.'}
            </DialogDescription>
          </DialogHeader>
          {pendingVisibilityChange ? (
            <div className="rounded-xl border border-border bg-muted p-3 text-sm">
              <p className="font-semibold">{pendingVisibilityChange.label}</p>
              <p className="mt-1 text-muted-foreground">Liste: {selectedDefinition?.title || getLookupLabel(pendingVisibilityChange.group_key)}</p>
            </div>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPendingVisibilityChange(null)} disabled={busy}>Vazgeç</Button>
            <Button onClick={() => pendingVisibilityChange && updateLookup(pendingVisibilityChange.id, { is_active: !pendingVisibilityChange.is_active })} disabled={busy}>
              {pendingVisibilityChange?.is_active ? 'Yeni kayıtlarda gizle' : 'Yeni kayıtlarda göster'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
