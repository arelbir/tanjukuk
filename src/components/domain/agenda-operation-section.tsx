'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarPlus, ClipboardPlus } from 'lucide-react'
import { toast } from 'sonner'
import { AgendaItemCard } from '@/components/domain/cards'
import { Button } from '@/components/ui/button'
import { can, type UserContext } from '@/lib/auth'
import { agenda as initialAgenda } from './demo-data'
import { AgendaDetailSheet } from './agenda-detail-sheet'
import { AgendaFormSheet, type AgendaFormMode, type AgendaFormValues } from './agenda-form-sheet'

type AgendaItem = (typeof initialAgenda)[number]

export type AgendaOperationItem = AgendaItem

interface AgendaOperationSectionProps {
  user: UserContext
  mode?: 'home' | 'calendar'
  segment?: string
  initialAction?: AgendaFormMode | null
  showCreateActions?: boolean
  initialItems?: AgendaOperationItem[]
}

function toTimeLabel(dateTime: string) {
  if (!dateTime) return '09:00'
  const date = new Date(dateTime)
  if (Number.isNaN(date.getTime())) return '09:00'
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

export function AgendaOperationSection({ user, mode = 'home', segment = 'today', initialAction = null, showCreateActions = true, initialItems = initialAgenda }: AgendaOperationSectionProps) {
  const router = useRouter()
  const [items, setItems] = useState<AgendaItem[]>(initialItems)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [formMode, setFormMode] = useState<AgendaFormMode | null>(initialAction)
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null)
  const [visiblePage, setVisiblePage] = useState(1)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const canCreateAgenda = can(user, 'calendar:create', { isResponsibleLawyer: true })
  const canCompleteAgenda = can(user, 'calendar:complete', { isResponsibleLawyer: true })

  const filteredItems = useMemo(() => {
    if (user.role === 'finance') return []

    return items.filter((item) => {
      if (segment === 'all') return true
      if (segment === 'overdue') return item.overdue
      if (segment === 'today') return mode === 'home' ? item.date === 'Bugün' || item.overdue : item.date === 'Bugün'
      return true
    })
  }, [items, mode, segment, user.role])

  const visibleLimit = visiblePage * 5

  const visibleItems = useMemo(() => {
    if (mode === 'home') return filteredItems.slice(0, visibleLimit)
    return filteredItems
  }, [filteredItems, mode, visibleLimit])

  const hasMoreHomeItems = mode === 'home' && visibleItems.length < filteredItems.length


  useEffect(() => {
    if (!hasMoreHomeItems) return
    const target = loadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting) {
        setVisiblePage((current) => current + 1)
      }
    }, { rootMargin: '160px' })

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMoreHomeItems])

  async function setItemCompletion(item: AgendaItem, isCompleted: boolean) {
    if (!canCompleteAgenda) {
      toast.error(isCompleted ? 'Bu ajanda kaydını tamamlama yetkiniz yok' : 'Bu ajanda kaydını tekrar açma yetkiniz yok')
      return
    }

    const previousItems = items
    const previousCompletedIds = completedIds

    if (isCompleted) {
      setCompletedIds((current) => (current.includes(item.id) ? current : [...current, item.id]))
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))
    } else {
      setCompletedIds((current) => current.filter((id) => id !== item.id))
    }

    const response = await fetch(`/api/calendar/events/${item.id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      setItems(previousItems)
      setCompletedIds(previousCompletedIds)
      toast.error(payload.error || 'Ajanda kaydı güncellenemedi')
      return
    }

    toast.success(isCompleted ? 'Ajanda kaydı tamamlandı' : 'Ajanda kaydı tekrar açıldı', { description: item.title })
    router.refresh()
  }

  function completeItem(item: AgendaItem) {
    void setItemCompletion(item, true)
  }

  function reopenItem(item: AgendaItem) {
    void setItemCompletion(item, false)
  }

  function addItem(values: AgendaFormValues) {
    if (!canCreateAgenda) {
      toast.error('Ajanda kaydı oluşturma yetkiniz yok')
      return
    }
    const newItem: AgendaItem = {
      id: `local-${Date.now()}`,
      date: 'Bugün',
      time: toTimeLabel(values.dateTime),
      type: values.type,
      title: values.title,
      file: values.file,
      responsible: values.responsible,
      overdue: false,
    }
    setItems((current) => [newItem, ...current])
    toast.success('Ajanda kaydı oluşturuldu', { description: values.title })
  }

  const createActions = canCreateAgenda ? (
    <>
      <Button variant="outline" onClick={() => setFormMode('task')}>
        <ClipboardPlus className="size-4" />
        Görev ekle
      </Button>
      <Button variant={mode === 'home' ? 'outline' : 'default'} onClick={() => setFormMode('hearing')}>
        <CalendarPlus className="size-4" />
        Duruşma ekle
      </Button>
    </>
  ) : null

  return (
    <section className="space-y-3">
      {mode === 'home' ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Bugünkü işler</h2>
            <p className="text-sm text-muted-foreground">Bugün planlanan ve geciken açık kayıtlar</p>
          </div>
          <Link href="/calendar" className="text-sm font-medium text-primary hover:underline">
            Tüm ajanda
          </Link>
        </div>
      ) : (
        <div className="flex justify-end gap-2">{showCreateActions ? createActions : null}</div>
      )}

      {visibleItems.length > 0 ? (
        <div className="space-y-3">
          {visibleItems.map((item) => {
            const completed = completedIds.includes(item.id)
            return (
              <AgendaItemCard
                key={item.id}
                item={item}
                completed={completed}
                onOpenDetail={() => setSelectedItem(item)}
                onComplete={canCompleteAgenda ? () => completeItem(item) : undefined}
                onReopen={canCompleteAgenda ? () => reopenItem(item) : undefined}
              />
            )
          })}
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
          Görüntüleyebileceğiniz ajanda kaydı yok.
        </div>
      )}

      {mode === 'home' && filteredItems.length > 0 ? (
        <div ref={loadMoreRef} className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
          {hasMoreHomeItems ? 'Daha fazla kayıt yükleniyor...' : 'Bugünkü tüm kayıtlar gösteriliyor.'}
        </div>
      ) : null}

      {canCreateAgenda ? <AgendaFormSheet key={formMode || 'task'} open={formMode !== null} mode={formMode || 'task'} onOpenChange={(open) => !open && setFormMode(null)} onSubmit={addItem} /> : null}
      <AgendaDetailSheet
        item={selectedItem}
        open={selectedItem !== null}
        completed={selectedItem ? completedIds.includes(selectedItem.id) : false}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        onComplete={() => selectedItem && completeItem(selectedItem)}
        onReopen={() => selectedItem && reopenItem(selectedItem)}
      />
    </section>
  )
}
